
import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  onReset: () => void;
}

export const SuccessMessage = ({ onReset }: SuccessMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-green-100 p-3">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold">Cadastro Realizado!</h2>
      <p className="mb-6 text-gray-600">
        Obrigado por cadastrar sua loja. Seus dados foram recebidos com sucesso.
      </p>
      <Button onClick={onReset}>Fazer Novo Cadastro</Button>
    </div>
  );
};
