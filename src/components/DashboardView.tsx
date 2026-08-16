import React from 'react';
import { useFleet } from '../context/FleetContext';
import { TabType } from './Navbar';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Fuel,
  TableProperties,
  ClipboardCheck,
  Calendar,
  ChevronRight,
  TrendingUp,
  PlusCircle,
  Wrench,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: TabType, vehicleId?: string) => void;
  onOpenNewVehicleModal: () => void;
  onOpenNewWorkOrderModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewVehicleModal,
  onOpenNewWorkOrderModal,
}) => {
  const { state, getVehicleAlertStatus } = useFleet();

  // Categorize vehicles by color alert status
  const vehiclesWithAlert = state.vehicles.map((v) => ({
    vehicle: v,
    alert: getVehicleAlertStatus(v),
  }));

  const okVehicles = vehiclesWithAlert.filter((item) => item.alert.status === 'ok');
  const warningVehicles = vehiclesWithAlert.filter((item) => item.alert.status === 'warning');
  const dangerVehicles = vehiclesWithAlert.filter((item) => item.alert.status === 'danger');

  // Compute total expenses in Quetzales (Q)
  const totalFuelCostQ = state.fuelLogs.reduce((sum, f) => sum + (f.weeklyQuetzales || 0), 0);
  const totalPartsCostQ = state.spareParts.reduce((sum, p) => sum + (p.priceQuetzales * p.quantity || 0), 0);
  const totalRecordsCostQ = state.records.reduce((sum, r) => sum + (r.costInQuetzales || 0), 0);
  const grandTotalExpensesQ = totalFuelCostQ + totalPartsCostQ + totalRecordsCostQ;

  // Recent maintenance / service events
  const upcomingServices = [...state.services]
    .filter((s) => s.status !== 'realizado' && s.status !== 'cancelado')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 4);

  const recentRecords = [...state.records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 tracking-wide uppercase">
                Panel de Control 2026
              </span>
              <span className="text-xs text-slate-400">Guatemala • Moneda Q</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Flota Automotriz MYG
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Monitoreo en tiempo real de mantenimientos, kilometraje por placa, control de combustible y órdenes de trabajo de campo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewVehicleModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Vehículo (Placa)</span>
            </button>
            <button
              onClick={onOpenNewWorkOrderModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span>Hoja de Trabajo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Status Metric Cards with Color Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="group cursor-pointer rounded-xl bg-slate-900/80 border border-slate-800 p-4.5 hover:border-slate-700 transition-all shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Flota</span>
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-white transition-colors">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {state.vehicles.length}
            </span>
            <span className="text-xs text-slate-400">vehículos activos</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-red-400 transition-colors">
            <span>Ver fichas por placa</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Al Día (Verde) */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="group cursor-pointer rounded-xl bg-slate-900/80 border border-emerald-900/40 p-4.5 hover:border-emerald-700/60 transition-all shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Al Día (Verde)</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {okVehicles.length}
            </span>
            <span className="text-xs text-slate-400">en regla</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80 flex items-center gap-1">
            <span>Kilometraje y fecha correctos</span>
          </div>
        </div>

        {/* Próximos (Amarillo) */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="group cursor-pointer rounded-xl bg-slate-900/80 border border-amber-900/40 p-4.5 hover:border-amber-700/60 transition-all shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Próximos (Amarillo)</span>
            <div className="w-9 h-9 rounded-lg bg-amber-950/70 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {warningVehicles.length}
            </span>
            <span className="text-xs text-slate-400">en advertencia</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/80 flex items-center gap-1">
            <span>≤ 1,000 km ó ≤ 15 días</span>
          </div>
        </div>

        {/* Vencidos (Rojo) */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="group cursor-pointer rounded-xl bg-slate-900/80 border border-red-900/50 p-4.5 hover:border-red-700/80 transition-all shadow-md animate-pulse"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Vencidos (Rojo)</span>
            <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
              {dangerVehicles.length}
            </span>
            <span className="text-xs text-slate-400">urgentes</span>
          </div>
          <div className="mt-2 text-[11px] text-red-400/90 flex items-center gap-1 font-semibold">
            <span>Requieren atención inmediata</span>
          </div>
        </div>
      </div>

      {/* Financial Summary in Quetzales (Q) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span>Resumen Financiero Acumulado (Quetzales)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Control de gastos por combustible, repuestos y talleres</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 uppercase font-semibold">Gasto Total Flota</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              Q {grandTotalExpensesQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div
            onClick={() => onNavigate('fuel')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-red-500/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                Combustible Semanal/Mensual
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              Q {totalFuelCostQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{state.fuelLogs.length} registros cargados</div>
          </div>

          <div
            onClick={() => onNavigate('parts')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-red-500/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <TableProperties className="w-3.5 h-3.5 text-sky-400" />
                Hoja de Repuestos (Q)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              Q {totalPartsCostQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{state.spareParts.length} repuestos cotizados/comprados</div>
          </div>

          <div
            onClick={() => onNavigate('vehicles')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-red-500/40 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Wrench className="w-3.5 h-3.5 text-red-400" />
                Reparaciones y Servicios
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-lg font-bold text-white font-mono">
              Q {totalRecordsCostQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{state.records.length} mantenimientos ejecutados</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Urgent Alert Fleet Monitor & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Alert List */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Estado de Alertas por Placa</span>
              </h3>
              <button
                onClick={() => onNavigate('vehicles')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Ver todos
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {dangerVehicles.length === 0 && warningVehicles.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>¡Excelente! Toda la flota se encuentra al día con sus mantenimientos.</span>
                </div>
              ) : (
                <>
                  {dangerVehicles.map(({ vehicle, alert }) => (
                    <div
                      key={vehicle.id}
                      onClick={() => onNavigate('vehicles', vehicle.id)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-red-950/30 border border-red-800/60 hover:bg-red-950/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono font-black text-xs tracking-wider shadow-sm">
                          {vehicle.plate}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Chofer: {vehicle.driverName} • Actual: {vehicle.currentMileage.toLocaleString()} km
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                          Vencido
                        </span>
                        <div className="text-[10px] text-red-300 mt-1 font-mono">{alert.label}</div>
                      </div>
                    </div>
                  ))}

                  {warningVehicles.map(({ vehicle, alert }) => (
                    <div
                      key={vehicle.id}
                      onClick={() => onNavigate('vehicles', vehicle.id)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 hover:bg-amber-950/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-mono font-black text-xs tracking-wider shadow-sm">
                          {vehicle.plate}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Chofer: {vehicle.driverName} • Actual: {vehicle.currentMileage.toLocaleString()} km
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                          Próximo
                        </span>
                        <div className="text-[10px] text-amber-300 mt-1 font-mono">{alert.label}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Al día
              <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> Próximo
              <span className="w-2 h-2 rounded-full bg-red-500 ml-2" /> Vencido
            </span>
            <span>Umbral: 1,000 km / 15 días</span>
          </div>
        </div>

        {/* Upcoming Programmed Services */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Próximos Servicios Programados</span>
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Abrir Calendario
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {upcomingServices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No hay servicios programados pendientes.
                </div>
              ) : (
                upcomingServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-800/60 flex items-center justify-center text-red-400 font-mono text-xs font-bold">
                        {srv.scheduledDate.slice(8, 10)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{srv.title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {srv.plate}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Fecha: {srv.scheduledDate} {srv.scheduledKm ? `• Km Meta: ${srv.scheduledKm.toLocaleString()} km` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {srv.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('calendar')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>Programar Mantenimiento en Calendario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
