import React, { useState } from "react";
import { SocialTrend } from "../types";
import { MessageSquare, Heart, Share2, Award, Flame, Search } from "lucide-react";

interface SocialSectionProps {
  trends: SocialTrend[];
}

export default function SocialSection({ trends }: SocialSectionProps) {
  const [platformFilter, setPlatformFilter] = useState<'Tous' | 'Facebook' | 'X' | 'TikTok' | 'Instagram'>('Tous');

  const filteredTrends = trends.filter(trend => {
    return platformFilter === 'Tous' || trend.platform === platformFilter;
  });

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-slate-900/55 rounded-2xl p-5 border border-slate-800 flex items-start gap-4">
        <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg shrink-0">
          <Flame className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h4 className="font-extrabold text-white text-sm sm:text-base uppercase tracking-wide">
            Tendances de l&apos;Archipel locale
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Découvrez quels sujets agitent l&apos;actualité guadeloupéenne sur les plateformes communautaires locales. Informations synthétisées à partir de discussions ouvertes et de posts publics.
          </p>
        </div>
      </div>

      {/* Network selector tags */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-4">
        {['Tous', 'Facebook', 'X', 'Instagram', 'TikTok'].map((plat) => (
          <button
            key={plat}
            id={`social-platform-${plat.toLowerCase()}`}
            onClick={() => setPlatformFilter(plat as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
              platformFilter === plat
                ? 'bg-emerald-500 text-slate-950 font-black shadow'
                : 'bg-slate-850 bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Trends cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrends.map((trend) => (
          <div
            key={trend.id}
            className="bg-slate-900/55 border border-slate-800 p-5 rounded-2xl shadow-xs hover:border-emerald-500/25 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Card Title info heading */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-black text-sm sm:text-base">
                  {trend.hashtag}
                </span>

                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                  trend.platform === 'Facebook'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-55 border-blue-500/20'
                    : trend.platform === 'X'
                    ? 'bg-slate-950 text-slate-300 border border-slate-800'
                    : trend.platform === 'Instagram'
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {trend.platform}
                </span>
              </div>

              {/* Topic Subject */}
              <h5 className="font-black text-white text-base leading-snug">
                {trend.topic}
              </h5>

              {/* Summary Description */}
              <p className="text-xs sm:text-sm text-slate-405 text-slate-400 leading-relaxed">
                {trend.summary}
              </p>
            </div>

            {/* Engagement bottom tag */}
            <div className="mt-5 pt-3 border-t border-slate-800/85 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Sujet très actif
              </span>
              <span className="bg-slate-950 px-2.5 py-1 text-emerald-400 rounded-md font-black font-mono border border-slate-800">
                {trend.engagement}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
