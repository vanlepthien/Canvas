/**
 * 
 */

//function RuntimeElement(name, operation, events, parameters) {
//	if (this.validateName(name) && this.validateOperation(operation)
//		&& this.validateEvents( events)
//		&& this.validateParameters(operation)) {
//		this.name = name
//		this.operation = operation
//		this.events = events
//		this.parameters = parameters
//	}
//}
//
//RuntimeElement.validateName = function( name) {
//	if (typeof name === 'string' || name instanceof String) {
//		return true
//	}
//	console.log("Invalid name encountered in " + this.constructor.name + ": "
//		+ name)
//
//	return false
//}
//
//RuntimeElement.validateOperation = function(operation) {
//	if (operation instanceof RuntimeOperation) {
//		return true
//	}
//	return false
//}
//
//RuntimeElement.validateEvents = function (obj) {
//	if (obj instanceof Object) {
//		for (key in obj) {
//			if (!(obj[key] instanceof Function)) {
//				return false
//			}
//		}
//		return true
//	}
//	return false
//}
//
//RuntimeElement.validateParameters = function(pareameters){
//	return true
//}
/**
 * Implement a Sorted map
 * 
 * @constructor
 */
function SortedMap() {
	this.map = {}
	this.keyList = []

	/**
	 * Set an entry in the sorted map
	 * 
	 * @param key
	 *            key of entry to be set
	 * @param value
	 *            value entry is to be set to
	 * 
	 * @returns previous value if set, otherwise undefined
	 */

	this.set = function(key, value) {
		if (this.map[key]) {
			var old = this.map[key]
			this.map[key] = value
			return old
		}
		this.map[key] = value
		this.addKeyToList(key)
		return undefined
	}

	this.keys = function() {
		return this.keyList.slice()
	}

	this.addKeyToList = function(key) {
		if (this.keyList.length == 0) {
			this.keyList.push(key)
		} else {
			var ix = this.getNextKeyIx(key, this.keyList)
			this.keyList.splice(ix, 0, key)
		}
	}

	/**
	 * Discover if key exists in this.map
	 * 
	 * @returns true if the key exists in the map. otherwise returns false
	 */
	this.containsKey = function(key) {
		if (this.map[key]) {
			return true
		}
		return false
	}

	/**
	 * Retrieve a value by key
	 * 
	 * @param key -
	 *            the key for which a value is to be returned
	 * @returns the found value or undefined
	 */
	this.get = function(key) {
		if (this.map[key]) {
			return this.map[key]
		}
		return undefined
	}

	this.getNextKeyIx = function(key, list) {
		if (list.length == 0) {
			return 0
		}
		if (key > list[list.length - 1]) {
			return list.length
		}
		if (key == list[0]) {
			throw "Broken KeyList: " + this.constructor.name
		}
		// key < list[0]
		if (list.length == 1) {
			return 0
		}
		var splitIx = Math.floor(list.length / 2)
		var first = list.slice(0, splitIx)
		var second = list.slice(splitIx)
		return this.getNextKeyIx(key, first) + this.getNextKeyIx(key, second)
	}

	/**
	 * Retrieve the first entry from the map and deletes the entry
	 * 
	 * @returns the first entry in the map [key, value]
	 */
	this.shift = function() {
		if (this.keyList.length == 0) {
			return undefined
		}
		var key = this.keyList.shift()
		var value = this.map[key]
		delete this.map[key]
		return [ key, value ]
	}

	/**
	 * Retrieve the first entry from the map. Does not alter the map
	 * 
	 * @returns the first entry in the map [key, value]
	 */
	this.peek = function() {
		if (this.keyList.length == 0) {
			return [ undefined, [] ]
		}
		var key = this.keyList[0]
		var value = this.map[key]
		return [ key, value ]
	}

	this.clean = function() {
		this.map = {}
		this.keyList = []
	}
}

function CImage(svg) {

	this.prev = undefined
	this.x = 0
	this.y = 0
	this.width = 0
	this.height = 0
	this.svg = $(svg.outerHTML)[0]
	// this.svg = svg
	// var svg_html = this.svg.outerHTML
	// this.temp_svg = $(svg_html)[0]
}

CImage.prototype.setSize = function(width, height) {
	this.width = width
	this.height = height
}

CImage.prototype.getSVGSize = function() {
	return util.getSVGImageSize(this.svg)
}

CImage.prototype.setZ = function(z) {
	this.z = z
}

CImage.prototype.setXYZ = function(x, y, z) {
	this.x = x
	this.y = y
	this.z = z
}

CImage.prototype.getSize = function() {
	if (this.width && this.height) {
		return [ this.width, this.height ]
	}
	return util.getSVGImageSize(this.svg)
}

/**
 * Prepares active SVG file for template manipulation
 * 
 * @param prepared
 *            Callback function: called when load finished. Parameters are
 *            (loaded, image) loaded - true if svg loaded, false if not svg or
 *            load failed image - contains the loaded image
 * 
 */
CImage.prototype.getImage = function(template, callback) {
	if (template) {
		var svg_html = this.svg.outerHTML
		this.temp_svg = $(svg_html)[0]
		for ( var key in template) {
			var t = template[key]
			var element_id = t.element
			util[t.method](temp_svg, element_id, t, cell.value, rt_operation)
		}
		this.loadSVGToImage(temp_svg, function(image) {
			callback(true, image)
		})
	} else {
		// if (this.svg.image) {
		// callback(true, this.svg.image)
		// }
		this.loadSVGToImage(this.svg, function(image) {
			callback(true, image)
		})

	}
}

CImage.prototype.loadSVGToImage = function(svg, callback) {
	var viewBox = $(svg).attr("viewBox")
	var vb = viewBox.split(/,s*|\s+/)
	if (this.width) {
	} else {
		if (svg.attribute(width)) {
			this.width = $(svg).attr("width")
		} else {
			this.width = vb[2]
		}
	}
	if (this.height) {
	} else {
		if ($(svg).attr("height")) {
			this.height = $(svg).attr("height")
		} else {
			this.width = vb[3]
		}
	}

	if (this.z > 1 && this.z <= 1000) {

		$(svg).attr("width", this.width / this.z)
		$(svg).attr("height", this.height / this.z)

		var img = new Image()
		svg.image = img
		var encoded = encodeURIComponent(svg.outerHTML)
		img.onload = function(event) {
			var image = event.target
			var elapsed = Date.now() - image.start
			console.log("Elapsed: " + elapsed + " " + image.svg_element.id)
			callback(image)
		}
		img.svg_element = svg
		img.start = Date.now()
		img.src = "data:image/svg+xml," + encoded
	} else {
		var img = new Image()
		img.width = 0
		img.height = 0
		img.alt = ""
		img.onload = function(event) {
			var image = event.target
			callback(image)
		}
		img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D"
	}

}
