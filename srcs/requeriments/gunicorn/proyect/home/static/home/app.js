import { Header } from "./component/header.js" 
import { locationHandler } from "./component/router.js"

export async function App() {

	console.log("new page");
	const root = document.getElementById("root");
	root.appendChild(Header());
	await userLogged();
	locationHandler();
	testWS();
}

async function testWS() {
	const mySocket = new WebSocket('ws://' + window.location.host + '/ws');
	console.log("got socket");
}

async function userLogged() {
	const resp = await fetch('/userManagement/login', {
		method: 'GET',
		credentials: 'same-origin'
	});
	if (resp.ok) {
		setUser();
	}
}
