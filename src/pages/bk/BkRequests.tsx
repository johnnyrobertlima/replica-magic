
import { BkMenu } from "@/components/bk/BkMenu";
import RequestForm from "./requests/RequestForm";
import RequestsList from "./requests/RequestsList";
import { useRequests } from "./requests/useRequests";

const BkRequests = () => {
  const { requests, isLoading, fetchUserRequests } = useRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <BkMenu />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Solicitações</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Requests List Section */}
          <div className="lg:col-span-8">
            <RequestsList 
              requests={requests}
              isLoading={isLoading}
              onRefresh={fetchUserRequests}
            />
          </div>

          {/* Form Section */}
          <div className="lg:col-span-4">
            <RequestForm onRequestSubmitted={fetchUserRequests} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkRequests;
