
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatPhoneNumber } from "./utils/formatPhoneNumber";
import { NovoClienteFormValues } from "./schema";

export const FormFields = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { control } = useFormContext<NovoClienteFormValues>();

  return (
    <>
      <FormField
        control={control}
        name="solicitante"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Solicitante</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do solicitante" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nome_lojista"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Lojista</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do lojista" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="telefone_proprietario"
        render={({ field: { onChange, ...restField } }) => (
          <FormItem>
            <FormLabel>Telefone do Proprietário</FormLabel>
            <FormControl>
              <Input 
                placeholder="XX XXXXX-XXXX" 
                {...restField} 
                onChange={(e) => {
                  const formattedValue = formatPhoneNumber(e.target.value);
                  e.target.value = formattedValue;
                  onChange(e);
                }}
                maxLength={14} // Comprimento máximo: XX XXXXX-XXXX
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="corredor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Corredor</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o corredor (2 caracteres)" 
                maxLength={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="numero_banca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número da Banca</FormLabel>
            <FormControl>
              <Input 
                placeholder="Digite o número da banca (até 5 caracteres)" 
                maxLength={5}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="data_inauguracao"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de Inauguração da Banca</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data de inauguração</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="observacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observação (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Digite alguma observação se necessário" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Cadastrar"}
      </Button>
    </>
  );
};
