"use client";

import { UserCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Teachers" description="Manage teacher profiles and assignments." icon={UserCheck} />;
}
