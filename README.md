# Ray Tracer in HTML 5 Canvas
This project was made as a test for the concept of ray tracing. It is not at all practical or useful but for demonstrating and understanding ray tracing.

[Visit here for the demonstration](https://kieferlam.github.io/jsraytracedemo/)

## Screenshot
![Ray tracer screenshot][screenshot_url]

## How to use
The demo web page allows you to customise the properties of the ray tracer and modify the objects in the scene. Once you are ready, click the `Trace` button to start. Since the ray tracer is all software based and _single threaded_, it will take a while to process and the result will show once the tracing is fully complete.

### Modifying scene objects
The `sphere` input text area contains the stringified version of the scene object array. When the `trace` button is pressed, the contents of the input text area is parsed. Objects in the scene have the following properties:

- `center`
    - This is coordinate list for the center of the object. It must have 3 values in the array. `(x, y, z)`
    - E.g. `[1, 2, 3]`
- `radius`
    - This is the radius of the sphere as a floating point value. All objects in the scene must be spheres as they are the only shape supported so far.
- `colour`
    - RGB values for the diffuse colour. Range from `0.0` to `1.0`.
- `reflect`
    - This defines the _reflectivity_ of the object. The closer this value is to `1.0`, the closer the resulting colour of the object is the reflection result. Values closer to `0.0` will be closer to the objects diffuse colour (as defined in the `colour` property).


[screenshot_url]: https://raw.githubusercontent.com/kieferlam/jsraytracedemo/master/docs/screenshot.png