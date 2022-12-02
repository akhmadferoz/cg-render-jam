function getColor(r, g, b, a = 255) {
  return [r / 255, g / 255, b / 255, a];
}

function randomizeColor() {
  return [Math.random(), Math.random(), Math.random()];
}

function randomizeStarColor() {
  return [
    Math.random() * 0.5 + 0.5,
    Math.random() * 0.5 + 0.5,
    Math.random() * 0.5 + 0.5,
  ];
}

function repeat(n, pattern) {
  return [...Array(n)].reduce((sum) => sum.concat(pattern), []);
}

function generateRandomPoint() {
  return Math.random() - 0.5;
}

const shapes = {
  circularHyperboloid(...position) {
    let [_, a, b] = position.map((n) => n + 0.5);
    a *= 2 * Math.PI; // 0 < a < 2PI
    b *= 2 * Math.PI; // 0 < b < 2PI

    let x = Math.cos(a) / Math.cos(b);
    let y = Math.sin(a) / Math.cos(b);
    let z = Math.sin(b);

    return [x, y, z];
  },

  cylinderShell(...position) {
    const R = 1;

    let [r, a, _] = position.map((n) => n + 0.5);
    r *= R;
    a *= 2 * Math.PI; // 0 < a < 2PI

    let x = R * Math.cos(a);
    let y = R * Math.sin(a);
    let z = position[2];

    return [x, y, z];
  },

  cylinderShellInfinte(...position) {
    const R = 1;

    let [_, a, b] = position.map((n) => n + 0.5);
    a *= 2 * Math.PI; // 0 < a < 2PI
    b *= 2 * Math.PI; // 0 < b < 2PI

    let x = R * Math.cos(a);
    let y = R * Math.sin(a);
    let z = Math.tan(b);

    return [x, y, z];
  },

  sphereShell(...position) {
    return vec3.normalize(vec3.create(), position);
  },

  sphereShell2(...position) {
    const R = 1;

    const normalize1D = (n) => n / Math.abs(n);
    let [r, a, b] = position.map((n) => n + 0.5);
    r *= R;
    a *= 2 * Math.PI; // 0 < a < 2PI
    b = position[2] * 2; // -1 < b < 1

    let x = r * Math.cos(a);
    let y = r * Math.sin(a);
    let z = normalize1D(b) * Math.sqrt(R * R - r * r);

    return [x, y, z];
  },

  boxShell(...position) {
    const distToWall = (a) => 0.5 - Math.abs(a);
    const normalize1D = (n) => n / Math.abs(n);

    const dists = position.map(distToWall);
    const minDistToWall = Math.min(...dists);

    if (minDistToWall == dists[0]) {
      position[0] = 0.5 * normalize1D(position[0]);
    } else if (minDistToWall == dists[1]) {
      position[1] = 0.5 * normalize1D(position[1]);
    } else if (minDistToWall == dists[2]) {
      position[2] = 0.5 * normalize1D(position[2]);
    }

    return position;
  },
};

function generatePointCloud(n, shape) {
  const points = [];

  // const maxShapes = Object.keys(shapes).length;
  // const shape =
  //   shapes[Object.keys(shapes)[Math.floor(Math.random() * maxShapes)]];

  for (let i = 0; i < n; i++) {
    const coordinate = [
      generateRandomPoint(),
      generateRandomPoint(),
      generateRandomPoint(),
    ];

    // points.push(...vec3.normalize(vec3.create(), coordinate));
    points.push(...shape(...coordinate));
  }

  return points;
}
