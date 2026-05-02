"use client";

import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="System Settings" description="Manage academic years, subjects, levels, and grade configurations." icon={Settings} />;
}
