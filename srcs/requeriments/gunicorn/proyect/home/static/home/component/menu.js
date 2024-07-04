export function Menu(){
	const menu = document.createElement("nav");

	//menu.classList.add("menu");
	menu.innerHTML = `
	<a class="px-3 text-white text-decoration-none" href="/">HOME<a>
	<a class="px-3 text-white text-decoration-none"href="/test">TEST<a>
	<a class="px-3 text-white text-decoration-none" href="/pong">PONG<a>
	<a class="px-3 text-white text-decoration-none" href="/about">ABOUT US<a>
	`;
	return menu;
}
