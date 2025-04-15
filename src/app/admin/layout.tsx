import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {Icons} from '@/components/icons';
import {Dashboard} from '@/components/ui/dashboard';

export default function AdminLayout({children}: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-lg font-semibold">TaskMatrixAI Admin</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/users">
                <Icons.user className="mr-2 h-4 w-4"/>
                <span>Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/projects">
                <Icons.workflow className="mr-2 h-4 w-4"/>
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/tasks">
                <Icons.file className="mr-2 h-4 w-4"/>
                <span>Tasks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/insights">
                <Icons.panelLeft className="mr-2 h-4 w-4"/>
                <span>Insights</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator/>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TaskMatrixAI
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Dashboard>{children}</Dashboard>
      </SidebarInset>
    </SidebarProvider>
  );
}

