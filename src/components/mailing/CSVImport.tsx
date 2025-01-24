import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Papa from 'papaparse';

interface CSVImportProps {
  onImport: (contacts: any[]) => void;
}

export const CSVImport = ({ onImport }: CSVImportProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const contacts = results.data.slice(1).map((row: any) => {
          if (!row[0] || !row[1]) return null;
          
          const phoneNumber = String(row[1]);
          return {
            nome: row[0],
            telefone: phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`,
            email: row[2] || null,
          };
        }).filter(contact => contact !== null);

        onImport(contacts);
      },
      header: true,
    });
  };

  const downloadTemplate = () => {
    const template = 'Nome,Telefone,Email\nJoão Silva,11999999999,joao@email.com';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_mailing.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4 items-center">
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="max-w-xs"
      />
      <Button variant="outline" onClick={downloadTemplate}>
        <Upload className="h-4 w-4 mr-2" />
        Baixar Template
      </Button>
    </div>
  );
};