// Frank Poth 12/22/2017

(function() { "use strict";

  var buffer, display, images, load0, load1, load2, render, resize;

  /* I use a buffer and a display canvas for easy scaling of the final image. */
  buffer = document.createElement("canvas").getContext("2d");
  display = document.querySelector("canvas").getContext("2d");
  images = new Array();// This will hold our loaded images.

  load1 = function() {

    let image = new Image();// First we must create a new Image object.

    /* We have to store the image and draw it whenever it loads, so let's make
    an event handler for the load event. */
    image.addEventListener("load", function(event) {

      /* When the image loads, we store it in the images array and draw it. */
      images[0] = this;
      render();

    });

    /* Setting the image's src will initiate loading, and eventually a load eventually
    will fire and we can have access to our image. */
    image.src = "gelly.png";// jelly or gelly? Hair gel... jelly sandwich... Huh.

  };

  /* This is the most complicated method, but has its benefits, like being able
  to track load progress, and feeling cool for using XMLHttpRequest instead of
  setting src. For some reason it just feels more like real loading. */
  //load2 = function() {

  //  var request = new XMLHttpRequest();// Define your request.
  //  var image = new Image();// Make a new empty image.

  //  /* Now we make an event handler to do something with the array buffer we're
  //  going to load. */
  //  request.addEventListener("load", function(event) {

  //    /* First we convert our array buffer response to a Uint8Array. */
  //    var bytes = new Uint8Array(this.response);
  //    //alert(bytes);// You can actually see the width and height in this one.
  //    /* Now we convert that numeric byte array to a string using fromCharCode. */
  //    var string = String.fromCharCode.apply(null, bytes);
  //    //alert(string);
  //    /* Now we convert the string to a base64 string. */
  //    var base64 = btoa(string);// Encode string
  //    //alert(base64);
  //    /* Finally we add the header to the base64 string to use with our png image. */
  //    var data_url = "data:image/png;base64," + base64;
  //    //prompt("Copy data url?", data_url);
  //    /* Now we can set the src value directly. Setting it this way doesn't load anything,
  //    and you have access to the useable image directly after setting src. */
  //    /* 04/06/2018 looking back on this, it's not true. In fact, setting the src is
  //    not synchronous even if you set it directly to a data_url. There may be a load
  //    time which will cause any immediate requests for the image's data to fail because
  //    the image has technically not loaded. */
  //    image.src = data_url;
  //    //alert(image.width);

  //    images[2] = image;

  //    render();

  //  });

  //  /* You can track the progress of the load with this event listener, but for a
  //  16x16 image, this doesn't even have a chance to do anything. */
  //  request.addEventListener("progress", function(event) {

  //    if (event.lengthComputable) {

  //      console.log("loaded so far: " + event.loaded + " of " + event.total);

  //    }

  //  });

  //  request.open("GET", "human.png");
  //  request.responseType = "arraybuffer";// You must specify arraybuffer type!
  //  request.send(null);

  //};

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
    //display.canvas.height = display.canvas.width * (1/3);

    display.imageSmoothingEnabled = false;// This keeps the image looking sharp.

    render();


  };

  window.addEventListener("resize", resize);

  /* We have 3 16x16 images, so the buffer should fit them exactly. */
  buffer.canvas.height = 16;
  buffer.canvas.width = 16;//48;

  resize();

  //load0();
  load1();
//  load2();

})();
