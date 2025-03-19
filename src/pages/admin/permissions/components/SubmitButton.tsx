
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Permissão
        </>
      )}
    </Button>
  );
};
