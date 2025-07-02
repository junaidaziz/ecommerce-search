import React from 'react';
import ChartContainer from '../ChartContainer';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts';

const BAR_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export interface TopProduct {
  id: string;
  qty: number;
}

interface Props {
  data: TopProduct[];
  height?: string | number;
}

const TopProductsChart: React.FC<Props> = ({ data, height = '16rem' }) => (
  <ChartContainer dataLength={data.length} height={height}>
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data.map((d) => ({ label: d.id, value: d.qty }))}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export default TopProductsChart;
