// svg template sample

var debug = false

var drift = [ -.3, 0 ]

var imageset = ImageSet()

var operation = Operation()

var audioset = AudioSet()

var test = {}

imageset.bugsvg = {
	image : {
		0 : {
			name : "bug2.svg",
			width : 54,
			height : 56,
		}
	}
}

imageset.desert = {
	image : {
		0 : {
			name : "desert3.svg",
			width : 1200,
			height : 600,
		}
	}
}

operation.background = {
	imageset : "desert",
	operation : "pan",
	distance : 50,
	duration : [ 0, "*" ],
	size : [ 1200, 600 ],
	speed : drift,
}
