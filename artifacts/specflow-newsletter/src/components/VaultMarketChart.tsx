import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  marketSize?: number;
  tam?: number;
  signals?: number;
}

interface VaultMarketChartProps {
  title?: string;
  description?: string;
  data?: ChartDataPoint[];
  marketSize?: string;
  tam?: string;
  keywords?: string[];
  chartType?: 'bar' | 'line' | 'combined';
  height?: number;
}

export const VaultMarketChart: React.FC<VaultMarketChartProps> = ({
  title = 'Market Opportunity',
  description,
  data = [],
  marketSize,
  tam,
  keywords = [],
  chartType = 'bar',
  height = 300,
}) => {
  // Mock data if none provided
  const chartData = data.length > 0 ? data : [
    { date: 'Week 1', marketSize: 2400, tam: 2210, signals: 29 },
    { date: 'Week 2', marketSize: 1398, tam: 2290, signals: 30 },
    { date: 'Week 3', marketSize: 9800, tam: 2000, signals: 35 },
    { date: 'Week 4', marketSize: 3908, tam: 2108, signals: 40 },
    { date: 'Week 5', marketSize: 4800, tam: 2176, signals: 42 },
  ];

  const chartComponent = chartType === 'line' ? (
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
      <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
      <Tooltip
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
        labelStyle={{ color: '#000' }}
      />
      <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
      {chartData[0]?.marketSize !== undefined && (
        <Line
          type="monotone"
          dataKey="marketSize"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Market Size (B)"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      )}
      {chartData[0]?.tam !== undefined && (
        <Line
          type="monotone"
          dataKey="tam"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="TAM Trend"
          dot={{ fill: '#8b5cf6', r: 4 }}
        />
      )}
      {chartData[0]?.signals !== undefined && (
        <Line
          type="monotone"
          dataKey="signals"
          stroke="#10b981"
          strokeWidth={2}
          name="Signal Count"
          dot={{ fill: '#10b981', r: 4 }}
        />
      )}
    </LineChart>
  ) : (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
      <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
      <Tooltip
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
        labelStyle={{ color: '#000' }}
      />
      <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
      {chartData[0]?.marketSize !== undefined && (
        <Bar dataKey="marketSize" fill="#3b82f6" name="Market Size (B)" radius={[4, 4, 0, 0]} />
      )}
      {chartData[0]?.tam !== undefined && (
        <Bar dataKey="tam" fill="#8b5cf6" name="TAM (B)" radius={[4, 4, 0, 0]} />
      )}
      {chartData[0]?.signals !== undefined && (
        <Bar dataKey="signals" fill="#10b981" name="Signal Count" radius={[4, 4, 0, 0]} />
      )}
    </BarChart>
  );

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* Chart */}
      <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={height}>
          {chartComponent}
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketSize && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-600">Estimated Market Size</p>
            <p className="text-lg font-bold text-blue-900 mt-1">{marketSize}</p>
          </div>
        )}
        {tam && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-600">Total Addressable Market</p>
            <p className="text-lg font-bold text-purple-900 mt-1">{tam}</p>
          </div>
        )}
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Trending Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultMarketChart;
