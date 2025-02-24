
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import type { User } from "../types";

interface UserSelectProps {
  users: User[] | undefined;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export const UserSelect = ({ users, value, onChange, onAdd }: UserSelectProps) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="user">Adicionar usuário ao grupo</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAdd} disabled={!value}>
        <UserPlus className="h-4 w-4 mr-2" />
        Adicionar
      </Button>
    </div>
  );
};
