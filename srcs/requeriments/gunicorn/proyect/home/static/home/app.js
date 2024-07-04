//import { Header } from "./component/header.js"
import { Header } from "./component/header.js" 
import { router } from "./component/router.js"


export function App() {
	const root = document.getElementById("root");
	root.appendChild(Header());
//	root.appendChild(Menu());
	router();
}
