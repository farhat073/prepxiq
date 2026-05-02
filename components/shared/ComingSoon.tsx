"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        {description || "This module is under active development and will be available soon."}
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Under Development
      </div>
    </motion.div>
  );
}
