import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Spinner({ className, size = 'medium' }: SpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-t-2 border-primary", 
          "border-r-2 border-transparent",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
} 