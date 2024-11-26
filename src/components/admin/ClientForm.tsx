import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "./ImageUpload";
import { Trash2 } from "lucide-react";
import { SiteOniTables } from "@/integrations/supabase/types";

type ClientFormData = SiteOniTables['clients']['Insert'];

export const ClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const { register, handleSubmit, reset, setValue } = useForm<ClientFormData>();

  const fetchClients = async () => {
    const { data, error } = await supabase.from("site_oni.clients").select("*");
    if (error) {
      toast.error("Error fetching clients");
    } else {
      setClients(data);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("site_oni.clients").insert(data);
      
      if (error) throw error;
      
      toast.success("Client created successfully!");
      reset();
      fetchClients();
    } catch (error) {
      toast.error("Error creating client", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("site_oni.clients").delete().eq("id", id);
      
      if (error) throw error;
      
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error) {
      toast.error("Error deleting client");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload onImageUploaded={(url) => setValue("logo_url", url)} />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Client"}
        </Button>
      </form>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Existing Clients</h3>
        <div className="grid gap-4">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div className="flex items-center gap-4">
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="w-12 h-12 object-contain"
                />
                <h4 className="font-medium">{client.name}</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(client.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
