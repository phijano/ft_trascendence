import {App} from "./app.js";
import {router} from "./component/router.js"

document.addEventListener("click", (ev) => {
	const { target } = ev;
	if (!target.matches("nav a")) {
		return;
	}
	//test window browser
	//ev = event || window.event;
	ev.preventDefault();
	console.log("router: " + ev.target.href);
	router(ev.target.href);
});
/*
let user;
let errors;
document.addEventListener('submit', async ev => {
	ev.preventDefault();
	const data = new FormData(ev.target);
	console.log("target " + ev.target.id);
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
		router("/");
	}
	else {
		console.log("error")
		//errors = await resp.json();
		router("/login");
	}
});
*/
document.addEventListener("DOMContentLoaded", App);
