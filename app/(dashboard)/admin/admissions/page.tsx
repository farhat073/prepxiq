"use client";

import { UserPlus } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Admissions" description="Manage new admission inquiries and enrollment pipeline." icon={UserPlus} />;
}
