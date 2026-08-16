import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { MygLogo } from './MygLogo';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Fuel,
  TableProperties,
  ClipboardCheck,
  FileBarChart2,
  Smartphone,
  LogOut,
  Radio,
  Download,
  Upload,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'vehicles'
  | 'calendar'
  | 'fuel'
  | 'parts'
  | 'workorders'
  | 'reports'
  | 'android';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  selectedVehicleId?: string | null;
  onClearSelectedVehicle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedVehicleId,
  onClearSelectedVehicle,
}) => {
  const { logout, onlineDevices, isSyncing, exportBackup, importBackup, state, getVehicleAlertStatus } = useFleet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute urgent alerts count
  const dangerAlertsCount = state.vehicles.filter((v) => getVehicleAlertStatus(v).status === 'danger').length;
  const warningAlertsCount = state.vehicles.filter((v) => getVehicleAlertStatus(v).status === 'warning').length;

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    {
      id: 'vehicles',
      label: 'Fichas de Vehículos',
      icon: Car,
      badge: dangerAlertsCount > 0 ? dangerAlertsCount : undefined,
    },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'fuel', label: 'Combustible (Q)', icon: Fuel },
    { id: 'parts', label: 'Hoja de Repuestos', icon: TableProperties },
    { id: 'workorders', label: 'Hojas de Trabajo', icon: ClipboardCheck },
    { id: 'reports', label: 'Informes', icon: FileBarChart2 },
    { id: 'android', label: 'Móvil & Sync', icon: Smartphone },
  ];

  const handleTabClick = (tab: TabType) => {
    if (tab === 'vehicles' && selectedVehicleId && onClearSelectedVehicle) {
      // Keep or reset as needed
    }
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          alert('Copia de seguridad restaurada exitosamente.');
        } else {
          alert('Error al leer el archivo de respaldo. Asegúrese de que sea un JSON válido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800 shadow-lg text-slate-100">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div
            onClick={() => handleTabClick('dashboard')}
            className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MygLogo size="md" />
          </div>

          {/* Real-time Indicator & Desktop Tools */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Live Sync Status */}
            <div
              onClick={() => onSelectTab('android')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:border-red-500/50 cursor-pointer transition-all shadow-inner"
              title="Dispositivos conectados en tiempo real"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">
                {onlineDevices} {onlineDevices === 1 ? 'dispositivo en vivo' : 'dispositivos en vivo'}
              </span>
              {isSyncing && <span className="text-[10px] text-amber-400">(Sincronizando...)</span>}
            </div>

            {/* Quick Alert Warning pill if any danger */}
            {dangerAlertsCount > 0 && (
              <button
                onClick={() => onSelectTab('vehicles')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-semibold hover:bg-red-900/80 transition-colors animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{dangerAlertsCount} Vencido{dangerAlertsCount > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Backup actions */}
            <button
              onClick={exportBackup}
              title="Descargar copia de seguridad JSON"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>Copia</span>
            </button>

            <label
              title="Restaurar copia de seguridad"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Restaurar</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            {/* Logout */}
            <button
              onClick={logout}
              title="Cerrar sesión segura"
              className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-800/60 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {dangerAlertsCount > 0 && (
              <span className="flex items-center justify-center h-6 px-2 rounded-full bg-red-600 text-white text-xs font-black">
                {dangerAlertsCount}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 border-t border-slate-800/60 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-700/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-red-700' : 'bg-red-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-5 space-y-1 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-red-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile footer utilities */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineDevices} disp. conectados</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportBackup}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700"
              >
                Copia JSON
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded bg-red-950 text-red-300 text-xs border border-red-800"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
