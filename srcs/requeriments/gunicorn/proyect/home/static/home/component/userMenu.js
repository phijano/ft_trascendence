export function userMenu(){
	const menu = document.createElement("nav");
	menu.id = "nUser";
	menu.hidden = true;
	menu.innerHTML = `
	<a class="px-3 text-white text-decoration-none" href="/" onclick="logOut()">Log out</a>
	<a class="px-3 text-white text-decoration-none" href="/profile">Profile/Imagen</a>
	`;
	return menu;
}
