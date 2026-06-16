"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Redirect to the main Projects page which now handles all statuses
export default function PendingProjectsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/projects");
  }, [router]);
  return null;
}
