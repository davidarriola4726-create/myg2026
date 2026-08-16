import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import {
  Vehicle,
  VehicleRecord,
  MaintenanceCategory,
  AlertStatus,
} from '../types';
import {
  ArrowLeft,
  Wrench,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Calendar,
  Gauge,
  User,
  Fuel,
  FileText,
  DollarSign,
  Trash2,
  Edit2,
  Clock,
  ShieldAlert,
  Tag,
  Check,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';

interface VehicleDetailFolderProps {
  vehicleId: string;
  onBack: () => void;
  onNavigateToWorkOrderWithPlate?: (plate: string) => void;
}

type SubFolderTab = 'reparaciones' | 'cambios' | 'mantenimiento' | 'servicios' | 'combustible' | 'repuestos';

export const VehicleDetailFolder: React.FC<VehicleDetailFolderProps> = ({
  vehicleId,
  onBack,
  onNavigateToWorkOrderWithPlate,
}) => {
  const {
    state,
    updateVehicle,
    deleteVehicle,
    getVehicleAlertStatus,
    addRecord,
    deleteRecord,
    updateRecord,
    addService,
  } = useFleet();

  const vehicle = state.vehicles.find((v) => v.id === vehicleId);

  const [activeTab, setActiveTab] = useState<SubFolderTab>('reparaciones');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);

  // Form state for adding a record
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recDate, setRecDate] = useState(new Date().toISOString().slice(0, 10));
  const [recMileage, setRecMileage] = useState(vehicle ? vehicle.currentMileage : 0);
  const [recCost, setRecCost] = useState<number | ''>('');
  const [recTech, setRecTech] = useState('Taller Central MYG');
  const [recStatus, setRecStatus] = useState<'completado' | 'en_proceso' | 'programado'>('completado');
  const [recParts, setRecParts] = useState('');
  const [recInvoice, setRecInvoice] = useState('');

  // Form state for scheduling a service
  const [srvTitle, setSrvTitle] = useState('');
  const [srvCategory, setSrvCategory] = useState<MaintenanceCategory>('mantenimiento');
  const [srvDate, setSrvDate] = useState('');
  const [srvKm, setSrvKm] = useState<number | ''>('');
  const [srvNotes, setSrvNotes] = useState('');

  if (!vehicle) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800">
        <p className="text-slate-400">Vehículo no encontrado.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const alert = getVehicleAlertStatus(vehicle);

  // Filter records for this vehicle
  const vehicleRecords = state.records.filter((r) => r.vehicleId === vehicle.id);
  const tabRecords = vehicleRecords.filter((r) => r.category === activeTab);

  // Associated fuel logs and spare parts
  const vehicleFuelLogs = state.fuelLogs.filter((f) => f.vehicleId === vehicle.id || f.plate === vehicle.plate);
  const vehicleSpareParts = state.spareParts.filter((p) => p.vehiclePlate === vehicle.plate);

  // Total costs on this vehicle
  const totalRecordsCost = vehicleRecords.reduce((sum, r) => sum + (r.costInQuetzales || 0), 0);
  const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + (f.weeklyQuetzales || 0), 0);
  const totalPartsCost = vehicleSpareParts.reduce((sum, p) => sum + (p.priceQuetzales * p.quantity || 0), 0);

  const subFolders: { id: SubFolderTab; label: string; icon: React.FC<{ className?: string }>; count: number }[] = [
    {
      id: 'reparaciones',
      label: '1. Reparaciones',
      icon: Wrench,
      count: vehicleRecords.filter((r) => r.category === 'reparaciones').length,
    },
    {
      id: 'cambios',
      label: '2. Cambios',
      icon: RefreshCw,
      count: vehicleRecords.filter((r) => r.category === 'cambios').length,
    },
    {
      id: 'mantenimiento',
      label: '3. Mantenimiento',
      icon: Sliders,
      count: vehicleRecords.filter((r) => r.category === 'mantenimiento').length,
    },
    {
      id: 'servicios',
      label: '4. Servicios',
      icon: CheckCircle2,
      count: vehicleRecords.filter((r) => r.category === 'servicios').length,
    },
    {
      id: 'combustible',
      label: 'Combustible',
      icon: Fuel,
      count: vehicleFuelLogs.length,
    },
    {
      id: 'repuestos',
      label: 'Repuestos Asignados',
      icon: Tag,
      count: vehicleSpareParts.length,
    },
  ];

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) return;

    const partsList = recParts
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addRecord({
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      category: activeTab === 'combustible' || activeTab === 'repuestos' ? 'mantenimiento' : activeTab,
      title: recTitle,
      description: recDesc,
      date: recDate,
      mileageAtService: Number(recMileage) || vehicle.currentMileage,
      costInQuetzales: Number(recCost) || 0,
      technician: recTech,
      status: recStatus,
      partsReplaced: partsList,
      invoiceNumber: recInvoice,
    });

    // Reset form
    setRecTitle('');
    setRecDesc('');
    setRecCost('');
    setRecParts('');
    setRecInvoice('');
    setShowAddRecordModal(false);
  };

  const handleScheduleService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim() || !srvDate) return;

    addService({
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      title: srvTitle,
      category: srvCategory,
      scheduledDate: srvDate,
      scheduledKm: srvKm ? Number(srvKm) : undefined,
      notes: srvNotes,
      status: 'pendiente',
    });

    // Also update vehicle next maintenance date/km
    updateVehicle(vehicle.id, {
      nextMaintenanceDate: srvDate,
      nextMaintenanceKm: srvKm ? Number(srvKm) : vehicle.nextMaintenanceKm,
    });

    setSrvTitle('');
    setSrvDate('');
    setSrvKm('');
    setSrvNotes('');
    setShowScheduleModal(false);
  };

  const handleUpdateMileageQuick = () => {
    const promptKm = window.prompt(`Actualizar kilometraje actual para ${vehicle.plate}:`, vehicle.currentMileage.toString());
    if (promptKm && !isNaN(Number(promptKm))) {
      updateVehicle(vehicle.id, { currentMileage: Number(promptKm) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Placas</span>
        </button>

        <div className="flex items-center gap-2">
          {onNavigateToWorkOrderWithPlate && (
            <button
              onClick={() => onNavigateToWorkOrderWithPlate(vehicle.plate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generar Hoja de Campo</span>
            </button>
          )}

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Programar Mantenimiento</span>
          </button>
        </div>
      </div>

      {/* Vehicle Dossier Master Header Card (Placa Guatemala Style) */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#121824] border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Background Alert Tint */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            alert.status === 'danger'
              ? 'bg-red-500'
              : alert.status === 'warning'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: License Plate Badge + Model Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Guatemalan Plate Graphic */}
            <div className="flex flex-col items-center justify-center bg-white text-slate-950 font-black rounded-lg border-2 border-slate-400 px-4 py-2 shadow-lg tracking-wider select-none shrink-0 min-w-[150px]">
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-bold border-b border-slate-300 w-full text-center pb-0.5">
                GUATEMALA C.A.
              </span>
              <span className="text-2xl sm:text-3xl font-mono tracking-widest text-slate-950 font-black">
                {vehicle.plate}
              </span>
              <span className="text-[8px] font-bold text-red-600 tracking-wider uppercase">
                {vehicle.type}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                  {vehicle.year}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    vehicle.status === 'active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : vehicle.status === 'in_shop'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {vehicle.status === 'active'
                    ? 'Operativo'
                    : vehicle.status === 'in_shop'
                    ? 'En Taller'
                    : 'Inactivo'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chofer: <strong>{vehicle.driverName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>Km Actual: <strong className="font-mono">{vehicle.currentMileage.toLocaleString()} km</strong></span>
                  <button
                    onClick={handleUpdateMileageQuick}
                    title="Actualizar odómetro"
                    className="text-red-400 hover:text-red-300 ml-1"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Combustible: <strong>{vehicle.fuelType}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Color Alert Status Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between shrink-0 min-w-[220px] ${
              alert.status === 'danger'
                ? 'bg-red-950/60 border-red-700/80 text-red-200'
                : alert.status === 'warning'
                ? 'bg-amber-950/60 border-amber-700/80 text-amber-200'
                : 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Estado Mantenimiento
              </span>
              {alert.status === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              ) : alert.status === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="my-1.5">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-black uppercase tracking-wide ${
                  alert.status === 'danger'
                    ? 'bg-red-600 text-white'
                    : alert.status === 'warning'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {alert.status === 'danger'
                  ? '🔴 Vencido'
                  : alert.status === 'warning'
                  ? '🟡 Próximo'
                  : '🟢 Al Día'}
              </span>
              <p className="text-xs font-medium mt-1">{alert.label}</p>
            </div>

            <div className="text-[11px] opacity-80 pt-1 border-t border-current/20 flex justify-between">
              <span>Programado: {vehicle.nextMaintenanceDate}</span>
              <span>{vehicle.nextMaintenanceKm.toLocaleString()} km</span>
            </div>
          </div>
        </div>

        {/* Financial mini-bar for this vehicle */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Gastos Taller / Reparaciones</span>
            <span className="font-bold text-white font-mono">Q {totalRecordsCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Combustible Acumulado</span>
            <span className="font-bold text-amber-400 font-mono">Q {totalFuelCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Repuestos Asignados</span>
            <span className="font-bold text-sky-400 font-mono">Q {totalPartsCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Inversión Unidad</span>
            <span className="font-bold text-emerald-400 font-mono">
              Q {(totalRecordsCost + totalFuelCost + totalPartsCost).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Subfolder Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {subFolders.map((sub) => {
            const Icon = sub.icon;
            const isCurrent = activeTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveTab(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-red-400'}`} />
                <span>{sub.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isCurrent ? 'bg-white text-red-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab !== 'combustible' && activeTab !== 'repuestos' && (
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold border border-red-500/40 transition-all cursor-pointer shrink-0 ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Registro en</span> {activeTab}
          </button>
        )}
      </div>

      {/* Subfolder Content Area */}
      <div className="space-y-4">
        {/* Render Records for Reparaciones, Cambios, Mantenimiento, Servicios */}
        {(activeTab === 'reparaciones' ||
          activeTab === 'cambios' ||
          activeTab === 'mantenimiento' ||
          activeTab === 'servicios') && (
          <div>
            {tabRecords.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-slate-400 text-sm">
                  No hay registros de <strong className="text-red-400 capitalize">{activeTab}</strong> archivados para la placa {vehicle.plate}.
                </p>
                <button
                  onClick={() => setShowAddRecordModal(true)}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  + Agregar primer registro de {activeTab}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tabRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {rec.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-red-400" />
                            {rec.date} • <Gauge className="w-3 h-3 text-slate-400 ml-1" /> {rec.mileageAtService.toLocaleString()} km
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            rec.status === 'completado'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : rec.status === 'en_proceso'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                        {rec.description}
                      </p>

                      {/* Parts replaced tags */}
                      {rec.partsReplaced && rec.partsReplaced.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-400 mr-1">Repuestos:</span>
                          {rec.partsReplaced.map((part, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] border border-slate-700"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Técnico:</span>{' '}
                        <strong className="text-slate-200">{rec.technician}</strong>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            Q {rec.costInQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Desea eliminar este registro?')) {
                              deleteRecord(rec.id);
                            }
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render Fuel Log for this unit */}
        {activeTab === 'combustible' && (
          <div className="space-y-3">
            {vehicleFuelLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl text-slate-400 text-xs">
                No hay consumos de combustible registrados para esta placa.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Semana</th>
                      <th className="p-3">Fechas</th>
                      <th className="p-3">Galones</th>
                      <th className="p-3">Km Recorridos</th>
                      <th className="p-3">Rendimiento (Km/Gal)</th>
                      <th className="p-3">Gasto Semanal (Q)</th>
                      <th className="p-3">Chofer / Estación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {vehicleFuelLogs.map((log) => {
                      const efficiency = log.gallons > 0 ? (log.kmTraveled / log.gallons).toFixed(1) : '-';
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-red-400">Semana {log.weekNumber}</td>
                          <td className="p-3">{log.startDate} al {log.endDate}</td>
                          <td className="p-3 font-mono">{log.gallons} gal</td>
                          <td className="p-3 font-mono">{log.kmTraveled.toLocaleString()} km</td>
                          <td className="p-3 font-mono text-emerald-400 font-semibold">{efficiency} km/gal</td>
                          <td className="p-3 font-mono font-bold text-amber-400">
                            Q {log.weeklyQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-slate-400">{log.driver} • {log.stationName || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Render Spare Parts assigned to this unit */}
        {activeTab === 'repuestos' && (
          <div className="space-y-3">
            {vehicleSpareParts.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-xl text-slate-400 text-xs">
                No hay repuestos registrados en la hoja de cálculo para la placa {vehicle.plate}.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Nombre del Repuesto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Precio Unitario (Q)</th>
                      <th className="p-3">Cantidad</th>
                      <th className="p-3">Total (Q)</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Proveedor / Código</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {vehicleSpareParts.map((part) => (
                      <tr key={part.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white">{part.name}</td>
                        <td className="p-3">{part.category}</td>
                        <td className="p-3 font-mono text-slate-300">
                          Q {part.priceQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono">{part.quantity}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          Q {(part.priceQuetzales * part.quantity).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              part.status === 'instalado'
                                ? 'bg-emerald-950 text-emerald-400'
                                : part.status === 'comprado'
                                ? 'bg-sky-950 text-sky-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {part.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{part.supplier || 'N/A'} {part.referenceCode ? `(${part.referenceCode})` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add New Record */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" />
                <span>Nuevo Registro en <span className="uppercase text-red-400">{activeTab}</span></span>
              </h3>
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título del Trabajo *</label>
                <input
                  type="text"
                  required
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="Ej. Cambio de Aceite 15W40, Reparación de Frenos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detalle del Proceso / Descripción *</label>
                <textarea
                  rows={3}
                  required
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  placeholder="Detalle los trabajos realizados, pruebas de calibración..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha de Realización</label>
                  <input
                    type="date"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kilometraje al Servicio</label>
                  <input
                    type="number"
                    value={recMileage}
                    onChange={(e) => setRecMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Costo en Quetzales (Q)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">Q</span>
                    <input
                      type="number"
                      step="0.01"
                      value={recCost}
                      onChange={(e) => setRecCost(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estado</label>
                  <select
                    value={recStatus}
                    onChange={(e) => setRecStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="completado">Completado</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="programado">Programado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Técnico Encargado</label>
                  <input
                    type="text"
                    value={recTech}
                    onChange={(e) => setRecTech(e.target.value)}
                    placeholder="Nombre del técnico"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Factura / Orden Ref.</label>
                  <input
                    type="text"
                    value={recInvoice}
                    onChange={(e) => setRecInvoice(e.target.value)}
                    placeholder="FAC-1234"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Repuestos Utilizados (separados por coma)</label>
                <input
                  type="text"
                  value={recParts}
                  onChange={(e) => setRecParts(e.target.value)}
                  placeholder="Filtro de aceite, 4 bujías, faja alternador"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Future Service */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Programar Próximo Mantenimiento</span>
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleService} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Servicio / Rutina *</label>
                <input
                  type="text"
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="Ej. Servicio Mayor 50,000 km, Rotación y Frenos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="cambios">Cambios</option>
                    <option value="servicios">Servicios</option>
                    <option value="reparaciones">Reparaciones</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={srvDate}
                    onChange={(e) => setSrvDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kilometraje Límite / Meta</label>
                <input
                  type="number"
                  value={srvKm}
                  onChange={(e) => setSrvKm(e.target.value ? Number(e.target.value) : '')}
                  placeholder={`Mayor a ${vehicle.currentMileage.toLocaleString()} km`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas e Instrucciones</label>
                <textarea
                  rows={2}
                  value={srvNotes}
                  onChange={(e) => setSrvNotes(e.target.value)}
                  placeholder="Detalles sobre filtros o repuestos a pedir con anticipación..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Guardar y Actualizar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
