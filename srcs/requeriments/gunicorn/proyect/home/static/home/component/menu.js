export function Menu(){
	const menu = document.createElement("nav");

	//menu.classList.add("menu");
	menu.id = "nMenu"
	menu.innerHTML = `
	<a class="px-3 text-white text-decoration-none" href="/">HOME</a>
	<a class="px-3 text-white text-decoration-none" href="/pong">PONG</a>
	`;
	return menu;
}
