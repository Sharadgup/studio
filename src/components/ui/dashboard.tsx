"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Dashboard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full flex-1 space-y-4 p-4 md:p-8 pb-20",
      className
    )}
    {...props}
  />
))
Dashboard.displayName = "Dashboard"

export { Dashboard }
