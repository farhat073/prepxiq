"use client";

import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Subjects" description="Manage subjects taught across all branches." icon={BookOpen} />;
}
