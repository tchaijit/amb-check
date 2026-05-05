// Shared in-memory mock store used when the database is unavailable.
// Module singleton so all route handlers share the same data within a process.

import { todayBangkok } from './dates';

declare global {
  // eslint-disable-next-line no-var
  var __ambMockStore: AmbMockStore | undefined;
}

interface MockInspection {
  id: number;
  ambulanceId: number;
  inspectionDate: string;
  overallStatus: string | null;
  driverCompleted: boolean;
  equipmentOfficerCompleted: boolean;
  nurseCompleted: boolean;
  hodApproved: boolean;
  hodApprovedAt: Date | null;
  hodApprovedBy: number | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  vehicleNumber?: string;
  licensePlate?: string;
}

interface AmbMockStore {
  inspections: Map<number, MockInspection>;
  items: Map<number, any[]>;
  nextId: number;
}

function createStore(): AmbMockStore {
  return {
    inspections: new Map(),
    items: new Map(),
    nextId: 1,
  };
}

export const mockStore: AmbMockStore =
  globalThis.__ambMockStore ?? (globalThis.__ambMockStore = createStore());

export function getMockInspectionsByDate(date: string): MockInspection[] {
  return Array.from(mockStore.inspections.values()).filter(
    (i) => i.inspectionDate === date
  );
}

export function getMockTodayInspection(ambulanceId: number): MockInspection | null {
  const today = todayBangkok();
  for (const ins of mockStore.inspections.values()) {
    if (ins.ambulanceId === ambulanceId && ins.inspectionDate === today) {
      return ins;
    }
  }
  return null;
}

export function createMockInspection(ambulanceId: number, ambulanceMeta?: { vehicleNumber?: string; licensePlate?: string }): MockInspection {
  const today = todayBangkok();
  const id = mockStore.nextId++;
  const inspection: MockInspection = {
    id,
    ambulanceId,
    inspectionDate: today,
    overallStatus: null,
    driverCompleted: false,
    equipmentOfficerCompleted: false,
    nurseCompleted: false,
    hodApproved: false,
    hodApprovedAt: null,
    hodApprovedBy: null,
    remarks: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    vehicleNumber: ambulanceMeta?.vehicleNumber,
    licensePlate: ambulanceMeta?.licensePlate,
  };
  mockStore.inspections.set(id, inspection);
  return inspection;
}

export function getMockInspection(id: number): MockInspection | undefined {
  return mockStore.inspections.get(id);
}

export function setMockInspection(id: number, inspection: MockInspection): void {
  mockStore.inspections.set(id, inspection);
}

export function getMockItems(inspectionId: number): any[] {
  return mockStore.items.get(inspectionId) || [];
}

export function setMockItems(inspectionId: number, items: any[]): void {
  const existing = mockStore.items.get(inspectionId) || [];
  const incomingRoles = new Set(items.map((it) => it.inspectorRole).filter(Boolean));
  // Keep items from roles NOT being saved this round; replace items for roles in this batch.
  const kept = existing.filter((it) => !incomingRoles.has(it.inspectorRole));
  mockStore.items.set(inspectionId, [...kept, ...items]);
}
