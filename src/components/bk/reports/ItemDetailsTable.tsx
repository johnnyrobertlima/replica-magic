
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";

interface ItemDetailRow {
  NOTA: string;
  DATA_EMISSAO: string;
  CLIENTE_NOME: string;
  PES_CODIGO: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
  FATOR_CORRECAO?: number | null;
}

interface ItemDetailsTableProps {
  itemDetails: ItemDetailRow[];
  isLoadingDetails: boolean;
}

export const ItemDetailsTable = ({ itemDetails, isLoadingDetails }: ItemDetailsTableProps) => {
  if (isLoadingDetails) {
    return (
      <div className="py-4 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota Fiscal</TableHead>
            <TableHead>Data de Emissão</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Valor Unit.</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemDetails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                Nenhum detalhe encontrado para este item
              </TableCell>
            </TableRow>
          ) : (
            itemDetails.map((detail, index) => {
              const valorTotal = (detail.QUANTIDADE || 0) * (detail.VALOR_UNITARIO || 0);
              // Determine if correction factor was applied
              const isCorrectionApplied = detail.FATOR_CORRECAO && detail.FATOR_CORRECAO > 0;
              
              return (
                <TableRow key={`${detail.NOTA}-${detail.PES_CODIGO}-${index}`}>
                  <TableCell>{detail.NOTA || '-'}</TableCell>
                  <TableCell>
                    {detail.DATA_EMISSAO 
                      ? new Date(detail.DATA_EMISSAO).toLocaleDateString('pt-BR') 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {detail.CLIENTE_NOME || '-'} 
                    {detail.PES_CODIGO && (
                      <span className="ml-1 text-sm text-muted-foreground">
                        (Cód: {detail.PES_CODIGO})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{detail.QUANTIDADE || 0}</TableCell>
                  <TableCell className={`text-right ${isCorrectionApplied ? 'text-blue-500 font-medium' : ''}`}>
                    {detail.VALOR_UNITARIO ? formatCurrency(detail.VALOR_UNITARIO) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(valorTotal)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
