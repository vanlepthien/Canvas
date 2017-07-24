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
				"color" : "darkcyan",
			},
		},
		"show" : true,
	}

configuration["bkgd_animationalley"] = {
		"distance" : 99,
		"operation" : {
			"fixed" : {
				position: [0,0]
			},
		},
		"show" : true,
		"image": "bkgd_animationalley.svg",
		align: ["left", "top"],			
	}

configuration["text_animationalley"] = {
		"distance" : 98,
		"operation" : {
			"fixed" : {
				position: [100,160]
			},
		},
		"show" : true,
		"image": "text_animationalley.svg",
		align: ["left", "top"],			
	}

disableButton("button_animation" )