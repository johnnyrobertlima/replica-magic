
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  path: string;
}

export const ServiceCard = ({ title, description, icon: Icon, iconColor, path }: ServiceCardProps) => {
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className={`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center mb-2`}>
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>Visualize dados detalhados e gráficos de desempenho para tomada de decisões.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to={path}>Acessar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
