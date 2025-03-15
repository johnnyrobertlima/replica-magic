
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Package, Book } from "lucide-react";
import { useClientForm } from "@/contexts/bk/ClientFormContext";

export const CompanySection = () => {
  const { formData, onCheckboxChange } = useClientForm();
  
  return (
    <div className="space-y-2">
      <Label>Empresa</Label>
      <div className="flex flex-wrap gap-6 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="empresa-bluebay" 
            checked={formData.empresas?.includes('Bluebay')}
            onCheckedChange={(checked) => 
              onCheckboxChange(checked as boolean, 'Bluebay')
            }
          />
          <Label 
            htmlFor="empresa-bluebay" 
            className="flex items-center cursor-pointer"
          >
            <Building className="mr-1.5 h-4 w-4" />
            Bluebay
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="empresa-jab" 
            checked={formData.empresas?.includes('JAB')}
            onCheckedChange={(checked) => 
              onCheckboxChange(checked as boolean, 'JAB')
            }
          />
          <Label 
            htmlFor="empresa-jab" 
            className="flex items-center cursor-pointer"
          >
            <Package className="mr-1.5 h-4 w-4" />
            JAB
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="empresa-bk" 
            checked={formData.empresas?.includes('BK')}
            onCheckedChange={(checked) => 
              onCheckboxChange(checked as boolean, 'BK')
            }
          />
          <Label 
            htmlFor="empresa-bk" 
            className="flex items-center cursor-pointer"
          >
            <Book className="mr-1.5 h-4 w-4" />
            BK
          </Label>
        </div>
      </div>
    </div>
  );
};
