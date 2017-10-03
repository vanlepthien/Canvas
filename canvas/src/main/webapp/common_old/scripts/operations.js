/**
 * 
 */
'use strict'

function bounce(rt_operation){
	if(rt_operation.initialized){
		nextBounceState(rt_operation)
	} else {
		newBounceState(rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_operation.canvas.width,rt_operation.canvas.height)
	context.drawImage(rt_operation.imageinfo[0].image, state.x, state.y)
}

function newBounceState(rt_operation){
	
	// [x,y] are the coordinates of the top left corner
	// x_left = x
	// x_right = x + imageinfo[0].width
	// y_top = y
	// y_bottom = y + imageinfo[0].height
	var top, bottom
	var operation = rt_operation.configuration
	var element = rt_operation.configuration
	if("top" in operation){
		top = valueToPosition(operation.top, rt_operation.canvas.height)
	} else {
		top = valueToPosition("20%", rt_operation.canvas.height)
	}
	if("bottom" in operation){
		bottom = valueToPosition(operation.bottom, rt_operation.canvas.height)
	} else {
		bottom = valueToPosition("80%", rt_operation.canvas.height)
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
		var xy = getPosition(rt_operation)
		if(x == null) {
			x = xy[0]
			x = getAlignedPosition(x, rt_operation.imageinfo[0].width, align[0], x_alignment)
		}
		if(y == null){
			y = xy[1]
			y = getAlignedPosition(y, rt_operation.imageinfo[0].height, align[1], y_alignment)
		}
		
	}
	
	if (x == null){
		x = element.canvas.width / 2
	}
	if (y == null){
		y = (top + bottom) / 2
	}
	
	
	
	var x_left = x 
	var x_right = x + rt_operation.imageinfo[0].width
	var y_top = y
	var y_bottom = y + rt_operation.imageinfo[0].height
	
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

function nextBounceState(rt_operation){
// Less is more in the y direction
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_operation)
	
	var x = state.x + speed.hspeed
	var y = state.y + (state.direction * speed.vspeed)
	
	var x_left = x 
	var x_right = x + rt_operation.imageinfo[0].width
	var y_top = y
	var y_bottom = y + rt_operation.imageinfo[0].height

	
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

function move(rt_operation){
	if(rt_operation.initialized){
		nextMoveState(rt_operation)
	} else {
		newMoveState(rt_operation)
		rt_operation.initialized = true
	}
	var operation = rt_operation.configuration
	var state = rt_operation.state
	var meta = rt_operation.meta
	var context = rt_operation.context
	context.clearRect(0,0,rt_operation.canvas.width,rt_operation.canvas.height)
	
	var image_ix = nextImageIx(state, meta.interval, rt_operation.imageinfo.length)
	var image = getElementImage(rt_operation, image_ix)
	image.crossOrigin = 'Anonymous';
	if(operation.cycle){
		for(var x_ix in state.x_vector){
			for(var y_ix in state.y_vector){
				context.drawImage(image, state.x_vector[x_ix], state.y_vector[y_ix])
			}
		}
	} else {
		context.drawImage(image, state.x, state.y)
	}
}

function newMoveState(rt_operation){
	var operation = rt_operation.configuration
	var element = rt_operation.configuration
	var state = {}
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_operation.canvas.width
	meta["height"] =  rt_operation.canvas.height
	meta["imagewidth"] =  rt_operation.imageinfo[0].width
	meta["imageheight"] =  rt_operation.imageinfo[0].height
	meta["interval"] = 10
	if(element.interval){
		meta["interval"] = element.interval
	} 
	rt_operation["meta"] = meta
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if("position" in operation){
		if(Array.isArray(operation.position)){
			if(operation.position.length > 0){
				x = valueToPosition(operation.position[0], rt_operation.canvas.width)
			}
			if(operation.position.length > 1){
				y = valueToPosition(operation.position[1], rt_operation.canvas.height)
			}
		}
	} 
	if (x == Number.MAX_VALUE){
		x = rt_operation.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y = rt_operation.canvas.height / 2
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
	
//	var meta ={}
	state["x"] = x += rt_operation.imageinfo[0].width * x_align
	state["y"] = y += rt_operation.imageinfo[0].height * y_align
	
	state["tick"] = tick

	updateMoveState(rt_operation)

}

function nextMoveState(rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_operation)
	state.x = (state.x + speed.hspeed) %  meta.width 
	state.y = (state.y + speed.vspeed) %  meta.height
	updateMoveState(rt_operation)
}

function updateMoveState(rt_operation){
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
	
	state["x_vector"] = getMoveVector(state.x_pos, meta.width, rt_operation.canvas.width)
	state["y_vector"] = getMoveVector(state.y_pos, meta.height, rt_operation.canvas.height)
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
	context.clearRect(0,0,rt_operation.canvas.width,rt_operation.canvas.height)
}

function fixed(rt_operation){
	if(rt_operation.initialized){ 
		nextFixedState(rt_operation)
	}else {
		newFixedState(rt_operation)
		rt_operation.initialized = true;
	}
	var meta = rt_operation.meta
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_operation.canvas.width,rt_operation.canvas.height)
	var image_ix = nextImageIx(state, meta.interval, rt_operation.imageinfo.length)
	var image = getElementImage(rt_operation, image_ix)
	context.drawImage(image, meta.x, meta.y)
	
// if(rt_operation.configuration.image.startsWith("button_home")){
// console.log("drawing "+rt_operation.configuration.image)
// console.log("overCanvas "+ overCanvas)
// }
}
	
function nextFixedState(rt_operation){
	var meta = rt_operation.meta
	var state = rt_operation.state
	var element = rt_operation.configuration
		
}

function nextImageIx(state, interval, count){
	if(count <= 1){
		return 0
	}
	var elapsed = tick - state.tick
	if(count * interval < elapsed){
			state.tick = tick
	}
	return Math.floor((elapsed / interval)) % count

}

function newFixedState(rt_operation){
	var operation = rt_operation.configuration
	var element = rt_operation.configuration
	var canvas = rt_operation.canvas
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
			x = valueToPosition(operation.position[0], rt_operation.canvas.width)
			if(operation.position.length > 1){
				y = valueToPosition(operation.position[1], rt_operation.canvas.height)
			} else {
				y = valueToPosition("50%", rt_operation.canvas.height)					
			}
		} else {
			x = valueToPosition("50%", rt_operation.canvas.width)					
			y = valueToPosition("50%", rt_operation.canvas.height)								
		}
	}
	
	if (x == Number.MAX_VALUE){
		x = rt_operation.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y =  rt_operation.canvas.height / 2
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
	meta["x"] = x += rt_operation.imageinfo[0].width * x_align
	meta["y"] = y += rt_operation.imageinfo[0].height * y_align
	
	if(element.interval){
		meta.interval = element.interval
	} else {
		meta["interval"] = 100
	}
	
	rt_operation.meta  = meta
	
	var state = {}
	state["image_ix"] = 0
	state["tick"] = tick
		
	rt_operation["state"] = state

}

function marquee(rt_operation){
	if(!rt_operation.initialized){
		newMarqueeState(rt_operation)
		rt_operation.initialized = true;
	var meta = rt_operation.meta
	var context = rt_operation.context
	context.clearRect(0,0,rt_operation.canvas.width,rt_operation.canvas.height)
	context.drawImage(
			rt_operation.imageinfo[0].image, meta.x, meta.y)
	}
}

function newMarqueeState(rt_operation){
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

function pan(rt_operation){
	if(rt_operation.initialized){
		nextPanState(rt_operation)
	} else {
		newPanState(rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	for(var x_ix in state.x_vector){
		for(var y_ix in state.y_vector){
			context.drawImage(
					rt_operation.imageinfo[0].image, state.x_vector[x_ix], state.y_vector[y_ix])
		}
	}
}

function newPanState(rt_operation){
	var state = {}
	state["x"] = 0
	state["y"] = 0
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_operation.imageinfo[0].width
	meta["height"] =  rt_operation.imageinfo[0].height
	rt_operation["meta"] = meta
	updatePanState(rt_operation)
}

function nextPanState(rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_operation)
	state["x"] = (state.x + speed.hspeed) %  meta.width 
	state["y"] = (state.y + speed.vspeed) %  meta.height
	updatePanState(rt_operation)
}

function updatePanState(rt_operation){
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
	
	state["x_vector"] = getPositionVector(state.x_pos, meta.width, rt_operation.canvas.width)
	state["y_vector"] = getPositionVector(state.y_pos, meta.height, rt_operation.canvas.height)
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

function fill(rt_operation){
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

function show(rt_operation){
	var operation = rt_operation.configuration
	rt_operation.show = operation.canvas.indexOf(overCanvas) >= 0
	if(!rt_operation.show){
		rt_operation.initialized = false
	}
}

function show_overlay(rt_operation){
	if(overCanvas == rt_operation.name){
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

function sound(rt_operation){
	var state 
	if(rt_operation.initialized){
		nextSoundState(rt_operation)
	} else {
		newSoundState(rt_operation)
		rt_operation.initialized = true
	}
}

function newSoundState(rt_operation){
	var operation = rt_operation.configuration
	rt_operation["state"] = {}
	rt_operation.state["sound_iteration"] = 0
	rt_operation.state["current_audio"] =  rt_operation.audios[rt_operation.state.sound_iteration]
	rt_operation.state["switch_audio"] =  rt_operation.switch_audio
	rt_operation.state.current_audio.play()
	console.log("Playing "+rt_operation.state.current_audio.getAttribute("src"))
}

function nextSoundState(rt_operation){
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

function sound_inactivation(rt_operation){
	if(rt_operation.state.current_audio.ended ){
		
	} else {
		rt_operation.state.current_audio.pause()
		rt_operation.state.current_audio.current_time = 0
	}
	rt_operation.state.sound_iteration = -1
}

function switchAudio(rt_operation){
	var operation = rt_operation.configuration
	if(!operation.loop){
		console.log("Sound Switch")
		rt_operation.state["switch_audio"] = true
		// Don't wait for next interval
		nextSoundState(rt_operation)
	} else {
		console.log("Sound loop")
	}
}

function video(rt_operation){
	var state 
	if(rt_operation.initialized){
		nextVideoState(rt_operation)
	} else {
		newVideoState(rt_operation)
		rt_operation.initialized = true
	}
}

function newVideoState(rt_operation){
	var operation = rt_operation.configuration
	rt_operation["state"] = {}
	rt_operation.state["video_iteration"] = 0
	rt_operation.state["current_video"] =  rt_operation.videos[rt_operation.state.video_iteration]
	rt_operation.state["switch_video"] =  rt_operation.switch_video
	rt_operation.state.current_video.play()
	console.log("Playing "+rt_operation.state.current_video.getAttribute("src"))
}

function nextVideoState(rt_operation){
	if(rt_operation.state.switch_video){
		rt_operation.state.current_video.pause()
		rt_operation.state.switch_video = false
		if(rt_operation.state.video_iteration < 0){
			rt_operation.state.video_iteration = 0
		} else {
			rt_operation.state.video_iteration ++
		}
		if(rt_operation.state.video_iteration < rt_operation.videos.length){
			rt_operation.state.current_video = operation.videos[rt_operation.state.video_iteration]
			rt_operation.state.current_video.play()
			console.log("Playing "+rt_operation.state.current_video.getAttribute("src")+"("+rt_operation.state.video_iteration+")")
		} 
		if(operation.loop){
			rt_operation.state.video_iteration = 0
			rt_operation.state.current_video = rt_operation.videos[rt_operation.state.video_iteration]
			rt_operation.state.current_video.play()
			console.log("Replaying "+rt_operation.state.current_video.getAttribute("src"))
		}
	}
}

function video_inactivation(rt_operation){
	if(rt_operation.state.current_video.ended ){
		
	} else {
		rt_operation.state.current_video.pause()
		rt_operation.state.current_video.current_time = 0
	}
	rt_operation.state.video_iteration = -1
}

function switchVideo(rt_operation){
	var operation = rt_operation.configuration
	if(!operation.loop){
		console.log("Video Switch")
		rt_operation.state["switch_video"] = true
		// Don't wait for next interval
		nextVideoState(rt_operation)
	} else {
		console.log("Video loop")
	}
}

/**
 * vimeo
 * @param rt_operation
 * @param rt_operation
 * @returns
 * 
 * Unlike most other operations, this just dynamically loads the video and 
 * runs when the 
 * 
 * Process:
 * 0. If video initialized, return
 * 1. If Vimeo player not loaded, create &lt;script&gt; element to load it
 * 2. Create &lt;iframe&gt; element for the video at the proper location
 * 3. Create a new player
 * 3.1 Add handlers (pause, ended, error)
 * 
 */
function vimeo(rt_operation){
	var state 
	if(rt_operation.initialized){
		return
	} 
	newVimeoState(rt_operation)
	rt_operation.initialized = true	
}

function newVimeoState(rt_operation){
	var element = rt_operation.configuration
	var operation = rt_operation.configuration
	
	if($("#iframes").length == 0){
		var text = "<div id='iframes'></div>"
		$("body").append(text)
	}
	var iframes = $("#iframes")
	
	var iframe_id = "vimeo_iframe_"+rt_operation.name
	
	$(iframes).append("<iframe id='"+iframe_id+"' ></iframe>")
	
	var iframe = $("#"+iframe_id)[0]
	
	var src = operation.video
	
	var options = []
	
	if(operation.autoplay){
		options.push("autoplay=1")
	}
	
	if(operation.autopause){
		options.push("autopause=1")
	} else {
		options.push("autopause=0")
	}
	
	if(options.length > 0){
		src += "?" + options.join()
	}
	
	var xy = getPosition(rt_operation)
	var left = xy[0]
	left = getAlignedPosition(left, operation.width, element.align[0], x_alignment)
	var top = xy[1]
	top = getAlignedPosition(top, operation.height, element.align[1], y_alignment)
	
	var width = operation.width || 640
	var height = operation.height || 360
	var top = top || 8
	var left = left || 8
	var frameborder = operation.frameborder || 0
	
	
	$(iframe).attr("rt_operation",rt_operation.name)
	$(iframe).attr("src",src)
	$(iframe).attr("width",width)
	$(iframe).attr("height",height)
	$(iframe).attr("frameborder",frameborder)
	$(iframe).attr("webkitallowfullscreen","webkitallowfullscreen")
	$(iframe).attr("webkitallowfullscreen","webkitallowfullscreen")
	$(iframe).attr("mozallowfullscreen","mozallowfullscreen")
	$(iframe).attr("allowfullscreen","allowfullscreen")
	$(iframe).css("position","absolute")
	$(iframe).css("top",top)
	$(iframe).css("left",left)
	$(iframe).css("z-index",1000)
	
	var meta = {}
	meta.iframe = iframe

	try{
		var player = new Vimeo.Player(iframe)
		meta.player = player
			
		if(operation.erase){
			player.on("ended",function(status){
				console.log("vimeo ended")
				console.log(status)
				var iframe = this.element
				var name = $(iframe).attr("rt_operation")
				$(iframe).remove()
				rt_operation = runtime[name]
				rt_operation = rt_operation.operations.vimeo
				rt_operation.initialized = false
			})
		}
		
		player.play();
	} catch(e){
		$(iframe).remove()
		console.log(e)
	}

}

function vimeo_inactivation(rt_operation){
	if(rt_operation.state.current_video.ended ){
		
	} else {
		rt_operation.state.current_video.pause()
		rt_operation.state.current_video.current_time = 0
	}
	rt_operation.state.video_iteration = -1
}
