'use strict'

ops.movecanvas = {
	default_fields : [ "image_ix", "width", "height", "x", "y", "z", "theta" ],

	run : function(rt_operation) {
		if(rt_operation.terminate){
			ops.move.inactivate(rt_operation)
			return
		}
	
		if (rt_operation.initialized) {
			ops.move.nextState(rt_operation)
		} else {
			ops.move.newState(rt_operation)
			rt_operation.initialized = true
		}
		util.setImageState(rt_operation)
		ops.movecanvas.updateState(rt_operation)
		var state = rt_operation.state
		var fields = ops.move.default_fields
		if(state.fields){
			fields = fields.concat(state.fields)
		}
		if(util.redraw(rt_operation, fields)){
			if(!ops.movecanvas.redraw_canvas(rt_operation)){
				ops.movecanvas.redraw_image(rt_operation)
			}
// util.getElementImage(rt_operation, state.image_ix,
// function(img){
// var rt_operation = img.rt_operation
// var context = rt_operation.context
// context.globalAlpha = 1.0
//							
// var state = rt_operation.state
// var previous = rt_operation.previous
//				
// if (previous) {
// if (rt_operation.cycle) {
// for ( var x_ix in state.x_vector) {
// for ( var y_ix in state.y_vector) {
// var clear_x = state.x_vector[x_ix] - (5+Math.abs(state.xspeed))
// var clear_y = state.y_vector[y_ix] - (5+Math.abs(state.yspeed))
// var clear_width = previous.width * 2*(5+Math.abs(state.xspeed))
// var clear_height = previous.height * 2*(5+Math.abs(state.yspeed))
//									
// console.log("clear "+rt_operation.name+": ("+clear_x+", "+clear_y+", "+
// (clear_x+clear_width)+", "+(clear_y+clear_height)+")")
// context.clearRect(clear_x, clear_y, clear_width, clear_height)
// }
// }
// } else {
// context.clearRect(
// previous.x - (5+Math.abs(state.xspeed)),
// previous.y - (5+Math.abs(state.yspeed)),
// previous.width + 2*(5+Math.abs(state.xspeed)),
// previous.height +2*(5+Math.abs(state.yspeed)))
// }
// } else {
// context.clearRect(
// state.x - (5+Math.abs(state.xspeed)),
// state.y - (5+Math.abs(state.yspeed)),
// state.width + 2*(5+Math.abs(state.xspeed)),
// state.height + 2*(5+Math.abs(state.yspeed))
// )
// }
//				
// if (rt_operation.cycle) {
// for ( var x_ix in state.x_vector) {
// for ( var y_ix in state.y_vector) {
// var draw_x = state.x_vector[x_ix]
// var draw_y = state.y_vector[y_ix]
// var draw_width = state.width
// var draw_height = state.height
// console.log("draw "+rt_operation.name+": ("+draw_x+", "+draw_y+","+
// draw_width+", "+draw_height+")")
// context.drawImage(img, state.x_vector[x_ix],state.y_vector[y_ix])
// }
// }
// } else {
// context.drawImage(img, state.x, state.y)
// }
// }
// )
		}
	},

	newState : function(rt_operation) {
		
		var cimages = CImages()
		var runtime_images = RuntimeImage()
		var images = Images()

		var state = rt_operation.state || {}
		
		state.images = state.images || {}

		var speed = util.get3DSpeed(rt_operation)
		state.xspeed = speed.xspeed
		state.yspeed = speed.yspeed
		state.zspeed = speed.zspeed

		state.rotation = rt_operation.rotation || 0
		state.rotation_speed = rt_operation.rotation_speed || 0

		var rt_image = runtime_images[rt_operation.imageset]
		
		for (var key in rt_image.images){
			var iInfo = rt_image.image[key]
			var fileName = iInfo.name
			var iWidth = iInfo.width
			var iHeight = iInfo.height
			var iUrl = iInfo.url
			if(cimages[iUrl]){
				state.images[key] = cimages[iUrl]
			} else {
				var image = images[iURL]
				if(image.type != "svg"){
					console.log("CImage image must be SVG:")
					console.log("    ops.movecanvas.newstate: imageset["+
							rt_operation.imageset+"]["+key+"] url "+
							iUrl);
					throw "CImage image must be SVG. url: "+ iUrl
				}
				var cimage = new CImage(image.imageinfo.svg)
				state.cimages = state.cimages || []
				state.cimages.push(cimage)
			}
		}
		state.width = rt_operation.width 
		state.height = rt_operation.height

		var xyz = util.getInitial3DPosition(rt_operation)
		state.x = xyz[0]
		state.y = xyz[1]
		state.y = xyz[2]

		state.tick = tick

		state.time = getCurrentTime()

		state.image_ix = 0;

		rt_operation.state = state

		var meta = rt_operation.meta || {}
		meta.interval = 10
		if (rt_operation.interval) {
			meta.interval = rt_operation.interval
		}
		rt_operation.meta = meta

	},

	nextState : function(rt_operation) {
		var state = rt_operation.state
		var meta = rt_operation.meta
		var speed = util.get3DSpeed(rt_operation)
		state.xspeed = speed.xspeed
		state.yspeed = speed.yspeed
		state.zspeed = speed.zspeed
		state.x = (state.x + speed.xspeed) % rt_operation.canvas.width
		state.y = (state.y + speed.yspeed) % rt_operation.canvas.height
		state.z = state.z + speed.zspeed
		var rotationSpeed = util.getRotationSpeed(rt_operation)
		state.rotation = state.rotation + rotationSpeed
		var image_cnt = Object.keys(rt_operation.image.images).length
		state.image_ix = util.nextImageIx(state, meta.interval, image_cnt)
	},

	updateState : function(rt_operation) {
		var state = rt_operation.state
		var meta = rt_operation.meta
		state.x_pos = state.x
		if (state.x_pos > 0) {
			state.x_pos -= rt_operation.canvas.width
		}
		state.y_pos = state.y
		if (state.y_pos > 0) {
			state.y_pos -= rt_operation.canvas.width
		}

		state.x_vector = ops.move.getVector(state.x_pos, state.width,
				rt_operation.canvas.width)
		state.y_vector = ops.move.getVector(state.y_pos, state.height,
				rt_operation.canvas.height)
	},

	getVector : function(pos, image_size, canvas_size) {
		var vector = []
		var p = pos
		while (p < canvas_size) {
			if (p + image_size > 0) {
				vector.push(p)
			}
			p += canvas_size
		}
		return vector
	},

	inactivate : function(rt_operation) {
		rt_operation.initialized = false
		rt_operation.active = false
		rt_operation.terminate = false
		delete rt_operation.previous
		if (rt_operation.context) {
			rt_operation.context.clearRect(0, 0, rt_operation.canvas.width,
					rt_operation.canvas.height)
		}
	},
	
	redraw_canvas: function(rt_operation){
		var previous = rt_operation.previous
		var state = rt_operation.state
		var change = []
		if(previous.x != state.x || previous.y != state.y){
			change.push("xy")
		}
		if(previous.z != state.z){
			if (change.length > 0) {
				return false
			}
			change.push("z")
		}
		if(previous.rotation != state.rotation){
			if (change.length > 0) {
				return false
			}
			change.push("rotation")
		}
		var option = change[0] 
		switch(option){
		case "xy":
			{
			var dx = (state.x  - previous.x) * (1 / z)
			var dy = (state.y - previous.y) * (1 / z)
			state.canvas_position.x = previous.canvas_position.x + dx
			state.canvas_position.y = previous.canvas_position.y + dy
			var ctx = rt_operation.canvas.context
			
			// TODO Put stuff here
			ctx(save)
			return true
			}
		case "z":
			{
			var dz = (state.z  - previous.z) 
			return true
			}
		case "rotation":
			{
			var dr = (state.r  - previous.r) 
			return true
			}
		default: {
			return true
			}
		}	
	},

	redraw_image: function(rt_operation){
		var operation = Operation()
		var templates = Templates()
		var state = rt_operation.state
		var cimage = state.cimages[state.imageIx]
		var template = null
		if(templates[operation[rt_operation.name]]){
			var template = templates[operation[rt_operation.name]][state.imageIx] ||templates[operation[rt_operation.name]][0]||null
		}
		cimage.setSize(state.width,state.height)
		cimage.getImage(template,
			function(image){
				var context = rt_operation.context
				if(rt_operation.previous){
					previous =rt_operation.previous
					context.clearRect(previous.drawarea.x,previous.drawarea.y,previous.drawarea.width,previous.drawarea.height)
				} else {
					context.clearRect(0, 0, rt_operation.canvas.width,
							rt_operation.canvas.height)
				}
			}
		)
	},

}
