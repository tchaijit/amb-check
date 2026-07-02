import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  start: string;
  end: string;
  generatedAt: string;
  summary: {
    totalInspections: number;
    readyVehicles: number;
    monitorVehicles: number;
    notReadyVehicles: number;
    approvedCount: number;
    complianceRate: number;
  };
  totals: { totalVehicles: number; totalInspectors: number };
  vehicles: Array<{ vehicle: string; ready: number; monitor: number; notReady: number; total: number }>;
  commonIssues: Array<{ issue: string; count: number }>;
  details: Array<{
    date: string;
    vehicle: string;
    status: string;
    driverCompleted: boolean;
    equipmentCompleted: boolean;
    nurseCompleted: boolean;
    hodApproved: boolean;
    abnormalCount: number;
  }>;
}

// ---------- Date range presets (Asia/Bangkok, local wall-clock) ----------

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Week: Monday–Sunday containing `ref` (default today). offsetWeeks shifts back.
export function weekRange(ref = new Date(), offsetWeeks = 0): { start: string; end: string } {
  const d = new Date(ref);
  d.setDate(d.getDate() - offsetWeeks * 7);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: ymd(monday), end: ymd(sunday) };
}

// Month containing `ref` (default today). offsetMonths shifts back.
export function monthRange(ref = new Date(), offsetMonths = 0): { start: string; end: string } {
  const first = new Date(ref.getFullYear(), ref.getMonth() - offsetMonths, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  return { start: ymd(first), end: ymd(last) };
}

// ---------- Formatting helpers ----------

const STATUS_LABEL: Record<string, string> = {
  ready: 'พร้อมใช้ / Ready',
  monitor: 'เฝ้าระวัง / Monitor',
  not_ready: 'ไม่พร้อม / Not Ready',
};

function statusLabel(s: string): string {
  return STATUS_LABEL[s] || s || '-';
}

function formatDateTH(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ---------- CSV / Excel export ----------

function csvEscape(value: string | number | boolean): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportReportToCSV(data: ReportData, label: string): { fileName: string } {
  const rows: string[] = [];

  rows.push(`รายงานการตรวจสอบรถพยาบาล / Ambulance Inspection Report`);
  rows.push(`ช่วงเวลา / Period,${data.start} ถึง ${data.end}`);
  rows.push('');

  // Summary block
  rows.push('สรุป / Summary');
  rows.push(`การตรวจสอบทั้งหมด / Total Inspections,${data.summary.totalInspections}`);
  rows.push(`พร้อมใช้ / Ready,${data.summary.readyVehicles}`);
  rows.push(`เฝ้าระวัง / Monitor,${data.summary.monitorVehicles}`);
  rows.push(`ไม่พร้อม / Not Ready,${data.summary.notReadyVehicles}`);
  rows.push(`HOD อนุมัติ / Approved,${data.summary.approvedCount}`);
  rows.push(`อัตราอนุมัติ / Compliance Rate (%),${data.summary.complianceRate}`);
  rows.push('');

  // Detail table
  rows.push('รายละเอียด / Details');
  const header = [
    'วันที่ / Date',
    'หมายเลขรถ / Vehicle',
    'สถานะ / Status',
    'คนขับ / Driver',
    'เคลื่อนย้าย / Escort',
    'พยาบาล / Nurse',
    'HOD อนุมัติ / Approved',
    'รายการผิดปกติ / Abnormal',
  ];
  rows.push(header.map(csvEscape).join(','));
  for (const d of data.details) {
    rows.push(
      [
        d.date,
        d.vehicle,
        statusLabel(d.status),
        d.driverCompleted ? 'เสร็จ' : 'รอ',
        d.equipmentCompleted ? 'เสร็จ' : 'รอ',
        d.nurseCompleted ? 'เสร็จ' : 'รอ',
        d.hodApproved ? 'อนุมัติ' : 'ยังไม่',
        d.abnormalCount,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  rows.push('');

  // Common issues
  if (data.commonIssues.length > 0) {
    rows.push('ปัญหาที่พบบ่อย / Common Issues');
    rows.push('รายการ / Item,จำนวนครั้ง / Count');
    for (const it of data.commonIssues) {
      rows.push([it.issue, it.count].map(csvEscape).join(','));
    }
  }

  // BOM so Excel opens Thai text as UTF-8
  const csv = '﻿' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const fileName = `Report_${label}_${data.start}_${data.end}.csv`;
  triggerDownload(blob, fileName);
  return { fileName };
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- PDF summary report ----------

export async function exportReportToPDF(
  data: ReportData,
  label: string
): Promise<{ success: boolean; fileName?: string; error?: unknown }> {
  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '24px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, "Noto Sans Thai", sans-serif';

    const s = data.summary;
    const total = s.totalInspections || 0;
    const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : '0');

    const vehicleRows = data.vehicles
      .map(
        (v) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;">${v.vehicle}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;">${v.total}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;color:#166534;">${v.ready}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;color:#92400e;">${v.monitor}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;color:#991b1b;">${v.notReady}</td>
        </tr>`
      )
      .join('');

    const issueRows = data.commonIssues
      .slice(0, 10)
      .map(
        (it) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;">${it.issue}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:center;font-weight:bold;color:#991b1b;">${it.count}</td>
        </tr>`
      )
      .join('');

    container.innerHTML = `
      <div>
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="font-size:22px;margin:0 0 4px;">Bangkok Siriroj Hospital</h1>
          <h2 style="font-size:18px;margin:0 0 4px;">รายงานสรุปการตรวจสอบรถพยาบาล</h2>
          <h3 style="font-size:14px;color:#666;margin:0;">Ambulance Inspection Report — ${label}</h3>
          <p style="font-size:13px;color:#444;margin:8px 0 0;">
            ช่วงเวลา / Period: <strong>${formatDateTH(data.start)} — ${formatDateTH(data.end)}</strong>
          </p>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:20px;">
          ${summaryCell('ทั้งหมด / Total', total, '#1e40af')}
          ${summaryCell('พร้อมใช้ / Ready', `${s.readyVehicles} (${pct(s.readyVehicles)}%)`, '#166534')}
          ${summaryCell('เฝ้าระวัง / Monitor', `${s.monitorVehicles} (${pct(s.monitorVehicles)}%)`, '#92400e')}
          ${summaryCell('ไม่พร้อม / Not Ready', `${s.notReadyVehicles} (${pct(s.notReadyVehicles)}%)`, '#991b1b')}
        </div>

        <div style="margin-bottom:8px;padding:10px 14px;background:#eff6ff;border-radius:6px;font-size:14px;">
          อัตราอนุมัติ (Compliance): <strong>${s.complianceRate}%</strong>
          &nbsp;·&nbsp; HOD อนุมัติ: <strong>${s.approvedCount} / ${total}</strong>
        </div>

        <h3 style="font-size:16px;margin:20px 0 8px;border-bottom:2px solid #1e40af;padding-bottom:4px;">
          ประสิทธิภาพแต่ละคัน / Per-Vehicle
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">รถ / Vehicle</th>
              <th style="padding:6px;border:1px solid #ddd;">ทั้งหมด</th>
              <th style="padding:6px;border:1px solid #ddd;">พร้อม</th>
              <th style="padding:6px;border:1px solid #ddd;">เฝ้าระวัง</th>
              <th style="padding:6px;border:1px solid #ddd;">ไม่พร้อม</th>
            </tr>
          </thead>
          <tbody>${vehicleRows || '<tr><td colspan="5" style="padding:8px;text-align:center;color:#888;">ไม่มีข้อมูล</td></tr>'}</tbody>
        </table>

        ${
          data.commonIssues.length > 0
            ? `
        <h3 style="font-size:16px;margin:20px 0 8px;border-bottom:2px solid #1e40af;padding-bottom:4px;">
          ปัญหาที่พบบ่อย / Common Issues
        </h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">รายการ / Item</th>
              <th style="padding:6px;border:1px solid #ddd;">จำนวนครั้ง</th>
            </tr>
          </thead>
          <tbody>${issueRows}</tbody>
        </table>`
            : ''
        }

        <div style="margin-top:28px;padding-top:16px;border-top:2px solid #ddd;text-align:center;color:#666;font-size:11px;">
          <p style="margin:2px;">Generated on ${new Date(data.generatedAt).toLocaleString('th-TH')}</p>
          <p style="margin:2px;">Bangkok Siriroj Hospital — Ambulance Inspection System</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    // Slice across pages if the content is taller than one A4 page.
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `Report_${label}_${data.start}_${data.end}.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating report PDF:', error);
    return { success: false, error };
  }
}

function summaryCell(label: string, value: string | number, color: string): string {
  return `
    <div style="flex:1;padding:12px;border-radius:8px;background:${color};color:white;text-align:center;">
      <div style="font-size:12px;opacity:0.9;">${label}</div>
      <div style="font-size:22px;font-weight:bold;margin-top:4px;">${value}</div>
    </div>`;
}
