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
      complete: (results) => {
        // Skip header row and process data rows
        const contacts = results.data.slice(1).map((row: any) => {
          // Ensure row has required data
          if (!Array.isArray(row) || row.length < 2) return null;
          
          // Get values from row
          const nome = row[0];
          const telefone = row[1];
          const email = row[2];

          // Validate required fields
          if (!nome || !telefone) return null;
          
          // Format phone number
          const phoneNumber = String(telefone).replace(/\D/g, ''); // Remove non-digits
          const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
          
          return {
            nome: nome,
            telefone: formattedPhone,
            email: email || null,
          };
        }).filter(contact => contact !== null); // Remove invalid entries

        if (contacts.length > 0) {
          onImport(contacts);
        }
      },
      header: false, // We'll handle headers manually
      skipEmptyLines: true,
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