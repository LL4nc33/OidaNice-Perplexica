import { searchSearxng } from '@/lib/searxng';

// Simple in-memory cache with size limit
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 50; // Limit cache size

// Helper function to clean old cache entries
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }

  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp,
    );
    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => cache.delete(key));
  }
};

const websitesForTopic = {
  de: {
    tech: {
      query: ['Technologie Nachrichten', 'KI'],
      links: ['heise.de', 't3n.de'],
    },
    finance: {
      query: ['Wirtschaft Nachrichten', 'Börse'],
      links: ['handelsblatt.com', 'wiwo.de'],
    },
    entertainment: {
      query: ['Unterhaltung', 'Filme'],
      links: ['spiegel.de/kultur', 'stern.de'],
    },
    sports: {
      query: ['Sport Nachrichten', 'Fußball'],
      links: ['kicker.de', 'sport1.de'],
    },
    health: {
      query: ['Gesundheit', 'Medizin'],
      links: ['apotheken-umschau.de', 'netdoktor.de'],
    },
    games: {
      query: ['Gaming News', 'Videospiele'],
      links: ['gamestar.de', 'pcgames.de'],
    },
  },
  en: {
    tech: {
      query: ['technology news', 'latest tech'],
      links: ['techcrunch.com', 'wired.com'],
    },
    finance: {
      query: ['finance news', 'economy'],
      links: ['bloomberg.com', 'cnbc.com'],
    },
    entertainment: {
      query: ['entertainment news', 'movies'],
      links: ['hollywoodreporter.com', 'variety.com'],
    },
    sports: {
      query: ['sports news', 'latest sports'],
      links: ['espn.com', 'bbc.com/sport'],
    },
    health: {
      query: ['health news', 'medical research'],
      links: ['healthline.com', 'medicalnewstoday.com'],
    },
    games: {
      query: ['gaming news', 'video games'],
      links: ['ign.com', 'gamespot.com'],
    },
  },
};

type Language = 'de' | 'en';
type Topic = keyof (typeof websitesForTopic)['de'];

export const GET = async (req: Request) => {
  try {
    const params = new URL(req.url).searchParams;

    const mode: 'normal' | 'preview' =
      (params.get('mode') as 'normal' | 'preview') || 'normal';
    const topic: Topic = (params.get('topic') as Topic) || 'tech';
    const language: Language = (params.get('language') as Language) || 'en';

    // Create cache key
    const cacheKey = `${language}-${topic}-${mode}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return Response.json(
        {
          blogs: cached.data,
        },
        {
          status: 200,
        },
      );
    }

    // Clean cache periodically
    if (Math.random() < 0.1) {
      // 10% chance to clean cache
      cleanCache();
    }

    const selectedTopic = websitesForTopic[language][topic];

    let data = [];

    if (mode === 'normal') {
      const seenUrls = new Set();

      data = (
        await Promise.all(
          selectedTopic.links.flatMap((link) =>
            selectedTopic.query.map(async (query) => {
              return (
                await searchSearxng(`site:${link} ${query}`, {
                  engines: ['bing news'],
                  pageno: 1,
                  language: language,
                })
              ).results;
            }),
          ),
        )
      )
        .flat()
        .filter((item) => {
          const url = item.url?.toLowerCase().trim();
          if (seenUrls.has(url)) return false;
          seenUrls.add(url);
          return true;
        })
        .sort(() => Math.random() - 0.5);
    } else {
      data = (
        await searchSearxng(
          `site:${selectedTopic.links[Math.floor(Math.random() * selectedTopic.links.length)]} ${selectedTopic.query[Math.floor(Math.random() * selectedTopic.query.length)]}`,
          {
            engines: ['bing news'],
            pageno: 1,
            language: language,
          },
        )
      ).results;
    }

    // Store in cache
    cache.set(cacheKey, {
      data: data,
      timestamp: Date.now(),
    });

    return Response.json(
      {
        blogs: data,
      },
      {
        status: 200,
      },
    );
  } catch (err: any) {
    console.error(`An error occurred in discover route:`, err);

    return Response.json(
      {
        message: 'An error has occurred',
        blogs: [],
      },
      {
        status: 500,
      },
    );
  }
};
