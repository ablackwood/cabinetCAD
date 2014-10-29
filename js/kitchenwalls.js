

THREE.KitchenWalls = function(){
	this.plan = [];
	this.height = 0;
	this.kitchenWall = new THREE.Object3D();
	this.extrudedWall = new THREE.Mesh();
	this.wallFaces = new Array();
	this.layingOut = true;
	this.extruding = false;
	this.editMode = false;
	this.highlightedFace = null;
	this.selectedFace = null;
	this.selectedFaceVertices = null;
	this.tempVertexList = [];
	this.tempFaceList = [];
	this.visitedList = new Array();
	this.vertexLinkToFace = new Array();
	//this.editPoints = [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, 0, 0, 0, 0];
	this.editPoints = {first: {x: 0, y: 0, z: 0}, second: {x: 0, y: 0, z: 0}, height: 0, depth: 0, rotation: 0, midPoint: {x: 0, y: 0, z: 0}};
	this.editStage = 0;
	this.remove = [];
	this.liveRemove = null;
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
			hide("#first_text", "#extrude_text");
		}
		this.redraw();
	};

	this.deletePoint = function(){
		del = false;
		this.plan.pop();	
		if(this.plan[0].x != this.plan[this.plan.length-1].x && this.plan[0].y != this.plan[this.plan.length-1].y){
			this.layingOut = true;
			this.extruding = false;
			this.outlineColour = 0x2da4a8;
		}
		MeasuringTape.setLocation(new THREE.Vector3(this.plan[this.plan.length-1].x, 0, this.plan[this.plan.length-1].y));
		this.redraw();			
	};

	this.extrude = function(height){
		this.height = height;
		this.wallFaces = new Array();
		for (var i = 0; i < this.plan.length; i++) {
			if(i + 1 != this.plan.length){
				var wall = new wallFace(new THREE.Vector3(this.plan[i].x, 0, this.plan[i].y), new THREE.Vector3(this.plan[i + 1].x, 0, this.plan[i + 1].y), height);
				this.wallFaces.push(wall);
			}else{
				var wall = new wallFace(new THREE.Vector3(this.plan[i].x, 0, this.plan[i].y), new THREE.Vector3(this.plan[0].x, 0, this.plan[0].y), height);
				this.wallFaces.push(wall);
			}
		};
		//this.redraw();
	};

	this.redraw = function(){
		var length = this.kitchenWall.children.length;
		for(var i = length - 1; i > -1; i--){
			this.kitchenWall.remove(this.kitchenWall.children[i]);
		}
		if(this.layingOut){
			var mouseXY = this.getMouseXY();
			circle.position.set(mouseXY.x, 1, mouseXY.z);
			circle.visible = true;
			MeasuringTape.setOrientation(new THREE.Vector3(circle.position.x, 0, circle.position.z));
			MeasuringTape.setLength(new THREE.Vector3(circle.position.x, 0, circle.position.z));
			this.drawWallOutline(mouseXY.x, mouseXY.z);
			click = false;
		}
		if(this.extruding){
			circle.visible = false;
			this.drawWallOutline();
			this.drawFootprint();
			if(this.height > 0){
				this.drawWall();
				this.drawWallFaces();
			}
			this.positionHandle();
			this.handle.visible = true;
			this.kitchenWall.add(this.handle);
			MeasuringTape.setLocation(new THREE.Vector3(this.plan[0].x + 5, 0, this.plan[0].y + 5));
			MeasuringTape.setOrientation(new THREE.Vector3(this.plan[0].x + 5, 1, this.plan[0].y + 5));
			MeasuringTape.setLength(new THREE.Vector3(this.plan[0].x + 5, this.height, this.plan[0].y + 5));
		}
		if(this.editMode){
			circle.visible = false;
			MeasuringTape.setInvisible();
			if(this.highlightedFace != null){
				//this.drawFace(this.highlightedFace, 0xfeaa3a);
			}
			if(this.selectedFace != null){
				circle.visible = true;
				this.drawFace(this.selectedFace, 0x2DA4A8);
				var normal = this.wallFaces[this.selectedFace].normal.normalize();
				if(this.wallFaces[this.selectedFace].editStage == 0){
					circle.position.set(this.wallFaces[this.selectedFace].vo1.x, 1, this.wallFaces[this.selectedFace].vo1.z);
					MeasuringTape.setLocation(new THREE.Vector3(this.wallFaces[this.selectedFace].v1.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].v1.z + (5 * normal.z)));
					MeasuringTape.setOrientation(new THREE.Vector3(this.wallFaces[this.selectedFace].v2.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].v2.z + (5 * normal.z)));
					MeasuringTape.setLength(new THREE.Vector3(this.wallFaces[this.selectedFace].vo1.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].vo1.z + (5 * normal.z)));					
					//this.kitchenWall.add(this.extrudedWall);
					//this.drawWallFaces();
				}else if(this.wallFaces[this.selectedFace].editStage == 1){
					circle.position.set(this.wallFaces[this.selectedFace].vo2.x, 1, this.wallFaces[this.selectedFace].vo2.z);
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo1.x, 1, this.wallFaces[this.selectedFace].vo1.z, this.wallFaces[this.selectedFace].vo2.x, 1, this.wallFaces[this.selectedFace].vo2.z, this.outlineColour));
					MeasuringTape.setLocation(new THREE.Vector3(this.wallFaces[this.selectedFace].vo1.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].vo1.z + (5 * normal.z)));
					MeasuringTape.setOrientation(new THREE.Vector3(this.wallFaces[this.selectedFace].vo2.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].vo2.z + (5 * normal.z)));
					MeasuringTape.setLength(new THREE.Vector3(this.wallFaces[this.selectedFace].vo2.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].vo2.z + (5 * normal.z)));
					//this.kitchenWall.add(this.extrudedWall);
					//this.drawWallFaces();
				}else if(this.wallFaces[this.selectedFace].editStage == 2){
					//circle.position.set(this.editPoints.height.x, this.editPoints.height.y, this.editPoints.height.z);
					circle.visible = false;
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo1.x, this.wallFaces[this.selectedFace].vo1.y, this.wallFaces[this.selectedFace].vo1.z, this.wallFaces[this.selectedFace].vo2.x, this.wallFaces[this.selectedFace].vo2.y, this.wallFaces[this.selectedFace].vo2.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo2.x, this.wallFaces[this.selectedFace].vo2.y, this.wallFaces[this.selectedFace].vo2.z, this.wallFaces[this.selectedFace].vo3.x, this.wallFaces[this.selectedFace].vo3.y, this.wallFaces[this.selectedFace].vo3.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo3.x, this.wallFaces[this.selectedFace].vo3.y, this.wallFaces[this.selectedFace].vo3.z, this.wallFaces[this.selectedFace].vo4.x, this.wallFaces[this.selectedFace].vo4.y, this.wallFaces[this.selectedFace].vo4.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo4.x, this.wallFaces[this.selectedFace].vo4.y, this.wallFaces[this.selectedFace].vo4.z, this.wallFaces[this.selectedFace].vo1.x, this.wallFaces[this.selectedFace].vo1.y, this.wallFaces[this.selectedFace].vo1.z, this.outlineColour));
					MeasuringTape.setLocation(new THREE.Vector3(this.wallFaces[this.selectedFace].vo1.x + (5 * normal.x), 0, this.wallFaces[this.selectedFace].vo1.z + (5 * normal.z)));
					MeasuringTape.setOrientation(new THREE.Vector3(this.wallFaces[this.selectedFace].vo1.x + (5 * normal.x), 1, this.wallFaces[this.selectedFace].vo1.z + (5 * normal.z)));
					MeasuringTape.setLength(new THREE.Vector3(this.wallFaces[this.selectedFace].vo4.x + (5 * normal.x), this.wallFaces[this.selectedFace].vo4.y, this.wallFaces[this.selectedFace].vo4.z + (5 * normal.z)));
					MeasuringTape.rotate(normal.x, normal.z);
					//this.kitchenWall.add(this.extrudedWall);
					//this.drawWallFaces();
				}else if(this.wallFaces[this.selectedFace].editStage == 3){
					circle.visible = false;
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo1.x, this.wallFaces[this.selectedFace].vo1.y, this.wallFaces[this.selectedFace].vo1.z, this.wallFaces[this.selectedFace].vo2.x, this.wallFaces[this.selectedFace].vo2.y, this.wallFaces[this.selectedFace].vo2.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo2.x, this.wallFaces[this.selectedFace].vo2.y, this.wallFaces[this.selectedFace].vo2.z, this.wallFaces[this.selectedFace].vo3.x, this.wallFaces[this.selectedFace].vo3.y, this.wallFaces[this.selectedFace].vo3.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo3.x, this.wallFaces[this.selectedFace].vo3.y, this.wallFaces[this.selectedFace].vo3.z, this.wallFaces[this.selectedFace].vo4.x, this.wallFaces[this.selectedFace].vo4.y, this.wallFaces[this.selectedFace].vo4.z, this.outlineColour));
					kitchenwalls.kitchenWall.add(cylinderAsLine3D(this.wallFaces[this.selectedFace].vo4.x, this.wallFaces[this.selectedFace].vo4.y, this.wallFaces[this.selectedFace].vo4.z, this.wallFaces[this.selectedFace].vo1.x, this.wallFaces[this.selectedFace].vo1.y, this.wallFaces[this.selectedFace].vo1.z, this.outlineColour));
					var face = this.wallFaces[this.selectedFace];
					var center = new THREE.Vector3(smallerValue(face.vo1.x, face.vo2.x) + (Math.abs(face.vo1.x - face.vo2.x)/2), 0, smallerValue(face.vo1.z, face.vo2.z) + (Math.abs(face.vo1.z - face.vo2.z)/2));
					MeasuringTape.setLocation(new THREE.Vector3(center.x + (10 * normal.x), 0, center.z + (10 * normal.z)));
					MeasuringTape.setOrientation(new THREE.Vector3(center.x + (10 * normal.x)-normal.x, -normal.y, center.z + (10 * normal.z)-normal.z));
					MeasuringTape.setDirectLength(face.depth);
				}				
			}else{
				this.kitchenWall.add(this.extrudedWall);
				//this.drawWallFaces();
			}

			this.drawWall();
			this.drawWallFaces();

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
		extrusionGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
		extrusionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.height, 0));
		extrusionGeom.verticesNeedUpdate = true;
		var extrusion = new THREE.Mesh(extrusionGeom, panelMatWhite);
		roundVerticesToInt(extrusion);
		for (var i = 0; i < this.wallFaces.length; i++){
			if(this.wallFaces[i].depth > 0){	
				var geom = new THREE.BoxGeometry(getLength( this.wallFaces[i].vo1.x,  this.wallFaces[i].vo1.z, this.wallFaces[i].vo2.x,  this.wallFaces[i].vo2.z), this.wallFaces[i].vo3.y, this.wallFaces[i].depth * 2, 1, 1, 1);
				geom.applyMatrix(new THREE.Matrix4().makeRotationY(this.wallFaces[i].theta));
				geom.applyMatrix(new THREE.Matrix4().makeTranslation(Math.abs(this.wallFaces[i].vo1.x - this.wallFaces[i].vo2.x)/2 + smallerValue(this.wallFaces[i].vo1.x, this.wallFaces[i].vo2.x), this.wallFaces[i].vo3.y/2, Math.abs(this.wallFaces[i].vo1.z - this.wallFaces[i].vo2.z)/2 + smallerValue(this.wallFaces[i].vo1.z, this.wallFaces[i].vo2.z)));
				remove_bsp = new ThreeBSP(new THREE.Mesh(geom, panelMatWhite));
				var extrudedWall_bsp = new ThreeBSP(extrusion);
				var subtracted_bsp = extrudedWall_bsp.subtract(remove_bsp);
				var result = subtracted_bsp.toMesh(panelMatWhite);
				result.geometry.computeVertexNormals();
				result.geometry.computeFaceNormals();
				result.geometry.elementsNeedUpdate = true;
				roundVerticesToInt(result);
				//this.kitchenWall.add(result);
				extrusion = result;
			}
		};
		this.extrudedWall = extrusion;
		//this.extrudedWall.visible = false;
		this.kitchenWall.add(this.extrudedWall);
	}

	this.drawWallFaces = function(){
		var faceArray = new THREE.Object3D();
		for (var i = 0; i < this.wallFaces.length; i++) {
				var geom = new THREE.PlaneGeometry( this.wallFaces[i].width, this.wallFaces[i].height, 10, 10 );
				geom.applyMatrix(new THREE.Matrix4().makeRotationY(this.wallFaces[i].theta));
				geom.applyMatrix(new THREE.Matrix4().makeTranslation(this.wallFaces[i].center.x, this.wallFaces[i].center.y, this.wallFaces[i].center.z));		
				geom.verticesNeedUpdate = true;
				var face = new THREE.Mesh( geom , new THREE.MeshBasicMaterial( { color: 0xFFFF00, opacity: 0.25, transparent: true, wireframe: true } ) );
				face.visible = false;
				face.material.side = THREE.DoubleSide;

				face.name = i;
				faceArray.add(face);
		};
		this.kitchenWall.add(faceArray);
	}

	this.drawFace = function(faceIndex, colour){
		var face = this.wallFaces[faceIndex];
		kitchenwalls.kitchenWall.add(cylinderAsLine3D(face.v1.x, face.v1.y, face.v1.z, face.v2.x, face.v2.y,face.v2.z, colour));
		kitchenwalls.kitchenWall.add(cylinderAsLine3D(face.v2.x, face.v2.y, face.v2.z, face.v3.x, face.v3.y, face.v3.z, colour));
		kitchenwalls.kitchenWall.add(cylinderAsLine3D(face.v3.x, face.v3.y, face.v3.z, face.v4.x, face.v4.y, face.v4.z, colour));
		kitchenwalls.kitchenWall.add(cylinderAsLine3D(face.v4.x, face.v4.y, face.v4.z, face.v1.x, face.v1.y, face.v1.z, colour));
	}

	this.getMoreFaces = function(faceToDraw, geometry){
		var a = geometry.faces[faceToDraw].a;
		var b = geometry.faces[faceToDraw].b;
		var c = geometry.faces[faceToDraw].c;
		for (var i = 0; i < this.vertexLinkToFace[a][1].length; i++) {
			if(geometry.faces[this.vertexLinkToFace[a][1][i]].normal.x == geometry.faces[faceToDraw].normal.x && geometry.faces[this.vertexLinkToFace[a][1][i]].normal.y == geometry.faces[faceToDraw].normal.y && geometry.faces[this.vertexLinkToFace[a][1][i]].normal.z == geometry.faces[faceToDraw].normal.z){
				if(this.checkVisitedList(this.vertexLinkToFace[a][1][i])){
					this.visitedList.push(this.vertexLinkToFace[a][1][i]);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[a][1][i]].a);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[a][1][i]].b);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[a][1][i]].c);
					this.getMoreFaces(this.vertexLinkToFace[a][1][i],geometry);
				}
			}
		};
		for (var j = 0; j < this.vertexLinkToFace[b][1].length; j++) {
			if(geometry.faces[this.vertexLinkToFace[b][1][j]].normal.x == geometry.faces[faceToDraw].normal.x && geometry.faces[this.vertexLinkToFace[b][1][j]].normal.y == geometry.faces[faceToDraw].normal.y && geometry.faces[this.vertexLinkToFace[b][1][j]].normal.z == geometry.faces[faceToDraw].normal.z){
				if(this.checkVisitedList(this.vertexLinkToFace[b][1][j])){
					this.visitedList.push(this.vertexLinkToFace[b][1][j]);				
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[b][1][j]].a);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[b][1][j]].b);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[b][1][j]].c);
					this.getMoreFaces(this.vertexLinkToFace[b][1][j],geometry);
				}
			}
		};
		for (var k = 0; k < this.vertexLinkToFace[c][1].length; k++) {
			if(geometry.faces[this.vertexLinkToFace[c][1][k]].normal.x == geometry.faces[faceToDraw].normal.x && geometry.faces[this.vertexLinkToFace[c][1][k]].normal.y == geometry.faces[faceToDraw].normal.y && geometry.faces[this.vertexLinkToFace[c][1][k]].normal.z == geometry.faces[faceToDraw].normal.z){
				if(this.checkVisitedList(this.vertexLinkToFace[c][1][k])){			
					this.visitedList.push(this.vertexLinkToFace[c][1][k]);				
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[c][1][k]].a);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[c][1][k]].b);
					this.tempVertexList.push(geometry.faces[this.vertexLinkToFace[c][1][k]].c);
					this.getMoreFaces(this.vertexLinkToFace[c][1][k],geometry);
				}
			}
		};	
	}

	this.checkVisitedList = function(i){for (var j = 0; j < this.visitedList.length; j++) {if(this.visitedList[j] == i){return false;}}; return true;}

	this.getMouseXY = function(){
		setAxisPosition(new THREE.Vector3(0,0,0));
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		var projector = new THREE.Projector();
		projector.unprojectVector( vector, camera );
		
		var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		var intersectPlane = raycaster.intersectObject(XZplane);
		if(this.plan.length > 0){
			var nearest = roundToNearest(intersectPlane[0].point.x, intersectPlane[0].point.z, this.plan[this.plan.length - 1].x, this.plan[this.plan.length - 1].y, 100, 10);			
		}else{
			var nearest = roundToNearest(intersectPlane[0].point.x, intersectPlane[0].point.z, 0, 0, 100, 10);
		}

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