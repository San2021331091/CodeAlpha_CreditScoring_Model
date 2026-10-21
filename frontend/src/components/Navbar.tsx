"use client";

import React from "react";
import { ShieldCheck, BrainCircuit, Users, Sparkles, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TabTypes{
  id: string;
  label: string;
  icon: LucideIcon;
}
export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) : React.JSX.Element => {
  const tabs:TabTypes[] = [
    { id: "calculator", label: "Underwriting", icon: ShieldCheck },
    { id: "what-if", label: "What-if", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: BrainCircuit },
    { id: "applications", label: "Portfolio", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 md:h-[76px] md:flex-row md:items-center md:justify-between md:py-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="lg"
              type="button"
              aria-label="Go to underwriting"
              onClick={() => setActiveTab("calculator")}
              className="h-auto justify-start rounded-lg px-0 text-left hover:bg-transparent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-400/25">
                <ShieldCheck className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <span className="block text-base font-semibold tracking-tight text-white">
                  CreditAlpha
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                  Credit risk intelligence
                </span>
              </div>
            </Button>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex w-full items-center gap-1 overflow-x-auto pb-1 md:w-auto md:pb-0"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`h-auto shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-200 ring-1 ring-inset ring-indigo-400/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-300" : "text-slate-500"}`} />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
