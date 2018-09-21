'use strict'

// svg_rt defined in globals.js

/**
 * Create image runtime from svg definitions
 */

svg_rt.createRuntimeSVGImages = function() {
    var svg_elements = SVG()

    for ( var key in svg_elements) {
        var svg_entry = svg_elements[key]
        svg_entry.name = key
        if (svg_entry.xml || svg_entry["function"]) {
            return;
        }
        svg_entry.url = svg_rt.resolveUrl(svg_entry)
        for ( var attr in images[image_ix]) {
            svg_rt.resolve(attr, instance)
        }
    }
}

svg_rt.resolveUrl =
        function(svg_entry) {
            // Assumption: either url or name is defined
            var url = svg_entry.url
            var name = svg_entry.name
            var path = svg_entry.path
            var type = "svg"
            var local_url
            var url_url
            if ( !url) {
                if ( !path) {
                    path = defaults.imageLoc
                }
                if ( !path.endsWith("/")) {
                    path += "/"
                }
                local_url = path + name + "." + type
                try {
                    url_url = new URL(local_url)
                } catch (e) {
                    // assume it's a relative url
                    url_url =
                            new URL(local_url, window.location.protocol + "//"
                                               + window.location.host)
                }
            } else {
                url_url = new URL(url)
            }
            if ( !path) {
                var pathname = url_url.pathname
                var bits = pathname.split("/")
                bits = bits.slice(0, -1)
                path = "/" + bits.join("/") + "/"
                svg_entry.path = path
            }
            url = url_url.href
            svg_entry.url = url
            svg_entry.local_url = local_url
        }

svg_rt.resolve = function(attr, instance) {
    var attribute = instance[attr]
    switch (attr) {
        case "size": {
            instance[attr] = util.normalizeSize(instance[attr])
            break;
        }
        default:
    }
}

svg_rt.fileType = function(fileName) {
    var bits = fileName.split(".")
    return bits.slice( -1)[0]
}

svg_rt.buildImageEntry = function(name, shared) {
    var entry = {
        name : name
    }
    for ( var op in shared) {
        entry[op] = shared[op]
    }
    return entry
}

svg_rt.imageCnt = 0

svg_rt.setRuntimeImages =
        function() {
            var runtime = Runtime();
            var images = Images();
            for ( var key in runtime) {
                var rt_operation = runtime[key]
                if (rt_operation.image) {
                    for ( var ix in rt_operation.image.images) {
                        var url = rt_operation.image.images[ix].url
                        var imageinfo =
                                $.extend(true, {}, images[url].imageinfo)
                        if (imageinfo.svg) {
                            var svg = imageinfo.svg
                            var clone = $(svg).clone()[0]
                            $(clone).attr(
                                    'id',
                                    rt_operation.name + "_" + ix + "_"
                                            + $(svg).attr('id'))
                            var svg_image = svg.image
                            var cloned_image = svg_image.cloneNode(true)
                            clone.image = cloned_image
                            console.log(svg)
                            console.log(clone)
                            // $(svg).parent().append(clone)
                            rt_operation.image.images[ix].image = {}
                            rt_operation.image.images[ix].image.svg = clone
                        } else {
                            rt_operation.image.images[ix].image =
                                    imageinfo.image
                        }
                    }
                }
            }
        }

svg_rt.loadImages = function(callback) {
    var svg_cnt = {}
    var svg_elements = SVG()
    svg_cnt.count = Object.keys(svg_elements).length

    if (svg_cnt.count == 0) {
        callback()
        return;
    }
    for ( var key in svg_elements) {
        var svg_entry = svg_elements[key]
        if (svg_entry.xml || svg_entry["function"]) {
            svg_cnt--
            if (svg.svg_cnt.count <= 0) {
                svg.callback()
            }
            continue
        }
        var url = svg_entry.local_url ? svg_entry.local_url : svg_entry.url
        var req = new XMLHttpRequest()
        req.open("GET", url, true)
        req.overrideMimeType("image/svg+xml");
        req.svg_cnt = svg_cnt
        req.svg_entry = svg_entry
        req.onload = function(event) {
            var request = event.target
            if (request.status === 200) {
                var text = request.responseText
                request.svg_entry.xml = text
                request.svg_cnt.count--
                if (svg_cnt.count <= 0) {
                    callback()
                }

            } else {
                console.error(request.statusText);
                request.svg_cnt.count--
                if (svg_cnt.count <= 0) {
                    callback()
                }
            }
        }
        req.send()
    }
}