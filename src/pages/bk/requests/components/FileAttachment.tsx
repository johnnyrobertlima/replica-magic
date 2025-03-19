
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { validateImage } from "@/utils/imageUtils";
import { UseFormReturn } from "react-hook-form";
import { RequestFormValues } from "../schema";

interface FileAttachmentProps {
  form: UseFormReturn<RequestFormValues>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

export function FileAttachment({ form, selectedFile, setSelectedFile }: FileAttachmentProps) {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      try {
        validateImage(file);
        setSelectedFile(file);
      } catch (error: any) {
        toast({
          title: "Erro ao selecionar arquivo",
          description: error.message || "Verifique o tipo e tamanho do arquivo",
          variant: "destructive",
        });
        e.target.value = '';
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <FormField
      control={form.control}
      name="attachment"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Anexar Documento (opcional)</FormLabel>
          <FormControl>
            <div className="flex flex-col space-y-2">
              <Input
                type="file"
                onChange={(e) => {
                  handleFileChange(e);
                  field.onChange(e);
                }}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
          </FormControl>
          <FormDescription>
            Tamanho máximo: 5MB. Formatos: PDF, DOCX, XLSX, PNG, JPG
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
