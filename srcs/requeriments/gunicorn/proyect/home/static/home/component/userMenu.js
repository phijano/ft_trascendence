export function userMenu(){
	const menu = document.createElement("nav");
	menu.id = "nUser";
	menu.hidden = true;
	menu.innerHTML = `
	<a class="px-3 text-decoration-none orbitron-font" href="/" onclick="logOut()">Log out</a>
	<a class="px-3 text-decoration-none orbitron-font" href="/profile">Profile</a>
	`;
	return menu;
}
