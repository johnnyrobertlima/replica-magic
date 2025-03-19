
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RequestFormValues } from "../schema";
import { RequestStatus } from "../types";

export function useRequestSubmission(onRequestSubmitted: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRequest = async (values: RequestFormValues, selectedFile: File | null) => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para enviar uma solicitação.",
          variant: "destructive",
        });
        return false;
      }
      
      // Generate protocol number: BK-YYYY-NNNNN
      const protocolNumber = `BK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      let attachmentUrl = null;
      
      // Upload file if there is one
      if (selectedFile) {
        try {
          // Upload directly to the existing bucket
          const fileExt = selectedFile.name.split('.').pop();
          const userId = session.user.id;
          const filePath = `${userId}/${protocolNumber}/${Math.random()}.${fileExt}`;
          
          console.log("Attempting to upload file to path:", filePath);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('request_attachments')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error("File upload error:", uploadError);
            toast({
              title: "Erro ao enviar arquivo",
              description: "Não foi possível enviar o anexo, mas sua solicitação será processada.",
              variant: "default",
            });
          } else {
            console.log("Upload successful:", uploadData);
            // Store just the relative path - will use getStorageUrl when retrieving
            attachmentUrl = filePath;
          }
        } catch (fileError: any) {
          console.error("File upload error:", fileError);
          toast({
            title: "Erro ao enviar arquivo",
            description: "Não foi possível enviar o anexo, mas sua solicitação será processada.",
            variant: "default",
          });
        }
      }
      
      // Use our secure function to insert the request
      const { data, error } = await supabase.rpc('add_user_request', {
        protocol: protocolNumber,
        title: values.title,
        department: values.department,
        description: values.description,
        status: 'Aberto' as RequestStatus,
        user_id: session.user.id,
        user_email: session.user.email,
        attachment_url: attachmentUrl
      });
      
      if (error) {
        // Handle infinite recursion error specifically
        if (error.code === '42P17') {
          throw new Error("Erro de política de segurança. Contate o suporte técnico.");
        }
        throw error;
      }
      
      // Reload requests list
      onRequestSubmitted();
      
      toast({
        title: "Solicitação enviada com sucesso",
        description: `Protocolo gerado: ${protocolNumber}`,
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message || "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitRequest
  };
}
