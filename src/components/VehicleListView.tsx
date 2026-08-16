import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle, AlertStatus } from '../types';
import {
  Car,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Gauge,
  User,
  Calendar,
  Fuel,
  ChevronRight,
  FolderOpen,
  Trash2,
  Wrench,
} from 'lucide-react';

interface VehicleListViewProps {
  onSelectVehicle: (id: string) => void;
  onOpenNewVehicleModal: () => void;
}

export const VehicleListView: React.FC<VehicleListViewProps> = ({
  onSelectVehicle,
  onOpenNewVehicleModal,
}) => {
  const { state, getVehicleAlertStatus, deleteVehicle } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredVehicles = state.vehicles.filter((v) => {
    const alert = getVehicleAlertStatus(v);
    const matchesSearch =
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesType = typeFilter === 'all' || v.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const okCount = state.vehicles.filter((v) => getVehicleAlertStatus(v).status === 'ok').length;
  const warningCount = state.vehicles.filter((v) => getVehicleAlertStatus(v).status === 'warning').length;
  const dangerCount = state.vehicles.filter((v) => getVehicleAlertStatus(v).status === 'danger').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-red-500" />
            <span>Fichas y Subcarpetas por Placa</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Seleccione una placa para ver sus reparaciones, cambios de repuestos, servicios y mantenimiento.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicleModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Vehículo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa (Ej. P-340HKL), chofer o marca..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Alert Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({state.vehicles.length})
            </button>

            <button
              onClick={() => setStatusFilter('ok')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'ok'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Al Día ({okCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('warning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'warning'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40 border border-amber-900/50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Próximos ({warningCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('danger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'danger'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-950 text-red-400 hover:bg-red-950/40 border border-red-900/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Vencidos ({dangerCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 text-sm font-medium">No se encontraron vehículos con los filtros aplicados.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="mt-3 text-xs text-red-400 hover:underline"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((vehicle) => {
            const alert = getVehicleAlertStatus(vehicle);
            const repairsCount = state.records.filter(
              (r) => r.vehicleId === vehicle.id && r.category === 'reparaciones'
            ).length;
            const changesCount = state.records.filter(
              (r) => r.vehicleId === vehicle.id && r.category === 'cambios'
            ).length;
            const maintenanceCount = state.records.filter(
              (r) => r.vehicleId === vehicle.id && r.category === 'mantenimiento'
            ).length;
            const servicesCount = state.records.filter(
              (r) => r.vehicleId === vehicle.id && r.category === 'servicios'
            ).length;

            return (
              <div
                key={vehicle.id}
                className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 transition-all p-5 shadow-lg flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top Status Alert Stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    alert.status === 'danger'
                      ? 'bg-red-500'
                      : alert.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                />

                <div>
                  {/* License Plate & Alert Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Plate Stamp */}
                    <div className="flex items-center gap-2">
                      <div className="bg-white text-slate-950 font-black px-3 py-1 rounded-md border border-slate-400 font-mono text-sm tracking-wider shadow-sm select-none">
                        {vehicle.plate}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {vehicle.type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        alert.status === 'danger'
                          ? 'bg-red-600 text-white'
                          : alert.status === 'warning'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {alert.status === 'danger'
                        ? 'Vencido'
                        : alert.status === 'warning'
                        ? 'Próximo'
                        : 'Al Día'}
                    </span>
                  </div>

                  {/* Brand & Model */}
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Año {vehicle.year} • Color: {vehicle.color}
                  </p>

                  {/* Quick Specs */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Chofer:
                      </span>
                      <strong className="text-white truncate max-w-[140px]">{vehicle.driverName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-slate-500" /> Odómetro:
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {vehicle.currentMileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Próx. Mantenimiento:
                      </span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          alert.status === 'danger'
                            ? 'text-red-400'
                            : alert.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {vehicle.nextMaintenanceDate}
                      </span>
                    </div>
                  </div>

                  {/* Alert summary text */}
                  <div
                    className={`mt-2.5 text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                      alert.status === 'danger'
                        ? 'bg-red-950/60 text-red-300 border border-red-900/60'
                        : alert.status === 'warning'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-900/60'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/60'
                    }`}
                  >
                    {alert.label}
                  </div>

                  {/* Subfolder Counts Indicators */}
                  <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="block text-slate-500 font-semibold">Reparac.</span>
                      <span className="font-bold text-white font-mono">{repairsCount}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="block text-slate-500 font-semibold">Cambios</span>
                      <span className="font-bold text-white font-mono">{changesCount}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="block text-slate-500 font-semibold">Mantenim.</span>
                      <span className="font-bold text-white font-mono">{maintenanceCount}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="block text-slate-500 font-semibold">Servicios</span>
                      <span className="font-bold text-white font-mono">{servicesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Desea eliminar el vehículo ${vehicle.plate}? Se borrarán también sus registros.`)) {
                        deleteVehicle(vehicle.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Eliminar vehículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-md shadow-red-700/20 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Abrir Ficha / Subcarpeta</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
