"use client";

import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Exams" description="View and manage all examinations." icon={FileText} />;
}
