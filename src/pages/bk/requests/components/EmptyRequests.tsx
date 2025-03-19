
import { AlertCircle } from "lucide-react";

export function EmptyRequests() {
  return (
    <div className="text-center py-10 px-4">
      <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
      <p className="mt-1 text-sm text-gray-500">
        Você ainda não possui solicitações. Use o formulário ao lado para criar uma nova solicitação.
      </p>
    </div>
  );
}
