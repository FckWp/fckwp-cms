import { useState, useMemo } from "react";
import {
  Search,
  Grid3X3,
  List,
  Star,
  Plus,
  Eye,
  BarChart3,
  Settings,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  Clock,
  TrendingUp,
  Tag,
  Heart,
  Share2,
  Copy,
  Activity,
  LayoutGrid,
  Rows,
  CalendarIcon,
  Kanban,
  FileText,
  Boxes,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import BookmarkEditor from "./editor/editor";
import AppSidebar from "./components/Sidebar";

// Mock data for bookmarks with enhanced details
const mockBookmarks = [
  {
    id: 1,
    title: "GitHub",
    url: "https://github.com",
    description: "Development platform for version control and collaboration",
    favicon: "/placeholder.svg?height=32&width=32",
    screenshot: "/placeholder.svg?height=200&width=300",
    category: "Development",
    priority: "high",
    tags: ["code", "git", "collaboration", "open-source"],
    lastVisited: "2024-01-15",
    visitCount: 45,
    status: "active",
    notes:
      "Main repository hosting platform for all projects. Contains personal and work repositories.",
    dateAdded: "2023-12-01",
    isFavorite: true,
    timeSpent: "2h 30m",
    weeklyVisits: [5, 8, 12, 6, 9, 3, 2],
    relatedSites: ["GitLab", "Bitbucket"],
    lastUpdate: "2024-01-15T10:30:00Z",
    siteHealth: "excellent",
    loadTime: "1.2s",
    mobileOptimized: true,
  },
];

const categories = [
  "All",
  "Development",
  "Design",
  "Productivity",
  "Learning",
  "Entertainment",
];
const priorities = ["All", "High", "Medium", "Low"];
const statuses = ["All", "Active", "Archived", "Broken"];

const viewModes = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "compact", label: "Compact", icon: Rows },
  { id: "kanban", label: "Kanban", icon: Kanban },
  { id: "timeline", label: "Timeline", icon: CalendarIcon },
];

function DetailedBookmarkModal({ bookmark, isOpen, onClose }: any) {
  if (!bookmark) return null;

  const healthColors = {
    excellent:
      "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200",
    good: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200",
    fair: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200",
    poor: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={bookmark.favicon || "/placeholder.svg"}
                  alt={bookmark.title}
                />
                <AvatarFallback>{bookmark.title[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{bookmark.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {bookmark.url}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart
                  className={`h-4 w-4 ${
                    bookmark.isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(bookmark.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={bookmark.screenshot || "/placeholder.svg"}
                  alt={`${bookmark.title} screenshot`}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {bookmark.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {bookmark.notes}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{bookmark.visitCount}</p>
                  <p className="text-xs text-muted-foreground">Total Visits</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{bookmark.timeSpent}</p>
                  <p className="text-xs text-muted-foreground">Time Spent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">
                    {bookmark.weeklyVisits.reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Badge
                    className={
                      healthColors[
                        bookmark.siteHealth as keyof typeof healthColors
                      ]
                    }
                  >
                    {bookmark.siteHealth}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Site Health
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <span className="w-8 text-xs">{day}</span>
                          <Progress
                            value={
                              (bookmark.weeklyVisits[index] /
                                Math.max(...bookmark.weeklyVisits)) *
                              100
                            }
                            className="flex-1"
                          />
                          <span className="w-8 text-xs text-right">
                            {bookmark.weeklyVisits[index]}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Load Time</span>
                    <Badge variant="outline">{bookmark.loadTime}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mobile Optimized</span>
                    <Badge
                      variant={
                        bookmark.mobileOptimized ? "default" : "secondary"
                      }
                    >
                      {bookmark.mobileOptimized ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(bookmark.lastUpdate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Category</span>
                    <Badge>{bookmark.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Bookmark Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date Added</span>
                    <span className="text-sm text-muted-foreground">
                      {bookmark.dateAdded}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Visited</span>
                    <span className="text-sm text-muted-foreground">
                      {bookmark.lastVisited}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Priority</span>
                    <Badge variant="outline">{bookmark.priority}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline">{bookmark.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Favorite</span>
                    <span className="text-sm">
                      {bookmark.isFavorite ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Bookmark
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Bookmark
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="related" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Sites</CardTitle>
                <CardDescription>
                  Sites you might also be interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookmark.relatedSites.map((site: string) => (
                    <div
                      key={site}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{site[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{site}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function BookmarkCard({
  bookmark,
  viewMode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
}: any) {
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  if (viewMode === "list") {
    return (
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={bookmark.favicon || "/placeholder.svg"}
                alt={bookmark.title}
              />
              <AvatarFallback>{bookmark.title[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3
                  className="font-medium truncate cursor-pointer hover:text-primary"
                  onClick={() => onViewDetails(bookmark)}
                >
                  {bookmark.title}
                </h3>
                {bookmark.isFavorite && (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                )}
                <Badge
                  variant="secondary"
                  className={
                    priorityColors[
                      bookmark.priority as keyof typeof priorityColors
                    ]
                  }
                >
                  {bookmark.priority}
                </Badge>
                <Badge variant="outline">{bookmark.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {bookmark.description}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{bookmark.lastVisited}</span>
              <span>•</span>
              <span>{bookmark.visitCount} visits</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(bookmark)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(bookmark.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bookmark)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bookmark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "compact") {
    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={bookmark.favicon || "/placeholder.svg"}
                alt={bookmark.title}
              />
              <AvatarFallback className="text-xs">
                {bookmark.title[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                onClick={() => onViewDetails(bookmark)}
              >
                {bookmark.title}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                {bookmark.isFavorite && (
                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                )}
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {bookmark.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {bookmark.visitCount} visits
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(bookmark)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(bookmark.url, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "kanban") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Checkbox checked={isSelected} onCheckedChange={onSelect} />
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={bookmark.favicon || "/placeholder.svg"}
                  alt={bookmark.title}
                />
                <AvatarFallback className="text-xs">
                  {bookmark.title[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            {bookmark.isFavorite && (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            )}
          </div>
          <h3
            className="font-medium mb-2 cursor-pointer hover:text-primary"
            onClick={() => onViewDetails(bookmark)}
          >
            {bookmark.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {bookmark.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {bookmark.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {bookmark.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{bookmark.tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{bookmark.visitCount} visits</span>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(bookmark)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(bookmark.url, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "timeline") {
    return (
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="w-px h-16 bg-border mt-2"></div>
        </div>
        <Card className="flex-1 group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox checked={isSelected} onCheckedChange={onSelect} />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={bookmark.favicon || "/placeholder.svg"}
                    alt={bookmark.title}
                  />
                  <AvatarFallback>{bookmark.title[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3
                    className="font-medium cursor-pointer hover:text-primary"
                    onClick={() => onViewDetails(bookmark)}
                  >
                    {bookmark.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {bookmark.lastVisited}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {bookmark.isFavorite && (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                )}
                <Badge
                  variant="outline"
                  className={
                    priorityColors[
                      bookmark.priority as keyof typeof priorityColors
                    ]
                  }
                >
                  {bookmark.priority}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {bookmark.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(bookmark)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(bookmark.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default grid view
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={bookmark.favicon || "/placeholder.svg"}
                alt={bookmark.title}
              />
              <AvatarFallback>{bookmark.title[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center space-x-1">
            {bookmark.isFavorite && (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            )}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(bookmark)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(bookmark.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(bookmark)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(bookmark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div>
          <CardTitle
            className="text-lg cursor-pointer hover:text-primary"
            onClick={() => onViewDetails(bookmark)}
          >
            {bookmark.title}
          </CardTitle>
          <CardDescription className="text-sm">{bookmark.url}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <img
            src={bookmark.screenshot || "/placeholder.svg"}
            alt={`${bookmark.title} screenshot`}
            width={300}
            height={200}
            className="w-full h-32 object-cover rounded-md cursor-pointer"
            onClick={() => onViewDetails(bookmark)}
          />
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bookmark.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={
                  priorityColors[
                    bookmark.priority as keyof typeof priorityColors
                  ]
                }
              >
                {bookmark.priority}
              </Badge>
              <span>{bookmark.category}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{bookmark.visitCount} visits</span>
            </div>
          </div>
          {bookmark.notes && (
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              {bookmark.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("lastVisited");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(false);

  const filteredBookmarks = useMemo(() => {
    return mockBookmarks
      .filter((bookmark) => {
        const matchesSearch =
          bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bookmark.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          bookmark.notes.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" || bookmark.category === selectedCategory;
        const matchesPriority =
          selectedPriority === "All" ||
          bookmark.priority === selectedPriority.toLowerCase();
        const matchesStatus =
          selectedStatus === "All" ||
          bookmark.status === selectedStatus.toLowerCase();

        return (
          matchesSearch && matchesCategory && matchesPriority && matchesStatus
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "visitCount":
            return b.visitCount - a.visitCount;
          case "dateAdded":
            return (
              new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
            );
          case "lastVisited":
          default:
            return (
              new Date(b.lastVisited).getTime() -
              new Date(a.lastVisited).getTime()
            );
        }
      });
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  const handleSelectBookmark = (bookmarkId: number, checked: boolean) => {
    if (checked) {
      setSelectedBookmarks([...selectedBookmarks, bookmarkId]);
    } else {
      setSelectedBookmarks(selectedBookmarks.filter((id) => id !== bookmarkId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookmarks(filteredBookmarks.map((b) => b.id));
    } else {
      setSelectedBookmarks([]);
    }
  };

  const handleBulkDelete = () => {
    setSelectedBookmarks([]);
  };

  const handleEdit = (bookmark: any) => {
    console.log("Edit bookmark:", bookmark);
  };

  const handleDelete = (bookmarkId: number) => {
    console.log("Delete bookmark:", bookmarkId);
  };

  const handleViewDetails = (bookmark: any) => {
    setSelectedBookmark(bookmark);
    setIsDetailModalOpen(true);
  };

  const renderBookmarks = () => {
    if (viewMode === "kanban") {
      const categorizedBookmarks = categories
        .slice(1)
        .reduce((acc, category) => {
          acc[category] = filteredBookmarks.filter(
            (b) => b.category === category
          );
          return acc;
        }, {} as Record<string, any[]>);

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(categorizedBookmarks).map(([category, bookmarks]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{category}</h3>
                <Badge variant="secondary">{bookmarks.length}</Badge>
              </div>
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    viewMode={viewMode}
                    isSelected={selectedBookmarks.includes(bookmark.id)}
                    onSelect={(checked: boolean) =>
                      handleSelectBookmark(bookmark.id, checked)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (viewMode === "timeline") {
      return (
        <div className="max-w-3xl mx-auto">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              viewMode={viewMode}
              isSelected={selectedBookmarks.includes(bookmark.id)}
              onSelect={(checked: boolean) =>
                handleSelectBookmark(bookmark.id, checked)
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      );
    }

    const gridClasses = {
      grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      list: "space-y-2",
      compact:
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3",
    };

    return (
      <div
        className={
          gridClasses[viewMode as keyof typeof gridClasses] || gridClasses.grid
        }
      >
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            viewMode={viewMode}
            isSelected={selectedBookmarks.includes(bookmark.id)}
            onSelect={(checked: boolean) =>
              handleSelectBookmark(bookmark.id, checked)
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider>
      {!isEditorMode && (
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center px-6">
                <SidebarTrigger />
                <div className="flex items-center space-x-4 flex-1 ml-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bookmarks, tags, notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedPriority}
                      onValueChange={setSelectedPriority}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastVisited">
                          Last Visited
                        </SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="visitCount">Most Visited</SelectItem>
                        <SelectItem value="dateAdded">Date Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-lg">
                    {viewModes.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <Button
                          key={mode.id}
                          variant={viewMode === mode.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode(mode.id)}
                          title={mode.label}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bookmark
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Bookmark</DialogTitle>
                        <DialogDescription>
                          Add a new website to your bookmark collection.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" placeholder="Website title" />
                        </div>
                        <div>
                          <Label htmlFor="url">URL</Label>
                          <Input id="url" placeholder="https://example.com" />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of the website"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.slice(1).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="tags">Tags</Label>
                          <Input id="tags" placeholder="tag1, tag2, tag3" />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Additional notes or comments"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddDialogOpen(false)}>
                          Add Bookmark
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditorMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editor
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {/* Stats Bar */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Grid3X3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Bookmarks</p>
                          <p className="text-2xl font-bold">
                            {mockBookmarks.length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">This Month</p>
                          <p className="text-2xl font-bold">+12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                          <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Favorites</p>
                          <p className="text-2xl font-bold">
                            {mockBookmarks.filter((b) => b.isFavorite).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bookmark List */}
              {renderBookmarks()}
            </main>
          </div>
        </div>
      )}
      {isEditorMode && <BookmarkEditor />}
    </SidebarProvider>
  );
}
