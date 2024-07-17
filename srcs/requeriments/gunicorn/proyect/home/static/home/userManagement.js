import {router} from "./component/router.js"

let user;
let errors;
document.addEventListener('submit',async ev => {
	if (ev.target.id == "fLogin") {
		ev.preventDefault();
		await logIn(new FormData(ev.target));
	}
});

async function logIn(data) {
	console.log("data" + data);
	const resp = await fetch('/userLogin', {
		method: 'POST',
		body: data,
		credentials: 'same-origin'
	});
	if (resp.ok) {
		console.log("ok")
		user = await resp.json();
		console.log(user);
		setUser();
		router("/");
	}
	else {
		console.log("error")
		errors = await resp.json();
		console.log(errors);
		router("/login");
	}
}

async function logOut() {
	console.log("log out pressed");
	const resp = await fetch('/userLogout', {
		credentials: 'same-origin'
	});
	console.log(resp.ok);
	if (resp.ok) {
		unsetUser();
		router("/");
	}
}

function setUser() {
	hideRegister();
	showUser();
}

function unsetUser() {
	hideUser();
	showRegister();
}

function showRegister() {
	document.getElementById("nRegister").hidden = false;
}

function hideRegister() {
	document.getElementById("nRegister").hidden = true;
}

function showUser() {
	document.getElementById("nUser").hidden = false;
}

function hideUser() {
	document.getElementById("nUser").hidden = true;
}

window.logOut = logOut;
