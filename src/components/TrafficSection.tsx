import React, { useState } from "react";
import { TrafficAlert } from "../types";
import { AlertCircle, ShieldAlert, Timer, Navigation, MapPin, Search } from "lucide-react";

interface TrafficSectionProps {
  alerts: TrafficAlert[];
}

export default function TrafficSection({ alerts }: TrafficSectionProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'normal'>('all');
  const [search, setSearch] = useState("");

  const filteredAlerts = alerts.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.road.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate stats for the visual overview
  const criticalCount = alerts.filter(a => a.status === 'critical').length;
  const warningCount = alerts.filter(a => a.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Schematic Overview of Guadeloupe Road Networks */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-6 rounded-3xl text-white border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Réseau Routier Territorial
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              État global des routes de l&apos;Archipel
            </h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Consultez l&apos;état en temps réel des grands axes de la Guadeloupe : Nationale 1 (RN1), Nationale 2 (RN2), Route des Mamelles (RD23) et le pont de la Gabarre.
            </p>
          </div>

          {/* Quick status board */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full xl:w-auto">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col justify-center min-w-[120px]">
              <span className="text-red-400 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Bloqué
              </span>
              <span className="text-2xl font-black text-red-500 mt-1">{criticalCount}</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col justify-center min-w-[120px]">
              <span className="text-amber-400 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Ralentis
              </span>
              <span className="text-2xl font-black text-amber-500 mt-1">{warningCount}</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-center min-w-[120px] col-span-2 sm:col-span-1">
              <span className="text-emerald-400 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                🟢 Général
              </span>
              <span className="text-xs font-bold text-emerald-300 antialiased mt-1.5 leading-tight">
                Fluide sur l&apos;ensemble
              </span>
            </div>
          </div>
        </div>

        {/* Schematic road list badges for immediate reading */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap gap-3 items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Axes majeurs :</span>
          <span className="text-xs px-2.5 py-1 text-slate-350 bg-slate-950/60 rounded-lg flex items-center gap-1.5 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> RN1 (Pont de la Gabarre - Jarry)
          </span>
          <span className="text-xs px-2.5 py-1 text-slate-350 bg-slate-950/60 rounded-lg flex items-center gap-1.5 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> RN2 (Baie-Mahault - Basse-Terre)
          </span>
          <span className="text-xs px-2.5 py-1 text-slate-350 bg-slate-950/60 rounded-lg flex items-center gap-1.5 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> RN1 (Sainte-Rose / La Boucan)
          </span>
          <span className="text-xs px-2.5 py-1 text-slate-350 bg-slate-950/60 rounded-lg flex items-center gap-1.5 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> RD23 (Route des Mamelles)
          </span>
        </div>
      </div>

      {/* Filter and Search tool */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            id="traffic-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par route (RN1, Jarry, Sainte-Rose...)"
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-100 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Segmented status buttons */}
        <div className="bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 flex gap-1 w-full md:w-auto">
          <button
            id="traffic-filter-all"
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filter === 'all' ? 'bg-emerald-500 text-slate-950 font-extrabold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous ({alerts.length})
          </button>
          <button
            id="traffic-filter-critical"
            onClick={() => setFilter('critical')}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filter === 'critical' ? 'bg-rose-600 text-white shadow' : 'text-rose-450 hover:text-rose-400'
            }`}
          >
            Critique ({alerts.filter(a => a.status === 'critical').length})
          </button>
          <button
            id="traffic-filter-warning"
            onClick={() => setFilter('warning')}
            className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              filter === 'warning' ? 'bg-amber-500 text-slate-950 font-extrabold shadow' : 'text-amber-450 hover:text-amber-400'
            }`}
          >
            Ralentis ({alerts.filter(a => a.status === 'warning').length})
          </button>
        </div>
      </div>

      {/* Traffic lists */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <Navigation className="w-12 h-12 text-slate-600 mx-auto mb-2 animate-bounce" />
          <p className="text-base text-slate-300 font-semibold">Aucun incident de circulation signalé</p>
          <p className="text-xs text-slate-500 mt-1">La circulation semble fluide sur l&apos;ensemble de ces routes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border bg-slate-900/55 transition hover:border-emerald-500/20 flex flex-col md:flex-row md:items-center gap-4 ${
                alert.status === 'critical'
                  ? 'border-red-500/10'
                  : alert.status === 'warning'
                  ? 'border-amber-500/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Alert Icon Badge state */}
              <div className="flex items-center gap-3 md:block">
                <div className={`p-3 rounded-xl inline-block ${
                  alert.status === 'critical'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : alert.status === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-505/20'
                }`}>
                  {alert.status === 'critical' ? (
                    <ShieldAlert className="w-5.5 h-5.5" />
                  ) : (
                    <AlertCircle className="w-5.5 h-5.5" />
                  )}
                </div>

                <div className="block md:hidden">
                  <span className={`text-[9px] tracking-widest uppercase font-black px-2 py-0.5 rounded ${
                    alert.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-350 border border-rose-500/20'
                      : alert.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-350 border border-amber-500/20'
                      : 'bg-emerald-500/20 text-emerald-355'
                  }`}>
                    {alert.status === 'critical' ? 'Critique' : 'Ralentissement'}
                  </span>
                </div>
              </div>

              {/* Information body text */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center flex-wrap gap-2">
                  <h4 className="font-bold text-slate-105 text-white text-base">
                    {alert.title}
                  </h4>
                  <span className="text-[10px] font-bold bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 uppercase tracking-wider font-mono">
                    <MapPin className="w-3 h-3" />
                    {alert.road}
                  </span>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {alert.description}
                </p>

                {/* Sub-info line */}
                <div className="flex items-center gap-4 pt-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <Timer className="w-3.5 h-3.5 text-slate-500" />
                    {alert.timestamp}
                  </span>
                  <span className="font-mono">Source : <strong className="text-emerald-500">{alert.source}</strong></span>
                </div>
              </div>

              {/* Status Side Indicator on Desktop */}
              <div className="hidden md:block text-right">
                <span className={`text-[10px] tracking-widest uppercase font-black px-2.5 py-1 rounded ${
                  alert.status === 'critical'
                    ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                    : 'bg-amber-500/10 text-amber-455 border border-amber-500/25'
                }`}>
                  {alert.status === 'critical' ? 'Urgent' : 'Alerte'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
