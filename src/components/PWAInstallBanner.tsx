import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Wifi, WifiOff, Check } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // If offline, show subtle offline alert banner
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs sticky top-0 z-50 animate-fade-in">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Modo Offline Ativo • Os seus cartões e certificados sincronizados estão disponíveis para consulta rápida.</span>
        </div>
        <span className="text-[10px] font-mono bg-black/10 px-2 py-0.5 rounded">Cache Local</span>
      </div>
    );
  }

  if (!isInstallable || isDismissed || installed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#990B21] via-[#C8102E] to-slate-950 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs z-40 relative animate-fade-in">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-[#FFCC00]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold tracking-tight truncate">Instalar Aplicação Móvel MPLA Diáspora</p>
          <p className="text-[10px] text-white/80 truncate">Aceda ao Cartão de Militante e Certificado mesmo sem Internet.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-[#FFCC00] hover:bg-yellow-400 text-slate-950 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded-md transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
