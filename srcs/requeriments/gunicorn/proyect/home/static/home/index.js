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
	console.log("router: " + ev.target.href);
	router(ev.target.href);
});

/*
window.addEventListener("keypress",function(ev){
	if (event.keyCode == 13) {
		event.preventDefault();
	}
}, false);
*/
document.addEventListener("DOMContentLoaded", App);
