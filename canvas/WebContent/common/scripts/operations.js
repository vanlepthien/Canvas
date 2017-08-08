/**
 * 
 */
'use strict'

function bounce(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextBounceState(rt_element, rt_operation)
	} else {
		newBounceState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
	context.drawImage(rt_element.imageinfo.image, state.x, state.y)
}

function newBounceState(rt_element, rt_operation){
	
	// [x,y] are the coordinates of the top left corner
	// x_left = x
	// x_right = x + imageinfo.width
	// y_top = y
	// y_bottom = y + imageinfo.height
	var top, bottom
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	if("top" in operation){
		top = valueToPosition(operation.top, rt_element.canvas.height)
	} else {
		top = valueToPosition("20%", rt_element.canvas.height)
	}
	if("bottom" in operation){
		bottom = valueToPosition(operation.bottom, rt_element.canvas.height)
	} else {
		bottom = valueToPosition("80%", rt_element.canvas.height)
	}
	
	var x = null
	var y = null
	var direction = null
	if("reference" in operation){
		x = getReference(rt_operation,"state","x")
		y = getReference(rt_operation,"state","y")
		direction = getReference(rt_operation,"state","direction")
	}
	if(!direction){
		direction = 1
	}
	
	var align 
	if("align" in element){
		align = element.align
	} else {
		align = ["canter", "center"]
	}

	if(x == null || y == null){
		var xy = getPosition(rt_element, rt_operation)
		if(x == null) {
			x = xy[0]
			x = getAlignedPosition(x, rt_element.imageinfo.width, align[0], x_alignment)
		}
		if(y == null){
			y = xy[1]
			y = getAlignedPosition(y, rt_element.imageinfo.height, align[1], y_alignment)
		}
		
	}
	
	if (x == null){
		x = element.canvas.width / 2
	}
	if (y == null){
		y = (top + bottom) / 2
	}
	
	
	
	var x_left = x 
	var x_right = x + rt_element.imageinfo.width
	var y_top = y
	var y_bottom = y + rt_element.imageinfo.height
	
	var state = {}

	
	state["x"] = x
	state["y"] = y
	state["direction"] = direction
	rt_operation.state = state
	
	var meta = {}
	meta["top"] = top
	meta["bottom"] = bottom
	rt_operation.meta = meta
}

function nextBounceState(rt_element, rt_operation){
// Less is more in the y direction
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	
	var x = state.x + speed.hspeed
	var y = state.y + (state.direction * speed.vspeed)
	
	var x_left = x 
	var x_right = x + rt_element.imageinfo.width
	var y_top = y
	var y_bottom = y + rt_element.imageinfo.height

	
	if(state.direction < 0){
		if(y_top <= meta.top){
			state.direction = 1
		}
	} else {
		if(y_bottom >= meta.bottom){
			state.direction = -1
		}
	}
	state.x = x
	state.y = y
	
}

function valueToPosition(field,range,direction=1){
	var value = toNumber(field)
	var result = value.value
	if(value.isPercent){
		result = value.value * range
	}
	if(direction < 0){
		return range - result
	}
	return result
}

function getAlignedPosition(num, dimension, alignment, alignmentDef){
	var align
	
	if(!alignment){
		alignment = "center"
	}
	if(alignment in alignmentDef){
		align = alignmentDef[alignment]
	} else {
		align = alignmentDef.center
	}
		
	var pos = num + align * dimension
	
	return pos

}

function move(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextMoveState(rt_element, rt_operation)
	} else {
		newMoveState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var operation = rt_operation.configuration
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
// console.log("image: ("+state.x+", "+state.y+",
// "+rt_element.imageinfo.image.width+",
// "+rt_element.imageinfo.image.height+")")
	if(operation.cycle){
		for(var x_ix in state.x_vector){
			for(var y_ix in state.y_vector){
				context.drawImage(
						rt_element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
			}
		}
	} else {
		context.drawImage(rt_element.imageinfo.image, state.x, state.y)
	}
}

function newMoveState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	var state = {}
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_element.canvas.width
	meta["height"] =  rt_element.canvas.height
	meta["imagewidth"] =  rt_element.imageinfo.width
	meta["imageheight"] =  rt_element.imageinfo.height
	rt_operation["meta"] = meta
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if("position" in operation){
		if(Array.isArray(operation.position)){
			if(operation.position.length > 0){
				x = valueToPosition(operation.position[0], rt_element.canvas.width)
				if(operation.position.length > 1){
					y = valueToPosition(operation.position[1], rt_element.canvas.height)
				}
			}
		}
	} 
	if (x == Number.MAX_VALUE){
		x = rt_element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y = rt_element.canvas.height / 2
	}
	
	var align
	if("align" in element){
		align = element.align
	} else {
		align = ["center","center"]
	}
	
	var x_align, y_align
	
	if(align[0] in x_alignment){
		x_align = x_alignment[align[0]]
	} else {
		x_align = x_alignment.center
	}
	
	if(align[1] in y_alignment){
		y_align = y_alignment[align[1]]
	} else {
		y_align = y_alignment.center
	}
	
	var meta ={}
	state["x"] = x += rt_element.imageinfo.width * x_align
	state["y"] = y += rt_element.imageinfo.height * y_align

	updateMoveState(rt_element, rt_operation)

}

function nextMoveState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	state.x = (state.x + speed.hspeed) %  meta.width 
	state.y = (state.y + speed.vspeed) %  meta.height
	updateMoveState(rt_element, rt_operation)
}

function updateMoveState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getMoveVector(state.x_pos, meta.width, rt_element.canvas.width)
	state["y_vector"] = getMoveVector(state.y_pos, meta.height, rt_element.canvas.height)
}

function getMoveVector(pos,image_size,canvas_size){
	var vector = []
	var  p = pos
	while (p < canvas_size){
		if(p+image_size > 0){
			vector.push(p)
		}
		p+= canvas_size
	}
	return vector
}

function clear(context,element, operation){
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
}

function fixed(rt_element, rt_operation){
	if(!rt_operation.initialized){
		newFixedState(rt_element, rt_operation)
		rt_operation.initialized = true;
	var meta = rt_operation.meta
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
	context.drawImage(
			rt_element.imageinfo.image, meta.x, meta.y)
	}
// if(rt_element.configuration.image.startsWith("button_home")){
// console.log("drawing "+rt_element.configuration.image)
// console.log("overCanvas "+ overCanvas)
// }
}

function newFixedState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	var canvas = rt_element.canvas
	var position, align
	if("position" in operation){
		position = operation.position
	} else {
		position = ["50%","50%"]
	}
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if(Array.isArray(operation.position)){
		if(operation.position.length > 0){
			x = valueToPosition(operation.position[0], rt_element.canvas.width)
			if(operation.position.length > 1){
				y = valueToPosition(operation.position[1], rt_element.canvas.height)
			} else {
				y = valueToPosition("50%", rt_element.canvas.height)					
			}
		} else {
			x = valueToPosition("50%", rt_element.canvas.width)					
			y = valueToPosition("50%", rt_element.canvas.height)								
		}
	}
	
	if (x == Number.MAX_VALUE){
		x = rt_element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y =  rt_element.canvas.height / 2
	}
	
	if("align" in element){
		align = element.align
	} else {
		align = ["center","center"]
	}
	
	var x_align, y_align
	
	if(align[0] in x_alignment){
		x_align = x_alignment[align[0]]
	} else {
		x_align = x_alignment.center
	}
	
	if(align[1] in y_alignment){
		y_align = y_alignment[align[1]]
	} else {
		y_align = y_alignment.center
	}
	
	var meta ={}
	meta["x"] = x += rt_element.imageinfo.width * x_align
	meta["y"] = y += rt_element.imageinfo.height * y_align
	
	rt_operation.meta  = meta
}

function marquee(rt_element, rt_operation){
	if(!rt_operation.initialized){
		newMarqueeState(rt_element, rt_operation)
		rt_operation.initialized = true;
	var meta = rt_operation.meta
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
	context.drawImage(
			rt_element.imageinfo.image, meta.x, meta.y)
	}
}

function newMarqueeState(rt_element, rt_operation){
	var dx = .1
	var dy = 0
	
	if(rt_operation.speed){
		dx = rt_operation.speed[0]
		dy = rt_operation.speed[1]
	}
	
	var fill = "#000000"
		if(rt_operation.fill){
			fill = rt_operation.fill
		}
	
	var stroke = "#000000"
		if(rt_operation.stroke){
			stroke = rt_operation.stroke
		}
	marquee =
		'<svg>'+
			'<text text-anchor="start" x="0%" y="50%" '+
				'dy="'+dy+'" dx="'+dx+'" '
				'class="text" font-family="sans-serif"'+
				' stroke="'+stroke+'" fill="'+fill+'">'+
				rt_operation.text+
			'</text>'+
    	'</svg>'

	
}

function pan(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextPanState(rt_element, rt_operation)
	} else {
		newPanState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	for(var x_ix in state.x_vector){
		for(var y_ix in state.y_vector){
			context.drawImage(
					rt_element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
		}
	}
}

function newPanState(rt_element, rt_operation){
	var state = {}
	state["x"] = 0
	state["y"] = 0
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_element.imageinfo.width
	meta["height"] =  rt_element.imageinfo.height
	rt_operation["meta"] = meta
	updatePanState(rt_element, rt_operation)
}

function nextPanState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	state["x"] = (state.x + speed.hspeed) %  meta.width 
	state["y"] = (state.y + speed.vspeed) %  meta.height
	updatePanState(rt_element, rt_operation)
}

function updatePanState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getPositionVector(state.x_pos, meta.width, rt_element.canvas.width)
	state["y_vector"] = getPositionVector(state.y_pos, meta.height, rt_element.canvas.height)
}

function getPositionVector(pos,image_size,canvas_size){
	var p = pos
	var vector = []
	while (p < canvas_size){
		vector.push(p)
		p += image_size
	}
	return vector
}

function fill(rt_element, rt_operation){
	var context = rt_operation.context
	var operation = rt_operation.configuration 
	if(operation.color){
		context.fillStyle = operation.color
	} else {
		context.fillStyle = 'purple'
	}
	if(operation.shape){
		var shape = operation.shape
		var func = shape["function"]
		var callParms = []
		if(shape.parms){
			callParms = shape.parms.slice(0)
		} else if (shape.borders){
			var borders = shape.borders
			callParms.push(borders[0])
			callParms.push(borders[1])
			var width = context.canvas.width
			var height = context.canvas.height
			callParms.push(context.canvas.width - borders[2] - borders[0])
			callParms.push(context.canvas.height - borders[3] - borders[1])
		}
		var f = context[func]
		context[func].apply(context, callParms)
	} else {
		context.fillRect(0,0,context.canvas.width,context.canvas.height)
	}
	
}

function show(rt_element, rt_operation){
	var operation = rt_operation.configuration
	rt_element.show = operation.canvas.indexOf(overCanvas) >= 0
	if(!rt_element.show){
		rt_operation.initialized = false
	}
}

function show_overlay(rt_element, rt_operation){
	if(overCanvas == rt_element.name){
		var operation = rt_operation.configuration
		var canvas = operation.canvas
		for(var ix in canvas){
			var oName = canvas[ix]
			var rt_overlay = runtime[oName]
			if(!rt_overlay.show){
				rt_overlay.operation.fixed.initialized = false
			}
			rt_overlay.show = true
		}
	}
}

function sound(rt_element, rt_operation){
	var state 
	if(rt_operation.initialized){
		nextSoundState(rt_element, rt_operation)
	} else {
		newSoundState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
}

function newSoundState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	rt_operation["state"] = {}
	rt_operation.state["sound_iteration"] = 0
	rt_operation.state["current_audio"] =  rt_operation.audios[rt_operation.state.sound_iteration]
	rt_operation.state["switch_audio"] =  rt_operation.switch_audio
	rt_operation.state.current_audio.play()
	console.log("Playing "+rt_operation.state.current_audio.getAttribute("src"))
}

function nextSoundState(rt_element, rt_operation){
	if(rt_operation.state.switch_audio){
		rt_operation.state.current_audio.pause()
		rt_operation.state.switch_audio = false
		if(rt_operation.state.sound_iteration < 0){
			rt_operation.state.sound_iteration = 0
		} else {
			rt_operation.state.sound_iteration ++
		}
		if(rt_operation.state.sound_iteration < rt_operation.audios.length){
			rt_operation.state.current_audio = operation.audios[rt_operation.state.sound_iteration]
			rt_operation.state.current_audio.play()
			console.log("Playing "+rt_operation.state.current_audio.getAttribute("src")+"("+rt_operation.state.sound_iteration+")")
		} 
		if(operation.loop){
			rt_operation.state.sound_iteration = 0
			rt_operation.state.current_audio = rt_operation.audios[rt_operation.state.sound_iteration]
			rt_operation.state.current_audio.play()
			console.log("Replaying "+rt_operation.state.current_audio.getAttribute("src"))
		}
	}
}

function sound_inactivation(rt_element, rt_operation){
	if(rt_operation.state.current_audio.ended ){
		
	} else {
		rt_operation.state.current_audio.pause()
		rt_operation.state.current_audio.current_time = 0
	}
	rt_operation.state.sound_iteration = -1
}

function switchAudio(rt_element, rt_operation){
	var operation = rt_operation.configuration
	if(!operation.loop){
		console.log("Sound Switch")
		rt_operation.state["switch_audio"] = true
		// Don't wait for next interval
		nextSoundState(rt_element, rt_operation)
	} else {
		console.log("Sound loop")
	}
}
