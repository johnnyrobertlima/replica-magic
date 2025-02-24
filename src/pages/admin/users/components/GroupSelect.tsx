
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Group } from "../../groups/types";

interface GroupSelectProps {
  groups: Group[] | undefined;
  value: string;
  onChange: (value: string) => void;
}

export const GroupSelect = ({ groups, value, onChange }: GroupSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group">Selecione um grupo</Label>
      <Select value={value} onValueChange={onChange}>
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
