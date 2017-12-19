/**
 * 
 */

//function RuntimeElement(name, operation, events, parameters) {
//	if (this.validateName(name) && this.validateOperation(operation)
//		&& this.validateEvents( events)
//		&& this.validateParameters(operation)) {
//		this.name = name
//		this.operation = operation
//		this.events = events
//		this.parameters = parameters
//	}
//}
//
//RuntimeElement.validateName = function( name) {
//	if (typeof name === 'string' || name instanceof String) {
//		return true
//	}
//	console.log("Invalid name encountered in " + this.constructor.name + ": "
//		+ name)
//
//	return false
//}
//
//RuntimeElement.validateOperation = function(operation) {
//	if (operation instanceof RuntimeOperation) {
//		return true
//	}
//	return false
//}
//
//RuntimeElement.validateEvents = function (obj) {
//	if (obj instanceof Object) {
//		for (key in obj) {
//			if (!(obj[key] instanceof Function)) {
//				return false
//			}
//		}
//		return true
//	}
//	return false
//}
//
//RuntimeElement.validateParameters = function(pareameters){
//	return true
//}

function SortedMap (){
	this.map = {}
	this.keyList = []
	
	/**
	 * Set an entry in the sorted map
	 * 
	 * @param key key of entry to be set
	 * @param value value entry is to be set to
	 * 
	 * @returns previous value if set, otherwise undefined
	 */
	
	this.set = function(key,value){
		if(this.map[key]){
			var old = this.map[key]
			this.map[key] = value
			return old
		}
		this.map[key] = value
		this.addKeyToList(key)
		return undefined
	}
	
	this.keys = function(){
		return this.keyList.slice()
	}
	
	this.addKeyToList = function(key){
		if(this.keyList.length == 0){
			this.keyList.push(key)
		}
		else{
			var ix = this.getNextKeyIx(key,this.keyList)
			this.keyList.splice(ix,0,key)
		}
	}

	/**
	 * Discover if key exists in this.map
	 * @returns true if the key exists in the map. otherwise returns false
	 */
	this.containsKey = function(key){
		if(this.map[key]){
			return true
		}
		return false
	}
	
	/**
	 * Retrieve a value by key
	 * @param key -  the key for which a value is to be returned
	 * @returns the found value or undefined
	 */
	this.get = function(key){
		if(this.map[key]){
			return this.map[key]
		}
		return undefined
	}
	
	this.getNextKeyIx = function(key, list){
		if(list.length == 0){
			return 0
		}
		if(key > list[list.length -1]){
			return list.length
		}
		if(key == list[0]){
			throw "Broken KeyList: "+ this.constructor.name
		}
		// key < list[0]
		if (list.length == 1){
			return 0
		}
		var splitIx = Math.floor(list.length / 2)
		var first =  list.slice(0, splitIx)
		var second = list.slice(splitIx)
		return this.getNextKeyIx(key,first)+ this.getNextKeyIx(key,second)
	}
	
	/**
	 * Retrieve the first entry from the map and deletes the entry
	 * @returns the first entry in the map [key, value]
	 */
	this.shift = function(){
		if(this.keyList.length == 0){
			return undefined
		}
		var key = this.keyList.shift()
		var value = this.map[key]
		delete this.map[key]
		return [key, value]
	}
	
	
	/**
	 * Retrieve the first entry from the map. Does not alter the map
	 * @returns the first entry in the map [key, value]
	 */
	this.peek = function(){
		if(this.keyList.length == 0){
			return [undefined,[]]
		}
		var key = this.keyList[0]
		var value = this.map[key]
		return [key, value]		
	}
}
