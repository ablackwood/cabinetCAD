

THREE.KitchenWalls = function(){
	this.plan = [];
	this.height = 0;
	this.kitchenWall = new THREE.Object3D();
	this.layingOut = true;
	this.extruding = false;
	this.editMode = false;
	this.highlightedFace = null;
	this.selectedFace = null;
	this.complete = false;
	this.outlineColour = 0x2da4a8;

	this.addPoint = function(x,y){
		this.plan.push(new THREE.Vector2 (x, y));
		if(this.plan.length > 1 && this.plan[0].x == this.plan[this.plan.length - 1].x && this.plan[0].y == this.plan[this.plan.length - 1].y){
			this.plan.pop();
			this.layingOut = false;
			this.extruding = true;
			click = false;
			this.outlineColour = 0xfeaa3a;
			circle.visible = false;
		}
		this.redraw();
	};

	this.deletePoint = function(){
		del = false;
		this.plan.pop();
		if(this.plan[0].x != this.plan[this.plan.length].x && this.plan[0].y != this.plan[this.plan.length].y){
			this.layingOut = true;
			this.extruding = false;
			this.outlineColour = 0x2da4a8;
		}
		this.redraw();
	};

	this.extrude = function(height){
		this.height = height;
		this.redraw();
	};

	this.redraw = function(){
		var length = this.kitchenWall.children.length;
		for(var i = 0; i < length; i++){
			this.kitchenWall.remove(this.kitchenWall.children[i]);
		}
		if(this.layingOut){
			var mouseXY = getMouseXY();
			circle.position.set(mouseXY.x, 1, mouseXY.z);
			circle.visible = true;
			this.drawWallOutline(mouseXY.x, mouseXY.z);
			click = false;
		}
		if(this.extruding){
			this.drawWallOutline();
			this.drawFootprint();
			if(this.height > 0){
				this.drawWall();
			}
			this.positionHandle();
			this.handle.visible = true;
			this.kitchenWall.add(this.handle);
		}
		if(this.editMode){
			this.drawWall();
		}
		if(this.complete){
			this.drawWall();
		}
	};

	this.deleteAll = function(){
		this.plan = [];
		this.height = 0;
		this.kitchenWall = new THREE.Object3D();
		this.layingOut = true;
		this.extruding = false;
		this.editMode = false;
		this.highlightedFace = null;
		this.selectedFace = null;
		this.complete = false;
		this.redraw();
	};

	this.drawWallOutline = function (x, y){
		for (var i = 0; i < this.plan.length; i++) {
			if(i == this.plan.length - 1 && this.layingOut){
				var wallEdge = cylinderAsLine(x, y, this.plan[i].x, this.plan[i].y, this.outlineColour);
				this.kitchenWall.add(wallEdge);
			}else{
				if(i + 1 < this.plan.length){
					var wallEdge = cylinderAsLine(this.plan[i].x, this.plan[i].y, this.plan[i + 1].x, this.plan[i + 1].y, this.outlineColour);
					this.kitchenWall.add(wallEdge);
				}else{
					var wallEdge = cylinderAsLine(this.plan[i].x, this.plan[i].y, this.plan[0].x, this.plan[0].y, this.outlineColour);
					this.kitchenWall.add(wallEdge);
				}
			}
		};
	}

	this.drawFootprint = function(){

		var extrudeShape = new THREE.Shape(this.plan);
		var shapeGeom = new THREE.ShapeGeometry(extrudeShape);
		var footprint = new THREE.Mesh(shapeGeom, darkOrange);
		footprint.name = "footprint";
		footprint.rotation.x = Math.PI/2;
		footprint.position.y = 1;
		this.kitchenWall.add(footprint);
	}

	this.drawWall = function(){
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

	function getMouseXY(){
		setAxisPosition(new THREE.Vector3(0,0,0));
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		var projector = new THREE.Projector();
		projector.unprojectVector( vector, camera );
		
		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		var intersectPlane = raycaster.intersectObject(XZplane);
		var nearest = roundToNearest(intersectPlane[0].point.x, intersectPlane[0].point.z, 100, 10);
		return nearest;
	}

	this.createHandle = function(){
		var points = [];
		points.push(new THREE.Vector3(0,0,7));
		points.push(new THREE.Vector3(2,0,3));
		points.push(new THREE.Vector3(1,0,3));
		points.push(new THREE.Vector3(1,0,-3));
		points.push(new THREE.Vector3(2,0,-3));
		points.push(new THREE.Vector3(0,0,-7));
		points.push(new THREE.Vector3(-2,0,-3));
		points.push(new THREE.Vector3(-1,0,-3));
		points.push(new THREE.Vector3(-1,0,3));
		points.push(new THREE.Vector3(-2,0,3));
		points.push(new THREE.Vector3(0,0,7));
		var geometry = new THREE.LatheGeometry(points, 24);
		this.handle = new THREE.Mesh(geometry, red);
		this.handle.material.color.setHex(0x3b3b3b);
		this.handle.scale.set(3,3,3);
		this.handle.rotation.x = Math.PI/2;
		this.handle.visible = false;
		this.handle.name = "extrude handle";
		this.kitchenWall.add(this.handle);
	}

	this.handle;
	this.createHandle();

	this.positionHandle = function(){
		var xArray = [];
		var yArray = [];
		for(var i = 0; i < this.plan.length; i++){
			xArray.push(this.plan[i].x);
			yArray.push(this.plan[i].y);
		}
		xArray.sort(function(a,b){return a - b});
		yArray.sort(function(a,b){return a - b});
		this.handle.position.x = (xArray[xArray.length - 1] + xArray[0])/2;
		this.handle.position.z = (yArray[yArray.length - 1] + yArray[0])/2;
		if(this.height > 0){
			this.handle.position.y = this.height + 25;
		}else{
			this.handle.position.y = 25;
		}
		setAxisPosition(new THREE.Vector3(this.handle.position.x,0,this.handle.position.z));
	}

	this.highlightHandle = function(){
		this.handle.material.color.setHex(0xcf2257);
	}

	this.unhighlightHandle = function(){
		this.handle.material.color.setHex(0x3b3b3b);
	}
}