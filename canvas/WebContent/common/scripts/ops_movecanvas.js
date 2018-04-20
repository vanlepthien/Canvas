'use strict'

ops.movecanvas = {
	default_fields : [ "image_ix", "width", "height", "x", "y", "z", "theta" ],

	run : function(rt_operation) {
		if(rt_operation.terminate){
			ops.movecanvas.inactivate(rt_operation)
			return
		}
	
		if (rt_operation.initialized) {
			ops.movecanvas.nextState(rt_operation)
		} else {
			ops.movecanvas.newState(rt_operation)
			rt_operation.initialized = true
		}
		util.setImageState(rt_operation)
		ops.movecanvas.updateState(rt_operation)
		var state = rt_operation.state
		var fields = ops.movecanvas.default_fields
		if(state.fields){
			fields = fields.concat(state.fields)
		}
		if(util.redraw(rt_operation, fields)){
			ops.movecanvas.redraw_image(rt_operation)
		}
	},

	newState : function(rt_operation) {
		
		var cimages = CImages()
		var runtime_images = RuntimeImage()
		var images = Images()
		var operation = Operation()
		
		var state

		if(rt_operation.state) {
			state = rt_operation.state
		} else {
			state = {}
			rt_operation.state = state
		}
		
		state.images = state.images || {}

		var speed = util.get3DSpeed(rt_operation)
		state.xspeed = speed.xspeed
		state.yspeed = speed.yspeed
		state.zspeed = speed.zspeed

		state.rotation = rt_operation.rotation || 0
		state.rotation_speed = rt_operation.rotation_speed || 0

		var rt_image = runtime_images[operation[rt_operation.name].imageset]
		
		for (var key in rt_image.images){
			var iInfo = rt_image.images[key]
			var fileName = iInfo.name
			var iWidth = iInfo.width
			var iHeight = iInfo.height
			var iURL = iInfo.url
			if(cimages[iURL]){
				state.images[key] = cimages[iURL]
			} else {
				var image = images[iURL]
				if(image.type != "svg"){
					console.log("CImage image must be SVG:")
					console.log("    ops.movecanvas.newstate: imageset["+
							rt_operation.imageset+"]["+key+"] url "+
							iURL);
					throw "CImage image must be SVG. url: "+ iURL
				}
				var cimage = new CImage(image.imageinfo.svg)
				if(iWidth && iHeight){
					cimage.setSize(iWidth,iHeight)
				}
				state.cimages = state.cimages || []
				state.cimages.push(cimage)
			}
		}
		
		var svg_size = state.cimages[0].getSize()
		
		state.width = rt_operation.width || svg_size[0]
		state.height = rt_operation.height || svg_size[1]

		var xyz = util.getInitial3DPosition(rt_operation)
		state.x = xyz[0]
		state.y = xyz[1]
		state.z = xyz[2]

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

		state.x_vector = ops.movecanvas.getVector(state.x_pos, state.width,
				rt_operation.canvas.width)
		state.y_vector = ops.movecanvas.getVector(state.y_pos, state.height,
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
			if(typeof rt_operation.clear == 'undefined' || rt_operation.clear){
				rt_operation.context.clearRect(0, 0, rt_operation.canvas.width,
					rt_operation.canvas.height)
			}
		}
	},
	
	redraw_canvas: function(rt_operation){
		var previous = rt_operation.previous
		var state = rt_operation.state
		var change = []
		if(drawarea.x != state.x || drawarea.y != state.y){
			change.push("xy")
		}
		if(drawarea.z != state.z){
			if (change.length > 0) {
				return false
			}
			change.push("z")
		}
		if(drawarea.rotation != state.rotation){
			if (change.length > 0) {
				return false
			}
			change.push("rotation")
		}
		var option = change[0] 
		switch(option){
		case "xy":
			{
			var dx = (state.x  - drawarea.x) * (1 / z)
			var dy = (state.y - drawarea.y) * (1 / z)
			state.canvas_position.x = drawarea.canvas_position.x + dx
			state.canvas_position.y = drawarea.canvas_position.y + dy
			var ctx = rt_operation.canvas.context
			
			// TODO Put stuff here
			// ctx(save)
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
		var cimage = state.cimages[state.image_ix]
		var template = null
		if(templates[operation[rt_operation.name]]){
			var template = templates[operation[rt_operation.name]][state.image_ix] ||templates[operation[rt_operation.name]][0]||null
		}
		cimage.setSize(state.width,state.height)
		cimage.setXYZ(state.x,state.y,state.z)
		cimage.getImage(template,
			function(status,image){
				var context = rt_operation.context
				if(typeof rt_operation.clear == 'undefined' || rt_operation.clear){
					context.clearRect(0, 0, rt_operation.canvas.width,
						rt_operation.canvas.height)
				}
				var state = rt_operation.state
				state.drawarea = {}
				var drawarea = state.drawarea
				drawarea.x = state.x
				drawarea.y = state.y
				drawarea.width = image.width
				drawarea.height = image.height
				context.drawImage(image, drawarea.x, drawarea.y)
			}
		)
	},

}
