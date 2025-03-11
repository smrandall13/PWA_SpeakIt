const STORAGE = {
	get: function (key) {
		let value = localStorage.getItem(key);
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	},
	set: function (key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	},
	reset: function (key) {
		localStorage.removeItem(key);
	},
};

const LOG = {
	message: function (message) {
		if (!isEmpty(message) && console) console.log(message);
	},
	error: function (message) {
		if (!isEmpty(message) && console) console.error(message);
	},
};

const LOCATE = {
	log: function () {
		// Ensure APP.data has valid location data
		if (!APP.locate.lat || !APP.locate.lng) return;

		// Send log data to the server for writing
		FETCH('', { command: 'locate', request: 'log', lat: APP.locate.lat, lng: APP.locate.lng, acc: APP.locate.acc });
	},
	get: function () {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					APP.locate.lat = position.coords.latitude;
					APP.locate.lng = position.coords.longitude;
					APP.locate.acc = position.coords.accuracy;

					// Log location after getting it
					LOCATE.log();
				},
				(error) => {
					LOG.error(`Location error: ${error}`);
				},
				{
					enableHighAccuracy: true, // Request the most precise location
					timeout: 3000, // Max wait time for a response (10 sec)
					maximumAge: 0, // Avoid cached location
				}
			);
		}
	},
	init: function (type = '') {
		if (!isEmpty(type) && navigator.geolocation) {
			LOCATE.get(); // Get location immediately
			if (type == 'interval') {
				clearInterval(APP.intervals['locate']);
				APP.intervals['locate'] = setInterval(LOCATE.get, 60000); // Update location every interval
			}
		}
	},
};

const NOTIFY = {
	send: function (title = '', message = '') {
		if (Notification.permission === 'granted') {
			new Notification(title, { body: message });
		} else if (Notification.permission !== 'denied') {
			NOTIFY.init(() => {
				NOTIFY.send(title, message);
			});
		}
	},
	init: function (callback) {
		if ('Notification' in window && APP.data.allowNotifications === true) {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					if (isFunction(callback)) callback();
					LOG.message('Notification permission granted.');
				} else {
					LOG.message('Notification permission denied.');
				}
			});
		} else {
			LOG.message('Notifications are not supported in this browser.');
		}
	},
};

const MESSAGE = {
	show: function (title = '', message = '', className = '', callback = null) {
		if (document.getElementById('app-message')) {
			document.getElementById('app-message').remove();
		}

		if (!isEmpty(message)) {
			// Message Back
			const appMessageBack = document.createElement('div');
			appMessageBack.id = 'app-message-back';
			appMessageBack.style.opacity = 0;
			appContent.appendChild(appMessageBack);

			const appMessage = document.createElement('div');
			appMessage.id = 'app-message';
			appMessage.style.opacity = 0;
			if (!isEmpty(className)) {
				appMessage.classList.add(className);
			}

			if (isEmpty(title)) {
				title = '';
			}
			appMessage.innerHTML = `<div id="app-message-title"><div id='app-message-title-text'>${title}</div><div id="app-message-close"></div></div><div id="app-message-content">${message}</div>`;
			appContent.appendChild(appMessage);
			setTimeout(() => {
				appMessageBack.style.opacity = 0.75;
				appMessage.style.opacity = 1;
				isFunction(callback) && callback();
			}, 200);

			document.getElementById('app-message-close').addEventListener('click', () => {
				MESSAGE.hide();
			});
			document.getElementById('app-message-back').addEventListener('click', () => {
				MESSAGE.hide();
			});
		}
	},
	confirm: function (title = '', message = '', confirmFunction = null) {
		if (!isEmpty(message) && !isEmpty(confirmFunction)) {
			message += "<div id='app-message-controls'><button id='app-message-confirm' class='app-button app-button-caution'>Yes</button><button id='app-message-cancel' class='app-button'>No</button></div>";
			MESSAGE.show(title, message, '', () => {
				const confirmButton = document.getElementById('app-message-confirm');
				confirmButton.addEventListener('click', () => {
					MESSAGE.hide();
					confirmFunction();
				});

				const cancelButton = document.getElementById('app-message-cancel');
				cancelButton.addEventListener('click', () => MESSAGE.hide());
			});
		}
	},
	error: function (message) {
		MESSAGE.show('Error', message, 'app-message-caution');
	},
	alert: function (title, message) {
		MESSAGE.show(title, message, 'app-message-caution');
	},
	hide: function () {
		const appMessageBack = document.getElementById('app-message-back');
		const appMessage = document.getElementById('app-message');

		appMessageBack.style.opacity = 0;
		appMessage.style.opacity = 0;
		setTimeout(() => {
			appMessageBack.remove();
			appMessage.remove();
		}, 1000);
	},
};

const POPUP = {
	open: function (title = '', content = '') {
		// Check if Popup already open
		POPUP.close();

		if (!isEmpty(content)) {
			const back = document.createElement('div');
			back.id = 'app-popup-back';
			document.getElementById('app-content').appendChild(back);

			const popup = document.createElement('div');
			popup.id = 'app-popup-container';

			popup.innerHTML =
				`<div class='app-box-title'>${title}<div class='app-popup-close' onclick="POPUP.close()"></div></div>
				</div>` + content;

			document.getElementById('app-content').appendChild(popup);
		}
	},
	close: function () {
		const popup = document.getElementById('app-popup-container');
		if (popup) {
			popup.remove();
			document.getElementById('app-popup-back').remove();
		}
	},
};

// Functions
const isEmpty = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
const isFunction = (variable) => typeof variable === 'function';
const isNumber = (variable) => typeof variable === 'number';
const isString = (variable) => typeof variable === 'string';
const isJSON = (variable) => typeof variable === 'object' && variable !== null;
const isArray = (variable) => Array.isArray(variable);
const is = {
	number: isNumber,
	string: isString,
	json: isJSON,
	array: isArray,
	function: isFunction,
	empty: isEmpty,
};

const addClass = (elementID, className) => document.getElementById(elementID).classList.add(className);
const removeClass = (elementID, className) => document.getElementById(elementID).classList.remove(className);
const rmClass = removeClass;

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getValue = (inputID) => {
	if (!isEmpty(inputID)) {
		const input = document.getElementById(inputID);
		if (input && input.id == inputID && input.value) {
			return input.value;
		} else {
			return '';
		}
	}
	return '';
};

const setValue = (inputID, value) => {
	if (!isEmpty(inputID)) {
		const input = document.getElementById(inputID);
		if (input && input.id == inputID) {
			input.value = value;
		}
	}
};

const formatDateTime = (variable = '', dateFormat = '', timeFormat = '') => {
	const dateString = formatDate(variable, dateFormat);
	const timeString = formatTime(variable, timeFormat);
	return `${dateString} ${timeString}`;
};

const formatDate = (variable = '', format = '') => {
	if (isEmpty(variable)) return '';

	const date = new Date(variable);
	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();

	if (isEmpty(format)) {
		// Long
		return `${monthNames[monthIndex]} ${day}, ${year}`;
	} else {
		return format
			.replace('YYYY', year)
			.replace('MM', monthIndex + 1)
			.replace('DD', day);
	}
};

const formatTime = (variable = '', format = '') => {
	if (!variable) return ''; // Ensures variable is not empty or undefined

	const date = new Date(variable);
	if (isNaN(date.getTime())) return ''; // Handles invalid dates

	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const hours12 = hours % 12 || 12;

	// Ensure format is a string to prevent errors
	format = String(format);

	if (!format) {
		return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
	} else {
		return format
			.replace('HH', (format.includes('AMPM') ? hours12 : hours).toString().padStart(2, '0'))
			.replace('mm', minutes.toString().padStart(2, '0'))
			.replace('ss', seconds.toString().padStart(2, '0'))
			.replace('AMPM', ampm);
	}
};
