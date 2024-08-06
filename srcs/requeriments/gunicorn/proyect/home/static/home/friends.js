
async function searchFriend(data) {
	console.log("data" + data);
	console.log("query: " + data.get("searchQuery"));
	let query = data.get("searchQuery");
	if (query) {
		router("/friends/search?searchQuery=" + query);
	}
	else {
		document.getElementById("iSearch").style.borderColor="red";
	}
}

async function sendInvitation(friend_id) {

	const resp = await fetch('/userManagement/login', {
			method: 'GET',
			credentials: 'same-origin'
	});
	if (resp.ok) {

		const formdata = new FormData();
		formdata.append("accepter_id", friend_id);
		formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

		try {
			const response = await fetch("/userManagement/inviteFriend", {
				method: "POST",
				credentials: 'same-origin',
				body: formdata,
	
			});
			if (response.ok) {
				console.log("invite send");
				router(window.location.pathname + window.location.search);
			}
			else{
				console.log("error");
			}
		} catch (e) {
			console.error(e);
		}
	}
}

async function acceptFriend(friendship_id) {

	const resp = await fetch('/userManagement/login', {
			method: 'GET',
			credentials: 'same-origin'
	});
	if (resp.ok) {

		const formdata = new FormData();
		formdata.append("friendship_id", friendship_id);
		formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

		try {
			const response = await fetch("/userManagement/acceptFriend", {
				method: "POST",
				credentials: 'same-origin',
				body: formdata,
	
			});
			if (response.ok) {
				console.log("friendship stablished");
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


async function deleteFriend(friendship_id) {

	const resp = await fetch('/userManagement/login', {
			method: 'GET',
			credentials: 'same-origin'
	});
	if (resp.ok) {

		const formdata = new FormData();
		formdata.append("friendship_id", friendship_id);
		formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

		try {
			const response = await fetch("/userManagement/deleteFriend", {
				method: "POST",
				credentials: 'same-origin',
				body: formdata,
	
			});
			if (response.ok) {
				console.log("friendship deleted");
				router(window.location.pathname + window.location.search);
			}
			else{
				console.log("error");
			}
		} catch (e) {
			console.error(e);
		}
	}
}

window.searchFriend = searchFriend
window.sendInvitation = sendInvitation
window.acceptFriend = acceptFriend
window.deleteFriend = deleteFriend

