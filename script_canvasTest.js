$(document).ready(function(){
	var interval = 10;
	var brownian = 1;
	var collisionDistance = 20;
	var personSize = 10;
	
	var infectionDuration=1000*1000;//milliseconds
	var mortalityProbability=0.0001;
	var resistanceProbability=0.9;
	var transmissionProbability =0.5;
	var healingProbability = 0.9;
	var vaccinationProbability = 0.1;
	
	var stochasticMovement = false;
	var gravityOn = false;
	var connectOnCollision = false;
	var gravityMagnitude = 0.5;
	var personSpeed = 5;
	var springStiffness = .005;
	var dampingCoefficient = 0.05;
	var springEquilibriumDistance = 100;
	var backgroundColor = "#E5E5E5";
	var sColor = "blue";
	var iColor = "red";
	var rColor = "green";
	var dColor = "#A4A4A4";
	var vColor = "#00FFBF";
	var hColor = "#CC2EFA";
	var boxScaler = 5;
	var boxCounts = {
		"s":0,
		"i":0,
		"r":0,
		"d":0,
		"v":0,
		"h":0
	}
	var counters = {
		chartCounter:0
	}
		
	var canvas = document.getElementsByClassName("canvas")[0];
	canvas.height = parseInt($(".canvas").css("height"),10);//1000;
	canvas.width = parseInt($(".canvas").css("width"),10);
	ctx = canvas.getContext("2d");
	
	function CanvasLocation(xIn, yIn, zIn, thetaIn){
		//Private data
		var x = xIn;
		var y = yIn;
		var z = zIn;
		var theta = thetaIn%360;
		
		//Set functions
		this.set = function(xIn, yIn, zIn, thetaIn){
			x = xIn;
			y = yIn;
			z = zIn;
			theta = theta;
		}
		this.setX = function(xIn){x = xIn;};
		this.setY = function(yIn){y = yIn;};
		this.setZ = function(zIn){z = zIn;};
		this.setTheta = function(thetaIn){theta = thetaIn;};
		
		//Get functions
		this.getX = function(){return x;};
		this.getY = function(){return y;};
		this.getZ = function(){return z;};
		this.getTheta = function(){return theta;};				
		
		//Manipulation Functions
		this.move = function(xUnits, yUnits){
			x += xUnits;
			y += yUnits;
		};
		this.moveX = function(xUnits){x += xUnits;};
		this.moveY = function(yUnits){y += yUnits;};
		this.changeZ = function(zNew){z = zNew;};
		this.rotate = function(thetaUnits){theta += thetaUnits%360;};	
	};
	
	function Camera(zoomMinIn, zoomMaxIn, aspectRatioIn){
		var zoomMax = zoomMaxIn;
		var zoomMin = zoomMinIn;
		
		var center = new CanvasLocation(0,0,1,0);
		var xSpan = 400; //In each direction
		var aspectRatio = aspectRatioIn; //width/height
		var ySpan = aspectRatio/xSpan; //In each direction
		
		//Set Functions
		this.set = function(xIn, yIn, zIn, thetaIn){center.set(xIn,yIn,zIn,thetaIn);};
		this.setX = function(xIn){center.setX(xIn);};
		this.setY = function(yIn){center.setY(yIn);};
		this.setZ = function(zIn){center.setZ(zIn);};
		this.setTheta = function(thetaIn){center.setTheta(thetaIn);};
		
		//Get Functions
		this.getX = function(){return center.getX();};
		this.getY = function(){return center.getY();};
		this.getZ = function(){return center.getZ();};
		this.getTheta = function(){return center.getTheta();};				
		
		//Manipulation Functions
		this.changeAspect = function(newAspect){
			ySpan = aspectRatio/xSpan;
		}
		this.zoom = function(percent){
			xSpan = Math.min(zoomMax,xSpan*percent);
			xSpan = Math.max(zoomMin,xSpan*percent);
			ySpan = xSpan/aspectRatio;
		};
		this.move = function(xCanvasUnits, yCanvasUnits){
			center.move(xCanvasUnits,yCanvasUnits);};
		this.moveX = function(xUnits){
			center.moveX(xUnits);};
		this.moveY = function(yUnits){
			center.moveY(yUnits);};
		this.changeZ = function(newZ){
			center.changeZ(newZ);};
		this.rotate = function(thetaUnits){
			center.rotate(thetaUnits);};
	};
	var camera = new Camera(100, 1000, 1);
	
	function Vector(x, y){
		this.getMagnitude = function(){
			return Math.sqrt(Math.pow(x,2),Math.pow(y,2));
		};
		this.getDirection = function(){
			return Math.atan(this.y/this.x);
		};
		
		this.add = function(x,y){
			this.x += x;
			this.y += y;			
		}
		this.addVector = function(vec){
			this.x += vec.x;
			this.y += vec.y;
		}
		
		this.scalarMult = function(scalar){
			this.x *= scalar;
			this.y *= scalar;	
		}
		this.set = function(x,y){
			this.x = x;
			this.y = y;
		};
		this.set(x,y);
	};
	
	function Force(x, y, name){
		this.vector = new Vector(x,y);
		this.name = name;
	}
	
	function Physics(mass){
		this.forces = [];
		this.netForce = new Force(0,0);
		this.mass = mass;
		this.vel = new Vector(0,0);
		this.acc = new Vector(0,0);
		
		this.update = function(){
			this.netForce.vector.set(0,0);
			
			for (var i=0;i<this.forces.length;i++){
				this.netForce.vector.addVector(this.forces[i].vector);
			}
			
			this.acc.set(this.netForce.vector.x/this.mass,this.netForce.vector.y/this.mass);
			this.vel.addVector(this.acc);
		}
		this.addForce = function(force){
			this.forces.push(force);
		};
		this.setVel = function(x,y){
			this.vel.set(x,y);
		}
		this.changeForce = function(forceName,newX,newY){
			var forcesCount = 0;
			for (var i=0;i<this.forces.length;i++){
				if (this.forces[i].name == forceName){
					this.forces[i].vector.set(newX,newY);
					forcesCount += 1;
				}
				if (forcesCount >1){
					alert("More than one force named " + forceName)
				}
			}	
		}
		this.checkForceName = function(name){
			var checkResult = false;
			for (var i=0;i<this.forces.length;i++){
				if (this.forces[i].name == name){
					checkResult = true;
				}
			}
			return checkResult;
		};
	};
	function CanvasObject(canvasNameIn, sizeIn){
		this.loc = new CanvasLocation(100,100,0,0);//make private
		this.canvasName = canvasNameIn;
		this.selected = false;
		this.size = sizeIn;
		this.id = -1;
		this.objectType = "object";
	};
	CanvasObject.prototype.draw = function(){
			alert("displaying canvasObject: Problem")
		};
	CanvasObject.prototype.update = function(){}
	
	CanvasObject.prototype.display = function(){
			//Check if being displayed			
			if (this.loc.getZ() <= camera.getZ()){
				this.draw();
			}
		};
	var canvasObjectArray = [];
	var peopleCounter = 0;
	
	function Person(canvasNameIn){
		this.physics = new Physics(1);
		this.timeInfected = 0;
		this.type = "s";
		this.objectType = "person";
		this.loc = new CanvasLocation(Math.random()*(canvas.width-2*personSize)+personSize,Math.random()*(canvas.width-2*personSize)+personSize,0,0);
		
		this.canvasName = canvasNameIn;
		this.size = personSize;
		
		this.initialize = function(){
			this.id = peopleCounter;
			peopleCounter += 1;
			canvasObjectArray.push(this);
			if (gravityOn == true){
				var gravityF = new Force(0,gravityMagnitude,"gravity");
				this.physics.addForce(gravityF);
			}
			this.physics.setVel(personSpeed*(2*Math.random()-1),personSpeed*(2*Math.random()-1));
			boxCounts[this.type]+=1;
		}
		this.initialize();
		
		this.setType = function(newType){
			boxCounts[this.type]-=1;
			boxCounts[newType]+=1;
			this.type = newType;
		}
		
		this.update = function(){
			if (this.type!="d"){
				var deltaX = 0;
				var deltaY = 0;
				//Stochastic movement component
				if (stochasticMovement == true){
					deltaX = brownian*(2*Math.random()-1);
					deltaY = brownian*(2*Math.random()-1);
				}
				//Deterministic movement component
				this.physics.update();
				deltaX += this.physics.vel.x;
				deltaY += this.physics.vel.y;
				this.loc.move(deltaX,deltaY);
				
				//Infection mechanics
				if (this.type == "i"){
					this.timeInfected+=interval;
					if (this.timeInfected > infectionDuration){
						if(Math.random()<resistanceProbability){
							this.setType("r");
						}else{
							this.setType("s");
						}
					}else if (Math.random()<mortalityProbability){
						this.setType("d");
					}
				}
			}
			//Wall bouncing
			if (this.loc.getX() < personSize || this.loc.getX() > canvas.width - personSize){
				this.physics.setVel(-this.physics.vel.x,this.physics.vel.y);
				if(this.loc.getX()<personSize){
					this.loc.setX(personSize);
				}else if (this.loc.getX()>canvas.width-personSize){
					this.loc.setX(canvas.width-personSize);
				}
			}
			if (this.loc.getY() < personSize || this.loc.getY() > canvas.height - personSize){
				this.physics.setVel(this.physics.vel.x,-this.physics.vel.y);
				if(this.loc.getY()<personSize){
					this.loc.setY(personSize);
				}else if (this.loc.getY()>canvas.height-personSize){
					this.loc.setY(canvas.height-personSize);
				}
			}
		};
		
		this.draw = function(){
			ctx.beginPath();
			ctx.arc(this.loc.getX(),this.loc.getY(),this.size,0,2*Math.PI,false);
			ctx.closePath();
			if (this.type == "s"){
				ctx.fillStyle=sColor;
			}else if (this.type == "i"){
				ctx.fillStyle=iColor;
			}else if (this.type == "r"){
				ctx.fillStyle=rColor;
			}else if (this.type == "d"){
				ctx.fillStyle=dColor;
			}else if (this.type == "v"){
				ctx.fillStyle=vColor;
			}else if (this.type == "h"){
				ctx.fillStyle=hColor;
			}else{
				ctx.fillStyle="black";
			}
			if (this.selected == true){
				ctx.strokeStyle = "#FFFF00";
			}else{
				ctx.strokeStyle = "#000000";
			}
			
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.stroke();
		};
	};
	Person.prototype = new CanvasObject();
	
	var edgeCounter = 0;
	function Edge(canvasNameIn){
		this.objectType = "edge";
		this.canvasName = canvasNameIn;
		
		this.node1id = -1;
		this.node2id = -1;
		this.node1type = "";
		this.node2type = "";
		
		this.x1=0;
		this.y1=0;
		this.x2=0;
		this.y2=0;
		this.x1vel=0;
		this.y1vel=0;
		this.x2vel=0;
		this.y2vel=0;
		
		this.initialize = function(){
			this.id = edgeCounter;
			edgeCounter += 1;
			canvasObjectArray.push(this);
		}
		this.initialize();

		this.setNodes = function(node1id, node1Type, node2id, node2Type){
			this.node1id = node1id;
			this.node2id = node2id;
			this.node1Type = node1Type;
			this.node2Type = node2Type;
			
			for(var i = 0; i<canvasObjectArray.length; i++){
				if (canvasObjectArray[i].id == this.node1id){
					if (canvasObjectArray[i].objectType == this.node1Type){
						var newName = "spring_"+this.node1id.toString()+"_"+this.node2id.toString();
						var doesForceNameExist = canvasObjectArray[i].physics.checkForceName(newName);
						if (!doesForceNameExist){
							var springForce = new Force(0,0,newName);
							canvasObjectArray[i].physics.addForce(springForce);
						}
					}
				}
				if (canvasObjectArray[i].id == this.node2id){ 
					if (canvasObjectArray[i].objectType == this.node2Type){
						var newName = "spring"+this.node2id.toString()+"_"+this.node1id.toString();
						var doesForceNameExist = canvasObjectArray[i].physics.checkForceName(newName);
						if (!doesForceNameExist){
							var springForce = new Force(0,0,newName);
							canvasObjectArray[i].physics.addForce(springForce);
						}
					}
				}
			}
		}
		
		this.update = function(){
			//Need to change this to a more efficient method
			for(var i = 0; i<canvasObjectArray.length; i++){
				if (canvasObjectArray[i].id == this.node1id){
					if (canvasObjectArray[i].objectType == this.node1Type){
						this.x1 = canvasObjectArray[i].loc.getX();
						this.y1 = canvasObjectArray[i].loc.getY();
						this.x1vel = canvasObjectArray[i].physics.vel.x;
						this.y1vel = canvasObjectArray[i].physics.vel.y;
					}
				}
				if (canvasObjectArray[i].id == this.node2id){ 
					if (canvasObjectArray[i].objectType == this.node2Type){
						this.x2 = canvasObjectArray[i].loc.getX();
						this.y2 = canvasObjectArray[i].loc.getY();
						this.x2vel = canvasObjectArray[i].physics.vel.x;
						this.y2vel = canvasObjectArray[i].physics.vel.y;
					}
				}
			}
			//Determine spring force
			var distance = Math.sqrt(Math.pow(this.x2-this.x1,2)+Math.pow(this.y2-this.y1,2));
			var dirX = (this.x2-this.x1)/distance;
			var dirY = (this.y2-this.y1)/distance;
			var totalForce = springStiffness*(distance - springEquilibriumDistance);

			var node1NewX = dirX*totalForce-dampingCoefficient*this.x1vel;
			var node1NewY = dirY*totalForce-dampingCoefficient*this.y1vel;
			
			var node2NewX = -dirX*totalForce-dampingCoefficient*this.x2vel;
			var node2NewY = -dirY*totalForce-dampingCoefficient*this.y2vel;
			
			//Apply spring force to nodes
			for(var i = 0; i<canvasObjectArray.length; i++){
				if (canvasObjectArray[i].id == this.node1id){
					if (canvasObjectArray[i].objectType == this.node1Type){
						canvasObjectArray[i].physics.changeForce("spring_"+this.node1id.toString()+"_"+this.node2id.toString(),node1NewX,node1NewY);
					}
				}
				if (canvasObjectArray[i].id == this.node2id){ 
					if (canvasObjectArray[i].objectType == this.node2Type){
						canvasObjectArray[i].physics.changeForce("spring_"+this.node2id.toString()+"_"+this.node1id.toString(),node2NewX,node2NewY);
					}
				}
			}
		}
		this.draw = function(){
			ctx.beginPath();
			ctx.moveTo(this.x1,this.y1);
			ctx.lineTo(this.x2,this.y2);
			ctx.closePath();
			ctx.strokeStyle="#000";
			ctx.stroke();
			//alert("drawing" +" "+this.x1 +" "+this.x2 +" "+this.y1 +" "+ this.y2);
		}
	}
	Edge.prototype = new CanvasObject();
	function Network(){
		this.edges = [];
		this.edgeType = 0;
		this.addEdge = function(edge){
			this.edges.push(edge);
		}
	}
	var boxCounter = 0;
	function Box(canvasNameIn){
		this.objectType = "box";
		this.canvasName = canvasNameIn;
		this.type = "";
		this.height = 0;
		this.width = 0;
		this.xCenter = 0;
		this.yCenter = 0;
		this.color = "#000000";
		
		this.initialize = function(){
			this.id = boxCounter;
			boxCounter += 1;
			canvasObjectArray.push(this);
		}
		this.initialize();
		this.set = function(height, width, xCenter, yCenter,type){
			this.height = height;
			this.width = width;
			this.xCenter = xCenter;
			this.yCenter = yCenter;
			this.type = type;
		} 
		
		this.update = function(){
			this.height = boxCounts[this.type]*boxScaler;
		}
		
		this.draw = function(){
			ctx.fillStyle=this.color;
			ctx.fillRect(this.xCenter-this.width/2,this.yCenter-this.height/2,this.width,this.height);
		}
	}
	Box.prototype = new CanvasObject();


	function Timeline(){
		
	}	

	function Chart(canvasNameIn){
		this.objectType = "chart";
		this.canvasName = canvasNameIn;
		this.type = "";
		this.height = 0;
		this.width = 0;
		this.xCenter = 0;//x position of the center of the background
		this.yCenter = 0;
		this.xOrigin = 0;//x position of the chart's x-origin coordinate relative to the height
		this.yOrigin = 0;
		this.axesColor = "#000000";
		this.seriesList = []
		
		this.initialize = function(){
			this.id = counters.chartCounter;
			counters.chartCounter += 1;
			canvasObjectArray.push(this);
		}
		this.initialize();
		this.set = function(height, width, xCenter, yCenter, xOrigin, yOrigin, type){
			this.height = height;
			this.width = width;
			this.xCenter = xCenter;
			this.yCenter = yCenter;
			this.xOrigin = xOrigin;
			this.yOrigin = yOrigin;
			this.type = type;
		} 
		
		this.update = function(){
			//Update time series
			for (series=0;series<this.seriesList.length;series++){
				this.seriesList[series].update();
			}
		}
		
		this.draw = function(){
			//Background
			ctx.fillStyle=this.color;
			ctx.fillRect(this.xCenter-this.width/2,this.yCenter-this.height/2,this.width,this.height);
			
			//Draw axes
			ctx.lineWidth = 5;
			ctx.strokeStyle = this.axesColor;
			//x-axis
			ctx.beginPath();
			ctx.moveTo(this.xCenter-this.width/2,this.yCenter-this.height/2+this.height*this.yOrigin);
			ctx.lineTo(this.xCenter+this.width/2,this.yCenter-this.height/2+this.height*this.yOrigin);
			ctx.closePath();
			ctx.stroke();
			//y-axis
			ctx.beginPath();
			ctx.moveTo(this.xCenter-this.width/2+this.width*this.xOrigin,this.yCenter-this.height/2);
			ctx.lineTo(this.xCenter-this.width/2+this.width*this.xOrigin,this.yCenter+this.height/2);
			ctx.closePath();
			ctx.stroke();
			
			//Draw time series
			for (series=0;series<this.seriesList.length;series++){
				this.seriesList[series].update();
			}
		}
	}
	Chart.prototype = new CanvasObject();



	function updateCanvasObjects(){
		for (var i=0;i<canvasObjectArray.length;i++){
			canvasObjectArray[i].update();
		}
	};
	
	function detectCollision(a,b){
    	var distance = Math.sqrt(Math.pow(a.loc.getX()-b.loc.getX(),2)+Math.pow(a.loc.getY()-b.loc.getY(),2));
    	if (distance < collisionDistance){
    		return true;
    	};
    };
    
	function checkCollisions(){
    	//Brute force method
    	for (var i=0;i<canvasObjectArray.length;i++){
    		for (var j=i+1;j<canvasObjectArray.length;j++){
    			if (i!=j){
    				if(detectCollision(canvasObjectArray[i],canvasObjectArray[j])){
    					if(canvasObjectArray[i].objectType == "person" && canvasObjectArray[j].objectType == "person"){
	    					//Check if an infection spread
	    					if (canvasObjectArray[i].type == "i" && canvasObjectArray[j].type == "s"){
	    						if(Math.random()<transmissionProbability){
	    							canvasObjectArray[j].setType("i");
	    						}
		    				}else if (canvasObjectArray[i].type == "s" && canvasObjectArray[j].type == "i"){
		    					if(Math.random()<transmissionProbability){
		    						canvasObjectArray[i].setType("i");
		    					}
		    				}
		    				
		    				//Check for vaccination 
		    				if (canvasObjectArray[i].type == "v" && canvasObjectArray[j].type == "s"){
	    						if(Math.random()<vaccinationProbability){
	    							canvasObjectArray[j].setType("r");
	    						}
		    				}else if (canvasObjectArray[i].type == "s" && canvasObjectArray[j].type == "v"){
		    					if(Math.random()<vaccinationProbability){
		    						canvasObjectArray[i].setType("r");
		    					}
		    				}
		    				
		    				//Check for healing
		    				if (canvasObjectArray[i].type == "h" && canvasObjectArray[j].type == "i"){
	    						if(Math.random()<healingProbability){
	    							if(Math.random()<resistanceProbability){
	    								canvasObjectArray[j].setType("r");
	    							}else{
	    								canvasObjectArray[j].setType("s");
	    							}
	    						}
		    				}else if (canvasObjectArray[i].type == "i" && canvasObjectArray[j].type == "h"){
		    					if(Math.random()<healingProbability){
		    						if(Math.random()<resistanceProbability){
	    								canvasObjectArray[i].setType("r");
	    							}else{
	    								canvasObjectArray[i].setType("s");
	    							}
		    					}
		    				}
		    				
		    				//Create connections
		    				if(connectOnCollision){
		    					var edge = new Edge("canvas");
		    					edge.setNodes(i,"person",j,"person");
		    				}
		    				
		    				//Move so not overlapping
		    				
		    				//Collision-bouncing mechanics
		    				var m1 = canvasObjectArray[i].physics.mass;
		    				var m2 = canvasObjectArray[j].physics.mass;
		    				var tempMassSum = m1 + m2;
		    				
		    				var tempVecI1 = new Vector(canvasObjectArray[i].physics.vel.x,canvasObjectArray[i].physics.vel.y);
		    				var tempVecJ1 = new Vector(canvasObjectArray[j].physics.vel.x,canvasObjectArray[j].physics.vel.y);
		    				
		    				var tempVecI2 = new Vector(canvasObjectArray[i].physics.vel.x,canvasObjectArray[i].physics.vel.y);
		    				var tempVecJ2 = new Vector(canvasObjectArray[j].physics.vel.x,canvasObjectArray[j].physics.vel.y);
		    				
		    				tempVecI1.scalarMult((m1-m2)/tempMassSum);
		    				tempVecJ1.scalarMult((2*m2)/tempMassSum);
		    				tempVecI2.scalarMult((2*m1)/tempMassSum);
		    				tempVecJ2.scalarMult((m2-m1)/tempMassSum);
		    				
		    				tempVecI1.addVector(tempVecJ1);
		    				tempVecJ2.addVector(tempVecI2);
		    				canvasObjectArray[i].physics.setVel(tempVecI1.x, tempVecI1.y);
		    				canvasObjectArray[j].physics.setVel(tempVecJ2.x, tempVecJ2.y);
	    				}
    				}
    			}
    		}	
    	}
    };
    
    function checkClicking(){
    	//Determine which ball was clicked, if any
    	
    };
    
	/*function updateBoxes(){};*/
	
	function displayCanvasObjects(){
		for (var i=0;i<canvasObjectArray.length;i++){
			canvasObjectArray[i].display();
		}
	};

	function intervalFunctions(){
		this.c = document.getElementsByClassName("canvas")[0];
		this.ctx = this.c.getContext("2d");
		this.ctx.clearRect(0,0,c.width,c.height);
		
		ctx.fillStyle=backgroundColor;
		ctx.fillRect(0,0,c.width,c.height);
		
    	checkCollisions();
    	updateCanvasObjects();
    	
    	//updateBoxes();
    	displayCanvasObjects();
    };
    function createStartingPop(s,i,r,v,h){
    	for (var a = 0;a<s;a++){
    		var newPerson = new Person("canvas");
    	};
    	for (var b = 0;b<i;b++){
    		var newPerson = new Person("canvas");
    		newPerson.setType("i");
    	};
    	for (var c = 0;c<r;c++){
    		var newPerson = new Person("canvas");
    		newPerson.setType("r");
    	};
    	for (var d = 0;d<v;d++){
    		var newPerson = new Person("canvas");
    		newPerson.setType("v");
    	};
    	for (var e = 0;e<h;e++){
    		var newPerson = new Person("canvas");
    		newPerson.setType("h");
    	};
    }
    
    function setCanvasDimensions(canvasName){
    	$("."+canvasName+"TestContainer").css("height",$("."+canvasName+"TestContainer").height());
    	$("."+canvasName+"TestContainer").css("width",$("."+canvasName+"TestContainer").width());
    };
    
    window.onresize = function(){
    	canvas.height = parseInt($(".canvas").css("height"),10);//1000;
		canvas.width = parseInt($(".canvas").css("width"),10);
    }
    function createRandomEdges(number){
    	for (var n = 0; n < number; n++){
    		var random1 = 0;
    		var random2 = 0;
    		var edge = new Edge();
    		while (random1 == random2){
    			random1 = Math.floor(Math.random()*peopleCounter);
    			random2 = Math.floor(Math.random()*peopleCounter);
    		}
    		edge.setNodes(random1,"person",random2,"person");
    	}
    }
    
    function createBoxes(){
    	var boxHeight = 500;
    	var boxWidth = 100;
    	var centerY = 600;
    	var sBox = new Box("canvas");
    	sBox.set(boxHeight, boxWidth, 100, centerY,"s");
    	sBox.color = sColor;
    	var iBox = new Box("canvas");
    	iBox.set(boxHeight, boxWidth, 250, centerY,"i")
    	iBox.color = iColor;
    	var rBox = new Box("canvas");
    	rBox.set(boxHeight, boxWidth, 400, centerY,"r")
    	rBox.color = rColor;
    	var vBox = new Box("canvas");
    	vBox.set(boxHeight, boxWidth, 550, centerY,"v")
    	vBox.color = vColor;
    	var hBox = new Box("canvas");
    	hBox.set(boxHeight, boxWidth, 700, centerY,"h")
    	hBox.color = hColor;
    	var dBox = new Box("canvas");
    	dBox.set(boxHeight, boxWidth, 850, centerY,"d")
    	dBox.color = dColor;
    }
    
    function createCharts(){
    	var sBox = new Chart("canvas");
    	sBox.set(500, 800, 1500, 600,0.2,0.8,"tl");
    }
    
    var mouseSelection = -1;
    var mouseSelectionTemp = -1;
    function getMousePosition(event)//applys to the main canvas only
      {
        var x = new Number();
        var y = new Number();

        if (event.x != undefined && event.y != undefined)
        {
          x = event.x;
          y = event.y;
        }
        else // Firefox method to get the position
        {
          x = event.clientX + document.body.scrollLeft +
              document.documentElement.scrollLeft;
          y = event.clientY + document.body.scrollTop +
              document.documentElement.scrollTop;
        }

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        
		mouseSelectionTemp = -1;
        for (var i=0;i<canvasObjectArray.length;i++){
        	var distance = Math.sqrt(Math.pow((canvasObjectArray[i].loc.getX()-x),2)+Math.pow((canvasObjectArray[i].loc.getY()-y),2));
        	if (distance < personSize){
        		if (mouseSelection != i)
        		{
        			canvasObjectArray[i].selected=true;
        			mouseSelectionTemp = i;
        		}
        	}
        }
        if (mouseSelectionTemp != -1){//If something new was selected
        	if (mouseSelection != -1){//If something is currently selected
        		canvasObjectArray[mouseSelection].selected=false;//Deselect the currently selected thing
        	}
        	mouseSelection = mouseSelectionTemp;//set current selection to new selection
        	
        }else if (mouseSelection != -1){
        	canvasObjectArray[mouseSelection].selected=false;
        	mouseSelection = -1;
        }
        
      }
    
	function init(){
		//setCanvasDimensions("canvas");
		window.setInterval(function(){intervalFunctions()}, interval);
		//var person = new Person("canvas");
		createBoxes();
		createCharts();
		createStartingPop(50,5,10,1,1);
		//createRandomEdges(100);
		document.addEventListener("DOMContentLoaded", init, false);

		canvas.addEventListener("mousedown", getMousePosition, false);
	};
	
	init();
});