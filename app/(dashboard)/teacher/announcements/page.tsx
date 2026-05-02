"use client";

import { Megaphone } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Announcements" description="Post announcements for your students." icon={Megaphone} />;
}
