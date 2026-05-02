"use client";

import { FolderOpen } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Study Materials" description="Upload and manage learning resources." icon={FolderOpen} />;
}
