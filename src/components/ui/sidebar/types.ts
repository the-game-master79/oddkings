
import { VariantProps } from "class-variance-authority";
import { sidebarMenuButtonVariants } from "./menu-button";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  variant?: "default" | "ghost";
  tooltip?: string | React.ComponentProps<typeof import("@radix-ui/react-tooltip").TooltipContent>;
}
