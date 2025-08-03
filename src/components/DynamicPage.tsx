import React, { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import DOMPurify from "dompurify";
import { fetchPageBySlug, patchBlock } from "@/lib/pb";
import { debounce } from "@/lib/debounce";
import pb from "@/lib/pb";
import {
  ArrowLeft,
  Plus,
  Type,
  ImageIcon,
  Square,
  MousePointer,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Save,
  Undo,
  Redo,
  Grid,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InlineEditor = React.lazy(() => import("@/components/Editor"));

interface Block {
  id: string;
  type: string;
  level?: number;
  content?: string;
  src?: string;
  alt?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  [key: string]: any;
}

export default function DynamicPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tool, setTool] = useState<"select" | "text" | "image" | "shape">("select");
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  async function fetchPageBySlug(slug: string) {
    const list = await pb.collection('pages').getFullList(1, { filter: `slug="${slug}"` });
    return list[0];
  }

  const editMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("edit");

  // useEffect közvetlenül a slug változásra
  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError(null);
      
      try {
        const p = await fetchPageBySlug(slug);
        if (cancelled) return;
        setPage(p);
        const blocksWithPosition = (p.structure || []).map((block: Block, index: number) => ({
          ...block,
          x: block.x || 50,
          y: block.y || 50 + (index * 120),
          width: block.width || (block.type === "heading" ? 600 : block.type === "paragraph" ? 500 : 300),
          height: block.height || (block.type === "heading" ? 60 : block.type === "paragraph" ? 100 : 200),
          backgroundColor: block.backgroundColor || "transparent",
          textColor: block.textColor || "#000000",
          fontSize: block.fontSize || (block.type === "heading" ? 32 : 16),
          fontWeight: block.fontWeight || (block.type === "heading" ? "bold" : "normal"),
          textAlign: block.textAlign || "left",
          borderRadius: block.borderRadius || 0,
          rotation: block.rotation || 0,
          opacity: block.opacity || 100,
          zIndex: block.zIndex || index,
        }));
        setBlocks(blocksWithPosition);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPage();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const debouncedPatch = useMemo(
    () =>
      debounce(async (blockId: string, updated: Partial<Block>) => {
        if (!page?.id) return;
        try {
          await patchBlock(page.id, blockId, updated);
        } catch (e) {
          console.warn("Patch failed", e);
        }
      }, 800),
    [page]
  );

  const handleBlockChange = (blockId: string, updated: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updated } : b))
    );
    debouncedPatch(blockId, updated);
  };

  const addBlock = useCallback(
    (type: Block["type"]) => {
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        width: type === "heading" ? 600 : type === "paragraph" ? 500 : 300,
        height: type === "heading" ? 60 : type === "paragraph" ? 100 : 200,
        content: type === "heading" ? "New Heading" : type === "paragraph" ? "New paragraph text" : undefined,
        src: type === "image" ? "/placeholder.svg?height=200&width=300" : undefined,
        level: type === "heading" ? 1 : undefined,
        backgroundColor: "transparent",
        textColor: "#000000",
        fontSize: type === "heading" ? 32 : 16,
        fontWeight: type === "heading" ? "bold" : "normal",
        textAlign: "left",
        borderRadius: 0,
        rotation: 0,
        opacity: 100,
        zIndex: blocks.length,
      };
      setBlocks([...blocks, newBlock]);
      setSelectedBlock(newBlock.id);
    },
    [blocks],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks(blocks.filter((block) => block.id !== id));
      setSelectedBlock(null);
    },
    [blocks],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.id === id);
      if (block) {
        const newBlock = {
          ...block,
          id: `block-${Date.now()}`,
          x: (block.x || 0) + 20,
          y: (block.y || 0) + 20,
          zIndex: blocks.length,
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlock(newBlock.id);
      }
    },
    [blocks],
  );

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setSelectedBlock(blockId);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBlock(null);
    }
  };

  const exitEditMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url.toString());
    window.location.reload();
  };

  const renderBlock = (block: Block) => {
    if (editMode) {
      // Editor mode - render blocks as draggable elements on canvas
      return (
        <div
          key={block.id}
          className={`absolute cursor-pointer ${selectedBlock === block.id ? "ring-2 ring-primary" : ""}`}
          style={{
            left: block.x,
            top: block.y,
            width: block.width,
            height: block.height,
            transform: `rotate(${block.rotation || 0}deg)`,
            opacity: (block.opacity || 100) / 100,
            zIndex: block.zIndex,
          }}
          onMouseDown={(e) => handleMouseDown(e, block.id)}
        >
          {block.type === "heading" && (
            <div
              className="w-full h-full flex items-center p-2 border border-gray-200 rounded"
              style={{
                color: block.textColor,
                fontSize: block.fontSize,
                fontWeight: block.fontWeight,
                textAlign: block.textAlign as any,
                backgroundColor: block.backgroundColor,
                borderRadius: block.borderRadius,
              }}
            >
              {block.content}
            </div>
          )}
          {block.type === "paragraph" && (
            <div
              className="w-full h-full flex items-start p-2 border border-gray-200 rounded"
              style={{
                color: block.textColor,
                fontSize: block.fontSize,
                fontWeight: block.fontWeight,
                textAlign: block.textAlign as any,
                backgroundColor: block.backgroundColor,
                borderRadius: block.borderRadius,
              }}
            >
              {block.content}
            </div>
          )}
          {block.type === "image" && (
            <img
              src={block.src || "/placeholder.svg"}
              alt={block.alt || ""}
              className="w-full h-full object-cover"
              style={{
                borderRadius: block.borderRadius,
              }}
            />
          )}
        </div>
      );
    } else {
      // Normal viewing mode
      switch (block.type) {
        case "heading": {
          const Tag = `h${block.level || 1}` as keyof JSX.IntrinsicElements;
          const sanitized = DOMPurify.sanitize(block.content || "");
          return (
            <Suspense fallback={<div>Editor...</div>}>
                {(value) => (
                  <Tag
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(value),
                    }}
                    className="text-3xl font-bold mb-4"
                  />
                )}
            </Suspense>
          );
        }
        case "paragraph": {
          const sanitized = DOMPurify.sanitize(block.content || "");
          return (
            <Suspense fallback={<div>Editor...</div>}>
              <InlineEditor
                recordKey={`block_${block.id}`}
                type="string"
                initialValue={block.content || ""}
                onChange={(val) => handleBlockChange(block.id, { content: val })}
              >
                {(value) => (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(value),
                    }}
                    className="mb-6"
                  />
                )}
              </InlineEditor>
            </Suspense>
          );
        }
        case "image":
          return (
            <div className="mb-6">
              <img
                src={block.src}
                alt={block.alt || ""}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          );
        default:
          return null;
      }
    }
  };

  if (loading) return <div aria-busy="true">Betöltés...</div>;
  if (error) return <div>Hiba: {error}</div>;
  if (!page) return <div>Nincs ilyen oldal</div>;

  if (editMode) {
    // Editor layout
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={exitEditMode}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza az oldalhoz
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button variant={tool === "select" ? "default" : "ghost"} size="sm" onClick={() => setTool("select")}>
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button variant={tool === "text" ? "default" : "ghost"} size="sm" onClick={() => setTool("text")}>
                <Type className="h-4 w-4" />
              </Button>
              <Button variant={tool === "image" ? "default" : "ghost"} size="sm" onClick={() => setTool("image")}>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant={tool === "shape" ? "default" : "ghost"} size="sm" onClick={() => setTool("shape")}>
                <Square className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exitEditMode}>
              <Eye className="h-4 w-4 mr-2" />
              Előnézet
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Add Elements */}
          <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Elemek hozzáadása</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addBlock("heading")}>
                  <Type className="h-6 w-6 mb-2" />
                  <span className="text-xs">Címsor</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addBlock("paragraph")}>
                  <Type className="h-6 w-6 mb-2" />
                  <span className="text-xs">Bekezdés</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addBlock("image")}>
                  <ImageIcon className="h-6 w-6 mb-2" />
                  <span className="text-xs">Kép</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addBlock("shape")}>
                  <Square className="h-6 w-6 mb-2" />
                  <span className="text-xs">Alakzat</span>
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Rétegek</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selectedBlock === block.id ? "bg-primary/20" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {block.type === "heading" && <Type className="h-4 w-4" />}
                      {block.type === "paragraph" && <Type className="h-4 w-4 text-blue-600" />}
                      {block.type === "image" && <ImageIcon className="h-4 w-4" />}
                      <span className="text-sm truncate">
                        {block.content || `${block.type} ${block.id.slice(-4)}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-auto bg-gray-50">
            <div
              ref={canvasRef}
              className="relative mx-auto my-8 bg-white shadow-lg"
              style={{
                width: `${800 * (zoom / 100)}px`,
                height: `${600 * (zoom / 100)}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
              }}
              onClick={handleCanvasClick}
            >
              {/* Grid */}
              {showGrid && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundSize: "20px 20px",
                  }}
                />
              )}

              {/* Render blocks on canvas */}
              {blocks.map((block) => renderBlock(block))}
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 border-l bg-muted/30 p-4 space-y-4">
            {selectedBlockData ? (
              <div>
                <h3 className="font-semibold mb-3">Tulajdonságok</h3>
                <Tabs defaultValue="style" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="style">Stílus</TabsTrigger>
                    <TabsTrigger value="layout">Elrendezés</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="space-y-4">
                    {(selectedBlockData.type === "heading" || selectedBlockData.type === "paragraph") && (
                      <>
                        <div>
                          <Label htmlFor="content">Tartalom</Label>
                          <Input
                            id="content"
                            value={selectedBlockData.content || ""}
                            onChange={(e) => handleBlockChange(selectedBlockData.id, { content: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fontSize">Betűméret</Label>
                          <Slider
                            value={[selectedBlockData.fontSize || 16]}
                            onValueChange={([value]) => handleBlockChange(selectedBlockData.id, { fontSize: value })}
                            max={72}
                            min={8}
                            step={1}
                          />
                          <span className="text-sm text-muted-foreground">{selectedBlockData.fontSize}px</span>
                        </div>
                        <div>
                          <Label htmlFor="textColor">Szöveg színe</Label>
                          <Input
                            id="textColor"
                            type="color"
                            value={selectedBlockData.textColor || "#000000"}
                            onChange={(e) => handleBlockChange(selectedBlockData.id, { textColor: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="textAlign">Szöveg igazítás</Label>
                          <div className="flex space-x-1">
                            <Button
                              variant={selectedBlockData.textAlign === "left" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleBlockChange(selectedBlockData.id, { textAlign: "left" })}
                            >
                              <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={selectedBlockData.textAlign === "center" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleBlockChange(selectedBlockData.id, { textAlign: "center" })}
                            >
                              <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={selectedBlockData.textAlign === "right" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleBlockChange(selectedBlockData.id, { textAlign: "right" })}
                            >
                              <AlignRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="backgroundColor">Háttérszín</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={selectedBlockData.backgroundColor || "#ffffff"}
                        onChange={(e) => handleBlockChange(selectedBlockData.id, { backgroundColor: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="borderRadius">Kerekítés</Label>
                      <Slider
                        value={[selectedBlockData.borderRadius || 0]}
                        onValueChange={([value]) => handleBlockChange(selectedBlockData.id, { borderRadius: value })}
                        max={50}
                        min={0}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">{selectedBlockData.borderRadius}px</span>
                    </div>

                    <div>
                      <Label htmlFor="opacity">Átlátszóság</Label>
                      <Slider
                        value={[selectedBlockData.opacity || 100]}
                        onValueChange={([value]) => handleBlockChange(selectedBlockData.id, { opacity: value })}
                        max={100}
                        min={0}
                        step={5}
                      />
                      <span className="text-sm text-muted-foreground">{selectedBlockData.opacity}%</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="x">X pozíció</Label>
                        <Input
                          id="x"
                          type="number"
                          value={selectedBlockData.x}
                          onChange={(e) => handleBlockChange(selectedBlockData.id, { x: Number.parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="y">Y pozíció</Label>
                        <Input
                          id="y"
                          type="number"
                          value={selectedBlockData.y}
                          onChange={(e) => handleBlockChange(selectedBlockData.id, { y: Number.parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="width">Szélesség</Label>
                        <Input
                          id="width"
                          type="number"
                          value={selectedBlockData.width}
                          onChange={(e) =>
                            handleBlockChange(selectedBlockData.id, { width: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Magasság</Label>
                        <Input
                          id="height"
                          type="number"
                          value={selectedBlockData.height}
                          onChange={(e) =>
                            handleBlockChange(selectedBlockData.id, { height: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="rotation">Forgatás</Label>
                      <Slider
                        value={[selectedBlockData.rotation || 0]}
                        onValueChange={([value]) => handleBlockChange(selectedBlockData.id, { rotation: value })}
                        max={360}
                        min={-360}
                        step={5}
                      />
                      <span className="text-sm text-muted-foreground">{selectedBlockData.rotation}°</span>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => duplicateBlock(selectedBlockData.id)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplikálás
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => deleteBlock(selectedBlockData.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Törlés
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MousePointer className="h-12 w-12" />
                </div>
                <h3 className="font-medium mb-2">Nincs kiválasztott elem</h3>
                <p className="text-sm">Kattints egy elemre a tulajdonságok szerkesztéséhez</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {blocks.map((b) => (
        <React.Fragment key={b.id}>{renderBlock(b)}</React.Fragment>
      ))}
    </div>
  );
}