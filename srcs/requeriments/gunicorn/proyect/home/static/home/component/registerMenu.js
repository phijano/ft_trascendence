export function registerMenu(){
	const menu = document.createElement("nav");
	menu.id = "nRegister";
	menu.innerHTML = `
	<a class="px-3  text-decoration-none orbitron-font" href="/signup">Sign up</a>
	<a class="px-3  text-decoration-none orbitron-font" href="/login">Login</a>
	`;
	return menu;
}
