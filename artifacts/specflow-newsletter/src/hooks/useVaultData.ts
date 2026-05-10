import { useState, useEffect } from 'react';

export interface Signal {
  id: string;
  source_type: string;
  content: string;
  timestamp: string;
  confidence_score: number;
  reasoning?: string;
}

export interface Vault {
  id: string;
  title: string;
  description?: string;
  content: string;
  created_at: string;
  published_at?: string;
  source_article_ids?: number[];
  // Enriched analytics fields
  signals: Signal[];
  signals_count: number;
  avg_confidence: number;
  trend_direction: 'Rising' | 'Stable' | 'Declining';
  source_types: string[];
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

        const rawData = await response.json();
        const rawVaults = Array.isArray(rawData) ? rawData : (rawData.vaults || []);

        // Map backend DB schema to the frontend Vault type requirements
        const mappedVaults: Vault[] = rawVaults.map((v: any) => {
          const signals: Signal[] = (v.signals || []).map((s: any) => ({
            id: String(s.id),
            source_type: s.source_type || s.sourceType || 'unknown',
            content: s.content || '',
            timestamp: s.timestamp || s.createdAt || new Date().toISOString(),
            confidence_score: typeof s.confidence_score === 'number' ? s.confidence_score : (s.confidenceScore ?? 0),
            reasoning: s.reasoning,
          }));
          const source_types: string[] = v.source_types || v.sourceTypes ||
            [...new Set(signals.map((s: Signal) => s.source_type))];
          return {
            id: String(v.id),
            title: v.title || 'Untitled Vault',
            description: v.description,
            content: v.content,
            created_at: v.createdAt || new Date().toISOString(),
            published_at: v.publishedAt,
            source_article_ids: v.sourceArticleIds || [],
            signals,
            signals_count: v.signals_count ?? v.signalsCount ?? signals.length,
            avg_confidence: v.avg_confidence ?? v.avgConfidence ?? 0,
            trend_direction: v.trend_direction || v.trendDirection || 'Stable',
            source_types,
          };
        });

        setVaults(mappedVaults);
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
