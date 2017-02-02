// User is sitting on a ski lift that's passing through some mountains
var scene, camera, renderer, cube;

var init = function () {
    var geometry, material;
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.set(0, 1, 0);
    scene.add(camera);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xffffff);
	document.body.appendChild(renderer.domElement);

	var light1 = new THREE.DirectionalLight(0xffffff, 0.8);
	light1.position.set(10, 10, 10);

	var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
	light2.position.set(-10, 5, -10);

	var light3 = new THREE.AmbientLight( 0x404040 );

	scene.add(light1);
	scene.add(light2);
	scene.add(light3);

    geometry = new THREE.PlaneGeometry(300, 300);
    geometry.rotateX(-1 * Math.PI / 2);
    material = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);


	geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.rotateX(Math.PI / 4);
    geometry.rotateY(Math.PI / 6);
	material = new THREE.MeshLambertMaterial({ color: 0x55ff55 });
	cube = new THREE.Mesh(geometry, material);
    cube.position.y = 3;
    cube.position.z = -10;
	scene.add(cube);
}

var render = function () {
    renderer.render(scene, camera);
    cube.rotation.y += 0.05;
	requestAnimationFrame(render);
}

init();
render();
