var SPEAK = {
	voices: [],
	text: [],
	current: null,

	load: function (speakID) {
		if (isEmpty(speakID)) return;
	},
	init: function () {
		// Gather Saved Data
		const speakID = STORAGE.get('speak-id');
		const speakText = STORAGE.get('speak-text');
		if (!isEmpty(speakID)) SPEAK.current = speakID;
		if (!isEmpty(speakText)) SPEAK.text = speakText;
		SPEAK.load(speakID);
	},
};

SPEAK.init();
APP.execute(() => SPEAK.unload());
