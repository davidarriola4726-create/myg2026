import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { MygLogo } from './MygLogo';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Car,
  DollarSign,
  Fuel,
  Wrench,
  Layers,
  TrendingUp,
  Search,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { state } = useFleet();

  const [filterMode, setFilterMode] = useState<'vehicle' | 'dates' | 'both'>('both');
  const [selectedPlate, setSelectedPlate] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter records based on criteria
  const filteredRecords = useMemo(() => {
    return state.records.filter((rec) => {
      const matchPlate = selectedPlate === 'all' || rec.vehiclePlate === selectedPlate;
      const matchCategory = selectedCategory === 'all' || rec.category === selectedCategory;
      const matchDate =
        (!startDate || rec.date >= startDate) &&
        (!endDate || rec.date <= endDate);

      return matchPlate && matchCategory && matchDate;
    });
  }, [state.records, selectedPlate, selectedCategory, startDate, endDate]);

  // Filter fuel logs
  const filteredFuel = useMemo(() => {
    return state.fuelLogs.filter((f) => {
      const matchPlate = selectedPlate === 'all' || f.plate === selectedPlate;
      const matchDate =
        (!startDate || f.startDate >= startDate) &&
        (!endDate || f.endDate <= endDate);

      return matchPlate && matchDate;
    });
  }, [state.fuelLogs, selectedPlate, startDate, endDate]);

  // Filter work orders
  const filteredOrders = useMemo(() => {
    return state.workOrders.filter((o) => {
      const matchPlate = selectedPlate === 'all' || o.vehiclePlate === selectedPlate;
      const matchDate =
        (!startDate || o.startDate >= startDate) &&
        (!endDate || o.endDate <= endDate);

      return matchPlate && matchDate;
    });
  }, [state.workOrders, selectedPlate, startDate, endDate]);

  // Total Calculations in Quetzales (Q)
  const totalRepairsCost = filteredRecords
    .filter((r) => r.category === 'reparaciones')
    .reduce((sum, r) => sum + r.costQuetzales, 0);

  const totalChangesCost = filteredRecords
    .filter((r) => r.category === 'cambios')
    .reduce((sum, r) => sum + r.costQuetzales, 0);

  const totalMaintenanceCost = filteredRecords
    .filter((r) => r.category === 'mantenimiento')
    .reduce((sum, r) => sum + r.costQuetzales, 0);

  const totalServicesCost = filteredRecords
    .filter((r) => r.category === 'servicios')
    .reduce((sum, r) => sum + r.costQuetzales, 0);

  const totalFuelCost = filteredFuel.reduce((sum, f) => sum + f.weeklyQuetzales, 0);
  const totalFuelGallons = filteredFuel.reduce((sum, f) => sum + f.gallons, 0);

  const totalGeneralInversionQ =
    totalRepairsCost +
    totalChangesCost +
    totalMaintenanceCost +
    totalServicesCost +
    totalFuelCost;

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Fecha',
      'Placa',
      'Categoría',
      'Título / Trabajo',
      'Costo en Quetzales (Q)',
      'Kilometraje',
      'Técnico',
      'Notas',
    ];

    const rows = filteredRecords.map((r) => [
      r.date,
      r.vehiclePlate,
      r.category,
      `"${r.title}"`,
      r.costQuetzales.toFixed(2),
      r.mileage || '',
      `"${r.technician || ''}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MYG_2026_Informe_${selectedPlate}_${startDate}_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const selectedVehicleObj = state.vehicles.find((v) => v.plate === selectedPlate);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-red-500" />
            <span>Informes y Reportes por Vehículo / Rango de Fechas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Generación de balances financieros en Quetzales (Q), historial consolidado y exportación de auditoría.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Informe Oficial</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Panel (Mandated Requirement: "Informes por vehículo o por fechas") */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase">
          <Filter className="w-4 h-4 text-red-500" />
          <span>Filtros del Informe</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Vehículo Filter */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Por Vehículo (Placa)</label>
            <select
              value={selectedPlate}
              onChange={(e) => setSelectedPlate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
            >
              <option value="all">Todos los vehículos (Flota Completa)</option>
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate} - {v.brand} {v.model} ({v.driverName})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Fecha Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="reparaciones">Reparaciones</option>
              <option value="cambios">Cambios de Repuestos</option>
              <option value="mantenimiento">Mantenimiento Preventivo</option>
              <option value="servicios">Servicios Rutinarios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Overview Banner if single vehicle selected */}
      {selectedVehicleObj && (
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-800/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-slate-950 px-3 py-1.5 rounded-md font-mono font-black text-base shadow border border-slate-300">
              {selectedVehicleObj.plate}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {selectedVehicleObj.brand} {selectedVehicleObj.model} ({selectedVehicleObj.year})
              </h3>
              <p className="text-xs text-slate-300">
                Chofer: <strong>{selectedVehicleObj.driverName}</strong> • Odómetro actual:{' '}
                <strong className="font-mono text-white">{selectedVehicleObj.currentMileage.toLocaleString()} km</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Inversión total del vehículo en rango
            </span>
            <span className="text-xl font-black text-amber-400 font-mono">
              Q {totalGeneralInversionQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Financial Breakdown Grid in Quetzales (Q) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Reparaciones */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Reparaciones</span>
          <div className="text-base font-bold text-red-400 font-mono mt-1">
            Q {totalRepairsCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">
            {filteredRecords.filter((r) => r.category === 'reparaciones').length} eventos
          </span>
        </div>

        {/* Cambios */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Cambios</span>
          <div className="text-base font-bold text-sky-400 font-mono mt-1">
            Q {totalChangesCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">
            {filteredRecords.filter((r) => r.category === 'cambios').length} eventos
          </span>
        </div>

        {/* Mantenimiento */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mantenimiento</span>
          <div className="text-base font-bold text-amber-400 font-mono mt-1">
            Q {totalMaintenanceCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">
            {filteredRecords.filter((r) => r.category === 'mantenimiento').length} eventos
          </span>
        </div>

        {/* Servicios */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Servicios</span>
          <div className="text-base font-bold text-emerald-400 font-mono mt-1">
            Q {totalServicesCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">
            {filteredRecords.filter((r) => r.category === 'servicios').length} eventos
          </span>
        </div>

        {/* Combustible */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Combustible (Q)</span>
          <div className="text-base font-bold text-orange-400 font-mono mt-1">
            Q {totalFuelCost.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">{totalFuelGallons.toFixed(1)} gal</span>
        </div>

        {/* Gran Total Inversión */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-950/60 to-slate-900 border-2 border-red-600/60 shadow-lg">
          <span className="text-[10px] font-black text-red-400 uppercase">Inversión Total</span>
          <div className="text-base font-black text-white font-mono mt-1">
            Q {totalGeneralInversionQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-red-300">Periodo actual</span>
        </div>
      </div>

      {/* Detailed Records Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Detalle Consolidado de Registros en el Periodo ({filteredRecords.length} ítems)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {startDate} al {endDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Placa</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Detalle del Trabajo</th>
                <th className="p-3.5 text-right">Inversión (Q)</th>
                <th className="p-3.5 text-right">Odómetro</th>
                <th className="p-3.5">Técnico / Taller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron registros de mantenimiento en el rango de fechas o vehículo seleccionado.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono text-slate-300">{rec.date}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-white font-mono font-bold border border-slate-800">
                        {rec.vehiclePlate}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          rec.category === 'reparaciones'
                            ? 'bg-red-950 text-red-400'
                            : rec.category === 'cambios'
                            ? 'bg-sky-950 text-sky-400'
                            : rec.category === 'mantenimiento'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}
                      >
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-white max-w-sm">
                      <div>{rec.title}</div>
                      {rec.notes && <div className="text-[11px] text-slate-400 truncate">{rec.notes}</div>}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-400 text-sm">
                      Q {rec.costQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-300">
                      {rec.mileage ? `${rec.mileage.toLocaleString()} km` : '-'}
                    </td>
                    <td className="p-3.5 text-slate-300 text-[11px]">{rec.technician || 'Taller Central'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY AUDIT REPORT */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-50">
        <div className="border-4 border-black p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div>
              <h1 className="text-xl font-black uppercase">
                CONTROL DE MANTENIMIENTO DE VEHÍCULOS 2026 MYG
              </h1>
              <p className="text-xs font-bold text-gray-700">
                INFORME OFICIAL DE MANTENIMIENTO Y COSTOS EN QUETZALES (Q)
              </p>
            </div>
            <div className="text-right text-xs">
              <p><strong>Periodo:</strong> {startDate} al {endDate}</p>
              <p><strong>Vehículo:</strong> {selectedPlate === 'all' ? 'Flota Completa' : selectedPlate}</p>
              <p><strong>Emisión:</strong> {new Date().toLocaleDateString('es-GT')}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-5 gap-2 border border-black p-3 text-xs bg-gray-50">
            <div>
              <p className="font-bold">Reparaciones:</p>
              <p>Q {totalRepairsCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-bold">Cambios Repuestos:</p>
              <p>Q {totalChangesCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-bold">Mantenimiento:</p>
              <p>Q {totalMaintenanceCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-bold">Combustible:</p>
              <p>Q {totalFuelCost.toFixed(2)}</p>
            </div>
            <div className="font-black text-sm">
              <p>TOTAL GENERAL:</p>
              <p>Q {totalGeneralInversionQ.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border-collapse border border-black">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-black p-1">Fecha</th>
                <th className="border border-black p-1">Placa</th>
                <th className="border border-black p-1">Categoría</th>
                <th className="border border-black p-1">Trabajo Realizado</th>
                <th className="border border-black p-1 text-right">Costo (Q)</th>
                <th className="border border-black p-1">Técnico</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr key={i}>
                  <td className="border border-black p-1">{r.date}</td>
                  <td className="border border-black p-1">{r.vehiclePlate}</td>
                  <td className="border border-black p-1 uppercase">{r.category}</td>
                  <td className="border border-black p-1">{r.title}</td>
                  <td className="border border-black p-1 text-right">Q {r.costQuetzales.toFixed(2)}</td>
                  <td className="border border-black p-1">{r.technician || 'Taller'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-black pt-2">
              <p className="font-bold">Firma y Sello de Auditoría de Flota</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">Firma de Gerencia de Operaciones MYG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
