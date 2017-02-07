var Firework = function (x, y, z) {
    this.x = x;
    this.z = z;
	this.geometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
	this.material = new THREE.MeshLambertMaterial({
        color: 0xf9c6bd,
        emissive: 0xffffff,
        emissiveIntensity: 0.5
    });
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
            sphere.position.set(sphere.position.x + sphere.velocity.x,
                                sphere.position.y + sphere.velocity.y,
                                sphere.position.z + sphere.velocity.z);
            sphere.material.opacity = 1 - easeIn(this.timeSinceDetonation / 100);
        }
        this.timeSinceDetonation += 1;
        if (this.timeSinceDetonation > 100) {
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
            emissiveIntensity: 0.4,
            transparent: true
        });
        var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
        sphereMesh.position.set(this.x, FIREWORK_Y, this.z);
        sphereMesh.velocity = new THREE.Vector3(Math.random() - Math.random(),
                         Math.random() - Math.random(), Math.random() - Math.random());
        this.spheres.push(sphereMesh);
        scene.add(sphereMesh);
    }
}

var easeIn = function (t) {
    return t * t;
}
