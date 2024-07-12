export function registerMenu(){
	const registerMenu = document.createElement("nav");

	registerMenu.innerHTML = `
	<a class="px-3 text-white text-decoration-none" href="/">Sign up<a>
	<a class="px-3 text-white text-decoration-none"href="/login">Login<a>
	`;
	return registerMenu;
}
