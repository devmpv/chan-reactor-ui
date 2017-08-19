import settings from '../static/settings.json';
const SockJS = require('sockjs-client');
const Stomp = require('stompjs');
const stompEndpoint = settings['chan-reactor'].hostUrl + '/chan';

export const register = (registrations) => {
	let socket = SockJS(stompEndpoint);
	let stompClient = Stomp.over(socket);
	stompClient.connect({}, function() {
		registrations.forEach(function (registration) {
			stompClient.subscribe(registration.route, registration.callback, registration.headers);
		});
	});
};
