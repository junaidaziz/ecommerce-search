import { apiFetch } from '@lib/api';
import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface Props {
  brandId?: number;
}

interface Data {
  count: number;
  revenue: number;
}

const OrdersThisMonthCard: React.FC<Props> = ({ brandId }) => {
  const [data, setData] = useState<Data | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setData(null);
    setError('');
    async function load() {
      const params = new URLSearchParams();
      if (brandId) params.set('brandId', String(brandId));
      const base = '/api/dashboard/orders-this-month';
      try {
        const curRes = await apiFetch(`${base}?${params.toString()}`);
        if (curRes.ok) {
          const cur = await curRes.json();
          setData(cur);
          params.set('monthOffset', '1');
          const prevRes = await apiFetch(`${base}?${params.toString()}`);
          if (prevRes.ok) {
            const prev = await prevRes.json();
            const pct = prev.count
              ? ((cur.count - prev.count) / prev.count) * 100
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
      title="Orders This Month"
      loading={!data && !error}
      error={error}
      icon={<ShoppingCartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
      trend={
        trend !== null
          ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`
          : undefined
      }
    >
      {data && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.count.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                £{data.revenue.toFixed(2)} revenue
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

export default OrdersThisMonthCard;
