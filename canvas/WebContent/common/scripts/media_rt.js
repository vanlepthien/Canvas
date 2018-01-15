media_rt.createRuntimeAudio = function() {
	var audio_elements = util.getElement("audios", "div").element
	var audiosets = AudioSet()
	var audios = Audios()
	var rt_audios = RuntimeAudio()
	for ( var key in audiosets) {
		var audioset = audiosets[key]
		var rt_audio
		if (rt_audios[key]) {
			rt_audio = rt_audios[key]
		} else {
			rt_audio = {}
			rt_audios[key] = rt_audio
			rt_audio.audios = []
		}
		for ( var url_ix in audioset.audio) {
			var url = audioset.audio[url_ix]
			var audio
			if (audios[url]) {
				audio = audios[url].audio
			} else {
				audios[url] = {}
				audio = document.createElement("audio")
				audios[url].audio = audio
				var configuration = audioset.configuration || {}
				if (configuration.loop) {
					audio.loop = true
				}
				audio.controls = false
				audio_elements.appendChild(audio)
				var audio_element_name = "audio_" + key + "_" + url_ix
				audio.setAttribute("id", audio_element_name)

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
					audioType = "audio/wav"
				}
				source.setAttribute("type", audioType)
				audio.audioset = audioset
				audio.onended = function(event) {
					var target = event.target
					if(target.operation){
						media_rt.switchAudio(target.operation)
					}
				}
				audio.oncanplay = function() {
					// is this irrelevant?
					// playable_audios.push(this)
				}
			}
			rt_audio.audios.push(audio)
		}
	}
}

media_rt.loadAudio = function() {
	$("#audios").children("audio").each(function() {
		var promise = this.play()
		if( promise !== undefined){
			promise.then(_ => {
				this.pause()
			})
		}
	})
}

media_rt.sound_inactivation = function(rt_operation) {
	if (rt_operation.state.current_audio.ended) {

	} else {
		rt_operation.state.current_audio.pause()
		rt_operation.state.current_audio.current_time = 0
	}
	rt_operation.state.sound_iteration = -1
}

media_rt.switchAudio = function(rt_operation) {
	
	if (!rt_operation.loop) {
		console.log("Sound Switch")
		rt_operation.state["switch_audio"] = true
		// Don't wait for next interval
		ops.sound.nextState(rt_operation)
	} else {
		console.log("Sound loop")
	}
}

media_rt.createRuntimeVideo = function() {
}