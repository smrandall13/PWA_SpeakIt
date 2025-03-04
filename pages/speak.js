var SPEAK = {
	text: [],
	current: null,
	convert: function () {
		const text = document.getElementById('speak-text').value;
		if (isEmpty(text)) {
			MESSAGE.alert('Alert', 'Please enter text to convert.');
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
	save: function () {
		const voice = document.getElementById('speak-voice').value;
		const rate = document.getElementById('speak-rate').value;
		const pitch = document.getElementById('speak-pitch').value;
		const volume = document.getElementById('speak-volume').value;

		const settings = { voice: voice, rate: rate, pitch: pitch, volume: volume };
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
			if (settings && settings.volume) document.getElementById('speak-volume').value = settings.volume;
		}
		SPEAK.check();
	},
};

async function convertText(postData) {
	try {
		const response = await fetch('https://shaunrandall.com/api/speak.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(postData),
		});

		if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

		const audioBlob = await response.blob();
		const audioUrl = URL.createObjectURL(audioBlob);

		const audioPlayer = document.getElementById('audioPlayer');
		audioPlayer.src = audioUrl;
		audioPlayer.play();
	} catch (error) {
		MESSAGE.alert('Alert', 'Failed to convert text.');
	}
}

SPEAK.init();
APP.execute(() => SPEAK.unload());
