"use client";

import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Announcements" description="Create and manage announcements for students and staff." icon={Megaphone} />;
}
