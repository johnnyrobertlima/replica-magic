
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientFormData, OniAgenciaClient } from "@/types/oni-agencia";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  client?: OniAgenciaClient;
  isSubmitting: boolean;
}

export const ClientForm = ({ onSubmit, client, isSubmitting }: ClientFormProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(client?.logo_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData(e.currentTarget);
    
    let logoUrl = client?.logo_url || null;
    
    // Upload logo if a new file was selected
    if (logoFile) {
      try {
        const filename = `${Date.now()}-${logoFile.name}`;
        const filePath = `oni-agency-clients/${filename}`;
        
        const { error: uploadError } = await supabase.storage
          .from('oni-media')
          .upload(filePath, logoFile);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from('oni-media')
          .getPublicUrl(filePath);
          
        logoUrl = data.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    setIsUploading(false);
    
    // Prepare client data
    const clientData: ClientFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      logo_url: logoUrl,
      cnpj: formData.get('cnpj') as string || null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      cep: formData.get('cep') as string || null,
    };
    
    onSubmit(clientData);
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={client?.name}
                required
                placeholder="Digite o nome do cliente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email || ''}
                placeholder="cliente@empresa.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone || ''}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                defaultValue={client?.cnpj || ''}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Endereço e Logo</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  {logoPreview || client?.logo_url ? (
                    <AvatarImage src={logoPreview || client?.logo_url || ''} alt="Logo" />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {client?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Enviar Logo</span>
                  </div>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                defaultValue={client?.address || ''}
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                defaultValue={client?.city || ''}
                placeholder="Cidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                name="cep"
                defaultValue={client?.cep || ''}
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {client ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            client ? 'Atualizar Cliente' : 'Criar Cliente'
          )}
        </Button>
      </div>
    </form>
  );
};
