"use client";

import { CalendarCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Mark Attendance" description="Take daily attendance for batches." icon={CalendarCheck} />;
}
