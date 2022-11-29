function getColor(r, g, b, a = 255) {
  return [r / 255, g / 255, b / 255, a];
}

function randomizeColor() {
  return [Math.random(), Math.random(), Math.random()];
}

function repeat(n, pattern) {
  return [...Array(n)].reduce((sum) => sum.concat(pattern), []);
}
