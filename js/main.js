// User is sitting on a ski lift that's passing through some mountains
var scene, camera, renderer, cube, dolly;
var fireworks = [];
var snow;
var THETA = Math.PI / 3000;
var SEED = Math.floor(Math.random() * 1000);
var FIREWORK_Y = 180;
var FIREWORK_SPEED = 0.8;
var PLANE_DIM = 1000;
var PLANE_HEIGHT = 100;
var textureLoader = new THREE.TextureLoader();
var sparkColors = [0xbb0000, 0xea6f23, 0xffe359, 0x482ce8, 0xbb0000];

var effect, controls;

var init = function () {
    var geometry, material;
	scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x404040);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000);
    dolly = new THREE.Group();
    dolly.position.set(0, 100, 300);
    scene.add(dolly);
    dolly.add(camera);

    controls = new THREE.VRControls(camera);
    effect = new THREE.VREffect(renderer);

    if (navigator.getVRDisplays) {
        navigator.getVRDisplays()
            .then(function (displays) {
                effect.setVRDisplay(displays[0]);
                controls.setVRDisplay(displays[0]);
            })
            .catch(function () {
                // no displays
            });
        document.body.appendChild(WEBVR.getButton(effect));
    }

	var light1 = new THREE.DirectionalLight(0xffffff, 0.8);
	light1.position.set(10, 80, 10);

	var light2 = new THREE.AmbientLight(0x404040);

	scene.add(light1);
	scene.add(light2);

	// Sky
	geometry = new THREE.SphereGeometry(10000);

	var vertices = geometry.vertices;
	var faces = geometry.faces;

	material = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        //color: 0x031b42,
	    map: textureLoader.load('assets/images/sunset-gradient.jpg')
	});
	var sky = new THREE.Mesh(geometry, material);
	scene.add(sky);

	// Perlin mountains
	var NOISE_DIM = 100;
	var noise = generateNoise(NOISE_DIM, NOISE_DIM, SEED);
    geometry = new THREE.PlaneGeometry(PLANE_DIM, PLANE_DIM, NOISE_DIM - 1, NOISE_DIM - 1);
    geometry.rotateX(-1 * Math.PI / 2);
    for (var i = 0; i < geometry.vertices.length; i++) {
    	var y = Math.floor(i / NOISE_DIM);
    	var x = i - y * NOISE_DIM;
    	geometry.vertices[i].y = PLANE_HEIGHT * Math.abs(noise[y][x]);
    }

    material = new THREE.MeshPhongMaterial({ shading: THREE.FlatShading });
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Snow
    var flakes = new THREE.Geometry();
    for (var i = 0; i < 2000; i++) {
        var flake = new THREE.Vector3(Math.random() * PLANE_DIM - PLANE_DIM / 2, Math.random() * 200, Math.random() * PLANE_DIM - PLANE_DIM / 2);
        flake.velocity = new THREE.Vector3(Math.random() / 10 - 0.05, -0.15, Math.random() / 10 - 0.05);
        flakes.vertices.push(flake);
    }
    var snowMaterial = new THREE.PointsMaterial({
        size: 2,
        map: textureLoader.load("assets/images/snow.png"),
        blending: THREE.AdditiveBlending,
        transparent: true,
        color : 0x222222
    });
    snow = new THREE.Points(flakes, snowMaterial);
    scene.add(snow);
}

var shouldCreateFirework = function () {
	return fireworks.length < 10 && Math.random() <= 0.1;
}

var makeFirework = function (x, y, z) {
	var firework = new Firework(x, y, z);
	fireworks.push(firework);
}

var Firework = function (x, y, z) {
    this.x = x;
    this.z = z;
	this.geometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
	this.material = new THREE.MeshLambertMaterial({ color: 0xf9c6bd, emissive: 0xffffff, emissiveIntensity: 0.5 });
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.set(x, y, z);
	this.maxY = FIREWORK_Y + Math.random() * 30 - 15;
    // this.light = new THREE.PointLight(0xff0000, 10, 8);
    // this.light.position.set(x, y, z);
	this.particles = null;
    this.timeSinceDetonation = 0;
    scene.add(this.mesh);
    //scene.add(this.light);
}

Firework.prototype.update = function (index) {
	if (this.mesh.position.y < this.maxY) {
	    this.mesh.position.y += FIREWORK_SPEED;
	} else {
        if (!this.particles) {
            this.detonateFirework();
        }
        for (var i = 0; i < this.particles.geometry.vertices.length; i++) {
            var particle = this.particles.geometry.vertices[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.z += particle.velocity.z;
        }
        this.particles.geometry.verticesNeedUpdate = true;
        this.timeSinceDetonation += 1;
        if (this.timeSinceDetonation > 70) {
            scene.remove(this.particles);
            fireworks.splice(index, 1);
        }
    }
}

Firework.prototype.detonateFirework = function () {
	scene.remove(this.mesh);
    var sparks = new THREE.Geometry();
    for (var i = 0; i < Math.random() * 5000; i++) {
        var spark = new THREE.Vector3(this.x, FIREWORK_Y, this.z);
        spark.velocity = new THREE.Vector3(Math.random() - Math.random(),
                         Math.random() - Math.random(), Math.random() - Math.random());
        sparks.vertices.push(spark);
    }
    var sparkMaterial = new THREE.PointsMaterial({
        size: 2,
        map: textureLoader.load("assets/images/particle.png"),
        blending: THREE.AdditiveBlending,
        transparent: true,
        color : sparkColors[Math.floor(Math.random() * sparkColors.length)]
    });
    this.particles = new THREE.Points(sparks, sparkMaterial);
    scene.add(this.particles);
}

var render = function () {
    controls.update();
    effect.render(scene, camera);
    var oldX = dolly.position.x;
    var oldZ = dolly.position.z;
    dolly.position.x = Math.cos(THETA) * oldX - Math.sin(THETA) * oldZ;
    dolly.position.z = Math.sin(THETA) * oldX + Math.cos(THETA) * oldZ;
    dolly.rotateY(-THETA);

    if (shouldCreateFirework()) {
    	makeFirework(Math.random() * PLANE_DIM - PLANE_DIM / 2, 50, Math.random() * PLANE_DIM - PLANE_DIM / 2);
    }

    // Draw fireworks
    for (var i = 0; i < fireworks.length; i++) {
    	fireworks[i].update(i);
    }

    for (var i = 0; i < snow.geometry.vertices.length; i++) {
        var particle = snow.geometry.vertices[i];
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.z += particle.velocity.z;
        if (particle.y < 20) {
            particle.y = 200 + Math.random() * 10;
        }
    }
    snow.geometry.verticesNeedUpdate = true;

    effect.requestAnimationFrame(render);
}

init();
render();
