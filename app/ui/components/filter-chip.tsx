import { cn } from "@/lib/utils";

interface FilterChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ children, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-sm transition-colors",
        "border border-border hover:border-primary",
        active && "bg-primary text-primary-foreground border-primary"
      )}
    >
      {children}
    </button>
  );
}
