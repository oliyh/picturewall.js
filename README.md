picturewall.js
==============

An HTML5 canvas-based picture gallery


## Overview

picturewall.js is a picture 'slideshow' akin to sticking up polaroids on a cork board, each on top of the others. 
The pictures are provided by an endpoint at `./rand`, the implementation of which I shall leave as an exercise for the reader.

## Get started

Provide the `./rand` endpoint and open picturewalldemo.html.

It expects /rand to return json of the form

	{"img":"http://path/to/image.jpg","url":"http://path/to/image/in/gallery"}
	
## Caveats

This is by no means complete or perfect. Feel free to submit pull requests!