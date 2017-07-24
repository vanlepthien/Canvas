var debug = false

var drift = [ -.3, 0 ]

var sizes = {

}

if (!configuration) {
	var configuration = {}
}

var leftMenuButtonConfig = {
		distance : 5,
		positionIncr : [ 0, 64 ],
		positionStart : [ 0, 32 ],
		ix : 0,
	}

var leftButtondefs = {
	"button_about" : {
		"files" : [ "button_about.svg", "button_about_over.svg" ],
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/about/thebrandchefs.html")
			}
		}
	},
	"button_private" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/privatelabel/privatelabelpackaging.html")
			}
		}
	},
	"button_design" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/design/packagedesign.html")
			}
		}
	},
	"button_brand" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/branding/brandcreation.html")
			}
		}
	},
	"button_animation" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/animation/animation.html")
			}
		}
	},
	"button_contact" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/animation/animation.html")
			}
		}
	},
}

createMenuButtons(leftMenuButtonConfig, leftButtondefs)

configuration["background"] = {
	"distance" : 100,
	"operation" : {
		"fill" : {
			"color" : "green",
		},
	},
	"show" : true,
}

configuration["background2"] = {
	"distance" : 89,
	"operation" : {
		"fill" : {
			"color" : "purple",
			"shape" : {
				"function": "fillRect",
				"borders" : [ 10, 10, 10, 10],
			},
		},
	},
	"show" : true,
}

configuration["background3"] = {
	"distance" : 88,
	"operation" : {
		"fill" : {
			"color" : "blueviolet",
			"shape" : {
				"remap": true,
				"function": "fillRect",
				"parms" : [ 20, 20, 1240, 680],
			},
		},
	},
	"show" : true,
}

var homeButtonConfig = {
	distance : 5,
	positionIncr : [ 0, 0 ],
	positionStart : [ 10, (720 - 100) ],
	ix : 0,
}

var homeButtondefs = {
	"button_home" : {
		"events" : {
			"click" : function() {
				linkTo("http://www.thebrandchefs.com/")
			}
		}
	},
}

createMenuButtons(homeButtonConfig, homeButtondefs)

var mediaButtonConfig = {
	distance : 5,
	positionIncr : [ -100, 0 ],
	positionStart : [ (1280 - 100), (720 - 100) ],
	ix : 0,
}

var mediaButtondefs = {
	"button_email" : {
		"events" : {
			"click" : function() {
				linkTo("mailto:info@mightyfudge.com")
			}
		}
	},
	"button_facebook" : {
		"events" : {
			"click" : function() {
				linkTo("https://www.facebook.com/MightyFudgeStudios/")
			}
		}
	},
	"button_twitter" : {
		"events" : {
			"click" : function() {
				linkTo("https://twitter.com/thebrandchefs")
			}
		}
	},
}

createMenuButtons(mediaButtonConfig, mediaButtondefs)



