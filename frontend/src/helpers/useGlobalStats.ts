import { useEffect, useState } from 'react';

export interface GlobalStats {
  totalStudents: string;
  graduationRate: string;
  admissionsRate: string;
  studentFacultyRatio: string;
  medianHouseholdIncome: string;
  satScore?: string;
  actScore?: string;
}

export interface GlobalStatsResponse {
  undergrad: GlobalStats;
  grad: GlobalStats;
}

const API_BASE_URL = 'http://localhost:8000/api';

let cache: Promise<GlobalStatsResponse> | null = null;

const fetchGlobalStats = (): Promise<GlobalStatsResponse> => {
  if (!cache) {
    cache = fetch(`${API_BASE_URL}/stats/aggregates`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
};

export const useGlobalStats = (): GlobalStatsResponse | undefined => {
  const [stats, setStats] = useState<GlobalStatsResponse | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchGlobalStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
};
