import { useQuery } from '@tanstack/react-query';

export function useSubscriberCount(fallback = "15,000+") {
  const { data } = useQuery({
    queryKey: ['subscriberCount'],
    queryFn: () =>
      fetch('/api/subscribers/stats')
        .then(r => (r.ok ? r.json() : null)),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  return data?.total ? data.total.toLocaleString() + "+" : fallback;
}
