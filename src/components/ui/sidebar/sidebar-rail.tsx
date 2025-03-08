
import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-y-0 right-0 z-20 w-1 cursor-col-resize bg-border transition-colors hover:bg-accent active:bg-accent group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
));
SidebarRail.displayName = "SidebarRail";
