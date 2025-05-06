
import React from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "../../status-badge/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EventCardProps {
  event: CalendarEvent;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <Card 
      key={event.id}
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div 
        className="h-1.5 w-full" 
        style={{ backgroundColor: event.service?.color }}
      />
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm">{event.title || "Sem título"}</span>
          <div className="flex items-center gap-2">
            {event.client && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-blue-300">
                {event.client.name || "Cliente não informado"}
              </Badge>
            )}
            <StatusBadge 
              status={event.status} 
              className="text-xs px-1.5 py-0.5"
            />
          </div>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <span className="mr-2">{event.service?.name}</span>
          {event.editorial_line && (
            <>
              <span className="mx-1">•</span>
              <span>{event.editorial_line.name}</span>
            </>
          )}
        </div>
        
        {event.description && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description" className="border-none">
              <AccordionTrigger className="py-1 text-xs">
                Descrição
              </AccordionTrigger>
              <AccordionContent className="text-xs">
                {event.description}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {event.collaborator && (
          <div className="flex items-center mt-2">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage 
                src={event.collaborator.photo_url || ''} 
                alt={event.collaborator.name} 
              />
              <AvatarFallback className="text-[10px]">
                {event.collaborator.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{event.collaborator.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
