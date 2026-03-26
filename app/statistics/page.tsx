'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function StatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('30days');

  // Mock statistics data
  const [stats, setStats] = useState({
    totalInspections: 45,
    readyVehicles: 38,
    monitorVehicles: 5,
    notReadyVehicles: 2,
    avgInspectionTime: 25, // minutes
    complianceRate: 84.4, // percentage
  });

  // Status distribution data for pie chart
  const statusData = [
    { name: 'พร้อมใช้ / Ready', value: stats.readyVehicles, color: '#10b981' },
    { name: 'ติดตาม / Monitor', value: stats.monitorVehicles, color: '#f59e0b' },
    { name: 'ไม่พร้อม / Not Ready', value: stats.notReadyVehicles, color: '#ef4444' },
  ];

  // Daily inspections data for line chart
  const dailyInspectionsData = [
    { date: '19 Mar', inspections: 5, ready: 4, monitor: 1, notReady: 0 },
    { date: '20 Mar', inspections: 5, ready: 5, monitor: 0, notReady: 0 },
    { date: '21 Mar', inspections: 5, ready: 4, monitor: 1, notReady: 0 },
    { date: '22 Mar', inspections: 5, ready: 4, monitor: 0, notReady: 1 },
    { date: '23 Mar', inspections: 5, ready: 5, monitor: 0, notReady: 0 },
    { date: '24 Mar', inspections: 5, ready: 4, monitor: 1, notReady: 0 },
    { date: '25 Mar', inspections: 5, ready: 4, monitor: 1, notReady: 0 },
  ];

  // Vehicle performance data for bar chart
  const vehiclePerformanceData = [
    { vehicle: 'AMB-001', ready: 7, monitor: 0, notReady: 0 },
    { vehicle: 'AMB-002', ready: 5, monitor: 2, notReady: 0 },
    { vehicle: 'AMB-003', ready: 6, monitor: 1, notReady: 0 },
    { vehicle: 'AMB-004', ready: 7, monitor: 0, notReady: 0 },
    { vehicle: 'AMB-005', ready: 6, monitor: 0, notReady: 1 },
  ];

  // Common issues data
  const commonIssues = [
    { issue: 'ระดับน้ำมันเครื่อง / Engine Oil', count: 3 },
    { issue: 'แบตเตอรี่ / Battery', count: 2 },
    { issue: 'ปริมาณ O2 / Oxygen Level', count: 2 },
    { issue: 'อุปกรณ์การแพทย์ / Medical Equipment', count: 1 },
  ];

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // TODO: Connect to real API
      // const response = await fetch(`/api/statistics?range=${dateRange}`);
      // const data = await response.json();
      // setStats(data);

      // Using mock data for now
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">สถิติการตรวจสอบ</h1>
            <h2 className="text-lg text-gray-600">Inspection Statistics</h2>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="7days">7 วันล่าสุด / Last 7 days</option>
            <option value="30days">30 วันล่าสุด / Last 30 days</option>
            <option value="90days">90 วันล่าสุด / Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90">การตรวจสอบทั้งหมด / Total Inspections</div>
          <div className="text-4xl font-bold mt-2">{stats.totalInspections}</div>
          <div className="text-sm mt-2 opacity-90">รายการ / Records</div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90">รถพร้อมใช้ / Ready Vehicles</div>
          <div className="text-4xl font-bold mt-2">{stats.readyVehicles}</div>
          <div className="text-sm mt-2 opacity-90">
            {((stats.readyVehicles / stats.totalInspections) * 100).toFixed(1)}% ของทั้งหมด
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-sm opacity-90">ต้องติดตาม / Monitor</div>
          <div className="text-4xl font-bold mt-2">{stats.monitorVehicles}</div>
          <div className="text-sm mt-2 opacity-90">
            {((stats.monitorVehicles / stats.totalInspections) * 100).toFixed(1)}% ของทั้งหมด
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="text-sm opacity-90">ไม่พร้อมใช้ / Not Ready</div>
          <div className="text-4xl font-bold mt-2">{stats.notReadyVehicles}</div>
          <div className="text-sm mt-2 opacity-90">
            {((stats.notReadyVehicles / stats.totalInspections) * 100).toFixed(1)}% ของทั้งหมด
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">
            สัดส่วนสถานะรถพยาบาล / Vehicle Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Inspections Line Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">
            การตรวจสอบรายวัน / Daily Inspections (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyInspectionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ready" stroke="#10b981" name="พร้อมใช้ / Ready" strokeWidth={2} />
              <Line type="monotone" dataKey="monitor" stroke="#f59e0b" name="ติดตาม / Monitor" strokeWidth={2} />
              <Line type="monotone" dataKey="notReady" stroke="#ef4444" name="ไม่พร้อม / Not Ready" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle Performance Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">
            ประสิทธิภาพแต่ละคัน / Vehicle Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehiclePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ready" stackId="a" fill="#10b981" name="พร้อมใช้ / Ready" />
              <Bar dataKey="monitor" stackId="a" fill="#f59e0b" name="ติดตาม / Monitor" />
              <Bar dataKey="notReady" stackId="a" fill="#ef4444" name="ไม่พร้อม / Not Ready" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Common Issues */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">
            ปัญหาที่พบบ่อย / Common Issues
          </h3>
          <div className="space-y-3">
            {commonIssues.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.issue}</div>
                  <div className="text-sm text-gray-600">
                    {item.count} ครั้ง / {item.count} occurrences
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">เมตริกเพิ่มเติม / Additional Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">เวลาเฉลี่ยในการตรวจสอบ / Avg Inspection Time</span>
              <span className="font-bold text-lg">{stats.avgInspectionTime} นาที / min</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">อัตราความสำเร็จ / Compliance Rate</span>
              <span className="font-bold text-lg text-green-600">{stats.complianceRate}%</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-700">จำนวนรถทั้งหมด / Total Vehicles</span>
              <span className="font-bold text-lg">5 คัน / units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">จำนวนผู้ตรวจสอบ / Total Inspectors</span>
              <span className="font-bold text-lg">12 คน / people</span>
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold mb-4 text-blue-800">💡 ข้อเสนอแนะ / Recommendations</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>AMB-005 มีปัญหาบ่อย ควรตรวจสอบระบบให้ละเอียด / AMB-005 has frequent issues, needs detailed inspection</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>ปัญหาน้ำมันเครื่องพบบ่อย ควรทบทวนตารางการบำรุงรักษา / Engine oil issues common, review maintenance schedule</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>อัตราความสำเร็จอยู่ในเกณฑ์ดี แต่ยังมีที่ปรับปรุง / Compliance rate is good but can be improved</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-secondary w-full"
        >
          กลับแดชบอร์ด / Back to Dashboard
        </button>
      </div>
    </div>
  );
}
