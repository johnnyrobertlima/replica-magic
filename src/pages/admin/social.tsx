import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Loader2, 
  Plus,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Twitch,
  Share2,
  Mail,
  Phone,
  MapPin,
  Rss,
  Globe
} from "lucide-react";
import { ActionButtons } from "@/components/admin/ActionButtons";

interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
}

export const AdminSocial = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialMedia | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialMedia, isLoading } = useQuery({
    queryKey: ["social-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SocialMedia[];
    },
  });

  const createSocialMedia = useMutation({
    mutationFn: async (formData: FormData) => {
      const socialMediaData = {
        platform: String(formData.get("platform")),
        url: String(formData.get("url")),
        icon: String(formData.get("icon")),
      };

      const { error } = await supabase.from("social_media").insert([socialMediaData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      setIsCreating(false);
      toast({ title: "Rede social criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar rede social",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSocialMedia = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("social_media")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      toast({ title: "Rede social atualizada com sucesso!" });
    },
  });

  const deleteSocialMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      toast({ title: "Rede social excluída com sucesso!" });
    },
  });

  const handleEdit = (social: SocialMedia) => {
    setEditingSocial(social);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (editingSocial) {
      const updatedData = {
        platform: String(formData.get("platform")),
        url: String(formData.get("url")),
        icon: String(formData.get("icon")),
      };

      const { error } = await supabase
        .from("social_media")
        .update(updatedData)
        .eq("id", editingSocial.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["social-media"] });
      setIsCreating(false);
      setEditingSocial(null);
      toast({ title: "Rede social atualizada com sucesso!" });
    } else {
      createSocialMedia.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const socialIcons = [
    { name: "Facebook", icon: <Facebook className="w-4 h-4" /> },
    { name: "Twitter", icon: <Twitter className="w-4 h-4" /> },
    { name: "Instagram", icon: <Instagram className="w-4 h-4" /> },
    { name: "LinkedIn", icon: <Linkedin className="w-4 h-4" /> },
    { name: "YouTube", icon: <Youtube className="w-4 h-4" /> },
    { name: "GitHub", icon: <Github className="w-4 h-4" /> },
    { name: "Twitch", icon: <Twitch className="w-4 h-4" /> },
    { name: "Share", icon: <Share2 className="w-4 h-4" /> },
    { name: "Email", icon: <Mail className="w-4 h-4" /> },
    { name: "Phone", icon: <Phone className="w-4 h-4" /> },
    { name: "Location", icon: <MapPin className="w-4 h-4" /> },
    { name: "RSS", icon: <Rss className="w-4 h-4" /> },
    { name: "Website", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Redes Sociais</h1>
        <Button onClick={() => {
          setEditingSocial(null);
          setIsCreating(!isCreating);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rede Social
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma</label>
              <Input 
                name="platform" 
                required 
                defaultValue={editingSocial?.platform}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input 
                name="url" 
                type="url" 
                required 
                defaultValue={editingSocial?.url}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ícone</label>
              <Select name="icon" required defaultValue={editingSocial?.icon}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {socialIcons.map((icon) => (
                    <SelectItem key={icon.name} value={icon.name}>
                      <div className="flex items-center gap-2">
                        {icon.icon}
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingSocial(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingSocial ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plataforma</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {socialMedia?.map((social) => (
            <TableRow key={social.id}>
              <TableCell>{social.platform}</TableCell>
              <TableCell>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {social.url}
                </a>
              </TableCell>
              <TableCell>
                {social.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={social.is_active}
                  onToggle={() => toggleSocialMedia.mutate({
                    id: social.id,
                    is_active: social.is_active,
                  })}
                  onEdit={() => handleEdit(social)}
                  onDelete={() => deleteSocialMedia.mutate(social.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
