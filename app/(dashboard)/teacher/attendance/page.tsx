"use client";

import { CalendarCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Mark Attendance" description="Take attendance for your batches." icon={CalendarCheck} />;
}
