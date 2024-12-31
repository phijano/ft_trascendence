export function PlayerMenu(){
	const menu = document.createElement("nav");

	//menu.classList.add("menu");
	menu.id = "nPlayer"
	menu.hidden = true
	menu.innerHTML = `
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/">HOME</a>
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/pong">PLAY</a>
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/friends">FRIENDS</a>
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/history">HISTORY</a>
	<a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/chat">CHAT</a>
	`;
	return menu;
}
