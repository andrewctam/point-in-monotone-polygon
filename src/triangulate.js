var dp = [];

export const countDiagonals = (points) => {
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
  
    //dp matrix to store results
    dp = new Array(vertices.length).fill(null).map(() => new Array(vertices.length).fill(0));

    //tabulate diagonals. 0 and vertices.length - 1 are swapped since we need the range, but we also need the correct direction
    return countToLeft(vertices, vertices.length - 1, 0);
}

const countToLeft = (vertices, start, end) => {
    if (dp[start][end] !== 0)
        return dp[start][end];

    let count = 0;

    //only need to consider vertices between the start and end
    let low = Math.min(start, end)
    let high = Math.max(start, end)

    for (let i = low; i !== high; ) {
        if (left(vertices[start], vertices[end], vertices[i])) {
            let startFormsEdge = isEdge(vertices, start, i) //start and i form an edge
            let endFormsEdge = isEdge(vertices, end, i) //end and i form an edge
            
            let startFormsDiagonal = isDiagonal(vertices, start, i) //start and i form a diagonal
            let endFormsDiagonal = isDiagonal(vertices, end, i) //end and i form a diagonal

            //2 cases: a triangle formed with 2 diagonals or 1 diagonal 1 edge
            if ((startFormsDiagonal && endFormsDiagonal) || 
                ((startFormsDiagonal || endFormsDiagonal) && (startFormsEdge ^ endFormsEdge))) {

                //recursively calculate diagonals, left of edge (start, i) and right of (end, i)
                count += countToLeft(vertices, start, i) * countToLeft(vertices, i, end);
            }
        }

        
        if (i === vertices.length - 1)
            i = 0; //wrap around from end
        else
            i++;    
    }    

    if (count === 0)
        count = 1; //base case, no left found


    dp[start][end] = count;
    console.log(dp)
    return count;
       
}


const isEdge = (vertices, i, j) => {
    return Math.abs(i - j) === 1 || Math.abs(i - j) === vertices.length - 1;
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