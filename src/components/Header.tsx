import React from "react";
import { Radio, RefreshCw, Bell, ShieldAlert, Navigation } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  retrievedAt: string | null;
  groundedWithGemini: boolean;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export default function Header({
  onRefresh,
  isRefreshing,
  retrievedAt,
  groundedWithGemini,
  notificationCount,
  onOpenNotifications,
}: HeaderProps) {
  // Format retrieved date beautifully
  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "En direct";
    }
  };

  return (
    <header className="relative bg-slate-900/55 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-xl mb-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo and App Title with Bento "971" badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-500 hover:bg-emerald-400 transition rounded-xl flex items-center justify-center font-black text-slate-950 text-base md:text-lg select-none shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            971
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none text-white">
                GwadaActu Live
              </h1>
              {groundedWithGemini ? (
                <span className="text-[10px] uppercase font-black tracking-wider bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  Grounded with Gemini
                </span>
              ) : (
                <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15">
                  Flux Direct
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-1">
              Temps Réel • Flux Guadeloupe
            </p>
          </div>
        </div>

        {/* Action Controls & Alert Stats widgets */}
        <div className="flex items-center flex-wrap md:flex-nowrap gap-4 justify-between md:justify-end">
          
          {/* Quick status board from Bento */}
          <div className="flex items-center gap-4 text-left">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Statut Général</span>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 text-[9px] font-black tracking-widest border border-yellow-500/25 uppercase">
                  Vigilance: JAUNE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-black tracking-widest border border-emerald-500/25 uppercase">
                  Sargasses: RAS
                </span>
              </div>
            </div>

            <div className="text-right hidden sm:block border-l border-slate-800 pl-4">
              <div className="text-[11px] font-black text-slate-200">
                {formatTime(retrievedAt)}
              </div>
              <div className="text-[9px] text-slate-400 uppercase font-bold font-mono tracking-wider">Miroir Live</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sync trigger button */}
            <button
              id="header-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-200 hover:text-white rounded-xl transition duration-150 cursor-pointer disabled:cursor-not-allowed border border-slate-700 disabled:border-slate-800/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Sync..." : "Sync"}
            </button>

            {/* In-app Notification center bell trigger */}
            <button
              id="header-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition duration-150 cursor-pointer"
              title="Centre de notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center border-2 border-slate-900 animate-bounce">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
      
    </header>
  );
}
