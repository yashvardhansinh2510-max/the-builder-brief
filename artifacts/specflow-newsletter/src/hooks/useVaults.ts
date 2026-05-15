import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Vault, VaultFilter, VaultListResponse, VaultDetailResponse } from '@/lib/vault-types';
import { useAuth } from '@/lib/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UseVaultsResult {
  vaults: Vault[];
  vault: Vault | null;
  relatedVaults: Vault[];
  bookmarkedVaults: Vault[];
  userFeedback: { liked: boolean; shared: boolean; saved: boolean } | undefined;
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  fetchVaults: (filters?: VaultFilter, pageNum?: number) => Promise<void>;
  fetchVaultDetail: (vaultId: string) => Promise<void>;
  fetchBookmarkedVaults: () => Promise<void>;
  bookmarkVault: (vaultId: string) => Promise<{ bookmarked: boolean }>;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export const useVaults = (): UseVaultsResult => {
  const { getToken } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vault, setVault] = useState<Vault | null>(null);
  const [relatedVaults, setRelatedVaults] = useState<Vault[]>([]);
  const [bookmarkedVaults, setBookmarkedVaults] = useState<Vault[]>([]);
  const [userFeedback, setUserFeedback] = useState<{ liked: boolean; shared: boolean; saved: boolean } | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [pageState, setPageState] = useState(1);
  const [pageSize] = useState(12);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<VaultFilter | undefined>();

  const fetchVaults = useCallback(async (filters?: VaultFilter, pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.tier) params.append('tier', filters.tier);
      if (filters?.minScore !== undefined) params.append('minScore', filters.minScore.toString());
      if (filters?.maxScore !== undefined) params.append('maxScore', filters.maxScore.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters?.signalsMinCount !== undefined) params.append('signalsMinCount', filters.signalsMinCount.toString());
      if (filters?.searchQuery) params.append('q', filters.searchQuery);
      if (filters?.sortBy) params.append('sort', filters.sortBy);
      if (filters?.sortOrder) params.append('order', filters.sortOrder);
      if (filters?.category) params.append('category', filters.category);
      params.append('page', pageNum.toString());
      params.append('pageSize', (filters?.pageSizeOverride ?? pageSize).toString());

      const response = await fetch(`${API_BASE}/vaults?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch vaults: ${response.statusText}`);
      const data: VaultListResponse = await response.json();
      setVaults(data.vaults);
      setTotal(data.total);
      setPageState(data.page);
      setHasMore(data.hasMore);
      setCurrentFilter(filters);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const fetchVaultDetail = useCallback(async (vaultId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE}/vaults/${vaultId}`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch vault: ${response.statusText}`);
      const data: VaultDetailResponse = await response.json();
      setVault(data.vault);
      setRelatedVaults(data.relatedVaults ?? []);
      setUserFeedback(data.userFeedback);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchBookmarkedVaults = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetch(`${API_BASE}/vaults/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch bookmarks');
      const data = await response.json();
      setBookmarkedVaults(data.vaults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const bookmarkVault = useCallback(async (vaultId: string): Promise<{ bookmarked: boolean }> => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE}/vaults/${vaultId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to toggle bookmark');
    return response.json();
  }, [getToken]);

  const setPage = useCallback((newPage: number) => {
    fetchVaults(currentFilter, newPage);
  }, [fetchVaults, currentFilter]);

  const refresh = useCallback(async () => {
    await fetchVaults(currentFilter, pageState);
  }, [fetchVaults, currentFilter, pageState]);

  return {
    vaults, vault, relatedVaults, bookmarkedVaults, userFeedback,
    loading, error, total, page: pageState, pageSize, hasMore,
    fetchVaults, fetchVaultDetail, fetchBookmarkedVaults, bookmarkVault,
    setPage, refresh,
  };
};

export default useVaults;

// ─── React Query hooks (cached) ─────────────────────────────────────────────

function buildParams(filters: VaultFilter = {}, page = 1, pageSize = 12): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.tier) p.append('tier', filters.tier);
  if (filters.minScore !== undefined) p.append('minScore', filters.minScore.toString());
  if (filters.maxScore !== undefined) p.append('maxScore', filters.maxScore.toString());
  if (filters.dateFrom) p.append('dateFrom', filters.dateFrom.toISOString());
  if (filters.dateTo) p.append('dateTo', filters.dateTo.toISOString());
  if (filters.signalsMinCount !== undefined) p.append('signalsMinCount', filters.signalsMinCount.toString());
  if (filters.searchQuery) p.append('q', filters.searchQuery);
  if (filters.sortBy) p.append('sort', filters.sortBy);
  if (filters.sortOrder) p.append('order', filters.sortOrder);
  p.append('page', page.toString());
  p.append('pageSize', pageSize.toString());
  return p;
}

export function useVaultList(filters: VaultFilter = {}, page = 1) {
  return useQuery<VaultListResponse>({
    queryKey: ['vaults', filters, page],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/vaults?${buildParams(filters, page)}`);
      if (!res.ok) throw new Error(`Failed to fetch vaults: ${res.statusText}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useVaultDetail(vaultId: string | undefined) {
  return useQuery<VaultDetailResponse>({
    queryKey: ['vault', vaultId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/vaults/${vaultId}`);
      if (!res.ok) throw new Error(`Failed to fetch vault: ${res.statusText}`);
      return res.json();
    },
    enabled: !!vaultId,
    staleTime: 10 * 60 * 1000,
  });
}
