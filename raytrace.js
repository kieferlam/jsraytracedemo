var viewport = math.matrix([0, 0]);
var screenDistance = 1.0;
var cameraPosition = math.matrix([0, 0]);
var camera = math.identity(3);

var Spheres = [
    {
        center: math.matrix([1, 0, 5]),
        radius: 1.0,
        colour: [220.0 / 255.0, 80.0 / 255.0, 40.0 / 255.0],
        reflect: 0.1
    },
    {
        center: math.matrix([-1, 1, 10]),
        radius: 1.0,
        colour: [80.0 / 255.0, 220.0 / 255.0, 40.0 / 255.0],
        reflect: 0.9
    },
    {
        center: math.matrix([-5, 2, 15]),
        radius: 1.0,
        colour: [140.0 / 255.0, 80.0 / 255.0, 190.0 / 255.0],
        reflect: 0.1
    }
];

var Light = {
    center: math.matrix([2, 5, 10])
};

function lerp(a, b, f){
    return a + (b - a) * f;
}

function lerpa(a, b, f){
    if(!Array.isArray(a) || !Array.isArray(b)) return console.error('Parameter a and b must be arrays.');
    if(a.length != b.length) return console.error('Array Lerp: array lengths must be equal.');
    var result = [];
    for(var i = 0; i < a.length; ++i){
        result.push(lerp(a[i], b[i], f));
    }
    return result;
}

function dot(a, b){
    return math.dot(a, b);
}

function distSq(a, b){
    var accum = 0;
    for(var i = 0; i < a._size; ++i){
        accum += math.square(b.get([i]) - a.get([i]));
    }
    return accum;
}

function dist(a, b){
    return math.sqrt(distSq(a, b));
}

function lengthSq(a){
    return distSq(a, math.matrix(math.zeros(a._size)));
}

function length(a){
    return math.sqrt(lengthSq(a));
}

function vecto(a, b){
    return math.matrix([b.get([0]) - a.get([0]), b.get([1]) - a.get([1]), b.get([2]) - a.get([2])]);
}

function normalise(a){
    return math.multiply(a, 1.0 / length(a));
}

// Origin, Direction, Sphere Center, Radius
function line_sphere(o, d, center, radius){
    var aminc = vecto(center, o);
    var a = dot(d, d);
    var b = 2 * dot(d, aminc);
    var c = dot(aminc, aminc) - math.square(radius);

    var discriminant = math.square(b) - 4*a*c;
    if(discriminant < 0){
        return { intersect: false }
    }

    var dSqrt = math.sqrt(discriminant);
    var t1 = (-b + dSqrt) / (2 * a);
    var t2 = (-b - dSqrt) / (2 * a);
    var minT, maxT;

    var min, max;
    if(t1 < t2){
        minT = t1;
        maxT = t2;
    }else{
        minT = t2;
        maxT = t1;
    }
    min = math.add(o, math.multiply(d, minT));
    max = math.add(o, math.multiply(d, maxT));

    if(minT < 0.01){
        if(maxT < 0.01) return { intersect: false };
        minT = maxT;
        min = max;
    }

    return {
        minT: minT,
        min: min,
        max: max,
        intersect: true
    };
}

function line_plane(o, d, center, normal){
    var denom = dot(normal, d);
    if(math.abs(denom) < 0.001) return {intersect: false};

    var diff = vecto(o, center);

    var t = dot(diff, normal) / denom;
    if(t < 0.001) return {intersect: false};
    return {intersect: true, point: math.add(o, math.multiply(d, t)), T: t};
}

function traceray(ro, rd){
    var plane = line_plane(ro, rd, math.matrix([0, -2, 0]), math.matrix([0, 1, 0]));

    var intersect = plane.intersect;
    var minT = plane.intersect ? plane.T : 999.0;
    var sphereT = 999.0;
    var normal = math.matrix([0, 1, 0]);
    var colour = [40.0 / 255.0, 80.0 / 255.0, 220.0 / 255.0];
    var point = plane.point;
    var reflect = 0.0;

    Spheres.forEach((s) => {
        var sphere = line_sphere(ro, rd, s.center, s.radius);
        if(!sphere.intersect) return;
        intersect = true;
        sphereT = math.min(sphereT, sphere.minT);
        if(sphereT < minT){
            point = sphere.min;
            normal = normalise(vecto(s.center, point));
            colour = s.colour;
            reflect = s.reflect;
        }
        minT = math.min(minT, sphere.minT);
    });

    if(!intersect) return {intersect: false, colour: [180.0 / 255.0, 180.0 / 255.0, 180.0 / 255.0]};

    // Shadow
    var lightdir = normalise(vecto(point, Light.center));
    var inShadow = false;
    for(var s of Spheres){
        var sphere = line_sphere(point, lightdir, s.center, s.radius);
        if(!sphere.intersect) continue;
        inShadow = true;
        break;
    }

    if(inShadow) colour = math.multiply(colour, 0.6);
    
    return {
        normal: normal,
        point: point,
        intersect: true,
        colour: colour,
        reflect: reflect
    };
}

function trace(ctx){
    for(var x = 0; x < viewport[0]; ++x){
        for(var y = 0; y < viewport[1]; ++y){
            var rayOrigin = math.matrix([(x / viewport[0]) - 0.5, (y / viewport[1]) - 0.5, screenDistance]);
            var rayDirection = rayOrigin;

            var result = traceray(rayOrigin, rayDirection);
            var colour = result.colour;
            if(result.intersect){
                const bounce = 5;
                for(var i = 0; i < bounce; ++i){
                    var reflectDirection = vecto(math.multiply(result.normal, 2*dot(rayDirection, result.normal)), rayDirection);
                    var reflect = result.reflect;
                    result = traceray(result.point, reflectDirection);
                    rayDirection = reflectDirection;
                    colour = lerpa(colour, result.colour, reflect);
                    if(!result.intersect) break;
                }
            }

            ctx.fillStyle = `rgb(${colour[0] * 255.0}, ${colour[1] * 255.0}, ${colour[2] * 255.0})`;
            ctx.fillRect(x, viewport[1] - y, 1, 1);

        } 
    }
}

window.onload = function(){
    
    var canvasEl = document.getElementById('rtCanvas');
    viewport[0] = canvasEl.width;
    viewport[1] = canvasEl.height;
    var ctx = canvasEl.getContext('2d');

    trace(ctx);
    
}