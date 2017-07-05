/**
 * 
 */

/* Constants */
var wavelength_range = [ 380.0, 780.0 ]

/* Canvases */
// Canvas 1
var canvas1 = document.getElementById('canvas1');
var context1 = canvas1.getContext('2d');

var c1 = {}
c1['context'] = context1
c1['center_x'] = canvas1.width / 2
c1['center_y'] = canvas1.height / 2
c1.context.translate(c1["center_x"], c1["center_y"])

c1["length_max"] = 0.8 * Math.min(c1["center_x"], c1["center_y"])
c1["length_min"] = c1.length_max / 10
c1["length_delta"] = 0.1
c1["delta"] = 3.0
c1["wavelength_range"] = [ 380.0, 780.0 ]
c1["wavelength_delta"] = 2

// Volitile
c1["length"] = c1.length_min
c1["wavelength"] = wavelength_range[0]
c1["angle"] = Math.random() * 360

// canvas2
var canvas2 = document.getElementById('canvas2');
var context2 = canvas2.getContext('2d');

var c2 = {}
c2['context'] = context2
c2['center_x'] = canvas2.width / 2
c2['center_y'] = canvas2.height / 2
c2.context.translate(c2["center_x"], c2["center_y"])

c2["length"] = 0.8 * Math.min(c2["center_x"], c2["center_y"])
c2["delta"] = 0.5
c2["wavelength_delta"] = 0.5
// Volitile
c2["wavelength"] = 400
c2["angle"] = Math.random() * 360

function draw(parms) {
	parms.angle = parms.angle % 360
	var radians = parms.angle * Math.PI / 180
	parms.context.beginPath();
	parms.context.moveTo(0, 0);
	if (parms.length >= parms.length_max || parms.length < parms.length_min)
		parms.length_delta = -parms.length_delta
	var l = parms.length * 1.2 * Math.random()
	var x = l * Math.cos(radians)
	var y = l * Math.sin(radians)
	parms.context.lineTo(x, y);
	parms.context.lineWidth = 1
	var color = wavelengthToColor(parms.wavelength)[0]
	// color = '#000000'
	parms.context.strokeStyle = color;
	parms.context.stroke();
	parms.wavelength += parms.wavelength_delta
	if (parms.wavelength > wavelength_range[1])
		parms.wavelength = wavelength_range[0]
	parms.angle += parms.delta
	parms.length += parms.length_delta
	if (("prev_x" in parms) && ("prev_y" in parms)) {
		parms.context.translate(-parms.prev_x, -parms.prev_y)
	}
	parms["prev_x"] = 10 * Math.random()
	parms["prev_y"] = 10 * Math.random()
	parms.context.translate(parms.prev_x, parms.prev_y)
	requestAnimationFrame(function() {
		draw(parms)
	})
}

function draw2(parms) {
	parms.angle = parms.angle % 360
	var radians = parms.angle * Math.PI / 180
	parms.context.beginPath();
	parms.context.moveTo(0, 0);
	var x = parms.length * Math.cos(radians)
	var y = -parms.length * Math.sin(radians)
	parms.context.lineTo(x, y);
	parms.context.lineWidth = 2
	var color = wavelengthToColor(parms.wavelength)[0]
	// color = '#000000'
	parms.context.strokeStyle = color;
	parms.context.stroke();
	parms.wavelength += parms.wavelength_delta
	if (parms.wavelength > wavelength_range[1])
		parms.wavelength = wavelength_range[0]
	parms.angle += parms.delta
	requestAnimationFrame(function() {
		draw2(parms)
	})
}

var bug1_canvas = document.getElementById('bug1_canvas');
var bug1 = {}
bug1["context"] = bug1_canvas.getContext("2d")
bug1["image"] = new Image()
bug1.image.src = "images/bug.png"
bug1["x"] = 0
bug1["y"] = 0
bug1["width"] = bug1_canvas.width
bug1["height"] = bug1_canvas.height

var bug2_canvas = document.getElementById('bug2_canvas');
var bug2 = {}
bug2["context"] = bug2_canvas.getContext("2d")
bug2["image"] = new Image()
bug2.image.src = "images/bug.png"
bug2["x"] = bug2_canvas.width / 2
bug2["y"] = bug2_canvas.height / 2
bug2["width"] = bug2_canvas.width
bug2["height"] = bug2_canvas.height

function bug(parms) {
	parms.context.clearRect(0, 0, parms.width, parms.height)
	var x_max = parms.width - parms.image.width 
	var y_max = parms.height - parms.image.height 
	if ('path' in parms && parms.path > 0) {

	} else {
		parms["delta_x"] = newdir(parms.x, x_max)
		parms["delta_y"] = newdir(parms.y, y_max)
		path = 2 + 40 * Math.random()
		var x_path, y_path
		if (parms.delta_x == 0) {
			x_path = Math.MAX_VALUE
		} else if (parms.delta_x < 0) {
			x_path = parms.x - 1
		} else {
			x_path = x_max - parms.x - 1
		}
		if (parms.delta_y == 0) {
			y_path = Math.MAX_VALUE
		} else if (parms.delta_y < 0) {
			y_path = parms.y - 1
		} else {
			y_path = y_max - parms.y - 1
		}
		parms.path = Math.min(path, x_path, y_path)
	}
	parms.x = parms.x + parms.delta_x
	parms.y = parms.y + parms.delta_y
	parms.context.drawImage(parms.image, parms.x, parms.y)
	parms.path = parms.path - 1
	requestAnimationFrame(function() {
		bug(parms)
	})
}

function newdir(pos, max) {
	while (true) {
		var delta = Math.floor(3 * Math.random() - 1)
		var new_pos = pos + delta
		if (new_pos > 0 && new_pos < max) {
			return delta
		}
	}

}

var bg_canvas = document.getElementById('background');
var bg = {}
bg["context"] = bg_canvas.getContext("2d")
bg["image"] = new Image()
bg.image.src = "images/background.png"
bg["width"] = bg_canvas.width
bg["height"] = bg_canvas.height
bg["speed"] = 1;
bg["x"] = 0
bg["y"] = 0;

function background(parms){
	parms.context.drawImage(parms.image,parms.x,parms.y)
	parms.context.drawImage(parms.image,parms.x - parms.width, parms.y)
	x = parms.x
	x += parms.speed
	parms.x = x % parms.width

	requestAnimationFrame(function(){
		background(parms)
	})
}

background(bg)
draw(c1)
draw2(c2)
bug(bug1)
bug(bug2)

/**
 * From <a
 * href="http://scienceprimer.com/javascript-code-convert-light-wavelength-color">Science
 * Primer</a>
 * 
 * @param wavelength
 * @returns
 */
// takes wavelength in nm and returns an rgba value
function wavelengthToColor(wavelength) {
	var r, g, b, alpha, colorSpace, wl = wavelength, gamma = 1;

	if (wl >= 380 && wl < 440) {
		R = -1 * (wl - 440) / (440 - 380);
		G = 0;
		B = 1;
	} else if (wl >= 440 && wl < 490) {
		R = 0;
		G = (wl - 440) / (490 - 440);
		B = 1;
	} else if (wl >= 490 && wl < 510) {
		R = 0;
		G = 1;
		B = -1 * (wl - 510) / (510 - 490);
	} else if (wl >= 510 && wl < 580) {
		R = (wl - 510) / (580 - 510);
		G = 1;
		B = 0;
	} else if (wl >= 580 && wl < 645) {
		R = 1;
		G = -1 * (wl - 645) / (645 - 580);
		B = 0.0;
	} else if (wl >= 645 && wl <= 780) {
		R = 1 // * Math.sqrt((780 - wl) / (780 - 645));
		G = 0;
		B = 1 - (Math.sqrt((780 - wl) / (780 - 645)));
	} else {
		R = 0;
		G = 0;
		B = 0;
	}

	// intensty is lower at the edges of the visible spectrum.
	if (wl > 780 || wl < 380) {
		alpha = 0;
		// } else if (wl > 700) {
		// alpha = (780 - wl) / (780 - 700);
		// } else if (wl < 420) {
		// alpha = (wl - 380) / (420 - 380);
	} else {
		alpha = 1;
	}

	colorSpace = [
			"rgba(" + (R * 100) + "%," + (G * 100) + "%," + (B * 100) + "%, "
					+ alpha + ")", R, G, B, alpha ]

	// colorSpace is an array with 5 elements.
	// The first element is the complete code as a string.
	// Use colorSpace[0] as is to display the desired color.
	// use the last four elements alone or together to access each of the
	// individual r, g, b and a channels.

	return colorSpace;

}
