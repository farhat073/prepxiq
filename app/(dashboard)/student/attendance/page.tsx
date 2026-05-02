"use client";

import { CalendarCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="My Attendance" description="Track your attendance record." icon={CalendarCheck} />;
}
