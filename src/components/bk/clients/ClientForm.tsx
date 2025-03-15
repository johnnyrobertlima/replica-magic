
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BkClient } from "@/hooks/bk/useClients";
import { ClientFormProvider } from "@/contexts/bk/ClientFormContext";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { CompanySection } from "./form-sections/CompanySection";
import { BusinessMetricsSection } from "./form-sections/BusinessMetricsSection";
import { AddressSection } from "./form-sections/AddressSection";
import { ContactSection } from "./form-sections/ContactSection";

interface ClientFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  currentClient: BkClient | null;
  formData: Partial<BkClient>;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean, empresa: string) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
}

export const ClientForm = ({
  isOpen,
  onOpenChange,
  isSubmitting,
  currentClient,
  formData,
  onSubmit,
  onInputChange,
  onCheckboxChange,
  onNumberChange,
}: ClientFormProps) => {
  const contextValue = {
    formData,
    isSubmitting,
    currentClient,
    onInputChange,
    onCheckboxChange,
    onNumberChange
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentClient ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        
        <ClientFormProvider value={contextValue}>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
              <BasicInfoSection />
              <CompanySection />
              <BusinessMetricsSection />
              <AddressSection />
              <ContactSection />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </ClientFormProvider>
      </DialogContent>
    </Dialog>
  );
};
