'use client';

import { useEffect, useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

type SalesData = {
  year: string;
  sales: number;
};


export default function DashboardPage() {
  const [data, setData] = useState<SalesData[]>([]);
  const [threshold, setThreshold] = useState(0);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');



useEffect(() => {
  fetch('/Supplement_Sales_Weekly_Expanded.csv')
    .then(res => res.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result: any) => {
          const raw = result.data as any[];

          const yearTotals: Record<string, number> = {
            '2022': 0,
            '2023': 0,
            '2024': 0
          };

          raw.forEach((row) => {
            const dateStr = row['Date']?.trim();
            const units = parseInt(row['Units Sold'] || '0');

            if (dateStr && !isNaN(units)) {
              const year = new Date(dateStr).getFullYear().toString();

              if (yearTotals[year] !== undefined) {
                yearTotals[year] += units;
              }
            }
          });

          const formatted = Object.entries(yearTotals).map(([year, sales]) => ({
            year,
            sales
          }));

          setData(formatted);
        },
        error: (err: any) => {
          console.error('CSV Parse Error:', err);
        }
      });
    });
}, []);


  const filteredData = data.filter((item) => item.sales >= threshold);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>

      <div className="mb-4 flex gap-4 items-center">
        <Input
          type="number"
          placeholder="Sales Threshold"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold(Number(e.target.value))}

        />
        <div className="flex gap-2">
          <Button variant={chartType === 'bar' ? 'default' : 'outline'} onClick={() => setChartType('bar')}>Bar</Button>
          <Button variant={chartType === 'line' ? 'default' : 'outline'} onClick={() => setChartType('line')}>Line</Button>
          <Button variant={chartType === 'pie' ? 'default' : 'outline'} onClick={() => setChartType('pie')}>Pie</Button>
        </div>
      </div>

 <Card className="p-4">
  <CardContent>
    {chartType === 'bar' && (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={filteredData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    )}

    {chartType === 'line' && (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    )}

    {chartType === 'pie' && (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="sales"
            nameKey="year"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>
    </main>
  );
}
