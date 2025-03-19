
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requestSchema, RequestFormValues } from "./schema";
import { RequestFormFields } from "./components/RequestFormFields";
import { useRequestSubmission } from "./hooks/useRequestSubmission";

interface RequestFormProps {
  onRequestSubmitted: () => void;
}

export default function RequestForm({ onRequestSubmitted }: RequestFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isSubmitting, submitRequest } = useRequestSubmission(onRequestSubmitted);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      department: "",
      description: "",
    },
  });

  const onSubmit = async (values: RequestFormValues) => {
    const success = await submitRequest(values, selectedFile);
    if (success) {
      form.reset();
      setSelectedFile(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Nova Solicitação</CardTitle>
        <CardDescription>
          Preencha o formulário para abrir uma nova solicitação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <RequestFormFields 
              form={form} 
              selectedFile={selectedFile} 
              setSelectedFile={setSelectedFile} 
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
