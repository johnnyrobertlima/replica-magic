
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
import { Loader2 } from "lucide-react";
import type { Group } from "../types";

interface GroupSelectorProps {
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const GroupSelector = ({ selectedGroupId, onGroupChange }: GroupSelectorProps) => {
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Fetching groups for GroupSelector");
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
      
      console.log("Fetched groups:", data);
      return data as Group[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500">
        Error loading groups. Please try again.
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="text-amber-500">
        No groups found. Please create a group first.
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
        <SelectContent>
          {groups?.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
