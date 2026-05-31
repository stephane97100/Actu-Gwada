import React, { useState } from "react";
import { AppNotification, NotificationSettings } from "../types";
import { Bell, ShieldAlert, Timer, Settings, Volume2, CloudRain, Trash2, Zap, HelpCircle, CheckCircle } from "lucide-react";

interface NotificationCenterProps {
  notifications: AppNotification[];
  settings: NotificationSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
  onSimulateAlert: (category: 'circulation' | 'meteo' | 'alerte' | 'actu') => void;
}

export default function NotificationCenter({
  notifications,
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onClearAll,
  onMarkRead,
  onSimulateAlert,
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'preferences'>('list');
  const [permissionState, setPermissionState] = useState<string>(
    typeof window !== 'undefined' ? (window.Notification?.permission || 'default') : 'default'
  );

  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Le navigateur ne supporte pas nativement les notifications.");
      return;
    }
    
    try {
      const permission = await window.Notification.requestPermission();
      setPermissionState(permission);
      if (permission === 'granted') {
        const dummy = new window.Notification("GwadaActu Live", {
          body: "Félicitations ! Les notifications du navigateur sont désormais actives.",
          icon: "https://images.unsplash.com/photo-1589392693710-53b34eb066d2?w=100&auto=format&fit=crop"
        });
      }
    } catch (err) {
      console.error("Error asking for notification permission:", err);
    }
  };

  const handleSettingToggle = (field: keyof NotificationSettings) => {
    onUpdateSettings({
      ...settings,
      [field]: !settings[field]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background Dim Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-100">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-emerald-900 to-teal-950 text-white relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-300 animate-swing" />
              <div>
                <h3 className="text-lg font-bold">Guadeloupe Info-Alertes</h3>
                <p className="text-xs text-emerald-200">Personnalisez vos alertes en continu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-emerald-250 hover:text-white hover:bg-white/10 rounded-lg text-sm transition cursor-pointer"
            >
              Fermer ✕
            </button>
          </div>

          {/* Toggle Tab Navigation header */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 text-center py-3 border-b-2 transition ${
                activeTab === 'list'
                  ? 'border-emerald-600 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Notifications ({notifications.filter(n => !n.read).length})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 text-center py-3 border-b-2 transition ${
                activeTab === 'preferences'
                  ? 'border-emerald-600 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Réglages &gt;
            </button>
          </div>

          {/* Content Pane container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeTab === 'list' ? (
              <div className="space-y-4">
                {/* List Actionbar */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <span>Dernières alertes</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Tout vider
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Aucune alerte reçue</p>
                    <p className="text-xs">Utilisez le panneau de simulation pour tester les push.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => onMarkRead(notif.id)}
                        className={`p-4 rounded-xl border transition cursor-pointer text-left relative ${
                          notif.read
                            ? 'bg-slate-50 border-slate-100 opacity-75'
                            : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 shadow-xs'
                        }`}
                      >
                        {/* Circle unread indicator */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-2 at-2 h-2 rounded-full bg-emerald-500"></span>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                              notif.category === 'circulation'
                                ? 'bg-amber-100 text-amber-800'
                                : notif.category === 'meteo'
                                ? 'bg-blue-100 text-blue-800'
                                : notif.category === 'alerte'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {notif.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm">{notif.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated Notification Generator Panel */}
                <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 mt-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Admin / Test Panel</span>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-emerald-500 animate-pulse" /> Simuler une alerte Push
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Déclenchez de vrais évènements en direct pour observer comment l&apos;application retransmet instantanément les alertes Guadeloupe !
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      id="sim-traffic-btn"
                      onClick={() => onSimulateAlert('circulation')}
                      className="px-2.5 py-2 hover:bg-amber-100 font-bold bg-amber-50 hover:text-amber-800 text-amber-700 text-[11px] rounded-xl border border-amber-200 transition text-left cursor-pointer"
                    >
                      🚗 Trafic RN1
                    </button>
                    <button
                      id="sim-weather-btn"
                      onClick={() => onSimulateAlert('meteo')}
                      className="px-2.5 py-2 hover:bg-blue-100 font-bold bg-blue-50 hover:text-blue-800 text-blue-700 text-[11px] rounded-xl border border-blue-200 transition text-left cursor-pointer"
                    >
                      ⛈️ Météo (Jaune)
                    </button>
                    <button
                      id="sim-water-btn"
                      onClick={() => onSimulateAlert('alerte')}
                      className="px-2.5 py-2 hover:bg-red-100 font-bold bg-red-50 hover:text-red-800 text-red-700 text-[11px] rounded-xl border border-red-200 transition text-left cursor-pointer"
                    >
                      💦 Tour d&apos;eau
                    </button>
                    <button
                      id="sim-news-btn"
                      onClick={() => onSimulateAlert('actu')}
                      className="px-2.5 py-2 hover:bg-emerald-100 font-bold bg-emerald-50 hover:text-emerald-800 text-emerald-700 text-[11px] rounded-xl border border-emerald-200 transition text-left cursor-pointer"
                    >
                      📰 Flash Info
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Native web push notifications */}
                <div className="space-y-3 bg-slate-55 p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Notifications Système</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Notifications Navigator</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        permissionState === 'granted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : permissionState === 'denied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {permissionState === 'granted' ? 'Activé' : permissionState === 'denied' ? 'Bloqué' : 'Inactif'}
                      </span>
                    </div>
                    
                    {permissionState !== 'granted' && (
                      <button
                        onClick={requestBrowserPermission}
                        className="mt-1 w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Autoriser sur d&apos;autres onglets
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Channel preferences */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Canaux d&apos;envoi personnalisés</h4>
                  
                  <div className="space-y-3.5">
                    {/* Traffic Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-800 block">⚠️ Circulation Routière</label>
                        <span className="text-[11px] text-slate-400 block">Accidents majeurs, blocages Jarry, Boucan</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.circulation}
                        onChange={() => handleSettingToggle('circulation')}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Weather Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-800 block">⛈️ Météo &amp; Vigilance</label>
                        <span className="text-[11px] text-slate-400 block">Niveaux de vigilance Météo France, alertes de vent</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.meteo}
                        onChange={() => handleSettingToggle('meteo')}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Water cuts/outages Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-800 block">⚡ Alertes &amp; Eau potable</label>
                        <span className="text-[11px] text-slate-400 block">Coupures EDF, programmes tours d&apos;eau SMGEAG</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alerte}
                        onChange={() => handleSettingToggle('alerte')}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* General News Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-800 block">📰 Actualités de l&apos;Archipel</label>
                        <span className="text-[11px] text-slate-400 block">Flashs infos, articles urgents, nouvelles locales</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.actu}
                        onChange={() => handleSettingToggle('actu')}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>

                    {/* Sound toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-800 block flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-slate-500" /> Sons d&apos;ambiance
                        </label>
                        <span className="text-[11px] text-slate-400 block">Jouer un léger carillon aux push d&apos;alertes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={() => handleSettingToggle('sound')}
                        className="w-4 h-4 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>

                  </div>
                </div>

                {/* Additional helper note */}
                <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center italic">
                  Vos modifications de préférences de notifications personnalisées sont persitées localement dans votre navigateur Internet.
                </div>

              </div>
            )}

          </div>

          {/* Footer close */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white rounded-xl transition cursor-pointer"
            >
              Sauvegarder et Fermer ({activeTab === 'preferences' ? "Filtres" : "Alertes"})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
