"use client";
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
  SidebarSeparator,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {Icons} from '@/components/icons';
import {Dashboard} from '@/components/ui/dashboard';
import Link from 'next/link';

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
              <Link href="/admin/users" passHref>
                <SidebarMenuButton asChild>
                  <>
                    <Icons.user className="mr-2 h-4 w-4"/>
                    <span>Users</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/projects" passHref>
                <SidebarMenuButton asChild>
                  <>
                    <Icons.workflow className="mr-2 h-4 w-4"/>
                    <span>Projects</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/tasks" passHref>
                <SidebarMenuButton asChild>
                  <>
                    <Icons.file className="mr-2 h-4 w-4"/>
                    <span>Tasks</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/insights" passHref>
                <SidebarMenuButton asChild>
                  <>
                    <Icons.panelLeft className="mr-2 h-4 w-4"/>
                    <span>Insights</span>
                  </>
                </SidebarMenuButton>
              </Link>
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


