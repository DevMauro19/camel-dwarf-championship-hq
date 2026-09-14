import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { pingApi, type ApiSource } from "./api";
import { makeSeed } from "./seed";
import type {
  AuditEntry,
  Competitor,
  RaceResult,
  RaceStatus,
  RacingData,
  Registration,
  Role,
} from "./types";

interface RacingStore extends RacingData {
  role: Role;
  setRole: (role: Role) => void;
  source: ApiSource;
  can: (action: Permission) => boolean;
  saveCompetitor: (input: CompetitorInput, id?: string) => void;
  setCompetitorTeam: (competitorId: string, teamId: string | null) => void;
  setRaceStatus: (raceId: string, status: RaceStatus) => void;
  decideRegistration: (id: string, approve: boolean, reason: string) => void;
  recordResult: (raceId: string, competitorId: string, position: number, timeSeconds: number) => void;
}

export type Permission = "manageCompetitors" | "manageTeams" | "manageRaces" | "reviewRegistrations";

export type CompetitorInput = Omit<
  Competitor,
  "id" | "races" | "victories" | "podiums" | "points"
> &
  Partial<Pick<Competitor, "races" | "victories" | "podiums" | "points">>;

const PERMISSIONS: Record<Role, Permission[]> = {
  Administrator: ["manageCompetitors", "manageTeams", "manageRaces", "reviewRegistrations"],
  "Race Organizer": ["manageRaces", "reviewRegistrations", "manageTeams"],
  Viewer: [],
};

const POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const RacingContext = createContext<RacingStore | null>(null);

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function RacingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RacingData>(() => makeSeed());
  const [role, setRole] = useState<Role>("Administrator");
  const [source, setSource] = useState<ApiSource>("demo");

  useEffect(() => {
    let cancelled = false;
    void pingApi().then((live) => {
      if (!cancelled && live) setSource("live");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const log = useCallback(
    (entry: Omit<AuditEntry, "id" | "at" | "actor">, actor: Role): AuditEntry => ({
      ...entry,
      id: nextId("aud"),
      at: new Date().toISOString(),
      actor,
    }),
    [],
  );

  const can = useCallback((action: Permission) => PERMISSIONS[role].includes(action), [role]);

  const saveCompetitor = useCallback(
    (input: CompetitorInput, id?: string) => {
      setData((prev) => {
        if (id) {
          const competitors = prev.competitors.map((comp) =>
            comp.id === id ? { ...comp, ...input } : comp,
          );
          return {
            ...prev,
            competitors,
            audit: [
              log(
                {
                  action: "Competitor updated",
                  target: input.name,
                  detail: `Status ${input.status}, type ${input.type}.`,
                },
                role,
              ),
              ...prev.audit,
            ],
          };
        }
        const created: Competitor = {
          races: 0,
          victories: 0,
          podiums: 0,
          points: 0,
          ...input,
          id: nextId("comp"),
        };
        return {
          ...prev,
          competitors: [created, ...prev.competitors],
          audit: [
            log(
              {
                action: "Competitor created",
                target: created.name,
                detail: `${created.type} competitor registered with status ${created.status}.`,
              },
              role,
            ),
            ...prev.audit,
          ],
        };
      });
    },
    [log, role],
  );

  const setCompetitorTeam = useCallback(
    (competitorId: string, teamId: string | null) => {
      setData((prev) => {
        const competitor = prev.competitors.find((comp) => comp.id === competitorId);
        const team = prev.teams.find((t) => t.id === teamId);
        return {
          ...prev,
          competitors: prev.competitors.map((comp) =>
            comp.id === competitorId ? { ...comp, teamId } : comp,
          ),
          audit: [
            log(
              {
                action: teamId ? "Competitor added to team" : "Competitor removed from team",
                target: competitor?.name ?? competitorId,
                detail: teamId ? `Joined ${team?.name ?? teamId}.` : "Released to free agency.",
              },
              role,
            ),
            ...prev.audit,
          ],
        };
      });
    },
    [log, role],
  );

  const setRaceStatus = useCallback(
    (raceId: string, status: RaceStatus) => {
      setData((prev) => {
        const race = prev.races.find((r) => r.id === raceId);
        return {
          ...prev,
          races: prev.races.map((r) => (r.id === raceId ? { ...r, status } : r)),
          audit: [
            log(
              {
                action: "Race status changed",
                target: race?.name ?? raceId,
                detail: `${race?.status ?? "Unknown"} → ${status}.`,
              },
              role,
            ),
            ...prev.audit,
          ],
        };
      });
    },
    [log, role],
  );

  const decideRegistration = useCallback(
    (id: string, approve: boolean, reason: string) => {
      setData((prev) => {
        const registration = prev.registrations.find((r) => r.id === id);
        const competitor = prev.competitors.find((c) => c.id === registration?.competitorId);
        const race = prev.races.find((r) => r.id === registration?.raceId);
        const updated: Registration[] = prev.registrations.map((r) =>
          r.id === id
            ? { ...r, status: approve ? "Approved" : "Rejected", decisionReason: reason }
            : r,
        );
        return {
          ...prev,
          registrations: updated,
          audit: [
            log(
              {
                action: approve ? "Registration approved" : "Registration rejected",
                target: `${competitor?.name ?? "Competitor"} → ${race?.name ?? "Race"}`,
                detail: reason || (approve ? "Approved without notes." : "Rejected without notes."),
              },
              role,
            ),
            ...prev.audit,
          ],
        };
      });
    },
    [log, role],
  );

  const recordResult = useCallback(
    (raceId: string, competitorId: string, position: number, timeSeconds: number) => {
      setData((prev) => {
        const points = POINTS_BY_POSITION[position - 1] ?? 1;
        const result: RaceResult = {
          id: nextId("res"),
          raceId,
          competitorId,
          position,
          timeSeconds,
          points,
        };
        const competitor = prev.competitors.find((c) => c.id === competitorId);
        const race = prev.races.find((r) => r.id === raceId);
        const competitors = prev.competitors.map((comp) =>
          comp.id === competitorId
            ? {
                ...comp,
                races: comp.races + 1,
                victories: comp.victories + (position === 1 ? 1 : 0),
                podiums: comp.podiums + (position <= 3 ? 1 : 0),
                points: comp.points + points,
              }
            : comp,
        );
        const teams = prev.teams.map((team) =>
          team.id === competitor?.teamId
            ? {
                ...team,
                points: team.points + points,
                victories: team.victories + (position === 1 ? 1 : 0),
              }
            : team,
        );
        return {
          ...prev,
          results: [...prev.results.filter((r) => !(r.raceId === raceId && r.competitorId === competitorId)), result],
          competitors,
          teams,
          audit: [
            log(
              {
                action: "Result recorded",
                target: `${competitor?.name ?? competitorId} @ ${race?.name ?? raceId}`,
                detail: `Position ${position}, ${points} points awarded.`,
              },
              role,
            ),
            ...prev.audit,
          ],
        };
      });
    },
    [log, role],
  );

  const value = useMemo<RacingStore>(
    () => ({
      ...data,
      role,
      setRole,
      source,
      can,
      saveCompetitor,
      setCompetitorTeam,
      setRaceStatus,
      decideRegistration,
      recordResult,
    }),
    [data, role, source, can, saveCompetitor, setCompetitorTeam, setRaceStatus, decideRegistration, recordResult],
  );

  return <RacingContext.Provider value={value}>{children}</RacingContext.Provider>;
}

export function useRacing(): RacingStore {
  const ctx = useContext(RacingContext);
  if (!ctx) throw new Error("useRacing must be used inside RacingProvider");
  return ctx;
}
