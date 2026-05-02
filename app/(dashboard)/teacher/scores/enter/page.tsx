"use client";

import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Enter Scores" description="Enter student scores for your exams." icon={FileText} />;
}
