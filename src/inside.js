
export const process = (points) => {
    let vertices = points.map((p) => {
        return {
            x: p.x,
            y: -p.y,  //invert y since the origin is the top left for html, we want origin at bottom left
            index: p.index
        };
    });

    //if the area is negative, the points are in clockwise order, so reverse them
    if (areaPolygon(vertices) < 0)
        vertices.reverse();
  

    //find top and bottom vertices
    let min = 0;
    let max = 0;
    for (let i = 1; i < vertices.length; i++)  {
        if (vertices[i].y < vertices[min].y)
            min = i;

        if (vertices[i].y > vertices[max].y)
            max = i;
    }
    
    //"extract" the left and right chains of the polygon
    //O(n) time

    let ptr = (min - 1 + vertices.length) % vertices.length; //goes left in the array
    
    let left = [vertices[min]];
    while (ptr !== max) {
        left.push(vertices[ptr]);
        ptr = (ptr - 1 + vertices.length) % vertices.length;
    }
    
    
    ptr = (min + 1) % vertices.length; //goes right in the array
    let right = [vertices[min]];
    while (ptr !== max) {
        right.push(vertices[ptr]);
        ptr = (ptr + 1) % vertices.length;
    }

    left.push(vertices[max]);
    right.push(vertices[max]);

    return [left, right];
}

export const pointInsidePolygon = (LR, point) => {
    let steps = [];
    let [left, right] = LR

    //if above or below the polygon, return false
    let lower = Math.min(left[0].y, right[0].y);
    if (point.y < lower) {
        steps.push({type: "Below Min", lower: lower});
        steps.push({result: false});
        return steps;
    }

    let higher = Math.max(left[left.length - 1].y, right[right.length - 1].y)
    if (point.y > higher) {
        steps.push({type: "Above Max", higher: higher});
        steps.push({result: false});
        return steps;
    }


    //binary search to find two indices that the point is between
    let min = 0;
    let max = left.length - 1;
    while (min < max) {
        let mid = Math.floor((min + max) / 2);

        steps.push({type: "Binary Search", min: left[min].index, max: left[max].index});

        if (point.y == left[mid].y) {
            min = mid;
            max = mid;
            break;
        }

        if (max - min === 1) {
            break;
        }

        if (left[mid].y < point.y)
            min = mid;
        else
            max = mid;
    }
    steps.push({type: "Between Left", min: left[max].index, max: left[min].index});

     //check with 2 left test
     if (leftOn(left[max], left[min], point)) {
        steps.push({type: "Left On", a: left[max].index, b: left[min].index});
    } else {
        steps.push({type: "Left Not On", a: left[max].index, b: left[min].index});
        steps.push({result: false});
        return steps;
    }

    //repeat for right

    min = 0;
    max = right.length - 1;
    while (min < max) {
        let mid = Math.floor((min + max) / 2);

        steps.push({type: "Binary Search", min: right[min].index, max: right[max].index});

        if (point.y == right[mid].y) {
            min = mid;
            max = mid;
            break;
        }

        if (max - min === 1) {
            break;
        }

        if (right[mid].y < point.y)
            min = mid;
        else
            max = mid;
    }
    steps.push({type: "Between Right", min: right[max].index, max: right[min].index});


    
    if (leftOn(right[min], right[max], point)) {
        steps.push({type: "Left On", a: right[min].index, b: right[max].index});
    } else {
        steps.push({type: "Left Not On", a: right[min].index, b: right[max].index});
        steps.push({result: false});
        return steps;
    }

    steps.push({result: true});
    return steps;
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