// Frank Poth 01/14/2017

/* By studying this example program, you can learn how to load json levels, how
to animate sprites, and other basic game design techniques including: user Input
on the keyboard, some collision detection and response, image loading, and maybe
some other things, too. */

/* You may notice that in the largest room the dominique sprite looks a little weird.
There is a brown bar that flashes in front of her face when she walks to the left.
This is because of something called "texture bleeding" where a scaled image allows
pixels from around the cropped source region of the image to bleed into the desired
part of the source image. This is okay for cropping from large images, but for sprite
sheets it's not desireable. A way around this is to create individual canvases for
each sprite image and use those to draw rather than cutting frames from the original
sprite sheet. No bleeding can occur because there are no longer pixels around the
edges of the sprite image. */

(function() { "use strict";




  const Animation = function(frame_set, delay, mode = "loop") {

    this.count       = 0;
    this.delay       = delay;
    this.frame_index = 0;
    this.frame_set   = frame_set;
    this.frame_value = frame_set[0];
    this.mode = mode;

  };

  /* I expanded the Animation class to include play, loop, and rewind modes. They're
  all really simple, and basically they are the same thing with very minor changes
  dictating how the playhead or frame_index moves. */
  Animation.prototype = {

    constructor:Animation,

    change:function(frame_set, delay = this.delay) {

      if (frame_set != this.frame_set) {

        this.count       = 0;
        this.delay       = delay;
        this.frame_index = 0;
        this.frame_set   = frame_set;
        this.frame_value = frame_set[0];

      }

    },

    loop:function() {

      this.count ++;

      if (this.count >= this.delay) {

        this.count = 0;

        this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;
        this.frame_value = this.frame_set[this.frame_index];

      }

    },

    play:function() {

      this.count ++;

      if (this.count >= this.delay) {

        this.count = 0;

        if (this.frame_index < this.frame_set.length - 1) {

          this.frame_index ++;
          this.frame_value = this.frame_set[this.frame_index];

        }

      }

    },

    rewind:function() {

      this.count ++;

      if (this.count >= this.delay) {

        this.count = 0;

        if (this.frame_index > 0) {

          this.frame_index --;
          this.frame_value = this.frame_set[this.frame_index];

        }

      }

    },

    update:function() {

      this[this.mode]();

    }

  };

  /* I added offsets to the frames. This allows me to group my frames close together
  in the source image and save a lot of space in my image files. The offset is
  applied when drawing the image to the screen, ensuring that the sprite always looks
  centered and doesn't jump back and forth. */
  const Frame = function(x, y, width, height, offset_x = 0, offset_y = 0) {

    this.height   = height;
    this.offset_x = offset_x;
    this.offset_y = offset_y;
    this.width    = width;
    this.x        = x;
    this.y        = y;

  };

  Frame.prototype = { constructor:Frame };

  /* This simplifies creation of input keys. */
  const Input = function(active, state) {

    this.active = active;
    this.state  = state;

  };

  Input.prototype = {

    constructor:Input,

    update:function(state) {

      if (this.state != state) this.active = state;
      this.state  = state;

    }

  };

      //////////////////////
    //// GAME CLASSES ////
  //////////////////////

  const Door = function(x, y, area, new_x, width=10,height=32,count=0) {

    this.animation = new Animation(display.sprite_sheet.frame_set.door, 5, "play");
    this.area = area;
    this.new_x = new_x;
    this.x = x;
    this.y = y;
    this.width = width; //door width, used for collision
    this.height = height; //door height, used for collision
    this.count = count; //check to see if we went through the door
  };

  Door.prototype = {

    constructor:Door,

  };

      ///////////////
    //// LOGIC ////
  ///////////////

  var controller, display, game;

  controller = {

    down: new Input(false, false), left: new Input(false, false), right:new Input(false, false), up:new Input(false, false),

    keyDownUp:function(event) { event.preventDefault();

      var key_state = (event.type == "keydown") ? true : false;

      switch(event.keyCode) {

        case 37: controller.left.update(key_state); break;// left key
        case 38: controller.up.update(key_state); break;// up key
        case 39: controller.right.update(key_state); break;// right key
        case 40: controller.down.update(key_state); break;// down key

      }

    }

  };

  display = {

    buffer:document.createElement("canvas").getContext("2d"),
    context:document.querySelector("canvas").getContext("2d"),
    height_width_ratio:undefined,
    i:0,

    sprite_sheet: {
      // x, y , width , height, offset_x, offset_y
      //why are the offsets needed?? I guess because she moves?
      //I guess that the third frame moving left is not being set down? lets try increasing y offset
      frames:[//new Frame(  0,  0, 27, 30), new Frame( 27,  0, 25, 30,  1),
              new Frame(  0,  64, 45, 30), new Frame( 45,  64, 42, 30,  1),
              //walk right
              //new Frame( 52,  0, 19, 29, -1,  1), new Frame( 71,  0, 19, 30, -1), new Frame(90,  0, 18, 30), new Frame(108,  0, 18, 31, 0, -1),
              new Frame( 87,  64, 33, 29, -1,  1), new Frame( 121, 64, 33, 30, -1), new Frame(155,  64, 33, 30), new Frame(189,  64, 31, 31, 0, -1),
              //walk left
              //new Frame(126,  0, 18, 30,  1), new Frame(144,  0, 18, 31,  1, -1), new Frame(162,  0, 19, 29, 2), new Frame(181,  0, 19, 30, 2),
              //new Frame(126,  0, 18, 31, 0, -1), new Frame(144,  0, 18, 31,  1, -1), new Frame(162,  0, 19, 30, -1), new Frame(181,  0, 19, 29, -1,1),
              new Frame(221,  64, 34, 31, 0, -1), new Frame(256,  64, 33, 31,  1, -1), new Frame(291,  64, 32, 30, -1), new Frame(326,  64, 32, 29, -1,1),
              //door, note door width here is hard-coded, but should force door class to get the right answer from the sprite sheet
              //new Frame(200,  0, 32, 32), new Frame(232,  0, 32, 32), new Frame(264,  0, 32, 32), new Frame(296,  0, 32, 32), new Frame(328,  0, 32, 32), new Frame(360,  0, 32, 32), new Frame(392,  0, 32, 32)],
              new Frame(200,  0, 10, 32), new Frame(232,  0, 10, 32), new Frame(264,  0, 10, 32), new Frame(296,  0, 10, 32), new Frame(328,  0, 10, 32), new Frame(360,  0, 10, 32), new Frame(392,  0, 10, 32)],

      frame_set: {

        dominique_idle:[0, 1],
        dominique_right:[2, 3, 4, 5],
        dominique_left:[6, 7, 8, 9],
        door:[10, 11, 12, 13, 14, 15, 16]

      },

      image:new Image()

    },

/*
    typeWriter:function(txt,speed=50,x=10,y=20,wrap=0,y2=30){
    //if(i == null){
    //var i;
    //i = 0;
    //}
    //var i;
    //i = 0;
    //assume text is short enough that we only wrap once, easily generalizable with for loop over wrap*j
    if(wrap>0){
       if (this.i < wrap) {
          this.context.fillText(txt.charAt(this.i),x+2*this.i,y);
          this.context.fillText(txt.charAt(this.i+wrap),x+2*this.i,y2);
          this.i++;
          //setTimeout(this.typeWriter.bind(null, txt), speed);
          }

    }
    else{
      if (this.i < txt.length) {
          context.fillText(txt.charAt(this.i),x+2*this.i,y);
          this.i++;
          //setTimeout(this.typeWriter.bind(null, txt), speed);
          }
    }
    },
*/


    render:function() {

      var frame;

      /* Draw the background. */
      this.buffer.fillStyle = game.area.background_color;
      this.buffer.fillRect(0, 0, game.area.width, game.area.height);

      /*background image. */
      //allocate memory and instantiate Image object
      var image2;
      image2  = new Image();

      image2.src = game.area.img;
      if(image2.src=="None"){
      //pass
      }
      else{
      //take the whole image and draw it in the top left hand corner using its full size
      //this.buffer.fillStyle = "#ffffff";
      //this.buffer.fillRect(0, 0,5, 5);
      this.buffer.drawImage(image2, 0, 0, image2.width, image2.height, 0, 0, image2.width, image2.height);
      }

      /*draw the "ceiling" with same thickness as floor*/
      this.buffer.fillStyle = "#004d4d";
      this.buffer.fillRect(0, 0, game.area.width, game.area.height-game.area.floor+6);

      /* Draw the floor. */
      this.buffer.fillStyle = "#373641";
      this.buffer.fillRect(0, game.area.floor - 3, game.area.width, game.area.height - game.area.floor + 3);

      /* Draw the doors. */
      for (let index = game.area.doors.length - 1; index > -1; -- index) {

        let door = game.area.doors[index];
        frame = this.sprite_sheet.frames[door.animation.frame_value];

        this.buffer.drawImage(this.sprite_sheet.image, frame.x, frame.y, frame.width, frame.height, door.x, door.y, frame.width, frame.height);

      }

      /* Draw Dominique. */
      frame = this.sprite_sheet.frames[game.dominique.animation.frame_value];

      this.buffer.drawImage(this.sprite_sheet.image, frame.x, frame.y, frame.width, frame.height, Math.round(game.dominique.x) + frame.offset_x * 0.5 - frame.width * 0.5, Math.round(game.dominique.y) + frame.offset_y * 0.5 - frame.height * 0.5, frame.width, frame.height);


      //here is where the canvas gets drawn -i.e. the background
      this.context.drawImage(this.buffer.canvas, 0, 0, game.area.width, game.area.height, 0, 0, this.context.canvas.width, this.context.canvas.height);


      // Dynamic Width (Build Regex)
      //s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n');





      //this.context.fillStyle = "#ffffff"; //white
      this.context.fillStyle = "#e6b800"; //gold
      if(game.area.img == "None"){
      this.context.font = "16px Arial";
      }
      else{
      this.context.font = "20px Arial";
      }
      //this.context.shadowColor="#ffffff";//"#997a00";
      //this.context.shadowBlur=1;
      //wrap(game.area.message,64);
      this.context.fillText(game.area.message, 10, 20);
      if(game.area.message2 != null){
      this.context.fillText(game.area.message2, 10, 40);
      }
      //this.context.fillText(game.area.img, 10, 20);
      //this.i=0;
      //this.typeWriter(game.area.message);
      },

    resize:function(event) {

      display.context.canvas.width = document.documentElement.clientWidth - 16;

      if (display.context.canvas.width > document.documentElement.clientHeight - 16) {

        display.context.canvas.width = document.documentElement.clientHeight - 16;

      }

      display.context.canvas.height = display.context.canvas.width * display.height_width_ratio;

      display.buffer.imageSmoothingEnabled = display.context.imageSmoothingEnabled = false;

      display.render();

    }

  };

  game = {

    area:undefined,

    dominique: {

      animation:new Animation(display.sprite_sheet.frame_set.dominique_idle, 15),
      half_height:15,
      half_width:10,
      jumping:false,
      velocity_x:0,
      velocity_y:0,
      x:30,//start more to the left100,
      y:100,

      //thats all the collision is? Just teleport the person back to the place you don't want it to go through?
      collideWorld:function() {

        if (this.x - this.half_width < 0) {

          this.x = this.half_width;

        } else if (this.x + this.half_width > game.area.width) {

            this.x = game.area.width - this.half_width;

        }
        //if we are not jumping and not on the floor, go to the floor
        if (this.y + this.half_height > game.area.floor) {

          this.jumping = false;
          this.velocity_y = 0;
          this.y = game.area.floor - this.half_height;

        }

      },

      update:function() {

        this.velocity_y += 0.5;

        this.x += this.velocity_x;
        this.y += this.velocity_y;

        this.velocity_x *= 0.9;
        this.velocity_y *= 0.9;

      }

    },

    engine: {

      accumulated_time:window.performance.now(),
      frame_request:undefined,
      time_step:1000/60,

      loop:function(time_stamp) {

        game.engine.frame_request = window.requestAnimationFrame(game.engine.loop);

        if (controller.left.active) {

          game.dominique.animation.change(display.sprite_sheet.frame_set.dominique_left, 15);
          game.dominique.velocity_x -= 0.1;

        }

        if (controller.right.active) {

          game.dominique.animation.change(display.sprite_sheet.frame_set.dominique_right, 15);
          game.dominique.velocity_x += 0.1;

        }

        if (!controller.left.active && !controller.right.active) {

          game.dominique.animation.change(display.sprite_sheet.frame_set.dominique_idle, 15);

        }

        if (controller.up.active && !game.dominique.jumping) {

          controller.up.active = false;
          game.dominique.jumping = true;
          game.dominique.velocity_y = -5;

        }

        game.dominique.update();
        game.dominique.collideWorld();

        game.dominique.animation.update();

        //loop over doors
        for (let index = game.area.doors.length - 1; index > -1; -- index) {

          let door = game.area.doors[index];
            /*this should work since there are only 2 doors per level*/
            if (door.count == 1){
                door.count=0;
                return;//display.render();
            }

          if (game.dominique.x > door.x && game.dominique.x < door.x + door.width) {

            door.animation.mode = "play";

            //take out the check if pressed down and just go through the door automatically
            //if (controller.down.active) { controller.down.active = false;

              //chaning this back since now only allowing entering doors from left
              if (controller.right.active) { controller.right.active = false;
                  game.dominique.x = door.new_x + game.dominique.half_width+door.width + 1;

              }
              if (controller.left.active) { controller.left.active = false;
                  game.dominique.x = door.new_x - game.dominique.half_width-door.width - 1;
                  //use the max width to displace player after entering door, otherwise will just go back through it

              }

                  game.loadArea(door.area, game.reset);
                  door.count = 1;
                  return;




             } else { door.animation.mode = "rewind"; }

          game.area.doors[index].animation.update();

        }

        display.render();

      },

      start:function() {

        this.accumulated_time = window.performance.now();
        this.frame_request = window.requestAnimationFrame(this.loop);

      },

      stop:function() {

        window.cancelAnimationFrame(this.frame_request);

      }

    },

    loadArea:function(url, callback) {

      var request, readyStateChange;

      request = new XMLHttpRequest();

      readyStateChange = function(event) {

        if (this.readyState == 4 && this.status == 200) {

          game.area = JSON.parse(this.responseText);

          callback();

          game.engine.start();

        }

      };

      request.addEventListener("readystatechange", readyStateChange);
      request.open("GET", url);
      request.send(null);

      game.engine.stop();

    },

    reset:function() {

      for (let index = game.area.doors.length - 1; index > -1; -- index) {

        let door = game.area.doors[index];

        game.area.doors[index] = new Door(door.x, game.area.floor - door.height - 3, door.area, door.new_x);

      }

      game.dominique.y = game.area.floor - game.dominique.half_height;
      game.dominique.velocity_x = 0;

      display.buffer.canvas.height = game.area.height;
      display.buffer.canvas.width = game.area.width;
      display.height_width_ratio = game.area.height / game.area.width;
      display.resize();

    }

  };

      ////////////////////
    //// INITIALIZE ////
  ////////////////////

  display.sprite_sheet.image.addEventListener("load", function(event) {

    game.loadArea("area0.json", function() {

      game.reset();

    });

  });

  //display.sprite_sheet.image.src = "doors-edit.png";
  display.sprite_sheet.image.src = "all_sprites.png";

  window.addEventListener("resize", display.resize);

  window.addEventListener("keydown", controller.keyDownUp);
  window.addEventListener("keyup", controller.keyDownUp);

})();
