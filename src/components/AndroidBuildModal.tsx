import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Download,
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AndroidBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidBuildModal: React.FC<AndroidBuildModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'capacitor' | 'pwa' | 'twa'>('capacitor');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Guía de Compilación para Android Studio & Play Store
              </h3>
              <p className="text-xs text-slate-400">
                Paso a paso para compilar la app MYG 2026 en APK / AAB para Android y Google Play.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'capacitor'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Capacitor (Recomendado para Android Studio)
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Instalación PWA (Móvil Inmediato)
          </button>
          <button
            onClick={() => setActiveTab('twa')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'twa'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Google Play Console (Publicación)
          </button>
        </div>

        {/* Tab Content 1: Capacitor for Android Studio */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                Pasos para compilar en Android Studio
              </span>
              <p className="text-slate-400 leading-relaxed">
                Descargue el proyecto como archivo ZIP desde el menú superior de Google AI Studio, descomprímalo en su computadora y ejecute los siguientes comandos en su terminal:
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-white">Paso 1: Instalar dependencias de Capacitor</strong>
                <button
                  onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/cli @capacitor/android', 1)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 1 ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/80 rounded-lg text-red-400 font-mono text-[11px] overflow-x-auto">
                npm install @capacitor/core @capacitor/cli @capacitor/android
              </pre>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-white">Paso 2: Inicializar Capacitor</strong>
                <button
                  onClick={() => copyToClipboard('npx cap init "MYG 2026 Flota" "com.myg.mantenimiento2026" --web-dir dist', 2)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/80 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
                npx cap init "MYG 2026 Flota" "com.myg.mantenimiento2026" --web-dir dist
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-white">Paso 3: Construir el proyecto y agregar la plataforma Android</strong>
                <button
                  onClick={() => copyToClipboard('npm run build && npx cap add android && npx cap sync', 3)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 3 ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/80 rounded-lg text-sky-400 font-mono text-[11px] overflow-x-auto">
                npm run build && npx cap add android && npx cap sync
              </pre>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-white">Paso 4: Abrir directamente en Android Studio</strong>
                <button
                  onClick={() => copyToClipboard('npx cap open android', 4)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 4 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 4 ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/80 rounded-lg text-amber-400 font-mono text-[11px] overflow-x-auto">
                npx cap open android
              </pre>
              <p className="text-slate-400 text-[11px] mt-1">
                Esto abrirá Android Studio automáticamente. Desde allí, haga clic en <strong>Build &gt; Generate Signed Bundle / APK</strong> para generar el archivo <code>.aab</code> o <code>.apk</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: PWA */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 space-y-2">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Instalación Directa como Aplicación Nativa en Android / iPhone
              </span>
              <p className="leading-relaxed">
                Esta aplicación está optimizada con tecnología PWA y sincronización en tiempo real. Cualquier piloto o encargado puede instalarla en su teléfono Android o iOS sin necesidad de pasar por la tienda:
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <li>Abra la URL de la aplicación en <strong>Google Chrome</strong> en su teléfono Android.</li>
              <li>Toque el menú de tres puntos (⋮) en la esquina superior derecha del navegador.</li>
              <li>Seleccione <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</li>
              <li>La aplicación se instalará con el ícono y logotipo de <strong>MYG 2026</strong> y funcionará a pantalla completa como una app nativa con sincronización en tiempo real.</li>
            </ol>
          </div>
        )}

        {/* Tab Content 3: Google Play Store */}
        {activeTab === 'twa' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-sky-300 space-y-2">
              <span className="font-bold text-sky-400 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Requisitos para publicar en Google Play Store
              </span>
              <p className="leading-relaxed">
                Para subir el archivo <strong>Android App Bundle (.aab)</strong> a Google Play Console:
              </p>
            </div>

            <div className="space-y-2 text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="p-2 border-b border-slate-800">
                <strong className="text-white block">1. Cuenta de Google Play Console</strong>
                <span className="text-slate-400">Requiere una cuenta de desarrollador registrada en play.google.com/console.</span>
              </div>
              <div className="p-2 border-b border-slate-800">
                <strong className="text-white block">2. Firma de la Llave (Keystore)</strong>
                <span className="text-slate-400">En Android Studio, vaya a <em>Build &gt; Generate Signed Bundle/APK</em> y cree su keystore de producción seguro.</span>
              </div>
              <div className="p-2 border-b border-slate-800">
                <strong className="text-white block">3. Capturas de Pantalla y Ficha Técnica</strong>
                <span className="text-slate-400">Tome capturas del Dashboard, Ficha por Placa, Gráfica de Combustible y Hoja de Trabajo con Firma.</span>
              </div>
              <div className="p-2">
                <strong className="text-white block">4. Subida y Aprobación</strong>
                <span className="text-slate-400">Suba el archivo <code>app-release.aab</code> generado en la carpeta <code>android/app/release/</code>.</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Entendido / Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
