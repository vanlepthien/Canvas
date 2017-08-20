/**
 * 
 */

"use strict"

var OpDef = {}
var ParmDef = {}
var EventDef = {}

var configDef = {
	move : {
		op : OpDef.move,
		parms : [ {
			type : ParmDef.distance,
			optional : true
		}, {
			type : ParmDef.duration,
			optional : true
		}, {
			type : ParmDef.interval,
			optional : true
		}, {
			type : EventDef.event,
			bounds : [0,-1]
				}, {
		} ]
	},
	fixed : {
		op : OpDef.fixed,
		parms : [ {
			type : ParmDef.distance,
			optional : true
		}, {
			type : ParmDef.duration,
			optional : true
		}, {
			type : ParmDef.interval,
			optional : true
		}, {
			type : Array,
			subtype : EventDef
		} ]
	}
}

ParmDef.speed = {
	note : "speed of element motion in pixels/frame assumeing 60 frames / second.\nActual speed is scaled by element distance.",
	defaultIndex : 0,
	parms : [ [ {
		type : Number,
		bounds : [2,2],
		note : "position or percent(0%-100%. Default is [50%,50]",
		defaultValue : [ 0, 0 ]
	} ], [ {
		field : "speed",
		type : Function,
		note : "function to calculate speed. Returns [Number,Number]"
	}, {
		field : "*",
		optional : true,
		multiplicity : "*",
		note : "initial values and constants used by the function"
	} ] ]
}

ParmDef.position = {
	parms : [ {
		type : [ /\d+/, /(\d*\.\d+)(\d+\.?)%/ ],
		bounds : [2,2],
		note : "initial element position in pixels or percentage. Default is [\"50%\",\"50%\"]",
		defaultValue : [ "50%", "50%" ]
	} ]
}

ParmDef.duration = {
	note : "initial times at which an element is scheduled to appear and disappear.",
	defaultIndex : 0,
	parms : [
			[ {
				type : [ Number, "*" ],
				bounds : [2,2],
				note : "pair of start/stop times. Times are numeric (seconds) or \"*\". Default is [0, \"*\"] ",
				defaultValue : [ 0, "*" ]
			} ], [ {
				type : [[Number,"*"],[Number,"*"]],
				bounds: [1,-1],
				note : "Array of interval arrays, e.g., [[1,5],[20,25]]"
			} ] ]
}

ParmDef.distance = {
	parms : [ {
		type : Number,
		note : "initial logical distance to element. Default = 0",
		defaultValue : 0
	} ]
}

ParmDef.interval = {
	parms : [ {
		type : Number,
		note : "time in milliseconds between image change for multiple image elements. Default = 0",
		defaultValue : 0
	} ]

}

ParmDef.loop = {
	parms : [ {
		type : Boolean,
		note : "indicates whether the element should re-enter the screen when it moves off the opposite edge. Default = false",
		defaultValue : false
	} ]

}

ParmDef.align = {
	parms : [ {
		type : Array,
		size : 2,
		subtype : [ [ /left|center|right/ ], [ /top|center|bottom/ ] ],
		note : "alignment of image with respect to position. [(\"left\",\"center\",\"right\"),(\"top\"|\"center\"|\bottom\")]."
				+ "\n Default is [\"center\",\"center\"].",
		defaultValue : [ "center", "center" ]
	} ]
}

ParmDef.image = {
	parms : [ {
		type : Array,
		minimum_size : 1,
		note : "list of images to be desplayed. Supported types include svg, gif, mp3, jpg, and bmp"
	} ]
}

OpDef.move = {
	parms : [ {
		type : ParmDef.speed,
	}, {
		type : ParmDef.position,
		optional : true
	} ],
	element_options : [ {
		type : ParmDef.distance,
		optional : true
	}, {
		type : ParmDef.duration,
		optional : true
	}, {
		type : ParmDef.interval,
		optional : true
	}, {
		type : ParmDef.align,
		optional : true
	}, {
		type : ParmDef.image
	} ]
}

OpDef.fixed = {
	parms : [ {
		type : ParmDef.position,
		optional : true
	} ],
	element_options : [ {
		type : ParmDef.distance,
		optional : true
	}, {
		type : ParmDef.interval,
		optional : true
	}, {
		type : ParmDef.align,
		optional : true
	}, {
		type : ParmDef.image
	}, {
		type : ParmDef.loop
	} ]
}

OpDef.pan = {
	parms : [ {
		type : ParmDef.speed,
	}, {
		type : ParmDef.position,
		optional : true
	} ],
	element_options : [ {
		type : ParmDef.distance,
		optional : true
	}, {
		type : ParmDef.interval,
		optional : true
	}, {
		type : ParmDef.align,
		optional : true
	}, {
		type : ParmDef.image
	} ]
}
