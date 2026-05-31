import React, { useState } from "react";
import { SocialTrend } from "../types";
import { MessageSquare, Heart, Share2, Award, Flame, Search, ChevronRight, Sparkles, TrendingUp, ThumbsUp, Users, ExternalLink } from "lucide-react";

interface SocialSectionProps {
  trends: SocialTrend[];
}

export default function SocialSection({ trends }: SocialSectionProps) {
  const [platformFilter, setPlatformFilter] = useState<'Tous' | 'Facebook' | 'X' | 'TikTok' | 'Instagram'>('Tous');
  const [selectedTrend, setSelectedTrend] = useState<SocialTrend | null>(null);

  const getPlatformHashtagUrl = (platform: string, hashtag: string) => {
    const rawHashtag = hashtag.replace("#", "");
    switch (platform) {
      case "Facebook":
        return `https://www.facebook.com/hashtag/${rawHashtag}`;
      case "X":
        return `https://x.com/hashtag/${rawHashtag}`;
      case "Instagram":
        return `https://www.instagram.com/explore/tags/${rawHashtag}/`;
      case "TikTok":
        return `https://www.tiktok.com/tag/${rawHashtag}`;
      default:
        return "https://www.google.com";
    }
  };

  const filteredTrends = trends.filter(trend => {
    return platformFilter === 'Tous' || trend.platform === platformFilter;
  });

  const getCommentsForHashtag = (hashtag: string) => {
    switch (hashtag) {
      case "#PrixDesCarburants":
        return [
          { author: "Kev_PointeNoire", comment: "C'est de plus en plus dur d'aller travailler à Jarry avec ces tarifs. Il faut une vraie subvention !", tone: "negat" },
          { author: "GwadaGirl971", comment: "Les prix changent au 1er du mois mais la transparence sur la formule de calcul reste à désirer...", tone: "neutral" },
          { author: "Ecolo_Antilles", comment: "Le moment idéal pour s'organiser en covoiturages et faire baisser nos coûts quotidiens !", tone: "posit" }
        ];
      case "#TourDeGuadeloupe":
        return [
          { author: "VeloGwada_Passion", comment: "Le CSCA et la Jeanne d'Arc sont affûtés ! Ça va être un tour d'anthologie !", tone: "posit" },
          { author: "Yanis_Abymes", comment: "Hâte de voir l'ascension des Mamelles, c'est là que le maillot jaune va se décider !", tone: "posit" },
          { author: "Lulu_Gosier", comment: "La ferveur sur le bord des routes... Rien ne remplace l'ambiance unique du Tour chez nous !", tone: "posit" }
        ];
      case "#TraditionGwoKa":
        return [
          { author: "Sonia_B_M", comment: "Le Gwo Ka est inscrit au patrimoine culturel de l'UNESCO, quel honneur de voir la jeunesse reprendre les chants !", tone: "posit" },
          { author: "Tanbouyé971", comment: "Rien de tel qu'un bon Léwoz traditionnel le vendredi soir pour faire résonner le tambour marqueur.", tone: "posit" }
        ];
      case "#SargassesGwada":
        return [
          { author: "Alain_SteAnne", comment: "Le lagon est impraticable par endroits ce matin. Odeurs d'œuf pourri très fortes. Vigilance !", tone: "negat" },
          { author: "Capesterre_Avenir", comment: "Les barrages flottants déviateurs commencent à faire leurs preuves, mais il faut accélérer la collecte.", tone: "neutral" }
        ];
      case "#BokitDeLAnnee":
        return [
          { author: "Gourmand_971", comment: "Le meilleur c'est le camion d'Ornot ou le Bokit Royal à Baie-Mahault, leur piment est légendaire !", tone: "posit" },
          { author: "Laura_Kera", comment: "L'Agoulou complet reste mon préféré d'enfance, mais un bokit morue chaude... irrésistible.", tone: "posit" }
        ];
      case "#EauPotable971":
        return [
          { author: "Rosalie_Gosier", comment: "Eau coupée depuis hier soir sans explication claire. On en a marre des coupures en cascade.", tone: "negat" },
          { author: "Militant_971", comment: "Il faut une rénovation intégrale des usines majeures de Basse-Terre, pas juste des pansements.", tone: "negat" }
        ];
      default:
        return [
          { author: "Gwada_Watcher", comment: "Discussion intéressante qui anime beaucoup les messageries familiales aujourd'hui !", tone: "posit" },
          { author: "Citoyen971", comment: "Merci pour cette synthèse, cela permet de suivre d'un coup d'œil ce qui fait parler sur les réseaux.", tone: "posit" }
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-slate-900/55 rounded-2xl p-5 border border-slate-800 flex items-start gap-4">
        <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg shrink-0">
          <Flame className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h4 className="font-extrabold text-white text-sm sm:text-base uppercase tracking-wide">
            Tendances de l&apos;Archipel locale ({filteredTrends.length})
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Découvrez quels sujets agitent l&apos;actualité guadeloupéenne sur les plateformes communautaires locales. Cliquez sur une tendance pour explorer les débats et commentaires populaires associés.
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
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
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
            onClick={() => setSelectedTrend(trend)}
            className="bg-slate-900/55 border border-slate-800 p-5 rounded-2xl shadow-xs hover:border-emerald-500/35 hover:bg-slate-900/80 transition flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              {/* Card Title info heading */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-400 font-extrabold text-sm sm:text-base group-hover:text-emerald-350 transition flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  {trend.hashtag}
                </span>

                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                  trend.platform === 'Facebook'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
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
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {trend.summary}
              </p>

              {/* Social network link */}
              <div className="pt-2">
                <a
                  href={getPlatformHashtagUrl(trend.platform, trend.hashtag)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-350 transition-colors uppercase tracking-wider bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-800/50 hover:bg-slate-950/40"
                >
                  Voir sur {trend.platform} <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* Engagement bottom tag */}
            <div className="mt-5 pt-3 border-t border-slate-800/85 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider text-slate-450 hover:text-emerald-400 transition">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Détails du Débat →
              </span>
              <span className="bg-slate-950 px-2.5 py-1 text-emerald-400 rounded-md font-black font-mono border border-slate-800">
                {trend.engagement}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trend deep-dive insight modal */}
      {selectedTrend && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh] text-slate-150">
            {/* Header info */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 text-white relative pr-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded">
                  {selectedTrend.platform}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Analyse de Tendance Réseaux
                </span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-500 animate-pulse" />
                {selectedTrend.hashtag}
              </h2>
              <button
                onClick={() => setSelectedTrend(null)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-705 hover:bg-slate-700 text-white rounded-full p-1.5 transition text-sm font-semibold w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-300">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sujet principal</h4>
                <p className="text-sm font-bold text-white">{selectedTrend.topic}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Synthèse du débat</h4>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300 bg-slate-950/45 p-3 rounded-xl border border-slate-800/60">
                  {selectedTrend.summary}
                </p>
              </div>

              {/* Community opinions stream */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Commentaires Populaires Recensés
                </h4>
                <div className="space-y-2.5">
                  {getCommentsForHashtag(selectedTrend.hashtag).map((comment, index) => (
                    <div key={index} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-slate-300 uppercase">
                        {comment.author.substring(0, 2)}
                      </div>
                      <div className="space-y-1 select-text">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">@{comment.author}</span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            comment.tone === 'negat'
                              ? 'bg-red-500/10 text-red-400'
                              : comment.tone === 'posit'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-750 text-slate-400'
                          }`}>
                            {comment.tone === 'negat' ? 'Critique' : comment.tone === 'posit' ? 'Constructif' : 'Neutre'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-200">"{comment.comment}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-xs text-slate-500 text-center">
              <span className="flex items-center justify-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Activité : {selectedTrend.engagement}
              </span>
              <button
                onClick={() => setSelectedTrend(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-750 transition text-xs font-bold uppercase tracking-wide cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
