/** Research Studios Austria - iSPACE 2016 **/

// Global variables
// Map and its layers
var map;
var backgroundmap;
var osm;
var orthomap;
var wfst;
var wfstLayers;
var drawnItems;
var drawControl;
var toolbarContainer;
var newMarkerLayer; 
var locateControl;
var webSocketLayer;
var webSocketUrl;
var clickedLayerItem;
// Boolean variables
var isFirstLoad = true;
var edit = false; // Check if the user is in the edit-mode 
var create = false; // True if user starts creating a new polygon
var deletion = false; // True if user starts deleting polygons
var firstSocket = true;
// Protocol and local storage
var protocol = location.protocol;
var localStorageSupport;
var legendState;


function init(){
	// Check if local storage is supported
	if(typeof(Storage) !== "undefined") {
		localStorageSupport = true;
		// If the variable is already stored, use the state of this variable for open or close the legend-menu
		if(typeof(localStorage.legendOpenPolygonApp) != "undefined"){
			legendState = localStorage.legendOpenPolygonApp;
		}
		else{
			legendState = "true";
		}
	}
	else{
		localStorageSupport = false;
	}
	
	// Depending on the browser/user language (English/German) the tooltips are set 
	if(lang == "de"){
		document.getElementById("closeBtnInfoBar").title = "Schließen";
		document.getElementById("btnMinus").title = "Zoom-out";
		document.getElementById("btnHome").title = "Kartenausschnitt anpassen";
		document.getElementById("btnPlus").title = "Zoom-in";
		document.getElementById("newMarkerapplyButton").title = "Speichern";
		document.getElementById("newMarkercancleButton").title = "Abbrechen";
		document.getElementById("delMarkerapplyButton").title = "Speichern";
		document.getElementById("delMarkercancleButton").title = "Abbrechen";
		document.getElementById("locateDivTxt").title = "Meine Position";
		document.getElementById("settingsArea").title = "Legende Öffnen";
		document.getElementById("basemapChangeBtn").title = "Hintergrundkarte ändern";	
		document.getElementById("editMarkercancleButton").title = "Abbrechen";
		document.getElementById("editMarkerapplyButton").title = "Speichern";
		document.getElementById("cancelCreatePolyButton").title = "Abbrechen";
	}
	else{
		document.getElementById("closeBtnInfoBar").title = "Close";
		document.getElementById("btnMinus").title = "Zoom-out";
		document.getElementById("btnHome").title = "Fit Bounds";
		document.getElementById("btnPlus").title = "Zoom-in";
		document.getElementById("newMarkerapplyButton").title = "Save";
		document.getElementById("newMarkercancleButton").title = "Cancel";
		document.getElementById("delMarkerapplyButton").title = "Save";
		document.getElementById("delMarkercancleButton").title = "Cancel";
		document.getElementById("locateDivTxt").title = "My Location";
		document.getElementById("settingsArea").title = "Open Legend";
		document.getElementById("basemapChangeBtn").title = "Change Backgorund Map";
		document.getElementById("editMarkercancleButton").title = "Cancel";
		document.getElementById("editMarkerapplyButton").title = "Save";
		document.getElementById("cancelCreatePolyButton").title = "Cancel";
	}
	
	/** MAP **/
	map = L.map('map', {
		zoomControl: false, 
		attributionControl: false
	}).setView([45.512, -122.619], 12);
	
	// Set the right width/height of the menu when resize
	window.onresize=function(){
		if(document.getElementById('creatorMenu').style.display == 'block'){
			// Check if landscape or portrait screen
			if(window.innerWidth > window.innerHeight){
				if(document.getElementById('newMarkerDiv').style.display == 'block'){
					document.getElementById('creatorMenu').style.height = document.getElementById('creatorMenu').offsetHeight - 50; 
					document.getElementById('creatorMenu').style.width = document.getElementById('newMarkerDiv').offsetWidth;
				}
				else{
					document.getElementById('creatorMenu').style.width = '20%';
				}
				document.getElementById('navigation').style.right = document.getElementById('creatorMenu').offsetWidth + 30;
			}
			else{
				if(document.getElementById('newMarkerDiv').style.display == 'block'){
					document.getElementById('creatorMenu').style.height = document.getElementById('newMarkerDiv').offsetHeight;
				}
				else{
					document.getElementById('creatorMenu').style.height = '20%';
				}
				
				document.getElementById('navigation').style.right = 30;
			}
		}
	}; 
	
	// Set the OpenStreetMap as background-map
	osm = L.tileLayer(protocol + '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '<a href="https://osm.org/copyright">OpenStreetMap</a> | <a href="http://www.esri.com/">ESRI</a>'
	}).addTo(map);
	backgroundmap = "Street";
	
	// The ESRI orthophoto is used when the basemap is changed
	orthomap = L.esri.tiledMapLayer({
		url: protocol + "//services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
	});
	
	// Check if the legend was opened/closed in the previous session
	if(legendState == "false"){
		setNone('infoBar');
	}
	else{
		document.getElementById('basemapChangeBtn').style.left = document.getElementById('infoBar').offsetWidth + 30;
	}
	
	setNone('sw_source_txt');
	var dateNow = new Date();
	document.getElementById('dateNowTxt').innerHTML = dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getDate();

	/** DRAW CONTROL **/
	// Create a new featue-group for the polygons
	drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);
	
	drawControl = new L.Control.Draw({
		draw: {
			position: 'topleft',
			polygon: {
				title: 'Draw a polygon',
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000
				},
				shapeOptions: {
					color: '#ff7800', // Color for polygon when it is created
					weight: 3,
					opacity: 1, 
					fillOpacity: 0.3
				},
				showArea: true
			}, 
			circle: false,
			marker: false,
			polyline: false,
			rectangle: false
		},
		edit: {
			featureGroup: drawnItems
		}
	});
	map.addControl(drawControl);
	document.getElementById('editDiv').appendChild(drawControl._container); 
	toolbarContainer = drawControl.getContainer();
	
	/** GEOLOCATION **/
	var options = {
		drawCircle: true, 
		follow: false,
		setView: true,
		keepCurrentZoomLevel: false,
		markerClass: L.marker,
		circleStyle: { 
			color : "#ffffff",
			fillColor : "#00703C",
			fillOpacity : .15,
			weight : 2,
			opacity : .5, 
			className: "useDragMouse"
		}, 
		markerStyle: {
			icon: L.icon({iconUrl: 'images/location_transp.png', iconSize: [28, 44], popupAnchor: [0, -25] }) 
		},
		showPopup: true,
		strings: {
			title: (lang == "de") ? "Meine Position" : "My Location", 
			metersUnit: "meters",
			feetUnit: "feet",
			popup: (lang == "de") ? "Du bist innerhalb von {distance} Meter von diesem Punkt" : "You are within {distance} {unit} from this point",
			outsideMapBoundsMsg: (lang == "de") ? "Deine Position befindet sich außerhalb der Kartengrenzen" : "You seem located outside the boundaries of the map"
		}
	};
	locateControl = L.control.locate(options).addTo(map);
	document.getElementById('locateDiv').appendChild(locateControl._container);
	// Enable to relocate/disable per click on the location-button
	document.getElementById('locateDivTxt').onclick = function(){
		locateControl.markerDrawn() == true ? locateControl.stop() : locateControl.start();
	};
	
	/** WFST LAYER **/
	// Update wfst-layer using an interval of 30 seconds
	window.setInterval(function(){
		if(!create && !edit && !deletion){
			createWFST();
		}
	}, 30000);

	/** DRAW EVENTS **/
	map.on('draw:drawstart', function (e) { 
		create = true;
		
		// Close the additonal menu of the toolbar, because own buttons are used for saving/canceling
		toolbarContainer.childNodes[0].childNodes[1].style.display = "none";
		
		// Check if landscape or portrait screen and set menu height/width based on the format
		if(window.innerWidth > window.innerHeight){
			document.getElementById('creatorMenu').style.width = '20%';
		}
		else{
			document.getElementById('creatorMenu').style.height = '20%';
		}
		
		// Open menu
		setBlock("creatorMenu");
		setBlock("startNewMarkerDiv");
		// Move navigation area to the right position
		resetNavigation(); 
	});

	map.on('draw:editstart', function(e){
		edit = true;
		
		// Close the additonal menu of the toolbar, because own buttons are used for saving/canceling
		toolbarContainer.childNodes[1].childNodes[1].style.display = "none";
		
		// Check if landscape or portrait screen and set menu height/width based on the format
		if(window.innerWidth > window.innerHeight){
			document.getElementById('creatorMenu').style.width = '20%';
		}
		else{
			document.getElementById('creatorMenu').style.height = '20%';
		}
		
		// Open  menu
		setBlock("creatorMenu");
		setBlock("startEditDiv");
		// Move navigation area to the right position
		resetNavigation();
	});
	
	map.on('draw:deletestart', function (e) {
		deletion = true;
		// Close the additonal menu of the toolbar, because own buttons are used for saving/canceling
		toolbarContainer.childNodes[1].childNodes[1].style.display = "none";
		
		// Check if landscape or portrait screen and set menu height/width based on the format
		if(window.innerWidth > window.innerHeight){
			document.getElementById('creatorMenu').style.width = '20%';
		}
		else{
			document.getElementById('creatorMenu').style.height = '20%';
		}
		
		// Open menu
		setBlock("creatorMenu");
		setBlock("startRemoveDiv");
		// Move navigation area to the right position
		resetNavigation(); 
	});
	
	map.on('draw:created', function (e) {
		var layer = e.layer;
		drawnItems.addLayer(layer);
		setCreatorFieldsBlank();
		
		// Check if landscape or portrait screen and set menu height/width based on the format
		if(window.innerWidth > window.innerHeight){
			document.getElementById('creatorMenu').style.height = document.getElementById('creatorMenu').offsetHeight - 50; 
			document.getElementById('creatorMenu').style.width = document.getElementById('newMarkerDiv').offsetWidth; 
		}
		else{
			document.getElementById('creatorMenu').style.height = document.getElementById('newMarkerDiv').offsetHeight; 
		}
		
		// Store the drawing layer
		newMarkerLayer = layer; 
		wfst.addLayer(newMarkerLayer);	
		
		// Open menu 
		setBlock("newMarkerDiv");
		setNone("startNewMarkerDiv");
		// Move navigation area to the right position		
		resetNavigation(); 			
	});
	
	map.on('draw:edited', function (e) {
		edit = false;
		var layers = e.layers;
		
		layers.eachLayer(function (layer){
			wfst.editLayer(layer);
		});
		wfst.save(); // Save edits
		
		// Close the menu
		setNone("creatorMenu");
		setNone("startEditDiv");
		// Move navigation area to the right position
		resetNavigation(); 
	});
	
	map.on('draw:deleted', function (e) {
		deletion = false;
		var layers = e.layers;
		
		layers.eachLayer(function (layer) {
			wfst.removeLayer(layer);
		});
		wfst.save();
		
		// Close menu
		setNone("creatorMenu");
		setNone("startRemoveDiv");
		// Move navigation area to the right position
		resetNavigation(); 
	});
	
	map.on('draw:canceled', function (e) { 
		// Close menu
		setNone("creatorMenu");
		setNone("startNewMarkerDiv");
		setNone("startEditDiv");
		setNone("startRemoveDiv");
		setNone("newMarkerDiv");
		
		setCreatorFieldsBlank();
		edit = false;
		create = false; 
		deletion = false;
		// Move navigation area to the right position
		resetNavigation(); 
	});
	
	/** EVENTS OF OWN SAVE/CANCEL-BUTTONS **/	
	// Save the created polygon
	var okBtnNewMarker = document.getElementById('newMarkerapplyButton');
	okBtnNewMarker.onclick=function(){
		if(create){
			if(newMarkerLayer.feature){
				// Store the values from the input fields
				newMarkerLayer.feature.properties.name_geofence = document.getElementById('nameTextbox').value || null;
				newMarkerLayer.feature.properties.description_geofence = document.getElementById('descriptionTextbox').value || null;
				
				setCreatorFieldsBlank();
				wfst.editLayer(newMarkerLayer);
				wfst.save();
			}
		}
		
		// Close menu
		setNone("creatorMenu");
		setNone("newMarkerDiv");
		create = false;
		// Move navigation area to the right position
		resetNavigation(); 
	};
	
	// Cancel the creation of a polygon
	var cancelNewPolyBtn = document.getElementById('cancelCreatePolyButton');
	cancelNewPolyBtn.onclick = function(){
		// Perform click on invisible "cancel" button of the draw-toolbar (create-button)
		toolbarContainer.childNodes[0].childNodes[1].childNodes[1].childNodes[0].click();
	};
	
	// Cancel creation of polygon that is already drawn on map but not stored
	var cancelBtnNewMarker = document.getElementById('newMarkercancleButton');
	cancelBtnNewMarker.onclick=function(){
		if(create){
			drawnItems.removeLayer(newMarkerLayer);
			wfst.removeLayer(newMarkerLayer);
			create = false;
			setCreatorFieldsBlank();
			// Close menu
			setNone("creatorMenu");
			setNone("startNewMarkerDiv");
			setNone("startEditDiv");
			setNone("newMarkerDiv");
		}
		// Move navigation area to the right position	
		resetNavigation(); 
	};
	
	// Save deletion of a polygon
	var okDeleteBtnMarker = document.getElementById('delMarkerapplyButton');
	okDeleteBtnMarker.onclick=function(){
		// Perform click on invisible "save"-button of the draw-toolbar (deletion-button)
		toolbarContainer.childNodes[1].childNodes[1].childNodes[0].childNodes[0].click();
		resetNavigation();
	};
	
	// Cancel the deletion
	var cancelDeleteBtnMarker = document.getElementById('delMarkercancleButton');
	cancelDeleteBtnMarker.onclick=function(){
		// Perform click on invisible "cancel"-button of the draw-toolbar (deletion-button)
		toolbarContainer.childNodes[1].childNodes[1].childNodes[1].childNodes[0].click();
		resetNavigation();
	};
	
	// Save editing of a polygon
	var saveEditBtnMarker = document.getElementById('editMarkerapplyButton');
	saveEditBtnMarker.onclick=function(){
		// Perform click on invisible "save"-button of the draw-toolbar (edit-button)
		toolbarContainer.childNodes[1].childNodes[1].childNodes[0].childNodes[0].click();
		resetNavigation();
	};
	
	// Cancel editing of a polygon
	var cancelEditBtnMarker = document.getElementById('editMarkercancleButton');
	cancelEditBtnMarker.onclick=function(){
		// Perform click on invisible "cancel"-button of the draw-toolbar (edit-button)
		toolbarContainer.childNodes[1].childNodes[1].childNodes[1].childNodes[0].click();
		resetNavigation();
	};

	createWFST();
	createWebSocket();
}

/** FUNCTIONS **/
function createWFST(){
	var myStyle = {
		"color": "#49A93C", // Color of polygons
		"weight": 3,
		"opacity": 1, 
		"fillOpacity": 0.3
	};

	wfst = new L.WFST({
		url: protocol + '//ispacevm30.researchstudio.at/geoserver/focus/ows',
		typeNS: 'focus',
		typeName: 'leaflet_polygon_github',
		crs: L.CRS.EPSG4326, 
		geometryField: 'shape', 
		style: myStyle
	});

	wfst.on('load', function (e) {
		drawnItems.clearLayers();
		wfstLayers = e.target;
		// Loop through all layers of the wfst-layer
		e.target.eachLayer(function (layer) {
			var feature = layer.toGeoJSON();
			drawnItems.addLayer(layer);
			
			if (!wfst.hasLayer(layer)) {
				wfst.addLayer(layer);
			}
			
			// Create popup
			var popupOptions = {maxWidth: 200};
			layer.bindPopup("<b>ID: </b>" + feature.properties.objectid +
					"<br><b>Name: </b>"	+ feature.properties.name_geofence +
					"<br><b>" + langData[lang]["labelDescription"] + ": </b>"	+ feature.properties.description_geofence +
					"<br><table border='0'><tr><td width='60px'><div onclick='startEditForLayer(clickedLayerItem, true);'><text class='icon-pencil fontIcon mainColorTxt hoverTextMain'></text></div></td><td><div onclick='deleteLayer(clickedLayerItem)'><text class='icon-bin2 fontIcon mainColorTxt hoverTextMain'></text></div></td></tr></table>", popupOptions);
		});

		// Only on first load: fit the extent to the drawnItems-layer
		if (isFirstLoad) {
			map.fitBounds(drawnItems);
			isFirstLoad = false;
			locateControl.start();
		}
	});

	wfst.on('click', function (e) {
		clickedLayerItem = e.layer;
		
		if(edit){
			setBlock("newMarkerDiv");
			setNone("startEditDiv");
			document.getElementById('creatorMenu').style.height = document.getElementById('newMarkerDiv').offsetHeight;
		}
	});
	
	wfst.on('save:success', function (data) {
		if(lang == "de"){
			alert("Eintrag erfolgreich gespeichert!");
		}
		else{
			alert("Entry successfully saved!");
		}
	});
}

function createWebSocket(){
	webSocketLayer = new L.FeatureGroup();
	map.addLayer(webSocketLayer);
	webSocketUrl = "wss://ispacevm20.researchstudio.at/geo-websocket/geofence";
	
	// Connect socket
	if ("WebSocket" in window){
		console.log("WebSocket supported");
		connection = new WebSocket(webSocketUrl); 
		
		connection.onopen = function(){
			console.log("Opened web socket");
		};
		
		connection.onclose = function(m){
			console.log("Closed web socket",m);
			connection = null;
		};
		
		connection.onerror = function(err){
			console.log("Error: ", err);
			connection = null;
		};
		
		connection.onmessage = function(e){
			var str = e.data.toString();
			
			// Because there can be messages that are not JSON-format (e.g. "XY has entered that chat"), it is checked, if the data-string starts with "{"
			if(str.startsWith('{')){
				// Each time clear the old point (except the first time)
				if(!firstSocket){
					webSocketLayer.clearLayers();
				}
				
				var replacedStr = str.replace(/&quot;/g, "\""); // Because the JSON uses '&quot;' instead of '"', it is replaced by the right sign
				msgarray = JSON.parse(replacedStr); // Make JSON from the valid string
				
				var jsonLayer = L.geoJson(msgarray, {
					onEachFeature: function (feature, layer) {
						// Create popup
						var popupOptions = {maxWidth: 200};
						layer.bindPopup("<b>ID: </b>" + feature.properties.objectid +
							"<br><b>Name: </b>"	+ feature.properties.samplingFOIName +
							"<br><b>" + langData[lang]["labelZeit"] + ": </b>"	+ feature.properties.observationPhenomenonTime, popupOptions);
					},
					pointToLayer: function (feature, latlng) {
						// Check if point is inside a polygon
						var polyInside = false;
						wfstLayers.eachLayer(function (layer) {
							if(isMarkerInsidePolygon(latlng, layer)){
								polyInside = true;
							}
						});
						
						var pulseIcon; // Using a marker with a pulsing effect animation for showing the actual position
						// Use different symbols depending on if the point is inside or outside of a polygon
						if(polyInside == false){
							pulseIcon = L.divIcon({className: 'pulseInsidePolygon', iconSize: [20,20]});
						}
						else{
							pulseIcon = L.divIcon({className: 'pulseOutsidePolygon', iconSize: [20,20]});
						}
					
						return L.marker(latlng, {icon: pulseIcon});
					}
				});
	
				webSocketLayer.addLayer(jsonLayer);
				
				if(firstSocket){
					firstSocket = false;
				}
			}
		};

	}
	else{
		console.log("WebSocket not supported");
	}
}

function zoomIn(){
	map.zoomIn();
}

// Set back the map extent to fit the bounds
function setInitialExtent(){
	map.fitBounds(drawnItems);
}

function zoomOut(){
	map.zoomOut();
}

function changeBasemap(){
	// If the actual map ist from type "street", then the orthophoto is set as new basemap, else the "street" map is set as basemap and the orthophoto removed
	if(backgroundmap == "Street"){
		backgroundmap = "Ortho";
		document.getElementById('basemapImg').src = "images/streetB.png";
		map.removeLayer(osm);
		map.addLayer(orthomap);
	}
	else{
		backgroundmap = "Street";
		document.getElementById('basemapImg').src = "images/satB.png";
		map.removeLayer(orthomap);
		map.addLayer(osm);
	}
}

function textToFloat(text){
	if(isNaN(text) || text == null || text == "" || text == 0){
		return -9999;
	}
	else{
		return parseFloat(text);
	}
}

function checkValue(val){
	if(val == -9999 || val == null || val == ""){
		return true; // No value
	}
	else{
		return false; // Value
	}
}

// Check if the value is null and return an empty string instread
function checkIfNull(value){
	if(value == null){
		return "";
	}
	else{
		return value;
	}
}

// Set back all input-fields to their initial (blank) format
function setCreatorFieldsBlank(){
	document.getElementById('nameTextbox').value = "";
	document.getElementById('descriptionTextbox').value = "";
}

function startEditForLayer(layer, fromPopup){	
	layer.closePopup(); // Don't show popups during an editing-session
	
	// Only when edit is started from the popup window
	if(fromPopup){
		// Perform click on edit-button
		toolbarContainer.childNodes[1].childNodes[0].childNodes[0].click();
	}
}

function deleteLayer(layer){
	var text = lang == "de" ? "Wollen Sie diesen Eintrag wirklich unwiderruflich löschen?" : "Do you want to delete the entry irretrievable?";
	if(confirm(text)){
		wfst.removeLayer(layer);
		wfst.save();
	}
	else{
		layer.closePopup();
	}
}

// Move the navigation-area to the right position
function resetNavigation(){
	if(document.getElementById('creatorMenu').style.display == 'block'){
		// Check if landscape or portrait screen and set the navigation area based on the format and distances
		if (window.innerWidth > window.innerHeight){
			document.getElementById('navigation').style.right = document.getElementById('creatorMenu').offsetWidth + 30;
		}
		else{
			document.getElementById('navigation').style.right = 30;
		}
	}
	else{
		document.getElementById('navigation').style.right = 30;
	}
}

function isMarkerInsidePolygon(marker, poly) {
    var polyPoints = poly.getLatLngs();       
	var x = marker.lat, y = marker.lng;

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};