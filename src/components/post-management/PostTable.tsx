
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Post } from "./types";
import { DraggablePostRow } from "./DraggablePostRow";

interface PostTableProps {
  posts: Post[];
}

export const PostTable = ({ posts }: PostTableProps) => {
  return (
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
          <DraggablePostRow key={post.id} post={post} allPosts={posts} />
        ))}
      </TableBody>
    </Table>
  );
};
