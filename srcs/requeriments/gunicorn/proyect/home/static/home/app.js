import { Header } from "./component/header.js" 
import { locationHandler } from "./component/router.js"

export async function App() {

    /* console.log("new page"); */
    const root = document.getElementById("root");
    root.appendChild(Header());
    await userLogged();
    locationHandler();
}

async function userLogged() {

    try {
    	const resp = await fetch('/userManagement/login', {
	    method: 'GET',
	    credentials: 'same-origin'
	});
	if (resp.ok) {
	    setUser();
	}
    } catch(e) {
	/* console.log(e); */		
    }
}
