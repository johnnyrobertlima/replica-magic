
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface FinancialTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: FinancialTab[];
}

export const FinancialTabs: React.FC<FinancialTabsProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-4">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
