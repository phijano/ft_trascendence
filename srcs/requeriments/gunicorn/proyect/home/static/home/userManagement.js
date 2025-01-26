import {router} from "./component/router.js"

let errors;
let myWebsocket;

async function getWebsocket() {	
	myWebsocket = new WebSocket('wss://' + window.location.host + '/wss');
	//myWebsocket = new WebSocket('ws://' + window.location.host + '/ws');
	myWebsocket.onopen = socketOpen
	myWebsocket.onmessage = socketMessage;
	myWebsocket.onclose = socketClose;
	myWebsocket.onerror = socketError;
	console.log("connecting");
}

function socketOpen(event) {
	console.log("open wss");
}

function socketError(event) {
	console.log("error wss");
}

function socketMessage(event) {
	console.log("datos servidor");
	const message = JSON.parse(event.data);
	if (message.app = "pong") {
		serverPongMessage(message);
	}
}

function socketClose(event) {
	if (event.wasClean) {
		console.log("connection ended");
	}
	else {
		console.log("connection lost");
		setTimeout(function() {
			getWebsocket();
		}, 1000);
	}
}

function sendMessageServer(data) {
	if (myWebsocket) {
		if (data) {
			myWebsocket.send(JSON.stringify(data));
		}
	}
}

document.addEventListener('submit',async ev => {
	console.log("submit");
	console.log(ev.target);	
	if (ev.target.id == "fLogin") {	
		ev.preventDefault();
		console.log("login form");
		await logIn(new FormData(ev.target));
	}
	else if (ev.target.id == "fSignUp") {
		ev.preventDefault();
		console.log("submit form");
		await signUp(new FormData(ev.target));
	}	
	else if (ev.target.id == "fSearchFriend") {
		ev.preventDefault();
		//console.log("search friend form");
		await searchFriend(new FormData(ev.target));
	}
});

async function signUp(data) {
	console.log("data" + data);
	try {
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
	} catch(e) {
		console.log(e);
	}
}

function signUpError() {
	
	const dUsernameError = document.getElementById("dUsernameError");
	const dEmailError = document.getElementById("dEmailError");
	const dPasswordError = document.getElementById("dPasswordError");

	dUsernameError.innerHTML = "";
	dEmailError.innerHTML = "";
	dPasswordError.innerHTML = "";

	for (const field in errors) {
		for (const error in errors[field]) {
			console.log(field + " " + errors[field][error].message);
			if (field == "username") {
				document.getElementById("id_username").value = "";
				dUsernameError.innerHTML += "<p>" + errors[field][error].message + "</p>"; 
				dUsernameError.hidden = false;
			}
			else if (field == "email") {
				document.getElementById("id_email").value = "";
				dEmailError.innerHTML += "<p>" + errors[field][error].message + "</p>";
				dEmailError.hidden = false;
			}
			else {
				document.getElementById("id_password1").value = "";	
				document.getElementById("id_password2").value = "";
				dPasswordError.innerHTML += "<p>" + errors[field][error].message + "</p>"; 
				dPasswordError.hidden = false;
			}
		}
	}
}

async function logIn(data) {
	console.log("data" + data);
	try {
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
	} catch(e) {
		console.log(e);
	}
}

async function logOut() {
	console.log("log out pressed");
	try {
		const resp = await fetch('/userManagement/logout', {
			credentials: 'same-origin'
		});
		console.log(resp.ok);
		if (resp.ok) {
			unsetUser();
			
			router("/");
		}
	} catch(e) {
		console.log(e);
	}
}

function loginError() {

	document.getElementById("id_username").value = "";
	document.getElementById("id_password").value = "";
	document.getElementById("pError").hidden = false;
}

function setUser() {
	getWebsocket();
	hideRegister();
	hideMenu();
	showUser();
	showPlayer();
}

function unsetUser() {
	myWebsocket.close();
	hideUser();
	hidePlayer();
	showRegister();
	showMenu();
	removeNotifications();
	closeChat();
	console.log("unset user");
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

function removeNotifications() {
	const notDiv = document.getElementById("dNotification");
	const toastDiv = document.getElementById("dToast");
	if (notDiv != null) {
		notDiv.remove();
	}
	if (toastDiv != null) {
		toastDiv.remove();
	}

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
	else if (image.size > 2_000_000) {
		dError.innerHTML = "maximun upload size is 2MB";
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
	try {
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
			} catch(e) {
				console.log(e);
			}
		}
	} catch(e) {
		console.log(e);
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
		try {
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
				} catch(e) {
					console.log(e);
				}
			}
		} catch(e) {
			console.log(e);
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

window.sendMessageServer = sendMessageServer