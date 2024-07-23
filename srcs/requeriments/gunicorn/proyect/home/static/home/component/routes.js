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
		template: "/templates/pong.html",
		title: "Pong",
		description: "This is pong game page",
	},

	"/signup": {
		template: "userManagement/signup/template",
		title: "Sign up",
		description: "This is sign up page",
	},

	"/login": {
		template: "accounts/login",
		title: "Login",
		description: "This is login page",
	},

	"/profile": {
		template: "userManagement/profile",
		title: "Profile",
		description: "This is profile page",
	},

	"/friends": {
		template: "userManagement/friends",
		title: "Friends",
		description: "This is friends page",
	},

	"/history": {
		template: "userManagement/history",
		title: "History",
		description: "This is match history page",
	},



};

export default{
	URL
};
