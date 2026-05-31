import React, { useState } from "react";
import { LocalVideo } from "../types";
import { Play, Calendar, User, Heart, Send, Info, Layers, Eye } from "lucide-react";

interface VideosSectionProps {
  videos: LocalVideo[];
}

export default function VideosSection({ videos }: VideosSectionProps) {
  const [platformFilter, setPlatformFilter] = useState<'All' | 'YouTube' | 'TikTok'>('All');
  const [playingVideo, setPlayingVideo] = useState<LocalVideo | null>(null);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});

  const filteredVideos = videos.filter((vid) => {
    return platformFilter === 'All' || vid.platform === platformFilter;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedStatus[id];
    setLikedStatus(prev => ({ ...prev, [id]: !isLiked }));
    setLikesCount(prev => {
      const current = prev[id] || 0;
      return { ...prev, [id]: isLiked ? current - 1 : current + 1 };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Platform Tabs Header */}
      <div className="bg-slate-900/55 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            Créateurs de Guadeloupe ({filteredVideos.length} vidéos)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Le meilleur du contenu local : humour, vlogs, folklore, musiques et gastronomie.</p>
        </div>

        <div className="bg-slate-950 p-1 rounded-xl flex gap-1 self-start sm:self-auto border border-slate-800">
          {['All', 'YouTube', 'TikTok'].map((platform) => (
            <button
              key={platform}
              id={`videos-platform-${platform.toLowerCase()}`}
              onClick={() => setPlatformFilter(platform as any)}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition cursor-pointer ${
                platformFilter === platform
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {platform === 'All' ? 'Tous' : platform}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const personalLikes = likesCount[video.id] || 0;
          const isLiked = likedStatus[video.id];
          
          return (
            <article
              key={video.id}
              onClick={() => setPlayingVideo(video)}
              className="bg-slate-900/55 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/25 transition duration-200 cursor-pointer flex flex-col group h-full"
            >
              {/* Thumbnail with overlay durations */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                {/* Visual Glass overlays */}
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition flex items-center justify-center">
                  <div className="p-3 bg-slate-900/40 backdrop-blur-md text-white rounded-full scale-90 group-hover:scale-100 transition duration-200 border border-white/20 shadow-md">
                    <Play className="w-6 h-6 fill-white text-white translate-x-0.5" id={`play-icon-${video.id}`} />
                  </div>
                </div>

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                  {video.duration}
                </span>

                {/* Network label */}
                <span className={`absolute top-2 left-2 px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                  video.platform === 'YouTube' ? 'bg-red-650 bg-red-600 text-white' : 'bg-black text-white border border-slate-800'
                }`}>
                  {video.platform}
                </span>
              </div>

              {/* Description Body information */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 font-mono">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {video.creator}
                  </span>
                  <h5 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-400 transition">
                    {video.title}
                  </h5>
                  <p className="text-xs text-slate-450 text-slate-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-550 text-slate-500 font-semibold font-mono font-sans">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {video.views}
                  </span>
                  
                  <button
                    id={`video-like-btn-${video.id}`}
                    onClick={(e) => handleLike(video.id, e)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition cursor-pointer ${
                      isLiked ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 font-bold' : 'hover:bg-slate-850 text-slate-450 text-slate-400'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-400' : ''}`} />
                    {isLiked ? "Aimé" : "Aimer"} ({personalLikes > 0 ? (120 + personalLikes) : "120"})
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Simulated High-Fidelity Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col max-h-[90vh]">
            {/* Header info */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded ${
                  playingVideo.platform === 'YouTube' ? 'bg-red-650 bg-red-600 text-white' : 'bg-white text-slate-950'
                }`}>
                  {playingVideo.platform} Player en direct
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Chaîne : <strong className="text-white">{playingVideo.creator}</strong>
                </span>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full p-1.5 transition text-xs font-semibold w-7 h-7 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Canvas screen simulation */}
            <div className="relative aspect-video bg-black flex items-center justify-center select-none overflow-hidden group">
              <img
                src={playingVideo.thumbnail}
                alt={playingVideo.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-xs opacity-60"
              />
              
              {/* Media play animation or beautiful animated card */}
              <div className="relative z-10 flex flex-col items-center gap-3 text-center p-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center animate-pulse shadow-lg">
                  <Play className="w-8 h-8 fill-emerald-400 text-emerald-400 translate-x-0.5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-emerald-400 uppercase tracking-widest">Aperçu en cours...</div>
                  <div className="text-xs text-slate-300 max-w-md line-clamp-1">{playingVideo.title}</div>
                </div>
              </div>

              {/* Progress bar controller simulation */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 to-transparent flex flex-col gap-2">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>03:14 / {playingVideo.duration}</span>
                  <span>HD 1080p • GwadaNet</span>
                </div>
              </div>
            </div>

            {/* Additional info pane */}
            <div className="p-4 sm:p-6 bg-slate-950/20 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold leading-snug">
                  {playingVideo.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed leading-normal">
                  {playingVideo.description}
                </p>
              </div>

              {/* Info grid factors */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 bg-slate-950/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-extrabold">Créateur</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{playingVideo.creator}</span>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block tracking-wider font-extrabold">Statistiques d&apos;écoute</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{playingVideo.views}</span>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-center">
              <a
                href={playingVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 font-extrabold text-xs text-white rounded-xl hover:bg-emerald-500 transition duration-150 flex items-center justify-center gap-1.5"
                title="Regarder sur la plateforme d'origine"
              >
                Regarder sur {playingVideo.platform} ↗
              </a>
              <button
                onClick={() => setPlayingVideo(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black uppercase text-slate-405 text-slate-400 hover:text-white transition cursor-pointer"
              >
                Fermer l&apos;aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
