import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import MoneyIcon from '../icons/MoneyIcon';
import ArrowTrendingUpIcon from '../icons/ArrowTrendingUpIcon';

interface Props {
  brandId?: number;
}

const TotalSalesCard: React.FC<Props> = ({ brandId }) => {
  const [total, setTotal] = useState<number | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    setTotal(null);
    setError('');
    async function load() {
      const params = new URLSearchParams();
      if (brandId) params.set('brandId', String(brandId));
      const base = '/api/dashboard/total-sales';
      try {
        const curRes = await fetch(`${base}?${params.toString()}`);
        if (!curRes.ok) throw new Error('err');
        const cur = await curRes.json();
        setTotal(cur.total);
        params.set('monthOffset', '1');
        const prevRes = await fetch(`${base}?${params.toString()}`);
        if (prevRes.ok) {
          const prev = await prevRes.json();
          const pct = prev.total
            ? ((cur.total - prev.total) / prev.total) * 100
            : 100;
          setTrend(pct);
        }
      } catch {
        setError('Failed to load');
      }
    }
    load();
  }, [brandId]);

  return (
    <DashboardCard
      title="Total Sales"
      loading={total === null && !error}
      error={error}
      icon={<MoneyIcon className="w-5 h-5" />}
      trend={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : undefined}
      className="bg-green-50"
    >
      {total !== null && (
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
          <p className="text-3xl font-bold">£{total.toFixed(2)}</p>
        </div>
      )}
    </DashboardCard>
  );
};

export default TotalSalesCard;
