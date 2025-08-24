'use client';

import { useEffect } from 'react';

const NewsPreloader = () => {
  useEffect(() => {
    const preloadNews = async () => {
      const savedLanguage = localStorage.getItem('language') || 'en';
      const topics = [
        'tech',
        'finance',
        'entertainment',
        'sports',
        'health',
        'games',
      ];

      console.log(
        `[NewsPreloader] Starting preload for ${topics.length} topics in ${savedLanguage}`,
      );

      // Stagger requests to avoid overwhelming the server
      topics.forEach((topic, index) => {
        setTimeout(() => {
          console.log(`[NewsPreloader] Loading ${topic}`);
          fetch(`/api/discover?topic=${topic}&language=${savedLanguage}`)
            .then(() => console.log(`[NewsPreloader] ✓ ${topic} cached`))
            .catch((err) =>
              console.log(`[NewsPreloader] ✗ ${topic} failed:`, err),
            );
        }, index * 200); // 200ms between each request
      });
    };

    // Start preloading after app is ready
    const timer = setTimeout(preloadNews, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component renders nothing
};

export default NewsPreloader;
