// svg template sample

var debug = false

var drift = [ -.3, 0 ]

var imageset = ImageSet()

var operation = Operation()

var audioset = AudioSet()

var test = {}

test.template = { 
	0 : {
		color : {
			element: "g > g:eq(0)",
			attribute: "fill",
			values : Array(512).fill().map((e,i) => function(i){
				var rad = (i*Math.PI/255.0)
				var r = (Math.sin(rad) + 1)/2
				var g = (Math.cos(rad) + 1)/2
				var b = (Math.sin(-rad) +1)/2
				console.log(i+" "+rad+" ("+r+","+g+","+b+") ")
				var r = Math.floor(r*255)
				var g = Math.floor(g*255)
				var b = Math.floor(b*255)
				var ret = util.intToRGBA(r,g,b,1)
				console.log(" ("+r+","+g+","+b+") "+ret)
				return ret
			}(i)),
			initialIx : 0,
			interval : 2,
			method : "setSvgFieldValue",
			index : "generateArrayIndex",
		},
		rotate : {
			element: "g:eq(0)",
			attribute: "transform",
			values : Array(360).fill().map((e, i) => i + 1),
			initialIx : 0,
			interval : 10,
			pattern : "rotate(${deg} 27 28)",
			field : "deg",
			method : "setSvgFieldTemplate",
			position : 0,
			delta : 1,
			index : "generateArrayIndex"
		},
	},
}

test.template2 = { 
	0 : {
		color : {
			element: "g > g:eq(0)",
			attribute: "fill",
			values : Array(512).fill().map((e,i) => function(i){
				var rad = (i*Math.PI/255.0)
				var r = Math.abs(Math.sin(rad))
				var g = Math.abs(Math.cos(rad))
				var b = Math.abs(Math.sin(rad+Math.PI/4))
				var r = Math.floor(r*255)
				var g = Math.floor(g*255)
				var b = Math.floor(b*255)
				var ret = util.intToRGBA(r,g,b,1)
				return ret
			}(i)),
			initialIx : 0,
			interval : 2,
			method : "setSvgFieldValue",
			index : "generateArrayIndex",
		},
		rotate : {
			element: "g:eq(0)",
			attribute: "transform",
			values : Array(180).fill().map((e, i) => i * 2),
			initialIx : 0,
			interval : 10,
			pattern : "rotate(${deg} 27 28)",
			field : "deg",
			method : "setSvgFieldTemplate",
			position : 0,
			delta : 1,
			index : "generateArrayIndex"
		},
	},
}

test.template3 = { 
	0 : {
		color : {
			element: "g > g:eq(0)",
			attribute: "fill",
			values : Array(512).fill().map((e,i) => function(i){
				var rad = (i*Math.PI/255.0)
				var r = Math.abs(Math.sin(rad))
				r=r*r
				var g = Math.abs(Math.cos(rad))
				g=g*g
				var b = r*g
				var r = Math.floor(r*255)
				var g = Math.floor(g*255)
				var b = Math.floor(b*255)
				var ret = util.intToRGBA(r,g,b,1)
				return ret
			}(i)),
			initialIx : 0,
			interval : 2,
			method : "setSvgFieldValue",
			index : "generateArrayIndex",
		},
		opacity : {
			element: "g > g:eq(0)",
			attribute: "fill-opacity",
			values : [1.0],
			initialIx : 0,
			interval : 1000,
			method : "setSvgFieldValue",
			index : "generateArrayIndex",
		},
		rotate : {
			element: "g:eq(0)",
			attribute: "transform",
			values : Array(180).fill().map((e, i) => i * 2),
			initialIx : 0,
			interval : 10,
			pattern : "rotate(${deg} 27 28)",
			field : "deg",
			method : "setSvgFieldTemplate",
			position : 0,
			delta : 1,
			index : "generateArrayIndex"
		},
	},
}

imageset.bugsvg = {
	image : {
		0 : {
			name : "bug2.svg",
			width : 54,
			height : 56,
		}
	}
}

imageset.head = {
	image : {
		0 : {
			name : "head.png",
			width : 205,
			height : 269,
		}
	}
}

imageset.desert = {
	image : {
		0 : {
			name : "desert.svg",
			width: 1200,
			height: 600,
		}
	}
}


 operation.sky = {
 operation : "fill",
 distance : 100,
 color : "orange",
 show : true,
 }

operation.svgrotate = {
	imageset : "bugsvg",
	operation: "move",
	distance : 7,
	duration : [ 0, "*" ],
	interval : 10,
// speed: [0,0],
	speed : {
		dx : .05,
		dy : .025,
		constant : 1,
		speed : deltaV_edge
	},
	position : [ "40%", "60%" ],
	cycle : false,
	events : {
		click : function() {
			event_rt.createEvent("Start","*","beep")
		},
	},
	loop : true,
	template : test.template,
}

operation.svgrotate2 = {
	imageset : "bugsvg",
	operation: "move",
	distance : 6,
	duration : [ 0, "*" ],
	interval : 1,
// speed: [0,0],
	speed : {
		dx : -.05,
		dy : .05,
		constant : 1,
		speed : deltaV_edge
	},
	position : [ "60%", "40%" ],
	cycle : false,
	events : {
		click : function() {
			event_rt.createEvent("Start","*","beep")
		},
	},
	loop : true,
	template : test.template2,
}

operation.svgrotate3 = {
	imageset : "bugsvg",
	operation: "move",
	distance : 5,
	duration : [ 0, "*" ],
	interval : 1,
	width: 100,
	height: 100,
	size:[100,100],
// speed: [0,0],
	speed : {
		dx : -.06,
		dy : .06,
		constant : 1,
		speed : deltaV_edge
	},
	position : [ "60%", "60%" ],
	cycle : false,
	events : {
		click : function() {
			event_rt.createEvent("Start","*","beep")
		},
	},
	loop : true,
	template : test.template3,
}

operation.head = {
	imageset : "head",
	operation: "bounce",
	distance : 6.5,
	duration : [ 0, "*" ],
	interval : 1,
	width: 205,
	height: 269,
    speed: [.02,.05],
	top: "10%",
	bottom: "90%",
	position: [ "50%", "50%" ],
	events : {
		click : function() {
			event_rt.createEvent("Start","*","beep")
		},
	},
	loop : true,
}

operation.beep = {
	audioset : "beep",
	operation: "sound",
	duration: ["*","*"],
	loop: false,
}

operation.background = {
	imageset: "desert",
	operation: "pan",
	distance: 50,
	duration: [ 0, "*" ],
	size: [ 1200, 600 ],
	speed: drift,
}



audioset.beep ={
	audio: ["Slime01.mp3"]
}