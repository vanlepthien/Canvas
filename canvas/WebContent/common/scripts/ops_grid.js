'use strict'
/**
 * 
 * Shared canvas grid
 * 
 */

ops = ops || {}

ops.grid = {
	default_fields:  ["width","height","x","y"],

	 run : function(rt_operation) {
		 if(rt_operation.terminate){
			 ops.grid.inactivate(rt_operation)
			 return
		 }
		 if (rt_operation.initialized) {
			 ops.grid.nextState(rt_operation)
		 } else {
			 ops.grid.newState(rt_operation)
			 rt_operation.initialized = true;
		 }
				
		 var state = rt_operation.state
		
// for(var row = 0; row < rt_operation.rows; row ++ ){
// for(var column = 0; column < rt_operation.columns; column ++ ){
// ops.grid.draw(rt_operation,row,column)
// }
// }
		
		 state.previous_grid = ops.grid.clone_grid(state.grid)
	 },

	nextState : function(rt_operation) {
		var meta = rt_operation.meta
		var state = rt_operation.state
		
	},

	newState : function(rt_operation) {

		var canvas = rt_operation.canvas

		var state = rt_operation.state || {}
		state.tick = tick
		state.time = getCurrentTime()
		state.width = rt_operation.width
		state.height = rt_operation.height

		rt_operation.state = state
		
		var canvas = rt_operation.canvas
		var position, align
		if ("position" in rt_operation) {
			position = rt_operation.position
		} else {
			position = [ "50%", "50%" ]
			rt_operation.position = position
		}


		var meta = rt_operation.meta  || {}
		
		var xy = util.getInitialPosition(rt_operation)
		state.x = meta.x = xy[0]
		state.y = meta.y = xy[1]
		
		state.grid = rt_operation.initialize(rt_operation)
		delete state.previous_grid 
		
		meta.cell_width = rt_operation.width / rt_operation.rows
		meta.cell_height = rt_operation.height / rt_operation.columns

		rt_operation.meta = meta
		
		for(var row = 0; row < rt_operation.rows; row ++ ){
			for(var column = 0; column < rt_operation.columns; column ++ ){
				ops.grid.draw(rt_operation,row,column)
			}
		}

	},
	
	inactivate : function(rt_operation) {
		rt_operation.initialized = false
		rt_operation.active = false
		rt_operation.terminate = false
		delete rt_operation.previous
		if(rt_operation.context){
			rt_operation.context.clearRect(0, 0, rt_operation.canvas.width, rt_operation.canvas.height)
		}
	},
	
	draw: function(rt_operation,r,c){
		var cell = rt_operation.state.grid[r][c]
		if(rt_operation.state.previous_grid){
			var pCell = rt_operation.state.previous_grid[r][c] 
			var same = true
			for(var k in cell){
				if(k == "state"){ // state doesn't affect display
					continue
				}
				same = cell[k] == pCell[k]
				if(!same){
					break
				}
			}
			if(same){
				return false
			}
		}
		
		var meta  = rt_operation.meta
		var grid = rt_operation.state.grid
		var w = meta.cell_width
		var h = meta.cell_height
		var x_pos = meta.x + c * w
		var y_pos = meta.y + r * h

		var imagemap = RuntimeImage()
		var images = Images()
		var image_name = imagemap[cell.image].images[0].name
		var image_type = imagemap[cell.image].images[0].type
		var image_url = imagemap[cell.image].images[0].url
		if(image_type == 'svg'){
			var image_def = images[image_url]
			var svg = image_def.imageinfo.svg
			if(cell.template){
				var svg_html = svg.outerHTML
				var temp_svg = $(svg_html)[0]
				var templates = Templates()
				var templateSet = templates[cell.template]
				var template
				if(templateSet){
					template = templateSet[0]
					for(var key in template){
						var t = template[key]
						var element_id = t.element
						util[t.method](temp_svg,element_id,t,cell.value,rt_operation)
					}
					util.loadSVGToImage(temp_svg, function(image){
						rt_operation.context.drawImage(image,x_pos,y_pos)
					})
				}
			} else {
				if(svg.img){
					rt_operation.context.drawImage(svg.img, x_pos,y_pos)
				} else {
					util.loadSVGToImage(svg, function(image){
						rt_operation.context.drawImage(image,x_pos,y_pos)
					})
				}
				
			}
		}
// rt_operation.context.clearRect(x_pos,y_pos,w,h)
		
	},	
	
	getCell: function(rt_operation){
		var x_grid = rt_operation.state.x
		var y_grid = rt_operation.state.y
		var width_grid = rt_operation.meta.width
		var height_grid = rt_operation.meta.height
		var x_click = rt_operation.state.click.x
		var y_click = rt_operation.state.click.y
		var x = x_click - x_grid
		var y = y_click - y_grid
		if(x < 0 || x >= width_grid){
			return null
		}
		if(y < 0 || y >= height_grid){
			return null
		}
		var row = Math.floor(y / rt_operation.meta.cell_height)
		var column = Math.floor(x / rt_operation.meta.cell_width)
		return [row, column]
	},
	
	clone_grid: function(grid){
		var clone = []
		for(var r in grid){
			clone[r] = []
			var row = grid[r] 
			for (var c in grid[r]){
				clone[r][c] = {}
				var cell = row[c]
				for(var key in cell){
					clone[r][c][key] = cell[key]
				}
			}
		}
		return clone
	}
}

