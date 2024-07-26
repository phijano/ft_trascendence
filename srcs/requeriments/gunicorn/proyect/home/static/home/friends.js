
function showFriends() {
	hidePending();
	hideInvited();
	document.getElementById("bFriends").disabled = true;
    document.getElementById("dFriends").hidden = false;
}

function hideFriends() {
	document.getElementById("bFriends").disabled = false;
    document.getElementById("dFriends").hidden = true;
}

function showPending() {
	hideFriends();
	hideInvited();
	document.getElementById("bPending").disabled = true;
    document.getElementById("dPending").hidden = false;
}

function hidePending() {
	document.getElementById("bPending").disabled = false;
    document.getElementById("dPending").hidden = true;
}

function showInvited() {
	hideFriends();
	hidePending();
	document.getElementById("bInvited").disabled = true;
    document.getElementById("dInvited").hidden = false;
}

function hideInvited() {
	document.getElementById("bInvited").disabled = false;
    document.getElementById("dInvited").hidden = true;
}

window.showFriends = showFriends;
window.showPending = showPending;
window.showInvited = showInvited;
