
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label: string;
}

export const BackButton = ({ to, label }: BackButtonProps) => {
  return (
    <div className="mb-6">
      <Link to={to}>
        <Button variant="outline">{label}</Button>
      </Link>
    </div>
  );
};
