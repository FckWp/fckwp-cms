import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy,
  Globe,
  Calendar,
  FileText,
  X,
  Save,
  Layout,
  Settings,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppSidebar from "./components/Sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published" | "archived";
  template: "blank" | "landing" | "blog" | "portfolio";
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  isHomepage: boolean;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
}

const mockPages: Page[] = [
  {
    id: "1",
    title: "Homepage",
    slug: "/",
    description: "Main landing page for the website",
    status: "published",
    template: "landing",
    author: "John Doe",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    views: 1250,
    isHomepage: true,
    seoTitle: "Welcome to Our Website",
    seoDescription: "The best place to find amazing content and services",
    featuredImage: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    title: "About Us",
    slug: "/about",
    description: "Learn more about our company and mission",
    status: "published",
    template: "blank",
    author: "Jane Smith",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    views: 850,
    isHomepage: false,
  },
  {
    id: "3",
    title: "Blog Post Draft",
    slug: "/blog/new-features",
    description: "Upcoming features and improvements",
    status: "draft",
    template: "blog",
    author: "Mike Johnson",
    createdAt: "2024-01-22",
    updatedAt: "2024-01-22",
    views: 0,
    isHomepage: false,
  },
  {
    id: "4",
    title: "Portfolio Showcase",
    slug: "/portfolio",
    description: "Showcase of our best work and projects",
    status: "published",
    template: "portfolio",
    author: "Sarah Wilson",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-19",
    views: 650,
    isHomepage: false,
  },
];

const templates = [
  { id: "blank", name: "Blank Page", description: "Start with a clean slate" },
  {
    id: "landing",
    name: "Landing Page",
    description: "Perfect for marketing campaigns",
  },
  { id: "blog", name: "Blog Post", description: "Article layout with sidebar" },
  { id: "portfolio", name: "Portfolio", description: "Showcase your work" },
];

interface CreatePageSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: Partial<Page>) => void;
}

function CreatePageSidebar({
  isOpen,
  onClose,
  onSave,
}: CreatePageSidebarProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    template: "blank",
    status: "draft" as const,
    isHomepage: false,
    seoTitle: "",
    seoDescription: "",
  });

  const handleSave = () => {
    onSave({
      ...formData,
      id: Date.now().toString(),
      author: "Current User",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      views: 0,
    });
    setFormData({
      title: "",
      slug: "",
      description: "",
      template: "blank",
      status: "draft",
      isHomepage: false,
      seoTitle: "",
      seoDescription: "",
    });
    onClose();
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug: `/${slug}` }));
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* <AppSidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
              onClick={onClose}
            />
          )}

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-96 bg-background border-l shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-lg font-semibold">Create New Page</h2>
                  <p className="text-sm text-muted-foreground">
                    Add a new page to your website
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Page Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter page title"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                          if (!formData.slug || formData.slug === "/") {
                            generateSlug(e.target.value);
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        placeholder="/page-url"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This will be the URL path for your page
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the page"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="template">Template</Label>
                      <Select
                        value={formData.template}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, template: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div>
                                <div className="font-medium">
                                  {template.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {template.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "draft" | "published") =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        placeholder="SEO optimized title"
                        value={formData.seoTitle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoTitle: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.seoTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="seoDescription">SEO Description</Label>
                      <Textarea
                        id="seoDescription"
                        placeholder="SEO meta description"
                        value={formData.seoDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoDescription: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.seoDescription.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <Label>Featured Image</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="homepage">Set as Homepage</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this the main landing page
                        </p>
                      </div>
                      <Switch
                        id="homepage"
                        checked={formData.isHomepage}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isHomepage: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label>Page Permissions</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="public" defaultChecked />
                          <Label htmlFor="public" className="text-sm">
                            Public access
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="searchable" defaultChecked />
                          <Label htmlFor="searchable" className="text-sm">
                            Include in search
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="comments" />
                          <Label htmlFor="comments" className="text-sm">
                            Allow comments
                          </Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="border-t p-6">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Create Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<string | null>(
    null
  );

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreatePage = useCallback((pageData: Partial<Page>) => {
    const newPage: Page = {
      id: pageData.id || Date.now().toString(),
      title: pageData.title || "",
      slug: pageData.slug || "",
      description: pageData.description || "",
      status: pageData.status || "draft",
      template: (pageData.template as any) || "blank",
      author: pageData.author || "Current User",
      createdAt: pageData.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: pageData.updatedAt || new Date().toISOString().split("T")[0],
      views: pageData.views || 0,
      isHomepage: pageData.isHomepage || false,
      seoTitle: pageData.seoTitle,
      seoDescription: pageData.seoDescription,
    };

    setPages((prev) => [...prev, newPage]);
  }, []);

  const handleDeletePage = useCallback((pageId: string) => {
    setPages((prev) => prev.filter((page) => page.id !== pageId));
  }, []);

  const handleDuplicatePage = useCallback(
    (pageId: string) => {
      const page = pages.find((p) => p.id === pageId);
      if (page) {
        const duplicatedPage: Page = {
          ...page,
          id: Date.now().toString(),
          title: `${page.title} (Copy)`,
          slug: `${page.slug}-copy`,
          status: "draft",
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          views: 0,
          isHomepage: false,
        };
        setPages((prev) => [...prev, duplicatedPage]);
      }
    },
    [pages]
  );

  const getStatusBadge = (status: Page["status"]) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    } as const;

    const colors = {
      published:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      draft:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-semibold">Pages</h1>
            <p className="text-sm text-muted-foreground">
              Manage your website pages and content
            </p>
          </div>
          <Button onClick={() => setIsCreateSidebarOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Pages</p>
                  <p className="text-2xl font-bold">{pages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold">
                    {pages.filter((p) => p.status === "published").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drafts</p>
                  <p className="text-2xl font-bold">
                    {pages.filter((p) => p.status === "draft").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Views</p>
                  <p className="text-2xl font-bold">
                    {pages.reduce((sum, p) => sum + p.views, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="flex-1 px-6 pb-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Layout className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{page.title}</p>
                          {page.isHomepage && (
                            <Badge variant="outline" className="text-xs">
                              Homepage
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {page.slug}
                        </p>
                        {page.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {page.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(page.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {templates.find((t) => t.id === page.template)?.name ||
                        page.template}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {page.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{page.author}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{page.updatedAt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => window.open(page.slug, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsEditorMode(true)}>
                          <Layout className="h-4 w-4 mr-2" />
                          Visual Editor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDuplicatePage(page.id)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Create Page Sidebar */}
      <CreatePageSidebar
        isOpen={isCreateSidebarOpen}
        onClose={() => setIsCreateSidebarOpen(false)}
        onSave={handleCreatePage}
      />
    </div>
  );
}
