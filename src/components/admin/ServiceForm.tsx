import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ServiceFormData = {
  title: string;
  description: string;
  icon: string;
};

export const ServiceForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<ServiceFormData>();

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("services").insert(data);
      
      if (error) throw error;
      
      toast.success("Service created successfully!");
      reset();
    } catch (error) {
      toast.error("Error creating service", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: true })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description", { required: true })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" {...register("icon", { required: true })} />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Service"}
      </Button>
    </form>
  );
};