// Frank Poth 12/22/2017

(function() { "use strict";

  var buffer, display, images, load0, load1, load2, render, resize;

  /* I use a buffer and a display canvas for easy scaling of the final image. */
  buffer = document.createElement("canvas").getContext("2d");
  display = document.querySelector("canvas").getContext("2d");
  images = new Array();// This will hold our loaded images.

 var json;


  load1 = function() {

    let image = new Image();// First we must create a new Image object.

    /* We have to store the image and draw it whenever it loads, so let's make
    an event handler for the load event. */
    image.addEventListener("load", function(event) {

      /* When the image loads, we store it in the images array and draw it. */
      images[0] = this;
      render();

    });

    image.src = "drag.png";

  };

  /* This renders the loaded images to the buffer and then to the display canvas. */
  render = function() {

    var x = 0;

    buffer.fillStyle = "#283038";
    buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

    for (let index = images.length - 1; index > -1; -- index) {

      let image = images[index];

      buffer.drawImage(image, 0, 0, image.width, image.height, x, 0, image.width, image.height);

      x += image.width;

    }

    /* Handles scaling of buffer to display as well. */
    display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);

  };

  /* Make sure everything fits nicely in the window, and redraws on screen resize events. */
  resize = function(event) {

    display.canvas.width = document.documentElement.clientWidth - 32;

    if (display.canvas.width > document.documentElement.clientHeight) {

      display.canvas.width = document.documentElement.clientHeight;

    }

    /* make sure we're maintaining aspect ratio. 1 image high, by 3 wide. */
    display.canvas.height = display.canvas.width * (1/3);

    display.imageSmoothingEnabled = false;// This keeps the image looking sharp.

    render();


  };

  window.addEventListener("resize", resize);

  /* manually set buffer size*/
  buffer.canvas.height = 128; //this is the size of the levels
  buffer.canvas.width = 256;

  resize();

  load1();

})();
