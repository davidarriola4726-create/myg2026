export type AlertStatus = 'ok' | 'warning' | 'danger'; // Verde (Al día), Amarillo (Próximo), Rojo (Vencido)

export type MaintenanceCategory = 'reparaciones' | 'cambios' | 'mantenimiento' | 'servicios';

export interface Vehicle {
  id: string;
  plate: string; // e.g. "P-892FTK" or "C-412BNQ"
  brand: string;
  model: string;
  year: number;
  type: string; // "Camión", "Pickup", "Sedán", "Panel", "Microbús", "Cabezal"
  currentMileage: number;
  driverName: string;
  driverPhone?: string;
  fuelType: 'Diesel' | 'Gasolina Regular' | 'Gasolina Super' | 'Gas GLP';
  color: string;
  status: 'active' | 'in_shop' | 'inactive';
  nextMaintenanceKm: number;
  nextMaintenanceDate: string; // ISO format YYYY-MM-DD
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface VehicleRecord {
  id: string;
  vehicleId: string;
  plate: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  date: string;
  mileageAtService: number;
  costInQuetzales: number;
  technician: string;
  status: 'completado' | 'en_proceso' | 'programado';
  partsReplaced?: string[];
  invoiceNumber?: string;
  warrantyMonths?: number;
  notes?: string;
  createdAt: string;
}

export interface ServiceEvent {
  id: string;
  vehicleId: string;
  plate: string;
  title: string;
  category: MaintenanceCategory;
  scheduledDate: string;
  scheduledKm?: number;
  technician?: string;
  notes?: string;
  status: 'pendiente' | 'en_progreso' | 'realizado' | 'cancelado';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  plate: string;
  weekNumber: number; // 1 to 52
  year: number;
  month: string; // "Enero", "Febrero", etc.
  startDate: string;
  endDate: string;
  weeklyQuetzales: number; // Amount in Q
  gallons: number;
  kmTraveled: number;
  driver: string;
  stationName?: string;
  notes?: string;
  createdAt: string;
}

export interface SparePartItem {
  id: string;
  name: string;
  priceQuetzales: number;
  quantity: number;
  category: string; // 'Filtros', 'Frenos', 'Motor', 'Suspensión', 'Eléctrico', 'Llantas', 'Otros'
  status: 'programado' | 'cotizado' | 'comprado' | 'instalado';
  vehiclePlate?: string;
  supplier?: string;
  referenceCode?: string;
  purchaseDate?: string;
}

export interface FieldWorkOrder {
  id: string;
  orderNumber: string; // e.g. "OT-2026-0042"
  driverName: string;
  vehiclePlate: string;
  vehicleModel?: string;
  vehicleMileage: number;
  maintenanceType: 'Preventivo' | 'Correctivo' | 'Rutina de 5,000 Km' | 'Rutina de 10,000 Km' | 'Emergencia / Auxilio Vial' | 'Revisión General';
  startDate: string; // Fecha de realización
  endDate: string; // Fecha de culminación
  technicianName: string;
  technicianRole?: string;
  processDetails: string; // Datos del proceso
  diagnosticFindings?: string;
  partsUsedList: { name: string; quantity: number; costQ: number }[];
  totalCostQuetzales: number;
  driverSignature?: string; // Base64 data URL from signature canvas
  technicianSignature?: string; // Base64 data URL from signature canvas
  observations?: string;
  vehicleStatusOnDelivery: 'Operativo 100%' | 'Observaciones Pendientes' | 'Requiere Segunda Fase';
  createdAt: string;
}

export interface AppState {
  vehicles: Vehicle[];
  records: VehicleRecord[];
  services: ServiceEvent[];
  fuelLogs: FuelLog[];
  spareParts: SparePartItem[];
  workOrders: FieldWorkOrder[];
  lastSyncTimestamp: number;
}
