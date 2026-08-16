import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { SparePartItem } from '../types';
import {
  TableProperties,
  Plus,
  Trash2,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ShoppingCart,
  DollarSign,
  Layers,
  Wrench,
  Calculator,
  Save,
  X,
} from 'lucide-react';

export const SparePartsSpreadsheet: React.FC = () => {
  const { state, addSparePart, updateSparePart, deleteSparePart } = useFleet();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'programado' | 'cotizado' | 'comprado' | 'instalado'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Add Row State
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState<number | ''>('');
  const [quickQty, setQuickQty] = useState<number>(1);
  const [quickCategory, setQuickCategory] = useState('Filtros');
  const [quickStatus, setQuickStatus] = useState<'programado' | 'cotizado' | 'comprado' | 'instalado'>('programado');
  const [quickPlate, setQuickPlate] = useState(state.vehicles[0]?.plate || '');
  const [quickSupplier, setQuickSupplier] = useState('');
  const [quickRefCode, setQuickRefCode] = useState('');

  // Filter parts list
  const filteredParts = useMemo(() => {
    return state.spareParts.filter((part) => {
      const matchSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.vehiclePlate && part.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (part.supplier && part.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (part.referenceCode && part.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || part.status === statusFilter;
      const matchCat = categoryFilter === 'all' || part.category === categoryFilter;

      return matchSearch && matchStatus && matchCat;
    });
  }, [state.spareParts, searchTerm, statusFilter, categoryFilter]);

  // Automatic Sum Calculations in Quetzales (Q)
  const totalProgrammedQuetzales = useMemo(() => {
    return state.spareParts
      .filter((p) => p.status === 'programado' || p.status === 'cotizado')
      .reduce((sum, p) => sum + (p.priceQuetzales * p.quantity || 0), 0);
  }, [state.spareParts]);

  const totalPurchasedQuetzales = useMemo(() => {
    return state.spareParts
      .filter((p) => p.status === 'comprado' || p.status === 'instalado')
      .reduce((sum, p) => sum + (p.priceQuetzales * p.quantity || 0), 0);
  }, [state.spareParts]);

  const grandTotalQuetzales = useMemo(() => {
    return state.spareParts.reduce((sum, p) => sum + (p.priceQuetzales * p.quantity || 0), 0);
  }, [state.spareParts]);

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || quickPrice === '') return;

    addSparePart({
      name: quickName.trim(),
      priceQuetzales: Number(quickPrice) || 0,
      quantity: Number(quickQty) || 1,
      category: quickCategory,
      status: quickStatus,
      vehiclePlate: quickPlate || undefined,
      supplier: quickSupplier || undefined,
      referenceCode: quickRefCode || undefined,
      purchaseDate: new Date().toISOString().slice(0, 10),
    });

    setQuickName('');
    setQuickPrice('');
    setQuickQty(1);
    setQuickSupplier('');
    setQuickRefCode('');
    setShowAddModal(false);
  };

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    const headers = [
      'Nombre del Repuesto',
      'Precio Unitario (Q)',
      'Cantidad',
      'Subtotal (Q)',
      'Estado',
      'Placa Asignada',
      'Categoría',
      'Proveedor',
      'Código de Referencia',
    ];

    const rows = state.spareParts.map((p) => [
      `"${p.name}"`,
      p.priceQuetzales.toFixed(2),
      p.quantity,
      (p.priceQuetzales * p.quantity).toFixed(2),
      p.status,
      p.vehiclePlate || 'General',
      p.category,
      `"${p.supplier || ''}"`,
      `"${p.referenceCode || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MYG_2026_Hoja_Repuestos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <TableProperties className="w-6 h-6 text-sky-400" />
            <span>Hoja de Cálculo de Repuestos (Suma en Q)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Estructura de precios por repuesto en Quetzales (Q), control de programados vs instalados y cálculo automático instantáneo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV / Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Repuesto a la Hoja</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards with Automatic Sum in Quetzales (Mandated) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Programados en Quetzales */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-600/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Total Programados / Cotizados
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Presupuesto
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-amber-300 font-mono">
              Q {totalProgrammedQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Repuestos requeridos para próximos servicios</div>
        </div>

        {/* Total Comprados e Instalados */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 border border-sky-600/50 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Total Comprados / Instalados
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
              Ejecutado
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-sky-300 font-mono">
              Q {totalPurchasedQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Repuestos ya adquiridos o montados en taller</div>
        </div>

        {/* Gran Total Automático General */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/60 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              Gran Total General (Q)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
              Suma Automática
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
              Q {grandTotalQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">{state.spareParts.length} ítems en catálogo</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por repuesto, código, placa o proveedor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos los estados</option>
            <option value="programado">🟡 Programados</option>
            <option value="cotizado">🟠 Cotizados</option>
            <option value="comprado">🔵 Comprados</option>
            <option value="instalado">🟢 Instalados</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="Filtros">Filtros</option>
            <option value="Frenos">Frenos</option>
            <option value="Motor">Motor & Lubricación</option>
            <option value="Suspensión">Suspensión & Dirección</option>
            <option value="Eléctrico">Eléctrico & Baterías</option>
            <option value="Llantas">Llantas & Neumáticos</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Table (Strictly following user requested layout: Column 1 Nombre del repuesto, Column 2 Precio en Quetzales, etc.) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase tracking-wider select-none">
              <tr>
                <th className="p-3.5 border-r border-slate-800 w-12 text-center text-slate-500">#</th>
                <th className="p-3.5 border-r border-slate-800 min-w-[220px]">Nombre del Repuesto</th>
                <th className="p-3.5 border-r border-slate-800 min-w-[130px] text-right text-emerald-400">
                  Precio Unitario (Q)
                </th>
                <th className="p-3.5 border-r border-slate-800 w-24 text-center">Cantidad</th>
                <th className="p-3.5 border-r border-slate-800 min-w-[140px] text-right font-black text-white">
                  Suma Subtotal (Q)
                </th>
                <th className="p-3.5 border-r border-slate-800 min-w-[120px] text-center">Estado</th>
                <th className="p-3.5 border-r border-slate-800 min-w-[120px]">Placa Vehículo</th>
                <th className="p-3.5 border-r border-slate-800 min-w-[180px]">Proveedor / Código</th>
                <th className="p-3.5 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-sans text-xs">
                    No se encontraron repuestos en la hoja con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part, index) => {
                  const subtotal = part.priceQuetzales * part.quantity;
                  return (
                    <tr key={part.id} className="hover:bg-slate-800/60 transition-colors group">
                      <td className="p-3 border-r border-slate-800 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Col 1: Nombre del Repuesto */}
                      <td className="p-3 border-r border-slate-800 font-sans font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{part.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                            {part.category}
                          </span>
                        </div>
                      </td>

                      {/* Col 2: Precio en Quetzales (Q) */}
                      <td className="p-3 border-r border-slate-800 text-right font-bold text-slate-300">
                        <span className="text-slate-500 mr-1">Q</span>
                        {part.priceQuetzales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Col 3: Cantidad */}
                      <td className="p-3 border-r border-slate-800 text-center font-bold text-white">
                        {part.quantity}
                      </td>

                      {/* Col 4: Subtotal (Q) = Precio * Cantidad */}
                      <td className="p-3 border-r border-slate-800 text-right font-black text-emerald-400 bg-emerald-950/10">
                        <span className="text-emerald-600 mr-1">Q</span>
                        {subtotal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Col 5: Estado */}
                      <td className="p-3 border-r border-slate-800 text-center font-sans">
                        <select
                          value={part.status}
                          onChange={(e) => updateSparePart(part.id, { status: e.target.value as any })}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            part.status === 'instalado'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : part.status === 'comprado'
                              ? 'bg-sky-950 text-sky-400 border-sky-800'
                              : part.status === 'cotizado'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                          }`}
                        >
                          <option value="programado">Programado</option>
                          <option value="cotizado">Cotizado</option>
                          <option value="comprado">Comprado</option>
                          <option value="instalado">Instalado</option>
                        </select>
                      </td>

                      {/* Col 6: Placa Asignada */}
                      <td className="p-3 border-r border-slate-800 font-sans">
                        {part.vehiclePlate ? (
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-white font-mono font-bold border border-slate-800 text-[11px]">
                            {part.vehiclePlate}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Stock General</span>
                        )}
                      </td>

                      {/* Col 7: Proveedor y Código */}
                      <td className="p-3 border-r border-slate-800 font-sans text-slate-400 text-[11px]">
                        <span className="text-slate-200">{part.supplier || 'N/A'}</span>
                        {part.referenceCode && (
                          <span className="block text-[10px] text-slate-400 font-mono">{part.referenceCode}</span>
                        )}
                      </td>

                      {/* Col 8: Acciones */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Desea eliminar el repuesto "${part.name}"?`)) {
                              deleteSparePart(part.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Bottom Total Row Footer */}
            <tfoot className="bg-slate-950 border-t-2 border-slate-800 font-mono text-slate-200">
              <tr>
                <td colSpan={2} className="p-4 text-right font-sans font-black uppercase text-slate-400 text-xs">
                  Suma Total de la Hoja en Quetzales:
                </td>
                <td className="p-4 border-r border-slate-800 text-center font-bold text-slate-400 text-xs">
                  {filteredParts.reduce((sum, p) => sum + p.quantity, 0)} unidades
                </td>
                <td className="p-4 text-right font-black text-base text-emerald-400 font-mono" colSpan={2}>
                  Q {filteredParts.reduce((sum, p) => sum + p.priceQuetzales * p.quantity, 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={4} className="p-4 text-left text-xs font-sans text-slate-400">
                  * Total calculado automáticamente en tiempo real
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: Add Spare Part Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TableProperties className="w-4 h-4 text-sky-400" />
                <span>Añadir Repuesto a la Hoja de Precios</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Repuesto *</label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Ej. Filtro de Aceite 15W40, Zapatas Traseras, Batería 12V..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Unitario en Quetzales (Q) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold">Q</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={quickPrice}
                      onChange={(e) => setQuickPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quickQty}
                    onChange={(e) => setQuickQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Filtros">Filtros</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Motor">Motor & Aceites</option>
                    <option value="Suspensión">Suspensión</option>
                    <option value="Eléctrico">Eléctrico & Baterías</option>
                    <option value="Llantas">Llantas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estado de Programación</label>
                  <select
                    value={quickStatus}
                    onChange={(e) => setQuickStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="programado">Programado (Pendiente)</option>
                    <option value="cotizado">Cotizado</option>
                    <option value="comprado">Comprado</option>
                    <option value="instalado">Instalado en Vehículo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehículo Asignado (Placa)</label>
                  <select
                    value={quickPlate}
                    onChange={(e) => setQuickPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  >
                    <option value="">Stock General (Sin placa fija)</option>
                    {state.vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} ({v.brand} {v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código / Referencia</label>
                  <input
                    type="text"
                    value={quickRefCode}
                    onChange={(e) => setQuickRefCode(e.target.value)}
                    placeholder="Ej. OEM-8921"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proveedor / Casa de Repuestos</label>
                <input
                  type="text"
                  value={quickSupplier}
                  onChange={(e) => setQuickSupplier(e.target.value)}
                  placeholder="Ej. Repuestos Pesados S.A., Distribuidora Central..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Subtotal Preview */}
              {quickPrice !== '' && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/40 flex justify-between items-center text-xs">
                  <span className="text-emerald-300 font-semibold">Subtotal calculado:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    Q {(Number(quickPrice) * quickQty).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

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
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 cursor-pointer"
                >
                  Añadir a la Hoja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
