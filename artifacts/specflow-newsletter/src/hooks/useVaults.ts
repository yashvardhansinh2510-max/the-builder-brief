import { useState, useEffect, useCallback } from 'react';
import { Vault, VaultFilter, VaultListResponse, VaultDetailResponse } from '@/lib/vault-types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UseVaultsResult {
  vaults: Vault[];
  vault: Vault | null;
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  fetchVaults: (filters?: VaultFilter, pageNum?: number) => Promise<void>;
  fetchVaultDetail: (vaultId: string) => Promise<void>;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export const useVaults = (): UseVaultsResult => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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
      params.append('page', pageNum.toString());
      params.append('pageSize', pageSize.toString());

      const response = await fetch(`${API_BASE}/vaults?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch vaults: ${response.statusText}`);

      const data: VaultListResponse = await response.json();
      setVaults(data.vaults);
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.hasMore);
      setCurrentFilter(filters);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error fetching vaults:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const fetchVaultDetail = useCallback(async (vaultId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/vaults/${vaultId}`);
      if (!response.ok) throw new Error(`Failed to fetch vault: ${response.statusText}`);

      const data: VaultDetailResponse = await response.json();
      setVault(data.vault);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error fetching vault detail:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchVaults(currentFilter, page);
  }, [fetchVaults, currentFilter, page]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  return {
    vaults,
    vault,
    loading,
    error,
    total,
    page,
    pageSize,
    hasMore,
    fetchVaults,
    fetchVaultDetail,
    setPage,
    refresh,
  };
};

export default useVaults;
