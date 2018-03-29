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
	var time = getCurrentTime() 
	var elapsed = time - state.time
	if (count * interval / 60 < elapsed) {
		state.time = time
	}
	return Math.floor((elapsed / (interval / 60))) % count
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
	var value = util.toNumber(field)
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

// function include(loc) {
// if ($('script[src="' + loc + '"]').length == 0) {
// document.write('<script src="' + loc + '"><\/script>')
// }
// }

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

util.getElementImage = function(rt_operation, ix, func) {
	var image_entry = rt_operation.image.images[ix]
	if (image_entry.image && image_entry.image.svg) {
		// console.log("loading svg for "+rt_operation.name)
		util.getSvgImage(rt_operation, image_entry.image.svg, func)
		return
	}
	var img = image_entry.image
	img.rt_operation = rt_operation
	func(img)
}

util.getSvgImage = function (rt_operation, svg, func) {
	var local
	if (rt_operation.state.width && rt_operation.state.height) {
		util.setSvgImageSize(svg, [rt_operation.state.width,rt_operation.state.height])
	} else {
		var imageSize = util.getSvgImageSize(svg)
		rt_operation.state.width = imageSize[0]
		rt_operation.state.height = imageSize[1]
		util.setSvgImageSize(svg, imageSize)
	}
	if(!rt_operation.refresh){
		if(svg.image){
			rt_operation.loaded = true
			svg.image.rt_operation = rt_operation
			func(svg.image)
			return
		}
	}
	var img = new Image()
	svg.image = img
	rt_operation.loaded = false
	img.rt_operation = rt_operation
	var encoded = encodeURIComponent(svg.outerHTML)
	img.onload = function(event) {
		var image = event.target
		image.rt_operation.loaded = true 
		var elapsed = Date.now() - image.start
		console.log("Elapsed: "+elapsed+ " "+image.rt_operation.name)
		func(image)
	}
	img.start = Date.now()
	img.src = "data:image/svg+xml," + encoded
}

util.loadSVGToImage =  function(svg, callback){
	var img = new Image()
	svg.image = img
	var encoded = encodeURIComponent(svg.outerHTML)
	img.onload = function(event) {
		var image = event.target
		var elapsed = Date.now() - image.start
		console.log("Elapsed: "+elapsed+ " "+image.svg_element.id)
		callback(image)
	}
	img.svg_element = svg
	img.start = Date.now()
	img.src = "data:image/svg+xml," + encoded

}

util.getSvgImageSize = function (svg) {
	var imageSize = []
	var width = $(svg).attr("width")
	width = util.normalizeSize(width)
	if (!width) {
		width = util.getWidthFromViewbox(svg)
	}
	var height = $(svg).attr("height")
	height = util.normalizeSize(height)
	if (!height) {
		height = util.getHeightFromViewbox(svg)
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
				if(template.values){
					mit.size = template.values.length
				}
				mit.size = mit.size || template.period || 1
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
		sit.operation = rt_operation
		var mit = meta_image.templates[templateName]
		var template = imagedef.template[templateName]
		if(template.index){
			sit.ix = util[template.index](sit,mit)
		} else if(!first_time){
			sit.ix = util.getIntervalIx(sit,mit.interval,mit.size)
		}
		if(template.method){
			util[template.method](sit, mit, template,imagedef.image, rt_operation)
		}
	}
}

util.generateArrayIndex = function(image_state,image_meta){
	return util.getIntervalIx(image_state,image_meta.interval, image_meta.size)
}

util.setSvgFieldValue = function(image_state,image_meta,template, imageinfo){
	var svg = imageinfo.svg
	var element = $(svg).find(image_meta.element)
	$(element).attr(image_meta.attribute, image_meta.values[image_state.ix] )
}

util.setSvgCellValue = function(svg,element_id,template,value,rt_operation){
	var element = $(svg).find(element_id)
	var val = ""
	if(typeof(template.value) === 'function'){
		val = template.value(rt_operation,value)
	} else {
		val = value
	}
	$(element).html(val)
}

util.setSvgStyleValue = function(svg,element_id,template,value,rt_operation){
	var element = $(svg).find(element_id)
	var val = ""
	if(typeof(template.value) === 'function'){
		val = template.value(rt_operation,value)
	} else {
		val = value
	}
	$(element).css(template.field,val)
}

util.setSvgAttributeValue = function(svg,element_id,template,value,rt_operation){
	var element = $(svg).find(element_id)
	var val = ""
	if(typeof(template.value) === 'function'){
		val = template.value(rt_operation,value)
	} else {
		val = value
	}
	$(element).attr(template.field,val)
}


util.setSvgTextValue = function(image_state, image_meta ,template, imageinfo, rt_operation){
	var svg = imageinfo.svg
	var element_id = image_meta.element
	var value = image_meta.value
	util.setSvgCellValue(svg, element_id,template, value, rt_operation)
// var element = $(svg).find(image_meta.element)
// if(typeof image_meta.value == 'function'){
// $(element).html(image_meta.value(image_state, image_meta))
// } else {
// $(element).html(image_meta.value)
// }
}

util.setSvgCssValue = function(image_state, image_meta, template, imageinfo, rt_operation){
	var svg = imageinfo.svg
	var element_id = image_meta.element
	var value = image_meta.value
	util.setSvgStyleValue(svg,element_id,template,value,rt_operation)
// var content = $(element).html()
// var field = image_meta.field ? image_meta.field : template.field
// var value
// if(typeof image_meta.value == 'function'){
// value = image_meta.value(image_state,image_meta)
// } else {
// value = image_meta.value
// }
// var replacement = util.replaceField(content,field,value)
// $(element).html(replacement)
}

// util.replaceField = function(string,field,value){
// var keystring = "${"+field+"}"
// return string.split(keystring).join(value)
// }

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
		
	var x_shift = 0
	var y_shift = 0

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
	
	var width = rt_operation.state.width 
	var height = rt_operation.state.height 
	
	if(x_align != 0){
		x_shift = width * x_align
	}
	
	if(y_align != 0){
		y_shift = width * y_align
	}

	x = x += x_shift
	y = y += y_shift
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
		return true
	}
	return false
}

util.offCanvasActions = function(rt_operation){
	if(util.offCanvas(rt_operation)){
		if(rt_operation.events && rt_operation.events.off_canvas){
			rt_operation.events.off_canvas()
		} else {
			event_rt.createEvent(event_rt.STOP,"*",rt_operation)
		}
		return true
	}
	return false
}

util.getFileType = function(file){
	var last = file.lastIndexOf(".")
	if(last == -1){
		return ""
	}
	return file.substring(last)
}

util.getViewbox = function(svg) {
	var viewbox = svg.attributes.getNamedItem("viewBox").value
	var items = viewbox.split(/(?:\s*,s*)|\s+/)
	return items
}

util.getWidthFromViewbox =  function(svg) {
	return getViewbox(svg)[2]
}

util.getHeightFromViewbox = function(svg) {
	return getViewbox(svg)[3]
}

util.redraw =  function(rt_operation, fields){
	var retval = false
	var f = fields
	if(fields == undefined) {
		f = ["image_ix","width","height","x","y"]
	} 
	if( rt_operation.previous ){
		for(var ix in f){
			var field = f[ix]
			var prev = rt_operation.previous[field]
			var curr = rt_operation.state[field]
			if(prev != curr){
				retval = true
				break
			}
		}
	} else {
		retval = true
	}
	var previous = {}
	for(var ix in f){
		var field = f[ix]
		previous[field] = rt_operation.state[field]
	}	
	rt_operation.previous = previous
	return retval
}
