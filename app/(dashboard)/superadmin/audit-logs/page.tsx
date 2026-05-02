"use client";

import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Audit Logs" description="Track all system activities and user actions." icon={ClipboardList} />;
}
