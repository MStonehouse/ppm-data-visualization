let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let maxCanvasWidth = 860;
let setCanvasWidthHeight = function() {
  return window.innerWidth > maxCanvasWidth ? maxCanvasWidth * .9 : window.innerWidth * .9
};
ctx.canvas.width = setCanvasWidthHeight();
ctx.canvas.height = setCanvasWidthHeight(); // set height same as width for simplicity
let width = canvas.width;
let height = canvas.height;
let depth = canvas.width;
let xCenter = width / 2; // X center position for rotation calculation
let zCenter = depth / 2; // Z center position for rotation calculation
let blockPercentage = .5; // control particle block size with this number (width * this.number = block width)
let blockWidth = width * blockPercentage; // set volume(block) width as a percentage of canvas width
let blockHeight = height * blockPercentage; // set volume(block) height as a percentage of canvas height
let blockDepth = depth * blockPercentage; //
let particles; // var to hold all particles
let boundingBox; // var to hold bounding box
let frame; // contains the animation frame so it can be canceled later
let rotationSpeed = 0.01; // value is in radians
let boxPadding = 6;
let numberOfParticles = Number(document.getElementById('number-of-particles').value); // get initial number of dots
let particleColor = document.getElementById('ppm-color').value; // get initial particle color
let stateType = document.querySelector('input[name="statetype"]:checked').value; // get initial radio button selection for gas or solid/liquid
let maxRange = Number(document.getElementById('number-of-particles').max); // get max number of particles
let boundingBoxSelected = document.getElementById('bounding-box').checked; // get if bounding box is selected


// class to make a bounding box
class BoundingBox {
  constructor() {
    this.points = [{
        pointNumber: 1,
        x: (width / 2) - (blockWidth / 2) - boxPadding,
        y: (height / 2) - (blockHeight / 2) - boxPadding,
        z: (depth / 2) - (blockDepth / 2) - boxPadding,
        yAdjusted: (height / 2) - (blockHeight / 2) - boxPadding,
        xAdjusted: (width / 2) - (blockWidth / 2) - boxPadding,
      },
      {
        pointNumber: 2,
        x: (width / 2) + (blockWidth / 2) + boxPadding,
        y: (height / 2) - (blockHeight / 2) - boxPadding,
        z: (depth / 2) - (blockDepth / 2) - boxPadding,
        yAdjusted: (height / 2) - (blockHeight / 2) - boxPadding,
        xAdjusted: (width / 2) + (blockWidth / 2) + boxPadding,
      },
      {
        pointNumber: 3,
        x: (width / 2) + (blockWidth / 2) + boxPadding,
        y: (height / 2) - (blockHeight / 2) - boxPadding,
        z: (depth / 2) + (blockDepth / 2) + boxPadding,
        yAdjusted: (height / 2) - (blockHeight / 2) - boxPadding,
        xAdjusted: (width / 2) + (blockWidth / 2) + boxPadding,
      },
      {
        pointNumber: 4,
        x: (width / 2) - (blockWidth / 2) - boxPadding,
        y: (height / 2) - (blockHeight / 2) - boxPadding,
        z: (depth / 2) + (blockDepth / 2) + boxPadding,
        yAdjusted: (height / 2) - (blockHeight / 2) - boxPadding,
        xAdjusted: (width / 2) - (blockWidth / 2) - boxPadding,
      },
      {
        pointNumber: 5,
        x: (width / 2) - (blockWidth / 2) - boxPadding,
        y: (height / 2) + (blockHeight / 2) + boxPadding,
        z: (depth / 2) - (blockDepth / 2) - boxPadding,
        yAdjusted: (height / 2) + (blockHeight / 2) + boxPadding,
        xAdjusted: (width / 2) - (blockWidth / 2) - boxPadding,
      },
      {
        pointNumber: 6,
        x: (width / 2) + (blockWidth / 2) + boxPadding,
        y: (height / 2) + (blockHeight / 2) + boxPadding,
        z: (depth / 2) - (blockDepth / 2) - boxPadding,
        yAdjusted: (height / 2) + (blockHeight / 2) + boxPadding,
        xAdjusted: (width / 2) + (blockWidth / 2) + boxPadding,
      },
      {
        pointNumber: 7,
        x: (width / 2) + (blockWidth / 2) + boxPadding,
        y: (height / 2) + (blockHeight / 2) + boxPadding,
        z: (depth / 2) + (blockDepth / 2) + boxPadding,
        yAdjusted: (height / 2) + (blockHeight / 2) + boxPadding,
        xAdjusted: (width / 2) + (blockWidth / 2) + boxPadding,
      },
      {
        pointNumber: 8,
        x: (width / 2) - (blockWidth / 2) - boxPadding,
        y: (height / 2) + (blockHeight / 2) + boxPadding,
        z: (depth / 2) + (blockDepth / 2) + boxPadding,
        yAdjusted: (height / 2) + (blockHeight / 2) + boxPadding,
        xAdjusted: (width / 2) - (blockWidth / 2) - boxPadding,
      },
    ];
  }
  rotate() {
    let tempObj = this.points.map(v => {
      var newX = (((v.x - xCenter) * Math.cos(rotationSpeed)) - ((v.z - zCenter) * Math.sin(rotationSpeed))) + xCenter
      var newZ = (((v.z - zCenter) * Math.cos(rotationSpeed)) + ((v.x - xCenter) * Math.sin(rotationSpeed))) + zCenter

      return ({
        pointNumber: v.pointNumber,
        x: newX,
        y: v.y,
        z: newZ,
        yAdjusted: perspective(v.y, newZ, 'y'),
        xAdjusted: perspective(newX, newZ, 'x')
      })
    }).sort((a, b) => a.pointNumber - b.pointNumber)

    this.points = tempObj;
  }
  draw() {
    // draw bounding box points
    for (let i = 0; i < this.points.length; i++) {
      ctx.globalAlpha = Math.abs(1 - ((this.points[i].z / width) / 1.3));
      ctx.beginPath();
      ctx.arc(this.points[i].xAdjusted, this.points[i].yAdjusted, 3, 0, 360);
      ctx.fillStyle = '#cbcbcb';
      ctx.fill();
      ctx.closePath();
    }
    // draw bounding box lines
    ctx.beginPath();
    ctx.moveTo(this.points[0].xAdjusted, this.points[0].yAdjusted);
    ctx.lineTo(this.points[1].xAdjusted, this.points[1].yAdjusted);
    ctx.lineTo(this.points[2].xAdjusted, this.points[2].yAdjusted);
    ctx.lineTo(this.points[3].xAdjusted, this.points[3].yAdjusted);
    ctx.lineTo(this.points[0].xAdjusted, this.points[0].yAdjusted);
    ctx.lineTo(this.points[4].xAdjusted, this.points[4].yAdjusted);
    ctx.lineTo(this.points[5].xAdjusted, this.points[5].yAdjusted);
    ctx.lineTo(this.points[6].xAdjusted, this.points[6].yAdjusted);
    ctx.lineTo(this.points[7].xAdjusted, this.points[7].yAdjusted);
    ctx.lineTo(this.points[4].xAdjusted, this.points[4].yAdjusted);
    ctx.moveTo(this.points[1].xAdjusted, this.points[1].yAdjusted);
    ctx.lineTo(this.points[5].xAdjusted, this.points[5].yAdjusted);
    ctx.moveTo(this.points[2].xAdjusted, this.points[2].yAdjusted);
    ctx.lineTo(this.points[6].xAdjusted, this.points[6].yAdjusted);
    ctx.moveTo(this.points[3].xAdjusted, this.points[3].yAdjusted);
    ctx.lineTo(this.points[7].xAdjusted, this.points[7].yAdjusted);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbcbcb';
    ctx.stroke();
  }
}



// class to make particles
class Particle {
  constructor() {
    this.x = (Math.random() * blockWidth) + ((width - blockWidth) / 2);
    this.y = (Math.random() * blockHeight) + ((height - blockHeight) / 2);
    this.z = (Math.random() * blockDepth) + ((depth - blockDepth) / 2);
    // set initial xAdjusted and yAdjusted to same as x and y positions
    this.xAdjusted = (Math.random() * blockWidth) + ((width - blockWidth) / 2); // to hold x position based on depth perspective
    this.yAdjusted = (Math.random() * blockHeight) + ((height - blockHeight) / 2); // to hold y position based on depth perspective
  }
  rotate() {
    let tempX = (((this.x - xCenter) * Math.cos(rotationSpeed)) - ((this.z - zCenter) * Math.sin(rotationSpeed))) + xCenter;
    let tempZ = (((this.z - zCenter) * Math.cos(rotationSpeed)) + ((this.x - xCenter) * Math.sin(rotationSpeed))) + zCenter;
    this.x = tempX;
    this.z = tempZ;
    this.xAdjusted = perspective(tempX, tempZ, 'x');
    this.yAdjusted = perspective(this.y, tempZ, 'y');
  }
  draw() {
    let particleWidth = blockWidth / stateType; // 100 = solid-liquid, 300 = gas
    ctx.globalAlpha = Math.abs(1 - ((this.z / width) / 1.3));
    ctx.beginPath();
    ctx.arc(this.xAdjusted, this.yAdjusted, particleWidth, 0, 360);
    ctx.fillStyle = particleColor;
    ctx.fill();
    ctx.closePath();
  }
}



// function to calculate yPerspective and xPerspective for the perception of depth
function perspective(position, zDepth, axis) {
  if (axis == 'y') {
    let perspectiveRatio = ((zCenter - position) / (blockHeight / 2)); // gives a number between -1 and 1 to represent how far from Y center particle is
    let zRatio = (zDepth - (width / 2)) / (blockWidth / 2); // gives a number from -1 to 1 to represent particle depth
    let yMultiplier = 20;
    let adjustment = perspectiveRatio * zRatio * yMultiplier;
    return position + adjustment;
  } else if (axis == 'x') {
    let xRatio = (position - xCenter) / xCenter; // express x position as number from -1 to 1
    let zRatio = (zDepth - zCenter) / zCenter; // express z position as number from -1 to 1
    let direction = xRatio * zRatio > 0 ? -1 : 1; // set direction to adjust based on quadrant
    let xMultiplier = 80; // used to amplify movement
    let adjustment = (Math.abs(xRatio) * Math.abs(zRatio)) * direction * xMultiplier; // calculate adjustment
    return position + adjustment;
  }
}



function makeParticles() {
  if (numberOfParticles <= maxRange && numberOfParticles >= 1) { // if numberOfDots is in range
    particles = []; // erase existing particles

    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle())
    }
  }
}



function makeBoundingBox() {
  if (numberOfParticles <= maxRange && numberOfParticles >= 1) { // if numberOfDots is in range
    boundingBox = new BoundingBox();
  }
}



// on window resize reset canvas width and height and recalculate all relevant sizes
function windowResize() {
  ctx.canvas.width = setCanvasWidthHeight();
  ctx.canvas.height = setCanvasWidthHeight();
  width = canvas.width;
  height = canvas.height;
  depth = canvas.width;
  xCenter = width / 2;
  zCenter = depth / 2;
  blockWidth = width * blockPercentage;
  blockHeight = height * blockPercentage;
  blockDepth = depth * blockPercentage;
  window.cancelAnimationFrame(frame);
  makeParticles();
  makeBoundingBox();
  frame = window.requestAnimationFrame(drawPPM);
}



// main function to draw the particles
function drawPPM() {
  ctx.clearRect(0, 0, width, height);

  if (boundingBoxSelected) {
    boundingBox.rotate();
    boundingBox.draw();
  }

  for (let j = 0; j < particles.length; j++) {
    particles[j].rotate();
    particles[j].draw();
  }

  frame = window.requestAnimationFrame(drawPPM)
}



// when 'Calculate PPM' button is clicked run calculatePPM function
document.getElementById("runPPM").onclick = function() {
  window.cancelAnimationFrame(frame); // cancel current animation frame

  // reset particle based on current inputs
  numberOfParticles = document.getElementById('number-of-particles').value; // get current number of dots
  particleColor = document.getElementById('ppm-color').value; // get current color
  stateType = document.querySelector('input[name="statetype"]:checked').value; // get if gas or solid/liquid
  makeParticles(); // make a new set of dots based on new user settings

  // reset visibility of bounding box based on current inputs
  boundingBoxSelected = document.getElementById('bounding-box').checked;
  makeBoundingBox();

  frame = window.requestAnimationFrame(drawPPM); // request new animation frame and run it
}


// run initial program
makeParticles();
makeBoundingBox();
frame = window.requestAnimationFrame(drawPPM);
