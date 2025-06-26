export interface DashboardProduct {
  id: string;
  title: string;
  quantity: number;
}

export interface OrdersThisMonth {
  count: number;
  revenue: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSales: number;
  ordersThisMonth: OrdersThisMonth;
  bestSellers: DashboardProduct[];
  lowStock: DashboardProduct[];
}
