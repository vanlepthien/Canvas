/**
 * Event management
 */
'use strict'

/**
 * Select ready events (event time <= current time) and remove from events queue
 * If operation is to be stopped remove operation from running queue if
 * rt_operation.handle_termination = true set rt_operation.terminate = true run
 * operation *** stopped operations are removed first so an operation that is
 * *** restarted at the same time a previous incarnation was stopped *** will
 * behave as expected. Add started operations to running queue Run operations on
 * running queue Empty termination queue
 */
event_rt.run = function() {
	var events = Events()
	var running = Running()
	var termination_queue = []
	var current_time = tickToSeconds(tick)
	while (1) {
		var event_time
		var event_list
		[ event_time, event_list ] = events.peek()
		if (event_time === undefined || event_time > current_time) {
			break
		} else {
			events.shift()
			// process stopped operations
			for ( var ix in event_list) {
				var event = event_list[ix]
				if (event.type == "Stop") {
					var rt_operation = event.operation
					// "active" should be replaced with termination logic
					if (rt_operation.active) {
						inactivate(rt_operation)
					}
					rt_operation.active = false
					// end of active logic
					running[rt_operation.name] = undefined
					if (rt_operation.handle_terminatation) {
						rt_operation.terminate = true
						run(rt_operation)
						op.terminate = false
					}
				}
			}
			for ( var ix in event_list) {
				var event = event_list[ix]
				if (event.type == "Start") {
					var rt_operation = event.operation
					rt_operation.active = true
					running[rt_operation.name] = rt_operation
				}
			}
		}
	}
	// if "show" is true, run the operation regardless
	var runtime = Runtime()
	for(var key in runtime){
		var rt_operation = runtime[key]
		if(rt_operation.show){
			running[key] = rt_operation
		}
	}
	for ( var key in running) {
		run(running[key])
	}
}

/**
 * Create an event on the event queue
 * 
 * @param func -
 *            the type of event. "Start" or "Stop"
 * @param time -
 *            seconds since the launch of the web page Format: 0, null, "*" -
 *            the current time numeric value - offset from launch. If < current
 *            time, current time "+"+numeric value - current time + the value.
 */
event_rt.createEvent = function(func, time, rt_operation) {
	var operation
	if(typeof rt_operation === 'string'){
		operation = Runtime()[rt_operation]
	} else {
		operation = rt_operation
	}
	if (!time || time == "*") {
		time = tickToSeconds(tick)
	} else if (Number.isNaN(time)) {
		if (time.substr(0, 1) == "+") {
			time = time.substr(1)
			time = Number(time)
			time = time + tickToSeconds(tick)
		} else {
			console.log("Invalid time: " + time + " Event not created.")
			return
		}
	}
	var events = Events()
	var event = {
		type : func,
		time : time,
		operation : operation
	}
	var eventList = []
	if (events.containsKey(time)) {
		eventList = events.get(time)
	}
	eventList.push(event)

	events.set(time, eventList)
}