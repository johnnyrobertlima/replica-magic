
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const JabNavMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isActive("/client-area/bluebay/jab-orders") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/bluebay/jab-orders">Consultar Pedidos</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/bluebay/jab-orders-by-client") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/bluebay/jab-orders-by-client">Pedidos por Cliente</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/bluebay/jab-orders-by-representante") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/bluebay/jab-orders-by-representante">Separação por Representante</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/bluebay/aprovacao-financeira") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/bluebay/aprovacao-financeira">Aprovação Financeira</Link>
      </Button>
      
      <Button
        variant={isActive("/client-area/bluebay/acompanhamento-faturamento") ? "default" : "outline"}
        asChild
      >
        <Link to="/client-area/bluebay/acompanhamento-faturamento">Acompanhamento Faturamento</Link>
      </Button>
    </div>
  );
};

export default JabNavMenu;
