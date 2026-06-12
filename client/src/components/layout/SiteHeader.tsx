/**
 * SiteHeader — Top navigation bar.
 *
 * Preserves the original v0 design.
 * Added: Login button and user menu when authenticated.
 */

"use client";

import { useState } from "react";
import { Phone, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Crew", href: "#crew" },
  { label: "Referral Partners", href: "/referral-partner", highlight: true },
];

type SiteHeaderProps = {
  /** When false, header sits above content instead of overlaying the hero. */
  overlay?: boolean;
};

export function SiteHeader({ overlay = true }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup-driver" | "signup-customer">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    toast.success("Signed out successfully.");
  };

  const openAuth = (mode: typeof authMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "inset-x-0 top-0 z-50",
          overlay ? "absolute" : "relative border-b border-border bg-background"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/logoo.png"
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 object-contain"
            />
            <span className="font-heading text-sm font-bold uppercase leading-[0.95] tracking-wide text-foreground">
              Dude With
              <br />A Truck
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={
                link.highlight
                  ? "font-heading text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:text-primary/80 border border-primary/30 rounded-md px-3 py-1 hover:bg-primary/10"
                  : "font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {link.label}
            </a>
          ))}
          </nav>

          {/* Desktop CTA / User menu */}
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href="tel:+18557064191"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="size-4" aria-hidden="true" />
              +1 855-706-4191
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
                >
                  <User className="size-4" />
                  {profile?.full_name?.split(" ")[0] ?? "Account"}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card shadow-lg">
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </a>
                    {profile?.role === "admin" && (
                      <a
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="size-4" />
                        Admin Panel
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-destructive transition-colors hover:bg-secondary"
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuth("login")}
                  className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth("signup-driver")}
                  className="font-heading inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  List My Truck
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-md text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-border bg-card/95 backdrop-blur lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={
                    link.highlight
                      ? "font-heading rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/10"
                      : "font-heading rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  }
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="font-heading mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-semibold uppercase tracking-wide text-foreground"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="font-heading mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-semibold uppercase tracking-wide text-foreground"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className="font-heading mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-semibold uppercase tracking-wide text-foreground"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuth("signup-driver")}
                    className="font-heading mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground"
                  >
                    List My Truck
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
