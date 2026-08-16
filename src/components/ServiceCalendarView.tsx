import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { ServiceEvent, MaintenanceCategory } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  Wrench,
  X,
  Trash2,
} from 'lucide-react';

export const ServiceCalendarView: React.FC = () => {
  const { state, addService, updateService, deleteService } = useFleet();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 default
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: ServiceEvent[] } | null>(null);

  // Form State
  const [srvPlate, setSrvPlate] = useState(state.vehicles[0]?.plate || '');
  const [srvTitle, setSrvTitle] = useState('');
  const [srvCategory, setSrvCategory] = useState<MaintenanceCategory>('mantenimiento');
  const [srvDate, setSrvDate] = useState(new Date().toISOString().slice(0, 10));
  const [srvKm, setSrvKm] = useState<number | ''>('');
  const [srvNotes, setSrvNotes] = useState('');
  const [srvTech, setSrvTech] = useState('Taller Central MYG');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filter services
  const filteredServices = state.services.filter((s) => {
    return selectedVehicle === 'all' || s.plate === selectedVehicle;
  });

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredServices.filter((s) => s.scheduledDate === dayStr);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim() || !srvDate || !srvPlate) return;

    const matchedVeh = state.vehicles.find((v) => v.plate === srvPlate);

    addService({
      vehicleId: matchedVeh ? matchedVeh.id : 'unknown',
      plate: srvPlate,
      title: srvTitle.trim(),
      category: srvCategory,
      scheduledDate: srvDate,
      scheduledKm: srvKm ? Number(srvKm) : undefined,
      technician: srvTech,
      notes: srvNotes,
      status: 'pendiente',
    });

    setSrvTitle('');
    setSrvNotes('');
    setSrvKm('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-red-500" />
            <span>Calendario de Servicios y Mantenimiento</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Planificación y seguimiento mensual de rutinas, cambios de aceite y revisiones programadas por placa.
          </p>
        </div>

        <button
          onClick={() => {
            if (state.vehicles.length > 0 && !srvPlate) {
              setSrvPlate(state.vehicles[0].plate);
            }
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Nuevo Servicio</span>
        </button>
      </div>

      {/* Controls Bar: Month Switcher & Vehicle Filter */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-lg font-black text-white min-w-[180px] text-center font-mono">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400">Filtrar por Placa:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="all">Todas las placas de la flota</option>
            {state.vehicles.map((v) => (
              <option key={v.id} value={v.plate}>
                {v.plate} ({v.brand} {v.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase py-2 border-b border-slate-800">
          <span className="text-red-400">Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-2 mt-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 sm:h-28 rounded-xl bg-slate-950/30 border border-transparent opacity-30" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const events = getEventsForDay(dayNum);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  setSelectedDayEvents({ date: dayStr, events });
                }}
                className={`h-24 sm:h-28 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                  isToday
                    ? 'bg-slate-900 border-red-500/80 ring-1 ring-red-500/40'
                    : events.length > 0
                    ? 'bg-slate-900/90 border-slate-700 hover:border-red-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[10px] px-1.5 rounded-full bg-red-950 text-red-400 font-bold border border-red-800/60">
                      {events.length}
                    </span>
                  )}
                </div>

                {/* Events list preview */}
                <div className="space-y-1 overflow-y-auto no-scrollbar max-h-16">
                  {events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] p-1 rounded bg-slate-950 border border-slate-800 text-slate-200 truncate flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <strong className="text-red-400 font-mono text-[9px]">{ev.plate}</strong>
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[9px] text-slate-400 text-center font-medium">
                      +{events.length - 2} más...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal / Drawer */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-red-500" />
                <span>Servicios para el día {selectedDayEvents.date}</span>
              </h3>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedDayEvents.events.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No hay servicios programados para esta fecha.
                </div>
              ) : (
                selectedDayEvents.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono font-bold text-xs border border-red-800">
                            {ev.plate}
                          </span>
                          <span className="text-xs font-bold text-white">{ev.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          Categoría: <strong className="capitalize">{ev.category}</strong> {ev.scheduledKm ? `• Meta: ${ev.scheduledKm.toLocaleString()} km` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Eliminar servicio programado?')) {
                            deleteService(ev.id);
                            setSelectedDayEvents({
                              ...selectedDayEvents,
                              events: selectedDayEvents.events.filter((item) => item.id !== ev.id),
                            });
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {ev.notes && <p className="text-xs text-slate-300 bg-slate-900 p-2 rounded">{ev.notes}</p>}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => {
                  setSrvDate(selectedDayEvents.date);
                  setSelectedDayEvents(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                + Programar Servicio en esta Fecha
              </button>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Service */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-red-500" />
                <span>Programar Mantenimiento en Calendario</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehículo (Placa) *</label>
                <select
                  required
                  value={srvPlate}
                  onChange={(e) => setSrvPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                >
                  {state.vehicles.map((v) => (
                    <option key={v.id} value={v.plate}>
                      {v.plate} - {v.brand} {v.model} ({v.driverName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="Ej. Cambio de Aceite 50k, Inspección de Frenos..."
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kilometraje Meta</label>
                  <input
                    type="number"
                    value={srvKm}
                    onChange={(e) => setSrvKm(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 50000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Técnico / Taller</label>
                  <input
                    type="text"
                    value={srvTech}
                    onChange={(e) => setSrvTech(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas Adicionales</label>
                <textarea
                  rows={2}
                  value={srvNotes}
                  onChange={(e) => setSrvNotes(e.target.value)}
                  placeholder="Detalles sobre refacciones o instrucciones..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Guardar en Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
