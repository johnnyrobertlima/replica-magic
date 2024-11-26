import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ClientFormData = {
  name: string;
  logo_url: string;
};

export const ClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<ClientFormData>();

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("clients").insert(data);
      
      if (error) throw error;
      
      toast.success("Client created successfully!");
      reset();
    } catch (error) {
      toast.error("Error creating client", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name", { required: true })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input id="logo_url" {...register("logo_url", { required: true })} />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Client"}
      </Button>
    </form>
  );
};