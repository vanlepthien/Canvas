/**
 * 
 */
'use strict'

const x_alignment = {
	"left" : 0,
	"center" : -.5,
	"right" : -1
}
const y_alignment = {
	"top" : 0,
	"center" : -.5,
	"bottom" : -1
}

var playable_audios = []

var util = {}

util.intToColor = function(r,g,b){
	r = Math.floor(Math.abs(r))%256
	g = Math.floor(Math.abs(g))%256
	b = Math.floor(Math.abs(b))%256
	var rgb = ((r*256)+g)*256+b
	var srgb = ("00000000"+ rgb.toString(16)).slice(-6)
	return "#"+srgb
}

util.intToRGBA = function(r,g,b,a){
	r = Math.floor(Math.abs(r))%256
	g = Math.floor(Math.abs(g))%256
	b = Math.floor(Math.abs(b))%256
	var rgba = "rgba("+r+","+g+","+b+","+a+")"
	return rgba
}

util.getIntervalIx = function(state, interval, count) {
	if (count <= 1) {
		return 0
	}
	var elapsed = tick - state.tick
	if (count * interval < elapsed) {
		state.tick = tick
	}
	return Math.floor((elapsed / interval)) % count
}

util.nextImageIx = util.getIntervalIx

util.getPositionVector = function(pos, image_size, canvas_size) {
	var p = pos
	var vector = []
	while (p < canvas_size) {
		vector.push(p)
		p += image_size
	}
	return vector
}

util.valueToPosition = function(field, range, direction = 1) {
	var value = this.toNumber(field)
	var result = value.value
	if (value.isPercent) {
		result = value.value * range
	}
	if (direction < 0) {
		return range - result
	}
	return result
}

util.getAlignedPosition = function(num, dimension, alignment, alignmentDef) {
	var align

	if (!alignment) {
		alignment = "center"
	}
	if (alignment in alignmentDef) {
		align = alignmentDef[alignment]
	} else {
		align = alignmentDef.center
	}

	var pos = num + align * dimension

	return pos

}

util.getSpeed = function(rt_operation) {
	var d
	if ("distance" in rt_operation) {
		d = rt_operation.distance
		d = Math.max(1, d)
	} else {
		d = canvasses.max_distance
	}
	var scale = canvasses.max_distance / d;

	var speed
	if (rt_operation.speed) {
		if (Array.isArray(rt_operation.speed)) {
			speed = rt_operation.speed
		} else {
			var op = rt_operation.speed.speed
			speed = op(rt_operation)
		}
	} else {
		speed = [ 0, 0 ]
	}
	return {
		hspeed : speed[0] * scale / interval_adjustment,
		vspeed : speed[1] * scale / interval_adjustment
	}
}

util.toNumber = function(string) {
	if (isNaN(string)) {
		var isPercent = string.trim().slice(-1) == "%"
		var value
		if (isPercent) {
			value = parseFloat(string) / 100
		} else {
			value = parseFloat(string)
		}
		return {
			"isPercent" : isPercent,
			"value" : value
		}
	}
	return {
		"isPercent" : false,
		"value" : parseFloat(string)
	}

}

util.getPosition = function(rt_operation) {
	var x = null
	var y = null
	if ("position" in rt_operation) {
		if (Array.isArray(rt_operation.position)) {
			if (rt_operation.position.length > 0) {
				x = util.valueToPosition(rt_operation.position[0], rt_operation.canvas.width)
				if (rt_operation.position.length > 1) {
					y = util.valueToPosition(rt_operation.position[1], rt_operation.canvas.height)
				}
			}
		}
	}
	return [ x, y ]
}

var contact = function(address) {
	linkTo(address)
	return true
}

function include(loc) {
	if ($('script[src="' + loc + '"]').length == 0) {
		document.write('<script src="' + loc + '"><\/script>')
	}
}

util.getElement = function(id, tag, ns) {
	var element = document.getElementById(id)
	if (element) {
		return {
			"element" : element,
			"generated" : false
		}
	}
	var body = document.getElementsByTagName("body")[0]
	if (ns == undefined) {
		element = document.createElement(tag)
	} else {
		element = document.createElementNS(ns, tag)
	}
	body.appendChild(element)
	element.setAttribute("id", id)
	return {
		"element" : element,
		"generated" : true
	}
}

util.getElementImage = function(rt_operation, ix) {
	var image_entry = rt_operation.image.images[ix].image
	if (image_entry.svg) {
		// console.log("loading svg for "+rt_operation.name)
		var svgImage = this.getSvgImage(rt_operation, image_entry.svg)
		return svgImage
	}
	return image_entry.image
}

util.getSvgImage = function (rt_operation, svg) {
	var local
	if (rt_operation.state.width && rt_operation.state.height) {
		this.setSvgImageSize(svg, [rt_operation.state.width,rt_operation.state.height])
	} else {
		var imageSize = this.getSvgImageSize(svg)
		rt_operation.state.width = imagesize[0]
		rt_operation.state.height = imagesize[1]
		this.setSvgImageSize(svg, imageSize)
	}
	var img = new Image()
	rt_operation.loaded = false
	img.rt_operation = rt_operation
	/*
	 * onload no applicable for local svg element img.onload = function() {
	 * img.rt_operation.loaded = true }
	 */
	var svg_encoded = btoa(unescape(encodeURIComponent(svg.outerHTML)))
	img.src = "data:image/svg+xml;base64," + svg_encoded
	return img
}

util.getSvgImageSize = function (svg) {
	var imageSize = []
	var width = $(svg).attr("width")
	width = this.normalizeSize(width)
	if (!width) {
		width = this.getWidthFromViewbox(svg)
	}
	var height = $(svg).attr("height")
	height = this.normalizeSize(height)
	if (!height) {
		height = this.getHeightFromViewbox(svg)
	}
	return [ width, height ]
}

util.setSvgImageSize = function (svg, imageSize) {
	$(svg).attr("width", imageSize[0])
	$(svg).attr("height", imageSize[1])
}


const lengthTypeMap = {
	"" : 1,
	px : 1,
	pt : 72 / 96,
	em : 16,
	"in" : 96,
	cm : 96 * 0.3937
}

util.normalizeSize = function(size) {
	if (!size) {
		return undefined
	}
	if (isNaN(size)) {
		var re = /^((?:\+|-)?(?:\d+(?:\.\d*)?)|(?:\.\d+))([a-zA-z]*)$/
		var matched = re.exec(size)
		if (matched) {
			var num = matched[1]
			var type = matched[2]
			if (lengthTypeMap[type]) {
				return matched[1] * lengthTypeMap[type]
			}
			return matched[1]
		}
		var n = parseFloat(size)
		if (isNaN(n)) {
			console.log("normalizeSize(" + size + "). Size cannot be parsed. 100 arbitrarily returned")
			n = 100
		}
		return n
	}
	return size
}

util.isAbsolutePath = function(path) {
	return /^(?:\/\/|[a-z]+:)/i.test(path);
}

util.setImageState = function(rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var image_ix = state.image_ix
	var imagedef = rt_operation.image.images[image_ix]
	var meta_image
	if(!meta.images){
		meta.images = {}
	}
	if(meta.images[image_ix]){
		meta_image = meta.images[image_ix]
	} else {
		meta_image = {}
		meta_image.templates = {}
		meta.images[image_ix] = meta_image
		if(imagedef.template){
			for(var templateName in imagedef.template){
				var template = imagedef.template[templateName]
				meta_image.templates[templateName] = {}
				var mit = meta_image.templates[templateName]
				for(var key in template){
					mit[key] = template[key]
				}
				mit.interval = mit.interval || 10
				mit.size = template.values.length || template.period || 1
				mit.url = imagedef.url
			}
		}
	}
	var state_image
	if(!state.images){
		state.images = {}
	}
	var first_time
	if(state.images[image_ix]){
		state_image = state.images[image_ix]
	} else {
		first_time = true
		state_image = {}
		state.images[image_ix] = state_image
		state_image.width = imagedef.width
		state_image.height = imagedef.height
		state_image.templates = {}
		if(imagedef.template){
			for(var templateName in imagedef.template){
				var template = imagedef.template[templateName]
				state_image.templates[templateName] = {}
				var sit = state_image.templates[templateName]
				sit.ix = template.initialIx || 0
				sit.tick = tick
			}
		}
	}
	for (var templateName in state_image.templates){
		var sit = state_image.templates[templateName]
		var mit = meta_image.templates[templateName]
		var template = imagedef.template[templateName]
		if(template.index){
			sit.ix = util[template.index](sit,mit)
		} else if(!first_time){
			sit.ix = this.getIntervalIx(sit,mit.interval,mit.size)
		}
		if(template.method){
			util[template.method](sit, mit, template,imagedef.image)
		}
	}
}

util.generateArrayIndex = function(image_state,image_meta){
	return this.getIntervalIx(image_state,image_meta.interval, image_meta.size)
}

util.setSvgFieldValue = function(image_state,image_meta,template, imageinfo){
	var svg = imageinfo.svg
	var element = $(svg).find(image_meta.element)
	$(element).attr(image_meta.attribute, image_meta.values[image_state.ix] )
}

util.setSvgFieldTemplate = function(image_state,image_meta,template, imageinfo){
	var svg = imageinfo.svg
	var element = $(svg).find(image_meta.element) 
	var pattern = image_meta.pattern
	var attribute = image_meta.attribute
	var value = image_meta.values[image_state.ix]
	var field = image_meta.field
	var replacement = this.replaceField(pattern,field,value)
	$(element).attr(attribute, replacement )
}

util.replaceField = function(string,field,value){
		var keystring = "${"+field+"}"
		return string.split(keystring).join(value)
}

util.getInitialPosition = function(rt_operation){
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if ("position" in rt_operation) {
		if (Array.isArray(rt_operation.position)) {
			if (rt_operation.position.length > 0) {
				x = util.valueToPosition(rt_operation.position[0], rt_operation.canvas.width)
			}
			if (rt_operation.position.length > 1) {
				y = util.valueToPosition(rt_operation.position[1], rt_operation.canvas.height)
			}
		}
	}
	if (x == Number.MAX_VALUE) {
		x = rt_operation.canvas.width / 2
	}
	if (y == Number.MAX_VALUE) {
		y = rt_operation.canvas.height / 2
	}

	var align
	if ("align" in rt_operation) {
		align = rt_operation.align
	} else {
		align = [ "center", "center" ]
	}

	var x_align,
		y_align

	if (align[0] in x_alignment) {
		x_align = x_alignment[align[0]]
	} else {
		x_align = x_alignment.center
	}

	if (align[1] in y_alignment) {
		y_align = y_alignment[align[1]]
	} else {
		y_align = y_alignment.center
	}

	x = x += rt_operation.image.images[0].width * x_align
	y = y += rt_operation.image.images[0].height * y_align
	return [x,y]
}

util.offCanvas = function(rt_operation){
	var x = rt_operation.state.x
	if(x > rt_operation.canvas.width){
		return true
	}
	var y = rt_operation.state.y
	if(y > rt_operation.canvas.height){
		return true
	}
	var x_right = x + rt_operation.state.width
	if (x_right < 0){
		return true
	}
	var y_bottom = y + rt_operation.state.height
	if (y_bottom < 0){
		return 0
	}
}

util.offCanvasActions = function(rt_operation){
	if(this.offCanvas(rt_operation)){
		if(rt_operation.events.off_canvas){
			rt_operation.events.off_canvas()
		} else {
			event_rt.createEvent("Stop","*",rt_operation)
		}
		return true
	}
	return false
}

// util.nextSoundState = function(rt_operation){
// if(rt_operation.state.switch_audio){
// rt_operation.state.current_audio.pause()
// rt_operation.state.switch_audio = false
// if(rt_operation.state.sound_iteration < 0){
// rt_operation.state.sound_iteration = 0
// } else {
// rt_operation.state.sound_iteration ++
// }
// if(rt_operation.state.sound_iteration < rt_operation.audios.length()){
// rt_operation.state.current_audio =
// operation.audios[rt_operation.state.sound_iteration]
// rt_operation.state.current_audio.play()
// console.log("Playing
// "+rt_operation.state.current_audio.getAttribute("src")+"("+rt_operation.state.sound_iteration+")")
// }
// if(operation.loop){
// rt_operation.state.sound_iteration = 0
// rt_operation.state.current_audio =
// rt_operation.audios[rt_operation.state.sound_iteration]
// rt_operation.state.current_audio.play()
// console.log("Replaying
// "+rt_operation.state.current_audio.getAttribute("src"))
// } else {
// rt_operation.initialized = false
// }
// }
// }
