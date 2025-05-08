
import { useState } from "react";
import { GroupSelector } from "./components/GroupSelector";
import { PermissionManager } from "./PermissionManager";

function AdminPermissions() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  
  console.log("Selected group ID changed:", selectedGroupId);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Permissões</h1>
      <div className="space-y-6">
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
}

export default AdminPermissions;
