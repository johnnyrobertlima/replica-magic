
import { cn } from "@/lib/utils";

interface LoadingChartProps {
  className?: string;
  color?: "blue" | "green" | "amber" | "purple" | "indigo";
  size?: "sm" | "md" | "lg";
}

export const LoadingChart = ({ 
  className,
  color = "blue",
  size = "md" 
}: LoadingChartProps) => {
  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    amber: "border-amber-500",
    purple: "border-purple-500",
    indigo: "border-indigo-500"
  };

  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-14 w-14 border-6"
  };

  return (
    <div className={cn("flex items-center justify-center h-[350px] w-full", className)}>
      <div className={cn(
        "animate-spin rounded-full border-t-transparent",
        colorClasses[color],
        sizeClasses[size]
      )}></div>
    </div>
  );
};
