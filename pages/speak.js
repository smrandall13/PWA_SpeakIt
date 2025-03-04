var SPEAK = {
	text: [],
	current: null,
	convert: function () {
		const text = document.getElementById('speak-text').value;
		const playerBox = document.getElementById('speak-player-box');
		playerBox.classList.add('app-hidden');

		if (isEmpty(text)) {
			MESSAGE.alert('Alert', 'Please enter text to convert.');
			return false;
		}

		const MAX_LENGTH = 500;
		if (text.length > MAX_LENGTH) {
			MESSAGE.alert('Alert', `Text exceeds ${MAX_LENGTH} characters. Please shorten your input.`);
			return false;
		}

		const voice = document.getElementById('speak-voice').value;
		const rate = document.getElementById('speak-rate').value;
		const pitch = document.getElementById('speak-pitch').value;

		STORAGE.set('speak-text', text);

		convertText({ text: text, voice: voice, rate: rate, pitch: pitch });
	},
	check: function () {
		const text = document.getElementById('speak-text').value;
		const playButton = document.getElementById('speak-play');
		if (isEmpty(text)) {
			playButton.classList.add('app-button-disabled');
		} else {
			playButton.classList.remove('app-button-disabled');
		}
	},
	example: function () {
		const voice = document.getElementById('speak-voice').value;
		const file = 'speak-' + voice + '.mp3';
		const example = document.getElementById('speak-example');
		example.src = 'assets/audio/' + file;
		example.play();
	},
	save: function () {
		const voice = document.getElementById('speak-voice').value;
		const rate = document.getElementById('speak-rate').value;
		const pitch = document.getElementById('speak-pitch').value;
		// const volume = document.getElementById('speak-volume').value;

		const settings = { voice: voice, rate: rate, pitch: pitch }; //, volume: volume
		const speakSettings = JSON.stringify(settings);
		STORAGE.set('speak-settings', speakSettings);
	},
	load: function (speakID) {
		if (isEmpty(speakID)) return;
	},
	init: function () {
		// Gather Saved Data
		const speakID = STORAGE.get('speak-id');
		const speakText = STORAGE.get('speak-text');
		const speakSettings = STORAGE.get('speak-settings');

		if (!isEmpty(speakText)) {
			SPEAK.text = speakText;
			document.getElementById('speak-text').value = speakText;
		}
		if (!isEmpty(speakID)) {
			SPEAK.current = speakID;
			SPEAK.load(speakID);
		}

		if (!isEmpty(speakSettings)) {
			const settings = JSON.parse(speakSettings);
			if (settings && settings.voice) document.getElementById('speak-voice').value = settings.voice;
			if (settings && settings.rate) document.getElementById('speak-rate').value = settings.rate;
			if (settings && settings.pitch) document.getElementById('speak-pitch').value = settings.pitch;
			// if (settings && settings.volume) document.getElementById('speak-volume').value = settings.volume;
		}
		SPEAK.check();
	},
};

const AUDIO = document.getElementById('speak-player');
const PLAY = document.getElementById('speak-play');
const PAUSE = document.getElementById('speak-pause');
var PLAYER = {
	play: function () {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.play();
			PLAY.classList.add('app-hidden');
			PAUSE.classList.remove('app-hidden');
		}
	},
	stop: function () {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.pause();
			AUDIO.currentTime = 0;
			PLAY.classList.remove('app-hidden');
			PAUSE.classList.add('app-hidden');
		}
	},
	pause: function () {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.pause();
			PLAY.classList.remove('app-hidden');
			PAUSE.classList.add('app-hidden');
		}
	},
	replay: function () {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.currentTime = 0;
			AUDIO.play();
		}
	},
	volume: function (value) {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.volume = value;
		}
	},
	seek: function (value) {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.currentTime = value;
		}
	},
	mute: function () {
		if (!isEmpty(AUDIO.src)) {
			AUDIO.muted = !AUDIO.muted;
		}
	},
	update: function () {
		const volume = AUDIO.volume;
		const currentTime = AUDIO.currentTime;
		const duration = AUDIO.duration;
		const paused = AUDIO.paused;
		const muted = AUDIO.muted;
	},
	reset: function () {
		AUDIO.src = '';
	},
	download: function () {
		const audioUrl = AUDIO.src;

		if (!audioUrl) {
			MESSAGE.alert('Error', 'No audio file available to download.');
			return;
		}

		const voice = document.getElementById('speak-voice').value;
		const now = new Date();
		const date = now.getFullYear().toString().slice(-2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');

		const a = document.createElement('a');
		a.href = audioUrl;
		a.download = 'speakit-' + voice + '-' + date + '.mp3';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	},
	init: function () {},
};

async function convertText(postData) {
	try {
		const API_KEY = 'Shaun_Randall';
		const response = await fetch('https://shaunrandall.com/api/speak.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + API_KEY,
			},
			body: JSON.stringify(postData),
		});

		// First, check if the response is OK
		if (!response.ok) {
			// Try to parse the error response as JSON
			let errorMessage = `API Error: ${response.status} ${response.statusText}`;
			try {
				const errorResponse = await response.json(); // Extract error message
				if (errorResponse.error) {
					errorMessage = `Error: ${errorResponse.error}`;
				}
			} catch (jsonError) {
				console.error('Failed to parse error response', jsonError);
			}

			// Display the error message
			MESSAGE.alert('Error', errorMessage);
			throw new Error(errorMessage); // Stop execution
		}

		// Check if response is actually an audio file (not JSON)
		const contentType = response.headers.get('Content-Type');
		if (!contentType || !contentType.includes('audio')) {
			const errorResponse = await response.json();
			MESSAGE.alert('Error', errorResponse.error);
			return;
		}

		// Handle audio response
		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);

		const player = document.getElementById('speak-player');
		player.src = audioUrl;
		player.play();

		const playerBox = document.getElementById('speak-player-box');
		playerBox.classList.remove('app-hidden');
	} catch (error) {
		MESSAGE.alert('Alert', JSON.parse(error.error));
	}
}

SPEAK.init();
APP.execute(() => SPEAK.unload());
