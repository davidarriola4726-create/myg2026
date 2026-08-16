import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { FuelLog } from '../types';
import {
  Fuel,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Gauge,
  User,
  Trash2,
  Filter,
  Check,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';

export const FuelManagementView: React.FC = () => {
  const { state, addFuelLog, deleteFuelLog } = useFleet();

  const [selectedPlate, setSelectedPlate] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('Agosto');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Quick Weekly Fuel Calculator Form State
  const [calcPlate, setCalcPlate] = useState<string>(state.vehicles[0]?.plate || '');
  const [calcWeekNum, setCalcWeekNum] = useState<number>(33);
  const [calcStartDate, setCalcStartDate] = useState<string>('2026-08-15');
  const [calcEndDate, setCalcEndDate] = useState<string>('2026-08-21');
  const [calcQuetzales, setCalcQuetzales] = useState<number | ''>('');
  const [calcGallons, setCalcGallons] = useState<number | ''>('');
  const [calcKm, setCalcKm] = useState<number | ''>('');
  const [calcDriver, setCalcDriver] = useState<string>('');
  const [calcStation, setCalcStation] = useState<string>('Gasolinera Puma / Shell');
  const [calcNotes, setCalcNotes] = useState<string>('');

  // Auto-set driver when plate changes in form
  const handlePlateChange = (plate: string) => {
    setCalcPlate(plate);
    const v = state.vehicles.find((veh) => veh.plate === plate);
    if (v) {
      setCalcDriver(v.driverName);
    }
  };

  // Filter fuel logs
  const filteredLogs = useMemo(() => {
    return state.fuelLogs.filter((log) => {
      const matchPlate = selectedPlate === 'all' || log.plate === selectedPlate;
      const matchMonth = selectedMonth === 'all' || log.month === selectedMonth;
      const matchYear = log.year === selectedYear;
      return matchPlate && matchMonth && matchYear;
    });
  }, [state.fuelLogs, selectedPlate, selectedMonth, selectedYear]);

  // Compute monthly sums automatically
  const monthlyTotalQuetzales = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + (item.weeklyQuetzales || 0), 0);
  }, [filteredLogs]);

  const monthlyTotalGallons = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + (item.gallons || 0), 0);
  }, [filteredLogs]);

  const monthlyTotalKm = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + (item.kmTraveled || 0), 0);
  }, [filteredLogs]);

  const averageEfficiency = monthlyTotalGallons > 0 ? (monthlyTotalKm / monthlyTotalGallons).toFixed(1) : '0';

  // Prepare Comparative Weekly Chart Data
  const chartData = useMemo(() => {
    // Group all filtered or all-fleet logs by week number
    const weeksMap: Record<number, { week: string; weekNum: number; gastoQ: number; galones: number; km: number; promedioKmGal: number }> = {};

    filteredLogs.forEach((log) => {
      if (!weeksMap[log.weekNumber]) {
        weeksMap[log.weekNumber] = {
          week: `Sem. ${log.weekNumber}`,
          weekNum: log.weekNumber,
          gastoQ: 0,
          galones: 0,
          km: 0,
          promedioKmGal: 0,
        };
      }
      weeksMap[log.weekNumber].gastoQ += log.weeklyQuetzales || 0;
      weeksMap[log.weekNumber].galones += log.gallons || 0;
      weeksMap[log.weekNumber].km += log.kmTraveled || 0;
    });

    const list = Object.values(weeksMap).sort((a, b) => a.weekNum - b.weekNum);
    return list.map((item) => ({
      ...item,
      promedioKmGal: item.galones > 0 ? Number((item.km / item.galones).toFixed(1)) : 0,
    }));
  }, [filteredLogs]);

  const handleSaveFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcPlate || !calcQuetzales) return;

    const matchedVeh = state.vehicles.find((v) => v.plate === calcPlate);

    addFuelLog({
      vehicleId: matchedVeh ? matchedVeh.id : 'unknown',
      plate: calcPlate,
      weekNumber: Number(calcWeekNum) || 1,
      year: selectedYear,
      month: selectedMonth === 'all' ? 'Agosto' : selectedMonth,
      startDate: calcStartDate,
      endDate: calcEndDate,
      weeklyQuetzales: Number(calcQuetzales) || 0,
      gallons: Number(calcGallons) || 0,
      kmTraveled: Number(calcKm) || 0,
      driver: calcDriver || matchedVeh?.driverName || 'Sin asignar',
      stationName: calcStation,
      notes: calcNotes,
    });

    setCalcQuetzales('');
    setCalcGallons('');
    setCalcKm('');
    setCalcNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Fuel className="w-6 h-6 text-amber-400" />
            <span>Control de Combustible y Gráfica Semanal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro semanal de consumo en Quetzales (Q), suma mensual automática y comparativa entre semanas.
          </p>
        </div>

        <button
          onClick={() => {
            if (state.vehicles.length > 0 && !calcPlate) {
              setCalcPlate(state.vehicles[0].plate);
              setCalcDriver(state.vehicles[0].driverName);
            }
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ingresar Consumo Semanal (Q)</span>
        </button>
      </div>

      {/* Filter and Month Selector */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Filtrar Placa</label>
            <select
              value={selectedPlate}
              onChange={(e) => setSelectedPlate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">Todas las placas de la flota</option>
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate} - {v.brand} {v.model} ({v.driverName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los meses</option>
              <option value="Enero">Enero</option>
              <option value="Febrero">Febrero</option>
              <option value="Marzo">Marzo</option>
              <option value="Abril">Abril</option>
              <option value="Mayo">Mayo</option>
              <option value="Junio">Junio</option>
              <option value="Julio">Julio</option>
              <option value="Agosto">Agosto</option>
              <option value="Septiembre">Septiembre</option>
              <option value="Octubre">Octubre</option>
              <option value="Noviembre">Noviembre</option>
              <option value="Diciembre">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {/* Quick info tag */}
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Registros del periodo</span>
          <span className="text-xs font-bold text-white font-mono">{filteredLogs.length} semanas registradas</span>
        </div>
      </div>

      {/* Automatic Monthly Summation Banner (Mandated Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Suma Automática del Mes en Quetzales */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Suma Total al Mes (Q)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
              Automático
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
              Q {monthlyTotalQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300">
            Suma de semanas {selectedMonth !== 'all' ? `en ${selectedMonth}` : 'seleccionadas'}
          </div>
        </div>

        {/* Total Galones */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Galones
            </span>
            <Fuel className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {monthlyTotalGallons.toFixed(1)} <span className="text-sm font-normal text-slate-400">gal</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Volumen combustible consumido</div>
        </div>

        {/* Total Kilómetros */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Distancia Recorrida
            </span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {monthlyTotalKm.toLocaleString()} <span className="text-sm font-normal text-slate-400">km</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Kilometraje acumulado en ruta</div>
        </div>

        {/* Rendimiento Promedio */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rendimiento Flota
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {averageEfficiency} <span className="text-sm font-normal text-slate-400">km/gal</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Eficiencia promedio por galón</div>
        </div>
      </div>

      {/* Weekly Comparative Chart */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <span>Gráfica Semanal Comparativa entre Semanas (Gasto en Q vs Galones)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa directa semana a semana para identificar variaciones de consumo y optimizar costos.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Gasto Semanal (Q)
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Galones
            </span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No hay suficientes datos semanales para trazar la gráfica. Agregue consumos de combustible con el botón superior.
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
                <YAxis
                  yAxisId="left"
                  stroke="#F59E0B"
                  fontSize={11}
                  tickFormatter={(val) => `Q ${val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#38BDF8"
                  fontSize={11}
                  tickFormatter={(val) => `${val} g`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Gasto en Quetzales') return [`Q ${Number(value).toLocaleString()}`, name];
                    if (name === 'Galones') return [`${value} gal`, name];
                    return [value, name];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="gastoQ"
                  name="Gasto en Quetzales"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="galones"
                  name="Galones"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38BDF8' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly Breakdown Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Detalle de Registros Semanales
          </h3>
          <span className="text-xs text-slate-400">Total: {filteredLogs.length} semanas</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No se encontraron registros de combustible con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Semana / Fechas</th>
                  <th className="p-3">Vehículo (Placa)</th>
                  <th className="p-3">Chofer</th>
                  <th className="p-3 text-right">Monto Semanal (Q)</th>
                  <th className="p-3 text-right">Galones</th>
                  <th className="p-3 text-right">Km Recorridos</th>
                  <th className="p-3 text-right">Rendimiento</th>
                  <th className="p-3">Estación / Notas</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredLogs.map((log) => {
                  const kmGal = log.gallons > 0 ? (log.kmTraveled / log.gallons).toFixed(1) : '-';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/50">
                      <td className="p-3">
                        <div className="font-bold text-white font-mono text-xs">Semana {log.weekNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {log.startDate} al {log.endDate} ({log.month})
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-white font-mono font-bold border border-slate-800">
                          {log.plate}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.driver}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400 text-sm">
                        Q {log.weeklyQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono">{log.gallons} gal</td>
                      <td className="p-3 text-right font-mono">{log.kmTraveled.toLocaleString()} km</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-semibold">{kmGal} km/gal</td>
                      <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
                        {log.stationName} {log.notes ? `• ${log.notes}` : ''}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('¿Desea eliminar este registro de combustible?')) {
                              deleteFuelLog(log.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Weekly Fuel Log */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>Ingreso Semanal de Combustible en Quetzales (Q)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFuelLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehículo (Placa) *</label>
                  <select
                    required
                    value={calcPlate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  >
                    {state.vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} ({v.brand} {v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Semana Número *</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    required
                    value={calcWeekNum}
                    onChange={(e) => setCalcWeekNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha Inicio de Semana</label>
                  <input
                    type="date"
                    value={calcStartDate}
                    onChange={(e) => setCalcStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha Fin de Semana</label>
                  <input
                    type="date"
                    value={calcEndDate}
                    onChange={(e) => setCalcEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Weekly Quetzales Highlight Input */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/50">
                <label className="block text-amber-300 font-bold text-xs uppercase mb-1">
                  Cantidad en Quetzales a la Semana (Q) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-amber-400 font-mono font-bold text-sm">Q</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={calcQuetzales}
                    onChange={(e) => setCalcQuetzales(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-amber-600/60 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-amber-200/80 mt-1">
                  Este monto se sumará automáticamente al total acumulado del mes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Galones Despachados</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcGallons}
                    onChange={(e) => setCalcGallons(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 28.5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kilómetros Recorridos</label>
                  <input
                    type="number"
                    value={calcKm}
                    onChange={(e) => setCalcKm(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej. 1050"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chofer / Piloto</label>
                  <input
                    type="text"
                    value={calcDriver}
                    onChange={(e) => setCalcDriver(e.target.value)}
                    placeholder="Nombre del chofer"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estación de Servicio</label>
                  <input
                    type="text"
                    value={calcStation}
                    onChange={(e) => setCalcStation(e.target.value)}
                    placeholder="Puma, Shell, Texaco..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ruta / Notas</label>
                <input
                  type="text"
                  value={calcNotes}
                  onChange={(e) => setCalcNotes(e.target.value)}
                  placeholder="Ruta Ciudad Capital - Escuintla..."
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
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Guardar y Sumar al Mes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
