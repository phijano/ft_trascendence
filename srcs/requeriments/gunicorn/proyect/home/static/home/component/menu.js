export function Menu(){
	const menu = document.createElement("nav");

	//menu.classList.add("menu");
	menu.id = "nMenu"
	menu.innerHTML = `
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/">HOME</a>
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/pong">PLAY</a>
	`;
	return menu;
}
