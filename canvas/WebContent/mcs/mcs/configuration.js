var debug = false

var drift = [ -.3, 0 ]

var configuration = {
	"alamotheme" : {
		"duration" : [ 5, 200 ],
		"operation" : {
			"sound" : {
				"loop" : true,
				"sound" : "alamoloop.mp3"
			// "sound" : ["1.mp3","2.mp3","3.mp3"]
			//					
			}
		}
	},
	"textbanner" : {
		"distance" : 1,
		"duration" : [ 0, 5 ],
		"operation" : {
			"banner" : {
				"position" : [ "50%", "40%" ],
				"align" : [ "center", "center" ],
				"text" : [ "This is a test. This is an emergency system test.     " ],
				"rotate" : 1,
				"per_second" : 1
			}
		},
		"image" : "banner.png",
	},
	"banner" : {
		"distance" : 1,
		"duration" : [ 0, 5 ],
		"operation" : {
			"move" : {
				"speed": [0,0],
				"position" : [ "50%", "50%" ],
				"align" : [ "center", "center" ]
			}
		},
		"image" : "banner.png",
	},
	"banner2" : {
		"usecanvas" : "banner",
		"distance" : 1,
		"duration" : [ 5, 5 ],
		"operation" : {
			"clear" : {}
		},
		"image" : null,
	},
	"background" : {
		"distance" : 10,
		"duration" : [ 0, 200 ],
		"size" : [ 1200, 600 ],
		"operation" : {
			"pan" : {
				"speed" : drift,
			}
		},
		"image" : "desert.png"
	},
	"head" : {
		"distance" : 1,
		"duration" : [ 5, 30 ],
		"operation" : {
			"bounce" : {
				"top" : "10%",
				"bottom" : "90%",
				"position" : [ "50%", "50%" ],
				"speed" : [ 0, .2 ]
			}
		},
		"align": ["center", "center"],
		"image" : "head.png"
	},
	"head2" : {
		"usecanvas" : "head",
		"distance" : 1,
		"duration" : [ 30, 100 ],
		"operation" : {
			"bounce" : {
				"top" : "10%",
				"bottom" : "90%",
				"reference" : {
					"element" : "head",
					"operation" : "bounce"
				},
				"speed" : [ .05, .2 ]
			}
		},
		"align": ["center", "bottom"],
		"image" : "head.png"
	},
	"cactus1" : {
		"distance" : 5,
		"duration" : [ 0, 200 ],
		"operation" : {
			"move" : {
				"speed" : drift,
				"position" : [ "20%", "60%" ],
				"cycle" : true
			}
		},
		"image" : "cactus5.png"
	},
	"cactus2" : {
		"distance" : 7,
		"duration" : [ 0, 200 ],
		"operation" : {
			"move" : {
				"speed" : drift,
				"position" : [ "40%", "60%" ],
				"cycle" : true
			},
			"button" : {
				"shape" : "cactus7.mask.svg",
				"action" : {
					"reference" : {
						"element" : "cactus2",
						"operation" : "move"
					},
					"sound" : {
						"sounds" : [ "boop1.mp3", "boop2.mp3" ],
						"select" : "random"
					}
				}
			}
		},
		"image" : "cactus7.png"
	}
}