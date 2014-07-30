

THREE.KitchenWalls = function(){
	this.plan = [];
	this.height = 0;
	this.kitchenWall = new THREE.Object3D();
	scene.add(this.kitchenWall);
	this.layingOut = true;
	this.extruding = false;
	this.editMode = false;
	this.complete = false;

	this.addPoint = function(x,y){
		this.plan.push({x: x, y: y});
		if(this.plan[0].x == this.plan[this.plan.length].x && this.plan[0].y == this.plan[this.plan.length].y){
			this.layingOut = false;
			this.extruding = true;
		}
		this.redraw();
	};

	this.deletePoint = function(){
		this.plan.pop();
		if(this.plan[0].x != this.plan[this.plan.length].x && this.plan[0].y != this.plan[this.plan.length].y){
			this.layingOut = true;
			this.extruding = false;
		}
		this.redraw();
	};

	this.extrude = function(height){
		this.height = height;
		this.redraw();
	};

	this.redraw = function(){
		this.kitchenWall = new THREE.Object3D();
		if(this.layingOut){
			drawWallOutline();
		}
		if(this.extruding){
			drawWallOutline();
			drawFootprint();
			if(this.height > 0){
				drawWall();
			}

		}
	};

	this.deleteAll = function(){
		this.plan = [];
		this.height = 0;
		this.kitchenWall = new THREE.Object3D();
		this.layingOut = true;
		this.extruding = false;
		this.editMode = false;
		this.complete = false;
		this.redraw();
	};

	function drawWallOutline(){

	}

	function drawFootprint(){

	}

	function drawWall(){
		var extrudeShape = new THREE.Shape(this.plan);
		var extrusionSettings = {
			curveSegments: 1, 
			amount: this.height, 
			bevelEnabled: false, 
		};
		var extrusionGeom = new THREE.ExtrudeGeometry(extrudeShape, extrusionSettings);
		var extrusion = new THREE.Mesh(extrusionGeom, panelMatWhite);
		extrusion.rotation.x = Math.PI/2;
		extrusion.translateZ(-this.height);
		this.kitchenWall.add(extrusion);
	}
}