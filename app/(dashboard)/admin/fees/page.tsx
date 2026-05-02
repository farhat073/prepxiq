"use client";

import { DollarSign } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Fee Overview" description="Track fee collection and pending payments." icon={DollarSign} />;
}
