import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { CurrencyPoundIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

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
        const curRes = await apiFetch(`${base}?${params.toString()}`);
        if (curRes.ok) {
          const cur = await curRes.json();
          setTotal(cur.total);
          params.set('monthOffset', '1');
          const prevRes = await apiFetch(`${base}?${params.toString()}`);
          if (prevRes.ok) {
            const prev = await prevRes.json();
            const pct = prev.total
              ? ((cur.total - prev.total) / prev.total) * 100
              : 100;
            setTrend(pct);
          }
        } else if (curRes.status === 404) {
          setError('No data available');
        } else {
          throw new Error('err');
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
      icon={<CurrencyPoundIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
      trend={
        trend !== null
          ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`
          : undefined
      }
    >
      {total !== null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                £{total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total revenue
              </p>
            </div>
          </div>
          {trend !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend > 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};

export default TotalSalesCard;
