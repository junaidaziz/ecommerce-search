import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import CartIcon from '../icons/CartIcon';
import ArrowTrendingUpIcon from '../icons/ArrowTrendingUpIcon';

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
        const curRes = await fetch(`${base}?${params.toString()}`);
        if (curRes.ok) {
          const cur = await curRes.json();
          setData(cur);
          params.set('monthOffset', '1');
          const prevRes = await fetch(`${base}?${params.toString()}`);
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
      icon={<CartIcon className="w-5 h-5" />}
      trend={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : undefined}
      className="bg-yellow-50"
    >
      {data && (
        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-3xl font-bold">{data.count}</p>
            <p className="text-sm">£{data.revenue.toFixed(2)}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

export default OrdersThisMonthCard;
