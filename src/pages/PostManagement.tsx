
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
          <PostTable posts={posts || []} />
        </ScrollArea>
      </DndContext>
    </main>
  );
};

export default PostManagement;
