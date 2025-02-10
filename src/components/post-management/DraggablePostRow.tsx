
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Post } from "./types";
import { getChannelIcon } from "./utils";

interface DraggablePostRowProps {
  post: Post;
  allPosts: Post[];
}

export const DraggablePostRow = ({ post, allPosts }: DraggablePostRowProps) => {
  return (
    <TableRow 
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
            {allPosts.find(p => p.id === post.linked_post_id)?.message?.substring(0, 30)}...
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};
