
THREE.measuringTape = function(){
	this.location = new THREE.Vector3(0,0,0);
	this.orientation = new THREE.Vector3(1,0,0);

	this.length = 0;

	this.createTape = function(){
		var _measuringTape = new THREE.Object3D();
		var shape = [];
		shape.push(new THREE.Vector2(5,-5));
		shape.push(new THREE.Vector2(5,0));
		var angle = (1/8) * Math.PI;
		for (var i = 0; i < 11; i++) {
			var x = 5 * Math.cos(angle);
			var y = 5 * Math.sin(angle);
			shape.push(new THREE.Vector2(x,y));
			angle = angle + ((1/8) * Math.PI);
		};
		shape.push(new THREE.Vector2(0,-5));
		shape.push(new THREE.Vector2(5,-5));
		var extrudeShape = new THREE.Shape(shape);
		var extrusionSettings = {
			curveSegments: 1, 
			amount: 2.5, 
			bevelEnabled: true,
			bevelSize: 0.25,
			bevelThickness: 0.5 
		};
		var bodyGeom = new THREE.ExtrudeGeometry(extrudeShape, extrusionSettings);
		bodyGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
		bodyGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-5, 10.5, 1.25));
		bodyGeom.verticesNeedUpdate = true;
		var extrusion = new THREE.Mesh(bodyGeom, tapeRed);
		extrusion.name = "body";
		_measuringTape.add(extrusion);
		var _tape = new THREE.Mesh(new THREE.PlaneGeometry(2, 10, 1, 10),tapeYellow);
		_tape.name = "tape";
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
		_tape.applyMatrix(new THREE.Matrix4().makeTranslation(-7.5, 6, 0));
		_tape.geometry.verticesNeedUpdate = true;
		_measuringTape.add(_tape);

		return _measuringTape;
	}

	this.tape = this.createTape();

	this.createHTML = function(){
		var loc = worldToScreen(new THREE.Vector3(this.location.x, 15, this.location.z));
		this.label = document.createElement( 'div');
		this.label.id = "label";
		this.label.innerHTML = this.length + " mm";
		this.label.style.position = 'absolute';
		this.label.style.top = loc.y + 'px';
		this.label.style.right = loc.x + 'px';
		this.label.style.width = '70px';
		this.label.style.backgroundColor = "#435772";
		this.label.style.color = "#FFFFFF";
		this.label.style.textAlign = "center";
		this.label.style.font = "12px arial";
		this.label.style.border = "solid #2DA4A8";
		this.label.style.borderRadius = "25px";
		this.label.style.paddingTop = "3px";
		this.label.style.paddingBottom = "3px";


		document.body.appendChild( this.label );
	}

	this.html = this.createHTML();

	this.setLength = function(length){
		this.tape.remove(this.tape.getObjectByName("tape"));
		var _length = Math.sqrt(squared(Math.sqrt(squared(length.x - this.location.x) + squared(length.y - this.location.y))) + squared(length.z - this.location.z));
		this.length = Math.floor(_length);
		//var _offset = {x: Math.abs(length.x - this.location.x)/2 + smallerValue(length.x, this.location.x), y: Math.abs(length.y - this.location.y)/2 + smallerValue(length.y, this.location.y), z: Math.abs(length.z - this.location.z)/2 + smallerValue(length.z, this.location.z)};
		var _offset = {x: Math.abs(length.x - this.location.x)/2 + this.location.x, y: Math.abs(length.y - this.location.y)/2 + this.location.y, z: Math.abs(length.z - this.location.z)/2 + this.location.z};
		var _tape = new THREE.Mesh(new THREE.PlaneGeometry(2, _length - 5, 6, 10),tapeYellow);
		_tape.name = "tape";
		var matrix = new THREE.Matrix4().makeTranslation(-_length/2 - 5, 6, 0);
		_tape.applyMatrix(matrix);
		_tape.geometry.verticesNeedUpdate = true;
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
		_tape.geometry.verticesNeedUpdate = true;
		this.tape.add(_tape);
		this.label.innerHTML = this.length + " mm";
	}

	this.setDirectLength = function(length){
		this.tape.remove(this.tape.getObjectByName("tape"));
		//var _length = Math.sqrt(squared(Math.sqrt(squared(length.x - this.location.x) + squared(length.y - this.location.y))) + squared(length.z - this.location.z));
		this.length = Math.floor(length);
		//var _offset = {x: Math.abs(length.x - this.location.x)/2 + smallerValue(length.x, this.location.x), y: Math.abs(length.y - this.location.y)/2 + smallerValue(length.y, this.location.y), z: Math.abs(length.z - this.location.z)/2 + smallerValue(length.z, this.location.z)};
		var _offset = {x: Math.abs(length.x - this.location.x)/2 + this.location.x, y: Math.abs(length.y - this.location.y)/2 + this.location.y, z: Math.abs(length.z - this.location.z)/2 + this.location.z};
		var _tape = new THREE.Mesh(new THREE.PlaneGeometry(2, length - 5, 6, 10),tapeYellow);
		_tape.name = "tape";
		var matrix = new THREE.Matrix4().makeTranslation(-length/2 - 5, 6, 0);
		_tape.applyMatrix(matrix);
		_tape.geometry.verticesNeedUpdate = true;
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
		_tape.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
		_tape.geometry.verticesNeedUpdate = true;
		this.tape.add(_tape);
		this.label.innerHTML = this.length + " mm";
	}

	this.setLocation = function(location){
		this.location = location;
		this.tape.position = this.location;
		this.tape.matrixWorldNeedsUpdate = true;
		this.setHTMLLocation();
	}

	this.setHTMLLocation = function(){
		var loc = worldToScreen(new THREE.Vector3(this.location.x, 15, this.location.z));
		this.label.style.top = loc.y + 'px';
		this.label.style.right = loc.x + 'px';
	}

	this.setOrientation = function(orientation){
		var _vector = new THREE.Vector3().subVectors(this.location, orientation);
		_vector.normalize();
		var _quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), _vector);		
		this.tape.quaternion.set(_quaternion._x, _quaternion._y, _quaternion._z, _quaternion._w);
		this.tape.verticesNeedUpdate = true;
	}

	this.rotate = function(x, z){
		var theta = Math.atan(z/x);
		if(x < 0){
			theta = theta + Math.PI;
		}
		this.tape.rotateX(theta);
	}

	this.setVisible = function(){
		this.tape.visible = true;
	}

	this.setInvisible = function(){
		this.tape.visible = false;
	}
}