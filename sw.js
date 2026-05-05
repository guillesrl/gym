const CACHE_NAME = 'entreno-brutal-v3';
const APP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg',
  './assets/exercise-demo.webp',
  './assets/exercises/Ab_Crunch_Machine-0.jpg',
  './assets/exercises/Ab_Crunch_Machine-1.jpg',
  './assets/exercises/Barbell_Hip_Thrust-0.jpg',
  './assets/exercises/Barbell_Hip_Thrust-1.jpg',
  './assets/exercises/Barbell_Squat-0.jpg',
  './assets/exercises/Barbell_Squat-1.jpg',
  './assets/exercises/Bicycling_Stationary-0.jpg',
  './assets/exercises/Bicycling_Stationary-1.jpg',
  './assets/exercises/Butterfly-0.jpg',
  './assets/exercises/Butterfly-1.jpg',
  './assets/exercises/Cable_Pullover-0.jpg',
  './assets/exercises/Cable_Pullover-1.jpg',
  './assets/exercises/Dumbbell_Step_Ups-0.jpg',
  './assets/exercises/Dumbbell_Step_Ups-1.jpg',
  './assets/exercises/Elliptical_Trainer-0.jpg',
  './assets/exercises/Elliptical_Trainer-1.jpg',
  './assets/exercises/Glute_Kickback-0.jpg',
  './assets/exercises/Glute_Kickback-1.jpg',
  './assets/exercises/Leg_Press-0.jpg',
  './assets/exercises/Leg_Press-1.jpg',
  './assets/exercises/Leverage_Chest_Press-0.jpg',
  './assets/exercises/Leverage_Chest_Press-1.jpg',
  './assets/exercises/Leverage_Shoulder_Press-0.jpg',
  './assets/exercises/Leverage_Shoulder_Press-1.jpg',
  './assets/exercises/Plank-0.jpg',
  './assets/exercises/Plank-1.jpg',
  './assets/exercises/Romanian_Deadlift-0.jpg',
  './assets/exercises/Romanian_Deadlift-1.jpg',
  './assets/exercises/Seated_Cable_Rows-0.jpg',
  './assets/exercises/Seated_Cable_Rows-1.jpg',
  './assets/exercises/Seated_Dumbbell_Curl-0.jpg',
  './assets/exercises/Seated_Dumbbell_Curl-1.jpg',
  './assets/exercises/Seated_Leg_Curl-0.jpg',
  './assets/exercises/Seated_Leg_Curl-1.jpg',
  './assets/exercises/Side_Lateral_Raise-0.jpg',
  './assets/exercises/Side_Lateral_Raise-1.jpg',
  './assets/exercises/Stairmaster-0.jpg',
  './assets/exercises/Stairmaster-1.jpg',
  './assets/exercises/Standing_Biceps_Cable_Curl-0.jpg',
  './assets/exercises/Standing_Biceps_Cable_Curl-1.jpg',
  './assets/exercises/Straight-Arm_Dumbbell_Pullover-0.jpg',
  './assets/exercises/Straight-Arm_Dumbbell_Pullover-1.jpg',
  './assets/exercises/Thigh_Abductor-0.jpg',
  './assets/exercises/Thigh_Abductor-1.jpg',
  './assets/exercises/Triceps_Pushdown-0.jpg',
  './assets/exercises/Triceps_Pushdown-1.jpg',
  './assets/exercises/Walking_Treadmill-0.jpg',
  './assets/exercises/Walking_Treadmill-1.jpg',
  './assets/exercises/Wide-Grip_Lat_Pulldown-0.jpg',
  './assets/exercises/Wide-Grip_Lat_Pulldown-1.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
