var playPictureWall = true;
var fullScreen = false;
var cellWidth = 200;
var cellHeight = 150;
var originalGridWidth = 6;
var originalGridHeight = 4;
var maxImgScale = 3;
var cellPadding = 10;
var interval = 1000;

var gridWidth = originalGridWidth;
var gridHeight = originalGridHeight;
var c;
var ctx;
imgQueue = new Array();

function resizeCanvasToFitGrid() {
	newCanvasWidth = (cellWidth * gridWidth) + cellPadding;
	newCanvasHeight = (cellHeight * gridHeight) + cellPadding;
	$('#myCanvas')
		.attr({width: newCanvasWidth, height: newCanvasHeight})
		.css({left: '50%', marginLeft: (-1 * (newCanvasWidth / 2)) + 'px'});
}

function redrawImages() {
	// could use toDataUrl but the images are from Flickr which violates the security settings to allow this, so regenerate from imgQueue
	for (i = imgQueue.length - 1; i > -1; i--) {
		e = imgQueue[i];
		drawFrame(ctx, e.x0, e.y0, e.x1 - e.x0, e.y1 - e.y0);
		ctx.globalAlpha = 1;
		ctx.drawImage(e.img, 0, 0, e.clipX, e.clipY, e.x0 + (cellPadding / 2) ,e.y0 + (cellPadding / 2), e.x1 - e.x0 - cellPadding, e.y1 - e.y0 - cellPadding);
	}
}

function enterFullScreen() {
	if (fullScreen) {
		return exitFullScreen();
	}

	$('#overlay').fadeIn('fast');

	gridWidth = Math.floor($(window).width() / cellWidth);
	gridHeight = Math.floor($(window).height() / cellHeight);
	resizeCanvasToFitGrid();

	$('#overlay').click(function(e) {
		exitFullScreen();
	});

	redrawImages();
	$('#fullScreen i').toggleClass("icon-resize-small icon-fullscreen");
	$('#fullScreen span').html("Exit full screen");
	fullScreen = true;
}

function exitFullScreen() {
	$('#overlay').fadeOut('fast');
	gridWidth = originalGridWidth;
	gridHeight = originalGridHeight;
	resizeCanvasToFitGrid();

	redrawImages();
	$('#fullScreen i').toggleClass("icon-resize-small icon-fullscreen");
	$('#fullScreen span').html("Full screen");
	fullScreen = false;
}

function addToImgQueue(img) {
	imgQueue.unshift(img);
	if (imgQueue.length > gridWidth * gridHeight * 5) {
		imgQueue.pop(); // poor man's attempt to prevent a memory leak without losing track of what is displayed
	}
}

function drawFrame(ctx, x, y, width, height) {
	ctx.globalAlpha = 0.7;
	ctx.fillStyle="#FFFFFF";
	ctx.beginPath();
	ctx.rect(x - (cellPadding / 2), y - (cellPadding / 2), width + cellPadding, height + cellPadding);
	ctx.fill();
}

function drawRandomImageOnCanvas() {

	drawImageOnCanvas = function(response) {

		// choose a random size of image
		imgScale = Math.max(1, Math.round(Math.random() * maxImgScale));

		// choose a random place to put the image
		gridStartX = (Math.min(gridWidth - imgScale, Math.round(Math.random() * gridWidth)) * cellWidth) + (cellPadding / 2);
		gridStartY = (Math.min(gridHeight - imgScale, Math.round(Math.random() * gridHeight)) * cellHeight) + (cellPadding / 2);

		frameWidth = cellWidth * imgScale;
		frameHeight = cellHeight * imgScale;
		imgWidth = frameWidth - cellPadding;
		imgHeight = frameHeight - cellPadding;

		img=new Image();
		img.onload = function() {
			clipScalingRatio = Math.min((img.width / imgWidth), (img.height / imgHeight));
			clipX = imgWidth * clipScalingRatio;
			clipY = imgHeight * clipScalingRatio;

			// draw frame
			drawFrame(ctx, gridStartX, gridStartY, frameWidth, frameHeight);

			// should be able to use addHitRegion and then close path when it is properly supported by browsers
			addToImgQueue({url: response.url, img: img,
							x0: gridStartX, y0: gridStartY,
							x1: gridStartX + frameWidth, y1: gridStartY + frameHeight,
							clipX: clipX, clipY: clipY});

			// fade in image
			var globalAlpha = 0.1;
			for (i = 1; i < 10; i++) {
				setTimeout(function() {
					ctx.globalAlpha = globalAlpha;
					ctx.drawImage(img,0,0,clipX, clipY, gridStartX + (cellPadding / 2),gridStartY + (cellPadding / 2), imgWidth,imgHeight);
					globalAlpha = globalAlpha + 0.1;
				}, 50 * i);
			}

			if (playPictureWall) {
				setTimeout(drawRandomImageOnCanvas, interval);
			}
		};

		img.src=response.img;
	}

	$.ajax({
		url: './rand',
		dataType: 'json',
		success: drawImageOnCanvas
	});
}

function isWithinBounds(x, y, img) {
	return x > img.x0 && y > img.y0 && x < img.x1 && y < img.y1;
}

function playPause() {
	if (playPictureWall) {
		$('#playPause').toggleClass("btn-success btn-danger").children('span').html("Play");
		$('#playPause i').toggleClass("icon-play icon-pause");
	} else {
		$('#playPause span').html("Pause");
		$('#playPause').toggleClass("btn-success btn-danger").children('span').html("Pause");
		$('#playPause i').toggleClass("icon-play icon-pause");
		drawRandomImageOnCanvas();
	}
	playPictureWall = !playPictureWall;
}

function picturewall(canvas) {
	c = document.getElementById(canvas)
	resizeCanvasToFitGrid();
	if (c.getContext) {
		ctx = c.getContext("2d");
		$('#controls').show();
		drawRandomImageOnCanvas();

		$(c).click(function(event) {
			event = event || window.event;
			var x = event.pageX - c.offsetLeft,
			y = event.pageY - c.offsetTop;

			imgQueue.some(function(img) {
				if (isWithinBounds(x, y, img)) {
					window.location.href = img.url;
					return true;
				}
			});
		});
	}
}