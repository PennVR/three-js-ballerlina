var scene, camera, renderer, dolly;
var fireworks = [];
var snow;
var effect, controls;
var textureLoader = new THREE.TextureLoader();

var THETA = Math.PI / 3000;
var SEED = Math.floor(Math.random() * 1000);
var NOISE_DIM = 100;
var FIREWORK_Y = 180;
var FIREWORK_SPEED = 0.8;
var PLANE_DIM = 1000;
var PLANE_HEIGHT = 100;
var SPARK_COLORS = [0xbb0000, 0xea6f23, 0xffe359, 0x482ce8, 0xbb0000];

var init = function () {
	scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    loadSkyBox();

	// Perlin hills
	var noise = generateNoise(NOISE_DIM, NOISE_DIM, SEED);
    var planeGeometry = new THREE.PlaneGeometry(PLANE_DIM, PLANE_DIM, NOISE_DIM - 1, NOISE_DIM - 1);
    planeGeometry.rotateX(-1 * Math.PI / 2);
    for (var i = 0; i < planeGeometry.vertices.length; i++) {
    	var y = Math.floor(i / NOISE_DIM);
    	var x = i - y * NOISE_DIM;
    	planeGeometry.vertices[i].y = PLANE_HEIGHT * Math.abs(noise[y][x]);
    }

    var planeMaterial = new THREE.MeshPhongMaterial({
        shading: THREE.FlatShading,
        color: 0xe0cec7 });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    // Snow
    var flakes = new THREE.Geometry();
    for (var i = 0; i < 2000; i++) {
        var flake = new THREE.Vector3(Math.random() * PLANE_DIM - PLANE_DIM / 2,
                                      Math.random() * 200,
                                      Math.random() * PLANE_DIM - PLANE_DIM / 2);
        flake.velocity = new THREE.Vector3(Math.random() / 10 - 0.05,
                                           -0.15,
                                           Math.random() / 10 - 0.05);
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
        createMaterial('assets/images/darksea/darksea-xpos.jpg'),
        createMaterial('assets/images/darksea/darksea-xneg.jpg'),
        createMaterial('assets/images/darksea/darksea-ypos.jpg'),
        createMaterial('assets/images/darksea/darksea-yneg.jpg'),
        createMaterial('assets/images/darksea/darksea-zpos.jpg'),
        createMaterial('assets/images/darksea/darksea-zneg.jpg')
    ];
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 10000, 1, 1, 1),
                              new THREE.MultiMaterial(materials));
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
    	makeFirework(Math.random() * PLANE_DIM - PLANE_DIM / 2, 50,
                     Math.random() * PLANE_DIM - PLANE_DIM / 2);
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
