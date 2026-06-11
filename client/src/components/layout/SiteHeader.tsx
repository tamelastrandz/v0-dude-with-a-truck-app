/**
 * SiteHeader — Top navigation bar.
 *
 * Preserves the original v0 design.
 * Added: Login button and user menu when authenticated.
 */


"use client";


import { useState } from "react";
import { Truck, Phone, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
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
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-5" aria-hidden="true" />
            </span>
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
