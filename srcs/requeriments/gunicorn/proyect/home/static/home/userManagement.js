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
	hideMenu();
	showUser();
	showPlayer();
}

function unsetUser() {
	hideUser();
	hidePlayer();
	showRegister();
	showMenu();
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

function showMenu() {
	document.getElementById("nMenu").hidden = false;
}

function hideMenu() {
	document.getElementById("nMenu").hidden = true;
}

function showPlayer() {
	document.getElementById("nPlayer").hidden = false;
}

function hidePlayer() {
	document.getElementById("nPlayer").hidden = true;
}



function editAvatar() {
	document.getElementById("fileAvatar").hidden = false;
	document.getElementById("bEditAvatar").hidden = true;
	document.getElementById("bSaveAvatar").hidden = false;
	document.getElementById("bCancelAvatar").hidden = false;
}


function checkAvatar() {
	const dError = document.getElementById("dErrorAvatar");
	const file = document.getElementById("fileAvatar");
	console.log(file)	
	const image = file.files[0];
	console.log(image)

	if (!image.type.includes('image')) {
		dError.innerHTML = "wrong file, only images";
		dError.hidden = false;
	}
	else if (image.size > 5_000_000) {
		dError.innerHTML = "maximun upload size is 5MB";
		dError.hidden = false;		
	}
	else {
		const imAvatar = document.getElementById("imAvatar");
		imAvatar.src = URL.createObjectURL(file.files[0]);
	}

}

async function changeAvatar() {
	const file = document.getElementById("fileAvatar");
	const dError = document.getElementById("dErrorAvatar");

	if (!file.files[0]){
		dError.innerHTML = "No image selected";
		dError.hidden = false;
		return
	}
	const resp = await fetch('/userManagement/login', {
			method: 'GET',
			credentials: 'same-origin'
	});
	if (resp.ok) {

		const formdata = new FormData();
		formdata.append("avatar", file.files[0]);
		formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

		try {
			const response = await fetch("/userManagement/changeAvatar", {
				method: "POST",
				credentials: 'same-origin',
				body: formdata,

			});
			if (response.ok) {
				console.log("avatar changed");
				router(window.location.pathname + window.location.search);
			}
			else {
				console.log("error");
			}
		} catch (e) {
			console.error(e);
		}
	}
}

function cancelAvatar() {
	router(window.location.pathname + window.location.search);
}


function editNick() {
	document.getElementById("iNick").hidden = false;
	document.getElementById("bEdit").hidden = true;
	document.getElementById("bSave").hidden = false;
	document.getElementById("bCancelNick").hidden = false;
}

async function changeNick() {
	const iNick = document.getElementById("iNick");
	const dError = document.getElementById("dError");

	//validate Nick
	if (iNick.value.length < 3) {
		dError.innerHTML = "nick too short";
		dError.hidden = false;
		return;
	}
	else {
		const resp = await fetch('/userManagement/login', {
				method: 'GET',
				credentials: 'same-origin'
		});
		if (resp.ok) {

			const formdata = new FormData();
			formdata.append("newNick", iNick.value);
			formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
	
			try {
				const response = await fetch("/userManagement/changeNick", {
					method: "POST",
					credentials: 'same-origin',
					body: formdata,
		
				});
				if (response.ok) {
					console.log("nick changed");
					router(window.location.pathname + window.location.search);
				}
				else{
					dError.innerHTML = "nick already used";
					dError.hidden = false;
					console.log("error");
				}
			} catch (e) {
				console.error(e);
			}
		}
	}
}

function cancelNick() {
	document.getElementById("dNick").hidden = false;
	document.getElementById("iNick").hidden = true;
	document.getElementById("iNick").value = "";
	document.getElementById("bEdit").hidden = false;
	document.getElementById("bSave").hidden = true;
	document.getElementById("bCancelNick").hidden = true;
	document.getElementById("dError").hidden = true;
}

window.logOut = logOut
window.setUser = setUser

window.checkAvatar = checkAvatar
window.editAvatar = editAvatar
window.changeAvatar = changeAvatar
window.cancelAvatar = cancelAvatar

window.editNick = editNick
window.changeNick = changeNick
window.cancelNick = cancelNick

