import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus } from "lucide-react";
import { SeoForm, FormValues } from "@/components/admin/seo/SeoForm";
import { SeoList, SeoSettingsRow } from "@/components/admin/seo/SeoList";

export const AdminSEO = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SeoSettingsRow[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        page_path: values.page_path,
        title: values.title,
        description: values.description,
        keywords: values.keywords,
        og_image: values.og_image || null,
        favicon_url: values.favicon_url || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("seo_settings")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seo_settings").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast({ title: `SEO settings ${editingId ? "updated" : "created"} successfully!` });
      handleCancel();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving SEO settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seo_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast({ title: "SEO settings deleted successfully!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting SEO settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (setting: SeoSettingsRow) => {
    setEditingId(setting.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SEO Settings</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add SEO Settings
          </Button>
        )}
      </div>

      {showForm ? (
        <SeoForm
          initialValues={
            editingId
              ? settings?.find((s) => s.id === editingId)
              : undefined
          }
          onSubmit={(values) => mutation.mutate(values)}
          isSubmitting={mutation.isPending}
          onCancel={handleCancel}
        />
      ) : (
        <div className="space-y-4">
          {settings && settings.length > 0 ? (
            <SeoList
              settings={settings}
              onEdit={handleEdit}
              onDelete={(id) => {
                const setting = settings.find((s) => s.id === id);
                if (!setting) return;

                const dialog = document.createElement("div");
                dialog.innerHTML = `
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the SEO settings for "${setting.page_path}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                `;
              }}
            />
          ) : (
            <p className="text-center text-muted-foreground">
              No SEO settings found. Click the button above to add one.
            </p>
          )}
        </div>
      )}
    </div>
  );
};