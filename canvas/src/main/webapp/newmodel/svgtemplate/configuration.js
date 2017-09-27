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
					var ret = util.intToColor(r,g,b)
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

operation.svgrotate = {
		imageset : "bugsvg",
		operation: "move",
		distance : 7,
		duration : [ 0, "*" ],
		interval : 10,
		speed : {
			dx : -.025,
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

operation.beep = {
	audioset : "beep",
	operation: "sound",
	duration: ["*","*"],
	loop: false,
}


audioset.beep ={
	audio: ["slime01.mp3"]
}