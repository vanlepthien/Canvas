'use strict'

ops.svg = {
	default_fields : [ "width", "height", "x", "y", "z", "theta" ],

	run : function(rt_operation) {
		if(rt_operation.terminate){
			ops.svg.inactivate(rt_operation)
			return
		}
	
		if (rt_operation.initialized) {
			ops.svg.nextState(rt_operation)
		} else {
			ops.svg.newState(rt_operation)
			rt_operation.initialized = true
		}
// util.setImageState(rt_operation)
		ops.svg.updateState(rt_operation)
		var state = rt_operation.state
		var fields = ops.svg.default_fields
		if(state.fields){
			fields = fields.concat(state.fields)
		}
		if(util.redraw(rt_operation, fields)){
			ops.svg.redraw_image(rt_operation)
		}
	},

	newState : function(rt_operation) {
		
		var svg_elements = SVG()
		var operation = Operation()
		
		var state = rt_operation.state || {}
		rt_operation.state = state
				
	    var meta = rt_operation.meta || {}
		rt_operation.meta = meta
		
		var speed = util.get3DSpeed(rt_operation)
		state.xspeed = speed.xspeed
		state.yspeed = speed.yspeed
		state.zspeed = speed.zspeed

		state.rotation = rt_operation.rotation || 0
		state.rotation_speed = rt_operation.rotation_speed || 0
		
		var svg = $(svg_elements[rt_operation.svg].xml)
	
		var cimage = new CImage(svg)

		meta.cimage = cimage
		meta.id = "#"+rt_operation.name

		var svg_size = cimage.getSVGSize()
		
		state.width = rt_operation.width || svg_size[0]
		state.height = rt_operation.height || svg_size[1]

		var xyz = util.getInitial3DPosition(rt_operation)
		state.x = xyz[0]
		state.y = xyz[1]
		state.z = xyz[2]

		state.tick = tick

		state.time = getCurrentTime()
		
		state.display = true

		meta.interval = rt_operation.interval || 10
	},

	nextState : function(rt_operation) {
		var state = rt_operation.state
		var meta = rt_operation.meta
	},

	updateState : function(rt_operation) {
		var state = rt_operation.state
		var meta = rt_operation.meta
        if(rt_operation.action){
            rt_operation.action(rt_operation)
        } else{
            var speed = util.get3DSpeed(rt_operation)
            state.xspeed = speed.xspeed
            state.yspeed = speed.yspeed
            state.zspeed = speed.zspeed
            state.x = (state.x + speed.xspeed) % global_dimensions.width
            state.y = (state.y + speed.yspeed) % global_dimensions.height
            state.z = state.z + speed.zspeed
            var rotationSpeed = util.getRotationSpeed(rt_operation)
            state.rotation = state.rotation + rotationSpeed
        }
		state.x_pos = state.x
		if (state.x_pos > 0) {
			state.x_pos -= global_dimensions.width
		}
		state.y_pos = state.y
		if (state.y_pos > 0) {
			state.y_pos -= global_dimensions.width
		}

		state.x_vector = ops.svg.getVector(state.x_pos, state.width,
		        global_dimensions.width)
		state.y_vector = ops.svg.getVector(state.y_pos, state.height,
		        global_dimensions.height)
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
	},
	
	redraw_image: function(rt_operation){
		var operation = Operation()
        var state = rt_operation.state
        var meta = rt_operation.meta
		var cimage = meta.cimage
		cimage.setSize(state.width,state.height)
		cimage.setXYZ(state.x,state.y,state.z)
		cimage.updateSVG()
		if(!meta.svg_id){
		    var svg = cimage.svg
		    $(svg).attr("id", rt_operation.name)
		    meta.svg_id = "#"+rt_operation.name
		    $("body").append(svg)
		}
	},

}
