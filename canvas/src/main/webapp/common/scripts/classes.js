/**
 * 
 */

function RuntimeElement(name, operation, events, parameters) {
	if (validateName(this, name) && validateOperation(this, operation)
			&& validateEvents(this, events)
			&& validateParameters(this, operation, parameters)) {
		this.name = name
		this.operation = operation
		this.events = events
		this.parameters = parameters
	}
}

function validateName(obj, name) {
	if (typeof myVar === 'string' || myVar instanceof String) {
		return true
	}
	console.log("Invalid name encountered in " + obj.constructor.name + ": "
			+ name)

	return false
}

function validateOperation(obj, operation) {
	if(obj instanceof RuntimeOperation){
		return true
	}
}

function validateEvents(obj, operation) {
	if(obj instanceof Object){
		for(key in obj){
			if(!(obj[key] instanceof Function)){
				return false
			}
		}
		return true
	}
	return false
}
