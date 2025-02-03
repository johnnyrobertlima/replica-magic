import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InsightsTableProps {
  insights: Array<{
    Canal: string | null;
    Cliente: string | null;
    post_impressions_organic: number | null;
    post_impressions_paid: number | null;
    reach: number | null;
    total_interactions: number | null;
    created_time: string | null;
  }>;
}

export const InsightsTable = ({ insights }: InsightsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Canal</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Impressões</TableHead>
          <TableHead>Alcance</TableHead>
          <TableHead>Engajamento</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {insights?.map((insight, index) => (
          <TableRow key={index}>
            <TableCell>{insight.Canal || '-'}</TableCell>
            <TableCell>{insight.Cliente || '-'}</TableCell>
            <TableCell>
              {((insight.post_impressions_organic || 0) + (insight.post_impressions_paid || 0)).toLocaleString()}
            </TableCell>
            <TableCell>{insight.reach?.toLocaleString() || '0'}</TableCell>
            <TableCell>{insight.total_interactions?.toLocaleString() || '0'}</TableCell>
            <TableCell>
              {insight.created_time ? new Date(insight.created_time).toLocaleDateString() : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};