"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import http from '@/lib/http';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function VendorRevenueReportPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [data, setData] = useState<{
    totalRevenue: number;
    revenueData: { date: string; revenue: number }[];
    deliveryData: { status: string; count: number }[];
  }>({
    totalRevenue: 0,
    revenueData: [],
    deliveryData: []
  });

  // Set default dates (last 7 days) on mount
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    // Format YYYY-MM-DD
    const formatDate = (date: Date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    setEndDate(formatDate(end));
    setStartDate(formatDate(start));
  }, []);

  const generateEmptyData = (start: string, end: string, group: string) => {
    const dates = [];
    let curr = new Date(start);
    const endDateObj = new Date(end);
    let loops = 0;
    while (curr <= endDateObj && loops < 100) {
      let dStr = '';
      if (group === 'day') {
        dStr = curr.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        curr.setDate(curr.getDate() + 1);
      } else if (group === 'month') {
        dStr = curr.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' });
        curr.setMonth(curr.getMonth() + 1);
      } else if (group === 'year') {
        dStr = curr.getFullYear().toString();
        curr.setFullYear(curr.getFullYear() + 1);
      }
      dates.push({ date: dStr, revenue: 0 });
      loops++;
    }
    return dates;
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const res = await http.get('/reports/vendor/revenue', {
        params: { startDate, endDate, groupBy }
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu báo cáo. Vui lòng thử lại!");
      setData(prev => ({
        ...prev,
        revenueData: generateEmptyData(startDate, endDate, groupBy)
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, groupBy]);

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh số</h1>
          <p className="text-sm text-muted-foreground">Theo dõi hiệu quả kinh doanh và doanh thu của bạn.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="border-none text-sm bg-gray-50 p-2 rounded-md font-medium text-gray-700 outline-none cursor-pointer"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
          <div className="h-4 w-px bg-gray-200 mx-1"></div>

          {groupBy === 'year' ? (
            <>
              <input
                type="number"
                min="2020"
                max="2100"
                value={startDate.split('-')[0]}
                onChange={(e) => setStartDate(`${e.target.value}-01-01`)}
                className="w-20 border-none shadow-none focus-visible:ring-0 cursor-pointer outline-none text-sm"
              />
              <span className="text-gray-400 font-medium">-</span>
              <input
                type="number"
                min="2020"
                max="2100"
                value={endDate.split('-')[0]}
                onChange={(e) => setEndDate(`${e.target.value}-12-31`)}
                className="w-20 border-none shadow-none focus-visible:ring-0 cursor-pointer outline-none text-sm"
              />
            </>
          ) : (
            <>
              <Input
                type={groupBy === 'month' ? 'month' : 'date'}
                value={groupBy === 'month' ? startDate.substring(0, 7) : startDate}
                onChange={(e) => setStartDate(groupBy === 'month' ? `${e.target.value}-01` : e.target.value)}
                className="w-auto border-none shadow-none focus-visible:ring-0 cursor-pointer h-8 px-2"
              />
              <span className="text-gray-400 font-medium">-</span>
              <Input
                type={groupBy === 'month' ? 'month' : 'date'}
                value={groupBy === 'month' ? endDate.substring(0, 7) : endDate}
                onChange={(e) => {
                  if (groupBy === 'month') {
                    const [y, m] = e.target.value.split('-');
                    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
                    setEndDate(`${e.target.value}-${lastDay}`);
                  } else {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-auto border-none shadow-none focus-visible:ring-0 cursor-pointer h-8 px-2"
              />
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="shadow-sm border-gray-100 overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between pb-6 border-b border-gray-50 bg-gray-50/50">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold uppercase text-gray-700 tracking-wider">
                  Doanh thu cửa hàng
                </CardTitle>
                <div className="text-xs font-normal text-gray-500">
                  {groupBy === 'day' && `Từ ${startDate.split('-').reverse().join('/')} đến ${endDate.split('-').reverse().join('/')}`}
                  {groupBy === 'month' && `Từ tháng ${startDate.substring(0, 7).split('-').reverse().join('/')} đến tháng ${endDate.substring(0, 7).split('-').reverse().join('/')}`}
                  {groupBy === 'year' && `Từ năm ${startDate.split('-')[0]} đến năm ${endDate.split('-')[0]}`}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-600 tracking-tight">
                {formatCurrency(data.totalRevenue)}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)} tr`}
                      width={60}
                      domain={[0, (dataMax: number) => (dataMax === 0 ? 5000000 : dataMax * 1.2)]}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #F3F4F6',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Chart */}
          <Card className="shadow-sm border-gray-100 overflow-hidden">
            <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/50">
              <CardTitle className="text-sm font-bold uppercase text-gray-700 tracking-wider">
                Thông tin giao hàng
              </CardTitle>
              <div className="text-xs font-normal text-gray-500 mt-1">
                {groupBy === 'day' && `Từ ${startDate.split('-').reverse().join('/')} đến ${endDate.split('-').reverse().join('/')}`}
                {groupBy === 'month' && `Từ tháng ${startDate.substring(0, 7).split('-').reverse().join('/')} đến tháng ${endDate.substring(0, 7).split('-').reverse().join('/')}`}
                {groupBy === 'year' && `Từ năm ${startDate.split('-')[0]} đến năm ${endDate.split('-')[0]}`}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deliveryData.length > 0 ? data.deliveryData : [{ status: 'Chưa có đơn hàng', count: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                      label={(props: any) => `${props.status || props.name} (${data.deliveryData.length > 0 ? props.count || props.value : 0})`}
                      labelLine={false}
                      stroke="none"
                    >
                      {(data.deliveryData.length > 0 ? data.deliveryData : [{ status: 'Chưa có đơn hàng', count: 1 }]).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={data.deliveryData.length > 0 ? COLORS[index % COLORS.length] : '#E5E7EB'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [data.deliveryData.length > 0 ? `${value} đơn hàng` : '0 đơn hàng', 'Số lượng']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #F3F4F6',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#374151', fontWeight: '500' }}
                    />
                    {data.deliveryData.length > 0 && (
                      <Legend
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>

                {data.deliveryData.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                    <span className="text-gray-400 font-medium">Trống</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
