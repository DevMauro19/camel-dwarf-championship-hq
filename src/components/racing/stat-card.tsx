import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-4xl leading-none text-foreground">{value}</p>
          {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
        </div>
        <span className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}
