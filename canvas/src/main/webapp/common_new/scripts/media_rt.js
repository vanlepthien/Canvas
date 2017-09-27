media_rt.createRuntimeAudio = function() {
	function generateAudio() {
		var audios = util.getElement("audios", "div").element
		var audiosets = AudioSet()
		var audios = Audios()
		for (var key in audiosets) {
			var audioset = audiosets[key]
			var audioList = []
			var url_ix
			for (url_ix in audioset.audio) {
				var url = audioset.audio[url_ix]
				var audio = document.createElement("audio")
				if (operation.loop) {
					audio.loop = true
				}
				audio.controls = false
				audios.appendChild(audio)
				var audio_element_name = "audio_" + key + "_" + url_ix
				audio.setAttribute("id", audio_element_name)
				audioList.push(audio)

				var source = document.createElement("source")
				audio.appendChild(source)
				source.setAttribute("src", defaults.audioLoc + url)
				var audioType
				var suffix = url.substring(url.lastIndexOf("."))
				switch (suffix) {
				default:
				case ".mpg":
				case ".mpeg":
				case ".mp3":
					audioType = "audio/mpeg"
					break

				case ".ogg":
					audioType = "audio/ogg"
					break
				case ".wav":
					audeoType = "audio/wav"
				}
				source.setAttribute("type", audioType)
				rt_operation["switch_audio"] = false
				audio.rt_operation = rt_operation
				audio.onended = function() {
					media_rt.switchAudio(audio.rt_operation)
				}
				audio.oncanplay = function() {
					// is this irrelevant?
					// playable_audios.push(this)
				}
			}
			rt_operation["audios"] = audioList
		}
	}
}

media_rt.loadAudio = function () {
	$("#audios").children("audio").each(function() {
		this.load()
		this.play()
		this.pause()
	})
}

media_rt.sound_inactivation = function(rt_operation){
	if(rt_operation.state.current_audio.ended ){
		
	} else {
		rt_operation.state.current_audio.pause()
		rt_operation.state.current_audio.current_time = 0
	}
	rt_operation.state.sound_iteration = -1
}

media_rt.switchAudio = function(rt_operation){
	if(!rt_operation.loop){
		console.log("Sound Switch")
		rt_operation.state["switch_audio"] = true
		// Don't wait for next interval
		ops.sound[nextSoundState](rt_operation)
	} else {
		console.log("Sound loop")
	}
}


media_rt.createRuntimeVideo = function() {}