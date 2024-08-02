
async function searchFriend(data) {
	console.log("data" + data);
	const resp = await fetch('/userManagement/friends/search', {
		method: 'POST',
		body: data,
		credentials: 'same-origin'
	});
	if (resp.ok) {
		console.lig("ok");
	}
	else {
		console.log("not ok");
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
			else{
				console.log("error");
			}
		} catch (e) {
			console.error(e)
		}
	}

}

function sentInvitation() {
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
			console.error(e)
		}
	}
}

window.acceptFriend = acceptFriend
window.sentInvitation = sentInvitation
window.deleteFriend = deleteFriend
window.searchFriend = searchFriend
