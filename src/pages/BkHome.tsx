import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart2, Users, Wallet, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BkMenu } from "@/components/bk/BkMenu";
import { BkBanner } from "@/components/bk/BkBanner";

const BkHome = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <BkBanner />
      <BkMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo à área do cliente B&K</h1>
            <p className="text-muted-foreground text-lg">
              Acesse as ferramentas e serviços disponíveis para gerenciamento dos seus dados.
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Acesse relatórios e estatísticas sobre seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Visualize dados detalhados e gráficos de desempenho para tomada de decisões.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/client-area/bk/reports">Acessar</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <BarChart2 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Visualize indicadores de desempenho
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Acompanhe métricas importantes e análises em tempo real em um painel personalizado.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/client-area/bk/dashboard">Acessar</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>
                  Gerencie informações de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Cadastre, atualize e consulte dados de clientes de forma rápida e simples.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/client-area/bk/clients">Acessar</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Wallet className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Financeiro</CardTitle>
                <CardDescription>
                  Consulte informações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Acesse relatórios financeiros, faturamento e outras informações importantes.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/client-area/bk/faturamento">Acessar</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <ClipboardCheck className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Solicitações</CardTitle>
                <CardDescription>
                  Acompanhe solicitações enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Envie novas solicitações e acompanhe o status das solicitações já enviadas.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/client-area/bk/requests">Acessar</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BkHome;
