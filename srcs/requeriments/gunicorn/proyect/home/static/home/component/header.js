import {Menu} from "./menu.js"
import {PlayerMenu} from "./playerMenu.js"
import {registerMenu} from "./registerMenu.js"
import {userMenu} from "./userMenu.js"

export function Header(){
	const header = document.createElement("header");
	header.classList.add("header");
	header.classList.add("text-bg-dark");
	header.classList.add("text-center");
	header.classList.add("p-4");
	header.classList.add("custom-border-color");
	//header.classList.add("mb-3");
	
	const row = document.createElement("div");
	row.classList.add("row");
	header.appendChild(row);

	const colLeft = document.createElement("div");
	colLeft.classList.add("col-sm");
	row.appendChild(colLeft);

	const colMiddle = document.createElement("div");	
	colMiddle.classList.add("col-sm-auto");
	colMiddle.appendChild(Menu());
	colMiddle.appendChild(PlayerMenu());
	row.appendChild(colMiddle);

	const colRight = document.createElement("div");
	colRight.classList.add("col-sm");
	colRight.classList.add("text-end");
	colRight.appendChild(registerMenu());
	colRight.appendChild(userMenu());
	row.appendChild(colRight);

//	header.appendChild(Menu());
//	header.appendChild(registerMenu());
	
	return header;
}
