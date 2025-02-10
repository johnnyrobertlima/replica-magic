
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "./types";

export const usePostManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    posts,
    isLoading,
    linkPostMutation
  };
};
