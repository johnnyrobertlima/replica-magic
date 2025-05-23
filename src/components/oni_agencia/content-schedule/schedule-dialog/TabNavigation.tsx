
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabNavigationProps {
  activeTab: string;
  currentSelectedEvent: any;
  onTabChange: (value: string) => void;
}

export function TabNavigation({ activeTab, currentSelectedEvent, onTabChange }: TabNavigationProps) {
  return (
    <TabsList className="grid grid-cols-4 mb-4">
      <TabsTrigger value="details">Detalhes</TabsTrigger>
      <TabsTrigger value="status" disabled={!currentSelectedEvent}>Status</TabsTrigger>
      <TabsTrigger value="history" disabled={!currentSelectedEvent}>Histórico</TabsTrigger>
      <TabsTrigger value="capture">Captura</TabsTrigger>
    </TabsList>
  );
}
