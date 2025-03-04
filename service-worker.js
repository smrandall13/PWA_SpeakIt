const CACHE_VERSION = new Date().toISOString().split('T')[0]; // Auto-version based on date
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;

const ASSETS_APP = ['/', '/index.html', '/app.js', '/app.css', '/manifest.json', '/app/home.html', '/app/settings.html', '/app/home.js', '/app/settings.js', '/app/home.css', '/app/settings.css', '/icons/favicon.png', '/icons/app-loadimg.png', '/icons/app-icon.png'];
const ASSETS_FONTS = ['/assets/fonts/Playfair.ttf', '/assets/fonts/Nunito.ttf', '/assets/fonts/CourierPrime.ttf', '/assets/fonts/Roboto.ttf'];
const ASSETS_ICONS = [
	'/assets/images/settings-white.png',
	'/assets/images/download-white.png',
	'/assets/images/home-white.png',
	'/assets/images/draggable-white.png',
	'/assets/images/hand-white.png',
	'/assets/images/create-white.png',
	'/assets/images/edit-white.png',
	'/assets/images/delete-white.png',
	'/assets/images/refresh-white.png',
	'/assets/images/recycle-white.png',
	'/assets/images/profile-white.png',
	'/assets/images/split-white.png',
	'/assets/images/store-white.png',
	'/assets/images/web-white.png',
	'/assets/images/info-white.png',
	'/assets/images/search-white.png',
	'/assets/images/lookup-white.png',
];

/** Custom Asset List**/
const ASSETS_CUSTOM = ['/pages/speak.html', '/pages/speak.css', '/pages/speak.js'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			const ASSETS = [...ASSETS_APP, ...ASSETS_ICONS, ...ASSETS_FONTS, ...ASSETS_CUSTOM];
			return cache.addAll(ASSETS);
		})
	);
	self.skipWaiting(); // Forces immediate activation
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
		})
	);
	self.clients.claim(); // Forces all clients to use the new version immediately
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				return caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, response.clone());
					return response;
				});
			})
			.catch(() => caches.match(event.request)) // Serve from cache if offline
	);
});

// Auto-update all open instances of the PWA
self.addEventListener('controllerchange', () => {
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => client.navigate(client.url));
	});
});
