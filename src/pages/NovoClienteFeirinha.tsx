
import { NovoClienteForm } from "@/components/feirinha/NovoClienteForm";

export default function NovoClienteFeirinha() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold">Cadastro de Novo Cliente - Feirinha</h1>
            <p className="text-gray-600">
              Preencha o formulário abaixo para cadastrar um novo cliente da feirinha
            </p>
          </div>
          <NovoClienteForm />
        </div>
      </div>
    </div>
  );
}
