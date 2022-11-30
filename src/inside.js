
export const pointInside = (points, point) => {
    let vertices = points.map((p) => {
        return {
            x: p.x,
            y: -p.y  //invert y since the origin is the top left for html, we want origin at bottom left
        };
    });

    console.log(vertices)
    //if the area is negative, the points are in clockwise order, so reverse them
    if (areaPolygon(vertices) < 0)
        vertices.reverse();
  
    //tabulate diagonals. 0 and vertices.length - 1 are swapped since we need the range, but we also need the correct direction
    return point_inside_polygon(vertices, point);
}

const point_inside_polygon = (vertices, point) => {
    
}



//below are the predicates from slides
const area2 = (a, b, c) => {   
    return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) ;
}
const left = (a, b, c) => {
    return area2(a, b, c) > 0;
}
const leftOn = (a, b, c) => {
    return area2(a, b, c) >= 0;
}
const collinear = (a, b, c) => {
    return area2(a, b, c) === 0;
}

const intersectProp = (a, b, c, d) => {
    if (collinear(a, b, c) || collinear(a, b, d) || collinear(c, d, a) || collinear(c, d, b)) {
        return false;
    }

    return (left(a, b, c) ^ left(a, b, d)) && (left(c, d, a) ^ left(c, d, b));
}
const between = (a, b, c) => {
    
    if (!collinear(a, b, c)) {
        return false;
    }
    
    if (a.x !== b.x) {
        return ((a.x <= c.x && c.x <= b.x) || (a.x >= c.x && c.x >= b.x));
    } else {
        return ((a.y <= c.y && c.y <= b.y) || (a.y >= c.y && c.y >= b.y));
    }

    
}
const intersect = (a, b, c, d) => {

    if (intersectProp(a, b, c, d)) {
        return true;
    } 
    return between(a, b, c) || between(a, b, d) || between(c, d, a) || between (c, d, b);
}


const isDiagonalie = (vertices, a, b) => {
    //using an array instead of a linked list like structure on the slides, so we need a ptr
    let ptr = 0;
    do {
        let c = vertices[ptr % vertices.length];
        let c1 = vertices[(ptr + 1) % vertices.length];

        if (c.x !== a.x && c.y !== a.y &&
            c.x !== b.x && c.y !== b.y &&
            c1.x !== a.x && c1.y !== a.y &&
            c1.x !== b.x && c1.y !== b.y &&
            intersect(a, b, c, c1)) {
            return false;
        }

        ptr++;

    } while (ptr % vertices.length !== 0)

    return true;
}

const inCone = (vertices, i, j) => {
    let a = vertices[i];
    let b = vertices[j];

    let a1 = vertices[(i + 1) % vertices.length];
    let a0 = vertices[(i - 1 + vertices.length) % vertices.length];


    if (leftOn(a, a1, a0)) {
        return left(a, b, a0) && left(b, a, a1);
    } else
        return !(leftOn(a, b, a1) && leftOn(b, a, a0));
}
    

const isDiagonal = (vertices, i, j) => {
    return isDiagonalie(vertices, vertices[i], vertices[j]) && inCone(vertices, i, j) && inCone(vertices, j, i);
}


const areaPolygon = (vertices) => {
    //using an array instead of a linked list like structure on the slides, so we need a ptr
    let ptr = 0;
    let sum = 0;
    do {
        let nextPtr = (ptr + 1) % vertices.length;

        sum += area2(vertices[0], vertices[ptr], vertices[nextPtr]);

        ptr = nextPtr;

    } while (ptr % vertices.length !== 0)

    return sum;
}