class LShape {
    constructor(size, color, pos) {
        this.size = size;
        this.color = color;
        this.pos = pos;
        this.rot = 0;
    }

    render(p) {
        p.push();
        p.stroke("black");
        p.fill(this.color);
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            p.rect(co[i].x, co[i].y, this.size, this.size);
        }
        p.pop();
    }

    fall() {
        this.pos.y += this.size;
    }

    blocksideleft(grid) {
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x === 0 || grid[co[i].x - this.size][co[i].y]) {
                return true;
            }
        }
        return false;
    }

    blocksideright(grid) {
        var co = this.coords(this.rot);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x === grid.length - 1 || grid[co[i].x + this.size][co[i].y]) {
                return true;
            }
        }
        return false;
    }

    blockrotation(grid) {
        var co = this.coords((this.rot + 1) % 4);
        for (var i = 0; i < co.length; i++) {
            if (co[i].x < 0 || co[i].x > grid.length - 1 || grid[co[i].x][co[i].y]) {
                return true;
            }
        }
        return false;
    }
}

LShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x - this.size, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y }];
        case 2:
            return [{ x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y - this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y }];
    }
};

LShape.prototype.lock = function(grid) {
    if (this.pos.y + this.size >= grid[0].length - 1) {
        this.pos.y = grid[0].length - 1 - this.size;
        return true;
    }
    var co = this.coords(this.rot);
    for (var i = 0; i < co.length; i++) {
        if (grid[co[i].x][co[i].y + this.size]) {
            return true;
        }
    }
    return false;
}

class LMirrorShape extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

LMirrorShape.prototype = Object.create(LShape.prototype);
LMirrorShape.prototype.constructor = LMirrorShape;

LMirrorShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x + this.size, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y + this.size }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y }];
    }
};

class ZShape extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

ZShape.prototype = Object.create(LShape.prototype);
ZShape.prototype.constructor = ZShape;

ZShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y + this.size }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y + this.size }];
    }
};

class ZMirrorShape extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

ZMirrorShape.prototype = Object.create(LShape.prototype);
ZMirrorShape.prototype.constructor = ZMirrorShape;

ZMirrorShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y - this.size }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y - this.size }];
    }

};

class Block extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

Block.prototype = Object.create(LShape.prototype);
Block.prototype.constructor = Block;

Block.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size }];
    }

};

class IndescribableShape extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

IndescribableShape.prototype = Object.create(LShape.prototype);
IndescribableShape.prototype.constructor = IndescribableShape;

IndescribableShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x - this.size, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y + this.size }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x + this.size, y: this.pos.y }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y + this.size },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x - this.size, y: this.pos.y }];
    }

};

class StickShape extends LShape {
    constructor(size, color, pos) {
        super(size, color, pos);
    }
}

StickShape.prototype = Object.create(LShape.prototype);
StickShape.prototype.constructor = StickShape;

StickShape.prototype.coords = function(rot) {
    switch (rot) {
        case 0:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y - 2 * this.size },
            { x: this.pos.x, y: this.pos.y - 3 * this.size }];
        case 1:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x + 2 * this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y }];
        case 2:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x, y: this.pos.y - this.size },
            { x: this.pos.x, y: this.pos.y - 2 * this.size },
            { x: this.pos.x, y: this.pos.y - 3 * this.size }];
        case 3:
            return [{ x: this.pos.x, y: this.pos.y },
            { x: this.pos.x + this.size, y: this.pos.y },
            { x: this.pos.x + 2 * this.size, y: this.pos.y },
            { x: this.pos.x - this.size, y: this.pos.y }];
    }

};

StickShape.prototype.lock = function(grid) {
    if (this.pos.y >= grid[0].length - 1) {
        this.pos.y = grid[0].length - 1;
        return true;
    }
    var co = this.coords(this.rot);
    for (var i = 0; i < co.length; i++) {
        if (grid[co[i].x][co[i].y + this.size]) {
            return true;
        }
    }
    return false;
}
