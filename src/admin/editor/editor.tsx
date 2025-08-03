import type React from "react"
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react"
import * as ReactDOM from "react-dom"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock PocketBase for demo purposes
const pb = {
  collection: (name: string) => ({
    getFullList: async (options: any) => [],
    update: async (id: string, data: any) => ({ id, ...data }),
    create: async (data: any) => ({ id: Date.now().toString(), ...data }),
  }),
}

// Mock i18n for demo purposes
const useTranslation = () => ({
  i18n: {
    language: "en",
    reloadResources: async () => {},
  },
})

interface EditorElement {
  id: string
  type: "text" | "image" | "shape" | "bookmark" | "inline-text"
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  borderRadius?: number
  rotation?: number
  opacity?: number
  zIndex?: number
  recordKey?: string
  isEditing?: boolean
}

type BubbleToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement>
  onSave: () => Promise<void>
  onCancel: () => void
}

const BubbleToolbar: React.FC<BubbleToolbarProps> = ({ editorRef, onSave, onCancel }) => {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  })

  useLayoutEffect(() => {
    const update = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX,
      })
    }

    document.addEventListener("selectionchange", update)
    update()
    return () => document.removeEventListener("selectionchange", update)
  }, [])

  return ReactDOM.createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute bg-white shadow-lg rounded-lg px-2 py-1 flex gap-2 z-[9999] border"
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      <button onClick={onSave} className="px-3 py-1 text-sm font-medium hover:bg-blue-50 rounded text-blue-600">
        💾 Save
      </button>
      <button onClick={onCancel} className="px-3 py-1 text-sm hover:bg-gray-100 rounded text-gray-600">
        ❌ Cancel
      </button>
    </div>,
    document.body,
  )
}

let activeEditor: React.RefObject<HTMLDivElement> | null = null
let setActiveEditing: ((editing: boolean) => void) | null = null

interface InlineTextElementProps {
  element: EditorElement
  onUpdate: (id: string, updates: Partial<EditorElement>) => void
  isSelected: boolean
  onSelect: (id: string) => void
}

const InlineTextElement: React.FC<InlineTextElementProps> = ({ element, onUpdate, isSelected, onSelect }) => {
  const { i18n } = useTranslation()
  const [hover, setHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const [recordId, setRecordId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editing && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setEditing(false)
        onUpdate(element.id, { isEditing: false })
      }
    }

    if (editing) {
      if (activeEditor && activeEditor !== editorRef && setActiveEditing) {
        setActiveEditing(false)
      }
      activeEditor = editorRef
      setActiveEditing = setEditing
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (activeEditor === editorRef) {
        activeEditor = null
        setActiveEditing = null
      }
    }
  }, [editing, element.id, onUpdate])

  const saveCursorPosition = () => {
    const selection = window.getSelection()
    if (!selection || !editorRef.current) return null
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    return preCaretRange.toString().length
  }

  const restoreCursorPosition = (pos: number) => {
    if (!editorRef.current) return
    const selection = window.getSelection()
    if (!selection) return

    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null)
    let currentPos = 0
    let node

    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0
      if (currentPos + textLength >= pos) {
        const range = document.createRange()
        range.setStart(node, pos - currentPos)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
      currentPos += textLength
    }
  }

  const save = async () => {
    if (!editorRef.current) return

    let html = editorRef.current.innerHTML
    // Clean up HTML
    html = html.replace(/<(?<tag>h[1-6])>\s*<k<tag>>/gi, "<$1>")
    html = html.replace(/<\/(?<tag>h[1-6])>\s*<\/k<tag>>/gi, "</$1>")
    html = html.replace(/<([a-z][a-z0-9]*)>\s*<\/\1>/gi, "")

    // Update element content
    onUpdate(element.id, { content: html })
    setEditing(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(element.id)
  }

  return (
    <div
      className={`absolute cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        opacity: (element.opacity || 100) / 100,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={editorRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onClick={(e) => {
          e.stopPropagation()
          if (activeEditor && activeEditor !== editorRef && setActiveEditing) {
            setActiveEditing(false)
          }
          setEditing(true)
          onUpdate(element.id, { isEditing: true })
        }}
        onInput={() => {
          if (!editorRef.current) return
          const cursorPos = saveCursorPosition()
          const html = editorRef.current.innerHTML
          onUpdate(element.id, { content: html })
          setTimeout(() => {
            if (cursorPos !== null) restoreCursorPosition(cursorPos)
          }, 0)
        }}
        className={`w-full h-full flex items-center p-2 rounded transition-all duration-150 ${
          editing
            ? "border-2 border-blue-500 bg-blue-50/30 whitespace-pre-wrap"
            : hover
              ? "border-2 border-blue-300 bg-blue-50/20"
              : "border border-transparent"
        }`}
        style={{
          color: element.textColor,
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          textAlign: element.textAlign as any,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius,
          minWidth: "1ch",
        }}
        dangerouslySetInnerHTML={{ __html: element.content || "Click to edit text" }}
      />

      {(hover || editing) && (
        <div
          className="absolute -top-1 -right-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg transition-opacity duration-200 pointer-events-none"
          style={{ fontSize: "10px" }}
        >
          {editing ? "Editing" : "Text"}
        </div>
      )}

      {editing && <BubbleToolbar editorRef={editorRef} onSave={save} onCancel={() => setEditing(false)} />}
    </div>
  )
}

interface BookmarkEditorProps {
  onClose: () => void
}

export default function BookmarkEditor({ onClose }: BookmarkEditorProps) {
  const [elements, setElements] = useState<EditorElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [tool, setTool] = useState<"select" | "text" | "image" | "shape" | "inline-text">("select")
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const addElement = useCallback(
    (type: EditorElement["type"]) => {
      const newElement: EditorElement = {
        id: `element-${Date.now()}`,
        type,
        x: 100,
        y: 100,
        width: type === "text" || type === "inline-text" ? 200 : 150,
        height: type === "text" || type === "inline-text" ? 50 : 100,
        content: type === "text" || type === "inline-text" ? "New Text" : undefined,
        src: type === "image" ? "/placeholder.svg?height=100&width=150" : undefined,
        backgroundColor: type === "shape" ? "#3b82f6" : type === "inline-text" ? "transparent" : undefined,
        textColor: "#000000",
        fontSize: 16,
        fontWeight: "normal",
        textAlign: "left",
        borderRadius: 0,
        rotation: 0,
        opacity: 100,
        zIndex: elements.length,
        recordKey: type === "inline-text" ? `text-${Date.now()}` : undefined,
        isEditing: false,
      }
      setElements([...elements, newElement])
      setSelectedElement(newElement.id)
    },
    [elements],
  )

  const updateElement = useCallback(
    (id: string, updates: Partial<EditorElement>) => {
      setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
    },
    [elements],
  )

  const deleteElement = useCallback(
    (id: string) => {
      setElements(elements.filter((el) => el.id !== id))
      setSelectedElement(null)
    },
    [elements],
  )

  const duplicateElement = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id)
      if (element) {
        const newElement = {
          ...element,
          id: `element-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
          zIndex: elements.length,
          recordKey: element.type === "inline-text" ? `text-${Date.now()}` : element.recordKey,
        }
        setElements([...elements, newElement])
        setSelectedElement(newElement.id)
      }
    },
    [elements],
  )

  const selectedElementData = elements.find((el) => el.id === selectedElement)

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setSelectedElement(elementId)
    if (tool === "select") {
      setDragStart({ x: e.clientX, y: e.clientY })
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart && selectedElement) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      updateElement(selectedElement, {
        x: (selectedElementData?.x || 0) + deltaX,
        y: (selectedElementData?.y || 0) + deltaY,
      })

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="h-16 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
            <Button
              variant={tool === "inline-text" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTool("inline-text")}
            >
              <Type className="h-4 w-4" />
              <span className="text-xs ml-1">Inline</span>
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
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Add Elements */}
        <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addElement("text")}>
                <Type className="h-6 w-6 mb-2" />
                <span className="text-xs">Text</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col bg-transparent"
                onClick={() => addElement("inline-text")}
              >
                <Type className="h-6 w-6 mb-2" />
                <span className="text-xs">Inline Text</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addElement("image")}>
                <ImageIcon className="h-6 w-6 mb-2" />
                <span className="text-xs">Image</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addElement("shape")}>
                <Square className="h-6 w-6 mb-2" />
                <span className="text-xs">Shape</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={() => addElement("bookmark")}>
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-xs">Bookmark</span>
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Layers</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedElement === element.id ? "bg-primary/20" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex items-center space-x-2">
                    {element.type === "text" && <Type className="h-4 w-4" />}
                    {element.type === "inline-text" && <Type className="h-4 w-4 text-blue-600" />}
                    {element.type === "image" && <ImageIcon className="h-4 w-4" />}
                    {element.type === "shape" && <Square className="h-4 w-4" />}
                    {element.type === "bookmark" && <Plus className="h-4 w-4" />}
                    <span className="text-sm truncate">
                      {element.content || `${element.type} ${element.id.slice(-4)}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteElement(element.id)
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
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
            )}

            {/* Elements */}
            {elements.map((element) => {
              if (element.type === "inline-text") {
                return (
                  <InlineTextElement
                    key={element.id}
                    element={element}
                    onUpdate={updateElement}
                    isSelected={selectedElement === element.id}
                    onSelect={setSelectedElement}
                  />
                )
              }

              return (
                <div
                  key={element.id}
                  className={`absolute cursor-pointer ${selectedElement === element.id ? "ring-2 ring-primary" : ""}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    transform: `rotate(${element.rotation || 0}deg)`,
                    opacity: (element.opacity || 100) / 100,
                    zIndex: element.zIndex,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                >
                  {element.type === "text" && (
                    <div
                      className="w-full h-full flex items-center p-2 border border-gray-200 rounded"
                      style={{
                        color: element.textColor,
                        fontSize: element.fontSize,
                        fontWeight: element.fontWeight,
                        textAlign: element.textAlign as any,
                        backgroundColor: element.backgroundColor,
                        borderRadius: element.borderRadius,
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === "image" && (
                    <img
                      src={element.src || "/placeholder.svg"}
                      alt="Element"
                      className="w-full h-full object-cover"
                      style={{
                        borderRadius: element.borderRadius,
                      }}
                    />
                  )}
                  {element.type === "shape" && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: element.backgroundColor,
                        borderRadius: element.borderRadius,
                      }}
                    />
                  )}
                  {element.type === "bookmark" && (
                    <Card className="w-full h-full">
                      <CardContent className="p-2 h-full flex flex-col">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-xs font-medium truncate">Sample Bookmark</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">This is a sample bookmark card</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-muted/30 p-4 space-y-4">
          {selectedElementData ? (
            <div>
              <h3 className="font-semibold mb-3">Properties</h3>
              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4">
                  {(selectedElementData.type === "text" || selectedElementData.type === "inline-text") && (
                    <>
                      <div>
                        <Label htmlFor="content">Text Content</Label>
                        <Input
                          id="content"
                          value={selectedElementData.content || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Slider
                          value={[selectedElementData.fontSize || 16]}
                          onValueChange={([value]) => updateElement(selectedElementData.id, { fontSize: value })}
                          max={72}
                          min={8}
                          step={1}
                        />
                        <span className="text-sm text-muted-foreground">{selectedElementData.fontSize}px</span>
                      </div>
                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <Input
                          id="textColor"
                          type="color"
                          value={selectedElementData.textColor || "#000000"}
                          onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="textAlign">Text Align</Label>
                        <div className="flex space-x-1">
                          <Button
                            variant={selectedElementData.textAlign === "left" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateElement(selectedElementData.id, { textAlign: "left" })}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElementData.textAlign === "center" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateElement(selectedElementData.id, { textAlign: "center" })}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElementData.textAlign === "right" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateElement(selectedElementData.id, { textAlign: "right" })}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {(selectedElementData.type === "shape" ||
                    selectedElementData.type === "text" ||
                    selectedElementData.type === "inline-text") && (
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={selectedElementData.backgroundColor || "#ffffff"}
                        onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <Slider
                      value={[selectedElementData.borderRadius || 0]}
                      onValueChange={([value]) => updateElement(selectedElementData.id, { borderRadius: value })}
                      max={50}
                      min={0}
                      step={1}
                    />
                    <span className="text-sm text-muted-foreground">{selectedElementData.borderRadius}px</span>
                  </div>

                  <div>
                    <Label htmlFor="opacity">Opacity</Label>
                    <Slider
                      value={[selectedElementData.opacity || 100]}
                      onValueChange={([value]) => updateElement(selectedElementData.id, { opacity: value })}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <span className="text-sm text-muted-foreground">{selectedElementData.opacity}%</span>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="x">X Position</Label>
                      <Input
                        id="x"
                        type="number"
                        value={selectedElementData.x}
                        onChange={(e) => updateElement(selectedElementData.id, { x: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="y">Y Position</Label>
                      <Input
                        id="y"
                        type="number"
                        value={selectedElementData.y}
                        onChange={(e) => updateElement(selectedElementData.id, { y: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={selectedElementData.width}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, { width: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        value={selectedElementData.height}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, { height: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rotation">Rotation</Label>
                    <Slider
                      value={[selectedElementData.rotation || 0]}
                      onValueChange={([value]) => updateElement(selectedElementData.id, { rotation: value })}
                      max={360}
                      min={-360}
                      step={5}
                    />
                    <span className="text-sm text-muted-foreground">{selectedElementData.rotation}°</span>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => duplicateElement(selectedElementData.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => deleteElement(selectedElementData.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointer className="h-12 w-12" />
              </div>
              <h3 className="font-medium mb-2">No element selected</h3>
              <p className="text-sm">Click on an element to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
