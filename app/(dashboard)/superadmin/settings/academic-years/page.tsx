"use client";

import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Academic Years" description="Configure academic year periods for your institution." icon={Calendar} />;
}
