'use strict'

// rt defined in globals.js

rt.attr_backmap = {
	imageset : ImageToRuntime(),
}

rt.createRuntime = function() {
	var operation = Operation()
	var runtime = Runtime()
	for ( var key in operation) {
		var op = operation[key]
		var rt_operation = {}
		runtime[key] = rt_operation
		rt_operation.name = key
		for ( var attr in op) {
			var attribute = op[attr]
			this.resolve(rt_operation, attr, attribute)
		}
		if(op.imageset && op.template){
			this.createRuntimeTemplate(rt_operation,op.template)
		}
		this.setUpDefaults(rt_operation)
	}
}

rt.resolve = function(rt_operation, attr, attribute) {
	if (this.attr_backmap[attr]) {
		var map = this.attr_backmap[attr]
		map[attribute] = rt_operation.name
	}
	switch (attr) {
	case "imageset": {
		var imagemap = RuntimeImage()
		rt_operation.image = {}
		if (imagemap[attribute]) {
			for ( var iAttr in imagemap[attribute]) {
				rt_operation.image[iAttr] = $.extend(true,{},imagemap[attribute][iAttr])
			}
		}
		break
	}
	case "template":{
		// Template handled after imageset
		break
	}
		
	case "size": {
		if (Array.isArray(attribute)) {
			switch (attribute.length) {
			case 0: {
				break;
			}
			case 1: {
				var size = attribute[0]
				if (!rt_operation.width) {
					rt_operation.width = size
				}
				if (!rt_operation.height) {
					rt_operation.height = size
				}
				break
			}
			default: {
				var width = attribute[0]
				var height = attribute[1]
				if (!rt_operation.width) {
					rt_operation.width = width
				}
				if (!rt_operation.height) {
					rt_operation.height = height
				}

			}
			}
		}
	}
	default: {
		rt_operation[attr] = attribute
	}
	}
}

rt.createRuntimeTemplate = function(rt_operation, template){
	for(var ix in template){
		var image_entry = rt_operation.image.images[ix]
		image_entry.template = jQuery.extend(true, {}, template[ix]);
	}
}

rt.setUpDefaults = function(rt_operation) {

	rt_operation.initialized = false
	rt_operation.meta = {}

	this.setUpDurations(rt_operation)
}

/**
 * Create start and stop events based on duration definitions
 * 
 * Durations are in one of the following formats: start [start, (end)?] | [,end]
 * [[start, (end)?] | [,end](,[start, (end)?] | [,end])*] after formatting,
 * durations are of the form [[start,end](,[start2,end2]*] where start, end ::=
 * numeric | "*"
 * 
 * If start and end are both numeric start > end, the interval is ignored. If
 * start == "*", the operation is only started when initiated by a non-duration
 * event if the operation is initiated before a specified end time, the
 * operation will be stopped when the end time is encountered (or when stopped
 * by another event).
 * 
 * If end == "*", it is treated as POSITIVE_INFINITY, i.e. no stop event is
 * generated.
 * 
 * It is suggested that operations started and stopped by non-duration events
 * either have zero or one durations specified.
 * 
 * If "show" has a value of "true", an operation will always be active and
 * duration will be ignored.
 * 
 * @param {runtime_element}
 *            rt_operation - the runtime element being set up
 * 
 */

rt.setUpDurations = function(rt_operation) {

	var durations = []

	if (rt_operation.duration) {
		if (Array.isArray(rt_operation.duration)) {
			if (Array.isArray(rt_operation.duration[0])) {
				var eDurations = rt_operation.duration[0]
				for ( var ix in eDurations) {
					durations.push(eDurations[ix])
				}
			} else {
				durations.push(rt_operation.duration)
			}
		} else {
			durations.push([ rt_operation.duration, "*" ])
		}
	}

	for ( var ix in durations) {
		var duration = durations[ix]
		for ( var iix in duration) {
			var time = duration[iix]
			if (time == "*" || time == undefined) {
				break
			}
			if (isNaN(time)) {
				console
						.log("in configuration '" + key
								+ "', duration contains invalid value: '"
								+ time + "'.")
				break
			}
			var nTime = Number(time)

			switch (Number(iix)) {
			case 0:
				event_rt.createEvent(event_rt.START, nTime, rt_operation)
				break
			case 1:
				event_rt.createEvent(event_rt.STOP, nTime, rt_operation)
				break
			default:
				console.log("in configuration '" + key
						+ "', duration contains more than two values: '"
						+ duration + "'.")
			}
		}
	}
}

