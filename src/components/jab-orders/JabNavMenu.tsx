
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const JabNavMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isActive("/client-area/jab/jab-orders") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/jab/jab-orders">Consultar Pedidos</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/jab/jab-orders-by-client") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/jab/jab-orders-by-client">Pedidos por Cliente</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/jab/jab-orders-by-representante") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/jab/jab-orders-by-representante">Separação por Representante</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/jab/aprovacao-financeira") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/jab/aprovacao-financeira">Aprovação Financeira</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/jab/acompanhamento-faturamento") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/jab/acompanhamento-faturamento">Acompanhamento Faturamento</Link>
      </Button>
    </div>
  );
};

export default JabNavMenu;
