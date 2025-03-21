
import { BkMenu } from "@/components/bk/BkMenu";
import { BkBanner } from "@/components/bk/BkBanner";
import { ServiceCard } from "@/components/bk/ServiceCard";
import { FileText, BarChart2, Users, Wallet, ClipboardCheck, ShoppingBag, Receipt, Package } from "lucide-react";

const BkHome = () => {
  const services = [
    {
      title: "Relatório de Itens",
      description: "Acesse relatórios e estatísticas sobre seus dados",
      icon: FileText,
      iconColor: "bg-purple-100 text-purple-600",
      path: "/client-area/bk/reports"
    },
    {
      title: "Dashboard",
      description: "Visualize indicadores de desempenho",
      icon: BarChart2,
      iconColor: "bg-blue-100 text-blue-600",
      path: "/client-area/bk/dashboard"
    },
    {
      title: "Clientes",
      description: "Gerencie informações de clientes",
      icon: Users,
      iconColor: "bg-green-100 text-green-600",
      path: "/client-area/bk/clients"
    },
    {
      title: "Faturamento",
      description: "Consulte informações financeiras",
      icon: Wallet,
      iconColor: "bg-amber-100 text-amber-600",
      path: "/client-area/bk/financial"
    },
    {
      title: "Estoque",
      description: "Consulte informações de estoque disponível",
      icon: Package,
      iconColor: "bg-teal-100 text-teal-600",
      path: "/client-area/bk/estoque"
    },
    {
      title: "Pedidos",
      description: "Acompanhe seus pedidos e separações",
      icon: ShoppingBag,
      iconColor: "bg-emerald-100 text-emerald-600",
      path: "/client-area/bk/pedidos"
    },
    {
      title: "Financeiro",
      description: "Consulte seus títulos e resumo financeiro",
      icon: Receipt,
      iconColor: "bg-indigo-100 text-indigo-600",
      path: "/client-area/bk/financeiromanager"
    },
    {
      title: "Solicitações",
      description: "Acompanhe solicitações enviadas",
      icon: ClipboardCheck,
      iconColor: "bg-red-100 text-red-600",
      path: "/client-area/bk/requests"
    },
  ];

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
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                iconColor={service.iconColor}
                path={service.path}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BkHome;
