// User is sitting on a ski lift that's passing through some mountains
var scene, camera, renderer, cube;
var fireworks = [];
var ROTATION = 0.05;
var SEED = Math.floor(Math.random() * 1000);
var FIREWORK_Y = 70;
var PLANE_DIM = 1000;
var textureLoader = new THREE.TextureLoader();

var init = function () {
    var geometry, material;
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 50, 0);
	camera.up = new THREE.Vector3(0, 1, 0);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x404040);
	document.body.appendChild(renderer.domElement);

	var light1 = new THREE.DirectionalLight(0xffffff, 0.8);
	light1.position.set(10, 80, 10);

	var light2 = new THREE.AmbientLight(0x404040);

	scene.add(light1);
	scene.add(light2);

	// Sky
	geometry = new THREE.SphereGeometry(10000);

	var vertices = geometry.vertices;
	var faces = geometry.faces;

	material = new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xe5efff });
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
    	geometry.vertices[i].y = 100 * Math.abs(noise[y][x]);
    	//console.log(geometry.vertices[i]);
    }

    material = new THREE.MeshPhongMaterial({ shading: THREE.FlatShading });
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

	geometry = new THREE.BoxGeometry(10, 10, 10);
    geometry.rotateX(Math.PI / 4);
    geometry.rotateY(Math.PI / 6);
	material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
	cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 50, -30);
	//scene.add(cube);

	//camera.lookAt(cube.position);
	//camera.matrixWorldNeedsUpdate = true;
}

var shouldCreateFirework = function () {
	return fireworks.length < 10 && Math.random() <= 0.01;
}

var makeFirework = function (x, y, z) {
	var firework = new Firework(x, y, z);
	fireworks.push(firework);
}

var Firework = function (x, y, z) {
    this.x = x;
    this.z = z;
	this.geometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
	this.material = new THREE.MeshBasicMaterial({ color: 0xf9c6bd });
    this.material.transparent = true;
    this.material.opacity = 0.5;
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.set(x, y, z);
    // this.light = new THREE.PointLight(0xff0000, 10, 8);
    // this.light.position.set(x, y, z);
	this.particles = null;
    this.timeSinceDetonation = 0;
    scene.add(this.mesh);
    //scene.add(this.light);
}

Firework.prototype.update = function () {
	if (this.mesh.position.y < FIREWORK_Y) {
		this.mesh.position.y += 0.3
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
        if (this.timeSinceDetonation > 30) {
            scene.remove(this.particles);
            fireworks.splice(this, 1);
        }
    }
}

Firework.prototype.detonateFirework = function () {
	scene.remove(this.mesh);
    var sparks = new THREE.Geometry();
    for (var i = 0; i < Math.random() * 1000; i++) {
        var spark = new THREE.Vector3(this.x, FIREWORK_Y, this.z);
        spark.velocity = new THREE.Vector3(Math.random() - Math.random(),
                         Math.random() - Math.random(), Math.random() - Math.random());
        sparks.vertices.push(spark);
    }
    var sparkMaterial = new THREE.PointsMaterial({
        size: 1.5,
        map: textureLoader.load("assets/images/particle.png"),
        blending: THREE.AdditiveBlending,
        transparent: true,
        color : 0xff0000
    });
    this.particles = new THREE.Points(sparks, sparkMaterial);
    scene.add(this.particles);
}

var render = function () {
    renderer.render(scene, camera);

    if (shouldCreateFirework()) {
    	makeFirework(0, 50, -50);
    }

    // Draw fireworks
    for (var i = 0; i < fireworks.length; i++) {
    	fireworks[i].update();
    }

    requestAnimationFrame(render);
}

init();
render();
