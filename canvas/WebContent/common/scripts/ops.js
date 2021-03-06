/**
 * 
 */
'use strict'

ops.bounce = {
    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.bounce.inactivate( rt_operation )
            return
        }

        if ( rt_operation.initialized ) {
            ops.bounce.nextState( rt_operation )
        } else {
            ops.bounce.newState( rt_operation )
            rt_operation.initialized = true
        }
        if ( util.redraw( rt_operation ) ) {
            var state = rt_operation.state
            var context = rt_operation.context
            context.clearRect( 0, 0, rt_operation.canvas.width,
                rt_operation.canvas.height )
            if ( !util.offCanvasActions( rt_operation ) ) {
                context.drawImage( rt_operation.image.images[0].image, state.x,
                    state.y )
            }
        }
    },

    newState: function( rt_operation ) {

        // [x,y] are the coordinates of the top left corner
        // x_left = x
        // x_right = x + images[0].width
        // y_top = y
        // y_bottom = y + images[0].height
        var top, bottom
        if ( "top" in rt_operation ) {
            top = util.valueToPosition( rt_operation.top,
                rt_operation.canvas.height )
        } else {
            top = util.valueToPosition( "20%", rt_operation.canvas.height )
        }
        if ( "bottom" in rt_operation ) {
            bottom = util.valueToPosition( rt_operation.bottom,
                rt_operation.canvas.height )
        } else {
            bottom = util.valueToPosition( "80%", rt_operation.canvas.height )
        }

        var x = null
        var y = null
        var direction = null
        if ( "reference" in operation ) {
            x = getReference( rt_operation, "state", "x" )
            y = getReference( rt_operation, "state", "y" )
            direction = getReference( rt_operation, "state", "direction" )
            rt_operation.position = [x, y]
        }
        if ( !direction ) {
            direction = 1
        }


        var state = rt_operation.state || {}

        state.width = rt_operation.width || rt_operation.image.images[0].width || rt_operation.image.images[0].image.width
        state.height = rt_operation.height
            || rt_operation.image.images[0].height || rt_operation.image.images[0].image.height

        rt_operation.state = state

        // util.getInitialPosition reeuires rt_operation.state.width and
        // rt_operation.state.height to be set

        var xy = util.getInitialPosition( rt_operation )

        x = xy[0]
        y = xy[1]

        var x_left = x
        var x_right = x + state.width
        var y_top = y
        var y_bottom = y + state.height

        state.x = x
        state.y = y
        state.direction = direction

        var meta = rt_operation.meta || {}
        meta.top = top
        meta.bottom = bottom
        rt_operation.meta = meta
    },

    nextState: function( rt_operation ) {
        // Less is more in the y direction
        var state = rt_operation.state
        var meta = rt_operation.meta
        var speed = util.getSpeed( rt_operation )

        var x = state.x + speed.hspeed
        var y = state.y + ( state.direction * speed.vspeed )

        var x_left = x
        var x_right = x + state.width
        var y_top = y
        var y_bottom = y + state.height

        if ( state.direction < 0 ) {
            if ( y_top <= meta.top ) {
                state.direction = 1
            }
        } else {
            if ( y_bottom >= meta.bottom ) {
                state.direction = -1
            }
        }
        state.x = x
        state.y = y

    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    },

}

ops.move = {
    default_fields: ["image_ix", "width", "height", "x", "y", "hspeed", "vspeed"],

    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.move.inactivate( rt_operation )
            return
        }

        if ( rt_operation.initialized ) {
            ops.move.nextState( rt_operation )
        } else {
            ops.move.newState( rt_operation )
            rt_operation.initialized = true
        }
        util.setImageState( rt_operation )
        ops.move.updateState( rt_operation )
        var state = rt_operation.state
        var fields = ops.move.default_fields
        if ( state.fields ) {
            fields = fields.concat( state.fields )
        }
        if ( util.redraw( rt_operation, fields ) ) {
            util.getElementImage( rt_operation, state.image_ix,
                function( img ) {
                    var rt_operation = img.rt_operation
                    var context = rt_operation.context
                    context.globalAlpha = 1.0

                    var state = rt_operation.state
                    var previous = rt_operation.previous

                    if ( previous ) {
                        if ( rt_operation.cycle ) {
                            for ( var x_ix in state.x_vector ) {
                                for ( var y_ix in state.y_vector ) {
                                    var clear_x = state.x_vector[x_ix] - ( 5 + Math.abs( state.hspeed ) )
                                    var clear_y = state.y_vector[y_ix] - ( 5 + Math.abs( state.vspeed ) )
                                    var clear_width = previous.width * 2 * ( 5 + Math.abs( state.hspeed ) )
                                    var clear_height = previous.height * 2 * ( 5 + Math.abs( state.vspeed ) )
                                    console.log( "clear " + rt_operation.name + ": (" + clear_x + ", " + clear_y + ", " + ( clear_x + clear_width ) + ", " + ( clear_y + clear_height ) + ")" )
                                    context.clearRect( clear_x, clear_y, clear_width, clear_height )
                                    // context.rect(clear_x,clear_y,clear_width,clear_height)
                                    // context.stroke()
                                }
                            }
                        } else {
                            context.clearRect(
                                previous.x - ( 5 + Math.abs( state.hspeed ) ),
                                previous.y - ( 5 + Math.abs( state.vspeed ) ),
                                previous.width + 2 * ( 5 + Math.abs( state.hspeed ) ),
                                previous.height + 2 * ( 5 + Math.abs( state.vspeed ) ) )
                        }
                    } else {
                        context.clearRect(
                            state.x - ( 5 + Math.abs( state.hspeed ) ),
                            state.y - ( 5 + Math.abs( state.vspeed ) ),
                            state.width + 2 * ( 5 + Math.abs( state.hspeed ) ),
                            state.height + 2 * ( 5 + Math.abs( state.vspeed ) )
                        )
                    }

                    if ( rt_operation.cycle ) {
                        for ( var x_ix in state.x_vector ) {
                            for ( var y_ix in state.y_vector ) {
                                var draw_x = state.x_vector[x_ix]
                                var draw_y = state.y_vector[y_ix]
                                var draw_width = state.width
                                var draw_height = state.height
                                console.log( "draw  " + rt_operation.name + ": (" + draw_x + ", " + draw_y + ", " + draw_width + ", " + draw_height + ")" )
                                context.drawImage( img, state.x_vector[x_ix], state.y_vector[y_ix] )
                            }
                        }
                    } else {
                        context.drawImage( img, state.x, state.y )
                    }
                }
            )
        }
    },

    newState: function( rt_operation ) {
        var state = rt_operation.state || {}
        var speed = util.getSpeed( rt_operation )
        state.hspeed = speed.hspeed
        state.vspeed = speed.vspeed
        state.width = rt_operation.width || rt_operation.image.images[0].width || rt_operation.image.images[0].image.width
        state.height = rt_operation.height
            || rt_operation.image.images[0].height || rt_operation.image.images[0].image.height
        rt_operation.state = state
        var meta = rt_operation.meta || {}
        meta.interval = 10
        if ( rt_operation.interval ) {
            meta.interval = rt_operation.interval
        }
        rt_operation.meta = meta

        var xy = util.getInitialPosition( rt_operation )
        state.x = xy[0]
        state.y = xy[1]

        state.tick = tick

        state.time = getCurrentTime()

        state.image_ix = 0;
    },

    nextState: function( rt_operation ) {
        var state = rt_operation.state
        var meta = rt_operation.meta
        var speed = util.getSpeed( rt_operation )
        state.hspeed = speed.hspeed
        state.vspeed = speed.vspeed
        state.x = ( state.x + speed.hspeed ) % rt_operation.canvas.width
        state.y = ( state.y + speed.vspeed ) % rt_operation.canvas.height
        var image_cnt = Object.keys( rt_operation.image.images ).length
        state.image_ix = util.nextImageIx( state, meta.interval, image_cnt )
    },

    updateState: function( rt_operation ) {
        var state = rt_operation.state
        var meta = rt_operation.meta
        state.x_pos = state.x
        if ( state.x_pos > 0 ) {
            state.x_pos -= rt_operation.canvas.width
        }
        state.y_pos = state.y
        if ( state.y_pos > 0 ) {
            state.y_pos -= rt_operation.canvas.width
        }

        state.x_vector = ops.move.getVector( state.x_pos, state.width,
            rt_operation.canvas.width )
        state.y_vector = ops.move.getVector( state.y_pos, state.height,
            rt_operation.canvas.height )
    },

    getVector: function( pos, image_size, canvas_size ) {
        var vector = []
        var p = pos
        while ( p < canvas_size ) {
            if ( p + image_size > 0 ) {
                vector.push( p )
            }
            p += canvas_size
        }
        return vector
    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    },

}

ops.clear = {
    run: function( rt_operation ) {
        var context = rt_operation.context
        context.clearRect( 0, 0, rt_operation.canvas.width,
            rt_operation.canvas.height )
        var running = Running()
        delete running[rt_operation.name]
    }
}

ops.run = {
    run: function( rt_operation ) {
        if ( rt_operation.disabled ) {
            return
        }
        if ( rt_operation.terminate ) {
            ops.run.inactivate( rt_operation )
            return
        }
        if ( rt_operation.initialized ) {
            ops.run.nextState( rt_operation )
        } else {
            ops.run.newState( rt_operation )
            rt_operation.initialized = true
        }
        if ( rt_operation.run && typeof rt_operation.run == "function" ) {
            rt_operation.run( rt_operation )
        }
    },

    nextState: function( rt_operation ) {
        if ( rt_operation.next ) {
            rt_operation.next( rt_operation )
        }
    },

    newState: function( rt_operation ) {
        rt_operation.state = rt_operation.state || {}
        for ( var key in rt_operation ) {
            if ( !( typeof rt_operation[key] == "function" ) ) {
                rt_operation.state[key] = rt_operation[key]
            }
        }
        if ( rt_operation.init && typeof rt_operation.init == "function" ) {
            rt_operation.init( rt_operation )
        }
    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    }

}

ops.fixed = {
    default_fields: ["image_ix", "width", "height", "x", "y"],

    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.fixed.inactivate( rt_operation )
            return
        }
        if ( rt_operation.initialized ) {
            ops.fixed.nextState( rt_operation )
        } else {
            ops.fixed.newState( rt_operation )
            rt_operation.initialized = true;
        }

        util.setImageState( rt_operation )
        var state = rt_operation.state
        var fields = ops.fixed.default_fields
        if ( state.fields ) {
            fields = fields.concat( state.fields )
        }
        if ( util.redraw( rt_operation, fields ) ) {
            rt_operation.refresh = true
            util.getElementImage( rt_operation, state.image_ix,
                function( img ) {
                    var rt_operation = img.rt_operation
                    var context = rt_operation.context
                    context.clearRect( 0, 0, rt_operation.canvas.width, rt_operation.canvas.height )
                    var state = rt_operation.state
                    context.drawImage( img, state.x, state.y )
                }
            )
        }
    },

    nextState: function( rt_operation ) {
        var meta = rt_operation.meta
        var state = rt_operation.state
        var image_cnt = Object.keys( rt_operation.image.images ).length
        state.image_ix = util.nextImageIx( state, meta.interval, image_cnt )
    },

    newState: function( rt_operation ) {

        var state = rt_operation.state || {}
        state.tick = tick
        state.time = getCurrentTime()
        state.image_ix = 0
        state.width = rt_operation.width || rt_operation.image.images[0].width
        state.height = rt_operation.height
            || rt_operation.image.images[0].height

        rt_operation.state = state

        var canvas = rt_operation.canvas
        var position, align
        if ( "position" in rt_operation ) {
            position = rt_operation.position
        } else {
            position = ["50%", "50%"]
            rt_operation.position = position
        }

        var meta = rt_operation.meta || {}

        var xy = util.getInitialPosition( rt_operation )
        state.x = meta.x = xy[0]
        state.y = meta.y = xy[1]

        if ( rt_operation.interval ) {
            meta.interval = rt_operation.interval
        } else {
            meta.interval = 100
        }

        rt_operation.meta = meta
    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    },

}

ops.text = {
    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.text.inactivate( rt_operation )
            return
        }
        if ( !rt_operation.initialized ) {
            ops.text.newState( rt_operation )
            rt_operation.initialized = true;
            var meta = rt_operation.meta
            var context = rt_operation.context
            context.clearRect( 0, 0, rt_operation.canvas.width,
                rt_operation.canvas.height )
            context.drawImage( rt_operation.image.images[0].image, meta.x,
                meta.y )
        }
    },

    newState: function( rt_operation ) {

        var state = rt_operation.state || {}

        for ( var key in rt_operation ) {
            var type = typeof rt_operation[key]
            switch ( type ) {
                case 'function':
                    break
                case 'object':
                    state[key] = $.extend( true, {}, rt_operation[key] )
                    break
                default:
                    state[key] = rt_operation[key]
            }
        }

        var xy = util.getInitialPosition( rt_operation )
        state.x = xy[0]
        state.y = xy[1]

        rt_operation.state = state


        var fill = state.fill || "#000000"
        var stroke = state.stroke || "#000000"

        var text = state.text || rt_operation.text( rt_operation )

        var font_family = ""
        if ( state.font_family ) {
            font_family = ' font-family="' + state.font_family + '" '
        }

        var font_size = ""
        if ( state.font_size ) {
            font_size = ' font-size="' + state.font_size + '" '
        }

        state.svg = '<svg width="' + state.width + '"' +
            ' height="' + state.height + '"' +
            ' viewBox="0 0 ' + state.width + ' ' + state.height + '" >' +
            '<g>' +
            '<text text-anchor="start" ' +
            'x="' + state.x + '" ' +
            'y="' + state.y + '" ' +
            font_family +
            font_size +
            ' stroke="' + stroke + '" ' +
            'fill="' + fill + '">'
            + text + '</text>' +
            '</g>'
            + '</svg>'

    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    },

}

ops.pan = {
    default_fields: ["x", "y"],

    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.pan.inactivate( rt_operation )
            return
        }
        if ( rt_operation.initialized ) {
            ops.pan.nextState( rt_operation )
        } else {
            ops.pan.newState( rt_operation )
            rt_operation.initialized = true
        }
        ops.pan.updateState( rt_operation )
        var state = rt_operation.state
        var context = rt_operation.context
        var fields = ops.pan.default_fields
        if ( state.fields ) {
            fields = splice( fields, 0, state.fields )
        }
        if ( util.redraw( rt_operation, fields ) ) {
            util.getElementImage( rt_operation, 0,
                function( img ) {
                    var rt_operation = img.rt_operation
                    var state = rt_operation.state
                    var context = rt_operation.context
                    context.clearRect( 0, 0, rt_operation.canvas.width,
                        rt_operation.canvas.height )
                    for ( var x_ix in state.x_vector ) {
                        for ( var y_ix in state.y_vector ) {
                            context.drawImage( img, state.x_vector[x_ix],
                                state.y_vector[y_ix] )
                        }
                    }
                }
            )
        }
    },

    newState: function( rt_operation ) {
        var state = rt_operation.state || {}
        state.x = 0
        state.y = 0
        rt_operation.state = state
        var meta = rt_operation.meta || {}
        meta.width = rt_operation.width || rt_operation.image.images[0].width
            || rt_operation.image.images[0].image.width
        meta.height = rt_operation.height
            || rt_operation.image.images[0].height
            || rt_operation.image.images[0].image.height
        rt_operation.meta = meta
    },

    nextState: function( rt_operation ) {
        var state = rt_operation.state
        var meta = rt_operation.meta
        var speed = util.getSpeed( rt_operation )
        state.x = ( state.x + speed.hspeed ) % meta.width
        state.y = ( state.y + speed.vspeed ) % meta.height
    },

    updateState: function( rt_operation ) {
        var state = rt_operation.state
        var meta = rt_operation.meta
        state.x_pos = state.x
        if ( state.x_pos > 0 ) {
            state.x_pos -= meta.width
        }
        state.y_pos = state.y
        if ( state.y_pos > 0 ) {
            state.y_pos -= meta.width
        }

        state.x_vector = util.getPositionVector( state.x_pos, meta.width,
            rt_operation.canvas.width )
        state.y_vector = util.getPositionVector( state.y_pos, meta.height,
            rt_operation.canvas.height )
    },

    inactivate: function( rt_operation ) {
        util.inactivate( rt_operation )
    },

}

ops.fill = {
    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.fill.inactivate( rt_operation )
            return
        }

        var context = rt_operation.context
        if ( rt_operation.color ) {
            if ( rt_operation.prev_color ) {
                if ( rt_operation.color == rt_operation.prev_color ) {
                    return
                }
            }
            context.fillStyle = rt_operation.color
        } else {
            context.fillStyle = 'purple'
        }
        if(rt_operation.alpha){
            context.globalAlpha = Math.max(0,Math.min(1,rt_operation.alpha))
        }
        if ( rt_operation.shape ) {
            var shape = rt_operation.shape
            var func = shape["function"]
            var callParms = []
            if ( shape.parms ) {
                callParms = shape.parms.slice( 0 )
            } else if ( shape.borders ) {
                var borders = shape.borders
                callParms.push( borders[0] )
                callParms.push( borders[1] )
                var width = context.canvas.width
                var height = context.canvas.height
                callParms.push( context.canvas.width - borders[2] - borders[0] )
                callParms.push( context.canvas.height - borders[3] - borders[1] )
            }
            var f = context[func]
            context[func].apply( context, callParms )
        } else {
            context.fillRect( 0, 0, context.canvas.width, context.canvas.height )
        }
        rt_operation.prev_color = rt_operation.color
    },

    inactivate: function( rt_operation ) {
        delete rt_operation.prev_color
        util.inactivate( rt_operation )
    },
}

ops.sound = {
    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.sound.inactivate( rt_operation )
            return
        }

        var state
        if ( rt_operation.initialized ) {
            ops.sound.nextState( rt_operation )
        } else {
            ops.sound.newState( rt_operation )
            rt_operation.initialized = true
        }
    },

    newState: function( rt_operation ) {
        var rt_audios = RuntimeAudio()
        var rt_audioset = rt_audios[rt_operation.audioset]
        rt_operation.state = rt_operation.state || {}
        rt_operation.state.sound_iteration = rt_operation.state.sound_iteration || 0
        rt_operation.state.current_audio = rt_audioset.audios[rt_operation.state.sound_iteration]
        rt_operation.state.switch_audio = rt_operation.state.switch_audio || false
        rt_operation.state.current_audio.operation = rt_operation
        rt_operation.state.current_audio.play()
        console.log( "Playing "
            + rt_operation.state.current_audio.getAttribute( "src" ) )
    },

    nextState: function( rt_operation ) {
        if ( rt_operation.state.switch_audio ) {
            rt_operation.state.current_audio.pause()
            rt_operation.state.switch_audio = false
            if ( rt_operation.state.sound_iteration < 0 ) {
                rt_operation.state.sound_iteration = 0
            } else {
                rt_operation.state.sound_iteration++
            }
            var audiosets = AudioSet()
            var audioset = audiosets[rt_operation.audioset]
            if ( rt_operation.state.sound_iteration < audioset.audio.length ) {
                rt_operation.state.current_audio = audioset.audio[rt_operation.state.sound_iteration]
                rt_operation.state.current_audio.play()
                console.log( "Playing "
                    + rt_operation.state.current_audio.getAttribute( "src" )
                    + "(" + rt_operation.state.sound_iteration + ")" )
            }
            if ( operation.loop ) {
                rt_operation.state.sound_iteration = 0
                rt_operation.state.current_audio = audioset.audio[rt_operation.state.sound_iteration]
                rt_operation.state.current_audio.operation = rt_operation
                rt_operation.state.current_audio.play()
                console.log( "Replaying "
                    + rt_operation.state.current_audio.getAttribute( "src" ) )
            } else {
                event_rt.createEvent( "Stop", "*", rt_operation.name )
                rt_operation.initialized = false
            }
        }
    },

    inactivate: function( rt_operation ) {
        if ( rt_operation.state.current_audio.ended ) {

        } else {
            rt_operation.state.current_audio.pause()
            rt_operation.state.current_audio.currentTime = 0
        }
        rt_operation.state.sound_iteration = -1
        util.inactivate(rt_operation)
    },

    switchPlay: function( rt_operation ) {
        if ( !rt_operation.loop ) {
            console.log( "Sound Switch" )
            rt_operation.state.switch_audio = true
            // Don't wait for next interval
            util.nextState( rt_operation )
        } else {
            console.log( "Sound loop" )
        }
    }
}

ops.video = {
    run: function video( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.video.inactivate( rt_operation )
            return
        }

        var state
        if ( rt_operation.initialized ) {
            ops.video.nextState( rt_operation )
        } else {
            ops.video.newState( rt_operation )
            rt_operation.initialized = true
        }
    },

    newState: function( rt_operation ) {
        rt_operation.state = rt_operation.state || {}
        rt_operation.state.video_iteration = rt_operation.state.video_iteration || 0
        rt_operation.state.current_video = rt_operation.videos[rt_operation.state.video_iteration]
        rt_operation.state.switch_video = rt_operation.switch_video
        rt_operation.state.current_video.play()
        console.log( "Playing "
            + rt_operation.state.current_video.getAttribute( "src" ) )
    },

    nextState: function( rt_operation ) {
        if ( rt_operation.state.switch_video ) {
            rt_operation.state.current_video.pause()
            rt_operation.state.switch_video = false
            if ( rt_operation.state.video_iteration < 0 ) {
                rt_operation.state.video_iteration = 0
            } else {
                rt_operation.state.video_iteration++
            }
            if ( rt_operation.state.video_iteration < rt_operation.videos.length ) {
                rt_operation.state.current_video = operation.videos[rt_operation.state.video_iteration]
                rt_operation.state.current_video.play()
                console.log( "Playing "
                    + rt_operation.state.current_video.getAttribute( "src" )
                    + "(" + rt_operation.state.video_iteration + ")" )
            }
            if ( operation.loop ) {
                rt_operation.state.video_iteration = 0
                rt_operation.state.current_video = rt_operation.videos[rt_operation.state.video_iteration]
                rt_operation.state.current_video.play()
                console.log( "Replaying "
                    + rt_operation.state.current_video.getAttribute( "src" ) )
            }
        }
    },

    inactivate: function( rt_operation ) {
        if ( rt_operation.state.current_video.ended ) {

        } else {
            rt_operation.state.current_video.pause()
            rt_operation.state.current_video.current_time = 0
        }
        rt_operation.state.video_iteration = -1
        util.inactivate(rt_operation)
    },

    switchPlay: function( rt_operation ) {
        if ( !rt_operation.loop ) {
            console.log( "Video Switch" )
            rt_operation.state.switch_video = true
            // Don't wait for next interval
            ops.video.nextState( rt_operation )
        } else {
            console.log( "Video loop" )
        }
    }
}

ops.vimeo = {
    /**
     * vimeo
     * 
     * @param rt_operation
     * @returns
     * 
     * Unlike most other operations, this just dynamically loads the video and
     * runs when the function is activated.
     * 
     * Process: 0. If video initialized, return 1. If Vimeo player not loaded,
     * create &lt;script&gt; element to load it 2. Create &lt;iframe&gt; element
     * for the video at the proper location 3. Create a new player 3.1 Add
     * handlers (pause, ended, error)
     * 
     */

    run: function( rt_operation ) {
        if ( rt_operation.terminate ) {
            ops.vimeo.inactivate( rt_operation )
            return
        }

        var state
        if ( rt_operation.initialized ) {
            return



        }
        ops.vimeo.newState( rt_operation )
        rt_operation.initialized = true
    },

    newState: function( rt_operation ) {
        if ( $( "#iframes" ).length == 0 ) {
            var text = "<div id='iframes'></div>"
            $( "body" ).append( text )
        }
        var iframes = $( "#iframes" )

        var iframe_id = "vimeo_iframe_" + rt_operation.name

        $( iframes ).append( "<iframe id='" + iframe_id + "' ></iframe>" )

        var iframe = $( "#" + iframe_id )[0]
        var src = rt_operation.video

        var options = []

        if ( rt_operation.autoplay ) {
            options.push( "autoplay=1" )
        }

        if ( rt_operation.autopause ) {
            options.push( "autopause=1" )
        } else {
            options.push( "autopause=0" )
        }

        if ( options.length > 0 ) {
            src += "?" + options.join()
        }

        var xy = util.getPosition( rt_operation )
        var left = xy[0]
        left = getAlignedPosition( left, rt_operation.width,
            rt_operation.align[0], x_alignment )
        var top = xy[1]
        top = getAlignedPosition( top, rt_operation.height,
            rt_operation.align[1], y_alignment )

        var width = rt_operation.width || 640
        var height = rt_operation.height || 360
        top = top || 8
        left = left || 8
        var frameborder = operation.frameborder || 0

        $( iframe ).attr( "rt_operation", rt_operation.name )
        $( iframe ).attr( "src", src )
        $( iframe ).attr( "width", width )
        $( iframe ).attr( "height", height )
        $( iframe ).attr( "frameborder", frameborder )
        $( iframe ).attr( "webkitallowfullscreen", "webkitallowfullscreen" )
        $( iframe ).attr( "webkitallowfullscreen", "webkitallowfullscreen" )
        $( iframe ).attr( "mozallowfullscreen", "mozallowfullscreen" )
        $( iframe ).attr( "allowfullscreen", "allowfullscreen" )
        $( iframe ).css( "position", "absolute" )
        $( iframe ).css( "top", top )
        $( iframe ).css( "left", left )
        $( iframe ).css( "z-index", 1000 )

        // var meta = {}
        // meta.iframe = iframe

        try {
            var player = new Vimeo.Player( iframe )
            // meta.player = player

            if ( rt_operation.erase ) {
                player.on( "ended", function( status ) {
                    console.log( "vimeo ended" )
                    console.log( status )
                    var iframe = ops.vimeo.element
                    var name = $( iframe ).attr( "rt_operation" )
                    $( iframe ).remove()
                    var runtime = Runtime()
                    runtime[name].initialized = false
                } )
            }

            player.play();
        } catch ( e ) {
            $( iframe ).remove()
            console.log( e )
        }

    },

    inactivate: function( rt_operation ) {
        if ( rt_operation.state.current_video.ended ) {

        } else {
            rt_operation.state.current_video.pause()
            rt_operation.state.current_video.current_time = 0
        }
        rt_operation.state.video_iteration = -1
        util.inactivate(rt_operation)
    }
	}