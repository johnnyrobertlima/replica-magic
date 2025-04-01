
import { useState, useEffect } from 'react';
import { reportsService } from '@/services/bluebay/reportsService';
import { EstoqueItem } from '@/types/bk/estoque';
import { toast } from '@/hooks/use-toast';

export const useReports = () => {
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await reportsService.getReportItems();
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Falha ao carregar os itens do relatório');
        toast({
          title: 'Erro',
          description: 'Falha ao carregar os dados de relatório',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
};
