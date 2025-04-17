
import { ReactNode } from "react";
import { NavBar } from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <div className="container py-6 md:py-10">{children}</div>
      </main>
    </div>
  );
};
