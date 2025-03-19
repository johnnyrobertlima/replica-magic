
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PermissionTypeSelectorProps {
  permissionType: 'read' | 'write' | 'admin';
  onPermissionTypeChange: (value: 'read' | 'write' | 'admin') => void;
}

export const PermissionTypeSelector = ({
  permissionType,
  onPermissionTypeChange,
}: PermissionTypeSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="permission_type">Tipo de Permissão</Label>
      <Select
        value={permissionType}
        onValueChange={(value: 'read' | 'write' | 'admin') => onPermissionTypeChange(value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="read">Leitura</SelectItem>
          <SelectItem value="write">Escrita</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
