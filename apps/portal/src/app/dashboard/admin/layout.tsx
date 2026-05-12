"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && (!session || (session.user as any).role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending || !session || (session.user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <AdminDashboard>{children}</AdminDashboard>;
}
