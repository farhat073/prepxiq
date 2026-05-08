"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminFeeCollectRemovedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold">Fee Collection Moved</h2>
      <p className="text-muted-foreground max-w-sm">
        Fee collection is now handled exclusively by Super Admins.
      </p>
      <Link href="/admin">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
