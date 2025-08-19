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
} from "@/components/ui/sidebar";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Grid3X3,
  Settings,
  FileText,
  Boxes,
  ImageIcon,
} from "lucide-react";
export default function AppSidebar() {
  const { t } = useTranslation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">FckWP-CMS</h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Link to="/admin/pages">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText className="h-4 w-4" />
                    <span>{t("Pages")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
              <Link to="/admin/hero-slider">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ImageIcon className="h-4 w-4" />
                    <span>Hero Slider</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>{t("Settings")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Minden jog fenntartva</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}