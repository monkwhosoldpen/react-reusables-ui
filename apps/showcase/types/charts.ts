export interface ChartDataset {
  data: number[];
  color: string;
}

export interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface BarChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface PieChartData {
  labels: string[];
  data: number[];
  colors: string[];
} 