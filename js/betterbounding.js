

THREE.BetterBounding = function(object, scene, translation, rotation){
	var minX, maxX, minY, maxY, minZ, maxZ;
	var xArray = [];
	var yArray = [];
	var zArray = [];
	var a,b,c,d,e,f,g,h;
	var geom1 = new THREE.Geometry();
	var geom2 = new THREE.Geometry();
	var geom3 = new THREE.Geometry();
	var geom4 = new THREE.Geometry();
	var mesh1, mesh2, mesh3, mesh4;
	this.boundingBox = [];

	this.visibleFalse = function(){
		mesh1.visible = false;
		mesh2.visible = false;
		mesh3.visible = false;
		mesh4.visible = false;		
	};

	this.visibleTrue = function(){
		mesh1.visible = true;
		mesh2.visible = true;
		mesh3.visible = true;
		mesh4.visible = true;
	};

	this.setSelected = function(){
		mesh1.material.color.setHex(0x00ae00);
		mesh2.material.color.setHex(0x00ae00);
		mesh3.material.color.setHex(0x00ae00);
		mesh4.material.color.setHex(0x00ae00);
	};

	this.setUnselected = function(){
		mesh1.material.color.setHex(0xffae00);
		mesh2.material.color.setHex(0xffae00);
		mesh3.material.color.setHex(0xffae00);
		mesh4.material.color.setHex(0xffae00);
	};

	function createMesh(geom){
		var mesh = new THREE.Line( geom, wireFrameMat);
		mesh.name = "line";
		//mesh.rotation.x = Math.PI / 2;
		mesh.rotation.y = rotation;
		mesh.translateX(translation.x);
		mesh.translateY(translation.y);
		mesh.translateZ(translation.z);
		mesh.visible = false;
		return mesh;
	}

	for(var j = 0; j < object.children.length; j += 2){
		console.log(typeof object.children[j]);
		for(var i = 0; i < object.children[j].geometry.vertices.length; i++){
			xArray.push(object.children[j].geometry.vertices[i].x);
			yArray.push(object.children[j].geometry.vertices[i].y);
			zArray.push(object.children[j].geometry.vertices[i].z);
		}
	}	

	xArray.sort(function(a,b){return a - b});
	yArray.sort(function(a,b){return a - b});
	zArray.sort(function(a,b){return a - b});

	minX = xArray[0] - 1;
	maxX = xArray[xArray.length - 1] + 1;
	minY = yArray[0] - 1;
	maxY = yArray[yArray.length - 1] + 1;
	minZ = zArray[0] - 1;
	maxZ = zArray[zArray.length - 1] + 1;

	a = new THREE.Vector3(minX, minY, minZ);
	b = new THREE.Vector3(maxX, minY, minZ);
	c = new THREE.Vector3(maxX, minY, maxZ);
	d = new THREE.Vector3(minX, minY, maxZ);
	e = new THREE.Vector3(minX, maxY, minZ);
	f = new THREE.Vector3(maxX, maxY, minZ);
	g = new THREE.Vector3(maxX, maxY, maxZ);
	h = new THREE.Vector3(minX, maxY, maxZ);

	geom1.vertices.push(a,b);
	geom1.vertices.push(b,c);
	geom1.vertices.push(c,d);
	geom1.computeLineDistances();
	geom2.vertices.push(b,f);
	geom2.vertices.push(f,g);
	geom2.vertices.push(g,c);
	geom2.computeLineDistances();
	geom3.vertices.push(f,e);
	geom3.vertices.push(e,h);
	geom3.vertices.push(h,g);
	geom3.computeLineDistances();
	geom4.vertices.push(e,a);
	geom4.vertices.push(a,d);
	geom4.vertices.push(d,h);
	geom4.computeLineDistances();

	mesh1 = createMesh(geom1);
	mesh2 = createMesh(geom2);
	mesh3 = createMesh(geom3);
	mesh4 = createMesh(geom4);

	scene.add(mesh1);
	scene.add(mesh2);
	scene.add(mesh3);
	scene.add(mesh4);
};