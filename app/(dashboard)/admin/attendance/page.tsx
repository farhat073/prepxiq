"use client";

import { CalendarCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Attendance Reports" description="View attendance analytics and generate reports." icon={CalendarCheck} />;
}
