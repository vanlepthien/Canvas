var debug = false

var drift = [ -.3, 0 ]

var sizes = {

}

var configuration = {}

configuration["button_about"] = {
	"distance" : 5,
	"duration" : [ 0, "*" ],
	"operation" : {
		"fixed" : {
			"position" : [ "0", "0" ],
		},
		"functions" : {
			"over" : {
				"condition" : function(rt_element) {
					return (overCanvas.startsWith("button_about"))
				},
				"action" : function() {
					showCanvas("button_about_over")
				},
			},
			"leave" : {
				"condition" : function(name) {
					return !(overCanvas.startsWith("button_about"))
				},
				"action" : function() {
					hideCanvas("button_about_over")
				},
			},
		}
	},
	"events" : {
		"click" : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	},
	"image" : "button_about.svg",
	"align" : [ "left", "top" ]

}

configuration["button_about_over"] = {
	"distance" : 5,
	"operation" : {
		"fixed" : {
			"position" : [ "0", "0" ],
		},
		"functions" : configuration.button_about.functions,
	},
	"events" : configuration.button_about.events,
	"image" : "button_about_over.svg",
	"align" : [ "left", "top" ],
	"show" : false,
}

configuration["button_private"] = {
	"distance" : 5,
	"duration" : [ 0, "*" ],
	"operation" : {
		"move" : {
			"speed" : [ 0, 0 ],
			"position" : [ "0", "64" ],
			"cycle" : false
		},
		"button" : {
			"action" : {
				"sound" : {
					"sounds" : [ "boop1.mp3", "boop2.mp3" ],
					"select" : "random"
				}
			}
		}
	},
	"image" : "button_private.svg",
	"size" : [ 64, 64 ],
	"align" : [ "left", "top" ]

}

configuration["button_brand"] = {
	"distance" : 5,
	"duration" : [ 0, "*" ],
	"operation" : {
		"move" : {
			"speed" : [ 0, 0 ],
			"position" : [ "0", "128" ],
			"cycle" : false
		},
		"button" : {
			"action" : {
				"sound" : {
					"sounds" : [ "boop1.mp3", "boop2.mp3" ],
					"select" : "random"
				}
			}
		}
	},
	"image" : "button_brand.svg",
	"size" : [ 64, 64 ],
	"align" : [ "left", "top" ]
}
