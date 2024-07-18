import {router} from "./component/router.js"

let user;

document.addEventListener('submit',async ev => {
	ev.preventDefault();
	if (ev.target.id == "fLogin") {
		await logIn(new FormData(ev.target));
	}
	else if (ev.target.id == "fSignUp") {
		await signUp(new FormData(ev.target));
	}
});

//fix
async function SignUp(data) {
	console.log("data" + data);
	const resp = await fetch('/userManagement', {
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

async function logIn(data) {
	console.log("data" + data);
	const resp = await fetch('/userManagement/login', {
		method: 'POST',
		body: data,
		credentials: 'same-origin'
	});
	if (resp.ok) {
		setUser();
		router("/");
	}
	else {
		loginError();
	}
}

async function logOut() {
	console.log("log out pressed");
	const resp = await fetch('/userManagement/logout', {
		credentials: 'same-origin'
	});
	console.log(resp.ok);
	if (resp.ok) {
		unsetUser();
		router("/");
	}
}

function loginError() {

	document.getElementById("id_username").value = "";
	document.getElementById("id_password").value = "";
	document.getElementById("pError").hidden = false;
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
