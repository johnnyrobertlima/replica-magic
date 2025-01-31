import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Key, UserPlus, Mail, Database } from "lucide-react";
import { Link } from "react-router-dom";

const ClientArea = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Área do Cliente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Disparo de WhatsApp
            </CardTitle>
            <CardDescription>
              Automatize suas mensagens e alcance seus clientes de forma eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/client-area/whatsapp">
              <Button className="w-full">
                Saiba mais
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-6 w-6" />
              Cadastro de Tokens
            </CardTitle>
            <CardDescription>
              Gerencie seus tokens para integração com WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/client-area/tokens">
              <Button className="w-full">
                Gerenciar Tokens
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              Cadastro de Cliente WhatsApp
            </CardTitle>
            <CardDescription>
              Cadastre novos clientes para disparo de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/client-area/whatsapp-registration">
              <Button className="w-full">
                Cadastrar Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Cadastro de Mailing
            </CardTitle>
            <CardDescription>
              Cadastre novos contatos para sua lista de mailing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/client-area/mailing-registration">
              <Button className="w-full">
                Cadastrar Mailing
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Gestão de Conteúdo
            </CardTitle>
            <CardDescription>
              Visualize relatórios e insights das suas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/client-area/content-management">
              <Button className="w-full">
                Ver Relatórios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ClientArea;