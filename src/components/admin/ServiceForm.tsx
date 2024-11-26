import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { SiteOniTables } from "@/integrations/supabase/types";

type ServiceFormData = SiteOniTables['services']['Insert'];

export const ServiceForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<SiteOniTables['services']['Row'][]>([]);
  const { register, handleSubmit, reset } = useForm<ServiceFormData>();

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .schema("site_oni");
    if (error) {
      toast.error("Error fetching services");
    } else {
      setServices(data || []);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("services")
        .insert(data)
        .schema("site_oni");
      
      if (error) throw error;
      
      toast.success("Service created successfully!");
      reset();
      fetchServices();
    } catch (error) {
      toast.error("Error creating service", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .schema("site_oni");
      
      if (error) throw error;
      
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      toast.error("Error deleting service");
    }
  };

  return (
    <div className="space-y-8">
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
          <Label>Icon</Label>
          <div className="grid grid-cols-6 gap-2 p-2 border rounded-md">
            {Object.keys(Icons).map((iconName) => {
              const IconComponent = (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.HelpCircle;
              return (
                <Button
                  key={iconName}
                  type="button"
                  variant="ghost"
                  className="p-2"
                  onClick={() => register("icon").onChange(iconName)}
                >
                  <IconComponent className="w-6 h-6" />
                </Button>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Service"}
        </Button>
      </form>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Existing Services</h3>
        <div className="grid gap-4">
          {services.map((service) => {
            const IconComponent = (Icons[service.icon as keyof typeof Icons] as LucideIcon) || Icons.HelpCircle;
            return (
              <div key={service.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                <div className="flex items-center gap-4">
                  <IconComponent className="w-6 h-6" />
                  <div>
                    <h4 className="font-medium">{service.title}</h4>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};