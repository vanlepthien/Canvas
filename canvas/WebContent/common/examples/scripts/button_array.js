'use strict'
/**
 * 
 */

/**
 * This sample generates a
 */

sample_array = {
	x : 0,
	y : 0,
	width : 400,
	height : 400,
	cell_width : 80,
	cell_height : 80,
	vertical_spacing : 26.6,
	horizontal_spacing : 26.6,
	justification : "center",
	imageset : "text",
	rows : {
		0 : [ 1, 2, 3 ],
		1 : [ "aaa", "bbbbbbb", "c" ],
		2 : function() {
			sample_array.generateNumericDisplayRow()
		},
		3 : function() {
			var retval = []
			retval[0] = "first"
			retval[3] = function() {
				return Math.sqrt(3)
			}
		},
	},
	generateNumericDisplay : function() {
	},
}

template.display = {
	0 : {
		text : {
			element : "#digit_value",
			value : function(state, meta) {
				var val = calculator_display
						.getDigit(state.operation.display_ix)
				state.value = val
				return val
			},
			method : "setSvgTextValue",
		},
		color : {
			element : "#digit_style",
			field : "color",
			value : function(state, meta) {
				return state.operation.color || "#444444"
			},
			method : "updateSvgTextValue"
		}
	},
}

imageset.text = {
	image : {
		0 : {
			name : "text.svg",
			width : 500,
			height : 60,
		}
	}
}

template.error = {
	0 : {
		text : {
			element : "#text_value",
			value : function(state, meta) {
				var val = calculator.error
				state.value = val
				return val
			},
			method : "setSvgTextValue",
		},
		color : {
			element : "#text_style",
			field : "color",
			value : function(state, meta) {
				return state.operation.color || "#ff0000"
			},
			method : "updateSvgTextValue"
		}
	},
}
