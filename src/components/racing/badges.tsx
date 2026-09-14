import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  CompetitorStatus,
  CompetitorType,
  RaceStatus,
  RaceType,
  RegistrationStatus,
} from "@/lib/racing/types";

const base = "border font-medium tracking-wide";

const competitorStatusStyles: Record<CompetitorStatus, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Injured: "bg-warning/20 text-warning-foreground border-warning/40",
  Suspended: "bg-destructive/15 text-destructive border-destructive/30",
  Retired: "bg-muted text-muted-foreground border-border",
};

const raceStatusStyles: Record<RaceStatus, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  "Open for Registration": "bg-success/15 text-success border-success/30",
  "Closed for Registration": "bg-warning/20 text-warning-foreground border-warning/40",
  "In Progress": "bg-primary/15 text-primary border-primary/30",
  Completed: "bg-gold/25 text-gold-foreground border-gold/50",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const registrationStyles: Record<RegistrationStatus, string> = {
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Approved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function CompetitorStatusBadge({ status }: { status: CompetitorStatus }) {
  return (
    <Badge variant="outline" className={cn(base, competitorStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function RaceStatusBadge({ status }: { status: RaceStatus }) {
  return (
    <Badge variant="outline" className={cn(base, raceStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <Badge variant="outline" className={cn(base, registrationStyles[status])}>
      {status}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: CompetitorType | RaceType }) {
  return (
    <Badge variant="outline" className={cn(base, "bg-sand text-secondary-foreground border-border")}>
      {type}
    </Badge>
  );
}
