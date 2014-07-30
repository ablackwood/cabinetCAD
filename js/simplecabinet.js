

THREE.SimpleCabinet = function( x, z ){
	this.overallSize = {x: 70, y: 70, z: 70};
	this.location = {x: x, y: 15, z: z};
	this.rotation = 0;
	this.thickness = 1.2;
	this.noOfDoors = 2;
	this.noOfShelves = 1;
	this.shelfSetback = 10;
	this.addedDoorLength = 2;
	this.cabinet = new THREE.Object3D();
	this.cabinetGeom = new THREE.Geometry();
	var wireframeGeom = new THREE.Geometry();
	this.arrow;

	if(!this.cabinet.name){
		this.cabinet.name = container.length;
		container.push(this);
	}

	this.createNewGeom = function(x, y, z, locx, locy, locz){
		var newGeom = new THREE.BoxGeometry(x, z, y, 1, 1, 1);
		newGeom.applyMatrix( new THREE.Matrix4().makeTranslation(locx, locz, locy));
		//THREE.GeometryUtils.merge(this.cabinetGeom, newGeom);
		var newMesh = new THREE.Mesh(newGeom, panelMatCream);
		newMesh.name = this.cabinet.name;
		var newEdge = new THREE.EdgesHelper(newMesh, 0x555555);
		this.cabinet.add(newMesh);
		this.cabinet.add(newEdge);
	};

	this.createNewArrow = function(vector){
		this.removeArrow();
		var adjustedVector = new THREE.Vector3(vector.x, vector.y, vector.z);
		this.arrow = new THREE.ArrowHelper( adjustedVector, new THREE.Vector3( ((this.overallSize.x/2) + this.location.x), ((this.overallSize.y / 2) + this.location.y), ((this.overallSize.z / 2) + this.location.z)), 50, 0x00ae00, 10, 10);
		this.arrow.rotation.y = this.rotation;
		//this.arrow.rotation.x = Math.PI/2;
		//this.arrow.rotation.z = 0;
		scene.add(this.arrow);
	};

	this.removeArrow = function(){
		scene.remove(this.arrow);
	};

	this.drawCabinet = function(){
		//scene.remove(this.cabinet);
		var length = this.cabinet.children.length;
		for(var k = 0; k < length; k++){
			this.cabinet.remove(this.cabinet.children[0]);
		}
		//Create sides of cabinet and bake in transform
		this.createNewGeom(this.overallSize.x - this.thickness - 0.2, this.thickness, this.overallSize.z - (2 * this.thickness), ((this.overallSize.x - this.thickness - 0.2)/ 2), (this.thickness / 2), ((this.overallSize.z  - (2 * this.thickness)) / 2) + this.thickness);

		this.createNewGeom(this.overallSize.x - this.thickness - 0.2, this.thickness, this.overallSize.z - (2 * this.thickness), ((this.overallSize.x - this.thickness - 0.2) / 2), (this.thickness / 2) + this.overallSize.y - this.thickness, ((this.overallSize.z  - (2 * this.thickness)) / 2) + this.thickness);

		//Create top and bottom and bake in transform
		this.createNewGeom(this.overallSize.x - this.thickness - 0.2, this.overallSize.y, this.thickness, ((this.overallSize.x - this.thickness - 0.2) / 2), (this.overallSize.y / 2), (this.thickness / 2) + this.overallSize.z - this.thickness);

		this.createNewGeom(this.overallSize.x - this.thickness - 0.2, this.overallSize.y, this.thickness, ((this.overallSize.x - this.thickness - 0.2) / 2), (this.overallSize.y) / 2, (this.thickness / 2));

		if(this.overallSize.y < 40){
			this.noOfDoors = 1;
		}
		if(this.overallSize.y > 40 && this.overallSize.y < 80){
			this.noOfDoors = 2;
		}
		if(this.overallSize.y > 80 && this.overallSize.y < 120){
			this.noOfDoors = 3;
		}
		if(this.overallSize.y > 120){
			this.noOfDoors = 4;
		}
		//Create doors and bake in transform
		for(var i = 0; i < this.noOfDoors; i++){
			this.createNewGeom(this.thickness, (this.overallSize.y / this.noOfDoors) - 0.2, this.overallSize.z + this.addedDoorLength, this.overallSize.x - (this.thickness / 2), (i * (this.overallSize.y / this.noOfDoors)) + (((this.overallSize.y / this.noOfDoors) - 0.2) / 2), ((this.overallSize.z + this.addedDoorLength) / 2) - this.addedDoorLength);
		}

		//Create shelves and bake in transform
		for(var j = 0; j < this.noOfShelves; j++){
			this.createNewGeom(this.overallSize.x - this.shelfSetback, this.overallSize.y - (2 * this.thickness), this.thickness, ((this.overallSize.x - this.shelfSetback) / 2), ((this.overallSize.y - (2 * this.thickness)) / 2) + this.thickness, ((this.thickness) / 2) + ((j + 1) * (this.overallSize.z / (this.noOfShelves + 1))))
		}

		//this.cabinet = new THREE.Mesh(this.cabinetGeom, panelMatCream);
		this.cabinet.castShaodow = true;
		this.cabinet.dynamic = true;
		//this.cabinet.rotation.x = Math.PI / 2;
		this.cabinet.rotation.y = this.rotation;
		this.cabinet.translateX(this.location.x - this.cabinet.position.x);
		this.cabinet.translateY(this.location.y - this.cabinet.position.y);
		this.cabinet.translateZ(this.location.z - this.cabinet.position.z);

		this.boundingBox = new THREE.BetterBounding(this.cabinet, scene, this.location, this.rotation);
	};

	this.drawCabinet();

	

	
	//this.createNewArrow(new THREE.Vector3(0,0,1));

};