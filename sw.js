const CACHE_NAME = 'ijtima3iyat-3ac-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/lessons.html',
  '/methodology.html',
  '/exams.html',
  '/infographics.html',
  '/videos.html',
  '/resources.html',
  '/teacher-space.html',
  '/exam-night.html',
  '/glossary.html',
  '/progress.html',
  '/css/main.css',
  '/js/app.js',
  '/data/lessons.json',
  '/data/quizzes.json',
  '/data/site-config.json',
  '/manifest.webmanifest',
  '/lessons/history/nazisme.html',
  '/lessons/history/ww2.html',
  '/lessons/history/palestine.html',
  '/lessons/history/independence.html',
  '/lessons/history/moroccan-state.html',
  '/lessons/history/resistance.html',
  '/lessons/geography/usa.html',
  '/lessons/geography/japan.html',
  '/lessons/geography/russia.html',
  '/lessons/geography/egypt.html',
  '/lessons/geography/nigeria.html',
  '/lessons/geography/economic-phenomenon.html',
  '/lessons/citizenship/heritage.html',
  '/lessons/citizenship/natural-resources.html',
  '/lessons/citizenship/world-sharing.html',
  '/lessons/citizenship/religions-dialogue.html',
  '/lessons/citizenship/world-peace.html',
  '/lessons/citizenship/media-programs.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
