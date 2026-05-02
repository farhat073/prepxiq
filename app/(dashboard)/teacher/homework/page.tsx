"use client";

import { BookMarked } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Homework" description="Assign and track homework submissions." icon={BookMarked} />;
}
