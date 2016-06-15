/** Research Studios Austria - iSPACE 2016 **/

function setNone(name){
	var element = document.getElementById(name);
	element.style.display = 'none';
}

function toggleElem(name) {
	var element = document.getElementById(name);	
	var isHidden = element.style.display == 'none';
	
	element.style.display = isHidden ? 'block' : 'none';
	
	if(name == 'infoBar'){
		// Store the last legend state (open or close, to reload the app with this state)
		if(localStorageSupport){
			localStorage.setItem("legendOpenPolygonApp", isHidden);
		}
		
		if(isHidden){
			document.getElementById('basemapChangeBtn').style.left = document.getElementById('infoBar').offsetWidth + 30; // Move the change-background-map-button
		}
		else{
			document.getElementById('basemapChangeBtn').style.left = 30; // Set the background-map-button back to the bottom-left corner
		}
	}
}

function setNone(name){
	var elem = document.getElementById(name);
	elem.style.display = 'none';
}

function setBlock(name){
	var elem = document.getElementById(name);
	elem.style.display = 'block';
}