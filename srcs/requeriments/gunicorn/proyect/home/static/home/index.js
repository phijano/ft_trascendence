import {App} from "./app.js";
import {router} from "./component/router.js"

const location = window.location.pathname;
if (location.endsWith("/"))
	window.history.pushState("", "", location.substring(0, location.length - 1));

document.addEventListener("click", (ev) => {
	const { target } = ev;
	if (!target.matches("nav a")) {
		return;
	}
	ev.preventDefault();
	router();
});

let user;
let errors;
document.addEventListener('submit', async ev => {
	ev.preventDefault();
	const data = new FormData(ev.target);
	console.log("submit " + ev.submitter.id + " data " + data);
	const resp = await fetch('/test', {
		method: 'POST',
		body: data,
		credentials: 'same-origin'
//		headers: { 'X-CSRFToken':crsf_token },
	})
	if (resp.ok) {
		console.log("ok")
		user = await resp.json();
		window.history.pushState({}, "", "/");
	}
	else {
		console.log("error")
		errors = await resp.json();
	}
});

/*
document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	router();
});
*/

document.addEventListener("DOMContentLoaded", App);
