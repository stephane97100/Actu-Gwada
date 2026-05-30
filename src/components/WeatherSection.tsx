import React from "react";
import { WeatherInfo } from "../types";
import { CloudRain, Compass, Droplet, Sun, Wind, Ban, AlertTriangle, HelpCircle, ArrowRight } from "lucide-react";

interface WeatherSectionProps {
  weather: WeatherInfo;
}

export default function WeatherSection({ weather }: WeatherSectionProps) {
  // Map vigilance level to Tailwind colors
  const getVigilanceColors = (level: WeatherInfo['vigilanceLevel']) => {
    switch (level) {
      case 'Vert':
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
          badge: "bg-emerald-500 text-slate-950 font-black",
          accent: "border-emerald-500/40",
          text: "text-emerald-400"
        };
      case 'Jaune':
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
          badge: "bg-amber-400 text-slate-950 font-black",
          accent: "border-amber-400/40",
          text: "text-amber-400"
        };
      case 'Orange':
        return {
          bg: "bg-orange-500/10 border-orange-500/20 text-orange-300",
          badge: "bg-orange-500 text-slate-950 font-black animate-pulse",
          accent: "border-orange-500/40",
          text: "text-orange-400"
        };
      case 'Rouge':
        return {
          bg: "bg-red-500/15 border-red-500/25 text-red-300",
          badge: "bg-red-500 text-slate-950 font-black animate-bounce",
          accent: "border-red-500/40",
          text: "text-red-400"
        };
      case 'Violet':
        return {
          bg: "bg-purple-500/15 border-purple-500/25 text-purple-300",
          badge: "bg-purple-600 text-white font-black animate-ping",
          accent: "border-purple-500/40",
          text: "text-purple-400"
        };
    }
  };

  const colors = getVigilanceColors(weather.vigilanceLevel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Primary Current Weather Grid Cards */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core weather card */}
        <div className="bg-slate-900/55 rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Guadeloupe, Antilles</span>
              <h3 className="text-4xl font-extrabold text-white tracking-tight">
                {weather.temperature}
              </h3>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 pt-1">
                <Sun className="w-4.5 h-4.5 text-amber-500" />
                {weather.forecast}
              </p>
            </div>

            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center gap-3 border border-emerald-500/15">
              <CloudRain className="w-10 h-10 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">État du Ciel</span>
                <span className="text-xs font-bold text-slate-300 block">Saison humide active</span>
              </div>
            </div>
          </div>

          {/* Core factors row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
            <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-sky-400" /> Humidité
              </span>
              <span className="text-base font-bold text-white block mt-1">{weather.humidity}</span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> Alizés
              </span>
              <span className="text-base font-bold text-white block mt-1">{weather.windSpeed}</span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Indice UV
              </span>
              <span className="text-base font-bold text-white block mt-1">{weather.uvIndex}</span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> État Mer
              </span>
              <span className="text-base font-extrabold text-white block mt-1 line-clamp-1">{weather.seaConditions}</span>
            </div>
          </div>
        </div>

        {/* 2. Official Vigilance Météo France Guadeloupe Banner */}
        <div className={`rounded-3xl border p-6 ${colors.bg} transition shadow-sm space-y-4`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5.5 h-5.5 ${colors.text}`} />
              <h4 className="font-extrabold text-base tracking-tight uppercase text-white">
                Vigilance Météo France
              </h4>
            </div>
            
            <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${colors.badge}`}>
              Vigilance {weather.vigilanceLevel}
            </span>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white text-sm">
              Type d&apos;alerte : <span className="underline decoration-wavy decoration-emerald-500">{weather.vigilanceType}</span>
            </h5>
            <p className="text-sm leading-relaxed text-slate-300">
              {weather.vigilanceDescription}
            </p>
          </div>

          {/* Guidelines info */}
          <div className="pt-3.5 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <span className="font-black mt-0.5 text-white">⚠️ Conseils :</span>
            <p className="leading-relaxed">
              {weather.vigilanceLevel === "Jaune" && "Soyez attentif si vous pratiquez des activités sensibles au risque météorologique."}
              {weather.vigilanceLevel === "Orange" && "Soyez très vigilant. Tenez-vous informé régulièrement de l'évolution météorologique."}
              {weather.vigilanceLevel === "Rouge" && "Vigilance absolue. Fermeture territoriale possible, conformez-vous aux consignes officielles."}
              {weather.vigilanceLevel === "Vert" && "Pas de vigilance particulière sur l'archipel."}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Secondary Columns: Water outages & Sargassum level */}
      <div className="col-span-1 space-y-6">
        {/* Tours d'eau (Guadeloupe water restrictions/cuts) */}
        <div className="bg-slate-900/55 rounded-3xl p-6 border border-slate-805 border-slate-800 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-450 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-55 border-emerald-500/15">
              Distribution Eau Potable
            </span>
            <h4 className="text-lg font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
              Tours d&apos;eau SMGEAG
            </h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Secteurs impactés par des coupures de distribution pour travaux ou régulations de réservoirs.
          </p>

          <div className="space-y-3 pt-2">
            {weather.waterOutages.length === 0 ? (
              <div className="p-3.5 bg-slate-950/40 rounded-2xl text-center text-xs text-slate-500 font-medium border border-slate-850">
                🟢 Aucune coupure programmée signalée.
              </div>
            ) : (
              weather.waterOutages.map((outage, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 text-amber-450 text-amber-400 rounded-lg mt-0.5 shrink-0 border border-amber-500/15">
                    <Ban className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-300 leading-relaxed">
                    {outage}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sargassum status info card */}
        <div className="bg-slate-900/55 rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white uppercase tracking-wide">
              Échouements Sargasses
            </h4>
            <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg ${
              weather.sargassumAlert === 'Elevé'
                ? 'bg-rose-500/10 text-rose-450 border border-rose-500/15'
                : weather.sargassumAlert === 'Moyen'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
            }`}>
              Risque {weather.sargassumAlert}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {weather.sargassumDescription}
          </p>
          
          <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-800/80 pt-3 italic font-mono">
            Les communes de Sainte-Anne, Saint-François, Capesterre et Trois-Rivières sont suivies quotidiennement par capteurs satellites.
          </div>
        </div>
      </div>

    </div>
  );
}
