export function PlayerMenu(){
	const menu = document.createElement("nav");

	//menu.classList.add("menu");
	menu.id = "nPlayer"
	menu.hidden = true
	menu.innerHTML = `
	<a class="px-3 text-white text-decoration-none" href="/">HOME</a>
	<a class="px-3 text-white text-decoration-none" href="/pongRemote">PONG</a>
	<a class="px-3 text-white text-decoration-none" href="/friends">FRIENDS</a>
	<a class="px-3 text-white text-decoration-none" href="/history">HISTORY</a>
	`;
	return menu;
}
