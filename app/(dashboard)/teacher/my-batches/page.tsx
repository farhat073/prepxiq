"use client";

import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="My Batches" description="View your assigned batches and class schedules." icon={BookOpen} />;
}
