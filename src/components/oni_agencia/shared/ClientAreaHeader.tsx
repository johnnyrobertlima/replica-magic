
import React from 'react';

interface ClientAreaHeaderProps {
  title: string;
  description?: string;
}

export const ClientAreaHeader: React.FC<ClientAreaHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};
