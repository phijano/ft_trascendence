import {router} from "./component/router.js"

let errors;

document.addEventListener('submit',async ev => {
	console.log("submit");
	console.log(ev.target);
	ev.preventDefault();
	if (ev.target.id == "fLogin") {	
		console.log("login form");
		await logIn(new FormData(ev.target));
	}
	else if (ev.target.id == "fSignUp") {
		console.log("submit form");
		await signUp(new FormData(ev.target));
	}
	else if (ev.target.id == "fSearchFriend") {
		console.log("search friend form");
		await searchFriend(new FormData(ev.target));
	}
	console.log("submited");
});

async function signUp(data) {
	console.log("data" + data);
	const resp = await fetch('/userManagement/signup', {
		method: 'POST',
		body: data,
		credentials: 'same-origin'
	});
	if (resp.ok) {
		console.log("ok")
		document.getElementById("content").innerHTML = "You received an email to activate your account"
	}
	else {
		console.log("error");
		errors = await resp.json();
		console.log (errors);
		signUpError();
	}
}

function signUpError() {

	document.getElementById("id_username").value = "";
	document.getElementById("id_password1").value = "";	
	document.getElementById("id_password2").value = "";
	//fix. Need to build error messages
	document.getElementById("pError").innerHTML = errors.password2[0].message;
	document.getElementById("pError").hidden = false;

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
window.setUser = setUser
