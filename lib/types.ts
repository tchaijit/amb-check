// Types *3+#1#0#'*-#"22%

export type UserRole = 'driver' | 'equipment_officer' | 'nurse' | 'hod';

export type InspectionStatus = 'ready' | 'not_ready' | 'monitor';

export type ItemStatus = 'normal' | 'abnormal' | 'fixed';

export type InspectorRole = 'driver' | 'equipment_officer' | 'nurse';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Ambulance {
  id: number;
  vehicleNumber: string;
  qrCode: string;
  licensePlate: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  id: number;
  ambulanceId: number;
  inspectionDate: Date;
  overallStatus?: InspectionStatus;
  driverCompleted: boolean;
  equipmentOfficerCompleted: boolean;
  nurseCompleted: boolean;
  hodApproved: boolean;
  hodApprovedAt?: Date;
  hodApprovedBy?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  ambulance?: Ambulance;
  items?: InspectionItem[];
}

export interface InspectionItem {
  id: number;
  inspectionId: number;
  category: string;
  itemName: string;
  itemCode?: string;
  inspectorRole: InspectorRole;
  status?: ItemStatus;
  value?: string;
  remarks?: string;
  inspectedBy?: number;
  inspectedAt?: Date;
  createdAt: Date;
}

export interface InspectionChecklistItem {
  code: string;
  name: string;
  category: 'vehicle' | 'equipment' | 'oxygen';
  inspectorRole: InspectorRole;
  hasValue?: boolean;
  hasGauge?: boolean; // For visual Min-Max gauge display
  psiConfig?: { min: number; max: number; threshold: number }; // PSI configuration for oxygen tanks
  dualTanks?: boolean; // For items with 2 separate tank inputs
  icon?: string; // Emoji icon to display after code number
}
