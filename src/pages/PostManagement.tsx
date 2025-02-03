import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useToast } from "@/components/ui/use-toast";

interface Post {
  id: string;
  created_time: string;
  post_impressions_organic: number;
  post_impressions_paid: number;
  views: number;
  canal: string;
  message: string;
  permalink_url: string;
  linked_post_id: string | null;
}

const PostManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insights_social')
        .select('*')
        .order('created_time', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    }
  });

  const linkPostMutation = useMutation({
    mutationFn: async ({ sourceId, targetId }: { sourceId: string, targetId: string }) => {
      const { error } = await supabase
        .from('insights_social')
        .update({ linked_post_id: targetId })
        .eq('id', sourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Posts vinculados",
        description: "Os posts foram vinculados com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error linking posts:', error);
      toast({
        title: "Erro ao vincular posts",
        description: "Ocorreu um erro ao tentar vincular os posts.",
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

    if (sourceId === targetId) return;

    linkPostMutation.mutate({ sourceId, targetId });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📸';
      case 'ad':
        return '📢';
      default:
        return '📱';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestão de Posts</h1>
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead className="text-right">Impressões Orgânicas</TableHead>
                <TableHead className="text-right">Impressões Pagas</TableHead>
                <TableHead className="text-right">Visualizações</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Vinculado a</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow 
                  key={post.id}
                  className="cursor-move hover:bg-gray-100"
                  data-id={post.id}
                  draggable
                >
                  <TableCell>{getChannelIcon(post.canal)} {post.canal}</TableCell>
                  <TableCell>
                    {post.created_time ? format(new Date(post.created_time), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                  <TableCell className="max-w-md truncate">{post.message}</TableCell>
                  <TableCell className="text-right">{post.post_impressions_organic?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="text-right">{post.post_impressions_paid?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="text-right">{post.views?.toLocaleString() || '0'}</TableCell>
                  <TableCell>
                    {post.permalink_url && (
                      <a 
                        href={post.permalink_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver Post
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {post.linked_post_id && (
                      <span className="text-sm text-gray-600">
                        {posts.find(p => p.id === post.linked_post_id)?.message?.substring(0, 30)}...
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DndContext>
    </main>
  );
};

export default PostManagement;