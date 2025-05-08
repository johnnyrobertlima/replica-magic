
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
import { useState, useEffect } from "react";
import { useGetGroups } from "../useGetGroups";

interface GroupSelectorProps {
  selectedGroupId: string;
  onGroupChange: (groupId: string) => void;
}

export const GroupSelector = ({ selectedGroupId, onGroupChange }: GroupSelectorProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // First check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase.rpc('check_admin_permission', {
          check_user_id: session.session.user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
          return;
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error in admin check:", error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Use the dedicated hook to fetch groups
  const { data: groups, isLoading, error } = useGetGroups();

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
        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
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
      <Label htmlFor="group">Select a group</Label>
      <Select
        value={selectedGroupId}
        onValueChange={(value) => onGroupChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a group" />
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
