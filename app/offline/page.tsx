import Link from "next/link";
import { WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-[#6D5EF7]/10">
        <WifiOff className="size-8 text-[#6D5EF7]" />
      </div>
      <h1 className="text-xl font-semibold">You are offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Check your internet connection and try again. Some pages may be unavailable until
        you are back online.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
        Try again
      </Link>
    </div>
  );
}
