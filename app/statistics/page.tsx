'use client';

import { useState, useEffect, useCallback } from 'react';
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

type Range = '7days' | '30days' | '90days';

interface StatsResponse {
  range: string;
  days: number;
  since: string;
  summary: {
    totalInspections: number;
    readyVehicles: number;
    monitorVehicles: number;
    notReadyVehicles: number;
    approvedCount: number;
    complianceRate: number;
  };
  totals: {
    totalVehicles: number;
    totalInspectors: number;
  };
  daily: Array<{ date: string; inspections: number; ready: number; monitor: number; notReady: number }>;
  vehicles: Array<{ vehicle: string; ready: number; monitor: number; notReady: number }>;
  commonIssues: Array<{ issue: string; count: number }>;
}

const formatDateLabel = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
};

export default function StatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<Range>('30days');
  const [data, setData] = useState<StatsResponse | null>(null);

  const fetchStatistics = useCallback(async (range: Range) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/statistics?range=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'โหลดสถิติไม่สำเร็จ');
      setData(json);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics(dateRange);
  }, [dateRange, fetchStatistics]);

  const summary = data?.summary;
  const total = summary?.totalInspections || 0;

  const statusData = summary
    ? [
        { name: 'พร้อมใช้ / Ready', value: summary.readyVehicles, color: '#10b981' },
        { name: 'เฝ้าระวัง / Monitor', value: summary.monitorVehicles, color: '#f59e0b' },
        { name: 'ไม่พร้อม / Not Ready', value: summary.notReadyVehicles, color: '#ef4444' },
      ].filter((s) => s.value > 0)
    : [];

  const dailyData = (data?.daily || []).map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">📊 สถิติการตรวจสอบ</h1>
            <h2 className="text-sm text-gray-600">
              Inspection Statistics
              {data?.since && ` · ตั้งแต่ ${formatDateLabel(data.since)}`}
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as Range)}
              className="input-field w-auto"
            >
              <option value="7days">7 วันล่าสุด</option>
              <option value="30days">30 วันล่าสุด</option>
              <option value="90days">90 วันล่าสุด</option>
            </select>
            <button
              onClick={() => fetchStatistics(dateRange)}
              disabled={loading}
              className="btn-secondary"
            >
              🔄 {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {loading && !data ? (
        <div className="card text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลดสถิติจากฐานข้อมูล...</p>
        </div>
      ) : !data || total === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">ยังไม่มีข้อมูลสถิติ</h3>
          <p className="text-gray-600 text-sm">
            ไม่พบการตรวจสอบในช่วง {data?.days || 30} วันที่ผ่านมา
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              gradient="from-blue-500 to-blue-600"
              label="การตรวจสอบทั้งหมด"
              value={summary!.totalInspections}
              sub="รายการ"
            />
            <SummaryCard
              gradient="from-green-500 to-green-600"
              label="พร้อมใช้"
              value={summary!.readyVehicles}
              sub={`${total > 0 ? ((summary!.readyVehicles / total) * 100).toFixed(1) : 0}% ของทั้งหมด`}
            />
            <SummaryCard
              gradient="from-yellow-500 to-orange-500"
              label="เฝ้าระวัง"
              value={summary!.monitorVehicles}
              sub={`${total > 0 ? ((summary!.monitorVehicles / total) * 100).toFixed(1) : 0}% ของทั้งหมด`}
            />
            <SummaryCard
              gradient="from-red-500 to-red-600"
              label="ไม่พร้อมใช้"
              value={summary!.notReadyVehicles}
              sub={`${total > 0 ? ((summary!.notReadyVehicles / total) * 100).toFixed(1) : 0}% ของทั้งหมด`}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4">สัดส่วนสถานะรถพยาบาล</h3>
              {statusData.length === 0 ? (
                <EmptyChart text="ยังไม่มีรายการที่ HOD อนุมัติพร้อมสถานะ" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">การตรวจสอบรายวัน</h3>
              {dailyData.length === 0 ? (
                <EmptyChart text="ยังไม่มีข้อมูลรายวัน" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ready" stroke="#10b981" name="พร้อมใช้" strokeWidth={2} />
                    <Line type="monotone" dataKey="monitor" stroke="#f59e0b" name="เฝ้าระวัง" strokeWidth={2} />
                    <Line type="monotone" dataKey="notReady" stroke="#ef4444" name="ไม่พร้อม" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4">ประสิทธิภาพแต่ละคัน</h3>
              {data.vehicles.length === 0 ? (
                <EmptyChart text="ยังไม่มีรถในระบบ" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.vehicles}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicle" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ready" stackId="a" fill="#10b981" name="พร้อมใช้" />
                    <Bar dataKey="monitor" stackId="a" fill="#f59e0b" name="เฝ้าระวัง" />
                    <Bar dataKey="notReady" stackId="a" fill="#ef4444" name="ไม่พร้อม" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">ปัญหาที่พบบ่อย</h3>
              {data.commonIssues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">✨</div>
                  <p className="text-sm">ยอดเยี่ยม! ไม่พบรายการผิดปกติในช่วงนี้</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.commonIssues.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="font-medium text-sm truncate" title={item.issue}>
                          {item.issue}
                        </div>
                        <div className="text-xs text-gray-500">พบ {item.count} ครั้ง</div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{item.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4">เมตริกเพิ่มเติม</h3>
              <div className="space-y-3">
                <Metric label="อัตราอนุมัติ (Compliance)" value={`${summary!.complianceRate}%`} valueClass="text-green-600" />
                <Metric label="HOD อนุมัติแล้ว" value={`${summary!.approvedCount} / ${total}`} />
                <Metric label="จำนวนรถทั้งหมด" value={`${data.totals.totalVehicles} คัน`} />
                <Metric label="จำนวนผู้ตรวจสอบ" value={`${data.totals.totalInspectors} คน`} last />
              </div>
            </div>

            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold mb-4 text-blue-800">💡 ข้อเสนอแนะ</h3>
              <ul className="space-y-2 text-sm">
                {generateRecommendations(data).map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <button onClick={() => router.push('/dashboard')} className="btn-secondary w-full">
          ← กลับแดชบอร์ด
        </button>
      </div>
    </div>
  );
}

function SummaryCard({
  gradient,
  label,
  value,
  sub,
}: {
  gradient: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className={`card bg-gradient-to-br ${gradient} text-white`}>
      <div className="text-sm opacity-90">{label}</div>
      <div className="text-4xl font-bold mt-2">{value}</div>
      <div className="text-sm mt-2 opacity-90">{sub}</div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-4xl mb-2">📈</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  valueClass,
  last,
}: {
  label: string;
  value: string;
  valueClass?: string;
  last?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center ${last ? '' : 'pb-3 border-b'}`}>
      <span className="text-gray-700 text-sm">{label}</span>
      <span className={`font-bold text-lg ${valueClass || ''}`}>{value}</span>
    </div>
  );
}

function generateRecommendations(data: StatsResponse): string[] {
  const recs: string[] = [];
  const { summary, vehicles, commonIssues } = data;
  const total = summary.totalInspections;

  if (total === 0) return ['ยังไม่มีข้อมูลเพียงพอที่จะวิเคราะห์'];

  if (summary.complianceRate < 80) {
    recs.push(`อัตราอนุมัติ ${summary.complianceRate}% ค่อนข้างต่ำ — ควรเร่งให้ HOD อนุมัติให้ทันเวลา`);
  } else {
    recs.push(`อัตราอนุมัติ ${summary.complianceRate}% อยู่ในเกณฑ์ดี`);
  }

  const worstVehicle = [...vehicles].sort((a, b) => (b.notReady + b.monitor) - (a.notReady + a.monitor))[0];
  if (worstVehicle && worstVehicle.notReady + worstVehicle.monitor > 0) {
    recs.push(
      `${worstVehicle.vehicle} มีปัญหาบ่อยที่สุด (เฝ้าระวัง ${worstVehicle.monitor} · ไม่พร้อม ${worstVehicle.notReady}) ควรตรวจระบบโดยละเอียด`
    );
  }

  if (commonIssues[0]) {
    recs.push(`รายการผิดปกติที่พบบ่อยที่สุด: "${commonIssues[0].issue}" (${commonIssues[0].count} ครั้ง) — ควรทบทวนแผนบำรุงรักษา`);
  }

  if (summary.notReadyVehicles > 0) {
    recs.push(`มีรถ ${summary.notReadyVehicles} คันถูกระบุว่าไม่พร้อมใช้ ควรเร่งซ่อมโดยด่วน`);
  }

  return recs.length > 0 ? recs : ['ระบบดำเนินงานเป็นไปอย่างราบรื่น ไม่มีคำแนะนำพิเศษ'];
}
