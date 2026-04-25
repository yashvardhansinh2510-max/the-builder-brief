import { useState, useEffect } from "react";

export function useSubscriberCount(fallback = "15,000+") {
  const [count, setCount] = useState<string>(fallback);

  useEffect(() => {
    fetch("/api/subscribers/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.total) setCount(d.total.toLocaleString() + "+");
      })
      .catch(() => {});
  }, []);

  return count;
}
