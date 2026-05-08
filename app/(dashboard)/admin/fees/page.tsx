"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminFeesRemovedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-bold">Fee Management Moved</h2>
      <p className="text-muted-foreground max-w-sm">
        Fee and finance management is now handled exclusively by Super Admins. 
        Please contact your Super Admin for fee-related operations.
      </p>
      <Link href="/admin">
        <Button variant="outline">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
