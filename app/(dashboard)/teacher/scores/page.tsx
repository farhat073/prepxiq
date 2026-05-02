"use client";

import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="My Exams" description="View exams assigned to your batches." icon={FileText} />;
}
