export interface DashboardProduct {
  id: number;
  title: string;
  quantity: number;
  revenue?: number;
  salesCount?: number;
}

export interface OrdersThisMonth {
  count: number;
  revenue: number;
  growth?: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  ordersThisMonth: OrdersThisMonth;
  bestSellers: DashboardProduct[];
  lowStock: DashboardProduct[];
  revenueGrowth?: number;
  orderGrowth?: number;
}

export interface AnalyticsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: AnalyticsData;
  options?: Record<string, any>;
}
