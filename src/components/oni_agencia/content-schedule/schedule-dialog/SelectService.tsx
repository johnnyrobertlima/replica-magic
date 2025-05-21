
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectServiceProps {
  clientId: string;
  value: string;
  onChange: (value: string) => void;
}

export function SelectService({ 
  clientId, 
  value, 
  onChange 
}: SelectServiceProps) {
  // Fetch client services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['client-services', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      // First fetch client scopes to get available services for this client
      const { data: scopes, error: scopesError } = await supabase
        .from('oni_agencia_client_scopes')
        .select('service_id')
        .eq('client_id', clientId);
        
      if (scopesError) {
        console.error('Error fetching client scopes:', scopesError);
        throw scopesError;
      }
      
      if (!scopes || scopes.length === 0) return [];
      
      // Then fetch the services details
      const serviceIds = scopes.map(scope => scope.service_id);
      
      const { data: services, error: servicesError } = await supabase
        .from('oni_agencia_services')
        .select('*')
        .in('id', serviceIds)
        .order('name');
        
      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }
      
      return services || [];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="grid gap-2">
      <Label htmlFor="service_id" className="flex items-center">
        Serviço*
        {!value && (
          <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
        )}
      </Label>
      <Select
        disabled={isLoading || !clientId}
        value={value || ""}
        onValueChange={onChange}
        data-testid="service-select"
      >
        <SelectTrigger className={`w-full bg-white ${!value ? "border-red-300" : ""}`}>
          <SelectValue placeholder="Selecione um serviço" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            {!clientId && <SelectItem value="" disabled>Selecione um cliente primeiro</SelectItem>}
            {clientId && services.length === 0 && !isLoading && (
              <SelectItem value="" disabled>Nenhum serviço disponível</SelectItem>
            )}
            {isLoading && <SelectItem value="" disabled>Carregando...</SelectItem>}
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
