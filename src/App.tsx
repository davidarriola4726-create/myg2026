import React, { useState } from 'react';
import { FleetProvider, useFleet } from './context/FleetContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VehicleListView } from './components/VehicleListView';
import { VehicleDetailFolder } from './components/VehicleDetailFolder';
import { FuelManagementView } from './components/FuelManagementView';
import { SparePartsSpreadsheet } from './components/SparePartsSpreadsheet';
import { FieldWorkOrderView } from './components/FieldWorkOrderView';
import { ServiceCalendarView } from './components/ServiceCalendarView';
import { ReportsView } from './components/ReportsView';
import { NewVehicleModal } from './components/NewVehicleModal';
import { AndroidBuildModal } from './components/AndroidBuildModal';
import { MygLogo } from './components/MygLogo';
import {
  Car,
  Fuel,
  TableProperties,
  ClipboardCheck,
  Calendar,
  FileSpreadsheet,
  LayoutDashboard,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { state, isAuthenticated } = useFleet();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showNewVehicleModal, setShowNewVehicleModal] = useState<boolean>(false);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);

  // If not authenticated, display MYG 2026 security login screen
  if (!isAuthenticated) {
    return <AuthScreen onOpenAndroidGuide={() => setShowAndroidModal(true)} />;
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setActiveTab('vehicle-detail');
  };

  const handleBackToVehicles = () => {
    setSelectedVehicleId(null);
    setActiveTab('vehicles');
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white relative">
      {/* Subtle Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden="true"
      />

      {/* Main Top Navigation */}
      <div className="relative z-20">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'vehicle-detail') {
              setSelectedVehicleId(null);
            }
            setActiveTab(tab);
          }}
          onOpenAndroidGuide={() => setShowAndroidModal(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectVehicle={handleSelectVehicle}
            onOpenNewVehicleModal={() => setShowNewVehicleModal(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehicleListView
            onSelectVehicle={handleSelectVehicle}
            onOpenNewVehicleModal={() => setShowNewVehicleModal(true)}
          />
        )}

        {activeTab === 'vehicle-detail' && selectedVehicleId && (
          <VehicleDetailFolder
            vehicleId={selectedVehicleId}
            onBack={handleBackToVehicles}
          />
        )}

        {activeTab === 'fuel' && <FuelManagementView />}

        {activeTab === 'spare-parts' && <SparePartsSpreadsheet />}

        {activeTab === 'work-orders' && <FieldWorkOrderView />}

        {activeTab === 'calendar' && <ServiceCalendarView />}

        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-4 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MygLogo size="sm" />
            <span className="font-mono text-[11px] text-slate-300">
              Control de Mantenimiento de Vehículos 2026 MYG • Guatemala, C.A.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Sincronización en Tiempo Real Activa
            </span>
            <button
              onClick={() => setShowAndroidModal(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android & Play Store</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <NewVehicleModal
        isOpen={showNewVehicleModal}
        onClose={() => setShowNewVehicleModal(false)}
      />

      <AndroidBuildModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <MainAppContent />
    </FleetProvider>
  );
}
