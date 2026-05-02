"use client";

import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Score Entry" description="Enter and manage student exam scores." icon={FileText} />;
}
