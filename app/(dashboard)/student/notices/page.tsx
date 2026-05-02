"use client";

import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Notices" description="View announcements and important notices." icon={Bell} />;
}
