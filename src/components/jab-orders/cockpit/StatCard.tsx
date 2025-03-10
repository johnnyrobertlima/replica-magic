
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  color: "green" | "blue" | "amber" | "purple" | "indigo";
  className?: string;
}

export const StatCard = ({ title, value, color, className }: StatCardProps) => {
  const colorClasses = {
    green: "border-l-green-600 text-green-600",
    blue: "border-l-blue-600 text-blue-600",
    amber: "border-l-amber-600 text-amber-600",
    purple: "border-l-purple-600 text-purple-600",
    indigo: "border-l-indigo-600 text-indigo-600"
  };

  return (
    <Card className={cn(`bg-white shadow-lg border-l-4 ${colorClasses[color]}`, className)}>
      <CardContent className="pt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};
