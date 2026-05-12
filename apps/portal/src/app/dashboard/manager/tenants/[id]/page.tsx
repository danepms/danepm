import { api } from "@/lib/api";
import { TenantProfileView } from "@/components/TenantProfileView";
import { redirect } from "next/navigation";

export default async function TenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const res = await api.get<any>(`/tenants/${id}`);
    
    if (!res.success || !res.tenant) {
        redirect("/dashboard/manager/tenants");
    }

    return <TenantProfileView data={res as any} />;
  } catch (error) {
    console.error("Failed to fetch tenant profile:", error);
    redirect("/dashboard/manager/tenants");
  }
}
