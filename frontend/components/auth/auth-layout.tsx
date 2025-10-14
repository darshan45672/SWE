"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
              <FolderKanban className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">ProjectManager</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-primary-foreground">
            Manage your projects with ease
          </h1>
          <p className="text-lg text-primary-foreground/80">
            A modern project management tool with kanban boards, team collaboration, and powerful features.
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © 2025 ProjectManager. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <FolderKanban className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">ProjectManager</span>
            </Link>
          </div>

          {/* Title and description */}
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}
