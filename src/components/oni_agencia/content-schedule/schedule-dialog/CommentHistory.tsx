
import React from "react";
import { Label } from "@/components/ui/label";
import { linkifyText } from "@/utils/linkUtils";

interface CommentHistoryProps {
  description: string;
}

export function CommentHistory({ description }: CommentHistoryProps) {
  if (!description) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="description" className="text-base font-medium">
        Histórico de Descrição
      </Label>
      <div 
        className="rounded-md border border-input bg-background p-3 text-sm text-muted-foreground h-[150px] overflow-y-auto whitespace-pre-wrap mb-2"
        dangerouslySetInnerHTML={{ __html: linkifyText(description) }}
      />
    </div>
  );
}
