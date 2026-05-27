import { ClientTable } from "@/components/client-table";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">العملاء</h1>
      </div>
      <ClientTable />
    </div>
  );
}
