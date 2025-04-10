
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Status } from "./types";
import { StatusForm } from "./StatusForm";
import { StatusTable } from "./StatusTable";

export function StatusManager() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const { toast } = useToast();

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("oni_agencia_status" as any)
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // Garantir que valores nulos são tratados corretamente
      const safeData = (data || []).map(status => ({
        ...status,
        previous_status_id: status.previous_status_id || null,
        next_status_id: status.next_status_id || null
      })) as Status[];
      
      setStatuses(safeData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();

    // Manipulador para ouvir eventos de edição do StatusTable
    const handleStatusEdit = (event: Event) => {
      const customEvent = event as CustomEvent<Status>;
      setSelectedStatus(customEvent.detail);
    };

    document.addEventListener('statusEdit', handleStatusEdit);

    return () => {
      document.removeEventListener('statusEdit', handleStatusEdit);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este status?")) return;
    
    try {
      const { error } = await supabase
        .from("oni_agencia_status" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Status excluído com sucesso",
      });
      
      await fetchStatuses();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Status</h2>
      
      <StatusForm
        entityName="Status"
        tableName="oni_agencia_status"
        onSuccess={fetchStatuses}
        statuses={statuses}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
      
      <StatusTable
        entityName="status"
        statuses={statuses}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
