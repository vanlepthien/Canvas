'use strict'

var canvas_base = {}

canvas_base.runtime = {}

canvas_base.event = new SortedMap()

canvas_base.imageset = {}

canvas_base.audioset = {}

canvas_base.videoset = {}

canvas_base.runtime_images = {}

canvas_base.runtime_audios = {}

canvas_base.runtime_videos = {}

canvas_base.images = {}

canvas_base.audios = {}

canvas_base.videos = {}

canvas_base.operation = {}

canvas_base.running = {}

// Derived backwards map of imageset to runtime
// entries created in rt_resolve

canvas_base.image_runtime_map = {}

// maps canvas to z-index
// currently a fixed mapping, but will change with dynamic distance

canvas_base.canvas_map = {}

// runtime methods container
var rt = {}

// operations methods container
var ops = {}

//runtime image methods container

var image_rt = {}

//runtime audio and video methods container

var media_rt = {}

// event methods container

var event_rt = {}

// canvas management

var canvasses = {}
canvasses.overCanvas = ""

// Define functions to access globals

var Runtime = function(){return canvas_base.runtime}
var Events = function(){return canvas_base.event}
var Running = function(){return canvas_base.running}
var ImageSet = function(){return canvas_base.imageset}
var AudioSet = function(){return canvas_base.audioset}
var VideoSet = function(){return canvas_base.videoset}
var RuntimeImage = function(){return canvas_base.runtime_images}
var RuntimeAudio = function(){return canvas_base.runtime_audios}
var RuntimeVideo = function(){return canvas_base.runtime_videos}
var Images = function(){return canvas_base.images}
var Audios = function(){return canvas_base.audios}
var Videos = function(){return canvas_base.videos}
var Operation = function(){return canvas_base.operation}
var CanvasMap = function(){return canvas_base.canvas_map}
var ImageToRuntime = function(){return canvas_base.image_runtime_map}
