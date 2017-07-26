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

var playable_audios = []

function preload(){
	// start button should be hidden, but make sure
	// TODO: dynamically create start button here?

	createRuntime()
	generateCanvasses(canvascontainer, canvasmodel)
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
					console.log("No start_button")
				} 
				else {
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

function createRuntime(){
	for(var key in configuration){
		var element  = configuration[key]
		var rt_element = {}
		runtime[key] = rt_element
		rt_element["name"] = key
		rt_element["configuration"] = element
		
		// default to show element without duration
		
		if("show" in configuration[key]){
			rt_element["show"] = element.show
		} else {
			rt_element["show"] = true
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
	}
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
	var t = (color[0] + color[1] + color[2]) * color[3]
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
		if("image" in element){
			if(element.image != null){
				if(isSvg(element.image)){
					var svgList = []
					if(element.image in svgImages){
						svgList = svgImages[element.image].list
					} else {
						svgImages[element.image] = {}
						svgImages[element.image]["list"] = svgList
					}
					if(svgList.indexOf(key) < 0){
						svgList.push(key)
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
		req.open("GET", imageLoc + image, true)					
		req.overrideMimeType("image/svg+xml");
		req.onload = function(){
			if (this.status === 200) {
				var basesvg = this.response;
				var url = this.responseURL
				var pieces = url.split("/")
				var fName = pieces[pieces.length - 1]
				for(var ix in svgImages[fName].list){
					var key = svgImages[fName].list[ix]
					var rt_element = runtime[key]
// var element = rt_element.configuration
					var svg = basesvg
					rt_element["svg"] = svg
// if("size" in element){
// svg.width = element.size[0]
// svg.height = element.size[1]
// } else { // use viewBox
// svg.width = svg.viewBox.baseVal.width
// svg.height = svg.viewBox.baseVal.height
// }
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
	if(imageCnt == 0){
		callback()
		return
	}
	for(var key in runtime){
		var rt_element = runtime[key]
		var element = rt_element.configuration
		var imageinfo = {}
		rt_element["imageinfo"] = imageinfo	
		if("image" in element){
			if(element.image == null){
				imageinfo["image"] = null
			} else {
				var img
				var imageSize = null
				if("size" in element){
					imageSize = element.size
				} else if("sizetype" in element){
					imageSize = sizes[element.sizetype]
				}
				if(rt_element.svg){
					var xml = rt_element.svg
					img = new Image();
					imageinfo["image"] = img	
					if(!imageSize){
						imageSize = getImageSize(xml)
					}
					xml = insertImageSize(xml,imageSize)
					rt_element.imageinfo.width = imageSize[0]
					rt_element.imageinfo.height = imageSize[1]
					var DOMURL = window.URL || window.webkitURL || window;
					var svg = new Blob([xml], {type: 'image/svg+xml'})
					var url = DOMURL.createObjectURL(svg)
					img.onload = function(){
						DOMURL.revokeObjectURL(url)
						imageCnt --
						if(imageCnt == 0){
							callback()
						}
					}
					img.src = url
				} else {
					if(imageSize){
						img = new Image(imageSize[0], imageSize[1])
					} else {
						img = new Image();
					}
					imageinfo["image"] = img
					img["imageinfo"] = imageinfo
					img.onload = function(){
						imageCnt --
						this.imageinfo.width = this.width
						this.imageinfo.height = this.height
						if(imageCnt == 0){
							callback()
						}
					}
					img.src = imageLoc+element.image
				}
			}
		}
	}
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

// var svgRequest = function(rt_operation,callback){
// var operation = rt_operation.configuration
// if(operation.shape in loadedShapes){
// createSvgRef(rt_operation, loadedShapes[operation.shape])
// shapeCnt --
// if(shapeCnt == 0){
// callback()
// }
// } else {
// var req = new XMLHttpRequest()
//	
// req.open("GET", imageLoc + operation.shape, true)
// req.overrideMimeType("image/svg+xml");
// req.onload = function(){
// if (req.status === 200) {
// var svgDefs = getSvgDefs()
// var svg = req.responseXML.documentElement;
// var svgDef = addSvgDef(svgDefs,svg)
// svgDef.setAttribute('id',operation.id)
// addTriggers(svgDef,operation)
// loadedShapes[operation.shape] = svgDef
// createSvgRef(rt_operation, svgDef)
// } else {
// console.error(req.statusText);
// }
// shapeCnt --
// if(shapeCnt == 0){
// callback()
// }
// }
// req.send()
// }
// }
//
// function addTriggers(svg, operation){
//	
// var svgElements = svg.getElementsByTagName("*")
// for (var ix = 0; ix < svgElements.length; ix++){
// var e = svgElements.item(ix)
// if(e.tagName.toLowerCase() != "g"){
// if(operation.callback){
// $(e).on("click",operation, function(operation){operation.onclick()})
// } else {
// $(e).on("click", function(){alert(operation.name)})
// }
// }
// }
// }
//
// function addSvgDef(svgDefs, svgDocument){
// var fragment = createDefFromDocument( svgDocument)
// svgDefs.appendChild(fragment)
// return fragment
// }
//
// function createDefFromDocument(svgDocument){
// var svg
// if(svgDocument.tagName == "svg"){
// svg = svgDocument
// } else {
// svg = svgDocument.getElementsByTagName("svg")[0]
// }
// var g = document.createElement("g")
// var children = svg.childNodes
// for(var ix =0; ix < children.length; ix++){
// var child = svg.childNodes[ix]
// var clone = child.cloneNode(true)
// g.appendChild(clone)
// }
// return g
// }
//
// function createSvgRef(rt_operation,svgDef){
// var ref_element
// var ref_operation = null
// var operation = rt_operation.configuration
// var refElementName = operation.action.reference.element
// if(refElementName in configuration){
// ref_element = configuration[refElementName]
// var refOperationName = operation.action.reference.operation
// if (refOperationName in ref_element.operation){
// ref_operation = ref_element.operation[refOperationName]
// rt_operation["ref_operation"] = ref_operation
// }
// }
// if(ref_operation == undefined){
// return
// }
// var svgDivFetch = getElement("svgDiv", "div")
// var svgDiv = svgDivFetch.element
// if(svgDivFetch.generated){
// svgDiv.innerHTML = "<p>Generated References to SVG definitions</p>"
// }
// var svgRef = document.createElementNS("http://www.w3.org/2000/svg","svg")
// svgDiv.appendChild(svgRef)
// // TODO add real height & width
// svgRef.setAttribute("id","ref_"+rt_operation.id)
// svgRef.setAttribute("width",rt_operation.element.imageinfo.width )
// svgRef.setAttribute("height",rt_operation.element.imageinfo.height )
// svgRef.setAttribute("viewBox","0 0 "+rt_operation.element.imageinfo.width +"
// "+ rt_operation.element.imageinfo.height )
// svgRef.setAttribute("preserveAspectRatio","xMinYMin meet" )
// svgRef.style.position = "absolute"
// svgRef.style.top = "0px"
// svgRef.style.left = "0px"
// svgRef.style.zIndex = 20;
// svgRef.style.opacity= 0
// rt_operation["svg_ref"] = svgRef
// var svgUse = document.createElementNS("http://www.w3.org/2000/svg","use")
// svgRef.appendChild(svgUse)
// svgUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href',
// "#"+rt_operation.id);
// svgUse.setAttribute("x", 0);
// svgUse.setAttribute("y", 0);
// svgRef.setAttribute("onclick","alert('"+operation.action.reference.element+":
// "+operation.action.reference.operation+" "+operation.name+"')")
// svgUse.setAttribute("onclick","alert('"+operation.action.reference.element+":
// "+operation.action.reference.operation+" "+operation.name+"')")
//	
// // svgUse.setAttribute("hidden","hidden")
// }

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
	for(var key in runtime){
		var rt_element = runtime[key]
		var element = rt_element.configuration
		if("operation" in rt_element){
			if("button" in rt_element.operation){
				var rt_operation = rt_element.operation.button
				var operation = rt_operation.configuration
				if("shape" in operation){
					rt_operation["id"] = generateId(operation.shape)
					if(typeof SVGPathElement === "undefined"){
						
					} else {
						svgRequest(rt_operation, callback)
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
		svgElement.setAttribute("hidden","hidden")
		svgDefs = document.createElementNS("http://www.w3.org/2000/svg","defs")
		svgDefs.setAttribute("id","svgDefs")
		svgElement.appendChild(svgDefs)
	}
	return svgDefs
}

// function generateOperations(){
// for(var key in configuration){
// var element = configuration[key]
// var element = rt_element[key]
// if("operation" in element){
// var operations = element.operation
// for(var op_name in operations){
// var operation = operations[op_name]
// console.log("Creating "+ element.name+"::"+op_name)
// operation["name"] = op_name
// }
// }
// }
// }

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
// var nominal_second = (tick - prev_second_ticks)/(60 * interval_adjustment)
// console.log("Time:" +(now - start)/1000+" tick: " + tick +" Tick seconds " +
// tick / (60 * interval_adjustment))
// console.log(" Nominal second: " + nominal_second+ " Elapsed Ticks: " + (tick
// - prev_second_ticks))
// console.log(" Elapsed: " + elapsed+ " Nominal/Elapsed: "+ (nominal_second /
// elapsed))
// console.log(" Old Interval Adjustment: "+interval_adjustment)
// interval_adjustment = ((nominal_second / elapsed) + interval_adjustment)/2
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

function sound(rt_element, rt_operation){
	var state 
	if(rt_operation.initialized){
		nextAudioState(rt_element, rt_operation)
	} else {
		newAudioState(rt_element, rt_operation)
		rt_operation.initialized = true
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

function switchAudio(rt_element, rt_operation){
	var operation = rt_operation.configuration
	if(!operation.loop){
		console.log("Sound Switch")
		rt_operation.state["switch_audio"] = true
		// Don't wait for next interval
		nextAudioState(rt_element, rt_operation)
	} else {
		console.log("Sound loop")
	}
}

function bounce(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextBounceState(rt_element, rt_operation)
	} else {
		newBounceState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
	context.drawImage(rt_element.imageinfo.image, state.x, state.y)
}

function newBounceState(rt_element, rt_operation){
	
	// [x,y] are the coordinates of the top left corner
	// x_left = x
	// x_right = x + imageinfo.width
	// y_top = y
	// y_bottom = y + imageinfo.height
	var top, bottom
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	if("top" in operation){
		top = valueToPosition(operation.top, rt_element.canvas.height)
	} else {
		top = valueToPosition("20%", rt_element.canvas.height)
	}
	if("bottom" in operation){
		bottom = valueToPosition(operation.bottom, rt_element.canvas.height)
	} else {
		bottom = valueToPosition("80%", rt_element.canvas.height)
	}
	
	var x = null
	var y = null
	var direction = null
	if("reference" in operation){
		x = getReference(rt_operation,"state","x")
		y = getReference(rt_operation,"state","y")
		direction = getReference(rt_operation,"state","direction")
	}
	if(!direction){
		direction = 1
	}
	
	var align 
	if("align" in element){
		align = element.align
	} else {
		align = ["canter", "center"]
	}

	if(x == null || y == null){
		var xy = getPosition(rt_element, rt_operation)
		if(x == null) {
			x = xy[0]
			x = getAlignedPosition(x, rt_element.imageinfo.width, align[0], x_alignment)
		}
		if(y == null){
			y = xy[1]
			y = getAlignedPosition(y, rt_element.imageinfo.height, align[1], y_alignment)
		}
		
	}
	
	if (x == null){
		x = element.canvas.width / 2
	}
	if (y == null){
		y = (top + bottom) / 2
	}
	
	
	
	var x_left = x 
	var x_right = x + rt_element.imageinfo.width
	var y_top = y
	var y_bottom = y + rt_element.imageinfo.height
	
	var state = {}

	
	state["x"] = x
	state["y"] = y
	state["direction"] = direction
	rt_operation.state = state
	
	var meta = {}
	meta["top"] = top
	meta["bottom"] = bottom
	rt_operation.meta = meta
}

function nextBounceState(rt_element, rt_operation){
// Less is more in the y direction
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	
	var x = state.x + speed.hspeed
	var y = state.y + (state.direction * speed.vspeed)
	
	var x_left = x 
	var x_right = x + rt_element.imageinfo.width
	var y_top = y
	var y_bottom = y + rt_element.imageinfo.height

	
	if(state.direction < 0){
		if(y_top <= meta.top){
			state.direction = 1
		}
	} else {
		if(y_bottom >= meta.bottom){
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

function move(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextMoveState(rt_element, rt_operation)
	} else {
		newMoveState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var operation = rt_operation.configuration
	var state = rt_operation.state
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
// console.log("image: ("+state.x+", "+state.y+",
// "+rt_element.imageinfo.image.width+",
// "+rt_element.imageinfo.image.height+")")
	if(operation.cycle){
		for(var x_ix in state.x_vector){
			for(var y_ix in state.y_vector){
				context.drawImage(
						rt_element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
			}
		}
	} else {
		context.drawImage(rt_element.imageinfo.image, state.x, state.y)
	}
}

function newMoveState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	var state = {}
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_element.canvas.width
	meta["height"] =  rt_element.canvas.height
	meta["imagewidth"] =  rt_element.imageinfo.width
	meta["imageheight"] =  rt_element.imageinfo.height
	rt_operation["meta"] = meta
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
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
	if (x == Number.MAX_VALUE){
		x = rt_element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y = rt_element.canvas.height / 2
	}
	
	var align
	if("align" in element){
		align = element.align
	} else {
		align = ["center","center"]
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
	state["x"] = x += rt_element.imageinfo.width * x_align
	state["y"] = y += rt_element.imageinfo.height * y_align

	updateMoveState(rt_element, rt_operation)

}

function nextMoveState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	state.x = (state.x + speed.hspeed) %  meta.width 
	state.y = (state.y + speed.vspeed) %  meta.height
	updateMoveState(rt_element, rt_operation)
}

function updateMoveState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getMoveVector(state.x_pos, meta.width, rt_element.canvas.width)
	state["y_vector"] = getMoveVector(state.y_pos, meta.height, rt_element.canvas.height)
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
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
}

function fixed(rt_element, rt_operation){
	if(!rt_operation.initialized){
		newFixedState(rt_element, rt_operation)
		rt_operation.initialized = true;
	}
	var meta = rt_operation.meta
	var context = rt_operation.context
	context.clearRect(0,0,rt_element.canvas.width,rt_element.canvas.height)
	context.drawImage(
			rt_element.imageinfo.image, meta.x, meta.y)
	if(rt_element.configuration.image.startsWith("button_home")){
// console.log("drawing "+rt_element.configuration.image)
// console.log("overCanvas "+ overCanvas)
	}
}

function newFixedState(rt_element, rt_operation){
	var operation = rt_operation.configuration
	var element = rt_element.configuration
	var canvas = rt_element.canvas
	var position, align
	if("position" in operation){
		position = operation.position
	} else {
		position = ["50%","50%"]
	}
	var x = Number.MAX_VALUE
	var y = Number.MAX_VALUE
	if(Array.isArray(operation.position)){
		if(operation.position.length > 0){
			x = valueToPosition(operation.position[0], rt_element.canvas.width)
			if(operation.position.length > 1){
				y = valueToPosition(operation.position[1], rt_element.canvas.height)
			} else {
				y = valueToPosition("50%", rt_element.canvas.height)					
			}
		} else {
			x = valueToPosition("50%", rt_element.canvas.width)					
			y = valueToPosition("50%", rt_element.canvas.height)								
		}
	}
	
	if (x == Number.MAX_VALUE){
		x = rt_element.canvas.width / 2
	}
	if (y == Number.MAX_VALUE){
		y =  rt_element.canvas.height / 2
	}
	
	if("align" in element){
		align = element.align
	} else {
		align = ["center","center"]
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
	meta["x"] = x += rt_element.imageinfo.width * x_align
	meta["y"] = y += rt_element.imageinfo.height * y_align
	
	rt_operation.meta  = meta
}


function pan(rt_element, rt_operation){
	if(rt_operation.initialized){
		nextPanState(rt_element, rt_operation)
	} else {
		newPanState(rt_element, rt_operation)
		rt_operation.initialized = true
	}
	var state = rt_operation.state
	var context = rt_operation.context
	for(var x_ix in state.x_vector){
		for(var y_ix in state.y_vector){
			context.drawImage(
					rt_element.imageinfo.image, state.x_vector[x_ix], state.y_vector[y_ix])
		}
	}
}

function newPanState(rt_element, rt_operation){
	var state = {}
	state["x"] = 0
	state["y"] = 0
	rt_operation["state"] = state
	var meta = {}
	meta["width"] =  rt_element.imageinfo.width
	meta["height"] =  rt_element.imageinfo.height
	rt_operation["meta"] = meta
	updatePanState(rt_element, rt_operation)
}

function nextPanState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	var speed = getSpeed(rt_element, rt_operation)
	state["x"] = (state.x + speed.hspeed) %  meta.width 
	state["y"] = (state.y + speed.vspeed) %  meta.height
	updatePanState(rt_element, rt_operation)
}

function updatePanState(rt_element, rt_operation){
	var state = rt_operation.state
	var meta = rt_operation.meta
	state["x_pos"] = state.x
	if(state.x_pos > 0){
		state.x_pos -= meta.width
	}
	state["y_pos"] = state.y
	if(state.y_pos > 0){
		state.y_pos -= meta.width
	}
	
	state["x_vector"] = getPositionVector(state.x_pos, meta.width, rt_element.canvas.width)
	state["y_vector"] = getPositionVector(state.y_pos, meta.height, rt_element.canvas.height)
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

function fill(rt_element, rt_operation){
	var context = rt_operation.context
	var operation = rt_operation.configuration 
	if(operation.color){
		context.fillStyle = operation.color
	} else {
		context.fillStyle = 'purple'
	}
	if(operation.shape){
		var shape = operation.shape
		var func = shape["function"]
		var callParms = []
		if(shape.parms){
			callParms = shape.parms.slice(0)
		} else if (shape.borders){
			var borders = shape.borders
			callParms.push(borders[0])
			callParms.push(borders[1])
			var width = context.canvas.width
			var height = context.canvas.height
			callParms.push(context.canvas.width - borders[2] - borders[0])
			callParms.push(context.canvas.height - borders[3] - borders[1])
		}
		var f = context[func]
		context[func].apply(context, callParms)
	} else {
		context.fillRect(0,0,context.canvas.width,context.canvas.height)
	}
	
}

function show(rt_element, rt_operation){
	var operation = rt_operation.configuration
	rt_element.show = operation.canvas.indexOf(overCanvas) >= 0
}

function show_overlay(rt_element, rt_operation){
	if(overCanvas == rt_element.name){
		var operation = rt_operation.configuration
		var canvas = operation.canvas
		for(var ix in canvas){
			var oName = canvas[ix]
			var rt_overlay = runtime[oName]
			rt_overlay.show = true
		}
	}
}

function button(rt_element, rt_operation){
// console.log("Button")
// console.log("style: "+operation.svg_ref.style.cssText)
// console.log("x: "+operation.ref_operation.state.x)
// console.log("y: "+operation.ref_operation.state.y)
	var x = (rt_operation.ref_operation.state.x + rt_operation.ref_operation.meta.width) %  rt_operation.ref_operation.meta.width
	var y = (rt_operation.ref_operation.state.y + rt_operation.ref_operation.meta.height) %  rt_operation.ref_operation.meta.height
	rt_operation.svg_ref.style.left = x
	rt_operation.svg_ref.style.top = y
	rt_operation.svg_ref.style.fillOpacity = 0
	rt_operation.svg_ref.fill = "#ff0000"
// console.log("New x: "+ x + " svg.style.left: "+operation.svg_ref.style.left)
// console.log("New y: "+ y + " svg.style.top: "+operation.svg_ref.style.top)
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
	if("speed" in operation){
		speed = operation.speed
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
