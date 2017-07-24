/**
 * 
 */

var canvas = document.getElementById("model")
var ctx = canvas.getContext("2d")

var xml = `
<svg version='1.0' xmlns='http://www.w3.org/2000/svg'
width='54.000000pt' height='56.000000pt'  viewBox='0 0 54.000000 56.000000'
 preserveAspectRatio='xMidYMid meet'>
<g transform='translate(0.000000,56.000000) scale(0.100000,-0.100000)'
fill='#000000' stroke='none'>
<path d='M133 503 c22 -6 22 -20 -2 -28 -10 -3 -26 -14 -36 -25 -22 -24 -35
-26 -35 -3 0 9 -3 14 -6 10 -12 -12 29 -87 48 -87 13 0 18 -8 18 -25 0 -31
-21 -32 -66 -4 -19 11 -34 18 -34 16 0 -11 68 -47 88 -47 29 0 35 -27 12 -58
-16 -23 -18 -36 -11 -91 9 -76 39 -111 97 -111 19 0 34 -4 34 -10 0 -5 4 -10
9 -10 6 0 8 29 6 65 -2 36 0 65 4 65 4 0 21 -16 38 -35 36 -40 59 -44 97 -14
34 27 33 50 -6 95 -32 36 -32 37 -8 29 30 -9 72 -10 94 -2 25 10 21 71 -8 104
-22 25 -31 28 -112 33 -82 5 -89 7 -86 25 2 11 6 34 8 50 3 18 -1 38 -10 50
-14 19 -15 18 -4 -11 6 -17 8 -42 5 -56 -6 -24 -9 -25 -32 -15 -14 7 -25 22
-27 37 -2 17 -10 26 -25 28 -13 2 -23 10 -23 18 0 8 -9 14 -22 13 -17 -1 -19
-2 -5 -6z'/>
</g>
</svg>
`;

var img = new Image()
var DOMURL = window.URL || window.webkitURL || window;
var svg = new Blob([xml], {type: 'image/svg+xml'})
var url = DOMURL.createObjectURL(svg)
img.onload = function(){
	DOMURL.revokeObjectURL(url)
		ctx.drawImage(img, 196, 200 )
}
img.src = url
