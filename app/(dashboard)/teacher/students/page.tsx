"use client";

import { Users } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="My Students" description="View students in your assigned batches." icon={Users} />;
}
