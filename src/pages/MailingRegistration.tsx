import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ContactRegistrationDialog } from "@/components/mailing/ContactRegistrationDialog";
import { MailingForm } from "@/components/mailing/MailingForm";
import { MailingList } from "@/components/mailing/MailingList";

const MailingRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMailing, setSelectedMailing] = useState<{ id: string; nome: string } | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Você precisa estar logado para acessar esta página",
        });
        navigate("/admin/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const { data: mailings, isLoading, refetch } = useQuery({
    queryKey: ['mailings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailing')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cadastro de Mailing</h1>
        
        <div className="mb-8">
          <MailingForm onSuccess={refetch} session={session} />
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/client-area")}>
              Voltar
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Lista de Mailings</h2>
          <MailingList
            mailings={mailings}
            isLoading={isLoading}
            onContactsClick={setSelectedMailing}
            onRefetch={refetch}
            session={session}
          />
        </div>
      </div>

      <ContactRegistrationDialog
        mailingId={selectedMailing?.id || ''}
        mailingName={selectedMailing?.nome || ''}
        isOpen={!!selectedMailing}
        onClose={() => setSelectedMailing(null)}
      />
    </main>
  );
};

export default MailingRegistration;