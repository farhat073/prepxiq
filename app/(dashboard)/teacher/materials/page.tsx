"use client";

import { FolderOpen } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function Page() {
  return <ComingSoon title="Study Materials" description="Upload study materials for your batches." icon={FolderOpen} />;
}
