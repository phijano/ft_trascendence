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
	dropGame();
	stop();
	/* console.log("router: " + ev.target.href); */
	router(ev.target.href);
});

document.addEventListener("DOMContentLoaded", App);
