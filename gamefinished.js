var c;
var canvas;
var shapesize = 20;
var shape;
var lockedshapes = [];
var paused = false;
var gameover = false;
var grid = [];
var gridpoints = [];
var spawnoffsety = shapesize*3;
var fallspeed = 10;
var holdleftdowncount = 0;
var holdrightdowncount = 0;
var holddowncount = 0;
var score = 0;
var scoresaved = false;
var totalrowfullcount = 0;
var level = 0;
var nextshape;

// om gemakkelijker te zien waar het zal vallen
var aid = false;

// alles nodig voor ai
var ai = false;
var randpoint;
var gridmaxheight = 0;
var scanshape;
var rotcount = 0;
var maxneighbours = 0;
var bestpos = [];
var bestrot = [];
var bestheight = {};
var stopscan = false;
var fastmode = true;

var shapes = [function () { return new LShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new LMirrorShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new ZShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new ZMirrorShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new Block(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new IndescribableShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); },
              function () { return new StickShape(shapesize, randomColor(), {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety}); }];

window.addEventListener("keydown", function (e) {
    // space en arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

var sketch = function (p) {
    p.setup = function () {
        c = p.createCanvas(220, 500);
        canvas = c.canvas;
        var canvasdiv = document.getElementById("canvasdiv");
        canvasdiv.appendChild(canvas);
        p.frameRate(30);
        initgrid();
        initgridpoints();
        spawnRandomShape();
        gridmaxheight = grid[0].length-1;
    }

    p.draw = function () {
        for (var x = 0; x < Math.floor(c.width/shapesize)*shapesize; x += shapesize) {
            if (grid[x][spawnoffsety+4*shapesize]) {
                gameover = true;
                if (!scoresaved) {
                    $.ajax({
                        url: "../sendscore",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({score: score, ai: ai})
                    });
                    scoresaved = true;
                }
                p.noLoop();
                if (ai) {
                    setTimeout(function () {
                        gameover = false;
                        reset();
                        p.loop();
                    }, 3000);
                }
            }
        }
        p.background(31);
        writeScore(p);
        var rowfullcount = 0;
        var rowsfull = [];
        for (var j = grid[0].length-1; j >= gridmaxheight; j -= shapesize) {
            var rowfull = true;
            for (var i = 0; i < grid.length; i += shapesize) {
                if (!grid[i][j]) {
                    rowfull = false;
                }
            }
            if (rowfull) {
                rowsfull.push(j);
                rowfullcount++;
            }
        }
        for (var _i = rowsfull.length-1; _i >= 0; _i--) {
            var j = rowsfull[_i];
            for (var k = j; k >= gridmaxheight; k -= shapesize) {
                for (var i = 0; i < gridpoints.length; i += shapesize) {
                    gridpoints[i][k] = gridpoints[i][k-shapesize];
                    grid[i][k] = grid[i][k-shapesize];
                }
            }
            gridmaxheight += shapesize;
        }
        totalrowfullcount += rowfullcount;
        if (totalrowfullcount >= 8 && fallspeed > 5) {
            level++;
            fallspeed--;
            totalrowfullcount -= 8;
        }
        switch (rowfullcount) {
        case 1:
            score += 40*(level+1);
            break;
        case 2:
            score += 100*(level+1);
            break;
        case 3:
            score += 300*(level+1);
            break;
        case 4:
            score += 1200*(level+1);
            break;
        }
        // for (var i = 0; i < lockedshapes.length; i++) {
            // lockedshapes[i].render(p);
        // }
        for (var i = 0; i < gridpoints.length; i += shapesize) {
            for (var j = 0; j < gridpoints[0].length; j += shapesize) {
                if (grid[i][j]) {
                    p.fill(gridpoints[i][j]);
                    p.stroke("black");
                    p.rect(i, j, shapesize, shapesize);
                }
            }
        }
        nextshape.render(p);
        shape.render(p);
        if (shape.lock(p, grid)) {
            lockedshapes.push(shape);
            var co = shape.coords(shape.rot);
            for (var i = 0;  i < co.length; i++) {
                grid[co[i].x][co[i].y] = true;
                gridpoints[co[i].x][co[i].y] = shape.color;
                if (co[i].y < gridmaxheight) {
                    gridmaxheight = co[i].y;
                }
            }
            spawnRandomShape();
        }
        shape.render(p);
        if (p.frameCount%fallspeed === 0) {
            shape.fall();
        }
        if (paused) {
            pause(p);
        }
        // 74 check is for vim key support ('j')
        if ((p.keyIsDown(p.DOWN_ARROW) || p.keyIsDown(74)) && !ai) {
            holddowncount++;
            if (holddowncount > 10 && p.frameCount%2 === 0) {
                if (shape.lock(p, grid)) {
                    lockedshapes.push(shape);
                    var co = shape.coords(shape.rot);
                    for (var i = 0;  i < co.length; i++) {
                        grid[co[i].x][co[i].y] = true;
                        gridpoints[co[i].x][co[i].y] = shape.color;
                    }
                    spawnRandomShape();
                }
                shape.pos.y += shape.size;
            }
        } else {
            holddowncount = 0;
        }
        // 72 check is for vim key support ('h')
        if ((p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(72)) && !ai) {
            holdleftdowncount++;
            if (!shape.blocksideleft(grid) && holdleftdowncount > 10) {
                if (p.frameCount%2 === 0) {
                    shape.pos.x -= shape.size;
                }
            }
        } else {
            holdleftdowncount = 0;
        }
        // 76 check is for vim key support ('l')
        if ((p.keyIsDown(p.RIGHT_ARROW) || p.keyIsDown(76)) && !ai) {
            holdrightdowncount++;
            if (!shape.blocksideright(grid) && holdrightdowncount > 10) {
                if (p.frameCount%2 === 0) {
                    shape.pos.x += shape.size;
                }
            }
        } else {
            holdrightdowncount = 0;
        }
        if (aid) {
            var shapecp = JSON.parse(JSON.stringify(shape));
            shapecp.color = "rgb(255,0,0)";
            shapecp.coords = shape.coords;
            shapecp.render = shape.render;
            if (shape.pos.y < gridmaxheight) {
                if (shape instanceof StickShape) {
                    shapecp.pos.y = gridmaxheight-shapesize;
                } else {
                    shapecp.pos.y = gridmaxheight-2*shapesize;
                }
            }
            var bezet = false;
            while (!bezet) {
                var co = shapecp.coords(shapecp.rot);
                for (var i = 0; i < co.length; i++) {
                    if (grid[co[i].x][co[i].y] || co[i].y > grid[0].length-1) {
                        bezet = true;
                    }
                }
                if (!bezet) {
                    shapecp.pos.y += shapesize;
                } else {
                    shapecp.pos.y -= shapesize;
                }
            }
            shapecp.render(p);
        }
        if (ai) {
            while (!stopscan) {
                if (shape instanceof StickShape) {
                    scanshape.pos.y = gridmaxheight-shapesize;
                } else {
                    scanshape.pos.y = gridmaxheight-2*shapesize;
                }
                var bezet = false;
                while (!bezet) {
                    var co = scanshape.coords(scanshape.rot);
                    for (var i = 0; i < co.length; i++) {
                        if (grid[co[i].x][co[i].y] || co[i].y > grid[0].length-1) {
                            bezet = true;
                        }
                    }
                    if (!bezet) {
                        scanshape.pos.y += shapesize;
                    } else {
                        scanshape.pos.y -= shapesize;
                    }
                }
                var co = scanshape.coords(scanshape.rot);
                var neighbours = 0;
                for (var i = 0; i < co.length; i++) {
                    if (grid[co[i].x][co[i].y+shapesize] || co[i].y+shapesize > grid[0].length-1) {
                        neighbours++;
                    }
                    // if (co[i].x-shapesize < 0 || grid[co[i].x-shapesize][co[i].y]
                    //     || co[i].x+shapesize > grid.length-1 || grid[co[i].x+shapesize][co[i].y]) {
                    //     neighbours++;
                    // }
                    if (co[i].x-shapesize >= 0) {
                        if (grid[co[i].x-shapesize][co[i].y]) {
                            if (shape instanceof StickShape) {
                                neighbours += 2;
                            } else {
                                neighbours++;
                            }
                        }
                    }
                    if (co[i].x+shapesize <= grid.length-1) {
                        if (grid[co[i].x+shapesize][co[i].y]) {
                            if (shape instanceof StickShape) {
                                neighbours += 2;
                            } else {
                                neighbours++;
                            }
                        }
                    }
                }
                if (neighbours >= maxneighbours) {
                    maxneighbours = neighbours;
                    if (!bestheight[neighbours] || scanshape.pos.y > bestheight[neighbours]) {
                        bestheight[neighbours] = scanshape.pos.y;
                        bestpos.push({x: scanshape.pos.x, y: scanshape.pos.y});
                        bestrot.push(scanshape.rot);
                    }
                }
                if (rotcount > 3 || scanshape.blockrotation(grid)) {
                    var changeposx = true;
                    for (var i = 0; i < co.length; i++) {
                        if (co[i].x === grid.length-1) {
                            changeposx = false;
                        }
                    }
                    if (changeposx) {
                        scanshape.pos.x += shapesize;
                    } else {
                        stopscan = true;
                        scanshape.pos = bestpos[bestpos.length-1];
                        scanshape.rot = bestrot[bestrot.length-1];
                        randpoint = bestpos[bestpos.length-1].x;
                    }
                    rotcount = 0;
                } else {
                    scanshape.rot++;
                    scanshape.rot %= 4;
                    rotcount++;
                }
            } // else {
            if (shape.rot < bestrot[bestrot.length-1]) {
                if (!shape.blockrotation(grid) && p.frameCount%4 === 0) {
                    shape.rot++;
                    shape.rot %= 4;
                }
            }
            if (shape.pos.x < randpoint) {
                if (!shape.blocksideright(grid)) {
                    if (p.frameCount%2 === 0) {
                        shape.pos.x += shape.size;
                    }
                }
            } else if (shape.pos.x > randpoint) {
                if (!shape.blocksideleft(grid)) {
                    if (p.frameCount%2 === 0) {
                        shape.pos.x -= shape.size;
                    }
                }
            } else {
                if (p.frameCount%2 === 0) {
                    if (fastmode && shape.rot === bestrot[bestrot.length-1]) {
                        shape.pos = scanshape.pos;
                    }
                    if (shape.lock(p, grid)) {
                        lockedshapes.push(shape);
                        var co = shape.coords(shape.rot);
                        for (var i = 0;  i < co.length; i++) {
                            grid[co[i].x][co[i].y] = true;
                            gridpoints[co[i].x][co[i].y] = shape.color;
                            if (co[i].y < gridmaxheight) {
                                gridmaxheight = co[i].y;
                            }
                        }
                        spawnRandomShape();
                    }
                    if (!fastmode) {
                        shape.pos.y += shape.size;
                    }
                }
            }
           // }
           // scanshape.render(p);
        }
    }

    p.keyPressed = function () {
        // 72 check is for vim key support ('h')
        if ((p.keyCode === p.LEFT_ARROW || p.keyCode === 72) && !ai) {
            if (!shape.blocksideleft(grid)) {
                shape.pos.x -= shape.size;
            }
        // 76 check is for vim key support ('l')
        } else if ((p.keyCode === p.RIGHT_ARROW || p.keyCode === 76) && !ai) {
            if (!shape.blocksideright(grid)) {
                shape.pos.x += shape.size;
            }
        // 75 check is for vim key support ('k')
        } else if ((p.keyCode === p.UP_ARROW || p.keyCode === 75) && !ai) {
            if (!shape.blockrotation(grid)) {
                shape.rot++;
                shape.rot %= 4;
            }
        // 74 check is for vim key support ('j')
        } else if ((p.keyCode === p.DOWN_ARROW || p.keyCode === 74) && !ai) {
            if (shape.lock(p, grid)) {
                lockedshapes.push(shape);
                var co = shape.coords(shape.rot);
                for (var i = 0;  i < co.length; i++) {
                    grid[co[i].x][co[i].y] = true;
                    gridpoints[co[i].x][co[i].y] = shape.color;
                }
                spawnRandomShape();
            }
            shape.pos.y += shape.size;
        } else if (p.key === 'P' && !gameover) {
            if (!paused) {
                p.noLoop();
                paused = true;
            } else {
                p.loop();
                paused = false;
            }
        } else if (p.key === 'C') {
            ai = !ai;
        } else if (p.key === 'R') {
            if (gameover) {
                gameover = false;
                reset();
                p.loop();
            }
        } else if (p.key === 'A') {
            aid = !aid;
        } else if (p.keyCode === 32 && !ai) {
            var shapecp = JSON.parse(JSON.stringify(shape));
            shapecp.color = "rgb(255,0,0)";
            shapecp.coords = shape.coords;
            shapecp.render = shape.render;
            if (shape.pos.y < gridmaxheight) {
                if (shape instanceof StickShape) {
                    shapecp.pos.y = gridmaxheight-shapesize;
                } else {
                    shapecp.pos.y = gridmaxheight-2*shapesize;
                }
            }
            var bezet = false;
            while (!bezet) {
                var co = shapecp.coords(shapecp.rot);
                for (var i = 0; i < co.length; i++) {
                    if (grid[co[i].x][co[i].y] || co[i].y > grid[0].length-1) {
                        bezet = true;
                    }
                }
                if (!bezet) {
                    shapecp.pos.y += shapesize;
                } else {
                    shapecp.pos.y -= shapesize;
                }
            }
            shape.pos = shapecp.pos;
        } else if (p.key === 'F') {
            fastmode = !fastmode;
        }
    }
}

var app = new p5(sketch);

function LShape(size, color, pos) {
    this.size = size;
    this.color = color;
    this.pos = pos;
    this.rot = 0;

    this.render = function (p) {
        p.push();
        p.stroke("black");
        p.fill(this.color);
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            p.rect(co[i].x, co[i].y, this.size, this.size);
        }
        p.pop();
    }

    this.fall = function () {
        this.pos.y += this.size;
    }

    this.blocksideleft = function (grid) {
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x === 0 || grid[co[i].x-this.size][co[i].y]) {
                return true;
            }
        }
        return false;
    }

    this.blocksideright = function (grid) {
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x ===  grid.length-1 || grid[co[i].x+this.size][co[i].y]) {
                return true;
            }
        }
        return false;
    }

    this.blockrotation = function (grid) {
        var co = this.coords((this.rot+1)%4);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x < 0 || co[i].x > grid.length-1 || grid[co[i].x][co[i].y]) {
                return true;
            }
        }
        return false;
    }
}

LShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x-this.size, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y}];
        break;
    case 2:
        return [{x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y-this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y}];
        break;
    }
};

LShape.prototype.lock = function (p, grid) {
    if (this.pos.y+this.size >= grid[0].length-1) {
        this.pos.y = grid[0].length-1-this.size;
        return true;
    }
    var co = this.coords(this.rot);
    for (var i = 0; i < co.length; i++) {
        if (grid[co[i].x][co[i].y+this.size]) {
            return true;
        }
    }
    return false;
}

function LMirrorShape(size, color, pos) {
    LShape.call(this, size, color, pos);
}

LMirrorShape.prototype = Object.create(LShape.prototype);
LMirrorShape.prototype.constructor = LMirrorShape;

LMirrorShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x+this.size, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y+this.size}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    }
};

function ZShape(size, color, pos) {
    LShape.call(this, size, color, pos);
}

ZShape.prototype = Object.create(LShape.prototype);
ZShape.prototype.constructor = ZShape;

ZShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y+this.size}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y+this.size}];
        break;
    }
};

function ZMirrorShape(size, color, pos) {
    LShape.call(this, size, color, pos);
}

ZMirrorShape.prototype = Object.create(LShape.prototype);
ZMirrorShape.prototype.constructor = ZMirrorShape;

ZMirrorShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y-this.size}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y-this.size}];
        break;
    }

};

function Block(size, color, pos) {
    LShape.call(this, size, color, pos);
}

Block.prototype = Object.create(LShape.prototype);
Block.prototype.constructor = Block;

Block.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    }

};

function IndescribableShape(size, color, pos) {
    LShape.call(this, size, color, pos);
}

IndescribableShape.prototype = Object.create(LShape.prototype);
IndescribableShape.prototype.constructor = IndescribableShape;

IndescribableShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x-this.size, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y+this.size}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x+this.size, y: this.pos.y}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y+this.size},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    }

};

function StickShape(size, color, pos) {
    LShape.call(this, size, color, pos);
}

StickShape.prototype = Object.create(LShape.prototype);
StickShape.prototype.constructor = StickShape;

StickShape.prototype.coords = function (rot) {
    switch (rot) {
    case 0:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y-2*this.size},
                {x: this.pos.x, y: this.pos.y-3*this.size}];
        break;
    case 1:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x+2*this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    case 2:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x, y: this.pos.y-this.size},
                {x: this.pos.x, y: this.pos.y-2*this.size},
                {x: this.pos.x, y: this.pos.y-3*this.size}];
        break;
    case 3:
        return [{x: this.pos.x, y: this.pos.y},
                {x: this.pos.x+this.size, y: this.pos.y},
                {x: this.pos.x+2*this.size, y: this.pos.y},
                {x: this.pos.x-this.size, y: this.pos.y}];
        break;
    }

};

StickShape.prototype.lock = function (p, grid) {
    if (this.pos.y >= grid[0].length-1) {
        this.pos.y = grid[0].length-1;
        return true;
    }
    var co = this.coords(this.rot);
    for (var i = 0; i < co.length; i++) {
        if (grid[co[i].x][co[i].y+this.size]) {
            return true;
        }
    }
    return false;
}


function spawnRandomShape() {
    if (nextshape) {
        shape = nextshape;
        shape.size = shapesize;
        shape.pos = {x: Math.floor(c.width*0.5/shapesize)*shapesize,y: spawnoffsety};
        nextshape = shapes[Math.floor(Math.random()*shapes.length)]();
    } else {
        shape = shapes[Math.floor(Math.random()*shapes.length)]();
        nextshape = shapes[Math.floor(Math.random()*shapes.length)]();
    }
    nextshape.pos = {x: shapesize,y: nextshape instanceof StickShape ? shapesize+10 : shapesize};
    nextshape.size = shape.size/2;
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
    return "rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
}

function pause(p) {
    p.fill(140);
    p.noStroke();
    size = 10;
    // p.rect(p.width-4*size, size, size, 3*size);
    // p.rect(p.width-2*size, size, size, 3*size);
    p.rect(3*size, size, size, 3*size);
    p.rect(1*size, size, size, 3*size);
}

function reset() {
    lockedshapes = [];
    initgrid();
    initgridpoints();
    score = 0;
    scoresaved = false;
    gridmaxheight = grid[0].length-1;
    fallspeed = 10;
    level = 0;
    totalrowfullcount = 0;
    spawnRandomShape();
}

function initgrid() {
    grid = [];
    var gridheight = (c.height-Math.floor(c.height/shapesize)*shapesize < (shapesize-5)) ? Math.floor(c.height/shapesize)*shapesize-shapesize : Math.floor(c.height/shapesize)*shapesize;
    for (var i = 0; i < Math.floor(c.width/shapesize)*shapesize; i += shapesize) {
        grid[i] = new Array(gridheight+1);
    }
}

function initgridpoints() {
    gridpoints = [];
    var gridheight = (c.height-Math.floor(c.height/shapesize)*shapesize < (shapesize-5)) ? Math.floor(c.height/shapesize)*shapesize-shapesize : Math.floor(c.height/shapesize)*shapesize;
    for (var i = 0; i < Math.floor(c.width/shapesize)*shapesize; i += shapesize) {
        gridpoints[i] = new Array(gridheight+1);
    }
}

function writeScore(p) {
    p.fill(140);
    p.stroke(0);
    p.textSize(30);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(score, p.width-10, 20);
}
