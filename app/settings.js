// Initialize PWA functionality
var SETTINGS = {
	init: function () {
		// Font
		const fonts = APP.font.fonts;
		fonts.forEach((font) => {
			const option = document.createElement('option');
			option.value = font.name;
			option.textContent = font.name;
			if (font.name === APP.settings.font) option.selected = true;
			document.getElementById('settings-font').appendChild(option);
		});

		document.getElementById('settings-font').addEventListener('change', (e) => {
			APP.font.apply(e.target.value);
		});

		// Theme
		const themes = APP.theme.themes;
		themes.forEach((theme) => {
			const option = document.createElement('option');
			option.value = theme.name;
			option.textContent = theme.name;
			if (theme.name === APP.settings.theme) option.selected = true;
			document.getElementById('settings-theme').appendChild(option);
		});
		document.getElementById('settings-theme').addEventListener('change', (e) => {
			APP.theme.apply(e.target.value);
		});

		// Reset App
		document.getElementById('reset-app').addEventListener('click', () => {
			if (confirm('Are you sure you want to reset the app?')) {
				APP.reset();
			}
		});

		// Install
		if (APP.data.allowInstall) {
			document.getElementById('app-install-container').classList.remove('app-hidden');
			if (!APP.settings.installed) {
				const installBtn = document.getElementById('app-install-button');
				installBtn.classList.remove('app-hidden');
				installBtn.addEventListener('click', () => {
					APP.pwa.prompt.prompt();
					APP.pwa.prompt.userChoice.then((choice) => {
						APP.pwa.prompt = null;
					});
				});
			} else {
				document.getElementById('app-install-info').classList.remove('app-hidden');
			}
		}

		// Copyright
		if (!isEmpty(APP.data.copyright)) {
			const copyright = document.getElementById('settings-copyright');
			copyright.classList.remove('app-hidden');
			copyright.innerHTML = APP.data.copyright;
		}
	},
};
SETTINGS.init();
