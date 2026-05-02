"use client";

import { BookMarked } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Homework" description="View and submit your homework assignments." icon={BookMarked} />;
}
