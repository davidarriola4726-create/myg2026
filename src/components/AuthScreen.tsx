import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { MygLogo } from './MygLogo';
import { Lock, ShieldCheck, KeyRound, ArrowRight, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useFleet();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    setTimeout(() => {
      const ok = login(password);
      if (!ok) {
        setError(true);
      }
      setLoading(false);
    }, 300);
  };

  const handleQuickDemo = () => {
    setPassword('myg2026');
    login('myg2026');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07090E] text-slate-100 flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      {/* Background Graphic Watermark matching the uploaded image */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden flex items-center justify-center">
        <MygLogo size="xl" showText={false} className="scale-200 transform translate-x-12 translate-y-6 blur-[1px]" />
      </div>

      {/* Decorative Radial Lighting */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-800/15 rounded-full blur-3xl pointer-events-none" />

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        <div className="flex flex-col items-center text-center mb-6">
          <MygLogo size="lg" className="mb-4" />
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            CONTROL DE MANTENIMIENTO
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
            Sistema Profesional de Flota Automotriz 2026 MYG
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-red-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Ingrese contraseña de seguridad"
                autoFocus
                className={`w-full pl-10 pr-4 py-3 bg-slate-950/80 border text-white text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-500 ${
                  error
                    ? 'border-red-500 ring-2 ring-red-500/30'
                    : 'border-slate-700/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                }`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 font-medium animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Contraseña incorrecta. Utilice la clave autorizada: <span className="font-mono font-bold text-red-300">myg2026</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700/50 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>Autocompletar clave: <strong className="text-red-400 font-mono">myg2026</strong></span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sincronización en Vivo
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                Android & Web App
              </span>
            </div>
          </div>
        </form>
      </div>

      <div className="absolute bottom-4 text-center text-xs text-slate-400 tracking-wider">
        MYG Flota Automotriz 2026 • Guatemala Q (Quetzales)
      </div>
    </div>
  );
};
