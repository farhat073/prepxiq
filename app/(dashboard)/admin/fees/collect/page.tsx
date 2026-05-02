"use client";

import { DollarSign } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Collect Fee" description="Record fee payments from students." icon={DollarSign} />;
}
