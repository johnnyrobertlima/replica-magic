
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Post } from "./types";
import { getChannelIcon } from "./utils";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface DraggablePostRowProps {
  post: Post;
  allPosts: Post[];
}

export const DraggablePostRow = ({ post, allPosts }: DraggablePostRowProps) => {
  const {attributes, listeners, setNodeRef: setDraggableRef, isDragging} = useDraggable({
    id: post.id,
    data: post
  });

  const {setNodeRef: setDroppableRef, isOver} = useDroppable({
    id: post.id,
    data: post
  });

  const ref = (node: any) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  return (
    <TableRow 
      ref={ref}
      {...attributes}
      {...listeners}
      className={`cursor-move transition-colors duration-200
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'bg-blue-100' : 'hover:bg-gray-100'}
      `}
      data-id={post.id}
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
            {allPosts.find(p => p.id === post.linked_post_id)?.message?.substring(0, 30)}...
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};

