'use strict'

util.getDefaultWidth = function() {
	if (defaults && defaults.canvas && defaults.canvas.width) {
		return defaults.canvas.width
	}
	return window.innerWidth
}

util.getDefaultHeight = function() {
	if (defaults && defaults.canvas && defaults.canvas.height) {
		return defaults.canvas.height
	}
	return window.innerHeight
}

var ca_table = {
	justification_map : {
		"left" : function(config, row, cell_ix) {
			ca_table.justify_left(config, row, cell_ix)
		},
		"center" : function(config, row, cell_ix) {
			ca_table.justify_center(config, row, cell_ix)
		},
		"right" : function(config, row, cell_ix) {
			ca_table.justify_right(config, row, cell_ix)
		},
		"justify" : function(config, row, cell_ix) {
			ca_table.justify_justify(config, row, cell_ix)
		},
	},

	defaults : {
		x : 0,
		y : 0,
		width : util.getDefaultWidth(),
		height : util.getDefaultHeight(),
		cell_width : 0,
		cell_height : 0,
		horizontal_spacing : 0,
		vertical_spacing : 0,
		justification : "left"
	},

	setVerticalSpacing : function(config) {
		var rows = Object.keys(config.rows)
		var n_rows = rows.length
		config.vertical_spacing = (config.height - config.cell_height * n_rows)
				/ (n_rows - 1)
	},

	setHorizontalSpacing : function(config) {
		config.max_row_cells = Math.max(Math.floor(config.width
				/ config.cell_width), 1)
		if (config.max_row_cells <= 1) {
			config.horizontal_spacing = 0
		}
		config.horizontal_spacing = (config.width - config.cell_width
				* config.max_row_cells)
				/ (config.max_row_cells - 1)
	},

	generate : function(config) {
		if (!config.vertical_spacing) {
			ca_table.setVerticalSpacing(config)
		}
		if (!config.horizontal_spacing) {
			ca_table.setHorizontalSpacing(config)
		}
		config.state = {
			ix : 0,
			x : config.x,
			y : config.y,
		}
		for ( var rowKey in config.rows) {
			config.state.key = rowKey
			ca_table.generate_row(config, config.rows, rowKey)
		}
	},

	generate_row : function(config, rows, key) {
		var row = rows[key]
		row.key = key
		ca_table.init_row(config, row)
		if (row.cells.length > config.max_row_cells) {
			throw "Too many cells: " + config.name + " row " + config.state.key
					+ ": max = " + config.max_row_cells + " found "
					+ row.cells.length
		}

		var justified = row.justification || config.justification || "justify"
		var justification = ca_table.justification_map[justified]

		for ( var cellIx in row.cells) {
			justification(config, row, cellIx)
		}
		ca_table.next_row(config)
	},

	justify_left : function(config, row, cellIx) {
		var x = row.x + cellIx
				* (config.cell_width + config.horizontal_spacing)
		var y = row.y
		ca_table.generate_cell(config, row, cellIx, x, y)
	},

	justify_right : function(config, row, cellIx) {
		var offset = config.width - (row.cells.length * config.cell_width)
				- ((row.cells.length - 1) * config.horizontal_spacing)
		var x = row.x + offset + cellIx
				* (config.cell_width + config.horizontal_spacing)
		var y = row.y
		ca_table.generate_cell(config, row, cellIx, x, y)
	},

	justify_center : function(config, row, cellIx) {
		var len = row.cells.length
				* (config.cell_width + config.horizontal_spacing)
		var offset = (config.width - len) / 2
		var x = row.x + offset + cellIx
				* (config.cell_width + config.horizontal_spacing)
		var y = row.y
		ca_table.generate_cell(config, row, cellIx, x, y)
	},

	justify_justify : function(config, row, cellIx) {
		var space = 0
		if (row.cells.length > 1) {
			space = (config.width - row.cells.length * config.cell_width)
					/ (row.cells.length - 1)
		}
		var x = row.x + cellIx * (config.cell_width + space)
		var y = row.y
		ca_table.generate_cell(config, row, cellIx, x, y)
	},

	generate_cell : function(config, row, cell_ix, x, y) {
		var template = Templates()
		var value = row.cells[cell_ix]
		var opname
		if (config.name_scheme == "value") {
			opname = config.name + "_" + value
		} else {
			opname = config.name + "_r_" + row.key + "_c_" + cell_ix
		}
		var cell = {
			name : opname,
			operation : "fixed",
			events : {}
		}
		cell.value = value
		cell.imageset = config.imageset
		cell.duration = config.duration || [ "*", "*" ]
		cell.distance = config.distance || 10
		cell.template = config.template
		cell.position = [ x, y ]
		cell.align = config.align || [ "left", "top" ]

		if (config.alt) {
			var alt_opname = "alt_" + opname
			cell.alt_name = alt_opname

			var alt_cell = {
				name : alt_opname,
				alt_name : opname,
				operation : "fixed",
				events : {}

			}
			alt_cell.value = value
			alt_cell.position = [ x, y ]
			alt_cell.align = config.alt.align || cell.align
			alt_cell.imageset = config.alt.imageset || imageset
			alt_cell.duration = config.alt.duration || [ "*", "*" ]
			alt_cell.distance = config.alt.distance || cell.distance - 1
			alt_cell.template = config.alt.template || config.template
		}
		if (config.events) {
			for ( var eventId in config.events) {
				var config_event = config.events[eventId]
				var scopes
				if (config_event.scopes && config_event.scopes.length > 0) {
					scopes = config_event.scope
				} else {
					scopes = [ "main", "alt" ]
				}
				for (var scopeIx = 0; scopeIx < scopes.length; scopeIx++) {
					var operation
					switch (scopes[scopeIx]) {
					case "main":
						operation = cell
						break
					case "alt":
						operation = alt_cell
						break
					default:
						continue
					}
					for ( var spec in config_event) {
						switch (spec) {
						case "operation": {
							operation.events[eventId] = spec.operation
							break
						}
						case "stop": {
							operation.events[eventId] = ca_table
									.generate_event(event_rt.STOP, cell,
											config_event[spec])
							break
						}
						case "start": {
							operation.events[eventId] = ca_table
									.generate_event(event_rt.START, cell,
											config_event[spec])
							break
						}
						default:
							break
						}
					}
				}
			}
			var operations = Operation()
			operations[opname] = cell
			operations[alt_opname] = alt_cell
		}
	},

	generate_event : function(type, cell, spec) {
		var delay = spec.time || 0
		var op = spec.value // default
		if (spec.field) {
			op = cell[spec.field]
		}
		return function() {
			var now = getCurrentTime()
			var time = now + delay
			event_rt.createEvent(type, time, op)
		}
	},

	init_row : function(config, row) {
		row.ix = config.state.ix
		row.x = config.state.x
		row.y = config.state.y
	},

	next_row : function(config) {
		config.state.ix += 1
		config.state.y += (config.vertical_spacing + config.cell_height)
	}
}