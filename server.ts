import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini API Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY env var found. Running in simulation fallback mode.");
}

// Custom Regex RSS Parser for France 1ere / News
async function fetchAndParseGuadeloupeRss(): Promise<any[]> {
  const rssUrls = [
    "https://la1ere.francetvinfo.fr/guadeloupe/rss",
    "https://rci.fm/guadeloupe/feed"
  ];
  
  const fetchedItems: any[] = [];
  let idCounter = 1;

  for (const url of rssUrls) {
    try {
      console.log(`Fetching RSS from: ${url}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) continue;
      const text = await response.text();
      
      // Robust regex-based XML item extract
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      let count = 0;
      
      while ((match = itemRegex.exec(text)) !== null && count < 6) {
        const itemContent = match[1];
        
        // Match Title (plain or CDATA)
        const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemContent.match(/<title>([\s\S]*?)<\/title>/i);
        // Match Description
        const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemContent.match(/<description>([\s\S]*?)<\/description>/i);
        // Match Link
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/i);
        // Match PubDate
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        
        if (titleMatch) {
          const rawTitle = titleMatch[1].trim();
          const rawDesc = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : "";
          let link = linkMatch ? linkMatch[1].trim() : "https://la1ere.francetvinfo.fr/guadeloupe/";
          link = link.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toLocaleString("fr-FR");
          
          let parsedDate = pubDate;
          try {
            const d = new Date(pubDate);
            if (!isNaN(d.getTime())) {
              parsedDate = d.toLocaleString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });
            }
          } catch (e) {}

          fetchedItems.push({
            id: `rss-${url.includes("rci") ? "rci" : "la1ere"}-${idCounter++}`,
            title: rawTitle,
            summary: rawDesc.length > 160 ? rawDesc.slice(0, 160) + "..." : rawDesc,
            content: rawDesc,
            link: link,
            date: parsedDate,
            source: url.includes("rci") ? "RCI Guadeloupe" : "Guadeloupe 1ère",
            category: "actu"
          });
          count++;
        }
      }
    } catch (err) {
      console.warn(`Could not parse RSS from ${url}:`, err);
    }
  }
  
  return fetchedItems;
}

// Fallback high-fidelity dataset for robust UX
const getFallbackData = () => {
  const nowStr = new Date().toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  
  return {
    traffic: [
      {
        id: "tr-1",
        title: "Ralentissement important - RN1 Jarry",
        road: "RN1 direction Pointe-à-Pitre",
        status: "warning",
        description: "Fortes affluences aux abords du pont de la Gabarre. Bouchon classique de fin de journée s'étendant sur 3 kilomètres.",
        timestamp: "Il y a 10 min",
        source: "Trafic Infolignes"
      },
      {
        id: "tr-2",
        title: "Accident matériel - Route de la Boucan",
        road: "RN1 Sainte-Rose",
        status: "critical",
        description: "Une collision entre deux véhicules légers ralentit fortement la circulation au niveau du rond-point de la Boucan direction Deshaies. Prudence recommandée.",
        timestamp: "Il y a 25 min",
        source: "Gendarmerie de Guadeloupe"
      },
      {
        id: "tr-3",
        title: "Travaux de nuit - Tunnel de l'Alliance",
        road: "RN11 Tunnel de l'Alliance",
        status: "normal",
        description: "Fermeture partielle pour entretien régulier de 21h à 5h du matin. Déviations balisées par l'ancienne route de l'Alliance.",
        timestamp: "Il y a 1 heure",
        source: "Infrastructures Guadeloupe"
      },
      {
        id: "tr-4",
        title: "Chute de branches - Route de la Traversée",
        road: "RD23 Les Mamelles",
        status: "warning",
        description: "Présence de débris végétaux sur la chaussée suite aux fortes pluies récentes. Services territoriaux en cours d'intervention.",
        timestamp: "Il y a 45 min",
        source: "Météo-Route Gwada"
      }
    ],
    weather: {
      temperature: "29°C",
      forecast: "Averses passagères et vent modéré",
      humidity: "82%",
      windSpeed: "22 km/h E-NE",
      uvIndex: "9 (Très Élevé)",
      seaConditions: "Belle à peu agitée, creux de 1m20 en Atlantique",
      vigilanceLevel: "Jaune",
      vigilanceType: "Fortes Pluies et Orages",
      vigilanceDescription: "Un flux d'alizés humides et instables traverse l'arc antillais. Des développements nuageux porteurs d'averses soutenues et parfois orageuses sont attendus sur la Basse-Terre et la Grande-Terre. Cumuls de pluie localement importants.",
      waterOutages: [
        "Sainte-Anne (Chateaubrun, Cavanière) - Tour d'eau régulier en cours (20h-8h)",
        "Saint-François (Haut-du-Bourg) - Rupture de canalisation, retour prévu à la normale vers 22h",
        "Morne-à-l'Eau (Richeval) - Travaux programmés sur le réseau de distribution, indisponibilité de 9h à 17h demain"
      ],
      sargassumAlert: "Moyen",
      sargassumDescription: "Arrivages modérés de radeaux de sargasses prévus sur les côtes de Saint-François, Sainte-Anne et le sud de la Basse-Terre. Les opérations de ramassage municipal sont actives."
    },
    socialTrends: [
      {
        id: "st-1",
        hashtag: "#PrixDesCarburants",
        platform: "Facebook",
        topic: "Ajustement mensuel des tarifs à la pompe",
        summary: "Vives discussions au sein du groupe 'Kilti Gwada' suite à l'annonce de la réévaluation des tarifs de l'essence et du gasoil en Guadeloupe pour le mois à venir.",
        engagement: "1.2k partages • 450 commentaires"
      },
      {
        id: "st-2",
        hashtag: "#TourDeGuadeloupe",
        platform: "Instagram",
        topic: "Préparation des coureurs et ferveur locale",
        summary: "Les stories et posts se multiplient autour des entraînements des équipes cyclistes locales de l'USL, du CSCA et du VCG. Les supporters se mobilisent pour la prochaine grande boucle.",
        engagement: "5.4k mentions J'aime"
      },
      {
        id: "st-3",
        hashtag: "#TraditionGwoKa",
        platform: "TikTok",
        topic: "Léwoz mémorial à Baie-Mahault",
        summary: "Vagues de vidéos montrant les rythmes traditionnels du Gwo Ka joués le week-end dernier sous la direction de maîtres tambours réputés.",
        engagement: "25k vues • 3.2k likes"
      },
      {
        id: "st-4",
        hashtag: "#SargassesGwada",
        platform: "X",
        topic: "Mobilisation citoyenne et impact écotouristique",
        summary: "Les usagers partagent des photos des plages du Gosier, de Sainte-Anne et de Capesterre-Belle-Eau pour alerter sur les nouveaux bancs d'algues brunes arrivant à la côte.",
        engagement: "300 retweets • 800 réactions"
      },
      {
        id: "st-5",
        hashtag: "#BokitDeLAnnee",
        platform: "Facebook",
        topic: "Concours du meilleur bokit de l'archipel",
        summary: "Un sondage communautaire viral compare plus de 15 camions de restauration rapide locale (food trucks). Les avis divergent entre Basse-Terre et Grande-Terre.",
        engagement: "980 commentaires • 3k votes"
      },
      {
        id: "st-6",
        hashtag: "#TransportKarulis",
        platform: "X",
        topic: "Perturbations et retards signalés sur le réseau de bus",
        summary: "Les usagers partagent leurs retours d'expérience sur la régularité des lignes régulières de bus Karulis desservant les Abymes et Point-à-Pitre.",
        engagement: "120 retweets • 450 signalements"
      },
      {
        id: "st-7",
        hashtag: "#MemorialACTe",
        platform: "Instagram",
        topic: "Débats sur les animations culturelles et nocturnes",
        summary: "Discussions actives sur la programmation artistique du MACTe au port de Pointe-à-Pitre et l'ouverture nocturne des zones d'exposition.",
        engagement: "1.5k likes • 88 partages"
      },
      {
        id: "st-8",
        hashtag: "#PecheursGwada",
        platform: "Facebook",
        topic: "Prix équitables des poissons au marché de l'archipel",
        summary: "Mobilisation des marins-pêcheurs de Saint-François et de la Darse pour valoriser la daurade, le vivaneau et le thazard au juste prix.",
        engagement: "820 partages • 340 réactions"
      },
      {
        id: "st-9",
        hashtag: "#BananeCaraibes",
        platform: "X",
        topic: "Pratiques écologiques durables dans les plantations",
        summary: "Reportages partagés sur l'adoption de techniques agroécologiques alternatives et le non-usage absolu d'herbicides par nos producteurs.",
        engagement: "150 retweets • 120 signets"
      },
      {
        id: "st-10",
        hashtag: "#PlagesPropres",
        platform: "Instagram",
        topic: "Collecte citoyenne bénévole de déchets",
        summary: "Succès de la mobilisation citoyenne de nettoyage de la plage de la Caravelle et de l'Anse du Souffleur de Port-Louis le week-end dernier.",
        engagement: "3.2k likes • 140 partages"
      },
      {
        id: "st-11",
        hashtag: "#MarieGalanteLiaisons",
        platform: "Facebook",
        topic: "Tarification et fréquence des navettes maritimes",
        summary: "Débats sur la continuité territoriale renforcée et le coût des allers-retours quotidiens pour les résidents de la 'Grande Galette'.",
        engagement: "1.1k partages • 620 commentaires"
      },
      {
        id: "st-12",
        hashtag: "#ZoukRetroRetro",
        platform: "TikTok",
        topic: "Tendance danse retro antillaise",
        summary: "Reprise virale de chorégraphies et de classiques du zouk nostalgique des décennies 1980 et 1990 par la jeune génération guadeloupéenne.",
        engagement: "45k vues • 4.8k likes"
      },
      {
        id: "st-13",
        hashtag: "#CircuitCourt971",
        platform: "X",
        topic: "Vente directe de légumes pays sans intermédiaire",
        summary: "Succès d'audience pour les réseaux d'agriculteurs vendant paniers de patate douce, igname, manioc et madère à Baie-Mahault.",
        engagement: "210 retweets • 310 favoris"
      },
      {
        id: "st-14",
        hashtag: "#EauPotable971",
        platform: "Facebook",
        topic: "Revendication d'accréditations d'usines",
        summary: "Une pétition rassemble des signatures demandant des investissements prioritaires d'assainissement et la fin définitive des tours d'eau régulés.",
        engagement: "4.5k partages • 1.1k commentaires"
      },
      {
        id: "st-15",
        hashtag: "#SaisonCroisiere",
        platform: "Instagram",
        topic: "Retombées positives de l'artisanat dans les rues",
        summary: "Les artisans et commerçants partagent des photos colorées des marchés d'épices et de souvenirs guadeloupéens pris d'assaut par les excursionnistes.",
        engagement: "2.1k likes • 90 partages"
      },
      {
        id: "st-16",
        hashtag: "#CarnavalGwada",
        platform: "TikTok",
        topic: "Ateliers rythmiques des groupes à caisse",
        summary: "Les répétitions des célèbres groupes 'Apo' de Pointe-à-Pitre (Vim, Mas Ka Klé) cartonnent avec des extraits vidéo immersifs de percussions.",
        engagement: "62k vues • 7.5k likes"
      },
      {
        id: "st-17",
        hashtag: "#ManguierEnFleurs",
        platform: "Instagram",
        topic: "Photos des plus beaux paniers de mangues greffées",
        summary: "La récolte bat son plein : partage d'images de mangues Julie et de mangues Bassignac savourées fraîches dans les jardins créoles.",
        engagement: "4.3k likes • 210 partages"
      },
      {
        id: "st-18",
        hashtag: "#RandoSoufriere",
        platform: "X",
        topic: "Conseils de prudence pour l'ascension du volcan",
        summary: "Les randonneurs rappellent de vérifier la météo avant de partir des Bains Jaunes en raison d'émanations de gaz et de bourrasques violentes.",
        engagement: "190 retweets • 110 partages"
      },
      {
        id: "st-19",
        hashtag: "#BokitsVsAgoulou",
        platform: "TikTok",
        topic: "Duel gastronomique éternel en vidéo",
        summary: "Des créateurs analysent avec humour les différences de cuisson et d'ingrédients entre les bokits frits et les agoulous grillés.",
        engagement: "38k vues • 2.9k likes"
      },
      {
        id: "st-20",
        hashtag: "#LangueCreoleProjet",
        platform: "Facebook",
        topic: "Généralisation des dictées en langue créole",
        summary: "Vif soutien populaire aux initiatives des académies encourageant l'excellence orthographique et littéraire en langue créole.",
        engagement: "1.4k partages • 500 opinions"
      }
    ],
    videos: [
      {
        id: "vid-1",
        title: "🌴 MA TRAVERSÉE DE LA GUADELOUPE : Les plus belles cascades (Saut de la Lézarde, Carbet)",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=R9Z8YpZpB8E",
        creator: "Aventuriers Gwada",
        thumbnail: "https://images.unsplash.com/photo-1589392693710-53b34eb066d2?w=600&auto=format&fit=crop&q=80",
        duration: "14:22",
        date: "Il y a 2 jours",
        views: "12k vues",
        likes: "1.1k likes",
        description: "Une exploration complète du parc national de la Guadeloupe avec un focus sur les accès sécurisés aux cascades de la Basse-Terre."
      },
      {
        id: "vid-2",
        title: "POV: Quand tu invites un métropolitain à manger un Bokit pimenté pour la première fois 😂",
        platform: "TikTok",
        videoUrl: "https://www.tiktok.com/tag/bokit",
        creator: "Matthieu_971",
        thumbnail: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80",
        duration: "0:58",
        date: "Il y a 1 jour",
        views: "145k vues",
        likes: "18k likes",
        description: "Humour guadeloupéen sur l'incontournable sandwich local Bokit, la sauce chien et la tolérance légendaire au piment local."
      },
      {
        id: "vid-3",
        title: "LES 5 PLAGES CACHÉES DE GRANDE-TERRE (Que personne ne connaît !) 🤫",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=68S693Yy9_g",
        creator: "Evasions Caraïbes",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
        duration: "10:05",
        date: "Il y a 4 jours",
        views: "8.3k vues",
        likes: "920 likes",
        description: "Guide éco-responsable des lagons secrets et anses sauvages du Moule, d'Anse-Bertrand et de Port-Louis."
      },
      {
        id: "vid-4",
        title: "Recette Bokit Maison Facile : Pâte parfaite et garniture poulet boucané ! 🍗🥖",
        platform: "TikTok",
        videoUrl: "https://www.tiktok.com/tag/recettebokit",
        creator: "ChefMélina971",
        thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
        duration: "1:30",
        date: "Il y a 3 jours",
        views: "67k vues",
        likes: "5.4k likes",
        description: "Toutes les étapes pour réussir la friture de vos bokits et la marinade créole du poulet au bois d'inde."
      },
      {
        id: "vid-5",
        title: "Zouk Gwada Mix 2026 - Best of Chansons d'Amour Romantiques (Nouveautés)",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=v3dM_1V5jxs",
        creator: "DJ Gwada Vibes",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        duration: "1:02:40",
        date: "Il y a 1 semaine",
        views: "45k vues",
        likes: "3.2k likes",
        description: "Sélection festive et douce pour accompagner vos couchers de soleil aux Saintes ou à Marie-Galante."
      },
      {
        id: "vid-6",
        title: "Mon avis honnête sur l'ascension de la Soufrière de Guadeloupe : rando ou enfer ? 🌋",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=D-w_sP4Yk4w",
        creator: "Rando&Gwada",
        thumbnail: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80",
        duration: "18:15",
        date: "Il y a 5 jours",
        views: "5.1k vues",
        likes: "420 likes",
        description: "Trajet complet depuis les Bains Jaunes, le dénivelé, le vent aux gouffres soufrés et la visibilité au sommet."
      },
      {
        id: "vid-7",
        title: "Vlog une journée de rêve aux Saintes (Terre-de-Haut) : baignade, tourment d'amour !",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=F0f8h9qBf9g",
        creator: "Chloé TravelVlog",
        thumbnail: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80",
        duration: "12:50",
        date: "Il y a 6 jours",
        views: "11k vues",
        likes: "1.1k likes",
        description: "Location de scooter électrique, exploration de l'anse du Pain de Sucre et dégustation de tourments d'amour."
      },
      {
        id: "vid-8",
        title: "Dégustation sorbet coco traditionnel sur la plage de Grande Anse (Deshaies) 🥥🍦",
        platform: "TikTok",
        videoUrl: "https://www.tiktok.com/tag/sorbetcoco",
        creator: "SucreGwada",
        thumbnail: "https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=600&auto=format&fit=crop&q=80",
        duration: "0:45",
        date: "Il y a 1 jour",
        views: "32k vues",
        likes: "2.1k likes",
        description: "Le bruit de la sorbetière en bois, la muscade et le zeste de citron vert râpé. Une pure merveille."
      },
      {
        id: "vid-9",
        title: "Plongée inoubliable dans la réserve Cousteau (Bouillante) : tortues & coraux de feu 🐢🐠",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=U0kAtS_D6mQ",
        creator: "DeepGwada",
        thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80",
        duration: "15:40",
        date: "Il y a 3 jours",
        views: "7.7k vues",
        likes: "680 likes",
        description: "Images sous-marines magnifiques au large des Îlets Pigeon. Rencontre avec trois tortues marines."
      },
      {
        id: "vid-10",
        title: "Un week-end camping sauvage autorisé à Marie-Galante (La perle) ⛺🌊",
        platform: "YouTube",
        videoUrl: "https://www.youtube.com/watch?v=33Kx1q9eRzY",
        creator: "NatureCaraibes",
        thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80",
        duration: "22:10",
        date: "Il y a 1 semaine",
        views: "14k vues",
        likes: "1.4k likes",
        description: "Retours sur la traversée en ferry, montage de la tente et respect absolu de la faune sauvage locale."
      }
    ],
    news: [
      {
        id: "news-1",
        title: "SMGEAG : Des coupures programmées pour travaux d'assainissement",
        summary: "Le Syndicat Mixte de Gestion de l'Eau et de l'Assainissement informe de coupures programmées ce week-end dans plusieurs secteurs.",
        content: "Plusieurs communes devront faire face à des interruptions temporaires de la distribution d'eau potable ce week-end pour finaliser le branchement du nouveau surpresseur de Grande-Terre. Les usagers sont invités à stocker de l'eau en conséquence.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/smgeag",
        date: nowStr,
        source: "SMGEAG Communiqué",
        category: "alerte"
      },
      {
        id: "news-2",
        title: "Ouverture officielle de la saison sportive Ka : les Léwoz reprennent",
        summary: "Les amateurs de musique traditionnelle Gwo Ka se félicitent de la reprise des rassemblements Léwoz officiellement labellisés.",
        content: "Après des mois de transition académique, les maîtres tambours annoncent une programmation festive s'étirant sur tout l'archipel, de Port-Louis aux Vieux-Habitants pour célébrer l'héritage musical local.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/gwo-ka",
        date: nowStr,
        source: "Karukera Kilti",
        category: "actu"
      },
      {
        id: "news-3",
        title: "Tour de Guadeloupe : Le parcours officiel dévoilé par le Comité Cycliste",
        summary: "Les détails de la prochaine édition reine de la petite reine s'annoncent passageons avec des étapes très montagneuses.",
        content: "Le Comité Régional Cycliste de Guadeloupe a officiellement rendu publique la carte des étapes du prochain Tour. Des cols spectaculaires attireront les meilleurs compétiteurs de toute la Caraïbe et d'Europe continentale. Les montées des Mamelles et de l'Estomac à Frédéric promettent d'être décisives.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/tour-cycliste-de-guadeloupe",
        date: nowStr,
        source: "Gwada Sport Express",
        category: "actu"
      },
      {
        id: "news-4",
        title: "Échouement massif de sargasses : Les communes du sud en alerte renforcée",
        summary: "Les arrivages d'algues brunes perturbent à nouveau l'accès aux plages emblématiques et menacent l'économie écotouristique locale.",
        content: "Des nappes de sargasses de taille inédite s'accumulent le long des berges de Capesterre-Belle-Eau et de Gosier. Les collectivités locales se mobilisent d'urgence pour installer de nouveaux barrages maritimes et accélérer le ramassage manuel afin de protéger l'écosystème côtier et préserver les activités touristiques.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/sargasses",
        date: nowStr,
        source: "Éco-Vigilance Caraïbes",
        category: "alerte"
      },
      {
        id: "news-5",
        title: "Agriculture Biologique : Success-story de la banane 'Glow' à Basse-Terre",
        summary: "Des cultivateurs guadeloupéens s'associent pour lancer une filière banane sans traitements synthétiques.",
        content: "Un collectif de jeunes producteurs agricoles locaux a transformé de plus de 40 hectares de bananeraies sur les pentes de Capesterre. En privilégiant les engrais de compost naturel et l'introduction d'oiseaux insectivores, ils ouvrent une nouvelle ère verte pour l'économie agricole locale.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/agriculture",
        date: nowStr,
        source: "Terre de Progrès",
        category: "actu"
      },
      {
        id: "news-6",
        title: "Marie-Galante : Inauguration de la nouvelle gare maritime à Grand-Bourg",
        summary: "Une infrastructure moderne et éco-responsable pour fluidifier le trafic passager quotidien.",
        content: "La nouvelle gare maritime intègre désormais des panneaux de production photovoltaïque autonomes et un système évolué de filtration d'eau. Elle permettra d'accueillir et d'orienter confortablement plus de 1000 voyageurs quotidiens voyageant entre Pointe-à-Pitre et la Grande Galette.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/marie-galante",
        date: nowStr,
        source: "Marie-Galante News",
        category: "actu"
      },
      {
        id: "news-7",
        title: "Plan de soutien historique de l'aquaculture à Saint-François",
        summary: "La Collectivité régionale annonce un déblocage budgétaire majeur pour moderniser les navires.",
        content: "Un plan d'aide d'envergure est lancé pour soutenir nos marins-pêcheurs. Il financera des traceurs GPS dernier cri et l'achat de matériels de sécurité pour la pêche au large, assurant ainsi la valorisation éthique des filières de dorades, thon court et thazard local.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/peche",
        date: nowStr,
        source: "La Darse Économie",
        category: "actu"
      },
      {
        id: "news-8",
        title: "Transition énergétique : La Guadeloupe franchit le cap des 35% de renouvelable",
        summary: "La part d'électricité d'origine géothermique et éolienne affiche une dynamique positive remarquable.",
        content: "Grâce à l'expansion des puits d'exploitation géothermique à Bouillante et à la multiplication des fermes de production à Marie-Galante, notre archipel réduit progressivement sa dépendance aux énergies fossiles d'importation lourde.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/economie",
        date: nowStr,
        source: "Karukera Demain",
        category: "actu"
      },
      {
        id: "news-9",
        title: "Restauration corallienne d'envergure dans la réserve Cousteau",
        summary: "Une équipe de biologists marins implante des nurseries artificielles de corail corne de cerf.",
        content: "La réserve Cousteau à Bouillante bénéficie d'une attention environnementale maximale. Des fragments de coraux cultivés en laboratoire sont actuellement transplantés pour repeupler les récifs endommagés par le réchauffement des eaux caraïbes.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/biodiversite",
        date: nowStr,
        source: "Nature & Progrès Antilles",
        category: "actu"
      },
      {
        id: "news-10",
        title: "Mémorial ACTe : Vernissage d'une œuvre majeure sur la route de l'esclavage",
        summary: "La nouvelle collection éthique attire des historiens de renommée mondiale au MACTe.",
        content: "Une exposition commémorative réunissant plus de 30 sculptures contemporaines d'artistes caribéens majeurs s'est ouverte au port autonome de Pointe-à-Pitre. Un voyage visuel saisissant qui met en lumière la richesse partagée de notre mémoire historique.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/culture/memorial-acte",
        date: nowStr,
        source: "Mémorial Culture",
        category: "actu"
      },
      {
        id: "news-11",
        title: "Karulis lance ses tout premiers autobus de transport électriques",
        summary: "Dix bus électriques zéro émission entrent en service pour desservir la boucle des Abymes.",
        content: "Dans le but de purifier l'air urbain et de diminuer les nuisances sonores, le réseau Karulis déploie des véhicules de nouvelle génération équipés de rampes d'accès tactiles et de chargeurs USB publics.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/transports",
        date: nowStr,
        source: "Transport Info 971",
        category: "actu"
      },
      {
        id: "news-12",
        title: "Saison cyclonique : La Préfecture teste les sirènes d'alerte municipales",
        summary: "Un exercice général simulé grandeur nature mobilise les secours régionaux et les émetteurs.",
        content: "Dans le cadre de la préparation annuelle des risques côtiers, la sécurité civile invite chaque foyer à vérifier ses réserves d'eau et d'aliments non-périssables. Les protocoles de mise à l'abri ont été éprouvés en collaboration étroite avec les maires de l'archipel.",
        link: "https://www.guadeloupe.gouv.fr",
        date: nowStr,
        source: "Préfecture Guadeloupe",
        category: "alerte"
      },
      {
        id: "news-13",
        title: "Innovation : Des emballages bio fabriqués à partir de fécule de manioc",
        summary: "Une jeune start-up installée dans la zone de Jarry invente une alternative saine au plastique.",
        content: "Pensés et développés localement, ces sacs biodégradables se décomposent en seulement 90 jours dans de simples composts familiaux. Une innovation saluée par l'association des commerçants de Guadeloupe pour une transition sans déchets.",
        link: "https://rci.fm/guadeloupe/infos/Economie",
        date: nowStr,
        source: "Jarry Tech",
        category: "actu"
      },
      {
        id: "news-14",
        title: "Basse-Terre : Le Fort Delgrès lance des parcours théâtralisés à la bougie",
        summary: "Une célébration historique immersion dédiée au sacrifice héroïque de Louis Delgrès.",
        content: "Les samedis soir, des comédiens costumés font revivre les événements marquants de l'année 1802. Les spectateurs déambulent aux lueurs des candélabres à travers les coursives et les vieux remparts en briques rouges.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/fort-delgres",
        date: nowStr,
        source: "Basse-Terre Magazine",
        category: "actu"
      },
      {
        id: "news-15",
        title: "La foire agricole de Petit-Bourg célèbre le piment végétarien local",
        summary: "Des milliers de curieux découvrent les vertus culinaires du piment réputé pour son parfum sans piquant.",
        content: "La foire annuelle enregistre des chiffres de fréquentation records cette année. Les stands de transformation maraîchère rivalisent d'invention : gelées parfumées, confitures de piment végétarien et sauces au miel pays sont à l'honneur.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/petit-bourg",
        date: nowStr,
        source: "Saveurs d'Archipel",
        category: "actu"
      },
      {
        id: "news-16",
        title: "Préservation environnementale : L'iguane des Petites Antilles protégé",
        summary: "Un plan d'éradication de l'iguane rayé envahisseur protège notre espèce endémique fragile.",
        content: "L'Office National des Forêts s'inquiète de l'hybridation des populations d'iguanes. Des patrouilles d'identification intensives sont déployées sur les sentiers côtiers de la Grande-Terre afin de recenser et préserver spécifiquement notre faune originelle.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/environnement",
        date: nowStr,
        source: "ONF Guadeloupe",
        category: "actu"
      },
      {
        id: "news-17",
        title: "Grand prix littéraire créole à la salle culturelle de La Darse",
        summary: "Remise officielle de prix récompensant des récits courts rédigés entièrement en langue créole ou bilingue.",
        content: "Le jury a couronné de jeunes auteurs célébrant la beauté poétique des expressions orales guadeloupéennes. Un tremplin magnifique pour la diffusion d'œuvres littéraires valorisant nos racines et fables créoles originaires de l'archipel.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/langue-creole",
        date: nowStr,
        source: "L'Écrit Antillais",
        category: "actu"
      },
      {
        id: "news-18",
        title: "Bouchons à répétition : Une étude publique lancée pour réviser l'entrée de Jarry",
        summary: "L'autoroute reliant Baie-Mahault à Pointe-à-Pitre analysée pour optimiser les flux.",
        content: "Des capteurs connectés de trafic seront installés sur les principaux axes aux heures de pointe. Les données récoltées permettront de simuler la mise en place éventuelle de voies réservées au covoiturage et aux navettes de bus expresses.",
        link: "https://rci.fm/guadeloupe/infos/Transports",
        date: nowStr,
        source: "Trafic Infolignes",
        category: "actu"
      },
      {
        id: "news-19",
        title: "Le sentier 'Trans-Guadeloupe' classé parmi les plus beaux treks caribéens",
        summary: "Un itinéraire sauvage de grande randonnée reliant la forêt humide de Basse-Terre d'un bout à l'autre.",
        content: "Idéal pour les amateurs de défis physiques et de paysages somptueux, ce parcours fléché traverse les massifs denses à la rencontre des cascades fraîches et des sources sulfureuses à température idéale pour se ressourcer.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/randonnee",
        date: nowStr,
        source: "Rando Passion Gwada",
        category: "actu"
      },
      {
        id: "news-20",
        title: "Inauguration de 80 logements à haute performance environnementale à Baie-Mahault",
        summary: "Des appartements bioclimatiques avec toitures végétales fraîches livrés aux familles.",
        content: "Conçus pour résister aux cyclones majeurs tout en évitant l'usage intensif de climatisation d'air forcée grâce à une ventilation naturelle croisée efficace, ces éco-logements sociaux font figure de référence pour l'urbanisme local.",
        link: "https://la1ere.francetvinfo.fr/guadeloupe/sujet/construction",
        date: nowStr,
        source: "Logement Territorial",
        category: "actu"
      }
    ]
  };
};

// API Endpoint to fetch latest merged RSS and Gemini-grounded updates
app.get("/api/guadeloupe-data", async (req, res) => {
  try {
    const rssItems = await fetchAndParseGuadeloupeRss();
    const fallback = getFallbackData();

    if (!ai) {
      console.log("No Gemini API key config. Returning merged local fallback records.");
      const finalNews = rssItems.length > 0 ? [...rssItems, ...fallback.news] : fallback.news;
      return res.json({
        ...fallback,
        news: finalNews,
        retrievedAt: new Date().toISOString(),
        groundedWithGemini: false
      });
    }

    console.log("Gemini API is active. Querying search grounding for live Guadeloupe news.");
    const datePrompt = `Nous sommes aujourd'hui le 30 mai 2026.
Recherche des informations d'actualité en Guadeloupe avec l'outil de rechereche Google (Search Grounding). Donne-moi des faits bien réels et très récents :
1. L'état de la circulation (accidents de la route du jour, embouteillages phares RN1 / RN2 / Jarry, travaux routiers récents).
2. La météo en Guadeloupe, températures et les vigilances Météo France en vigueur de cette semaine (Vert, Jaune, Orange ou Rouge).
3. Les coupures d'eau programmées (les tours d'eau), coupures EDF, ou alerte de Sargasses sur les plages de l'archipel.
4. Les tendances de discussions ou débats dominants locaux sur les réseaux sociaux en Guadeloupe (les sujets qui font le buzz). Attention, génère obligatoirement au moins 20 tendances différentes et uniques.
5. Des suggestions réelles de vidéos récentes populaires sur YouTube ou TikTok de créateurs guadeloupéens traitant du thème de la Guadeloupe (vlog de plages, humour, zouk, cuisine, randonnée).

Formate ta réponse comme un objet JSON parfait en français, sans aucun blabla d'introduction ou de balises de code Markdown. Renvoie SEULEMENT l'objet JSON contenant exactement ces clés :
"traffic": un tableau d'alertes trafic avec {id, title, road, status (soit "critical", "warning", ou "normal"), description, timestamp, source}
"weather": un objet {temperature, forecast, humidity, windSpeed, uvIndex, seaConditions, vigilanceLevel (soit "Vert", "Jaune", "Orange", "Rouge", "Violet"), vigilanceType, vigilanceDescription, waterOutages (liste de chaines de caractères de coupures d'eau ou électricité actuelles), sargassumAlert (soit "Faible", "Moyen", ou "Elevé"), sargassumDescription}
"socialTrends": un tableau d'au moins 20 tendances différentes avec {id, hashtag, platform, topic, summary, engagement}
"videos": un tableau de 10 vidéos avec {id, title, platform (soit "YouTube" ou "TikTok"), videoUrl, creator, thumbnail, duration, date, views, description}
"news": un tableau d'au moins 20 articles d'actualité récents en Guadeloupe proches du 30 mai 2026 avec {id, title, summary, content, link, date, source, category: "actu"}

Assure-toi que le JSON renvoyé est valide, bien échappé, structuré de façon stricte, et rédigé dans un excellent français professionnel créole/guadeloupéen.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: datePrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const geminiText = response.text || "";
    console.log("Successfully retrieved response from Gemini.");
    
    let parsedData;
    try {
      // Clean potential JSON markdown blocks if any
      let cleanJson = geminiText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      parsedData = JSON.parse(cleanJson.trim());
    } catch (parseErr) {
      console.error("Failed to parse Gemini output as JSON, using beautiful fallback data:", parseErr);
      console.log("Gemini response was:", geminiText);
      parsedData = fallback;
    }

    // Merge RSS with Gemini News Items to ensure we have real-time RSS as requested
    const rssAndGeminiNews = [...rssItems];
    
    // Add Gemini news items avoiding duplicates
    if (parsedData.news && Array.isArray(parsedData.news)) {
      parsedData.news.forEach((item: any) => {
        const isDuplicate = rssAndGeminiNews.some(r => r.title.toLowerCase() === item.title.toLowerCase());
        if (!isDuplicate) {
          rssAndGeminiNews.push(item);
        }
      });
    }

    // Make sure we have enough videos and items
    const mergedVideos = (parsedData.videos && parsedData.videos.length >= 5) ? parsedData.videos : fallback.videos;
    const mergedTraffic = (parsedData.traffic && parsedData.traffic.length > 0) ? parsedData.traffic : fallback.traffic;
    const mergedWeather = parsedData.weather ? { ...fallback.weather, ...parsedData.weather } : fallback.weather;
    const mergedSocial = (parsedData.socialTrends && parsedData.socialTrends.length > 0) ? parsedData.socialTrends : fallback.socialTrends;

    res.json({
      traffic: mergedTraffic,
      weather: mergedWeather,
      socialTrends: mergedSocial,
      videos: mergedVideos.slice(0, 10), // strict limit of 10 videos requested
      news: rssAndGeminiNews.length > 0 ? rssAndGeminiNews : fallback.news,
      retrievedAt: new Date().toISOString(),
      groundedWithGemini: true
    });

  } catch (err) {
    console.error("Error generating or fetching Guadeloupe Live Info:", err);
    // Severe error fallback
    const fallback = getFallbackData();
    res.json({
      ...fallback,
      retrievedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
      groundedWithGemini: false
    });
  }
});

// Mounting Vite in development or static serving inside production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving configuration built.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GwadaActu Server] Running beautifully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
