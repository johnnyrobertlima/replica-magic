
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS } from "../types";
import { UseFormReturn } from "react-hook-form";
import { RequestFormValues } from "../schema";
import { FileAttachment } from "./FileAttachment";

interface RequestFormFieldsProps {
  form: UseFormReturn<RequestFormValues>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

export function RequestFormFields({ form, selectedFile, setSelectedFile }: RequestFormFieldsProps) {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input placeholder="Resumo da sua solicitação" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meu Departamento</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição Detalhada</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Detalhe sua solicitação aqui..."
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FileAttachment 
        form={form} 
        selectedFile={selectedFile} 
        setSelectedFile={setSelectedFile} 
      />
    </div>
  );
}
