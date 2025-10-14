import { ReactNode } from "react";
import { LayoutClient } from "@/components/layout/layout-client";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
