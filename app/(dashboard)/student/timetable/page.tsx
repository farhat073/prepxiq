"use client";

import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Timetable" description="View your weekly class schedule." icon={Calendar} />;
}
