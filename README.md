# CIS 568 Three.js Project
### Carolina Zheng

View the demo at [https://pennvr.github.io/three-js-ballerlina/](https://pennvr.github.io/three-js-ballerlina/).

#### How to build
In the root of the project directory, run `python -m SimpleHTTPServer 8080` from the command line. Then open `localhost:8080` in your favorite web browser. If your browser supports WebVR, a button saying "Enter VR" should appear at the bottom of the page.

#### Techniques
*Procedural hills*: I used 2D improved Perlin noise to generate a 100x100 heightmap, which I then used to deform a plane geometry to produce my hills. I felt like single-octave Perlin noise did a fairly good job at creating relatively uniform, but random-looking hills for my terrain.

*Fireworks*: Simulating realistic fireworks was challenging. After several iterations, I settled on drawing a cylinder geometry that moves along the y axis until reaching a certain height, at which point I generate a random number of small spheres (between 0 and 2000). Each sphere has the same spawn location (the point at which the firework detonates), but received a random velocity (`Math.random() - Math.random()`) in each direction, simulating particles scattering from an explosion.

I gradually fade the opacity as the sparks disperse, and remove them after a certain number of renders has gone by. These last adjustments, along with making the spheres a Phong material and emissive, were to simulate a lighting or glow effect on the sparks, despite the fact that they weren't actually emitting any light (I couldn't determine how to do this in a computationally efficient way without writing a shader).

##### Misc. features
*Skybox*: I wanted to create a more realistic background rather than just a single color, so Trung suggested a skybox. I was able to do this by creating a very large cube and texturing the insides using six images from a skybox texture, [darksea](https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js/images).

*Snow*: I actually used a 2D point system for the flakes, and it turned out looking ok even in VR. Each flake was a Point with a snow-like texture and additive blending, and given a small downward y velocity and random x and z velocities. Once a flake drifted low enough, I would reset it to the top of the screen.

*Moving camera*: My terrain was limited in size, so I needed the camera to move in circles. In order to move the camera in VR, I needed to make it a child of a dolly object and move the dolly. The camera was translated 300 away from the origin point in the horizontal plane, and translated in a circle around the origin based off of a theta value. It was also given a slight y rotation to make it face toward the terrain.

#### Reflecting on the assignment
As far as motion sickness goes, I get sick very easily. My project didn't have a lot of movement, so I was fine for most of the VR development, but in the beginning, I had the camera moving relatively fast in one direction, and that made me motion sick.

For me, the hardest part of the assignment was the lack of Three.js documentation. I think I was limited in some respects, especially when it came to being creative, because I didn't know what Three.js was capable of. If I wanted to know how to do something, I would have to look up the source code of a relevant Three.js demo, or search on stack overflow. The many public demos on Github were very helpful, although no substitute for actual documentation.

As I was working on the project, I came up with lots of extra features that I thought would be really cool to implement, so I wish that I had more time to work on the project (not in terms of the time that was given, but just more time in terms of having to balance other classes and commitments). Here are some of the features that I would like to add:
* Writing a shader to make the firework spheres glow
* Varying the terrain color or texture based on the height
* Implementing multi-octave Perlin noise to make the terrain look more interesting

In terms of how this homework could be improved, I think that more guidance could be given for implementing the project specs in light of the lack of documentation. Either mentioning specific Three.js objects that we might want to use, or showing us some resources or demos that we can use to explore Three.js's functionality.