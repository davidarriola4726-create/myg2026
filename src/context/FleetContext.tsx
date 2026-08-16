import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  Vehicle,
  VehicleRecord,
  ServiceEvent,
  FuelLog,
  SparePartItem,
  FieldWorkOrder,
  AlertStatus,
} from '../types';
import { initialAppState } from '../data/initialData';

interface FleetContextType {
  state: AppState;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  onlineDevices: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  forceSync: () => Promise<void>;

  // Vehicle operations
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleAlertStatus: (vehicle: Vehicle) => { status: AlertStatus; kmRemaining: number; daysRemaining: number; label: string };

  // Record operations (reparaciones, cambios, mantenimiento, servicios)
  addRecord: (record: Omit<VehicleRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, record: Partial<VehicleRecord>) => void;
  deleteRecord: (id: string) => void;

  // Scheduled services
  addService: (service: Omit<ServiceEvent, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceEvent>) => void;
  deleteService: (id: string) => void;

  // Fuel logs
  addFuelLog: (fuel: Omit<FuelLog, 'id' | 'createdAt'>) => void;
  updateFuelLog: (id: string, fuel: Partial<FuelLog>) => void;
  deleteFuelLog: (id: string) => void;

  // Spare parts spreadsheet
  addSparePart: (part: Omit<SparePartItem, 'id'>) => void;
  updateSparePart: (id: string, part: Partial<SparePartItem>) => void;
  deleteSparePart: (id: string) => void;

  // Field work orders
  addWorkOrder: (order: Omit<FieldWorkOrder, 'id' | 'createdAt'>) => void;
  updateWorkOrder: (id: string, order: Partial<FieldWorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;

  // System actions
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = 'MYG_FLEET_STATE_2026';
const AUTH_KEY = 'MYG_AUTH_SESSION_2026';
const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9);

const FleetContext = createContext<FleetContextType | null>(null);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return { ...initialAppState, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Could not read cached state:', e);
    }
    return initialAppState;
  });

  const [onlineDevices, setOnlineDevices] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [syncError, setSyncError] = useState<string | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [state]);

  // Push state to backend server
  const pushStateToServer = useCallback(async (newState: AppState) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState, senderId: CLIENT_ID }),
      });
      if (res.ok) {
        setLastSyncTime(new Date());
        setSyncError(null);
      }
    } catch (err: any) {
      console.warn('Offline or server sync pending:', err);
      setSyncError('Trabajando en modo local (sin conexión al servidor)');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch initial state from server on startup
  const fetchServerState = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/state');
      if (res.ok) {
        const serverState: AppState = await res.json();
        if (serverState && serverState.vehicles) {
          setState((prev) => {
            // Pick newer or merged state
            if (!prev.lastSyncTimestamp || (serverState.lastSyncTimestamp && serverState.lastSyncTimestamp >= prev.lastSyncTimestamp)) {
              return serverState;
            }
            return prev;
          });
          setLastSyncTime(new Date());
          setSyncError(null);
        }
      }
    } catch (err) {
      console.warn('Using local cached data on startup');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Connect SSE for real-time multi-device sync
  useEffect(() => {
    fetchServerState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime-events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CONNECTED') {
            if (data.clientsCount) setOnlineDevices(data.clientsCount);
          } else if (data.type === 'STATE_UPDATE') {
            if (data.senderId !== CLIENT_ID && data.state) {
              setState(data.state);
              setLastSyncTime(new Date());
            }
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        // SSE fallback retry silently
      };
    } catch (e) {
      console.warn('SSE not available, falling back to local sync');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchServerState]);

  const login = (password: string): boolean => {
    if (password.trim() === 'myg2026') {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const updateStateAndSync = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const withTimestamp: AppState = { ...next, lastSyncTimestamp: Date.now() };
      pushStateToServer(withTimestamp);
      return withTimestamp;
    });
  };

  const forceSync = async () => {
    await fetchServerState();
  };

  // Helper for vehicle alert status calculation (Verde, Amarillo, Rojo)
  const getVehicleAlertStatus = useCallback((vehicle: Vehicle) => {
    const kmRemaining = vehicle.nextMaintenanceKm - vehicle.currentMileage;
    
    // Calculate days remaining
    const now = new Date();
    const targetDate = new Date(vehicle.nextMaintenanceDate + 'T00:00:00');
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (kmRemaining <= 0 || daysRemaining < 0) {
      return {
        status: 'danger' as AlertStatus,
        kmRemaining,
        daysRemaining,
        label: kmRemaining <= 0 ? `Vencido (${Math.abs(kmRemaining).toLocaleString()} km excedidos)` : `Vencido (${Math.abs(daysRemaining)} días vencido)`,
      };
    }

    if (kmRemaining <= 1000 || daysRemaining <= 15) {
      return {
        status: 'warning' as AlertStatus,
        kmRemaining,
        daysRemaining,
        label: kmRemaining <= 1000 ? `Próximo (${kmRemaining.toLocaleString()} km restantes)` : `Próximo (${daysRemaining} días restantes)`,
      };
    }

    return {
      status: 'ok' as AlertStatus,
      kmRemaining,
      daysRemaining,
      label: `Al día (${kmRemaining.toLocaleString()} km / ${daysRemaining} días)`,
    };
  }, []);

  // CRUD for Vehicles
  const addVehicle = (v: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...v,
      plate: v.plate.trim().toUpperCase(),
      id: 'veh-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    updateStateAndSync((prev) => ({
      ...prev,
      vehicles: [newVehicle, ...prev.vehicles],
    }));
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const deleteVehicle = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
      records: prev.records.filter((r) => r.vehicleId !== id),
      services: prev.services.filter((s) => s.vehicleId !== id),
      fuelLogs: prev.fuelLogs.filter((f) => f.vehicleId !== id),
    }));
  };

  // CRUD for Vehicle Records
  const addRecord = (r: Omit<VehicleRecord, 'id' | 'createdAt'>) => {
    const newRecord: VehicleRecord = {
      ...r,
      id: 'rec-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    updateStateAndSync((prev) => {
      // Auto-update vehicle mileage if current is higher
      const updatedVehicles = prev.vehicles.map((v) => {
        if (v.id === r.vehicleId && r.mileageAtService > v.currentMileage) {
          return { ...v, currentMileage: r.mileageAtService };
        }
        return v;
      });
      return {
        ...prev,
        vehicles: updatedVehicles,
        records: [newRecord, ...prev.records],
      };
    });
  };

  const updateRecord = (id: string, updates: Partial<VehicleRecord>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      records: prev.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  const deleteRecord = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      records: prev.records.filter((r) => r.id !== id),
    }));
  };

  // CRUD for Services
  const addService = (s: Omit<ServiceEvent, 'id'>) => {
    const newService: ServiceEvent = {
      ...s,
      id: 'srv-' + Date.now(),
    };
    updateStateAndSync((prev) => ({
      ...prev,
      services: [newService, ...prev.services],
    }));
  };

  const updateService = (id: string, updates: Partial<ServiceEvent>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteService = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  // CRUD for Fuel Logs
  const addFuelLog = (f: Omit<FuelLog, 'id' | 'createdAt'>) => {
    const newLog: FuelLog = {
      ...f,
      id: 'fl-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    updateStateAndSync((prev) => ({
      ...prev,
      fuelLogs: [newLog, ...prev.fuelLogs],
    }));
  };

  const updateFuelLog = (id: string, updates: Partial<FuelLog>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      fuelLogs: prev.fuelLogs.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const deleteFuelLog = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      fuelLogs: prev.fuelLogs.filter((f) => f.id !== id),
    }));
  };

  // CRUD for Spare Parts Spreadsheet
  const addSparePart = (p: Omit<SparePartItem, 'id'>) => {
    const newPart: SparePartItem = {
      ...p,
      id: 'sp-' + Date.now(),
    };
    updateStateAndSync((prev) => ({
      ...prev,
      spareParts: [newPart, ...prev.spareParts],
    }));
  };

  const updateSparePart = (id: string, updates: Partial<SparePartItem>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      spareParts: prev.spareParts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deleteSparePart = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      spareParts: prev.spareParts.filter((p) => p.id !== id),
    }));
  };

  // CRUD for Work Orders
  const addWorkOrder = (w: Omit<FieldWorkOrder, 'id' | 'createdAt'>) => {
    const newOrder: FieldWorkOrder = {
      ...w,
      id: 'wo-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    updateStateAndSync((prev) => ({
      ...prev,
      workOrders: [newOrder, ...prev.workOrders],
    }));
  };

  const updateWorkOrder = (id: string, updates: Partial<FieldWorkOrder>) => {
    updateStateAndSync((prev) => ({
      ...prev,
      workOrders: prev.workOrders.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  };

  const deleteWorkOrder = (id: string) => {
    updateStateAndSync((prev) => ({
      ...prev,
      workOrders: prev.workOrders.filter((w) => w.id !== id),
    }));
  };

  // Backup and Restore
  const exportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `MYG_2026_CopiaSeguridad_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.vehicles)) {
        updateStateAndSync(() => ({ ...initialAppState, ...parsed, lastSyncTimestamp: Date.now() }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    updateStateAndSync(() => initialAppState);
  };

  const value = useMemo(
    () => ({
      state,
      isAuthenticated,
      login,
      logout,
      onlineDevices,
      isSyncing,
      lastSyncTime,
      syncError,
      forceSync,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehicleAlertStatus,
      addRecord,
      updateRecord,
      deleteRecord,
      addService,
      updateService,
      deleteService,
      addFuelLog,
      updateFuelLog,
      deleteFuelLog,
      addSparePart,
      updateSparePart,
      deleteSparePart,
      addWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
      exportBackup,
      importBackup,
      resetToDefaultData,
    }),
    [state, isAuthenticated, onlineDevices, isSyncing, lastSyncTime, syncError, getVehicleAlertStatus, pushStateToServer]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
