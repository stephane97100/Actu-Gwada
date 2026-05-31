import React, { useState, useEffect, useRef } from "react";
import { NewsItem } from "../types";
import { Search, Globe, ChevronRight, Newspaper, Calendar, ArrowUpRight } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("Tous");
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  // Infinite Scroll state
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Extract unique sources for filtering
  const sources = ["Tous", ...Array.from(new Set(news.map((item) => item.source)))];

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesSource = selectedSource === "Tous" || item.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [search, selectedSource]);

  // Handle intersection scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, filteredNews.length));
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [filteredNews.length, visibleCount]);

  const slicedNews = filteredNews.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Filters and Search toolbar */}
      <div className="bg-slate-900/55 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-505 text-slate-400" />
          <input
            type="text"
            id="news-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une actualité locale..."
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition duration-150"
          />
        </div>

        {/* Source Badges Row */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1.5">Source:</span>
          {sources.map((src) => (
            <button
              key={src}
              id={`source-filter-${src.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition duration-150 ${
                selectedSource === src
                  ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/10"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-805 border-slate-800 text-slate-400 font-medium space-y-2">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base text-slate-305 text-slate-300">Aucun article ne correspond à vos critères.</p>
          <p className="text-xs text-slate-500">Essayez de modifier votre recherche ou de vider les filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {slicedNews.map((item) => (
            <article
              key={item.id}
              className="bg-slate-900/55 rounded-2xl border border-slate-800 overflow-hidden shadow-sm hover:border-emerald-500/35 transition duration-200 flex flex-col h-full group"
            >
              {/* Header Info */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-lg">
                    <Globe className="w-3.5 h-3.5" />
                    {item.source}
                  </span>
                  <span className="text-[10px] text-slate-450 text-slate-500 font-bold tracking-wider font-mono uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug hover:text-emerald-450 hover:text-emerald-400 transition cursor-pointer" onClick={() => setActiveArticle(item)}>
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-4 bg-slate-900/35 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveArticle(item)}
                  className="inline-flex items-center gap-1 text-xs font-black uppercase text-emerald-400 hover:text-emerald-300 transition"
                >
                  Lire l&apos;article complet
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-800 text-slate-405 text-slate-500 hover:text-emerald-400 rounded-lg transition"
                  title="Ouvrir le flux source original"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Infinite Scroll target observer */}
      {filteredNews.length > visibleCount && (
        <div ref={loadMoreRef} className="py-10 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono tracking-wider">Chargement d&apos;articles suivants ({visibleCount} / {filteredNews.length})</p>
        </div>
      )}

      {/* Reached end marker */}
      {filteredNews.length > 0 && filteredNews.length <= visibleCount && (
        <p className="text-center text-xs text-slate-500 font-mono py-8 border-t border-slate-900/30">
          ✓ Tous les articles disponibles ont été affichés ({filteredNews.length} actus Guadeloupe)
        </p>
      )}

      {/* Expanded Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh] text-slate-150">
            {/* Header info */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 text-white relative pr-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded">
                  {activeArticle.source}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeArticle.date}
                </span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white leading-snug">
                {activeArticle.title}
              </h2>
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1.5 transition text-sm font-semibold w-8 h-8 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Document Content */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 text-slate-300">
              <p className="text-xs sm:text-sm font-medium text-slate-100 border-l-4 border-emerald-500 pl-4 py-1 italic bg-slate-950/40 rounded-r-lg">
                {activeArticle.summary}
              </p>
              
              <div className="text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line pt-2">
                {activeArticle.content || "Aucun détail supplémentaire d'article n'est rapporté pour le moment."}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-center">
              <a
                href={activeArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 font-extrabold text-xs text-white rounded-xl hover:bg-emerald-500 transition duration-150 flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                Voir l&apos;original ↗
              </a>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black uppercase text-slate-450 hover:text-white transition cursor-pointer"
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
