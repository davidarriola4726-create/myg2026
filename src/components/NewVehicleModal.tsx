import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle } from '../types';
import { Car, X, Plus, Calendar, Gauge, User, Phone, Shield } from 'lucide-react';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleCreated?: (newId: string) => void;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  isOpen,
  onClose,
  onVehicleCreated,
}) => {
  const { addVehicle } = useFleet();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [type, setType] = useState<Vehicle['type']>('Camión');
  const [vin, setVin] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [color, setColor] = useState('Blanco');
  const [fuelType, setFuelType] = useState<Vehicle['fuelType']>('Diesel');
  const [currentMileage, setCurrentMileage] = useState<number>(10000);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('2026-09-01');
  const [nextMaintenanceMileage, setNextMaintenanceMileage] = useState<number>(15000);
  const [maintenanceIntervalKm, setMaintenanceIntervalKm] = useState<number>(5000);
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState<number>(90);
  const [status, setStatus] = useState<Vehicle['status']>('operativo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !brand.trim() || !driverName.trim()) return;

    const formattedPlate = plate.trim().toUpperCase();

    addVehicle({
      plate: formattedPlate,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year) || 2024,
      type,
      vin: vin.trim() || undefined,
      engineNumber: engineNumber.trim() || undefined,
      color: color.trim(),
      fuelType,
      currentMileage: Number(currentMileage) || 0,
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim() || undefined,
      driverLicense: driverLicense.trim() || undefined,
      nextMaintenanceDate,
      nextMaintenanceMileage: Number(nextMaintenanceMileage) || Number(currentMileage) + Number(maintenanceIntervalKm),
      maintenanceIntervalKm: Number(maintenanceIntervalKm) || 5000,
      maintenanceIntervalDays: Number(maintenanceIntervalDays) || 90,
      status,
      assignedRoute: 'Ruta Central MYG',
      recordsCount: {
        reparaciones: 0,
        cambios: 0,
        mantenimiento: 0,
        servicios: 0,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Registrar Nuevo Vehículo a la Flota
              </h3>
              <p className="text-xs text-slate-400">
                Se creará automáticamente su ficha y subcarpeta individual por placa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* License Plate Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-950 border border-red-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-red-300 font-bold uppercase text-[11px] mb-1">
                Número de Matrícula / Placa *
              </label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="Ej. P-582JLM o C-120BKP"
                className="w-full px-3 py-2 bg-slate-950 border border-red-500/50 rounded-xl text-white font-mono font-black text-base uppercase focus:outline-none focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Vehículo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              >
                <option value="Camión">Camión de Carga</option>
                <option value="Cabezal / Trailer">Cabezal / Trailer</option>
                <option value="Pick-up">Pick-up / Utilitario</option>
                <option value="Panel / Van">Panel / Van de Reparto</option>
                <option value="Automóvil">Automóvil / Sedán</option>
                <option value="Maquinaria">Maquinaria Especial</option>
              </select>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Marca *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota, Hino, Isuzu..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Línea / Modelo *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Hilux, 500 Series, NPR..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Año</label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Color & Fuel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Blanco, Gris, Rojo..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Combustible</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Gas">Gas / GLP</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Odómetro Inicial (Km)</label>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Driver Info */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-red-500" />
              Chofer / Piloto Asignado
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Nombre y Apellido del Chofer"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+502 5555-0000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Triggers & Alert Configuration */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Configuración de Alertas y Próximo Mantenimiento
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Fecha Próximo Mantenimiento *
                </label>
                <input
                  type="date"
                  required
                  value={nextMaintenanceDate}
                  onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Kilometraje Próximo Mantenimiento
                </label>
                <input
                  type="number"
                  value={nextMaintenanceMileage}
                  onChange={(e) => setNextMaintenanceMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold shadow-lg shadow-red-600/30 cursor-pointer"
            >
              Crear Ficha de Vehículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
