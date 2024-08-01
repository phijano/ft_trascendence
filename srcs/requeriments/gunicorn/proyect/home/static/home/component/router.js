import routes from "./routes.js"

export function router(href) {
	if (href != window.location.href) {
		window.history.pushState({}, "", href);
	}
	locationHandler();
};

export const locationHandler = async() => {
	let location = window.location.pathname;
	if (location.length != 1 & location.endsWith('/')) {
		location = location.substring(0, location.length - 1);
		window.history.replaceState({}, "", location);
	}
	console.log("handler: " + location)
	const route = routes.URL[location] || routes.URL["404"];
	const origin = window.location.origin;
	const search = window.location.search;
	console.log(route);
	console.log(route.template);
	const html = await fetch(origin + route.template + search).then((response) => response.text());	
	document.getElementById("content").innerHTML = html
/*	
	document.getElementById("content").remove();
	const content = document.createElement("div");
	content.id = "content";
	document.body.appendChild(content);
	const shadow = document.getElementById("content").attachShadow({ mode: "open" });
	let child = document.createElement("div");
	child.innerHTML = html;
	shadow.appendChild(child);
*/	
	document.title = route.title;
/*	document
		.querySelector('meta[name="description"]')
		.setAttribute("content", route.description);
*/

};

function buttonRouter(ref)
{
	router(window.location.origin + ref);
}

window.router = buttonRouter
window.onpopstate = locationHandler



