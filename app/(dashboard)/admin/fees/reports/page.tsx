"use client";

import { DollarSign } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Fee Reports" description="Generate financial reports and summaries." icon={DollarSign} />;
}
