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
  // const vertexData = [0, 1, 0, 1, -1, 0, -1, -1, 0];
  // const vertexData = [...cube];
  const maxPoints = Math.random() * (1e4 - 1e3) + 1e3;
  const vertexData = generatePointCloud(1e4);

  // const colorData = [
  //   1, 0, 0, // V1 color
  //   0, 1, 0, // V2 color
  //   0, 0, 1, // V3 color
  // ];
  const colorData = [];

  // for (let face = 0; face < 6; face++) {
  //   const faceColor = randomizeColor();
  //   for (let vertex = 0; vertex < 6; vertex++) {
  //     colorData.push(...faceColor);
  //   }
  // }

  for (let i = 0; i < vertexData.length; i += 3) {
    colorData.push(...randomizeStarColor());
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  /*
   * MARK:- Vertex Shader
   */
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  const vertexShaderSource = `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;

    varying vec3 vColor;

    uniform mat4 modelMatrix;

    void main() {
      vColor = color;
      // vColor = vec3(position.xy, 1.0);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
    canvas.width / canvas.height, // aspect ratio
    1e-4, // near
    1e4 // far
  );

  const finalMatrix = mat4.create();

  mat4.translate(modelMatrix, modelMatrix, [0.125, 0.125, -2]);
  // mat4.scale(modelMatrix, modelMatrix, [0.25, 0.25, 0.25]);

  function animate() {
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    requestAnimationFrame(animate);

    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 2 / (360 * 0.5));
    mat4.rotateX(modelMatrix, modelMatrix, -Math.PI / 2 / (360 * 3));

    mat4.multiply(finalMatrix, projectionMatrix, modelMatrix);

    gl.uniformMatrix4fv(uniformLocations.modelMatrix, false, finalMatrix);
    gl.drawArrays(gl.POINT, 0, vertexData.length / 3);
  }

  animate();

  // gl.uniformMatrix4fv(uniformLocations.modelMatrix, false, modelMatrix);

  // gl.drawArrays(gl.TRIANGLES, 0, 3);
};
