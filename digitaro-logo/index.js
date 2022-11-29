"use strict";

/*
 *
 * IMPORTANT NOTICE
 * You will need to install the LIVE SERVER extension in VS Code to run this code.
 * Extension URL: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
 *
 * Took help from the course book and online resources.
 */

/*
 *
 * Defining essential variables needed for transformation.
 *
 */
var gl;
var program;
var vertices = [],
  colors = [],
  faces = [],
  pointList = [];
var thetaLoc;
var initPoints;
var request;
// var file = "dragon_vrip_res2.ply";
var file = "dragon_vrip.ply";
var val = 4; //holds the rotation value
var coordinates = [0, 1, 2];
var theta = [0, 0, 0];
var scale = [5.5, 5.5, -5.5];
var translate = [0, 0, 0];
var shear = [0, 0, 0, 0, 0, 0]; //the order is xy,xz,yx,yz,zx,zy
var flag = true;
var rotated = [false, false, false];

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  fileReader(file);
  var i = 0;
  while (i < faces.length) {
    colors.push(
      vec4(0.7, 0.3, 0.7, 1),
      vec4(0.2, 0.5, 0.7, 1),
      vec4(0.3, 0.7, 0.1, 1)
    );
    pointList.push(vec3(vertices[faces[i][0]]));
    pointList.push(vec3(vertices[faces[i][1]]));
    pointList.push(vec3(vertices[faces[i][2]]));
    i++;
  }
  initPoints = pointList;
  draw();
};

function draw() {
  var scaleMatrix = new Float32Array([
    scale[0],
    0.0,
    0.0,
    0.0,
    0.0,
    scale[1],
    0.0,
    0.0,
    0.0,
    0.0,
    scale[2],
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
  ]);

  var translationMatrix = new Float32Array([
    1,
    0,
    0,
    translate[0],
    0,
    1,
    0,
    translate[1],
    0,
    0,
    1,
    translate[2],
    0,
    0,
    0,
    1,
  ]);

  var u_scale = gl.getUniformLocation(program, "u_scale");
  gl.uniformMatrix4fv(u_scale, false, scaleMatrix);

  var u_translation = gl.getUniformLocation(program, "u_translation");
  gl.uniformMatrix4fv(u_translation, false, translationMatrix);

  var u_shear = gl.getUniformLocation(program, "u_shear");
  gl.uniformMatrix4fv(u_shear, false, shearMatrix);

  window.cancelAnimationFrame(request);

  // Load the data into the GPU
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointList), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  thetaLoc = gl.getUniformLocation(program, "theta");

  var color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render();
}

/*
 *
 * Render
 *
 */
function render() {
  if (val != 4) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag == true) {
      theta[val] += 2.5;
    } else {
      theta[val] -= 2.5;
    }
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, pointList.length);
    request = window.requestAnimFrame(render);
  } else {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointList.length);
    request = window.requestAnimFrame(render);
  }
}

/*
 *
 * Rotate the figure
 *
 */
function transform_rotate(direction) {
  //for x direction
  if (direction == 0) {
    val = coordinates[0];
    draw();
  }
  //for y direction
  else if (direction == 1) {
    val = coordinates[1];
    draw();
  }
  //for z direction
  else if (direction == 2) {
    val = coordinates[2];
    draw();
  }
}
