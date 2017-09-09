/**
 * 
 */
'use strict'

var start = new Date()

var tick = 0

var nominal_tick = 0

var max_distance = 0

const x_alignment = {"left": 0, "center": -.5 , "right": -1}
const y_alignment = {"top": 0, "center": -.5 , "bottom": -1}

var playable_audios = []

function preload(){
	// start button should be hidden, but make sure
	// TODO: dynamically create start button here?

	createRuntime()
	getGlobalDimensions(defaults.canvasmodel)
	generateCanvasses(defaults.canvascontainer)
	loadSvgImages( // function to trigger the next initialization (dependent on
					// this)
			function (){
				runNextInitialization ("SVG")})
}

function init(){
	// This must be run by a button click to activate audios on mobile devices
	generateAudio()
	loadAudio()
	runapp()
}

// Defines ordering of initializer execution
var initializations = {
		"SVG": function(){generateImageInfo(function(){runNextInitialization("Images")})},
		// if html has start button, let it initialize things
		"Images": function(){
				if($("#start_button").length){
					console.log("Start button")
				} 
				else {
					console.log("No Start button")
					init()
				}
			}
		}

function runNextInitialization(initializer){
	if(initializer in initializations){
		var f = initializations[initializer]
		f()
	}
}

function makeButtonVisible(){
	$("#start_button").removeAttr("hidden")
}

function loadAudio(){
	$("#audios").children("audio").each(function(){
		this.load()
		this.play()
		this.pause()
	})
}

function runapp(){
	if($("#start_button")){
		$("#start_button").attr("hidden","hidden")
	}
	draw()
}

var runtime = {}

var events = []

function createRuntime(){
	for(var key in configuration){
		var element  = configuration[key]
		var rt_element = {}
		runtime[key] = rt_element
		rt_element["name"] = key
		rt_element["configuration"] = element
		
		// default to show element without duration
		
		if("show" in configuration[key]){
			rt_element.show = element.show
		} else {
			rt_element.show = true
		}

		if("operation" in element){
			rt_element["operation"] = {}
			for(var op_id in element.operation){
				var rt_operation = {}
				rt_element.operation[op_id] = rt_operation
				rt_operation["name"] = op_id
				rt_operation["configuration"] = configuration[key].operation[op_id]
				rt_operation["initialized"] = false
				rt_operation["meta"] = {}
				rt_operation["element"] = runtime[key]
			}
		}
		
		var durations = []
		// durations is of the form [[start1,end1],[start2,end2],...]
		// where
		// startn and endn are either numeric or "*"
		// endn >= startn
		
		if(element.duration){
			if(Array.isArray(element.duration)){
				if(Array.isArray(element.duration[0])){
					var eDurations = element.duration[0]
					for(var ix in eDurations){
						durations.push(eDurations[ix])
					}
				}else {
					durations.push(element.duration)
				} 
			} else {
				durations.push([element.duration,"*"])
			}
			
		} 
		
		for(var ix in durations){
			var duration = durations[ix]
			for(var iix in duration){
				var time = duration[iix]
				if(time == "*" || time == undefined){
					break
				} 
				if(isNaN(time)){
					console.log("in configuration '"+key+"', duration contains invalid value: '"+time+"'.")
					break
				}
				var nTime = Number(time)

				switch(Number(iix)){
				case 0:
					createEvent("Start",nTime,rt_element)
					break
				case 1:
					createEvent("End",nTime,rt_element)
					break
				default:
					console.log("in configuration '"+key+"', duration contains more than two values: '"+duration+"'.")					
				}
			}
		}
	}
}

function createEvent(func,time,rt_element){
	var event = {
			type: func,
			time: time,
			element: rt_element
	}
	events.push(event)
}

var canvasMap = {}

var canvasIx = 0

function addCanvas(canvas) {
	var zIx = canvas.style.zIndex
	var zMap
	if (zIx in canvasMap) {
		zMap = canvasMap[zIx]
	} else {
		zMap = {}
		canvasMap[zIx] = zMap
	}
	zMap[canvasIx] = canvas
	canvasIx ++
}

var global_width
var global_height
var global_left
var global_top

function getGlobalDimensions(cm_id){
	var model = $("#"+cm_id).get(0)
	var bnd = getBoundaries(model)
	global_width = bnd.width
	global_height= bnd.height
	global_top = bnd.top
	global_left = bnd.left
}
function generateCanvasses(id){
	var distances = []
	var distanceMap = {}
	var div = $("#"+id).get(0)
	var s = 0
	var width = global_width
	var height= global_height
	var top = global_top
	var left = global_left
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
		var rt_element = runtime[key]
		if("usecanvas" in element){
			var base_element = runtime[element.usecanvas]
			rt_element["canvas"] = base_element.canvas
		} else if("distance" in element){
			var c  = document.createElement("canvas")
			div.appendChild(c)
			c.setAttribute("class","drawing_canvas")
			var zix = distanceMap[element.distance]
			c.id = key
			c.style.zIndex = zix
			c.width = width
			c.height = height
			c.style.position = "absolute"
			c.style.left = left + "px"
			c.style.top = top + "px"
			rt_element["canvas"] = c
			addCanvas(c)
		}
	}
	$(".drawing_canvas").click(function (event) { clickOnCanvas(event)})
	$(".drawing_canvas").mousemove(function (event) { mousemoveOnCanvas(event)})
}

// Walk through canvases until non-transparent item found

function walkcanvasses(f) {
	var zKeys = Object.keys(canvasMap).sort().reverse()
	for(var zIx in zKeys){
		var zKey = zKeys[zIx] 
		var zMap = canvasMap[zKey]
		var oKeys = Object.keys(zMap).sort().reverse()
		for(var oIx in oKeys){
			var oKey = oKeys[oIx]
			var canvas = zMap[oKey]
			if(f(canvas)){
				return
			}
		}
	}
}

// This function is called when you click the canvas.

function clickOnCanvas(event) {

	event = event || window.event
	var x = event.clientX
	var y = event.clientY

	walkcanvasses(function(src){
		var dx = x - src.offsetLeft
		var dy = y - src.offsetTop

		var ctx = src.getContext("2d")

		var c = ctx.getImageData(dx, dy, 1, 1).data;

		if (transparent(c)) {
			return false
		} else {
			var operation = configuration[src.id]
			// Clicks ignored if handler not defined for visible layer
			if(operation.events){
				if(operation.events.click){
					operation.events.click(operation)
				}
			}
			console.log("click "+ src.id);
			return true
		}
	})
}

var overCanvas = ""

function mousemoveOnCanvas(event){
	event = event || window.event
	var x = event.clientX
	var y = event.clientY

	walkcanvasses(function(src){
		var id = src.id
		var dx = x - src.offsetLeft
		var dy = y - src.offsetTop

		var ctx = src.getContext("2d")

		var c = ctx.getImageData(dx, dy, 1, 1).data;

		if (transparent(c)) {
			overCanvas = ""
			return false
		} else {
			overCanvas = src.id
			console.log("over "+ src.id);
			return true
		}
	})

}

function transparent(color) {
	var t =  color[3]
	return t == 0
}

function generateAudio(){
	var audios =getElement("audios","div").element
	for (var key in configuration){
		var element =  configuration[key]
		var rt_element =  runtime[key]
		if("operation" in element){
			var operations = element.operation
			var rt_operations = rt_element.operation
			for(var op_name in operations){
				if("sound" == op_name){
					var operation = operations.sound
					var rt_operation = rt_operations.sound
					if(Array.isArray(operation.sound)){
						rt_operation.sound = operation.sound
					} else {
						rt_operation.sound = [operation.sound]
					}
					var audioList = []
					var url_ix
					for(url_ix in rt_operation.sound){
						var url = rt_operation.sound[url_ix]
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
						source.setAttribute("src",defaults.audioLoc + url)
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
						rt_operation["switch_audio"] = false
						audio.onended=function(){
							switchAudio(rt_element, rt_operation)
						}
						audio.oncanplay= function(){
							playable_audios.push(this)
						}
					}
					rt_operation["audios"] = audioList
				}
			}
		}
	}
}

var isFileType = function (type) {
	return function(fileName){
		if(fileName.toLowerCase().endsWith(type)){
			return true
		}
		return false
	}
}

var isSvg = isFileType(".svg")

var loadedSVGs = 0
var svgImages = {}


function loadSvgImages(callback){
	svgImages = {}
	for(var key in configuration){
		var element = configuration[key]
		if(element.image){
			var images = []
			if(Array.isArray(element.image)){
				images = element.image
			} else {
				images.push(element.image)
			}
			for(var ix in images){
				var image = images[ix]
				if(isSvg(image)){
					var svgList = []
					if(image in svgImages){
						svgList = svgImages[image].list
					} else {
						svgImages[image] = {}
						svgImages[image]["list"] = svgList
					}
					if(svgList.indexOf(key) < 0){
						svgList.push([key,ix])
					}
				}
			}
		}
	}
	
	if(Object.keys(svgImages).length == 0){
		callback()
		return
	}
		
	for(var image in svgImages){
		var req = new XMLHttpRequest()
		req.open("GET", defaults.imageLoc + image, true)					
		req.overrideMimeType("image/svg+xml");
		req.onload = function(){
			if (this.status === 200) {
				var svg_element = this.responseXML.documentElement
				var svg = document.importNode(svg_element,true)
				var svg_div = $("#svgDiv")
				if(svg_div.length == 0){
					$("body").append("<div id=\"svgDiv\"></div>")
					svg_div = $("#svgDiv")
					$(svg_div).css("visibility","hidden")
				}
				$(svg_div).append(svg)
				var url = this.responseURL
				var pieces = url.split("/")
				var fName = pieces[pieces.length - 1]
				$(svg).attr("id",fName)
				var svg_children = $(svg).children()
				if(svg_children.length > 1){
					var g_id = "g_"+fName.replace(/[.]/ ,"_")
					$(svg).prepend("<g id=\""+g_id+"\"></g>")
					var g = $("#"+g_id)
					$(g).append(svg_children)
				}
				for(var ix in svgImages[fName].list){
					var key = svgImages[fName].list[ix][0]
					var image_ix = svgImages[fName].list[ix][1]
					var rt_element = runtime[key]
					var svgs
					if(rt_element.svg){
						svgs = rt_element.svg
					} else {
						svgs = {}
						rt_element["svg"] =  svgs
					}
					svgs[image_ix] = svg
				}
			} else {
				console.error(this.statusText);
			}
			loadedSVGs ++
			var images = Object.keys(svgImages).length
			if(loadedSVGs == images){
				callback()
			}
		}
		req.send()
	}
}

function getSvgDoc(svg){
	
}

var imageCnt = 0

function generateImageInfo(callback){
	for(var key in configuration){
		var element = configuration[key]
		if(element.image){
			if(Array.isArray(element.image)){
				for(var ix in element.image){
					imageCnt ++
				}
			}else {
				imageCnt ++
			}
		}
	}
	if(imageCnt == 0){
		callback()
		return
	}
	for(var key in runtime){
		var rt_element = runtime[key]
		var element = rt_element.configuration
		var images = []
		rt_element["imageinfo"] = images
		
		if(element.image){
			var image_array
			if(Array.isArray(element.image)){
				image_array = element.image
			} else {
				image_array = [element.image]
			}
			for(var image_entry in image_array){
				var imageinfo = {}
				var img
				var imageSize = null
				if("size" in element){
					imageSize = element.size
				} 
				if(rt_element.svg && rt_element.svg[image_entry]){
					imageCnt --
					imageinfo.svg = rt_element.svg[image_entry]
					if(!imageSize){
						imageSize = getSvgImageSize(imageinfo.svg)						
					}
					imageinfo.width = imageSize[0]
					imageinfo.height = imageSize[1]

					if(imageCnt == 0){
						callback()
					}
				} else {
					if(imageSize){
						img = new Image(imageSize[0], imageSize[1])
					} else {
						img = new Image();
					}
					imageinfo["image"] = img
					imageinfo["file"] = image_array[image_entry]
					img["imageinfo"] = imageinfo
					img.onload = function(){
						imageCnt --
						this.imageinfo.width = this.width
						this.imageinfo.height = this.height
						if(imageCnt == 0){
							callback()
						}
					}
					img.src = defaults.imageLoc+imageinfo.file
				}
				images.push(imageinfo)
			}
		}
	}
}

function loadLocalSvg(xml, img, imageSize, onload){
	var xml = rt_element.svg
	img = new Image();
	xml = insertImageSize(xml,imageSize)
	var DOMURL = window.URL || window.webkitURL || window;
	var svg = new Blob([xml], {type: 'image/svg+xml'})
	var url = DOMURL.createObjectURL(svg)
	onload()
	img.src = url
}

var svg_regex = /([\s\S]*[<]svg[\s\S]*)(viewBox=)(\"|\')\s*(\S+)\s*(\S+)\s*(\S+)\s*(\S*)\s*\3([\s\S]*)/
var svg_replace2 = "$1 width='$6' height='$7' $2$3$4 $5 $6 $7$3$8"


function insertImageSize(svg, imageSize){
		var svg_replace1 = "$1 width='"+imageSize[0]+"' height='"+imageSize[1]+"' $2$3$4 $5 $6 $7$3$8"
		return svg.replace(svg_regex, svg_replace1)
}

function getImageSize(svg){
	var imageSize = []
	imageSize[0] = parseFloat(svg.replace(svg_regex,"$6"))
	imageSize[1] = parseFloat(svg.replace(svg_regex,"$7"))
	return imageSize
}

var shapeCnt = 0

var loadedShapes = {}


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

function generateId(inString){
	return btoa(inString).slice(0,-2)
}

function getSvgDefs(){
	var svgDefs = document.getElementById("svgDefs")
	if(!svgDefs){
		var svgElement =getElement("svgContainer","svg","http://www.w3.org/2000/svg").element
		svgElement.setAttribute("hidden","hidden")
		svgDefs = document.createElementNS("http://www.w3.org/2000/svg","defs")
		svgDefs.setAttribute("id","svgDefs")
		svgElement.appendChild(svgDefs)
	}
	return svgDefs
}

function setImageAttributes(){
	
	for(var key in runtime){
		
		var rt_element = runtime[key]
		var element = rt_element.configuration
		if("imageinfo" in rt_element){
			var imageinfo = rt_element.imageinfo
			var image = imageinfo.image
			if(image == null){
				imageinfo["width"] = 0
				imageinfo["height"] = 0
				
			} else {
				rt_element.imageinfo["width"] = image.width
				rt_element.imageinfo["height"] = image.height
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
			// adjust at one second increments
			var nominal_second = (tick - prev_second_ticks)/(60 )
			console.log("Time:" +(now - start)/1000+" tick: " + tick +" Tick seconds " +
					tick / (60 * interval_adjustment))
			console.log(" Nominal second: " + nominal_second+ " Elapsed Ticks: " + (tick
					- prev_second_ticks))
			console.log(" Elapsed: " + elapsed+ " Nominal/Elapsed: "+ (nominal_second /
					elapsed))
			console.log(" Old Interval Adjustment: "+interval_adjustment)
			interval_adjustment = ((nominal_second / elapsed) + interval_adjustment)/2
			console.log("   New Interval Adjustment: "+interval_adjustment)
			prev_second_ticks = tick
			prev = now
		}
	}
	for (var key in runtime){
		var rt_element = runtime[key]
		if (inInterval(rt_element)){
			rt_element["active"] = true
			run(rt_element)
		} else {
			if("active" in rt_element){
				if(rt_element.active){
					inactivate(rt_element)
				}
			}
			rt_element["active"] = false
		}
	}
	tick ++;
	requestAnimFrame(function(){draw()})
}

function inInterval(rt_element){
	var element = rt_element.configuration
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
		return false
	}
	if(rt_element.show){
		return true
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
			var i0 = interval[0]
			if (i0 == "*") { 
				i0 = Number.NEGATIVE_INFINITY
			} else {
				i0 = parseFloat(i0)
			}
			var i1 = interval[1]
			if (i1 == "*") { 
				i1 = Number.POSITIVE_INFINITY
			} else {
				i1 = parseFloat(i1)
			}
			if(!(Number.isNaN(i0) || Number.isNaN(i1) || i0 > i1)){
				var first = i0 * 60 * interval_adjustment
				var last = i1 * 60 * interval_adjustment
				if((tick >= first) && (tick <= last)){
					return true
				}
			}
		}
	}
	return false
}

function getBoundaries(htmlElement) {
	  var rect = htmlElement.getBoundingClientRect();
	  return {
	    left: rect.left + window.scrollX,
	    top: rect.top + window.scrollY,
	    right: rect.right - window.scrollX,
	    bottom: rect.bottom - window.scrollY,
	    width: rect.width - (2*window.scrollX),
	    height: rect.height - (2*window.scrollY)
	  }
	}


function run(rt_element){
	if("operation" in rt_element){
		var rt_operations = rt_element["operation"]
		for (var op_key in rt_operations){
			var rt_operation = rt_operations[op_key]
			if("canvas" in rt_element){
				if(!("context" in rt_operation)){
					var context = rt_element.canvas.getContext("2d")
					rt_operation["context"] = context
				}
			}
// console.log("Invoking "+rt_element.name+"::"+op_key)
			try{
				window[op_key](rt_element, rt_operation)
			} catch (e){
			}
		}
	}
}

function inactivate(rt_element){
	var element = rt_element.configuration
	if("operation" in rt_element){
		var rt_operations = rt_element["operation"]
		for (var op_key in rt_operations){
			var rt_operation = rt_operations[op_key]
			if("canvas" in element){
				if(!("context" in rt_operation)){
					var context = element.canvas.getContext("2d")
					rt_operation["context"] = context
				}
			}
			var inactivate = op_key+"_inactivate"
// console.log("Invoking "+element.name+"::"+inactivate)
			try{
				window[inactivate](rt_element,rt_operation)
			} catch (e){
				if("context" in rt_operation){
					rt_operation.context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
				}
			}
		}
	}
}



function newAudioState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	rt_operation["state"] = {}
	rt_operation.state["sound_iteration"] = 0
	rt_operation.state["current_audio"] =  rt_operation.audios[rt_operation.state.sound_iteration]
	rt_operation.state["switch_audio"] =  rt_operation.switch_audio
	rt_operation.state.current_audio.play()
	console.log("Playing "+rt_operation.state.current_audio.getAttribute("src"))
}

function nextAudioState(rt_element, rt_operation){
	if(rt_operation.state.switch_audio){
		rt_operation.state.current_audio.pause()
		rt_operation.state.switch_audio = false
		if(rt_operation.state.sound_iteration < 0){
			rt_operation.state.sound_iteration = 0
		} else {
			rt_operation.state.sound_iteration ++
		}
		if(rt_operation.state.sound_iteration < rt_operation.audios.length){
			rt_operation.state.current_audio = operation.audios[rt_operation.state.sound_iteration]
			rt_operation.state.current_audio.play()
			console.log("Playing "+rt_operation.state.current_audio.getAttribute("src")+"("+rt_operation.state.sound_iteration+")")
		} 
		if(operation.loop){
			rt_operation.state.sound_iteration = 0
			rt_operation.state.current_audio = rt_operation.audios[rt_operation.state.sound_iteration]
			rt_operation.state.current_audio.play()
			console.log("Replaying "+rt_operation.state.current_audio.getAttribute("src"))
		}
	}
}

function sound_inactivation(rt_element, rt_operation){
	if(rt_operation.state.current_audio.ended ){
		
	} else {
		rt_operation.state.current_audio.pause()
		rt_operation.state.current_audio.current_time = 0
	}
	rt_operation.state.sound_iteration = -1
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

function getAlignedPosition(num, dimension, alignment, alignmentDef){
	var align
	
	if(!alignment){
		alignment = "center"
	}
	if(alignment in alignmentDef){
		align = alignmentDef[alignment]
	} else {
		align = alignmentDef.center
	}
		
	var pos = num + align * dimension
	
	return pos

}


function getSpeed(rt_element, rt_operation){
	var element = rt_element.configuration
	var d
	if("distance" in element){
		d = element.distance
		d = Math.max(1,d)
	} else {
		d = max_distance
	}
	var scale = max_distance / d;
	
	var speed
	var operation = rt_operation.configuration
	if(operation.speed){
		if(Array.isArray(operation.speed)){
			speed = operation.speed
		} else {
			var op = operation.speed.speed
			speed = op(rt_element,rt_operation)
		}
	} else {
		speed = [0, 0]
	}
	return {
		hspeed: speed[0] * scale / interval_adjustment,
		vspeed: speed[1] * scale / interval_adjustment
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
		 "value": parseFloat(string)		
		}

}

function nominal_ticks(){
	return (new Date() - start) / 60
}

function getReference(rt_operation,group,field){
	var operation = rt_operation.configuration
	if("reference" in operation){
		var element_name = operation.reference.element
		var operation_name = operation.reference.operation
		if(element_name in runtime){
			var rt_element = runtime[element_name]
			if(operation_name in rt_element.operation){
				var ref_operation = rt_element.operation[operation_name]
				if(group in ref_operation){
					if(field in ref_operation[group]){
						return ref_operation[group][field]
					}
				}
			}
		}
	}
	return null
}

function getPosition(rt_element, rt_operation){
	var x = null
	var y = null
	var operation = rt_operation.configuration
	if("position" in operation){
		if(Array.isArray(operation.position)){
			if(operation.position.length > 0){
				x = valueToPosition(operation.position[0], rt_element.canvas.width)
				if(operation.position.length > 1){
					y = valueToPosition(operation.position[1], rt_element.canvas.height)
				}
			}
		}
	} 
	return [x, y]
}

var contact = function (address){
	linkTo(address)
	return true
}

function include(loc){
	if($('script[src="'+loc+'"]').length == 0){
		document.write('<script src="'+loc+'"><\/script>')
	}
}

function getElementImage(rt_element, rt_operation, ix){
	if(rt_element.imageinfo[ix].svg){
// console.log("loading svg for "+rt_element.name)
		var svgImage = getSvgImage(rt_element,rt_operation, ix)
// while(1){
// if(rt_operation.loaded){
// return svgImage
// }
// setTimeout(function(){"waiting for svg load"},10)
// }
		return svgImage
	}
	return rt_element.imageinfo[ix].image
}

function getSvgImage(rt_element,rt_operation, ix){
	var element = rt_element.configuration
	if(rt_operation.meta.imagesize){
		 setSvgImageSize(rt_element.svg[ix], rt_operation.meta.imagesize)
	} else if(element.size){
		setSvgImageSize(rt_element.svg[ix], element.size)
	}else{
		 var imageSize = getSvgImageSize(rt_element.svg[ix])
		 setSvgImageSize(rt_element.svg[ix], imageSize)
	}
 	var img = new Image()
 	rt_operation.loaded = false
 	img.rt_operation = rt_operation
 	img.onload = function(){ 
 			img.rt_operation.loaded = true 
 		}
 	var svg_encoded = btoa( unescape( encodeURIComponent( rt_element.svg[ix].outerHTML ) ) ) 
 	img.src = "data:image/svg+xml;base64," + svg_encoded
 	return img
}

function getSvgImageSize(svg){
	var imageSize = []
	var width = $(svg).attr("width")
	width = normalizeSize(width)
	if(!width){
		width = getWidthFromViewbox(svg)
	}
	var height = $(svg).attr("height")
	height = normalizeSize(height)
	if(!height){
		height =  getHeightFromViewbox(svg)
	}
	return [width, height]
}

const lengthTypeMap = {
		"": 1,
		px: 1,
		pt: 72 / 96,
		em: 16,
		in: 96,
		cm: 96 / 2.54
}

function normalizeSize(size){
	if(!size){
		return undefined
	}
	if(isNaN(size)){
		var re = /^((?:\+|-)?(?:\d+(?:\.\d*)?)|(?:\.\d+))([a-zA-z]*)$/
		var matched = re.exec(size)
		if(matched){
			var num = matched[1]
			var type = matched[2]
			if(lengthTypeMap[type]){
				return matched[1] * lengthTypeMap[type]
			}
			return matched[1]
		}
		var n = parseFloat(size)
		if(isNaN(n)){
			console.log("normalizeSize("+size+"). Size cannot be parsed. 100 arbitrarily returned")
			n = 100
		}
		return n
	}
	return size
}

