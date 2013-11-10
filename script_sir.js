$(document).ready(function(){
	var peopleArray = [];
	var boxesArray = [];
	var totalPop = 0;
	var collisionDistance=3;
	var infectionDuration=20*1000;//milliseconds
	var interval = 100;

	function Box(boxName){
		this.name = boxName;
		this.count = 0;
		this.percent =0;
		
		this.initialize = function(){
			boxesArray.push(this);
		}
		
		this.resize = function(){
			if (totalPop != 0){
				this.percent = this.count/totalPop*100;
			}else{
				this.percent = 0;
			}
			var height = this.percent*0.6;
			$("."+this.name).css("height",height.toString()+"%");
		}
		this.initialize();
	}
	
	function Person(boxType){
		this.x = Math.random()*100;
		this.y = Math.random()*100;
		this.boxType = boxType;
		this.color = "black";
		this.timeInfected=0;
		this.connections = [];
		
		this.initialize = function(){
			this.id = peopleArray.length;
			var str = "<div class='PersonID"+this.id.toString()+" person'></div>";
			$(".peopleContainer").append(str);
			$(".PersonID"+this.id.toString()).css("background-color",this.color);
			totalPop += 1;
			for (var i=0;i<boxesArray.length;i++){
				if (boxesArray[i].name == this.boxType){
					boxesArray[i].count += 1;
				}
			}
			
			//Initialize coordinates
			$(".PersonID"+this.id.toString()).css("left",this.x+"%");
			$(".PersonID"+this.id.toString()).css("top",this.y+"%");
			
			//Initialize event handlers:
			$(".peopleContainer").on("click",".PersonID"+this.id.toString(), this.id.toString(), personClicked);
			
			//Add person to group of all people
			peopleArray.push(this);
		}
		
		this.update = function(){
			this.x = this.x + 2*Math.random()-1;
			this.y = this.y + 2*Math.random()-1;
			if (this.x>100){this.x-=100;}
			if (this.y>100){this.y-=100;}
			if (this.x<0){this.x+=100;}
			if (this.y<0){this.y+=100;}
			$(".PersonID"+this.id.toString()).css("left",this.x+"%");
			$(".PersonID"+this.id.toString()).css("top",this.y+"%");
			if (this.boxType == "i"){
				this.timeInfected+=interval;
				if (this.timeInfected > infectionDuration){
					this.changeType();
				}
			}
		}
		
		this.addConnection = function(name){
			this.connections.push(name);
		}
		
		this.setColor = function(){
			if (this.boxType == "s"){
				this.color = "#000088";
			}else if (this.boxType == "i"){
				this.color = "#990000";
			}else if (this.boxType == "r"){
				this.color = "#005500";
			}else{
				this.color = "#00FF00";
			}
			$(".PersonID"+this.id.toString()).css("background-color",this.color);
		}
		
		this.changeType = function(){
			var oldType = this.boxType;
			
			if (this.boxType == "s"){
				this.boxType = "i";
				this.setColor();
			}else if (this.boxType == "i"){
				this.boxType = "r";
				this.setColor();
			}

			for (var i=0;i<boxesArray.length;i++){
				if (boxesArray[i].name == oldType){
					boxesArray[i].count-=1;
				}
				if (boxesArray[i].name == this.boxType){
					boxesArray[i].count+=1;
				}
			}
		}
		this.initialize();		
	}
	
	function Timeline(){
		this.initialize = function(){
			this.canvas = document.getElementsByClassName('timeline')[0];
			this.height = this.canvas.height;
			this.width= this.canvas.width;

			this.ctx = this.canvas.getContext("2d");
			
			xpos=5;
			ypos=5;
			canvasWidth=100;
			canvasHeight=100;
			
			//x axis
			this.ctx.beginPath();
			this.ctx.moveTo(xpos,ypos+canvasHeight);
			this.ctx.lineTo(xpos+canvasWidth,ypos+canvasHeight);
			this.ctx.strokeStyle="black";
			this.ctx.stroke();
			
			//y axis
			this.ctx.beginPath();
			this.ctx.moveTo(xpos,ypos);
			this.ctx.lineTo(xpos,ypos+canvasHeight);
			this.ctx.strokeStyle="black";
			this.ctx.stroke();
			
		};
		this.initialize();
	}
	
	function updatePeople(){
		for (var i=0;i<peopleArray.length;i++){
			peopleArray[i].update();
		}
	};
	
	function updateBoxes(){
		for (var i=0;i<=boxesArray.length;i++){
			boxesArray[i].resize();
		}
	}
	
	$(".addPersonButton").click(function(){
        var newPerson = new Person();
        peopleArray.push(newPerson);
    });
    
    $(".addIButton").click(function(){
        var newPerson = new Person();
        newPerson.changeType();
        peopleArray.push(newPerson);
    });
    
    function detectCollision(a,b){
    	//a and b need to be Person objects
    	var distance = Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
    	if (distance < collisionDistance){
    		return true;
    	};
    };
    
    function checkCollisions(){
    	//Brute force method
    	for (var i=0;i<peopleArray.length;i++){
    		for (var j=0;j<peopleArray.length;j++){
    			if (i!=j){
    				if(detectCollision(peopleArray[i],peopleArray[j])){
    					if (peopleArray[i].boxType == "i" && peopleArray[j].boxType == "s"){
	    					peopleArray[j].changeType();
	    				}else if (peopleArray[i].boxType == "s" && peopleArray[j].boxType == "i"){
	    					peopleArray[i].changeType();
	    				}
    				}
    			}
    		}	
    	}
    };
    
    function personClicked(event){
    	peopleArray[event.data].changeType();
    };
    
    function intervalFunctions(){
    	updatePeople();
    	checkCollisions();
    	updateBoxes();
    };
    
    function createStartingPop(s,i,r){
    	for (var a = 0;a<s;a++){
    		var newPerson = new Person("s");
    	};
    	for (var b = 0;b<i;b++){
    		var newPerson = new Person("i");
    	};
    	for (var c = 0;c<r;c++){
    		var newPerson = new Person("r");
    	};
    }
    
    function setUpBoxes(){
    	var sBox = new Box("s");
		var iBox = new Box("i");
		var rBox = new Box("r");
    };
    
    function toggleContainer(divName){
    	$(divName).toggle();
    };
    
    function canvasTest(tf){
    	if (tf == true){
    		toggleContainer(".timelineContainer");
    		toggleContainer(".boxModelContainer");
    		toggleContainer(".peopleContainer");
    	}
    };
    
	function init(){
		window.setInterval(function(){intervalFunctions()}, interval);
		setUpBoxes();
		createStartingPop(45,5,2);
		var timeline = new Timeline();
		//canvasTest(true);
	};
	
	//Start
	init();
});