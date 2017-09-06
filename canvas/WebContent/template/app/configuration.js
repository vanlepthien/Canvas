var debug = false

var drift = [ -.3, 0 ]

var configuration = {}

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
				"borders" : [ 20, 20, 20, 20 ],
			},
		},
	},
	"show" : true,
}

configuration["gifs"] = {
	distance : 5,
	duration : [ 0, "*" ],
	interval : 10,
	operation : {
		"fixed" : {
			"position" : [ "0", "0" ],
		},
	},
	events : {
		click : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	},
	image : [ "bug.gif", "bug30.gif", "bug60.gif", "bug90.gif", "bug120.gif",
			"bug150.gif", "bug180.gif", "bug225.gif", "bug270.gif",
			"bug315.gif", "bug.png", "bug.svg" ],
	align : [ "left", "top" ],
	loop : true
}

configuration["gif2"] = {
	distance : 2,
	duration : [ 0, "*" ],
	interval : 10,
	operation : {
		"move" : {
			speed : {
				dx : .02,
				dy : .02,
				constant : 2,
				speed : deltaV_edge
			},
			position : [ "20%", "60%" ],
			cycle : false
		},
	},
	events : {
		click : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	},
	image : [ "bug.gif", "bug15.gif", "bug30.gif", "bug45.gif", "bug60.gif",
			"bug75.gif", "bug90.gif", "bug105.gif", "bug120.gif", "bug135.gif",
			"bug150.gif", "bug180.gif", "bug225.gif", "bug270.gif",
			"bug315.gif", "bug.png", "bug.svg" ],
	align : [ "left", "top" ],
	loop : true
}

configuration["svg1"] = {
	distance : 2,
	duration : [ 0, "*" ],
	interval : 10,
	operation : {
		"move" : {
			speed : {
				dx : -.02,
				dy : .02,
				constant : 2,
				speed : deltaV_edge
			},
			position : [ "20%", "60%" ],
			cycle : false
		},
	},
	events : {
		click : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	},
	image : [ "bug.svg" ],
	align : [ "left", "top" ],
	loop : true
}

configuration["svgtemplate"] = {
	distance : 2,
	duration : [ 0, "*" ],
	interval : 10,
	operation : {
		"move" : {
			speed : {
				dx : -.02,
				dy : .02,
				constant : 2,
				speed : deltaV_edge
			},
			position : [ "20%", "60%" ],
			template : { // one entry per image
				0 : {
					color : {
							values : [ blue, green, purple ],
							initialIx: 0,
							interval:10,
							transform: "ejs",
							field: "color",
							method: getSvgField,
							index: generateColorIndex
						
					},
					rotate : {
							values: Array(360).fill().map((e,i)=>i+1),
							initialIx: 0,
							interval: 10,
							transform : "element",
							field : "rotate",
							method: getSvgField,
							position: 0,
							delta: 1,
							index: generateRotationIndex
					},
			},
			cycle : false,
		},
	},
	events : {
		click : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	},
	image : [ "bug.svg" ],
	align : [ "left", "top" ],
	loop : true
	},
}
