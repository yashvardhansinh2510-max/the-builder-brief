import { useState, useEffect } from 'react';

export interface Vault {
  id: string;
  title: string;
  created_at: string;
  signals_count: number;
  avg_confidence: number;
  trend_direction: 'Rising' | 'Stable' | 'Declining';
  source_types: string[];
  signals: Signal[];
}

export interface Signal {
  id: string;
  vault_id: string;
  source_type: string;
  timestamp: string;
  confidence_score: number;
  content: string;
  reasoning: string;
}

interface UseVaultDataParams {
  dateFrom?: string;
  dateTo?: string;
  sourceTypes?: string[];
  strengthMin?: number;
  trendDirection?: 'All' | 'Rising' | 'Stable' | 'Declining';
}

interface UseVaultDataReturn {
  vaults: Vault[];
  loading: boolean;
  error: string | null;
}

export function useVaultData(params: UseVaultDataParams): UseVaultDataReturn {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaults = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.sourceTypes && params.sourceTypes.length > 0) {
          params.sourceTypes.forEach(type => queryParams.append('sourceType', type));
        }
        if (params.strengthMin !== undefined) {
          queryParams.append('strengthMin', String(params.strengthMin));
        }
        if (params.trendDirection && params.trendDirection !== 'All') {
          queryParams.append('trendDirection', params.trendDirection);
        }

        const response = await fetch(`/api/vaults?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        setVaults(data.vaults || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error fetching vaults');
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [
    params.dateFrom,
    params.dateTo,
    params.sourceTypes?.join(','),
    params.strengthMin,
    params.trendDirection,
  ]);

  return { vaults, loading, error };
}
