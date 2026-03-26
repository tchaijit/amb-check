'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { INSPECTION_CHECKLIST, getChecklistByRole } from '@/lib/checklist-data';
import type { InspectionItem } from '@/lib/types';

export default function InspectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [userRole, setUserRole] = useState<'driver' | 'equipment_officer' | 'nurse'>('driver');
  const [inspection, setInspection] = useState<any>(null);
  const [items, setItems] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (session?.user?.role && session.user.role !== 'hod') {
      setUserRole(session.user.role as 'driver' | 'equipment_officer' | 'nurse');
    }
    fetchInspection();
  }, [id, session]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setInspection(data.inspection);

      const itemsMap: Record<string, any> = {};
      data.items.forEach((item: any) => {
        if (item.itemCode) {
          const processedItem = { ...item };

          // Convert 'fixed' status to 'abnormal' with fixed flag
          if (item.status === 'fixed') {
            processedItem.status = 'abnormal';
            processedItem.fixed = true;
          }

          // Parse dual tank values from "Tank1: xxx PSI, Tank2: yyy PSI" format
          if (item.value && typeof item.value === 'string' && item.value.includes('Tank1:')) {
            const tank1Match = item.value.match(/Tank1:\s*(\d+|-)/);
            const tank2Match = item.value.match(/Tank2:\s*(\d+|-)/);
            if (tank1Match) processedItem.tank1 = tank1Match[1] !== '-' ? tank1Match[1] : '';
            if (tank2Match) processedItem.tank2 = tank2Match[1] !== '-' ? tank2Match[1] : '';
          }

          itemsMap[item.itemCode] = processedItem;
        }
      });
      setItems(itemsMap);
    } catch (error) {
      console.error('Error fetching inspection:', error);
      // Use mock data when API is not available
      setInspection({
        id: parseInt(id),
        ambulanceId: 1,
        vehicleNumber: 'AMB-001',
        licensePlate: 'กก-1234',
        inspectionDate: new Date(),
        driverCompleted: false,
        equipmentOfficerCompleted: false,
        nurseCompleted: false,
        hodApproved: false,
      });
      setItems({});
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (code: string, field: string, value: any) => {
    setItems(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value,
      }
    }));
  };

  const getGaugeColor = (level: number, itemCode: string, psiConfig?: { min: number; max: number; threshold: number }) => {
    if (psiConfig) {
      // PSI mode - level is actual PSI value
      const pct = (level / psiConfig.max) * 100;
      const thresholdPct = (psiConfig.threshold / psiConfig.max) * 100;
      if (pct >= thresholdPct + 20) return 'bg-green-500';
      if (pct >= thresholdPct) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    // Percentage mode
    if (itemCode === '5') {
      if (level >= 75) return 'bg-green-500';
      if (level >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (level >= 70) return 'bg-green-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGaugeLabel = (level: number, itemCode: string, psiConfig?: { min: number; max: number; threshold: number }) => {
    if (psiConfig) {
      // PSI mode
      if (level >= psiConfig.threshold) return 'ปกติ / Normal';
      if (level >= psiConfig.threshold * 0.5) return 'ต่ำ / Low';
      return 'ต่ำมาก / Very Low';
    }
    // Percentage mode
    if (itemCode === '5') {
      if (level >= 75) return 'ปกติ / Normal';
      if (level >= 50) return 'ต่ำ / Low';
      return 'ต่ำมาก / Very Low';
    }
    if (level >= 70) return 'ปกติ / Normal';
    if (level >= 40) return 'ต่ำ / Low';
    return 'ต่ำมาก / Very Low';
  };

  const getMinThreshold = (itemCode: string, psiConfig?: { min: number; max: number; threshold: number }) => {
    if (psiConfig) {
      return psiConfig.threshold;
    }
    return itemCode === '5' ? 75 : 40;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate employee ID
    if (!employeeId.trim()) {
      alert('กรุณากรอก ID พนักงาน / Please enter Employee ID');
      return;
    }

    setSaving(true);

    try {
      const checklist = getChecklistByRole(userRole);
      const itemsToSave = checklist.map(checkItem => {
        const itemStatus = items[checkItem.code]?.status || 'normal';
        const isFixed = items[checkItem.code]?.fixed === true;

        // Handle dual tanks
        let value = items[checkItem.code]?.value || null;
        if (checkItem.dualTanks && (items[checkItem.code]?.tank1 || items[checkItem.code]?.tank2)) {
          value = `Tank1: ${items[checkItem.code]?.tank1 || '-'} PSI, Tank2: ${items[checkItem.code]?.tank2 || '-'} PSI`;
        }

        return {
          category: checkItem.category,
          itemName: checkItem.name,
          itemCode: checkItem.code,
          inspectorRole: checkItem.inspectorRole,
          status: (itemStatus === 'abnormal' && isFixed) ? 'fixed' : itemStatus,
          value: value,
          remarks: items[checkItem.code]?.remarks || null,
          inspectedBy: parseInt(employeeId) || 1,
        };
      });

      const response = await fetch(`/api/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToSave,
          role: userRole,
          completed: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('บันทึกสำเร็จ / Inspection saved successfully');
      router.push('/scanner');
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('ไม่สามารถบันทึกได้ / Failed to save inspection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">กำลังโหลด... / Loading...</div>
      </div>
    );
  }

  const checklist = getChecklistByRole(userRole);
  const roleNames = {
    driver: 'เจ้าหน้าที่ยานพาหนะ / Vehicle Officer',
    equipment_officer: 'เจ้าหน้าที่เคลื่อนย้ายผู้ป่วย / Patient Escort',
    nurse: 'พยาบาล / Nurse',
  };

  const completedStatus = {
    driver: inspection?.driverCompleted,
    equipment_officer: inspection?.equipmentOfficerCompleted,
    nurse: inspection?.nurseCompleted,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">แบบฟอร์มตรวจสอบรถพยาบาล</h1>
            <h2 className="text-lg text-gray-600 mb-2">Ambulance Inspection Form</h2>
            <div className="mt-2 inline-block">
              <p className="text-gray-700 bg-blue-50 border-l-4 border-blue-500 px-3 py-2 rounded">
                <span className="font-medium">ตำแหน่ง / Role:</span> <span className="font-bold text-blue-700">{roleNames[userRole]}</span>
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                ID พนักงานผู้ตรวจสอบ / Inspector Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="กรอก ID พนักงาน / Enter Employee ID"
                className="input-field w-full max-w-xs"
                required
              />
            </div>
          </div>
          {completedStatus[userRole] && (
            <span className="status-badge bg-green-100 text-green-800">
              ✓ เสร็จสมบูรณ์ / Completed
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded">
          <div className={`p-3 rounded-lg border-2 ${
            userRole === 'driver' && !inspection?.driverCompleted
              ? 'bg-blue-50 border-blue-500'
              : 'border-transparent'
          }`}>
            <div className={`text-sm font-medium ${
              userRole === 'driver' && !inspection?.driverCompleted
                ? 'text-blue-700'
                : 'text-gray-600'
            }`}>ยานพาหนะ / Vehicle</div>
            <div className={`font-bold ${inspection?.driverCompleted ? 'text-green-600' : userRole === 'driver' ? 'text-blue-600' : 'text-gray-400'}`}>
              {inspection?.driverCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
            </div>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            userRole === 'equipment_officer' && !inspection?.equipmentOfficerCompleted
              ? 'bg-blue-50 border-blue-500'
              : 'border-transparent'
          }`}>
            <div className={`text-sm font-medium ${
              userRole === 'equipment_officer' && !inspection?.equipmentOfficerCompleted
                ? 'text-blue-700'
                : 'text-gray-600'
            }`}>เคลื่อนย้ายผู้ป่วย / Patient Escort</div>
            <div className={`font-bold ${inspection?.equipmentOfficerCompleted ? 'text-green-600' : userRole === 'equipment_officer' ? 'text-blue-600' : 'text-gray-400'}`}>
              {inspection?.equipmentOfficerCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
            </div>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            userRole === 'nurse' && !inspection?.nurseCompleted
              ? 'bg-blue-50 border-blue-500'
              : 'border-transparent'
          }`}>
            <div className={`text-sm font-medium ${
              userRole === 'nurse' && !inspection?.nurseCompleted
                ? 'text-blue-700'
                : 'text-gray-600'
            }`}>พยาบาล / Nurse</div>
            <div className={`font-bold ${inspection?.nurseCompleted ? 'text-green-600' : userRole === 'nurse' ? 'text-blue-600' : 'text-gray-400'}`}>
              {inspection?.nurseCompleted ? '✓ เสร็จแล้ว / Done' : '○ รอดำเนินการ / Pending'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="text-xl font-bold mb-1">รายการตรวจสอบ</h2>
          <h3 className="text-lg text-gray-600 mb-4">Inspection Checklist</h3>

          <div className="space-y-4">
            {checklist.map((item, index) => {
              const isSubItem = item.code.includes('.');
              const hasSubItems = !isSubItem && checklist.some(i => i.code.startsWith(item.code + '.'));

              // If it's a main header with sub-items, only show the header
              if (!isSubItem && hasSubItems) {
                return (
                  <div key={item.code} className="mt-6 mb-2">
                    <div className="bg-blue-50 border-l-4 border-primary px-4 py-3 rounded">
                      <h3 className="text-lg font-bold text-primary">
                        {item.code}.{item.icon && item.icon} {item.name}
                      </h3>
                    </div>
                  </div>
                );
              }

              return (
              <div key={item.code} className={`border-b pb-4 ${isSubItem ? 'ml-8' : 'mt-6'}`}>
                {!isSubItem && (
                  <div className={`border-l-4 px-4 py-3 rounded mb-4 ${
                    items[item.code]?.status === 'abnormal' && items[item.code]?.fixed
                      ? 'bg-green-50 border-green-500'
                      : items[item.code]?.status === 'abnormal'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-primary'
                  }`}>
                    <h3 className={`text-lg font-bold ${
                      items[item.code]?.status === 'abnormal' && items[item.code]?.fixed
                        ? 'text-green-600'
                        : items[item.code]?.status === 'abnormal'
                        ? 'text-red-600'
                        : 'text-primary'
                    }`}>
                      {item.code}.{item.icon && item.icon} {item.name}
                    </h3>
                  </div>
                )}
                <div className={`flex items-start gap-4 ${!isSubItem ? 'px-4' : ''}`}>
                  {isSubItem && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.code}
                    </div>
                  )}
                  <div className="flex-1">
                    {isSubItem && <div className="font-medium mb-2">{item.name}</div>}

                    {item.hasGauge ? (
                      <div className="space-y-3">
                        <div className="relative">
                          {(() => {
                            const isPsiMode = !!item.psiConfig;
                            const defaultValue = isPsiMode ? (item.psiConfig!.max / 2) : 50;
                            const currentValue = items[item.code]?.gaugeLevel ?? defaultValue;
                            const minVal = isPsiMode ? item.psiConfig!.min : 0;
                            const maxVal = isPsiMode ? item.psiConfig!.max : 100;

                            return (
                              <>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>{isPsiMode ? `${minVal} PSI` : 'Min'}</span>
                                  <span className={`font-medium ${getGaugeColor(currentValue, item.code, item.psiConfig).replace('bg-', 'text-')}`}>
                                    {getGaugeLabel(currentValue, item.code, item.psiConfig)}
                                  </span>
                                  <span>{isPsiMode ? `${maxVal} PSI` : 'Max'}</span>
                                </div>
                                <input
                                  type="range"
                                  min={minVal}
                                  max={maxVal}
                                  value={currentValue}
                                  onChange={(e) => {
                                    const level = parseInt(e.target.value);
                                    const threshold = getMinThreshold(item.code, item.psiConfig);
                                    handleItemChange(item.code, 'gaugeLevel', level);
                                    handleItemChange(item.code, 'status', level >= threshold ? 'normal' : 'abnormal');
                                  }}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, #ef4444 0%, #eab308 50%, #22c55e 100%)`
                                  }}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                  {isPsiMode ? (
                                    <>
                                      <span>{minVal}</span>
                                      <span>{Math.floor(maxVal / 2)}</span>
                                      <span>{maxVal}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>0%</span>
                                      <span>50%</span>
                                      <span>100%</span>
                                    </>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          {(() => {
                            const isPsiMode = !!item.psiConfig;
                            const defaultValue = isPsiMode ? (item.psiConfig!.max / 2) : 50;
                            const currentValue = items[item.code]?.gaugeLevel ?? defaultValue;
                            const threshold = getMinThreshold(item.code, item.psiConfig);

                            return (
                              <>
                                <div className={`px-3 py-1 rounded font-medium ${getGaugeColor(currentValue, item.code, item.psiConfig)} text-white`}>
                                  {currentValue}{isPsiMode ? ' PSI' : '%'}
                                </div>
                                {currentValue < threshold && (
                                  <span className="text-red-600 text-xs">
                                    ⚠️ {isPsiMode
                                      ? `ต้องไม่ต่ำกว่า ${threshold} PSI / Must be ≥ ${threshold} PSI`
                                      : item.code === '5'
                                        ? 'ต้องไม่ต่ำกว่า 3/4 ถัง / Must be ≥ 3/4 tank'
                                        : 'ระดับต่ำเกินไป / Level too low'}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {items[item.code]?.status === 'abnormal' && (
                          <>
                            <textarea
                              placeholder="หมายเหตุ (อธิบายปัญหา) / Remarks (describe the issue)"
                              value={items[item.code]?.remarks || ''}
                              onChange={(e) => handleItemChange(item.code, 'remarks', e.target.value)}
                              className="input-field text-sm mt-2"
                              rows={2}
                            />
                            <div className="mt-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={items[item.code]?.fixed === true}
                                  onChange={(e) => handleItemChange(item.code, 'fixed', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-green-600 font-medium">✓ แก้ไขแล้ว / Fixed</span>
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 mb-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`status-${item.code}`}
                              value="normal"
                              checked={items[item.code]?.status !== 'abnormal'}
                              onChange={() => handleItemChange(item.code, 'status', 'normal')}
                              className="w-4 h-4"
                            />
                            <span>ปกติ / Normal</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`status-${item.code}`}
                              value="abnormal"
                              checked={items[item.code]?.status === 'abnormal'}
                              onChange={() => handleItemChange(item.code, 'status', 'abnormal')}
                              className="w-4 h-4"
                            />
                            <span>ผิดปกติ / Abnormal</span>
                          </label>
                        </div>

                        {item.dualTanks ? (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">ถัง 1 / Tank 1 (PSI)</label>
                              <input
                                type="number"
                                placeholder="PSI"
                                value={items[item.code]?.tank1 || ''}
                                onChange={(e) => handleItemChange(item.code, 'tank1', e.target.value)}
                                className="input-field text-sm w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">ถัง 2 / Tank 2 (PSI)</label>
                              <input
                                type="number"
                                placeholder="PSI"
                                value={items[item.code]?.tank2 || ''}
                                onChange={(e) => handleItemChange(item.code, 'tank2', e.target.value)}
                                className="input-field text-sm w-full"
                              />
                            </div>
                          </div>
                        ) : item.hasValue && (
                          <input
                            type="text"
                            placeholder="กรอกค่า เช่น PSI / Enter value (e.g. PSI)"
                            value={items[item.code]?.value || ''}
                            onChange={(e) => handleItemChange(item.code, 'value', e.target.value)}
                            className="input-field text-sm"
                          />
                        )}

                        {items[item.code]?.status === 'abnormal' && (
                          <>
                            <textarea
                              placeholder="หมายเหตุ (อธิบายปัญหา) / Remarks (describe the issue)"
                              value={items[item.code]?.remarks || ''}
                              onChange={(e) => handleItemChange(item.code, 'remarks', e.target.value)}
                              className="input-field text-sm mt-2"
                              rows={2}
                            />
                            <div className="mt-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={items[item.code]?.fixed === true}
                                  onChange={(e) => handleItemChange(item.code, 'fixed', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-green-600 font-medium">✓ แก้ไขแล้ว / Fixed</span>
                              </label>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-success flex-1"
            >
              {saving ? 'กำลังบันทึก... / Saving...' : 'บันทึกการตรวจสอบ / Save Inspection'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/scanner')}
              className="btn-secondary"
            >
              ยกเลิก / Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
