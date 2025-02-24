
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const JabOrdersByClient = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/client-area">
          <Button variant="outline">Voltar para Área do Cliente</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Separação de Pedidos JAB</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Visualização e gerenciamento de pedidos JAB por cliente.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JabOrdersByClient;
