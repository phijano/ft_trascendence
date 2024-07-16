import { Header } from "./component/header.js" 
import { locationHandler } from "./component/router.js"

export function App() {

	console.log("new page");
	const root = document.getElementById("root");
	root.appendChild(Header());
	locationHandler();
}
