/**
 * 
 */
'use strict'

var start = new Date()

var tick = 0

var nominal_tick = 0

var max_distance = 0

var x_alignment = {"left": 0, "center": -.5 , "right": -1}
var y_alignment = {"top": 0, "center": -.5 , "bottom": -1}

function init(){
	createRuntime()
	generateCanvasses(canvascontainer, canvasmodel)
	generateAudio();
	generateOperations()
	generateImageInfo(
			function(){
				generateImageMasks(
						function(){
							draw()
							}
						)
				}
			)
}

var runtime = {}

function createRuntime(){
	for(var key in configuration){
		runtime[key] = {}
		if("operation" in configuration[key]){
			runtime[key]["operations"] = {}
			for(op_id in configuration[key].operation){
				runtime[key].operations[op_id] = {}
				var rt_op = runtime[key].operations[op_id]
				rt.op["initialized"] = false
			}
		}
	}
}

function generateCanvasses(id,cm_id){
	var distances = []
	var distanceMap = {}
	var div = $("#"+id).get(0)
	var model = $("#"+cm_id).get(0)
	var s = 0
	var bnd = getBoundaries(model)
	var width = bnd.width
	var height= bnd.height
	var top = bnd.top
	var left = bnd.left
	for (var key in configuration){
		var element = configuration[key]
		if("distance" in element){
			distances.push(element.distance)
			max_distance = Math.max(max_distance, element.distance)
		}
	}
	
	distances.sort(function(a,b){return a - b}).reverse()
	var zix = 1
	var prev_d = Number.MAX_VALUE;
	for (var ix in distances){
		var dd = distances[ix]
		if(prev_d != dd){
			distanceMap[dd] = zix
			zix ++
			prev_d = dd
		}
	}
	for (var key in configuration){
		var element = configuration[key]
		if("usecanvas" in element){
			var base_element = configuration[element.usecanvas]
			element["canvas"] = base_element.canvas
		} else if("distance" in element){
			var c  = document.createElement("canvas")
			div.appendChild(c)
			var zix = distanceMap[element.distance]
			c.id = key
			c.style.zIndex = zix
			if("size" in element){
				var _width, _height
				if(Array.isArray(element.size)){
					var x_value = toNumber(element.size[0])
					var y_value = toNumber(element.size[1])
					if(x_value.isPercent){
						_width = x_value.value * width
					} else {
						_width = x_value.value
					}
					if(y_value.isPercent){
						_height = y_value.value * height
					} else {
						_height = y_value.value
					}
				} else {
					var value = toNumber(element.size)
					if(value.isPercent){
						_width = value.value * width
						_height = value.value * height
					} else {
						_width = value.value
						_height = value.value
					}
					
				}
				c.width = _width
				c.height = _height
			} else {
				c.width = width
				c.height = height
			}
			c.style.position = "absolute"
			c.style.left = left + "px"
			c.style.top = top + "px"
			element["canvas"] = c
		}
	}
}

function generateAudio(){
	var audios =getElement("audios","div").element
	for (var key in configuration){
		var element =  configuration[key]
		if("operation" in element){
			var operations = element.operation
			for(var op_name in operations){
				if("sound" == op_name){
					var operation = operations.sound
					if(!Array.isArray(operation.sound)){
						operation.sound = [operation.sound]
					}
					var audioList = []
					var url_ix
					for(url_ix in operation.sound){
						var url = operation.sound[url_ix]
						var audio = document.createElement("audio")
						if(operation.loop){
							audio.loop = true
						}
						audio.controls = false
						audios.appendChild(audio)
						var audio_element_name = "audio_"+key+"_"+url_ix
						audio.setAttribute("id", audio_element_name)
						audioList.push(audio)
						
						var source = document.createElement("source")
						audio.appendChild(source)
						source.setAttribute("src",audioLoc + url)
						var audioType
						var suffix = url.substring(url.lastIndexOf("."))
						switch(suffix){
							default:
							case ".mpg":
							case ".mpeg":
							case ".mp3":
								audioType="audio/mpeg"
								break
							
							case ".ogg":
								audioType = "audio/ogg"
								break
							case ".wav":
								audeoType = "audio/wav"
						}
						source.setAttribute("type", audioType)
						operation["switch_audio"] = false
						audio.onended=function(){
							switchAudio(element,operation)
						}
					}
					operation["audios"] = audioList
				}
			}
		}
	}
}

var imageCnt = 0

function generateImageInfo(callback){
	for(var key in configuration){
		var element = configuration[key]
		if("image" in element){
			if(element.image != null){
				imageCnt ++
			}
		}
	}
	for(var key in configuration){
		var element = configuration[key]
		element["name"] = key
		var imageInfo = {}
 		if("image" in element){
			if(element.image == null){
				imageInfo["image"] = null
			} else {
				var img = new Image();
				imageInfo["image"] = img
				img.onload = function(){
					imageCnt --
					if(imageCnt == 0){
						setImageAttributes()
						callback()
					}
				}
				img.src = imageLoc+element.image
			}
		}
		element["imageinfo"] = imageInfo		
	}
}

var shapeCnt = 0

var loadedShapes = {}

var svgRequest = function(operation,callback){
	if(operation.shape in loadedShapes){
		createSvgRef(operation, loadedShapes[operation.shape])
		shapeCnt --
		if(shapeCnt == 0){
			callback()
		}
	} else {
		var req = new XMLHttpRequest()
	
		req.open("GET", imageLoc + operation.shape, true)					
		req.overrideMimeType("image/svg+xml");
		req.onload = function(){
			if (req.status === 200) {
				var svgDefs = getSvgDefs()
				var svg = req.responseXML.documentElement;
				var svgDef = addSvgDef(svgDefs,svg)
				svgDef.setAttribute('id',operation.id)
				addTriggers(svgDef,operation)
				loadedShapes[operation.shape] = svgDef
				createSvgRef(operation, svgDef)
			} else {
				console.error(req.statusText);
			}
			shapeCnt --
			if(shapeCnt == 0){
				callback()
			}
		}
		req.send()
	}
}

function addTriggers(svg, operation){
	
	var svgElements = svg.getElementsByTagName("*")
	for (var ix = 0; ix < svgElements.length; ix++){
		var e = svgElements.item(ix)
		if(e.tagName.toLowerCase() != "g"){
			if(operation.callback){
				$(e).on("click",operation, function(operation){operation.onclick()})
			} else {
				$(e).on("click", function(){alert(operation.name)})
			}
		}
	}
}

function addSvgDef(svgDefs, svgDocument){
	var fragment = createDefFromDocument( svgDocument)
	svgDefs.appendChild(fragment)
	return fragment
}

function createDefFromDocument(svgDocument){
	var svg
	if(svgDocument.tagName == "svg"){
		svg = svgDocument
	} else {
		svg = svgDocument.getElementsByTagName("svg")[0]
	}
	var g = document.createElement("g")
	var children = svg.childNodes
	for(var ix =0; ix < children.length; ix++){
		var child =  svg.childNodes[ix]
		var clone = child.cloneNode(true)
		g.appendChild(clone)
	}
	return g
}

function createSvgRef(operation,svgDef){
	var ref_element
	var ref_operation = null
	if(operation.action.reference.element in configuration){
		ref_element = configuration[operation.action.reference.element]
		if (operation.action.reference.operation in ref_element.operation){
			ref_operation = ref_element.operation[operation.action.reference.operation]
			operation["ref_operation"] = ref_operation
		}
	}
	if(ref_operation == undefined){
		return
	}
	var svgDivFetch = getElement("svgDiv", "div")
	var svgDiv = svgDivFetch.element
	if(svgDivFetch.generated){
		svgDiv.innerHTML = "<p>Generated References to SVG definitions</p>"
	}
	var svgRef = document.createElementNS("http://www.w3.org/2000/svg","svg")
	svgDiv.appendChild(svgRef)
// TODO add real height & width
	svgRef.setAttribute("id","ref_"+operation.id)
	svgRef.setAttribute("width","126.000000px" )
	svgRef.setAttribute("height","186.000000px" )
	svgRef.setAttribute("viewBox","0 0 126.000000 186.000000" )
	svgRef.setAttribute("preserveAspectRatio","xMinYMin meet" )
	svgRef.style.position = "absolute"
	svgRef.style.top = "200px"
	svgRef.style.left = "200px"
	svgRef.style.zIndex = 20;
	svgRef.style.opacity= 0
	operation["svg_ref"] = svgRef
	var svgUse = document.createElementNS("http://www.w3.org/2000/svg","use")
	svgRef.appendChild(svgUse)
	svgUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "#"+operation.id);
	svgUse.setAttribute("x", 0);
	svgUse.setAttribute("y", 0);
	svgRef.setAttribute("onclick","alert('"+operation.action.reference.element+": "+operation.action.reference.operation+" "+operation.name+"')")
	svgUse.setAttribute("onclick","alert('"+operation.action.reference.element+": "+operation.action.reference.operation+" "+operation.name+"')")
	
// svgUse.setAttribute("hidden","hidden")
}

function getElement(id, tag, ns){
	
	var element = document.getElementById(id)
	if (element){
		return {"element":element, "generated":false}
	}
	var body = document.getElementsByTagName("body")[0]
	if(ns == undefined){
		element = document.createElement(tag)
	} else {
		element = document.createElementNS(ns,tag)
	}
	body.appendChild(element)
	element.setAttribute("id",id)
	return {"element":element, "generated":true}
}

function generateImageMasks(callback){
	for(var key in configuration){
		var element = configuration[key]
		if("operation" in element){
			if("button" in element.operation){
				if("shape" in element.operation.button){
					shapeCnt ++
				}
			}
		}
	}
	if(shapeCnt == 0){
		callback()
		return
	}
	for(var key in configuration){
		var element = configuration[key]
		if("operation" in element){
			if("button" in element.operation){
				if("shape" in element.operation.button){
					element.operation.button["id"] = generateId(element.operation.button.shape)
					if(typeof SVGPathElement === "undefined"){
						
					} else {
						svgRequest(element.operation.button, callback)
					}
				}
			}
		}
	}
}

function generateId(inString){
	return btoa(inString).slice(0,-2)
}

function getSvgDefs(){
	var svgDefs = document.getElementById("svgDefs")
	if(!svgDefs){
		var svgElement =getElement("svgContainer","svg","http://www.w3.org/2000/svg").element
		svgDefs = document.createElementNS("http://www.w3.org/2000/svg","defs")
		svgDefs.setAttribute("id","svgDefs")
		svgElement.appendChild(svgDefs)
	}
	return svgDefs
}

function generateOperations(){
	for(var key in configuration){
		var element = configuration[key]
		if("operation" in element){
			var operations = element.operation
			for(var op_name in operations){
				var operation = operations[op_name]
				console.log("Creating "+ element.name+"::"+op_name)
				operation["name"] = op_name
			}
		}
	}
}

function setImageAttributes(){
	
	for(var key in configuration){
		var element = configuration[key]
		if("imageinfo" in element){
			var image = element.imageinfo.image
			if(image == null){
				element.imageinfo["width"] = 0
				element.imageinfo["height"] = 0
				
			} else {
				element.imageinfo["width"] = image.width
				element.imageinfo["height"] = image.height
			}
		}
	}
}

var prev = Date.now()
var prev_second_ticks = 0
var interval_adjustment = 1

function draw(){
	if(debug){
		interval_adjustment = 1
	} else {
		var now = Date.now()
		var elapsed = (now - prev) / 1000
		if(elapsed > 1){
			var nominal_second = (tick - prev_second_ticks)/(60 * interval_adjustment)
			console.log("Time:" +(now - start)/1000+" tick: " + tick +" Tick seconds " + tick / (60 * interval_adjustment))
			console.log("   Nominal second: " + nominal_second+ " Elapsed Ticks: " + (tick - prev_second_ticks))
			console.log("   Elapsed: " + elapsed+ " Nominal/Elapsed: "+ (nominal_second / elapsed))
			console.log("   Old Interval Adjustment: "+interval_adjustment)
			interval_adjustment = ((nominal_second / elapsed) + interval_adjustment)/2
			console.log("   New Interval Adjustment: "+interval_adjustment)
			prev_second_ticks = tick
			prev = now
		}
	}
	for (var key in configuration){
		var element = configuration[key]
		if (inInterval(element)){
			element["active"] = true
			run(element)
		} else {
			if("active" in element){
				if(element.active){
					inactivate(element)
				}
			}
			element["active"] = false
		}
	}
	tick ++;
	requestAnimFrame(function(){draw()})
}

function inInterval(element){
	if("duration" in element){
		var duration = element.duration
		if(Array.isArray(duration)){
			var first = duration[0]
			if(Array.isArray(first)){
				for(var a in duration){
					if(inSecondsInterval(a)){
						return true
					}
				}
			}else {
				if(inSecondsInterval(duration)){
					return true
				}
			}
		}
	}
	return false
}

function currentInterval(element){
	if("duration" in element){
		var duration = element.duration
		if(Array.isArray(duration)){
			var first = duration[0]
			if(Array.isArray(first)){
				for(var a in duration){
					if(inSecondsInterval(a)){
						return a
					}
				}
			}else {
				if(inSecondsInterval(duration)){
					return duration
				}
			}
		}
	}
	return []
}

function inSecondsInterval(interval){
	if(Array.isArray(interval)){
		if(interval.length == 2 ){
			if(!(Number.isNaN(interval[0]) ||Number.isNaN(interval[1]) || (interval[0] > interval[1]))){
				var first = interval[0]* 60 * interval_adjustment
				var last = interval[1]* 60 * interval_adjustment
				if((tick >= first) && (tick <= last)){
					return true
				}
			}
		}
	}
	return false
}

function getBoundaries(element) {
	  var rect = element.getBoundingClientRect();
	  return {
	    left: rect.left + window.scrollX,
	    top: rect.top + window.scrollY,
	    right: rect.right - window.scrollX,
	    bottom: rect.bottom - window.scrollY,
	    width: rect.width - (2*window.scrollX),
	    height: rect.height - (2*window.scrollY)
	  }
	}


function run(element){
	if("operation" in element){
		var operations = element["operation"]
		for (var op_key in operations){
			var operation = operations[op_key]
			if("canvas" in element){
				if(!("context" in operation)){
					var context = element.canvas.getContext("2d")
					operation["context"] = context
				}
			}
//			console.log("Invoking "+element.name+"::"+op_key)
			try{
				window[op_key](element,operation)
			} catch (e){
			}
		}
	}
}

function inactivate(element){
	if("operation" in element){
		var operations = element["operation"]
		for (var op_key in operations){
			var operation = operations[op_key]
			if("canvas" in element){
				if(!("context" in operation)){
					var context = element.canvas.getContext("2d")
					operation["context"] = context
				}
			}
			var inactivate = op_key+"_inactivate"
			console.log("Invoking "+element.name+"::"+inactivate)
			try{
				window[inactivate](element,operation)
			} catch (e){
				if("context" in operation){
					operation.context.clearRect(0,0,element.canvas.width,element.canvas.height)
				}
			}
// operation.function(element,operation)
		}
	}
}

function sound(element, operation){
	var state 
	if("state" in operation){
		nextAudioState(element, operation)
	} else {
		newAudioState(element, operation)
	}
}

function newAudioState(element, operation){
	operation["state"] = {}
	operation.state["sound_iteration"] = 0
	operation.state["current_audio"] =  operation.audios[operation.state.sound_iteration]
	operation.state["switch_audio"] =  operation.switch_audio
	operation.state.current_audio.play()
	console.log("Playing "+operation.state.current_audio.getAttribute("src"))
}

function nextAudioState(element, operation){
	if(operation.state.switch_audio){
		operation.state.current_audio.pause()
		operation.state.switch_audio = false
		if(operation.state.sound_iteration < 0){
			operation.state.sound_iteration = 0
		} else {
			operation.state.sound_iteration ++
		}
		if(operation.state.sound_iteration < operation.audios.length){
			operation.state.current_audio = operation.audios[operation.state.sound_iteration]
			operation.state.current_audio.play()
			console.log("Playing "+operation.state.current_audio.getAttribute("src")+"("+operation.state.sound_iteration+")")
		} 
		if(operation.loop){
			operation.state.sound_iteration = 0
			operation.state.current_audio = operation.audios[operation.state.sound_iteration]
			operation.state.current_audio.play()
			console.log("Replaying "+operation.state.current_audio.getAttribute("src"))
		}
	}
}

function sound_inactivation(element,operation){
	if(operation.state.current_audio.ended ){
		
	} else {
		operation.state.current_audio.pause()
		operation.state.current_audio.current_time = 0
	}
	operation.state.sound_iteration = -1
}

function switchAudio(element, operation){
	if(!operation.loop){
		console.log("Sound Switch")
		operation.state["switch_audio"] = true
		// Don't wait for next interval
		nextAudioState(element, operation)
	} else {
		console.log("Sound loop")
	}
}

function bounce(element, operation){
	if("state" in operation){
		nextBounceState(element, operation)
	} else {
		newBounceState(element, operation)
	}
	var state = operation.state
	var context = operation.context
	context.clearRect(0,0,element.canvas.width,element.canvas.height)
	context.drawImage(element.imageinfo.image, state.x, state.y)
}

function newBounceState(element,operation){
	var top, bottom
	if("top" in operation){
		top = valueToPosition(operation.top, element.canvas.height,-1)
	} else {
		top = valueToPosition("80%", element.canvas.height,-1)
	}
	if("bottom" in operation){
		bottom = valueToPosition(operation.bottom, element.canvas.height,-1)
	} else {
		bottom = valueToPosition("20%", element.canvas.height,-1)
	}
	
	var x = null
	var y = null
	if("reference" in operation){
		x = getReference(operation,"state","x")
		y = getReference(operation,"state","y")
	}
	
	if(x == null || y == null){
		var xy = getPosition(element,operation)
		if(x == null) {
			x = xy[0]
		}
		if(y == null){
			y = xy[1]
		}
	}
	
	if (x == null){
		x = element.canvas.width / 2
	}
	if (y == null){
		y = (top + bottom) / 2
	}
	
	var speed = getSpeed(element,operation)

	var state = {}
	state["x"] = x
	state["y"] = y
	state["direction"] = 1
	operation.state = state
	
	var meta = {}
	meta["top"] = top
	meta["bottom"] = bottom
	meta["hspeed"] = speed.hspeed
	meta["vspeed"] = speed.vspeed
	operation["meta"] = meta
}

function nextBounceState(element,operation){
// Less is more in the y direction
	var state = operation.state
	var meta = operation.meta
	
	var x = state.x + meta.hspeed
	var y = state.y + (state.direction * meta.vspeed)
	if(state.direction < 0){
		if(y <= meta.top){
			y = meta.top
			state.direction = 1
		}
	} else {
		if(y >= meta.bottom){
			y = meta.bottom
			state.direction = -1
		}
	}
	state.x = x
	state.y = y
	
}

function valueToPosition(field,range,direction=1){
	var value = toNumber(field)
	var result = value.value
	if(value.isPercent){
		result = value.value * range
	}
	if(direction < 0){
		return range - result
	}
	return result
}

function move(element, operation){
	if("state" in operation){
		nextMoveState(element, operation)
	} else {
		newMoveState(element, operation)
	}
	var state = operation.state
	var context = operation.context
	context.clearRect(0,0,element.canvas.width,element.canvas.height)
	context.drawImage(element.imageinfo.image, state.x, state.y)
	for(var x_ix in state.x_vector){
		for(var y_ix in state.y_vector){
			context.drawImage(
					element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
		}
	}
}

function newMoveState(element, operation){
	var state = {}
	operation["state"] = state
	var meta = {}
	meta["width"] =  element.canvas.width
	meta["height"] =  element.canvas.height
	meta["imagewidth"] =  element.imageinfo.width
	meta["imageheight"] =  element.imageinfo.height
	var speed = getSpeed(element,operation)
	meta["hspeed"] = speed.hspeed
	meta["vspeed"] = speed.vspeed
	operation["meta"] = meta
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if("position" in operation){
		var x, y
		if(Array.isArray(operation.position)){
			if(operation.position.length > 0){
				x = valueToPosition(operation.position[0], element.canvas.width)
				if(operation.position.length > 1){
					y = valueToPosition(operation.position[1], element.canvas.height, -1)
				}
			}
		}
	} 
	if (x == Number.MAX_VALUE){
		x = element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		x = element.canvas.height / 2
	}
	state["x"] = x
	state["y"] = y
	updateMoveState(element,operation)

}

function nextMoveState(element, operation){
	var state = operation.state
	var meta = operation.meta
	state.x = (state.x + meta.hspeed) %  meta.width 
	state.y = (state.y + meta.vspeed) %  meta.height
	updateMoveState(element,operation)
}

function updateMoveState(element,operation){
	var state = operation.state
	var meta = operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getMoveVector(state.x_pos, meta.width, element.canvas.width)
	state["y_vector"] = getMoveVector(state.y_pos, meta.height, element.canvas.height)
}

function getMoveVector(pos,image_size,canvas_size){
	var vector = []
	var  p = pos
	while (p < canvas_size){
		if(p+image_size > 0){
			vector.push(p)
		}
		p+= canvas_size
	}
	return vector
}

function clear(context,element, operation){
	var context = operation.context
	context.clearRect(0,0,element.canvas.width,element.canvas.height)
}

function fixed(element, operation){
	if(!("meta" in operation)){
		newFixedState(element,operation)
	}
	var meta = operation.meta
	var context = operation.context
	context.clearRect(0,0,element.canvas.width,element.canvas.height)
	context.drawImage(
			element.imageinfo.image, meta.x, meta.y)
}

function newFixedState(element, operation){
	var canvas = element.canvas
	var position, align
	if("position" in operation){
		position = operation.position
	} else {
		position = ["50%","50%"]
	}
	if("align" in operation){
		align = operation.align
	} else {
		align = ["center","center"]
	}
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if(Array.isArray(operation.position)){
		if(operation.position.length > 0){
			x = valueToPosition(operation.position[0], element.canvas.width)
			if(operation.position.length > 1){
				y = valueToPosition(operation.position[1], element.canvas.height, -1)
			} else {
				y = valueToPosition("50%", element.canvas.height, -1)					
			}
		} else {
			x = valueToPosition("50%", element.canvas.width, -1)					
			y = valueToPosition("50%", element.canvas.height, -1)								
		}
	}
	
	if (x == Number.MAX_VALUE){
		x = element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y =  element.canvas.height / 2
	}
	
	var x_align, y_align
	
	if(align[0] in x_alignment){
		x_align = x_alignment[align[0]]
	} else {
		x_align = x_alignment.center
	}
	
	if(align[1] in y_alignment){
		y_align = y_alignment[align[1]]
	} else {
		y_align = y_alignment.center
	}
	
	var meta ={}
	meta["x"] = x += element.imageinfo.width * x_align
	meta["y"] = y += element.imageinfo.height * y_align
	
	operation.meta  = meta
}


function pan(element, operation){
	if("state" in operation){
		nextPanState(element,operation)
	} else {
		newPanState(element,operation)
	}
	var state = operation.state
	var context = operation.context
	for(var x_ix in state.x_vector){
		for(var y_ix in state.y_vector){
			context.drawImage(
					element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
		}
	}
}

function newPanState(element,operation){
	var state = {}
	state["x"] = 0
	state["y"] = 0
	operation["state"] = state
	var meta = {}
	meta["width"] =  element.imageinfo.width
	meta["height"] =  element.imageinfo.height
	var speed = getSpeed(element,operation)
	meta["hspeed"] = speed.hspeed
	meta["vspeed"] = speed.vspeed
	operation["meta"] = meta
	updatePanState(element,operation)
}

function nextPanState(element,operation){
	var state = operation.state
	var meta = operation.meta
	state["x"] = (state.x + meta.hspeed) %  meta.width 
	state["y"] = (state.y + meta.vspeed) %  meta.height
	updatePanState(element,operation)
}

function updatePanState(element,operation){
	var state = operation.state
	var meta = operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getPositionVector(state.x_pos, meta.width, element.canvas.width)
	state["y_vector"] = getPositionVector(state.y_pos, meta.height, element.canvas.height)
}

function getPositionVector(pos,image_size,canvas_size){
	var p = pos
	var vector = []
	while (p < canvas_size){
		vector.push(p)
		p += image_size
	}
	return vector
}

function button(element, operation){
//	console.log("Button")
//	console.log("style:  "+operation.svg_ref.style.cssText)
//	console.log("x:    "+operation.ref_operation.state.x)
//	console.log("y:    "+operation.ref_operation.state.y)
	var x = (operation.ref_operation.state.x + operation.ref_operation.meta.width) %  operation.ref_operation.meta.width
	var y = (operation.ref_operation.state.y + operation.ref_operation.meta.height) %  operation.ref_operation.meta.height
	operation.svg_ref.style.left = x
	operation.svg_ref.style.top = y
	operation.svg_ref.style.fillOpacity = 0
	operation.svg_ref.fill = "#ff0000"
//	console.log("New x: "+ x + " svg.style.left: "+operation.svg_ref.style.left)
//	console.log("New y: "+ y + " svg.style.top: "+operation.svg_ref.style.top)
}

function getSpeed(element, operation){
	var d
	if("distance" in element){
		d = element.distance
		d = Math.max(1,d)
	} else {
		d = max_distance
	}
	var scale = max_distance / d;
	
	var speed
	if("speed" in operation){
		speed = operation.speed
	} else {
		speed = [0, 0]
	}
	return {
		hspeed: speed[0] * scale * interval_adjustment,
		vspeed: speed[1] * scale * interval_adjustment
	}
}

function toNumber(string){
	if(isNaN(string)){
		var isPercent = string.trim().slice(-1) == "%"
		var value
		if(isPercent){
			value = parseFloat(string)/100
		} else {
			value = parseFloat(string)
		}
		return {
		 "isPercent": isPercent,
		 "value": value		
		}
	}
	return {
		 "isPercent": false,
		 "value": string		
		}

}

function nominal_ticks(){
	return (new Date() - start) / 60
}

function getReference(operation,group,field){
	if("reference" in operation){
		var element_name = operation.reference.element
		var operation_name = operation.reference.operation
		if(element_name in configuration){
			var element = configuration[element_name]
			if(operation_name in element.operation){
				operation = element.operation[operation_name]
				if(group in operation){
					if(field in operation[group]){
						return operation[group][field]
					}
				}
			}
		}
	}
	return null
}

function getPosition(element, operation){
	var x = null
	var y = null
	if("position" in operation){
		if(Array.isArray(operation.position)){
			if(operation.position.length > 0){
				x = valueToPosition(operation.position[0], element.canvas.width)
				if(operation.position.length > 1){
					y = valueToPosition(operation.position[1], element.canvas.height, -1)
				}
			}
		}
	} 
	return [x, y]
}

init()

// draw()
