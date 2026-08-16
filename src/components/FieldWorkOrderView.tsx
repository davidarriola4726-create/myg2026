import React, { useState, useRef, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { FieldWorkOrder } from '../types';
import { MygLogo } from './MygLogo';
import {
  ClipboardCheck,
  Plus,
  Printer,
  Trash2,
  Edit2,
  FileText,
  User,
  Car,
  Calendar,
  Wrench,
  PenTool,
  CheckCircle2,
  X,
  Eye,
  Download,
} from 'lucide-react';

interface SignaturePadProps {
  label: string;
  signatureData?: string;
  onSaveSignature: (dataUrl: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ label, signatureData, onSaveSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw existing signature if present
    if (signatureData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = signatureData;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }, [signatureData]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A'; // Dark ink

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSaveSignature(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSaveSignature('');
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-red-400" />
          {label}
        </span>
        {hasDrawn && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
          >
            Limpiar Firma
          </button>
        )}
      </div>

      <div className="relative w-full h-32 bg-white rounded-xl border-2 border-dashed border-slate-600 overflow-hidden touch-none cursor-crosshair shadow-inner">
        <canvas
          ref={canvasRef}
          width={360}
          height={128}
          className="w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            Dibuje su firma con el dedo o mouse aquí
          </div>
        )}
      </div>
    </div>
  );
};

export const FieldWorkOrderView: React.FC = () => {
  const { state, addWorkOrder, deleteWorkOrder, updateWorkOrder } = useFleet();

  const [selectedOrder, setSelectedOrder] = useState<FieldWorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [printableOrder, setPrintableOrder] = useState<FieldWorkOrder | null>(null);

  // Form State for new work order
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState(state.vehicles[0]?.plate || '');
  const [vehicleMileage, setVehicleMileage] = useState<number>(state.vehicles[0]?.currentMileage || 0);
  const [maintenanceType, setMaintenanceType] = useState<FieldWorkOrder['maintenanceType']>('Preventivo');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [technicianName, setTechnicianName] = useState('Ing. Marco Ramos');
  const [technicianRole, setTechnicianRole] = useState('Jefe de Taller Mecánico MYG');
  const [processDetails, setProcessDetails] = useState('');
  const [diagnosticFindings, setDiagnosticFindings] = useState('');
  const [observations, setObservations] = useState('');
  const [vehicleStatusDelivery, setVehicleStatusDelivery] = useState<FieldWorkOrder['vehicleStatusOnDelivery']>('Operativo 100%');
  const [partsInput, setPartsInput] = useState<{ name: string; quantity: number; costQ: number }[]>([
    { name: '', quantity: 1, costQ: 0 },
  ]);
  const [driverSig, setDriverSig] = useState('');
  const [techSig, setTechSig] = useState('');

  const handlePlateSelect = (plate: string) => {
    setVehiclePlate(plate);
    const v = state.vehicles.find((veh) => veh.plate === plate);
    if (v) {
      setDriverName(v.driverName);
      setVehicleMileage(v.currentMileage);
    }
  };

  const handleAddPartRow = () => {
    setPartsInput([...partsInput, { name: '', quantity: 1, costQ: 0 }]);
  };

  const handleRemovePartRow = (index: number) => {
    setPartsInput(partsInput.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: 'name' | 'quantity' | 'costQ', value: any) => {
    const updated = [...partsInput];
    updated[index] = { ...updated[index], [field]: value };
    setPartsInput(updated);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !vehiclePlate || !processDetails.trim()) return;

    const matchedVeh = state.vehicles.find((v) => v.plate === vehiclePlate);
    const cleanParts = partsInput.filter((p) => p.name.trim().length > 0);
    const totalPartsCost = cleanParts.reduce((sum, p) => sum + (p.costQ * p.quantity || 0), 0);

    const orderNum = `OT-2026-${String(state.workOrders.length + 1).padStart(4, '0')}`;

    addWorkOrder({
      orderNumber: orderNum,
      driverName: driverName.trim(),
      vehiclePlate,
      vehicleModel: matchedVeh ? `${matchedVeh.brand} ${matchedVeh.model} (${matchedVeh.year})` : undefined,
      vehicleMileage: Number(vehicleMileage) || 0,
      maintenanceType,
      startDate,
      endDate,
      technicianName: technicianName.trim(),
      technicianRole,
      processDetails: processDetails.trim(),
      diagnosticFindings: diagnosticFindings.trim() || undefined,
      partsUsedList: cleanParts,
      totalCostQuetzales: totalPartsCost,
      driverSignature: driverSig || undefined,
      technicianSignature: techSig || undefined,
      observations: observations.trim() || undefined,
      vehicleStatusOnDelivery: vehicleStatusDelivery,
    });

    // Reset Form
    setProcessDetails('');
    setDiagnosticFindings('');
    setObservations('');
    setDriverSig('');
    setTechSig('');
    setPartsInput([{ name: '', quantity: 1, costQ: 0 }]);
    setShowCreateModal(false);
  };

  const handlePrint = (order: FieldWorkOrder) => {
    setPrintableOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            <span>Hojas de Trabajo de Campo (Firma e Impresión)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Órdenes oficiales de mantenimiento de campo con firmas digitales de piloto y técnico listas para imprimir en papel.
          </p>
        </div>

        <button
          onClick={() => {
            if (state.vehicles.length > 0 && !vehiclePlate) {
              setVehiclePlate(state.vehicles[0].plate);
              setDriverName(state.vehicles[0].driverName);
              setVehicleMileage(state.vehicles[0].currentMileage);
            }
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Nueva Hoja de Trabajo</span>
        </button>
      </div>

      {/* Grid of Existing Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {state.workOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">
              No hay hojas de trabajo de campo archivadas aún.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Haga clic en el botón superior para crear una orden con firmas de piloto y técnico.
            </p>
          </div>
        ) : (
          state.workOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-black text-red-400 font-mono uppercase tracking-wider block">
                      {order.orderNumber}
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {order.maintenanceType}
                    </span>
                  </div>

                  <div className="bg-white text-slate-950 px-2.5 py-1 rounded font-mono font-black text-xs tracking-wider border border-slate-400">
                    {order.vehiclePlate}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Piloto / Chofer:
                    </span>
                    <strong className="text-white truncate max-w-[130px]">{order.driverName}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Fechas:
                    </span>
                    <span className="font-mono text-[11px]">
                      {order.startDate} → {order.endDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-500" /> Encargado:
                    </span>
                    <span className="text-slate-200 truncate max-w-[130px]">{order.technicianName}</span>
                  </div>

                  {/* Process excerpt */}
                  <div className="mt-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    <strong>Datos del Proceso:</strong> {order.processDetails}
                  </div>

                  {/* Signature status badges */}
                  <div className="flex items-center justify-between pt-2 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      {order.driverSignature ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      Firma Piloto
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      {order.technicianSignature ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      Firma Técnico
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (window.confirm(`¿Desea eliminar la hoja de trabajo ${order.orderNumber}?`)) {
                      deleteWorkOrder(order.id);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ver Detalle</span>
                </button>

                <button
                  onClick={() => handlePrint(order)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create New Field Work Order */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-red-500" />
                  <span>Nueva Hoja de Trabajo para Campo MYG</span>
                </h3>
                <p className="text-xs text-slate-400">Complete los datos requeridos para la orden oficial</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* Row 1: Vehicle Plate & Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Número de Matrícula / Placa *
                  </label>
                  <select
                    required
                    value={vehiclePlate}
                    onChange={(e) => handlePlateSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                  >
                    {state.vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} - {v.brand} {v.model} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nombre de Piloto / Chofer *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nombre completo del piloto"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 2: Type of Maintenance & Mileage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tipo de Mantenimiento *
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Preventivo">Mantenimiento Preventivo</option>
                    <option value="Correctivo">Mantenimiento Correctivo / Reparación</option>
                    <option value="Rutina de 5,000 Km">Rutina de 5,000 Km</option>
                    <option value="Rutina de 10,000 Km">Rutina de 10,000 Km</option>
                    <option value="Emergencia / Auxilio Vial">Emergencia / Auxilio Vial</option>
                    <option value="Revisión General">Revisión General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Kilometraje al Ingreso
                  </label>
                  <input
                    type="number"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fecha de Realización *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fecha de Culminación *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 4: Technician Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nombre del Técnico Encargado *
                  </label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cargo / Especialidad del Técnico
                  </label>
                  <input
                    type="text"
                    value={technicianRole}
                    onChange={(e) => setTechnicianRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Row 5: Process Details (Mandated Requirement) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Datos del Proceso (Pasos ejecutados, mediciones, calibraciones) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={processDetails}
                  onChange={(e) => setProcessDetails(e.target.value)}
                  placeholder="1. Desmontaje e inspección visual...&#10;2. Cambio de filtro de combustible y aceite...&#10;3. Verificación de compresión y prueba de frenos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                />
              </div>

              {/* Diagnostic Findings */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Diagnóstico y Hallazgos / Recomendaciones
                </label>
                <textarea
                  rows={2}
                  value={diagnosticFindings}
                  onChange={(e) => setDiagnosticFindings(e.target.value)}
                  placeholder="Recomendaciones para el próximo servicio, piezas con desgaste..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Parts Installed Row */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Repuestos Utilizados en Campo</span>
                  <button
                    type="button"
                    onClick={handleAddPartRow}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold"
                  >
                    + Agregar Repuesto
                  </button>
                </div>

                {partsInput.map((part, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nombre del repuesto"
                      value={part.name}
                      onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                      className="col-span-6 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Cant."
                      min={1}
                      value={part.quantity}
                      onChange={(e) => handlePartChange(index, 'quantity', Number(e.target.value))}
                      className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono text-center"
                    />
                    <input
                      type="number"
                      placeholder="Precio Q"
                      value={part.costQ}
                      onChange={(e) => handlePartChange(index, 'costQ', Number(e.target.value))}
                      className="col-span-3 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePartRow(index)}
                      className="col-span-1 text-slate-500 hover:text-red-400 p-1 text-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Signatures Section: Driver + Technician (Mandated Requirement) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <SignaturePad
                  label="Firma del Chofer / Piloto"
                  signatureData={driverSig}
                  onSaveSignature={setDriverSig}
                />
                <SignaturePad
                  label="Firma del Técnico Encargado"
                  signatureData={techSig}
                  onSaveSignature={setTechSig}
                />
              </div>

              {/* Status on Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Estado del Vehículo al Entregar
                  </label>
                  <select
                    value={vehicleStatusDelivery}
                    onChange={(e) => setVehicleStatusDelivery(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Operativo 100%">Operativo 100% (Aprobado)</option>
                    <option value="Observaciones Pendientes">Observaciones Pendientes</option>
                    <option value="Requiere Segunda Fase">Requiere Segunda Fase / Taller Mayor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Observaciones Finales
                  </label>
                  <input
                    type="text"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Vehículo entregado limpio y probado en ruta."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Guardar Hoja de Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Order Details Preview */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="text-lg font-black text-white">
                  Hoja de Trabajo de Campo: {selectedOrder.vehiclePlate}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Documento</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Piloto Encargado:</span>
                  <strong className="text-white text-sm">{selectedOrder.driverName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Matrícula / Placa:</span>
                  <strong className="text-white text-sm font-mono">{selectedOrder.vehiclePlate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tipo de Mantenimiento:</span>
                  <span className="text-slate-200">{selectedOrder.maintenanceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fechas:</span>
                  <span className="text-slate-200">
                    {selectedOrder.startDate} al {selectedOrder.endDate}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Datos del Proceso Realizado:</h4>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.processDetails}
                </div>
              </div>

              {selectedOrder.diagnosticFindings && (
                <div>
                  <h4 className="font-bold text-slate-300 mb-1">Diagnóstico & Recomendaciones:</h4>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                    {selectedOrder.diagnosticFindings}
                  </div>
                </div>
              )}

              {/* Signatures Display */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
                    Firma del Chofer / Piloto
                  </span>
                  {selectedOrder.driverSignature ? (
                    <img
                      src={selectedOrder.driverSignature}
                      alt="Firma Piloto"
                      className="h-16 mx-auto bg-white rounded p-1"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-slate-600 text-xs italic">
                      Sin firma digital
                    </div>
                  )}
                  <span className="text-[11px] text-slate-300 mt-2 block font-medium">
                    {selectedOrder.driverName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
                    Firma del Técnico Encargado
                  </span>
                  {selectedOrder.technicianSignature ? (
                    <img
                      src={selectedOrder.technicianSignature}
                      alt="Firma Técnico"
                      className="h-16 mx-auto bg-white rounded p-1"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-slate-600 text-xs italic">
                      Sin firma digital
                    </div>
                  )}
                  <span className="text-[11px] text-slate-300 mt-2 block font-medium">
                    {selectedOrder.technicianName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY OFFICIAL DOCUMENT LAYOUT */}
      {printableOrder && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans z-50">
          <div className="border-4 border-black p-6 rounded-lg space-y-4">
            {/* Header with Company Logo and Title */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-black text-white flex items-center justify-center font-black text-lg font-mono rounded">
                  MYG
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight uppercase">
                    CONTROL DE MANTENIMIENTO DE VEHÍCULOS 2026 MYG
                  </h1>
                  <p className="text-xs text-gray-700 font-semibold">
                    HOJA OFICIAL DE TRABAJO DE CAMPO Y SERVICIOS
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-black text-red-700 block">
                  {printableOrder.orderNumber}
                </span>
                <span className="text-xs text-gray-600">Guatemala, C.A.</span>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 gap-4 border border-black p-3 bg-gray-50 text-xs">
              <div>
                <p>
                  <strong>NOMBRE DE PILOTO:</strong> {printableOrder.driverName}
                </p>
                <p>
                  <strong>NÚMERO DE MATRÍCULA (PLACA):</strong> {printableOrder.vehiclePlate}
                </p>
                <p>
                  <strong>VEHÍCULO / MODELO:</strong> {printableOrder.vehicleModel || 'N/A'}
                </p>
                <p>
                  <strong>KILOMETRAJE REGISTRADO:</strong> {printableOrder.vehicleMileage.toLocaleString()} KM
                </p>
              </div>
              <div>
                <p>
                  <strong>TIPO DE MANTENIMIENTO:</strong> {printableOrder.maintenanceType}
                </p>
                <p>
                  <strong>FECHA DE REALIZACIÓN:</strong> {printableOrder.startDate}
                </p>
                <p>
                  <strong>FECHA DE CULMINACIÓN:</strong> {printableOrder.endDate}
                </p>
                <p>
                  <strong>TÉCNICO ENCARGADO:</strong> {printableOrder.technicianName} ({printableOrder.technicianRole || 'Técnico'})
                </p>
              </div>
            </div>

            {/* Process Details */}
            <div className="border border-black p-3 text-xs">
              <h3 className="font-black uppercase tracking-wider mb-1 border-b border-gray-400 pb-1">
                DATOS DEL PROCESO Y TRABAJOS EJECUTADOS:
              </h3>
              <p className="whitespace-pre-wrap leading-relaxed pt-1">
                {printableOrder.processDetails}
              </p>
            </div>

            {/* Diagnostic & Observations */}
            {printableOrder.diagnosticFindings && (
              <div className="border border-black p-3 text-xs">
                <h3 className="font-black uppercase tracking-wider mb-1">
                  DIAGNÓSTICO Y OBSERVACIONES TÉCNICAS:
                </h3>
                <p>{printableOrder.diagnosticFindings}</p>
              </div>
            )}

            {/* Parts Used Table */}
            {printableOrder.partsUsedList && printableOrder.partsUsedList.length > 0 && (
              <div className="border border-black p-2 text-xs">
                <h3 className="font-bold mb-1">REPUESTOS Y MATERIALES UTILIZADOS:</h3>
                <table className="w-full text-left border-collapse border border-gray-400">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-400 p-1">Repuesto</th>
                      <th className="border border-gray-400 p-1 text-center">Cantidad</th>
                      <th className="border border-gray-400 p-1 text-right">Precio en Q</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableOrder.partsUsedList.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-400 p-1">{p.name}</td>
                        <td className="border border-gray-400 p-1 text-center">{p.quantity}</td>
                        <td className="border border-gray-400 p-1 text-right">
                          Q {(p.costQ * p.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signatures Footer */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="border-t-2 border-black pt-2">
                {printableOrder.driverSignature ? (
                  <img
                    src={printableOrder.driverSignature}
                    alt="Firma Piloto"
                    className="h-16 mx-auto mb-1"
                  />
                ) : (
                  <div className="h-16" />
                )}
                <p className="font-bold">FIRMA DEL CHOFER / PILOTO</p>
                <p className="text-gray-700">{printableOrder.driverName}</p>
              </div>

              <div className="border-t-2 border-black pt-2">
                {printableOrder.technicianSignature ? (
                  <img
                    src={printableOrder.technicianSignature}
                    alt="Firma Técnico"
                    className="h-16 mx-auto mb-1"
                  />
                ) : (
                  <div className="h-16" />
                )}
                <p className="font-bold">FIRMA DEL TÉCNICO ENCARGADO</p>
                <p className="text-gray-700">{printableOrder.technicianName}</p>
              </div>
            </div>

            {/* Status Stamp */}
            <div className="pt-2 text-center text-[10px] text-gray-500">
              Documento generado por el Sistema de Control de Mantenimiento MYG 2026 • Estado: {printableOrder.vehicleStatusOnDelivery}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
