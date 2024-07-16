import routes from "./routes.js"

export function router(href) {
	window.history.pushState({}, "", href);
	locationHandler();
};

export const locationHandler = async() => {
	const location = window.location.pathname;
	if (location.length == 0){
		location = "/";
	}
	console.log("handler: " + location)
	const route = routes.URL[location] || routes.URL["404"];
	console.log(route)
	const html = await fetch(route.template).then((response) => response.text());	
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

	window.onpopstate = locationHandler
};
