"use client";

import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Create Exam" description="Schedule a new exam or assessment." icon={FileText} />;
}
