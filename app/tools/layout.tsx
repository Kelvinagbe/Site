// app/tools/layout.tsx (Super minimal version)
import { ReactNode } from "react";

export const metadata = {
  title: 'Tools - Apexion',
  description: 'Apexion Tools',
};

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}