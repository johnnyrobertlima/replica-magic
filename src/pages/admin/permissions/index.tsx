
import { useState } from "react";
import { Shield } from "lucide-react";
import { GroupSelector } from "./components/GroupSelector";
import { PermissionManager } from "./PermissionManager";

export const AdminPermissions = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
      </div>

      <div className="grid gap-6">
        <GroupSelector 
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
        />

        {selectedGroupId && (
          <PermissionManager selectedGroupId={selectedGroupId} />
        )}
      </div>
    </div>
  );
};

export default AdminPermissions;
