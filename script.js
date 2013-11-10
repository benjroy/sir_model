$(document).ready(function(){
    
    $(".myImage").click(function(){
        $(".myImage").attr("src","res/img/airplane_vortex.jpg");
    });
    
    //Upon scroll, call a function to change scrollTopValue
    var scrollTopValue = $(window).scrollTop();
    var imageScrollY = 0;
    var imageHeight = 0;
    
    var startShowingImage = 300;
    var showWholeImage = 600;
    var startRemovingImage = 1200;
    var showNoMoreImage = 1500;
    
    var maxHeight = 500;
    var currentHeight = 0;
    
    var startTop = 300;
    var currentTop = startTop;
    var startLeft = 300;
    var currentLeft = startLeft;
    
    var imageHeight = 1555;	//Change to read from file
	
	var imageScrollString = "0px 0px";
	
	//Drift
	var drift = false;
	var yDriftSize = 200;
	var currentYDrift = 0;
	var xDriftSize = 400;
	var currentXDrift=0;
	if(drift==false){
		yDriftSize=0;
		xDriftSize=0;
	}
	
	//Upon scrolling the main window
    $(window).scroll(function(){
    	scrollTopValue = $(window).scrollTop();
    	$(".scrollTop").text(imageScrollY);
    	
    	if((scrollTopValue>startShowingImage)&&(scrollTopValue<showNoMoreImage)){
    		if(scrollTopValue<showWholeImage)
    		{//div growing
    			currentHeight = maxHeight*((scrollTopValue - startShowingImage)/(showWholeImage - startShowingImage));
    			currentTop = startTop;
    			currentLeft = startLeft;
    			imageScrollY = 0;
    		}
    		else if(scrollTopValue>startRemovingImage)
    		{//div shrinking
    			currentHeight = maxHeight*((showNoMoreImage - scrollTopValue)/(showNoMoreImage - startRemovingImage));
    			currentTop = startTop + maxHeight - currentHeight - yDriftSize;
    			currentLeft = startLeft + xDriftSize;
    			imageScrollY = currentHeight-imageHeight;
    		}
    		else
    		{//div at max size
    			currentYDrift = yDriftSize*(scrollTopValue - showWholeImage)/(startRemovingImage - showWholeImage);
    			currentXDrift = xDriftSize*(scrollTopValue - showWholeImage)/(startRemovingImage - showWholeImage);
    			currentHeight = maxHeight;
    			currentTop = startTop - currentYDrift;
    			imageScrollY = imageHeight*(-(scrollTopValue - showWholeImage)/(showNoMoreImage - showWholeImage));
    			currentLeft = startLeft + currentXDrift;
    		}
    	}else{
    		currentHeight = 0;
    		//imageScrollY = 0;
    	}
    	$(".testing").css("height",currentHeight.toString()+"px");
		$(".testing").css("top",currentTop.toString()+"px");
		$(".testing").css("left",currentLeft.toString()+"px");
		imageScrollString = "0px " + imageScrollY.toString() + "px";
		$(".testing").css("background-position", imageScrollString);
    });
    
	function init(){
	};
	
	//Start
	init();
});