
import React, { useMemo } from "react";
import { AbcCurveChart } from "./AbcCurveChart";

interface GroupsAbcCurveProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

export const GroupsAbcCurve = ({ data, isLoading }: GroupsAbcCurveProps) => {
  return (
    <AbcCurveChart 
      data={data}
      title="Curva ABC de Grupos" 
      description="Distribuição de faturamento por grupo de produtos"
      isLoading={isLoading}
    />
  );
};
