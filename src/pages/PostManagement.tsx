
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragStartEvent } from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostTable } from "@/components/post-management/PostTable";
import { usePostManagement } from "@/components/post-management/usePostManagement";

const PostManagement = () => {
  const { posts, isLoading, linkPostMutation } = usePostManagement();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para facilitar o início do drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Reduzido o delay para melhor resposta
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

    linkPostMutation.mutate({ sourceId, targetId });
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
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="h-[600px] rounded-md border">
          <PostTable posts={posts || []} />
        </ScrollArea>
      </DndContext>
    </main>
  );
};

export default PostManagement;

