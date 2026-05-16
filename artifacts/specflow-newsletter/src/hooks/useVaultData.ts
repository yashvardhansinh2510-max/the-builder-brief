import { useQuery } from '@tanstack/react-query';

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

function mapVault(v: any): Vault {
  const signals: Signal[] = (v.signals || []).map((s: any) => ({
    id: String(s.id),
    source_type: s.source_type || s.sourceType || 'unknown',
    content: s.content || '',
    timestamp: s.timestamp || s.createdAt || new Date().toISOString(),
    confidence_score:
      typeof s.confidence_score === 'number' ? s.confidence_score : (s.confidenceScore ?? 0),
    reasoning: s.reasoning,
  }));
  const source_types: string[] =
    v.source_types || v.sourceTypes || [...new Set(signals.map((s: Signal) => s.source_type))];
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
}

async function fetchVaultData(params: UseVaultDataParams): Promise<Vault[]> {
  const queryParams = new URLSearchParams();
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.sourceTypes?.length) {
    params.sourceTypes.forEach(type => queryParams.append('sourceType', type));
  }
  if (params.strengthMin !== undefined) queryParams.append('strengthMin', String(params.strengthMin));
  if (params.trendDirection && params.trendDirection !== 'All') {
    queryParams.append('trendDirection', params.trendDirection);
  }

  const res = await fetch(`/api/vaults?${queryParams}`);
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const raw = await res.json();
  const rawVaults = Array.isArray(raw) ? raw : (raw.vaults || []);
  return rawVaults.map(mapVault);
}

export function useVaultData(params: UseVaultDataParams) {
  const { data, isLoading, error } = useQuery<Vault[]>({
    queryKey: [
      'vaultData',
      params.dateFrom,
      params.dateTo,
      params.sourceTypes?.join(','),
      params.strengthMin,
      params.trendDirection,
    ],
    queryFn: () => fetchVaultData(params),
    staleTime: 5 * 60 * 1000,
  });

  return {
    vaults: data ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
