"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Layers } from "lucide-react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRetrying(false);
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center transition-all duration-300 hover:shadow-2xl">
        {/* STEF Accent Header */}
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl animate-pulse">
            <WifiOff className="w-10 h-10" />
            <span className="absolute top-1 right-1 flex h-3.w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
          </div>
        </div>

        {/* Brand/App Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">EPI MANAGER</span>
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
          Connexion Interrompue
        </h1>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Il semble que vous soyez hors-ligne. L'application ne peut pas joindre nos serveurs STEF pour le moment.
        </p>

        {/* Resiliency Info Card */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 text-left mb-8">
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            💡 Mode Hors-ligne Actif
          </h2>
          <p className="text-xs text-blue-800 leading-normal">
            Vous pouvez toujours saisir et valider vos demandes d'EPI ainsi que vos signatures. Elles sont sauvegardées en toute sécurité sur votre appareil et se synchroniseront automatiquement dès le retour du réseau.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Vérification..." : "Réessayer la connexion"}
        </button>

        {isOnline && (
          <div className="mt-4 text-xs font-semibold text-green-600 animate-bounce">
            Connexion détectée ! Rechargement en cours...
          </div>
        )}
      </div>
    </main>
  );
}
