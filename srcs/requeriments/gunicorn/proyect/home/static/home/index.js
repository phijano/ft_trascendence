import {App} from "./app.js";
import {router} from "./component/router.js"

const location = window.location.pathname;
if (location.endsWith("/"))
	window.history.pushState("", "", location.substring(0, location.length - 1));

document.addEventListener("click", (e) => {
	const { target } = e;
	if (target.matches("nav a")) {
		e.preventDefault();
		router();
	}
	else {
	
	}
	return;
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
