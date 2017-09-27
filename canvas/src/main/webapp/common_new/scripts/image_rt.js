'use strict'

// image_rt defined in globals.js

image_rt.svgImages = {}

/**
 * Create image runtime from imageset definitions
 */

image_rt.createRuntimeImages = function() {
	var imagesets = ImageSet()
	var imagemap = RuntimeImage()
	var image_store = Images()

	for ( var key in imagesets) {
		var imageset = imagesets[key]
		var configuration = {}
		var shared = {}
		if (imageset.configuration) {
			configuration = imageset.configuration
		}
		if (imageset.shared) {
			shared = imageset.shared
		}
		var images = {}
		if (Array.isArray(imageset.image)) {
			for ( var ix in imageset.image) {
				images[ix] = this.buildImageEntry(imageset.image[ix], shared)
			}
		} else if (typeof imageset.image == "object") {
			$.extend(true, images, imageset.image)
		} else if (typeof imageset.image == 'string') {
			images[0] = this.buildImageEntry(imageset.image, shared)
		}

		for ( var image_ix in images) {
			var instance = images[image_ix]
			var image_remap = this.resolveUrl(key, instance)
			for ( var attr in images[image_ix]) {
				this.resolve(attr, instance)
			}

			if (!image_store[instance.url]) {
				var image_instance = {}
				for ( var attr in instance) {
					image_instance[attr] = instance[attr]
				}
				image_store[instance.url] = image_instance
			}
		}
		imagemap[key] = {}
		imagemap[key].images = images
		imagemap[key].configuration = configuration
	}
}

image_rt.resolveUrl = function(key, instance) {
	// Assumption: either url or name is defined
	var url = instance.url
	var name = instance.name
	var path = instance.path
	var type = instance.type
	var local_url
	if (!url && !name) {
		throw "Configuration error in imageset:'" + key + "', image:'"
				+ image_ix + "' - neither url or name defined."
	}
	var url_url
	if (!url) {
		if (!path) {
			path = defaults.imageLoc
		}
		if (!path.endsWith("/")) {
			path += "/"
		}
		local_url = path + name
		try {
			url_url = new URL(local_url)
		} catch (e) {
			// assume it's a relative url
			url_url = new URL(local_url, window.location.protocol + "//"
					+ window.location.host)
		}
	} else {
		url_url = new URL(url)
	}
	if (!name) {
		var pathname = url_url.pathname
		var bits = pathname.split("/")
		name = bits.slice(-1)
		instance.name = name
	}
	if (!path) {
		var pathname = url_url.pathname
		var bits = pathname.split("/")
		bits = bits.slice(0, -1)
		path = "/" + bits.join("/") + "/"
		instance.path = path
	}
	if (!type) {
		instance.type = this.fileType(name)
	}
	url = url_url.href
	instance.url = url
	instance.local_url = local_url
}

image_rt.resolve = function(attr, instance) {
	var attribute = instance[attr]
	switch (attr) {
	case "size": {
		instance[attr] = util.normalizeSize(instance[attr])
		break;
	}
	default:
	}
}

image_rt.fileType = function(fileName) {
	var bits = fileName.split(".")
	return bits.slice(-1)[0]
}

image_rt.isFileType = function(type) {
	return function(fileName) {
		if (fileName.toLowerCase().endsWith(type)) {
			return true
		}
		return false
	}
}

image_rt.isSvg = image_rt.isFileType(".svg")

image_rt.buildImageEntry = function(name, configuration) {
	var entry = {
		name : name
	}
	for ( var op in configuration) {
		entry[op] = configuration[op]
	}
	return entry
}

image_rt.imageCnt = 0

image_rt.loadImages = function(callback) {
	var img_cnt = {}
	var image_store = Images()
	img_cnt.count = Object.keys(image_store).length

	if (img_cnt.count == 0) {
		callback()
		return

		

	}
	for ( var key in image_store) {
		var image_entry = image_store[key]
		var imageinfo = {}
		image_entry.imageinfo = imageinfo
		var img
		var imageSize = null
		if ("size" in image_entry) {
			imageSize = image_entry.size
		}
		if (image_entry.type == "svg") {
			var url = image_entry.local_url ? image_entry.local_url
					: image_entry.local_url
			var req = new XMLHttpRequest()
			req.open("GET", url, true)
			req.overrideMimeType("image/svg+xml");
			req.img_cnt = img_cnt
			req.image_entry = image_entry
			req.onload = function() {
				if (this.status === 200) {
					var svg_element = this.responseXML.documentElement
					var fName = image_entry.name
					$(svg_element).attr("id", fName)
					var svg_children = $(svg_element).children()
					if (svg_children.length > 1) {
						var g_id = "g_" + fName.replace(/[.]/, "_")
						$(svg_element).prepend("<g id=\"" + g_id + "\"></g>")
						var g = $(svg_element).children()[0]
//						var g = $("#" + g_id)
						$(g).append(svg_children)
					}
					this.image_entry.imageinfo.svgelement = svg_element
					
					// The following code placed the svg in the current document
					// #svgDiv element instead, we will now keep the original
					// SVG in the imageinfo.svgelement.
					// The current code does not protect the svg element from
					// update collisions if used by more than one operation
					var svg = document.importNode(svg_element, true)
					var svg_div = $("#svgDiv")
					if (svg_div.length == 0) {
						$("body").append("<div id=\"svgDiv\"></div>")
						svg_div = $("#svgDiv")
						$(svg_div).css("visibility", "hidden")
					}
					$(svg_div).append(svg)
					this.image_entry.imageinfo.svg = svg
					// end of old code
					
				} else {
					console.error(this.statusText);
				}
				this.img_cnt.count--
				if (img_cnt.count == 0) {
					callback()
				}
			}
			req.send()
		} else {
			if (image_entry.size) {
				img = new Image(imageSize[0], imageSize[1])
			} else {
				img = new Image();
			}
			imageinfo.image = img
			imageinfo.image_entry = image_entry
			img.imageinfo = imageinfo
			img.img_cnt = img_cnt
			img.onload = function() {
				this.imageinfo.width = this.width
				this.imageinfo.height = this.height
				this.img_cnt.count--
				if (this.img_cnt.count == 0) {
					callback()
				}
			}
			if (image_entry.local_url) {
				img.src = image_entry.local_url
			} else {
				img.src = image_entry.url
			}
		}
	}
}