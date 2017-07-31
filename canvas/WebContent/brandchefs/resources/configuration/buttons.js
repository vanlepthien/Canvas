'use strict'

var leftMenuButtonConfig = {
	distance : 5,
	positionIncr : [ 0, 64 ],
	positionStart : [ 0, 32 ],
	ix : 0,
}

var leftButtondefs = {
	button_about: {
		files: [ "button_about.svg" ],
		events: {
			click: function() {
				linkTo("../about/thebrandchefs.html")
			}
		}
	},
	button_private: {
		events: {
			click: function() {
				linkTo("../privatelabel/privatelabelpackaging.html")
			}
		}
	},
	button_design: {
		events: {
			click: function() {
				linkTo("../design/packagedesign.html")
			}
		}
	},
	button_brand: {
		events: {
			click: function() {
				linkTo("../branding/brandcreation.html")
			}
		}
	},
	button_animation: {
		events: {
			click: function() {
				linkTo("../animation/animation.html")
			}
		}
	},
	button_contact: {
		events: {
			click: function() {
				linkTo("../contact/contact.html")
			}
		}
	},
}

createMenuButtons(leftMenuButtonConfig, leftButtondefs)

var homeButtonConfig = {
	distance : 5,
	positionIncr : [ 0, 0 ],
	positionStart : [ 10, (720 - 100) ],
	ix : 0,
}

var homeButtondefs = {
	button_home: {
		events: {
			click: function() {
				linkTo("http://www.thebrandchefs.com/")
			}
		}
	},
}

createMenuButtons(homeButtonConfig, homeButtondefs)

var mediaButtonConfig = {
	distance : 5,
	positionIncr : [ -70, 0 ],
	positionStart : [ (1280 - 100), (720 - 64) ],
	ix : 0,
}

var mediaButtondefs = {
	button_email: {
		events: {
			click: function() {
				alert("mailto:info@mightyfudge.com")
			}
		}
	},
	button_facebook: {
		files: [ "FB-f-Logo__blue_50.png" ],
		events: {
			click: function() {
				linkTo("https://www.facebook.com/MightyFudgeStudios/")
			},
		},
		has_over: false,
		show: true,
	},
	button_twitter: {
		files: ["Twitter_Logo_Blue.svg"],
		size: [60,60],
		events: {
			click: function() {
				linkTo("https://twitter.com/thebrandchefs")
			}
		},
		has_over: false,
		show: true,
	},
}

createMenuButtons(mediaButtonConfig, mediaButtondefs)

configuration["footerBar"] = {
	distance: 8,
	operation: {
		fixed: {
			position: [ 0, 720 ],
		},
	},
	image: "footerBar.svg",
	align: [ "left", "bottom" ],
}
