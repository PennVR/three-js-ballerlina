var scene, camera, renderer, dolly;
var fireworks = [];
var snow;
var effect, controls;
var textureLoader = new THREE.TextureLoader();

var THETA = Math.PI / 3000;
var SEED = Math.floor(Math.random() * 1000);
var FIREWORK_Y = 180;
var FIREWORK_SPEED = 0.8;
var PLANE_DIM = 1000;
var PLANE_HEIGHT = 100;
var SPARK_COLORS = [0xbb0000, 0xea6f23, 0xffe359, 0x482ce8, 0xbb0000];

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
    dolly.rotateY(-3 * Math.PI / 4);
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
    loadSkyBox();

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

var loadSkyBox = function () {
    var materials = [
        // createMaterial('assets/images/nebula/nebula-xpos.png'),
        // createMaterial('assets/images/nebula/nebula-xneg.png'),
        // createMaterial('assets/images/nebula/nebula-ypos.png'),
        // createMaterial('assets/images/nebula/nebula-yneg.png'),
        // createMaterial('assets/images/nebula/nebula-zpos.png'),
        // createMaterial('assets/images/nebula/nebula-zneg.png')
        // createMaterial('assets/images/darksea/darksea-xpos.jpg'),
        // createMaterial('assets/images/darksea/darksea-xneg.jpg'),
        // createMaterial('assets/images/darksea/darksea-ypos.jpg'),
        // createMaterial('assets/images/darksea/darksea-yneg.jpg'),
        // createMaterial('assets/images/darksea/darksea-zpos.jpg'),
        // createMaterial('assets/images/darksea/darksea-zneg.jpg')
        createMaterial('assets/images/clouds/clouds-xneg.png'),
        createMaterial('assets/images/clouds/clouds-zpos.png'),
        createMaterial('assets/images/clouds/clouds-ypos.png'),
        createMaterial('assets/images/clouds/clouds-yneg.png'),
        createMaterial('assets/images/clouds/clouds-xpos.png'),
        createMaterial('assets/images/clouds/clouds-zneg.png')
    ];
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 10000, 1, 1, 1), new THREE.MeshFaceMaterial(materials));
    mesh.scale.set(-1, 1, 1);
    scene.add(mesh);
}

var createMaterial = function (path) {
    var texture = textureLoader.load(path);
    var material = new THREE.MeshBasicMaterial({
        map: texture
    });
    return material;
}

var shouldCreateFirework = function () {
	return fireworks.length < 6 && Math.random() <= 0.05;
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
    this.spheres = null;
    this.timeSinceDetonation = 0;
    scene.add(this.mesh);
}

Firework.prototype.update = function (index) {
	if (this.mesh.position.y < this.maxY) {
	    this.mesh.position.y += FIREWORK_SPEED;
	} else {
        if (!this.spheres) {
            this.detonateFirework();
        }
        for (var i = 0; i < this.spheres.length; i++) {
            var sphere = this.spheres[i];
            sphere.position.set(sphere.position.x + sphere.velocity.x, sphere.position.y + sphere.velocity.y, sphere.position.z + sphere.velocity.z);
        }
        this.timeSinceDetonation += 1;
        if (this.timeSinceDetonation > 70) {
            for (var i = 0; i < this.spheres.length; i++) {
                scene.remove(this.spheres[i]);
            }
            fireworks.splice(index, 1);
        }
    }
}

Firework.prototype.detonateFirework = function () {
	scene.remove(this.mesh);
    this.spheres = [];
    for (var i = 0; i < Math.random() * 2000; i++) {
        var sphere = new THREE.SphereGeometry(0.7);
        var sphereMaterial = new THREE.MeshPhongMaterial({
            color : SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
            emissive: 0xffffff,
            emissiveIntensity: 0.4
        });
        var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
        sphereMesh.position.set(this.x, FIREWORK_Y, this.z);
        sphereMesh.velocity = new THREE.Vector3(Math.random() - Math.random(),
                         Math.random() - Math.random(), Math.random() - Math.random());
        this.spheres.push(sphereMesh);
        scene.add(sphereMesh);
    }
}

var render = function () {
    controls.update();
    effect.render(scene, camera);

    // Move camera in circle
    var oldX = dolly.position.x;
    var oldZ = dolly.position.z;
    dolly.position.x = Math.cos(THETA) * oldX - Math.sin(THETA) * oldZ;
    dolly.position.z = Math.sin(THETA) * oldX + Math.cos(THETA) * oldZ;
    dolly.rotateY(-THETA);

    // Create new fireworks
    if (shouldCreateFirework()) {
    	makeFirework(Math.random() * PLANE_DIM - PLANE_DIM / 2, 50, Math.random() * PLANE_DIM - PLANE_DIM / 2);
    }

    // Draw fireworks
    for (var i = 0; i < fireworks.length; i++) {
    	fireworks[i].update(i);
    }

    // Draw snow
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
