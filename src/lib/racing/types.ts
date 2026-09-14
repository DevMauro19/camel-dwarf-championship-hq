export type CompetitorType = "Camel" | "Dwarf" | "Medium" | "Other";
export type CompetitorStatus = "Active" | "Injured" | "Suspended" | "Retired";

export type RaceStatus =
  | "Draft"
  | "Open for Registration"
  | "Closed for Registration"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type RaceType = "Individual" | "Team" | "Mixed";

export type RegistrationStatus = "Pending" | "Approved" | "Rejected";

export type Role = "Administrator" | "Race Organizer" | "Viewer";

export interface Competitor {
  id: string;
  name: string;
  nickname: string;
  type: CompetitorType;
  status: CompetitorStatus;
  country: string;
  age: number;
  weightKg: number;
  topSpeedKph: number;
  stamina: number; // 0-100
  teamId: string | null;
  races: number;
  victories: number;
  podiums: number;
  points: number;
  bio: string;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  coach: string;
  strategy: string;
  homeBase: string;
  founded: number;
  colors: string;
  points: number;
  victories: number;
}

export interface Race {
  id: string;
  name: string;
  status: RaceStatus;
  type: RaceType;
  venue: string;
  scheduledAt: string;
  distanceKm: number;
  laps: number;
  terrain: string;
  surface: string;
  elevationM: number;
  maxParticipants: number;
  prizePool: number;
  description: string;
}

export interface Registration {
  id: string;
  raceId: string;
  competitorId: string;
  status: RegistrationStatus;
  submittedAt: string;
  note: string;
  decisionReason?: string;
}

export interface RaceResult {
  id: string;
  raceId: string;
  competitorId: string;
  position: number;
  timeSeconds: number;
  points: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: Role;
  action: string;
  target: string;
  detail: string;
}

export interface RacingData {
  competitors: Competitor[];
  teams: Team[];
  races: Race[];
  registrations: Registration[];
  results: RaceResult[];
  audit: AuditEntry[];
}
