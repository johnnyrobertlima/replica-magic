
import React, { useMemo } from "react";
import { AbcCurveChart } from "./AbcCurveChart";

interface ItemsAbcCurveProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export const ItemsAbcCurve = ({ data, isLoading }: ItemsAbcCurveProps) => {
  return (
    <AbcCurveChart 
      data={data}
      title="Curva ABC de Itens" 
      description="Distribuição de faturamento por item"
      isLoading={isLoading}
    />
  );
};
