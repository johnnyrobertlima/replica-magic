import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MailingSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function MailingSelectField({ value, onChange }: MailingSelectFieldProps) {
  const { data: mailings } = useQuery({
    queryKey: ['mailings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailing')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div>
      <Label htmlFor="mailing">Mailing</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Selecione um mailing" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {mailings?.map((mailing) => (
            <SelectItem key={mailing.id} value={mailing.id}>
              {mailing.nome_mailing}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}