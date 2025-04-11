
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { OniAgenciaCollaborator, CollaboratorFormData } from "@/types/oni-agencia";

interface CollaboratorFormProps {
  onSubmit: (data: CollaboratorFormData) => Promise<void>;
  collaborator?: OniAgenciaCollaborator;
  isSubmitting: boolean;
}

export function CollaboratorForm({ 
  onSubmit, 
  collaborator, 
  isSubmitting 
}: CollaboratorFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(collaborator?.photo_url || null);

  const form = useForm<CollaboratorFormData>({
    defaultValues: {
      name: collaborator?.name || "",
      email: collaborator?.email || "",
      phone: collaborator?.phone || "",
      photo_url: collaborator?.photo_url || null,
    }
  });

  // Reset form when collaborator changes
  useEffect(() => {
    console.log("CollaboratorForm received collaborator:", collaborator);
    if (collaborator) {
      form.reset({
        name: collaborator.name || "",
        email: collaborator.email || "",
        phone: collaborator.phone || "",
        photo_url: collaborator.photo_url || null,
      });
      setPhotoUrl(collaborator.photo_url);
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        photo_url: null,
      });
      setPhotoUrl(null);
    }
  }, [collaborator, form]);

  const handleSubmit = async (data: CollaboratorFormData) => {
    // If there's a new photo file, we'd need to upload it first
    // This is just a placeholder for that logic
    // In a real app, you'd upload the file to Supabase storage
    // and get the URL to store in the database
    
    if (photoFile) {
      // This would be where you'd upload the file and get the URL
      // For now, we'll just use the current URL or null
      data.photo_url = photoUrl;
    }
    
    console.log("Submitting form data:", data);
    await onSubmit(data);
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    
    // If we have a file, create a preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Colaborador*</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do colaborador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormLabel>Foto do Colaborador</FormLabel>
            <ImageUpload
              name="photo"
              currentImage={photoUrl || undefined}
              onChange={handlePhotoChange}
              bucket="oni-collaborators"
              accept="image/jpeg,image/png,image/webp"
            />

            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {collaborator ? 'Atualizando...' : 'Salvando...'}
                  </>
                ) : (
                  collaborator ? 'Atualizar Colaborador' : 'Salvar Colaborador'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
