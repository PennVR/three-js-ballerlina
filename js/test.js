var DIM = 100;
var SEED = Math.floor(Math.random() * 1000);
var noise = generateNoise(DIM, DIM, SEED);

var ctx = document.getElementById('canvas').getContext('2d');
var imgData = ctx.getImageData(0, 0, DIM, DIM);

var drawNoise = function (noise) {
	for (var i = 0; i < imgData.data.length / 4; i++) {
		var y = Math.floor(i / DIM);
		var x = i - y * DIM;
		var color = 255 * Math.abs(noise[y][x]);
		if (noise[y][x] < 0) {
			console.log(x, y);
		}
		imgData.data[4*i] = color;
		imgData.data[4*i+1] = color;
		imgData.data[4*i+2] = color;
		imgData.data[4*i+3] = 255;
		//console.log(color);
	}
	console.log(imgData);
	ctx.putImageData(imgData, 0, 0);
}

drawNoise(noise);
//ctx.fillRect(0, 0, 100, 100);