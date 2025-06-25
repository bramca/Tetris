function spawnRandomShape() {
    if (nextshape) {
        shape = nextshape;
        shape.size = shapesize;
        shape.pos = { x: Math.floor(c.width * 0.5 / shapesize) * shapesize, y: spawnoffsety };
        nextshape = shapes[Math.floor(Math.random() * shapes.length)]();
    } else {
        shape = shapes[Math.floor(Math.random() * shapes.length)]();
        nextshape = shapes[Math.floor(Math.random() * shapes.length)]();
    }
    nextshape.pos = { x: shapesize, y: nextshape instanceof StickShape ? shapesize + 10 : shapesize };
    nextshape.size = shape.size / 2;
    scanshape = JSON.parse(JSON.stringify(shape));
    scanshape.color = "rgb(0,255,0)";
    scanshape.coords = shape.coords;
    scanshape.render = shape.render;
    scanshape.blockrotation = shape.blockrotation;
    scanshape.blocksideleft = shape.blocksideleft;
    scanshape.blocksideright = shape.blocksideright;
    stopscan = false;
    maxneighbours = 0;
    bestheight = {};
    bestpos = [];
    bestrot = [];
    var blockedleft = false;
    while (!blockedleft) {
        var co = scanshape.coords(scanshape.rot);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x <= 0) {
                blockedleft = true;
            }
        }
        if (!blockedleft) {
            scanshape.pos.x -= shapesize;
        }
    }
}

function randomColor() {
    return "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
}

function pause(p) {
    p.fill(140);
    p.noStroke();
    size = 10;
    // p.rect(p.width-4*size, size, size, 3*size);
    // p.rect(p.width-2*size, size, size, 3*size);
    p.rect(3 * size, size, size, 3 * size);
    p.rect(1 * size, size, size, 3 * size);
}

function reset() {
    lockedshapes = [];
    initgrid();
    initgridpoints();
    score = 0;
    scoresaved = false;
    gridmaxheight = grid[0].length - 1;
    fallspeed = 10;
    level = 0;
    totalrowfullcount = 0;
    spawnRandomShape();
}

function initgrid() {
    grid = [];
    var gridheight = (c.height - Math.floor(c.height / shapesize) * shapesize < (shapesize - 5)) ? Math.floor(c.height / shapesize) * shapesize - shapesize : Math.floor(c.height / shapesize) * shapesize;
    for (var i = 0; i < Math.floor(c.width / shapesize) * shapesize; i += shapesize) {
        grid[i] = new Array(gridheight + 1);
    }
}

function initgridpoints() {
    gridpoints = [];
    var gridheight = (c.height - Math.floor(c.height / shapesize) * shapesize < (shapesize - 5)) ? Math.floor(c.height / shapesize) * shapesize - shapesize : Math.floor(c.height / shapesize) * shapesize;
    for (var i = 0; i < Math.floor(c.width / shapesize) * shapesize; i += shapesize) {
        gridpoints[i] = new Array(gridheight + 1);
    }
}

function writeScore(p) {
    p.fill(140);
    p.stroke(0);
    p.textSize(30);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(score, p.width - 10, 20);
}
