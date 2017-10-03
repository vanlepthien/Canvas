var debug = false

var drift = [ -.3, 0 ]

var imageset = ImageSet()

var operation = Operation()

imageset.bugs = {
	image : {
		0 : {
			name : "bug.gif",
			width : 54,
			height : 56,
		},
		1 : {
			name : "bug30.gif",
			width : 54,
			height : 56,
		},
		2 : {
			name : "bug60.gif",
			width : 54,
			height : 56,
		},
		3 : {
			name : "bug90.gif",
			width : 54,
			height : 56,
		},
		4 : {
			name : "bug120.gif",
			width : 54,
			height : 56,
		},
		5 : {
			name : "bug150.gif",
			width : 54,
			height : 56,
		},
		6 : {
			name : "bug180.gif",
			width : 54,
			height : 56,
		},
		7 : {
			name : "bug225.gif",
			width : 54,
			height : 56,
		},
		8 : {
			name : "bug270.gif",
			width : 54,
			height : 56,
		},
		9 : {
			name : "bug315.gif",
			width : 54,
			height : 56,
		},
		10 : {
			name : "bug.png",
			width : 54,
			height : 56,
		},
		11 : {
			name : "bug.svg",
			width : 54,
			height : 56,
		},
	},
	configuration : {
		interval : 10,
		loop : true
	}
}

imageset.bugs2 = {
	image : [ "bug.gif", "bug30.gif", "bug60.gif", "bug90.gif", "bug120.gif",
		"bug150.gif", "bug180.gif", "bug225.gif", "bug270.gif",
		"bug315.gif", "bug.png", "bug.svg" ],
	shared: {
		width : 54,
		height : 56,
	},
	configuration : {
		interval : 10,
		loop : true
	}
}

imageset.bugsvg = {
	image : {
		0 : {
			name : "bug.svg",
			width : 54,
			height : 56,
		}
	}
}

operation.background = {
	operation : "fill",
	distance : 100,
	color : "blueviolet",
	show : true,
}

operation.background1 = {
	operation : "fill",
	distance : 99,
	color : "purple",
	shape : {
		"function" : "fillRect",
		borders : [ 10, 10, 10, 10 ]
	},
	show : true,
}

operation.background2 = {
	operation : "fill",
	distance : 99,
	color : "darkmagenta",
	shape : {
		"function" : "fillRect",
		borders : [ 20, 20, 20, 20 ]
	},
	show : true,
}

operation.fixedbugs = {
	imageset : "bugs",
	operation : "fixed",
	distance : 5,
	duration: [0,"*"],
	interval : 10,
	position : [ 0, 0 ],
	align : [ "left", "top" ],
	loop : true,
	events : {
		click : function() {
			location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
		},
	}
}

operation.movebugs = {
		imageset : "bugs2",
		operation : "move",
		duration: [0,"*"],
		speed: {
			dx : .02,
			dy : .02,
			constant : 2,
			speed : deltaV_edge
		},
		distance : 2,
		interval : 10,
		position : [ "20%", "60%" ],
		loop : true,
		events : {
			click : function() {
				location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
			},
		}
	}

operation.svgbug = {
		imageset : "bugsvg",
		operation: "move",
		distance : 2,
		duration : [ 0, "*" ],
		interval : 10,
		speed : {
			dx : -.02,
			dy : .02,
			constant : 2,
			speed : deltaV_edge
		},
		position : [ "20%", "60%" ],
		cycle : false,
		events : {
			click : function() {
				location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
			},
		},
		loop : true,
}

operation.svgrotate = {
		imageset : "bugsvg",
		operation: "move",
		distance : 7,
		duration : [ 0, "*" ],
		interval : 10,
		speed : {
			dx : -.015,
			dy : .025,
			constant : 2,
			speed : deltaV_edge
		},
		position : [ "40%", "60%" ],
		cycle : false,
		events : {
			click : function() {
				location.href = "http://www.thebrandchefs.com/about/thebrandchefs.html"
			},
		},
		loop : true,
		template : { // one entry per image
			0 : {
				color : {
					element: "svg > g > g:eq(0)",
					attribute: "fill",
					values : [ "blue", "green", "purple" ],
					initialIx : 0,
					interval : 10,
					method : "svg.setSvgFieldValue",
					index : "svg.generateArrayIndex",
				},
				rotate : {
					element: "svg > g:eq(0)",
					attribute: "transform",
					values : Array(360).fill().map((e, i) => i + 1),
					initialIx : 0,
					interval : 10,
					transform : "rotate(${deg} 27 28)",
					field : "deg",
					method : "svg.setSvgFieldTemplate",
					position : 0,
					delta : 1,
					index : "svg.generateScaledIndex"
				},
			},
		},
}
