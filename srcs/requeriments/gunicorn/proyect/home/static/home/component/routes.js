const URL = {

	404: {
		template: "/templates/404.html",
		title: "404",
		description: "Page not found",
	},

	"/": {
		template: "/templates/home.html",
		title: "Home",
		description: "This is home page",
	},

	"/test": {
		template: "/templates/test.html",
		title: "Test",
		description: "This is a test page",
	},

	"/pong": {
		template: "/pongApp/pong",
		title: "Pong",
		description: "This is pong game page",
	},

	"/signup": {
		template: "/userManagement/signup/template",
		title: "Sign up",
		description: "This is sign up page",
	},
	"/confirmation/success": {
		template: "/templates/email_success.html",
		title: "Activate success",
		description: "This is actvate account success page",
	},
	"/confirmation/error": {
		template: "/templates/email_error.html",
		title: "Activate error",
		description: "This is activate account error page",
	},
	"/confirmation/expired": {
		template: "/templates/expired.html",
		title: "Link expired",
		description: "This is link expired error page",
	},
	"/login": {
		template: "/accounts/login",
		title: "Login",
		description: "This is login page",
	},

	"/profile": {
		template: "/userManagement/profile",
		title: "Profile",
		description: "This is profile page",
	},

	"/chat": {
    template: "/appChat/",
    title: "chat",
    description: "This is live chat",
},

	"/appChat/private/:id": { 
		template: "/appChat/private/:id/",
		title: "Private Chat",
		description: "This is private chat",
	},

	"/friends": {
		template: "/userManagement/friends",
		title: "Friends",
		description: "This is friends page",
	},

	"/friends/pending": {
		template: "/userManagement/friends/pending",
		title: "Friends",
		description: "This is friends page",
	},

	"/friends/invited": {
		template: "/userManagement/friends/invited",
		title: "Friends",
		description: "This is friends page",
	},

	"/friends/search": {
		template: "/userManagement/friends/search",
		title: "Friends",
		description: "This is friends page",
	},

	"/history": {
		template: "/userManagement/history",
		title: "History",
		description: "This is match history page",
	},



};

export default{
	URL
};
