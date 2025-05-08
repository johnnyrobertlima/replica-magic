import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator, OniAgenciaClient } from "@/types/oni-agencia";
import { NewEventForm } from "./NewEventForm";
import { EditEventForm } from "./EditEventForm";
import { OniAgenciaService as Service } from "@/types/oni-agencia";
import { OniAgenciaCollaborator as Collaborator } from "@/types/oni-agencia";
import { OniAgenciaClient as Client } from "@/types/oni-agencia";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date | undefined;
  events: any[];
  onClose: () => void;
  selectedEvent: any;
  onManualRefetch?: () => void;
}

export function ScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose,
  selectedEvent,
  onManualRefetch
}: ScheduleEventDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    date: selectedDate || new Date(),
    title: "",
    description: "",
    service_id: "",
    collaborator_id: "",
    editorial_line_id: null,
    product_id: null,
    status_id: "",
    creators: [],
  });
  const [services, setServices] = useState<Service[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [editorialLines, setEditorialLines] = useState<EditorialLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
  const [isLoadingEditorialLines, setIsLoadingEditorialLines] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch services
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const response = await fetch(`/api/oni-agencia/services?clientId=${clientId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar serviços",
          description: "Ocorreu um erro ao carregar a lista de serviços.",
          variant: "destructive",
        });
        console.error("Erro ao carregar serviços:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    // Fetch collaborators
    const fetchCollaborators = async () => {
      setIsLoadingCollaborators(true);
      try {
        const response = await fetch(`/api/oni-agencia/collaborators?clientId=${clientId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCollaborators(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar colaboradores",
          description: "Ocorreu um erro ao carregar a lista de colaboradores.",
          variant: "destructive",
        });
        console.error("Erro ao carregar colaboradores:", error);
      } finally {
        setIsLoadingCollaborators(false);
      }
    };

    // Fetch editorial lines
    const fetchEditorialLines = async () => {
      setIsLoadingEditorialLines(true);
      try {
        const response = await fetch(`/api/admin/editorial-lines`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEditorialLines(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar linhas editoriais",
          description: "Ocorreu um erro ao carregar a lista de linhas editoriais.",
          variant: "destructive",
        });
        console.error("Erro ao carregar linhas editoriais:", error);
      } finally {
        setIsLoadingEditorialLines(false);
      }
    };

    // Fetch products
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch(`/api/admin/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: "Ocorreu um erro ao carregar a lista de produtos.",
          variant: "destructive",
        });
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    // Fetch statuses
    const fetchStatuses = async () => {
      setIsLoadingStatuses(true);
      try {
        const response = await fetch(`/api/admin/statuses`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStatuses(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar status",
          description: "Ocorreu um erro ao carregar a lista de status.",
          variant: "destructive",
        });
        console.error("Erro ao carregar status:", error);
      } finally {
        setIsLoadingStatuses(false);
      }
    };

    // Fetch clients
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const response = await fetch(`/api/oni-agencia/clients`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar clientes",
          description: "Ocorreu um erro ao carregar a lista de clientes.",
          variant: "destructive",
        });
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchServices();
    fetchCollaborators();
    fetchEditorialLines();
    fetchProducts();
    fetchStatuses();
    fetchClients();
  }, [clientId, toast]);

  useEffect(() => {
    if (selectedEvent) {
      setActiveTab("edit");
      setFormData({
        id: selectedEvent.id,
        client_id: selectedEvent.client_id,
        date: new Date(selectedEvent.date),
        title: selectedEvent.title,
        description: selectedEvent.description,
        service_id: selectedEvent.service_id,
        collaborator_id: selectedEvent.collaborator_id,
        editorial_line_id: selectedEvent.editorial_line_id || null,
        product_id: selectedEvent.product_id || null,
        status_id: selectedEvent.status_id,
        creators: selectedEvent.creators || [],
      });
    } else {
      setActiveTab("info");
      setFormData({
        client_id: clientId,
        date: selectedDate || new Date(),
        title: "",
        description: "",
        service_id: "",
        collaborator_id: "",
        editorial_line_id: null,
        product_id: null,
        status_id: "",
        creators: [],
      });
    }
  }, [selectedEvent, clientId, selectedDate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        date: formData.date ? formData.date.toISOString() : new Date().toISOString(),
      };

      const method = selectedEvent ? "PUT" : "POST";
      const url = selectedEvent
        ? `/api/oni-agencia/events/${selectedEvent.id}`
        : `/api/oni-agencia/events`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: selectedEvent ? "Pauta atualizada" : "Pauta criada",
        description: selectedEvent
          ? "Pauta atualizada com sucesso."
          : "Pauta criada com sucesso.",
      });
      onManualRefetch && onManualRefetch();
      handleClose();
    } catch (error) {
      toast({
        title: `Erro ao ${selectedEvent ? "atualizar" : "criar"} pauta`,
        description: `Ocorreu um erro ao ${
          selectedEvent ? "atualizar" : "criar"
        } a pauta.`,
        variant: "destructive",
      });
      console.error(`Erro ao ${selectedEvent ? "atualizar" : "criar"} pauta:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      if (!selectedEvent) {
        throw new Error("Nenhum evento selecionado para deletar.");
      }

      const response = await fetch(`/api/oni-agencia/events/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Pauta excluída",
        description: "Pauta excluída com sucesso.",
      });
      onManualRefetch && onManualRefetch();
      handleClose();
    } catch (error) {
      toast({
        title: "Erro ao excluir pauta",
        description: "Ocorreu um erro ao excluir a pauta.",
        variant: "destructive",
      });
      console.error("Erro ao excluir pauta:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "null" ? null : value,
    }));
  };

  const onDateChange = (name: string, value: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = async (): Promise<void> => {
    setActiveTab('info');
    onClose();
    return Promise.resolve();
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{selectedEvent ? "Editar Pauta" : "Nova Pauta"}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          {selectedDate ? selectedDate.toLocaleDateString() : "Selecione uma data"}
        </p>
      </DialogHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          {selectedEvent && <TabsTrigger value="edit">Editar</TabsTrigger>}
        </TabsList>
        <TabsContent value="info" className="space-y-4">
          <NewEventForm
            formData={formData}
            services={services}
            collaborators={collaborators}
            editorialLines={editorialLines}
            products={products}
            statuses={statuses}
            clients={clients}
            isLoadingServices={isLoadingServices}
            isLoadingCollaborators={isLoadingCollaborators}
            isLoadingEditorialLines={isLoadingEditorialLines}
            isLoadingProducts={isLoadingProducts}
            isLoadingStatuses={isLoadingStatuses}
            isLoadingClients={isLoadingClients}
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            onSubmit={onSubmit}
            onCancel={handleClose}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onDateChange={onDateChange}
          />
        </TabsContent>
        {selectedEvent && (
          <TabsContent value="edit" className="space-y-4">
            <EditEventForm
              formData={formData}
              services={services}
              collaborators={collaborators}
              editorialLines={editorialLines}
              products={products}
              statuses={statuses}
              clients={clients}
              isLoadingServices={isLoadingServices}
              isLoadingCollaborators={isLoadingCollaborators}
              isLoadingEditorialLines={isLoadingEditorialLines}
              isLoadingProducts={isLoadingProducts}
              isLoadingStatuses={isLoadingStatuses}
              isLoadingClients={isLoadingClients}
              isSubmitting={isSubmitting}
              isDeleting={isDeleting}
              onSubmit={onSubmit}
              onDelete={onDelete}
              onCancel={handleClose}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              onDateChange={onDateChange}
            />
          </TabsContent>
        )}
      </Tabs>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
