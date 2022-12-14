"use strict";

window.onload = function () {
  /*
   * MARK:- WebGL Init
   */
  const canvas = document.querySelector("#gl-canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("Your browser does not support WebGL 2.0 :(");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  // gl.clearColor(...getColor(30, 25, 33));

  const frontFace = [
    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5,
    0.5, -0.5, -0.5, 0.5,
  ];

  const leftFace = [
    -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5, -0.5, -0.5,
  ];

  const backFace = [
    -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5, -0.5, -0.5,
  ];

  const rightFace = [
    0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5, 0.5,
  ];

  const topFace = [
    0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5, -0.5,
  ];

  const bottomFace = [
    0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5,
  ];

  const cube = [
    ...frontFace,
    ...leftFace,
    ...backFace,
    ...rightFace,
    ...topFace,
    ...bottomFace,
  ];

  // F, L, B, R
  // const starFieldVertexData = [0, 1, 0, 1, -1, 0, -1, -1, 0];
  // const starFieldVertexData = [...cube];
  const starFieldVertexData = generatePointCloud(
    1e4,
    shapes.circularHyperboloid
  );

  // starFieldVertexData.push(...[0, 0, 0]);

  const sphereVertexData = generatePointCloud(1e4, shapes.sphereShell);

  const starFieldColorData = [];
  const sphereColorData = [];

  for (let i = 0; i < starFieldVertexData.length; i += 3) {
    starFieldColorData.push(...randomizeStarColor());
  }

  // starFieldVertexData.push(...[0, 0, 0]);
  // starFieldColorData.push(...getColor(255, 255, 255));

  for (let i = 0; i < sphereVertexData.length; i += 3) {
    // sphereColorData.push(...randomizeStarColor());
    sphereColorData.push(...randomizeColor());
  }

  starFieldVertexData.push(...sphereVertexData);
  starFieldColorData.push(...sphereColorData);

  const starFieldPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starFieldPositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(starFieldVertexData),
    gl.STATIC_DRAW
  );

  const spherePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(sphereVertexData),
    gl.STATIC_DRAW
  );

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(starFieldColorData),
    gl.STATIC_DRAW
  );

  /*
   * MARK:- Vertex Shader
   */
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  const vertexShaderSource = `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 spherePosition;
    attribute vec3 color;

    varying vec3 vColor;

    uniform mat4 modelMatrix;

    void main() {
      vColor = color;
      gl_Position = modelMatrix * vec4(position, 1);
    }
  `;

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  /*
   * MARK:- Fragment Shader
   */
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1);
    }
  `;

  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, starFieldPositionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const spherePositionLocation = gl.getAttribLocation(
    program,
    "spherePosition"
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, starFieldPositionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorLocation = gl.getAttribLocation(program, "color");
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  const uniformLocations = {
    modelMatrix: gl.getUniformLocation(program, "modelMatrix"),
  };

  const modelMatrix = mat4.create();
  // mat4.translate(modelMatrix, modelMatrix, [0.1, 0.3, 0.5]);

  const projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    (90 * Math.PI) / 180, // Vertical FOV
    canvas.width / canvas.height, // Aspect Ratio
    1e-4, // Near
    1e4 // Far
  );

  const finalMatrix = mat4.create();

  mat4.translate(modelMatrix, modelMatrix, [0, 0, -2]);
  // mat4.translate(modelMatrix, modelMatrix, [-0.0625, 0.0625, -2]);
  // mat4.translate(modelMatrix, modelMatrix, [0.125, 0.125, -2]);
  // mat4.scale(modelMatrix, modelMatrix, [1.5, 1.5, 1.5]);

  let scale = 1;

  let scaleFactor = 1.0005;

  const reloatTimer = 60000;

  setInterval(() => {
    scale *= -1;
    const scaleValue = 0.0015 * scale;
    scaleFactor += scaleValue;
  }, reloatTimer);

  function animate() {
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    requestAnimationFrame(animate);

    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 2 / (360 * 4));
    mat4.rotateX(modelMatrix, modelMatrix, -Math.PI / 2 / (360 * 12));
    // mat4.rotateY(modelMatrix, modelMatrix, -Math.PI / 2 / (360 * 2));

    mat4.multiply(finalMatrix, projectionMatrix, modelMatrix);

    mat4.scale(modelMatrix, modelMatrix, [
      scaleFactor,
      scaleFactor,
      scaleFactor,
    ]);

    gl.uniformMatrix4fv(uniformLocations.modelMatrix, false, finalMatrix);
    gl.drawArrays(gl.POINTS, 0, starFieldVertexData.length / 3);
    // gl.drawArrays(gl.TRIANGLES, 0, sphereVertexData.length / 3);
  }

  animate();

  // setTimeout(() => {
  //   window.location.reload();
  // }, reloatTimer);

  // gl.uniformMatrix4fv(uniformLocations.modelMatrix, false, modelMatrix);

  // gl.drawArrays(gl.TRIANGLES, 0, 3);
};
