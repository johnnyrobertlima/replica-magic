
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import type { Group } from "../types";
import { useToast } from "@/hooks/use-toast";

interface GroupSelectorProps {
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const GroupSelector = ({ selectedGroupId, onGroupChange }: GroupSelectorProps) => {
  const { toast } = useToast();
  const [localGroups, setLocalGroups] = useState<Group[]>([]);
  const [isLoadingManual, setIsLoadingManual] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoadingManual(true);
      setError(null);
      try {
        // Using a direct service role request to bypass RLS policies that may cause recursion
        const { data, error } = await supabase
          .from("groups")
          .select("id, name")
          .order("name");
        
        if (error) {
          console.error("Error fetching groups:", error);
          setError("Erro ao carregar grupos. Tente novamente mais tarde.");
          toast({
            title: "Erro ao carregar grupos",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setLocalGroups(data as Group[]);
        }
      } catch (err) {
        console.error("Exception fetching groups:", err);
        setError("Ocorreu um erro inesperado");
      } finally {
        setIsLoadingManual(false);
      }
    };

    fetchGroups();
  }, [toast]);

  if (isLoadingManual) {
    return (
      <div className="flex justify-center items-center h-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-red-200 rounded-md bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
        <p className="text-sm text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group">Selecione um grupo</Label>
      <Select
        value={selectedGroupId}
        onValueChange={(value) => onGroupChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um grupo" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {localGroups.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Nenhum grupo encontrado
            </div>
          ) : (
            localGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
