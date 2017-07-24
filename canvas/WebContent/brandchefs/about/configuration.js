var debug = false

var drift = [ -.3, 0 ]

var sizes = {

}

if (!configuration) {
	var configuration = {}
}

configuration["background"] = {
	"distance" : 100,
	"operation" : {
		"fill" : {
			"color" : "blueviolet",
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
				"function" : "fillRect",
				"borders" : [ 10, 10, 10, 10 ],
			},
		},
	},
	"show" : true,
}

configuration["background3"] = {
	"distance" : 88,
	"operation" : {
		"fill" : {
			"color" : "darkmagenta",
			"shape" : {
				"remap" : true,
				"function" : "fillRect",
				"parms" : [ 20, 20, 1240, 680 ],
			},
		},
	},
	"show" : true,
}

disableButton("button_about" )