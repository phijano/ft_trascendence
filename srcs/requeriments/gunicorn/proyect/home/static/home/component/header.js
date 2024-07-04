import {Menu} from "./menu.js"

export function Header(){
	const header = document.createElement("header");
	header.classList.add("header");
	header.classList.add("text-bg-dark");
	header.classList.add("text-center");
	header.classList.add("p-4");
	header.classList.add("mb-3");
	header.appendChild(Menu());
	return header;
}
