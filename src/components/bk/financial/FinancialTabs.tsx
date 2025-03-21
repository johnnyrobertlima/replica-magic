
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface FinancialTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

export const FinancialTabs: React.FC<FinancialTabsProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 mb-4">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent 
          key={tab.id}
          value={tab.id} 
          className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
