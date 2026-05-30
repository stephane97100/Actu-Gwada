import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import NewsSection from "./components/NewsSection";
import TrafficSection from "./components/TrafficSection";
import WeatherSection from "./components/WeatherSection";
import SocialSection from "./components/SocialSection";
import VideosSection from "./components/VideosSection";
import NotificationCenter from "./components/NotificationCenter";
import { NewsItem, WeatherInfo, TrafficAlert, SocialTrend, LocalVideo, AppNotification, NotificationSettings } from "./types";
import { Newspaper, Navigation, CloudRain, Flame, Youtube, Settings, Bell, Info, LayoutGrid } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'traffic' | 'weather' | 'social' | 'videos'>('dashboard');
  
  // App data states
  const [news, setNews] = useState<NewsItem[]>([]);
  const [traffic, setTraffic] = useState<TrafficAlert[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [socialTrends, setSocialTrends] = useState<SocialTrend[]>([]);
  const [localVideos, setLocalVideos] = useState<LocalVideo[]>([]);
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);
  const [groundedWithGemini, setGroundedWithGemini] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // In-app notifications subsystem states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    circulation: true,
    meteo: true,
    alerte: true,
    actu: true,
    sound: true,
    browserPush: false,
  });

  // Slide-in visual toasts state
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences on start
  useEffect(() => {
    const saved = localStorage.getItem("gwada_actu_notif_config");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
    
    // Core data fetch
    fetchData();
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("gwada_actu_notif_config", JSON.stringify(newSettings));
  };

  // Live query sync route
  const fetchData = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch("/api/guadeloupe-data");
      if (!response.ok) throw new Error("Impossible de joindre le serveur");
      const data = await response.json();
      
      setNews(data.news || []);
      setTraffic(data.traffic || []);
      setWeather(data.weather || null);
      setSocialTrends(data.socialTrends || []);
      setLocalVideos(data.videos || []);
      setRetrievedAt(data.retrievedAt || null);
      setGroundedWithGemini(data.groundedWithGemini || false);
    } catch (err) {
      console.error("Failed to load local live feed data:", err);
      setErrorStatus(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsLoading(false);
    }
  };

  // Play synthetic audio chime for alerts
  const playWebAudioBell = () => {
    if (!settings.sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High elegant sound
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      console.warn("Could not fire standard sound synthesizing:", err);
    }
  };

  // Push Trigger Core handler
  const triggerNotification = (title: string, body: string, category: 'circulation' | 'meteo' | 'alerte' | 'actu', important = false) => {
    // Check if the user turned off notifications for this specific channel
    if (!settings[category]) return;

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      body,
      category,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      important
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Play bell sound
    playWebAudioBell();

    // Trigger visual slide-in toast
    setActiveToast(newNotification);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);

    // Trigger true system hardware browser notification if granted
    if (typeof window !== "undefined" && window.Notification && window.Notification.permission === "granted") {
      try {
        new window.Notification(title, {
          body: body,
          icon: "https://images.unsplash.com/photo-1589392693710-53b34eb066d2?w=100&auto=format&fit=crop"
        });
      } catch (err) {}
    }
  };

  // Simulation generator mappings
  const handleSimulateAlert = (category: 'circulation' | 'meteo' | 'alerte' | 'actu') => {
    const roadNames = ["la RN1 à Colin", "le Pont de l'Alliance", "la RN2 à Bouillante", "le rond-point de la Rizerie (N2)"];
    const waterCities = ["du Gosier", "de Sainte-Rose", "des Abymes", "de Morne-à-l'Eau"];
    const newsTopics = ["Bokits", "Master Gwo Ka", "Mémorial ACTe", "Tour de Guadeloupe"];

    switch (category) {
      case 'circulation':
        triggerNotification(
          "🚨 Alerte Trafic - Route obstruée",
          `Accident signalé sur ${roadNames[Math.floor(Math.random() * roadNames.length)]} entravant fortement la circulation dans les deux sens.`,
          'circulation',
          true
        );
        break;
      case 'meteo':
        triggerNotification(
          "⛈️ Vigilance JAUNE Activée",
          "Météo France place l'archipel en Vigilance Jaune pour fortes averses orageuses et risques d'inondations localisées.",
          'meteo'
        );
        break;
      case 'alerte':
        triggerNotification(
          "💦 Tour d'eau - Coupure en cours",
          `SMGEAG annonce la coupure temporaire d'eau potable dans plusieurs secteurs ${waterCities[Math.floor(Math.random() * waterCities.length)]} pour rééquilibrage de citerne.`,
          'alerte',
          true
        );
        break;
      case 'actu':
        triggerNotification(
          "📰 Flash Info - Évènement Éco",
          `Vifs succès populaires pour la foire bio et le marché agricole créole organisé ce matin, mettant l'accent sur le sargasse composté.`,
          'actu'
        );
        break;
    }
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...notifPropsToValue(n), read: true } : n)
    );
  };

  const notifPropsToValue = (notif: AppNotification) => ({
    ...notif
  });

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-text p-4 sm:p-6">
      
      <div className="max-w-7xl w-full mx-auto flex flex-col flex-1">
        
        {/* 1. Shared App Header */}
        <Header
          onRefresh={fetchData}
          isRefreshing={isLoading}
          retrievedAt={retrievedAt}
          groundedWithGemini={groundedWithGemini}
          notificationCount={notifications.filter(n => !n.read).length}
          onOpenNotifications={() => setNotificationOpen(true)}
        />

        {/* 2. Visual Tab Selection Header */}
        <nav className="bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <div className="flex overflow-x-auto gap-2 custom-scrollbar">
            
            <button
              id="tab-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Bento Grille
            </button>

            <button
              id="tab-btn-news"
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'news'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              Fil Actus
            </button>

            <button
              id="tab-btn-traffic"
              onClick={() => setActiveTab('traffic')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'traffic'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Circulation
            </button>

            <button
              id="tab-btn-weather"
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'weather'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              Météo &amp; Vigilance
            </button>

            <button
              id="tab-btn-social"
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'social'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Flame className="w-4 h-4" />
              Tendances
            </button>

            <button
              id="tab-btn-videos"
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0 ${
                activeTab === 'videos'
                  ? 'bg-emerald-505 bg-emerald-500 text-slate-955 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Youtube className="w-4 h-4" />
              Vidéos Gwada (10)
            </button>
            
          </div>
        </nav>

        {/* 3. Main Central App Body Container */}
        <main className="flex-1 w-full py-2 animate-fade-in">
          
          {/* Connection errors alert banner */}
          {errorStatus && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <span>⚠️ Serveur injoignable : {errorStatus}. Utilisation de flux de simulation.</span>
              </div>
              <button onClick={fetchData} className="px-3 py-1 bg-red-650 hover:bg-red-500 font-bold text-white rounded-lg transition text-xs">
                Réessayer
              </button>
            </div>
          )}

          {/* Loading Spinner Screen override overlay */}
          {isLoading && news.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-slate-250 text-slate-205 tracking-wider">Mise à jour des flux Guadeloupe...</h4>
                <p className="text-xs text-slate-450 text-slate-400">Interrogation des flux RSS et synthèse des tendances via l&apos;IA de Google.</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-12 gap-4 auto-rows-auto">
                  
                  {/* 1. News Feed RSS - 5 columns */}
                  <div 
                    onClick={() => setActiveTab('news')}
                    className="col-span-12 lg:col-span-5 bg-slate-900/60 rounded-3xl border border-slate-800 p-5 flex flex-col hover:border-emerald-500/30 hover:bg-slate-900 transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-emerald-400 group-hover:rotate-6 transition" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Fil d'actualité RSS</h2>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-emerald-400 transition">Voir tout →</span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      {news.slice(0, 4).map((item) => (
                        <div key={item.id} className="p-3 bg-slate-950/40 rounded-2xl border-l-4 border-emerald-500 hover:bg-slate-950/70 transition">
                          <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-mono">
                            <span>{item.source}</span>
                            <span>{item.date}</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold leading-snug text-slate-100 line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                      ))}
                      {news.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500 italic">Aucune actualité en cache</div>
                      )}
                    </div>
                  </div>

                  {/* 2. Weather Widget - 3 columns */}
                  <div 
                    onClick={() => setActiveTab('weather')}
                    className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-5 border border-slate-800/80 flex flex-col justify-between hover:border-sky-500/30 hover:shadow-[0_0_15px_rgba(56,189,248,0.05)] transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Météo</h2>
                        <p className="text-lg font-black text-white">{weather?.forecast ? "Pointe-à-Pitre" : "Archipel"}</p>
                      </div>
                      <span className="text-3xl animate-bounce">☀️</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-4xl font-black text-white tracking-tighter">{weather?.temperature || "31°C"}</div>
                      <p className="text-xs text-indigo-300 font-semibold mt-1">
                        {weather?.forecast || "Ensoleillé • Brise légère"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">
                        Humidité : {weather?.humidity || "78%"} • Alizés : {weather?.windSpeed || "15 km/h"}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/60 mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>Vigilance / {weather?.vigilanceLevel.toUpperCase() || "VERT"}</span>
                      <span className="text-sky-450 text-indigo-400 group-hover:translate-x-1 transition">Détails →</span>
                    </div>
                  </div>

                  {/* 3. Traffic Alerts - 4 columns */}
                  <div 
                    onClick={() => setActiveTab('traffic')}
                    className="col-span-12 md:col-span-6 lg:col-span-4 bg-rose-950/20 rounded-3xl p-5 border border-rose-500/10 flex flex-col justify-between hover:border-red-500/30 hover:bg-rose-950/35 transition cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-red-400">Circulation & Travaux</h2>
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 uppercase font-black tracking-widest">En Direct</span>
                      </div>
                      
                      <div className="space-y-4">
                        {traffic.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex gap-2.5 items-start">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              item.status === 'critical' 
                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]' 
                                : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.7)]'
                            }`} />
                            <div className="text-xs">
                              <span className="font-bold text-slate-200 block sm:inline mr-1">{item.title}</span>
                              <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        ))}
                        {traffic.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-500 italic">Aucun ralentissement majeur signalé</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rose-500/10 mt-4 flex items-center justify-between text-[10px] text-red-400 font-bold uppercase tracking-widest">
                      <span>{traffic.length} Incidents de Traffic</span>
                      <span className="group-hover:translate-x-1 transition font-bold text-red-400">Visualiser →</span>
                    </div>
                  </div>

                  {/* 4. Social Trends - 7 columns */}
                  <div 
                    onClick={() => setActiveTab('social')}
                    className="col-span-12 lg:col-span-7 bg-slate-900/60 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/30 hover:bg-slate-900 transition cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Tendances Réseaux Sociaux Local</h2>
                        <span className="text-[10px] text-slate-500 font-mono">Synthèse Guadeloupe</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        {socialTrends.map((trend) => (
                          <span 
                            key={trend.id} 
                            className="px-3 py-1 bg-slate-950/40 rounded-full text-[11px] text-slate-350 hover:text-indigo-400 border border-slate-800 hover:border-slate-750 transition"
                          >
                            {trend.hashtag}
                          </span>
                        ))}
                        {socialTrends.length === 0 && (
                          <div className="text-xs text-slate-500 italic">Aucune tendance indexée</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-800/50 pt-3.5 flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono italic">
                        <span>🔥 Twitter local : @InfoRoute971</span>
                        <span>📈 TikTok : +15% mention "Guadeloupe"</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest group-hover:translate-x-1 transition">Débats →</span>
                    </div>
                  </div>

                  {/* 5. Tours d'eau / Coupures - 5 columns */}
                  <div 
                    onClick={() => setActiveTab('weather')}
                    className="col-span-12 lg:col-span-5 bg-slate-900/60 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between hover:border-amber-500/30 hover:bg-slate-900 transition cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">Tours d'eau & Coupures SMGEAG</h2>
                        <span className="text-[9px] bg-amber-500/10 text-amber-450 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-black">État</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                        Secteurs impactés par des coupures de distribution pour travaux ou régulations de réservoirs.
                      </p>
                      
                      <div className="space-y-2">
                        {weather?.waterOutages.slice(0, 2).map((outage, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-bold line-clamp-1">
                            🚰 {outage}
                          </div>
                        ))}
                        {(!weather || weather.waterOutages.length === 0) && (
                          <div className="p-3 text-center text-xs text-slate-500 italic">Aucune coupure programmée aujourd'hui</div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-amber-450 text-amber-400 font-bold uppercase mt-4 block text-right group-hover:translate-x-1 transition">
                      Sargasses & Eau →
                    </span>
                  </div>

                  {/* 6. Creator Content - 12 columns */}
                  <div className="col-span-12 bg-slate-900/40 rounded-3xl p-5 border border-slate-800 flex flex-col hover:border-emerald-500/20 transition">
                    <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">Dernières vidéos des créateurs</h2>
                        <p className="text-[10px] text-slate-500 font-semibold">Tutos, vlogs, humour et folklore de l'archipel</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('videos')}
                        className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:underline cursor-pointer"
                      >
                        Lancer le Player ({localVideos.length} vidéos) →
                      </button>
                    </div>
                    
                    {/* Video strip slider */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {localVideos.slice(0, 5).map((vid) => (
                        <div 
                          key={vid.id}
                          onClick={() => {
                            setActiveTab('videos');
                          }}
                          className="relative aspect-[9/16] bg-slate-855 bg-slate-900 hover:bg-slate-850 rounded-2xl overflow-hidden group border border-slate-800 hover:border-slate-750 transition cursor-pointer"
                        >
                          <img 
                            src={vid.thumbnail} 
                            alt={vid.title}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/25 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 right-3 text-left">
                            <p className="text-[10px] font-bold leading-tight text-white line-clamp-2">{vid.title}</p>
                            <p className="text-[8px] text-slate-400 uppercase tracking-wide font-mono mt-1 font-bold">@{vid.creator}</p>
                          </div>
                          <span className="absolute top-2 right-2 bg-red-650 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                            {vid.platform}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
              {activeTab === 'news' && <NewsSection news={news} />}
              {activeTab === 'traffic' && <TrafficSection alerts={traffic} />}
              {activeTab === 'weather' && weather && <WeatherSection weather={weather} />}
              {activeTab === 'social' && <SocialSection trends={socialTrends} />}
              {activeTab === 'videos' && <VideosSection videos={localVideos} />}
            </div>
          )}
        </main>

      {/* 4. Footer credits and copyright banner */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-semibold space-y-1 mt-auto">
        <div>© {new Date().getFullYear()} GwadaActu Live. Tous droits réservés.</div>
        <div className="font-mono text-[10px] text-slate-600">Guadeloupe, Antilles Françaises • Miroir de Bord Bento Intel • Heure locale : {new Date().toLocaleTimeString()}</div>
      </footer>

      {/* 5. Notifications Drawer Popup view */}
      <NotificationCenter
        notifications={notifications}
        settings={settings}
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onUpdateSettings={saveSettings}
        onClearAll={handleClearAll}
        onMarkRead={handleMarkRead}
        onSimulateAlert={handleSimulateAlert}
      />

      {/* 6. Dynamic Visual Floating Toast notifications bubble (Bottom-Right) */}
      {activeToast && (
        <div
          id="custom-floating-toast"
          onClick={() => {
            setNotificationOpen(true);
            setActiveToast(null);
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 flex gap-3 animate-slide-in cursor-pointer hover:bg-slate-850"
        >
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl max-h-11 flex items-center justify-center">
            <Bell className="w-5.5 h-5.5 text-emerald-400 animate-swing" />
          </div>
          <div className="flex-1 space-y-0.5 text-left pr-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400">
                Alerte Guadeloupe
              </span>
              <span className="text-[9px] font-mono text-slate-500">{activeToast.timestamp}</span>
            </div>
            <h5 className="font-black text-xs sm:text-sm text-slate-100 line-clamp-1">{activeToast.title}</h5>
            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{activeToast.body}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveToast(null);
            }}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs font-bold px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  </div>
);
}
