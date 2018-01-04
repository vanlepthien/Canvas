/**
 *
 * Copyright 2017 William Van Lepthien 
 *
 */
'use strict'

var start = new Date()

var tick = 0

var nominal_tick = 0

// var playable_audios = []

function preload() {
	// start button should be hidden, but make sure
	// TODO: dynamically create start button here?

	image_rt.createRuntimeImages()
	media_rt.createRuntimeAudio()
	media_rt.createRuntimeVideo()
	rt.createRuntime()
	canvasses.generateCanvasses(defaults.canvascontainer, defaults.canvasmodel)
	runNextInitialization("loadImages")
}

function initcanvas() {
	// This must be run by a button click to activate audios on mobile devices
	image_rt.setRuntimeImages()
	media_rt.loadAudio()
	runapp()
}

// Defines ordering of initializer execution
var initializations = {
	"loadImages" : function() {
		image_rt.loadImages(function() {
			runNextInitialization("init")
		})
	},
	// if html has start button, let it initialize things
	"init" : function() {
		if ($("#start_button").length) {
			console.log("Start button")
		} else {
			console.log("No Start button")
			initcanvas()
		}
	}
}

function runNextInitialization(initializer) {
	if (initializer in initializations) {
		var f = initializations[initializer]
		f()
	}
}

function makeButtonVisible() {
	$("#start_button").removeAttr("hidden")
}

function runapp() {
	if ($("#start_button")) {
		$("#start_button").hide()
	}
	draw()
}


var isFileType = function(type) {
	return function(fileName) {
		if (fileName.toLowerCase().endsWith(type)) {
			return true
		}
		return false
	}
}

var isSvg = isFileType(".svg")

var loadedSVGs = 0
var svgImages = {}

function buildImageEntry(name, configuration) {
	var entry = {
		name : name
	}
	for (var op in configuration) {
		entry[op] = configuration[op]
	}
	return entry
}

//function loadLocalSvg(xml, img, imageSize, onload) {
//	var xml = rt_operation.svg
//	img = new Image();
//	xml = insertImageSize(xml, imageSize)
//	var DOMURL = window.URL || window.webkitURL || window;
//	var svg = new Blob([ xml ], {
//		type : 'image/svg+xml'
//	})
//	var url = DOMURL.createObjectURL(svg)
//	onload()
//	img.src = url
//}
//

var svg_regex = /([\s\S]*[<]svg[\s\S]*)(viewBox=)(\"|\')\s*(\S+)\s*(\S+)\s*(\S+)\s*(\S*)\s*\3([\s\S]*)/
var svg_replace2 = "$1 width='$6' height='$7' $2$3$4 $5 $6 $7$3$8"


function insertImageSize(svg, imageSize) {
	var svg_replace1 = "$1 width='" + imageSize[0] + "' height='" + imageSize[1] + "' $2$3$4 $5 $6 $7$3$8"
	return svg.replace(svg_regex, svg_replace1)
}

function getImageSize(svg) {
	var imageSize = []
	imageSize[0] = parseFloat(svg.replace(svg_regex, "$6"))
	imageSize[1] = parseFloat(svg.replace(svg_regex, "$7"))
	return imageSize
}

var shapeCnt = 0

var loadedShapes = {}

function generateId(inString) {
	return btoa(inString).slice(0, -2)
}

var prev = Date.now()
var prev_second_ticks = 0
var interval_adjustment = 1

function draw() {
	var runtime = Runtime()
	if (debug) {
		interval_adjustment = 1
	} else {
		var now = Date.now()
		var elapsed = (now - prev) / 1000
		if (elapsed > 1) {
			// adjust at one second increments
			var nominal_second = (tick - prev_second_ticks) / (60)
			console.log("Time:" + (now - start) / 1000 + " tick: " + tick + " Tick seconds " +
				tick / (60 * interval_adjustment))
			console.log(" tickToSeconds("+tick+"): "+ tickToSeconds(tick))
			console.log(" Nominal second: " + nominal_second + " Elapsed Ticks: " + (tick
				- prev_second_ticks))
			console.log(" Elapsed: " + elapsed + " Nominal/Elapsed: " + (nominal_second /
				elapsed))
			console.log(" Old Interval Adjustment: " + interval_adjustment)
			interval_adjustment = ((nominal_second / elapsed) + interval_adjustment) / 2
			console.log("   New Interval Adjustment: " + interval_adjustment)
			prev_second_ticks = tick
			prev = now
		}
	}
	event_rt.run()
	tick++;
	requestAnimationFrame(function() {
		draw()
	})
}

function inInterval(rt_operation) {
	if ("duration" in rt_operation) {
		var duration = rt_operation.duration
		if (Array.isArray(duration)) {
			var first = duration[0]
			if (Array.isArray(first)) {
				for (var a in duration) {
					if (inSecondsInterval(a)) {
						return true
					}
				}
			} else {
				if (inSecondsInterval(duration)) {
					return true
				}
			}
		}
		return false
	}
	if (rt_operation.show) {
		return true
	}
	return false
}

function currentInterval(element) {
	if ("duration" in element) {
		var duration = element.duration
		if (Array.isArray(duration)) {
			var first = duration[0]
			if (Array.isArray(first)) {
				for (var a in duration) {
					if (inSecondsInterval(a)) {
						return a
					}
				}
			} else {
				if (inSecondsInterval(duration)) {
					return duration
				}
			}
		}
	}
	return []
}

function inSecondsInterval(interval) {
	if (Array.isArray(interval)) {
		if (interval.length == 2) {
			var i0 = interval[0]
			if (i0 == "*") {
				i0 = Number.NEGATIVE_INFINITY
			} else {
				i0 = parseFloat(i0)
			}
			var i1 = interval[1]
			if (i1 == "*") {
				i1 = Number.POSITIVE_INFINITY
			} else {
				i1 = parseFloat(i1)
			}
			if (!(Number.isNaN(i0) || Number.isNaN(i1) || i0 > i1)) {
				var first = secondsToTick(i0)
				var last = secondsToTick(i1)
				if ((tick >= first) && (tick <= last)) {
					return true
				}
			}
		}
	}
	return false
}

function secondsToTick(seconds){
	return seconds * 60 * interval_adjustment
}

function tickToSeconds(tick_value){
	return tick_value / (60*interval_adjustment)
}

function getCurrentTime(){
	if(debug) {
		return tick / 60
	}
	return (Date.now() - start)/ 1000
}

function run(rt_operation) {
	if (rt_operation.operation) {
		if ("canvas" in rt_operation) {
			if (!("context" in rt_operation)) {
				var context = rt_operation.canvas.getContext("2d")
				rt_operation.context = context
			}
		}
		// console.log("Invoking "+rt_operation.name+"::"+op_name)
		try {
			ops[rt_operation.operation].run(rt_operation)
		} catch (e) {
			console.log(rt_operation.name+"["+rt_operation.operation+"] failed. Exception: "+e)
		}
	}
}

function inactivate(rt_operation) {
	var rt_name = rt_operation.name
	var rt_op = rt_operation.operation
	if(rt_operation.canvas){
		if (!rt_operation.context){
			rt_operation.context = rt_operation.canvas.getContext("2d")
		}
	}
		// console.log("Invoking ops["+rt_op+"].inactivate")
	try {
		ops[rt_op].inactivate(rt_operation)
	} catch (e) {
		if ("context" in rt_operation) {
			rt_operation.context.clearRect(0, 0, rt_operation.canvas.width, rt_operation.canvas.height)
		}
	}
}

function nominal_ticks() {
	return (new Date() - start) / 60
}

function getReference(rt_operation, group, field) {
	var runtime = Runtime()
	if (rt_operation.reference) {
		var element_name = operation.reference
		if (element_name in runtime) {
			var ref_operation = runtime[element_name]
			if (rt_operation.operation == ref_operation.operation) {
				if (group in ref_operation) {
					if (field in ref_operation[group]) {
						return ref_operation[group][field]
					}
				}
			}
		}
	}
	return null
}
