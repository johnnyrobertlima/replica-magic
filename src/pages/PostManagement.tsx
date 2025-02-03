import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragStartEvent } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";

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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insights_social')
        .select('*')
        .is('linked_post_id', null)
        .order('created_time', { ascending: false });
      
      if (error) throw error;
      return data as Post[];
    }
  });

  const linkPostMutation = useMutation({
    mutationFn: async ({ sourceId, targetId }: { sourceId: string, targetId: string }) => {
      // First, get both posts to sum their metrics
      const { data: sourcePosts, error: sourceError } = await supabase
        .from('insights_social')
        .select('*')
        .in('id', [sourceId, targetId]);

      if (sourceError) throw sourceError;
      if (!sourcePosts || sourcePosts.length !== 2) throw new Error("Posts not found");

      const sourcePost = sourcePosts.find(p => p.id === sourceId)!;
      const targetPost = sourcePosts.find(p => p.id === targetId)!;

      // Sum the metrics
      const updatedMetrics = {
        post_impressions_organic: (sourcePost.post_impressions_organic || 0) + (targetPost.post_impressions_organic || 0),
        post_impressions_paid: (sourcePost.post_impressions_paid || 0) + (targetPost.post_impressions_paid || 0),
        views: (sourcePost.views || 0) + (targetPost.views || 0),
      };

      // Update the target post with summed metrics
      const { error: updateError } = await supabase
        .from('insights_social')
        .update(updatedMetrics)
        .eq('id', targetId);

      if (updateError) throw updateError;

      // Link the source post to the target
      const { error: linkError } = await supabase
        .from('insights_social')
        .update({ linked_post_id: targetId })
        .eq('id', sourceId);

      if (linkError) throw linkError;

      return { sourceId, targetId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Posts vinculados",
        description: "Os posts foram vinculados e os dados somados com sucesso!",
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const element = document.querySelector(`[data-id="${active.id}"]`);
    if (element) {
      element.classList.add('opacity-50');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Remove drag styling
    const element = document.querySelector(`[data-id="${active.id}"]`);
    if (element) {
      element.classList.remove('opacity-50');
    }

    if (!over || active.id === over.id) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

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
      
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                <TableHead>Posts Vinculados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow 
                  key={post.id}
                  className="cursor-move hover:bg-gray-100 transition-opacity duration-200"
                  data-id={post.id}
                  draggable="true"
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