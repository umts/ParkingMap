//map vars
var geoError;
var map;
var infowindow = new google.maps.InfoWindow({
	// disableAutoPan: true,
	maxWidth: 1000,
	app: 0
});
var directionInfoWindow = new google.maps.InfoWindow({
	// disableAutoPan: true,
	maxWidth: 1000,
	app: 1
});
var defaultInfoWindow;
var overlays = [];
var lots = [];
var buildings = [];
var buildingResults = [];
var unknownBuildings = [];
var placeMarkers = [];
var mouseDown = false;
var dragging = false;
var updatingChildCheckBoxes = false;
var coloredSvg;
var viewbox = "0 0 4030 5032";
var displayOverlay;
var clickableOverlay;
var imageBounds;
var placeSearch, jump_autocomplete, start_autocomplete, end_autocomplete;
var start, end;
var mobile = false;
var zooming = false;

var iconScaler = 1;

Overlay.prototype = new google.maps.OverlayView();
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

//do all the heavy lifting and setup

window.onload = function(){
    window.document.body.onload = initialize();
};

function initialize() {
	var umass = new google.maps.LatLng(42.391335, -72.526825);

	imageBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(42.37373233293279, -72.54042060966492),
		new google.maps.LatLng(42.40323443227949, -72.50867035980224));

	var mapOptions = {
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		panControl: true,
			panControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		scaleControl: true,
		scaleControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		streetViewControl: true,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		draggable: true,
		zoom: 15,
		center: umass
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	//autocompletes for jumping and directions
	jump_autocomplete = new google.maps.places.SearchBox(
		document.getElementById('jump_autocomplete'), {bounds: imageBounds});
	// When the user selects an address from the dropdown, jump to it
	google.maps.event.addListener(jump_autocomplete, 'place_changed', function() {
		jumpTo(jump_autocomplete.getPlace())
	});
	google.maps.event.addListener(jump_autocomplete, 'places_changed', function() {
		//TODO this
		// if($('#jump_autocomplete').val().toLowerCase() == 'minuteman')
		// 	showMinuteMan();
		// else
			showPlaces(jump_autocomplete.getPlaces());
	});

	start_autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('start_autocomplete'), {bounds: imageBounds});
	// When the user selects an address from the dropdown, set the start value to it
	google.maps.event.addListener(start_autocomplete, 'place_changed', function() {
		setStart(start_autocomplete.getPlace())
	});

	end_autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('end_autocomplete'), {bounds: imageBounds});
	// When the user selects an address from the dropdown, set the start value to it
	google.maps.event.addListener(end_autocomplete, 'place_changed', function() {
		setEnd(end_autocomplete.getPlace())
	});

	//lot list
	lots['lot11'] = {name: 'Lot 11', twentyFour: false, handicapped: true, motorcycle: false, color : 'Yellow', zoom: 16 };
	lots['lot12'] = {name: 'Lot 12', twentyFour: false, handicapped: false, motorcycle: false, color : 'Yellow', zoom: 16 };
	lots['lot13'] = {name: 'Lot 13', twentyFour: false, handicapped: true, motorcycle: false, color : 'Yellow', zoom: 16 };

	//TODO missing 14, it's metered?
	lots['lot14'] = {name: 'Lot 14', metered: true, handicapped: true, motorcycle: false, color: 'Metered', zoom: 16 }

	lots['lot20'] = {name: 'Lot 20', twentyFourSeven: true, twentyFour: false, handicapped: false, motorcycle: false, color : 'Purple', zoom: 16 };
	lots['lot21'] = {name: 'Lot 21', twentyFour: true, handicapped: false, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot22'] = {name: 'Lot 22', twentyFourSeven: true, twentyFour: false, handicapped: true, motorcycle: true, color : 'Purple', zoom: 16 };
	lots['lot23'] = {name: 'Lot 23', twentyFour: true, handicapped: false, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot24'] = {name: 'Lot 24', twentyFour: false, handicapped: false, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot25'] = {name: 'Lot 25', twentyFour: false, handicapped: true, motorcycle: true, color : 'Green', zoom: 16 };
	lots['lot26'] = {name: 'Lot 26', twentyFour: false, handicapped: false, motorcycle: false, color : 'Green', zoom: 16 };
	lots['lot27'] = {name: 'Lot 27', twentyFour: false, handicapped: false, motorcycle: false, color : 'Green', zoom: 16 };
	lots['lot28'] = {name: 'Lot 28', twentyFour: true, handicapped: false, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot29'] = {name: 'Lot 29', twentyFour: true, handicapped: true, motorcycle: true, color : 'Blue', zoom: 16 };
	lots['lot30'] = {name: 'Lot 30', twentyFour: false, handicapped: false, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot31'] = {name: 'Lot 31', twentyFour: false, handicapped: false, motorcycle: true, color : 'Blue', zoom: 16 };
	lots['lot32'] = {name: 'Lot 32', twentyFour: false, handicapped: true, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot33'] = {name: 'Lot 33', twentyFour: false, handicapped: true, motorcycle: false, color : 'Green', zoom: 16 };
	lots['lot34'] = {name: 'Lot 34', twentyFour: false, handicapped: true, motorcycle: true, color : 'Green', zoom: 16 };
	lots['lot35'] = {name: 'Lot 35', twentyFour: true, handicapped: true, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot36'] = {name: 'Lot 36', twentyFour: true, handicapped: false, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot39'] = {name: 'Lot 39', twentyFour: true, handicapped: false, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot41'] = {name: 'Lot 41', twentyFour: false, handicapped: true, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot42'] = {name: 'Lot 42', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot43'] = {name: 'Lot 43', twentyFour: false, handicapped: true, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot44'] = {name: 'Lot 44', twentyFourSeven: true, twentyFour: false, handicapped: true, motorcycle: true, color : 'Purple', zoom: 16 };
	lots['lot45'] = {name: 'Lot 45', twentyFour: false, handicapped: false, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot46'] = {name: 'Lot 46', twentyFour: false, handicapped: true, motorcycle: false, color : 'Blue', zoom: 16 };
	lots['lot47'] = {name: 'Lot 47', twentyFour: true, handicapped: true, motorcycle: true, color : 'Blue', zoom: 16 };
	lots['lot49'] = {name: 'Lot 49', twentyFourSeven: true, twentyFour: false, handicapped: true, motorcycle: true, color : 'Purple', zoom: 16 };
	lots['lot50'] = {name: 'Lot 50', twentyFour: true, handicapped: true, motorcycle: true, color : 'Blue', zoom: 16 };
	lots['lot52'] = {name: 'Lot 52', twentyFour: false, handicapped: true, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot54'] = {name: 'Lot 54', twentyFour: true, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot62'] = {name: 'Lot 62', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot63'] = {name: 'Lot 63', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot64'] = {name: 'Lot 64', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot65'] = {name: 'Lot 65', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot66'] = {name: 'Lot 66', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['lot67'] = {name: 'Lot 67', twentyFour: true, handicapped: true, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot68'] = {name: 'Lot 68', twentyFour: false, handicapped: false, motorcycle: false, color : 'Red', zoom: 16 };
	lots['lot71'] = {name: 'Lot 71', twentyFour: false, handicapped: true, motorcycle: true, color : 'Red', zoom: 16 };
	lots['garage'] = {name: 'Parking Garage', twentyFour: true, color : 'purple', zoom: 16, type: 'garage' };

	//select drop downs for the lots
	var select1 = $('#jump_A')[0];
	var lotOptions = document.createElement('select');

	var option = document.createElement("option");
	option.textContent = '';
	option.value = '';
	select1.appendChild($(option).clone()[0]);

	// var myLoc = document.createElement("option");
	option.textContent = 'My Location';
	option.value = 'me';
	select1.appendChild($(option).clone()[0]);

	var overlaySvg = getSvg('overlaySvg');
	var clickableSvg = overlaySvg.cloneNode(false);

	//create clickable layer and search options
	$(overlaySvg).find('#redlayer, #bluelayer, #greenlayer, #yellowlayer, #purplelayer, #meteredlayer, #garagelayer, #pedestrianlayer, #rentallayer').each(function(){
		//clone layer
		var clone = $(this).clone(true,true)[0];

		//do stuff with clones children
		$(clone).children().each(function(){
			var parentId = $(this).parent()[0].id;
			var text = '';
			var zoom = 16;

			//if this path/group belonged is specially named
			if(this.className.baseVal == 'lot'){
				//get lot info
				var lot = lots[this.id];

				//create search option and create popup text
				if(lot != null){
					var searchOpt = document.createElement("option");
					searchOpt.textContent = lot.name;
					searchOpt.value = this.id;
					lotOptions.appendChild(searchOpt);

					text = getLotInfo(lot);
					zoom = lot.zoom;
				}
			}
			else if(parentId == 'meteredlayer')
				text = getLotInfo('metered');//'Metered Parking Lot<br/>Current Rate: $1/hr<br/>Free M-F from 5p-7a, Sat & Sun all day';
			else if(parentId == 'pedestrianlayer')
				text = getLotInfo('pedestrian');//'Pedestrian Only Zone<br/>No Parking';
			else if(this.className.baseVal == 'zip')
				text = getLotInfo('zip');
			else if(this.className.baseVal == 'enterprise')
				text = getLotInfo('enterprise');

			//create events for all child paths
			var paths;
			if($(this).is('path') || $(this).is('use'))
				paths = this;
			else
				paths = $(this).find('path, use');
			$(paths).click(function(event){
				if(!dragging){
					jumpAndAlert(event/*.target*/, text, zoom);
					event.preventDefault();
					return false;
				}
				else
					dragging=false;
			});
		});
		
		// $(clone).children().addClass('clickable');
		// console.log(clone);
		clone.className.baseVal = clone.className.baseVal + " clickable";
		clone.className.animVal = clone.className.animVal + " clickable";
		clone.id = clone.id+'clickable';
		// console.log(clone);
		clickableSvg.appendChild(clone);
	});

	//sort lot options and append to jump_A
	$(select1).append($(lotOptions).find('option').sort(function (a, b) {
				return a.value == b.value ? 0 : a.value < b.value ? -1 : 1
			}));


	clickableSvg.setAttribute("fill-opacity","0");
	clickableSvg.setAttribute("stroke-opacity","0");

	displayOverlay = new Overlay(imageBounds, overlaySvg, false, map);
	clickableOverlay = new Overlay(imageBounds, clickableSvg, true, map);


	// options for direction display
	var pOptions = {
		map: map,
		strokeColor: "#00B8E6",//"cyan",//"#2249a3",
		strokeOpacity: 0.6,
		strokeWeight: 8,
		position: 'absolute',
		zindex: 9999
	};
	var mDirectionsRendererOptions = {
		map: map,
		// suppressMarkers: true,
		// suppressInfoWindows: true,
		polylineOptions: pOptions,
		infoWindow: directionInfoWindow
	};

	directionsDisplay = new google.maps.DirectionsRenderer(mDirectionsRendererOptions);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('directions-show'))

	//building data converted to lat/lng pairs by building name
	buildings.push({name: "Agricultural Engineering Bldg", location: new google.maps.LatLng(42.3919463,-72.53111999999999)});
	buildings.push({name: "Arnold House", location: new google.maps.LatLng(42.3944121,-72.52605870000002)});
	buildings.push({name: "Auxilary Services Warehouse ", location: new google.maps.LatLng(42.39399359999999,-72.53528489999997)});
	buildings.push({name: "Bartlett Hall", location: new google.maps.LatLng(42.38794559999999,-72.52854730000001)});
	buildings.push({name: "Berkshire House", location: new google.maps.LatLng(42.3855158,-72.52895160000003)});
	buildings.push({name: "Blaisdell", location: new google.maps.LatLng(42.3900367,-72.53071950000003)});
	buildings.push({name: "Studio Arts Building ", location: new google.maps.LatLng(42.3875142,-72.52263599999998)});
	buildings.push({name: "Bowditch Lodge", location: new google.maps.LatLng(42.3813886,-72.5345489)});
	buildings.push({name: "Boyden", location: new google.maps.LatLng(42.3863606,-72.53053940000001)});
	buildings.push({name: "Campus Center", location: new google.maps.LatLng(42.3917852,-72.52703099999997)});
	buildings.push({name: "Bowditch Hall", location: new google.maps.LatLng(42.3926789,-72.53192159999998)});
	buildings.push({name: "Central Heating Plant ", location: new google.maps.LatLng(42.3899826,-72.53715060000002)});
	buildings.push({name: "Clark Hall", location: new google.maps.LatLng(42.3890918,-72.5237396)});
	buildings.push({name: "Chancellors House", location: new google.maps.LatLng(42.3915019,-72.52120450000001)});
	buildings.push({name: "Chenoweth Laboratory", location: new google.maps.LatLng(42.3918696,-72.5303849)});
	buildings.push({name: "Communication Disorders ", location: new google.maps.LatLng(42.3827218,-72.52079549999996)});
	buildings.push({name: "Commonwealth Honors College", location: new google.maps.LatLng(42.38786940000001,-72.5306802)});
	buildings.push({name: "Curry Hicks", location: new google.maps.LatLng(42.3871679,-72.52836530000002)});
	buildings.push({name: "Conte Polymer Center", location: new google.maps.LatLng(42.394391,-72.5281038)});
	buildings.push({name: "Dickinson Hall", location: new google.maps.LatLng(42.3890328,-72.5304236)});
	buildings.push({name: "Dickinson House", location: new google.maps.LatLng(42.3903667,-72.51923469999997)});
	buildings.push({name: "Computer Science Bldg", location: new google.maps.LatLng(42.3951291,-72.53123719999996)});
	buildings.push({name: "Draper Hall", location: new google.maps.LatLng(42.3922694,-72.52841480000001)});
	buildings.push({name: "East Experiment Station", location: new google.maps.LatLng(42.3932987,-72.525576)});
	buildings.push({name: "Engineering Laboratory", location: new google.maps.LatLng(42.3947416,-72.53050250000001)});
	buildings.push({name: "Flint Laboratory", location: new google.maps.LatLng(42.3916396,-72.52964380000003)});
	buildings.push({name: "Farley Lodge", location: new google.maps.LatLng(42.381135,-72.53470519999996)});
	buildings.push({name: "Fine Arts Center", location: new google.maps.LatLng(42.388056417182675, -72.5260820281029)});
	buildings.push({name: "Fernald Hall", location: new google.maps.LatLng(42.388543,-72.522401)});
	buildings.push({name: "French Hall", location: new google.maps.LatLng(42.3899535,-72.52293220000001)});
	buildings.push({name: "Gunness Lab ", location: new google.maps.LatLng(42.3945027,-72.52968499999997)});
	buildings.push({name: "Franklin Dining Common", location: new google.maps.LatLng(42.3892436,-72.52251669999998)});
	buildings.push({name: "Health Center", location: new google.maps.LatLng(42.3904035,-72.52159460000001)});
	buildings.push({name: "Herter Hall", location: new google.maps.LatLng(42.3877501,-72.52730120000001)});
	buildings.push({name: "Hatch Laboratory", location: new google.maps.LatLng(42.3924838,-72.53031659999999)});
	buildings.push({name: "Hills", location: new google.maps.LatLng(42.3876255,-72.52189349999998)});
	buildings.push({name: "Hillel House ", location: new google.maps.LatLng(42.3839232,-72.52155570000002)});
	buildings.push({name: "Hampshire House", location: new google.maps.LatLng(42.3851257,-72.5286299)});
	buildings.push({name: "Hampshire Dining Common ", location: new google.maps.LatLng(42.38382499999999,-72.53053160000002)});
	buildings.push({name: "Hasbrouck Laboratory", location: new google.maps.LatLng(42.3917693,-72.5259125)});
	buildings.push({name: "John Quincy Adams Tower", location: new google.maps.LatLng(42.382236,-72.52914399999997)});
	buildings.push({name: "Institute for Holocaust", location: new google.maps.LatLng(42.3956789,-72.5275964)});
	buildings.push({name: "Integrated Science Building ", location: new google.maps.LatLng(42.3924294,-72.52476300000001)});
	buildings.push({name: "Integrative Learning Center", location: new google.maps.LatLng(42.3910308,-72.52593179999997)});
	buildings.push({name: "Isenberg School of Management", location: new google.maps.LatLng(42.386697,-72.52489300000002)});
	buildings.push({name: "Knowles Engineering Bldg", location: new google.maps.LatLng(42.393249,-72.52896679999998)});
	buildings.push({name: "Life Sciences Laboratories", location: new google.maps.LatLng(42.392058,-72.523706)});
	buildings.push({name: "Mather Building", location: new google.maps.LatLng(42.3945273,-72.51108479999999)});
	buildings.push({name: "Machmer Hall", location: new google.maps.LatLng(42.3903279,-72.52892750000001)});
	buildings.push({name: "Marston Hall", location: new google.maps.LatLng(42.3940094,-72.5293734)});
	buildings.push({name: "Morrill 1", location: new google.maps.LatLng(42.3898138,-72.52436999999998)});
	buildings.push({name: "Memorial Hall", location: new google.maps.LatLng(42.3883885,-72.5275777)});
	buildings.push({name: "Mass Ventures ", location: new google.maps.LatLng(42.36458469999999,-72.54659449999997)});
	buildings.push({name: "Montague House", location: new google.maps.LatLng(42.3977381,-72.52688669999998)});
	buildings.push({name: "Morrill 2", location: new google.maps.LatLng(42.391472,-72.525238)});
	buildings.push({name: "Morrill 4", location: new google.maps.LatLng(42.3898138,-72.52436999999998)});
	buildings.push({name: "Morrill 3", location: new google.maps.LatLng(42.3898138,-72.52436999999998)});
	buildings.push({name: "Old Chapel", location: new google.maps.LatLng(42.3889651,-72.52797799999996)});
	buildings.push({name: "New Africa House", location: new google.maps.LatLng(42.3889411,-72.52068459999998)});
	buildings.push({name: "Munson Hall", location: new google.maps.LatLng(42.38653559999999,-72.52766830000002)});
	buildings.push({name: "Mullins Center", location: new google.maps.LatLng(42.389382,-72.5334464)});
	buildings.push({name: "Paige Laboratory", location: new google.maps.LatLng(42.3933152,-72.52984759999998)});
	buildings.push({name: "Parks Marching Band Building ", location: new google.maps.LatLng(42.389653,-72.53066100000001)});
	buildings.push({name: "Physical Plant", location: new google.maps.LatLng(42.3913083,-72.53258870000002)});
	buildings.push({name: "Recreation Center", location: new google.maps.LatLng(42.3890387,-72.53209629999998)});
	buildings.push({name: "Police Station", location: new google.maps.LatLng(42.397979,-72.51496759999998)});
	buildings.push({name: "Renaissance Center", location: new google.maps.LatLng(42.4016748,-72.517088)});
	buildings.push({name: "Robsham Visitor's Center", location: new google.maps.LatLng(42.3851029,-72.52426760000003)});
	buildings.push({name: "Skinner Hall", location: new google.maps.LatLng(42.3915641,-72.52478280000003)});
	buildings.push({name: "Research Admininstration ", location: new google.maps.LatLng(42.3876254,-72.52189349999998)});
	buildings.push({name: "Student Union", location: new google.maps.LatLng(42.3908452,-72.52756690000001)});
	buildings.push({name: "Stockbridge Hall", location: new google.maps.LatLng(42.3921974,-72.52951960000001)});
	buildings.push({name: "Thoreau House", location: new google.maps.LatLng(42.384349728505164, -72.53025286312106)});
	buildings.push({name: "Thompson Hall", location: new google.maps.LatLng(42.3900617,-72.52998209999998)});
	buildings.push({name: "Tobin Hall", location: new google.maps.LatLng(42.3874534,-72.52959279999999)});
	buildings.push({name: "Tillson Farm ", location: new google.maps.LatLng(42.398346,-72.51606800000002)});
	buildings.push({name: "W.E.B. Du Bois Library", location: new google.maps.LatLng(42.38983899999999,-72.52823599999999)});
	buildings.push({name: "University Bus Garage", location: new google.maps.LatLng(42.394206,-72.53351520000001)});
	buildings.push({name: "West Experiment Station", location: new google.maps.LatLng(42.3933912,-72.52655419999996)});
	buildings.push({name: "Whitmore Admininstration Bldg", location: new google.maps.LatLng(42.3860307,-72.52676029999998)});
	buildings.push({name: "Wilder Hall", location: new google.maps.LatLng(42.39029540000001,-72.52373620000003)});
	buildings.push({name: "Wysocki House", location: new google.maps.LatLng(42.400988,-72.52765440000002)});
	buildings.push({name: "Birch Hall", location: new google.maps.LatLng(42.3880133,-72.53128770000001)});
	buildings.push({name: "Worcester Dining Commons", location: new google.maps.LatLng(42.39358989999999,-72.52429710000001)});
	buildings.push({name: "Baker Hall", location: new google.maps.LatLng(42.3895677,-72.51981899999998)});
	buildings.push({name: "Butterfield Hall", location: new google.maps.LatLng(42.388535,-72.51818309999999)});
	buildings.push({name: "Brown Hall", location: new google.maps.LatLng(42.3975058,-72.52293939999998)});
	buildings.push({name: "Brett Hall", location: new google.maps.LatLng(42.3894571,-72.5215619)});
	buildings.push({name: "Brooks Hall", location: new google.maps.LatLng(42.3898921,-72.5210156)});
	buildings.push({name: "Cance Hall", location: new google.maps.LatLng(42.3834209,-72.53137329999998)});
	buildings.push({name: "Cashin Hall", location: new google.maps.LatLng(42.3974806,-72.52181530000001)});
	buildings.push({name: "Chadbourne Hall", location: new google.maps.LatLng(42.3893429,-72.51909289999998)});
	buildings.push({name: "Dwight Hall", location: new google.maps.LatLng(42.3954196,-72.52521580000001)});
	buildings.push({name: "Elm Hall", location: new google.maps.LatLng(42.3878231,-72.52997340000002)});
	buildings.push({name: "Field Hall", location: new google.maps.LatLng(42.3917334,-72.5185879)});
	buildings.push({name: "Coolidge Hall", location: new google.maps.LatLng(42.3836362,-72.52988929999998)});
	buildings.push({name: "Crabtree Hall", location: new google.maps.LatLng(42.3940168,-72.52504060000001)});
	buildings.push({name: "Crampton Hall", location: new google.maps.LatLng(42.3832846,-72.52909110000002)});
	buildings.push({name: "Emerson Hall", location: new google.maps.LatLng(42.3834209,-72.53137329999998)});
	buildings.push({name: "Kennedy Hall", location: new google.maps.LatLng(42.3840782,-72.5296366)});
	buildings.push({name: "John Quincy Adams Hall", location: new google.maps.LatLng(42.3822277,-72.52915410000003)});
	buildings.push({name: "Grayson Hall", location: new google.maps.LatLng(42.3922389,-72.51895760000002)});
	buildings.push({name: "Johnson Hall", location: new google.maps.LatLng(42.39556090000001,-72.524516)});
	buildings.push({name: "Hamlin Hall", location: new google.maps.LatLng(42.3950558,-72.5264156)});
	buildings.push({name: "Greenough Hall", location: new google.maps.LatLng(42.3899945,-72.51929280000002)});
	buildings.push({name: "James Hall", location: new google.maps.LatLng(42.3841397,-72.53118130000001)});
	buildings.push({name: "Gorman Hall", location: new google.maps.LatLng(42.38748020000001,-72.5210204)});
	buildings.push({name: "John Adams Hall", location: new google.maps.LatLng(42.3818339,-72.52883299999996)});
	buildings.push({name: "Knowlton Hall", location: new google.maps.LatLng(42.39378430000001,-72.52569059999996)});
	buildings.push({name: "Lewis Hall", location: new google.maps.LatLng(42.395067,-72.52396220000003)});
	buildings.push({name: "Leach Hall", location: new google.maps.LatLng(42.3952506,-72.52575189999999)});
	buildings.push({name: "Linden Hall", location: new google.maps.LatLng(42.3870426,-72.53083709999999)});
	buildings.push({name: "Mackimmie Hall", location: new google.maps.LatLng(42.382548,-72.52862679999998)});
	buildings.push({name: "Lincoln Apts ", location: new google.maps.LatLng(42.38366560000001,-72.5263448)});
	buildings.push({name: "Mary Lyon Hall", location: new google.maps.LatLng(42.3941624,-72.524497)});
	buildings.push({name: "Melville Hall", location: new google.maps.LatLng(42.38467199999999,-72.53077539999998)});
	buildings.push({name: "McNamara Hall", location: new google.maps.LatLng(42.3979153,-72.52227640000001)});
	buildings.push({name: "Maple Hall", location: new google.maps.LatLng(42.3875513,-72.53098269999998)});
	buildings.push({name: "Moore Hall", location: new google.maps.LatLng(42.3820188,-72.53083219999996)});
	buildings.push({name: "Oak Hall", location: new google.maps.LatLng(42.3873358,-72.53018259999999)});
	buildings.push({name: "Pierpont Hall", location: new google.maps.LatLng(42.3813665,-72.53080399999999)});
	buildings.push({name: "Patterson Hall", location: new google.maps.LatLng(42.381811,-72.52836890000003)});
	buildings.push({name: "Prince Hall", location: new google.maps.LatLng(42.3840229,-72.52894559999999)});
	buildings.push({name: "Sycamore Hall", location: new google.maps.LatLng(42.3883857,-72.53015040000003)});
	buildings.push({name: "Thatcher Hall", location: new google.maps.LatLng(42.3944469,-72.52380019999998)});
	buildings.push({name: "Webster Hall", location: new google.maps.LatLng(42.3915267,-72.51947080000002)});
	buildings.push({name: "Washington Hall", location: new google.maps.LatLng(42.3815511,-72.52932770000001)});
	buildings.push({name: "Van Meter Hall", location: new google.maps.LatLng(42.3898273,-72.51833679999999)});
	buildings.push({name: "Wheeler Hall", location: new google.maps.LatLng(42.38888559999999,-72.52130829999999)});
	buildings.push({name: "Toddler House", location: new google.maps.LatLng(42.3811664,-72.5342703)});
	buildings.push({name: "Cold Storage Building ", location: new google.maps.LatLng(42.3933715,-72.5309413)});
	buildings.push({name: "Nelson House North", location: new google.maps.LatLng(42.396392,-72.513461)});
	buildings.push({name: "Nelson House South", location: new google.maps.LatLng(42.395547,-72.51228500000002)});
	buildings.push({name: "Slobody Bldg ", location: new google.maps.LatLng(42.369975,-72.53418399999998)});
	buildings.push({name: "Football Performance Center", location: new google.maps.LatLng(42.3787116,-72.53414140000001)});
	buildings.push({name: "Tillson House", location: new google.maps.LatLng(42.399269,-72.51094499999999)});

	//these ones are manually corrected
	buildings.push({name: "Army ROTC Bldg", location: new google.maps.LatLng(42.385209557132896, -72.52963595504764)});
	buildings.push({name: "Hampden Dining Common", location: new google.maps.LatLng(42.382883634102285, -72.52971105690006)});
	buildings.push({name: "Berkshire Dining Common", location: new google.maps.LatLng(42.38189697292081, -72.52997927780154)});
	buildings.push({name: "Engineering Laboratory II (E Lab II)", location: new google.maps.LatLng(42.3944886171646, -72.5312130939484)});
	buildings.push({name: "Furcolo Hall", location: new google.maps.LatLng(42.3982164953803, -72.52655141468051)});
	buildings.push({name: "Continuing Education", location: new google.maps.LatLng(42.3636629,-72.54638160000002)});
	buildings.push({name: "Faculty Club", location: new google.maps.LatLng(42.38977329999999,-72.52361329999997)});
	buildings.push({name: "Goodell Bldg", location: new google.maps.LatLng(42.38867399999999,-72.52922430000001)});
	buildings.push({name: "Holdsworth Hall", location: new google.maps.LatLng(42.39292767571017, -72.53086977119449)});
	buildings.push({name: "Goessmann Laboratory", location: new google.maps.LatLng(42.3931063,-72.52754140000002)});
	buildings.push({name: "Gordon Hall", location: new google.maps.LatLng(42.38498172350506, -72.52225183362964)});
	buildings.push({name: "Lederle Grad Research Ctr (LGRC lowrise)", location: new google.maps.LatLng(42.394399478152145, -72.52706371660236)});
	buildings.push({name: "Lederle Grad Research Tower (LGRT)", location: new google.maps.LatLng(42.393904259110734, -72.52760552282336)});
	buildings.push({name: "Marcus Hall", location: new google.maps.LatLng(42.393957742955415, -72.52860598678592)});
	buildings.push({name: "Middlesex House", location: new google.maps.LatLng(42.38565927847578, -72.52852820272449)});
	buildings.push({name: "North Residence A ", location: new google.maps.LatLng(42.397592556699486, -72.52412937994006)});
	buildings.push({name: "North Residence B ", location: new google.maps.LatLng(42.39672101291902, -72.5241722952843)});
	buildings.push({name: "North Residence C ", location: new google.maps.LatLng(42.39763217203827, -72.52508424634937)});
	buildings.push({name: "North Residence D ", location: new google.maps.LatLng(42.396792321501174, -72.52514861936572)});
	buildings.push({name: "Parking Office Trailer", location: new google.maps.LatLng(42.39254931984211, -72.53503524179462)});
	buildings.push({name: "North Village Apts. (Family Housing)", location: new google.maps.LatLng(42.4034143,-72.52941679999998)});
	buildings.push({name: "Photo Center", location: new google.maps.LatLng(42.39043365442062, -72.53042988891605)});
	buildings.push({name: "Shade Trees Laboratory", location: new google.maps.LatLng(42.38957191632459, -72.52376459951404)});
	buildings.push({name: "South College", location: new google.maps.LatLng(42.38951644772007, -72.52894662733081)});
	buildings.push({name: "University Store", location: new google.maps.LatLng(42.391719306047435, -72.52702080125812)});
	buildings.push({name: "Totman", location: new google.maps.LatLng(42.396116867513356, -72.5259371888161)});
	buildings.push({name: "University Press", location: new google.maps.LatLng(42.39331989561591, -72.52558313722614)});

	//Extras
	buildings.push({name: "Astronomy Bldg", location: new google.maps.LatLng(42.3948044,-72.52969339999999)});
	buildings.push({name: "Mahar Auditorium", location: new google.maps.LatLng(42.386549,-72.52423019999998)});
	buildings.push({name: "Apiary Laboratory", location: new google.maps.LatLng(42.388375,-72.52039400000001)});
	buildings.push({name: "Lorden Field", location: new google.maps.LatLng(42.3911569,-72.5267121)});
	buildings.push({name: "Orchard Hill Observatory", location: new google.maps.LatLng(42.3940373,-72.5215713)});
	buildings.push({name: "Forest & Parks Buildings", location: new google.maps.LatLng(42.39354540000001,-72.5359196)});
	buildings.push({name: "Rudd Field", location: new google.maps.LatLng(42.3911569,-72.5267121)});
	buildings.push({name: "Mullins Tennis Courts", location: new google.maps.LatLng(42.3884988,-72.53551019999998)});
	buildings.push({name: "Bowditch Greenhouses", location: new google.maps.LatLng(42.3920512,-72.53166110000001)});
	buildings.push({name: "Robotics", location: new google.maps.LatLng(42.3951493,-72.5307803)});
	buildings.push({name: "Thoreau", location: new google.maps.LatLng(42.3843064,-72.530262)});
	buildings.push({name: "Thayer", location: new google.maps.LatLng(42.3935792,-72.5300987)});
	buildings.push({name: "Track & Field Complex", location: new google.maps.LatLng(42.3819616,-72.53720149999998)});
	buildings.push({name: "Sortino Field", location: new google.maps.LatLng(42.3911569,-72.5267121)});
	buildings.push({name: "Transit Facilitiy", location: new google.maps.LatLng(42.3932735,-72.53342659999998)});
	buildings.push({name: "Warren McGuirk Alumni Stadium", location: new google.maps.LatLng(42.3773128,-72.53675040000002)});
	buildings.push({name: "Grinnell Arena", location: new google.maps.LatLng(42.3898254,-72.53072529999997)});
	buildings.push({name: "Hicks Physical Education", location: new google.maps.LatLng(42.3877761,-72.52906999999999)});
	buildings.push({name: "Champions Center", location: new google.maps.LatLng(42.38619,-72.5311433)});
	// buildings.push({name: "Telecommunications Building Node A-6", location: new google.maps.LatLng(42.3915535,-72.52290970000001)});
	// buildings.push({name: "Telecommunications Building Node A-2", location: new google.maps.LatLng(42.3843218,-72.52870150000001)});
	// buildings.push({name: "Telecommunications Building Node A-7", location: new google.maps.LatLng(42.40360219999999,-72.52934140000002)});
	// buildings.push({name: "Munson Annex", location: new google.maps.LatLng(42.3877761,-72.52906999999999)});
	buildings.push({name: "Mobile Classrooms", location: new google.maps.LatLng(42.39537139999999,-72.52710350000001)});
	buildings.push({name: "Hadley Equestrian Farm", location: new google.maps.LatLng(42.3767492,-72.54877800000003)});
	buildings.push({name: "Visitors Center", location: new google.maps.LatLng(42.3853763,-72.52368710000002)});
	buildings.push({name: "Hagis Mall", location: new google.maps.LatLng(42.38627049999999,-72.52584379999996)});
	buildings.push({name: "Orchard Hill Residential Area", location: new google.maps.LatLng(42.39185440000001,-72.5191982)});
	buildings.push({name: "Northeast Residential Area", location: new google.maps.LatLng(42.39483329999999,-72.52488699999998)});
	buildings.push({name: "Newman Center", location: new google.maps.LatLng(42.3866248,-72.52313119999997)});
	buildings.push({name: "Garber Field", location: new google.maps.LatLng(42.3865237,-72.529313)});
	buildings.push({name: "Athletic Fields", location: new google.maps.LatLng(42.3984962,-72.52560289999997)});
	buildings.push({name: "Central Residential Area", location: new google.maps.LatLng(42.3911569,-72.5267121)});
	buildings.push({name: "Grass Roots Daycare", location: new google.maps.LatLng(42.3811714,-72.53427679999999)});
	buildings.push({name: "Chabad House", location: new google.maps.LatLng(42.3911569,-72.5267121)});
	buildings.push({name: "Sylvan Residential Area", location: new google.maps.LatLng(42.39762349999999,-72.52214649999996)});
	buildings.push({name: "University Club", location: new google.maps.LatLng(42.3897325,-72.52356709999998)});

	// TODO these is not verified
	buildings.push({name: "William S. Clark International Center (Hills) ", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Baker House (Offices)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Brett (Offices)", location: new google.maps.LatLng(42.3893526,-72.52108820000001)});
	buildings.push({name: "Cance (Offices)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Goodell Bldg (Graduate School)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Goodell Bldg (Procurement)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Johnson House (Offices)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Thoreau House (Offices)", location: new google.maps.LatLng(42.367,-72.517)});
	buildings.push({name: "Stonewall Center", location: new google.maps.LatLng(42.367,-72.517)});


	//TODO these are on the campus map, but we are missing addresses
	// Alfond
	// Intermed. Processing Fac. (IPF)

	//sort buildings by name, then put them to the selection list
	buildings.sort(function compare(a,b) {
	  if (a.name < b.name)
	     return -1;
	  if (a.name > b.name)
	    return 1;
	  return 0;
	})

	//append buildings to drop down menu
	for(var i=0;i<buildings.length;i++){
		var building = buildings[i];
		var searchOpt = document.createElement("option");
		searchOpt.textContent = building.name;
		searchOpt.value = 'building'+i;
		select1.appendChild(searchOpt);
	}

	$(select1).val(0);
	//clone jump list to start and end lists
	$("#start_A").html($(select1).html());
	$("#end_A").html($(select1).html());


	//move find me control into google maps toolbar
	var findMeDiv = document.createElement('div');
	$('#where-am-i').click(function(){findMe()});
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#layer-toggle')[0]);
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#directions-toggle')[0]);
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#where-am-i')[0]);
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#print-button')[0]);

	//add listener for when zoom level changes so that we can scale icons correctly
	google.maps.event.addListener(map, 'zoom_changed', function(){
		
		//limit times zoom scale is set
		if(!zooming){
			zooming=true;
			setTimeout(function() {
				var zoom = map.getZoom();
				var size = 0;
				if(zoom > 13){
					size = 1/((1/131072)*Math.round(Math.pow(2,zoom)));
				}
				setIconSize(size);
				zooming=false;
			}, 500);
		}
	});

	//use a global variable to keep track of dragging so we dont trigger click events on overlays when the map is dragged
	google.maps.event.addListener(map, 'dragend', function(event) {
		dragging=true;
	});google.maps.event.addListener(map, 'mouseup', function(event) {
		dragging=false;
	});

	//trigger map resize when any element is shown or hidden, or the map becomes idle after loading (fixes problems with the map tiles not loading)
	$('*').bind('show hide', function(){
		setTimeout(function() {
			google.maps.event.trigger(map, 'resize');
		}, 500);
	});


	//wait a few seconds for everything to finalize, then ensure icons are zoomed right, hide the loading frame, and make sure the map knows what size it is
	setTimeout(function() {
		setInitialLayers();
		google.maps.event.trigger(map, 'zoom_changed');
		$('#loading-div').hide();
		google.maps.event.trigger(map, 'resize');
	}, 3000);

	


	//temporary marker to get lat/long pairs
	//TODO comment this or remove it before commiting
 //    var markerA = new google.maps.Marker({
	// 	position: umass,
	// 	map: map,
	// 	draggable:true
	// });

	// google.maps.event.addListener(markerA,'drag',function(){
 //        var newPointA = markerA.getPosition();
 //    });

	// google.maps.event.addListener(markerA, 'dragend', function () {

	// 	var newPointA = markerA.getPosition();
	// 	console.log("point"+ newPointA);
	// });
}

/******
Internal use functions
******/

function fullGeocodeByName(){
	var i=0;
	//iterate over all buildings, set a geocode method to run every 15 seconds with the next 10 buildings till done
	for(i=0;i<unknownBuildings.length/10;i++){
		(function(i){
			setTimeout(
				function(){
					geocodeByName(i*10, (i+1)*10);
				},
				15000*i
			);
		})(i);
	}
	(function(i){
		setTimeout(
			function(){
				geocodeByName((i-1)*10, (unknownBuildings.length-1));
				console.log('Done');
			},
			15000*i
		);
	})(i);
}

function fullGeocodeByAddress(){
	var i=0;
	//iterate over all buildings, set a geocode method to run every 15 seconds with the next 10 buildings till done
	for(i=0;i<unknownBuildings.length/10;i++){
		(function(i){
			setTimeout(
				function(){
					geocodeByAddress(i*10, (i+1)*10);
				},
				15000*i
			);
		})(i);
	}
	(function(i){
		setTimeout(
			function(){
				geocodeByAddress((i-1)*10, (unknownBuildings.length-1));
				console.log('Done');
			},
			15000*i
		);
	})(i);
}


//geocodes a set of the buildings array, must be limited to 10 every 10 seconds, otherwise google gives us a 'too many requests' error
function geocodeByName(start, end){
	geocoder = new google.maps.Geocoder();
	for(var j=start;j<end;j++){
		var building = unknownBuildings[j];
		console.log(building);
		(function(building){
			geocoder.geocode( { 'address': (building.name+" Umass Amherst"), bounds: imageBounds}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					buildingResults.push({name: building.name, lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});
				}
				else {
					(function(building){
						geocoder.geocode( { 'address': building.location, bounds: imageBounds}, function(results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								buildingResults.push({name: building.name, lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});
							}
							else {
								console.log("Geocode was not successful for the following reason: " + status);
							}
						});
					})(building);
				}
			});
		})(building);
	}
}
function geocodeByAddress(start, end){
	geocoder = new google.maps.Geocoder();
	for(var j=start;j<end;j++){
		var building = unknownBuildings[j];
		console.log(building);
		(function(building){
			geocoder.geocode( { 'address': building.location, bounds: imageBounds}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					buildingResults.push({name: building.name, lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});
				}
				else {
					(function(building){
						geocoder.geocode( { 'address': (building.name+" Umass Amherst"), bounds: imageBounds}, function(results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								buildingResults.push({name: building.name, lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});
							}
							else {
								console.log("Geocode was not successful for the following reason: " + status);
							}
						});
					})(building);
				}
			});
		})(building);
	}
}
//writes the contents of the buildingresults array to the console so it can be hard copied after running the above method
function writeArray(){
	for(var i=0;i<buildingResults.length;i++){
		var building = buildingResults[i];
		console.log('buildings.push({name: "'+building.name+'", location: new google.maps.LatLng('+building.lat+','+building.lng+')});');
	}
}
/******
End internal use functions
******/

//Allow for parameters to be set which will enable specific layers on start
function getSearchParameters() {
      var paramStr = window.location.search.substr(1);
      return paramStr != null && paramStr != "" ? transformToAssocArray(paramStr) : {};
}

function transformToAssocArray( paramStr ) {
    var params = {};
    var paramArray = paramStr.split("&");
    for ( var i = 0; i < paramArray.length; i++) {
    	//split each value on the equals
        var tempArray = paramArray[i].split("=");
        tempArray[0] = String(tempArray[0]);
        tempArray[1] = String(tempArray[1]);
        
        //if this value is an array, split the value as another array
        if(endsWith(tempArray[0], "[]"))
        	params[tempArray[0].slice(0,-2)] = tempArray[1].split(",");
        else if(endsWith(tempArray[0], "%5B%5D"))
        	params[tempArray[0].slice(0,-6)] = tempArray[1].split(",");
        //else, set the value exactly
        else
	        params[tempArray[0]] = tempArray[1].replace("%20", " ");
    }
    return params;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function setInitialLayers(){
	params = getSearchParameters();

	// $(displayOverlay.image_).find('.layer').hide();
	// $(clickableOverlay.image_).find('.layer').hide();
	$(getElementsByClassName(displayOverlay.image_, "layer")).hide();
	$(getElementsByClassName(clickableOverlay.image_, "layer")).hide();

	if(params["layers"] != undefined){
		params["layers"].forEach(function(layer){
			$('.overlay-toggle#'+layer+'layer').click();
		})
	}


	var anyDirections = false;
	if(params["fromLot"] != undefined){
		$("#start_A option:contains('"+params["fromLot"]+"')").prop("selected", true).change();
		anyDirections = true;
	}
	if(params["from"] != undefined){

		anyDirections = true;
	}

	if(params["toLot"] != undefined){
		$("#end_A option:contains('"+params["toLot"]+"')").prop("selected", true).change();
		anyDirections = true;
	}
	if(params["to"] != undefined){

		anyDirections = true;
	}

	if(params["mode"] != undefined){
		$('.transit#'+params["mode"]).click();
		anyDirections = true;
	}

	//Show directions box if any directions were provided and the user is not on mobile
	if(anyDirections){
		displayRoute();
		if(!isMobile())
			$('#directions-toggle').click();
	}


	if(params["centerLot"] != undefined){
		$("#jump_A option:contains('"+params["centerLot"]+"')").prop("selected", true).change();
		anyDirections = true;
	}
	if(params["center"] != undefined){

		anyDirections = true;
	}
}

function getElementsByClassName(object, className) {
	if (object.getElementsByClassName) { 
		return object.getElementsByClassName(className); }
	else { return object.querySelectorAll('.' + className); } 
}

//TODO our method to set the infowindow text, allows for global formattings
function generateInfoWindowFooter(position){
	//create an empty div
	var div = document.createElement('div');
	div.id = "direction-buttons";

	//create directions to and from buttons
	var directionsFromButton  = document.createElement('button');
	directionsFromButton.innerHTML = 'Directions From Here';

	var directionsToButton = document.createElement('button');
	directionsToButton.innerHTML = 'Directions To Here';

	//add events so that directions to/from buttons set the start and end point, and fill in the search boxes with the closest address to make it aparent to the user what has happened
	directionsFromButton.onclick = dynamicStart(position);
	function dynamicStart(position){
		return function () {
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({'latLng': position}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						$('#start_autocomplete').val(results[0].formatted_address);
					} else {
						alert('No results found');
					}
				} else {
					alert('Geocoder failed due to: ' + status);
				}
			});
			setStart(position);
		};
	}

	directionsToButton.onclick = dynamicEnd(position);
	function dynamicEnd(position){
		return function () {
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({'latLng': position}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						$('#end_autocomplete').val(results[0].formatted_address);
					} else {
						alert('No results found');
					}
				} else {
					alert('Geocoder failed due to: ' + status);
				}
			});
			setEnd(position);
		};
	}

	//populate the div and return it
	div.innerHTML = '<br/>';
	div.appendChild(directionsFromButton);
	div.appendChild(directionsToButton);

	// div.appendChild(document.createElement("br"));
	// var infoLink = document.createElement('a');
	// infoLink.setAttribute('href','http://parking.umass.edu/index.php/generalinfo/parkingoptions/');
	// infoLink.innerHTML = 'Additional parking information';
	// div.appendChild(infoLink);

	// div.appendChild(document.createElement("br"));
	// var feedbackLink = document.createElement('a');
	// feedbackLink.setAttribute('href','http://parking.umass.edu/index.php/home/feedback');
	// feedbackLink.innerHTML = 'Send feedback to Parking Services';
	// div.appendChild(feedbackLink);

	return div;
}

//our version of set content, so it gets formatted correctly if it wasnt already
google.maps.InfoWindow.prototype._setContent = function(text){
	var div = document.createElement('div');
	div.className = "gm-iw gm-sm";
	if(typeof text == "string"){
		var textDiv = document.createElement('div');
		textDiv.className = "gm-title";
		textDiv.innerHTML = text;
		div.appendChild(textDiv);
	}
	else
		div.appendChild(text);
	this.setContent(div);
};


//set scale of all icons
function setIconSize(scale){
	scale = scale*iconScaler;
	var bbox, cx, cy, tx, ty, translatestr, transform;

	$('.icon').each(function(){
		tx=-cx*(scale-1);
		ty=-cy*(scale-1);
		translatestr=tx+','+ty;

		$(this).attr('transform', 'scale('+scale+')');
	});
}

function setIconScale(scale, element){
	iconScaler = scale;
	google.maps.event.trigger(map, 'zoom_changed');
}

//get svg data from corresponding object within the main html
function getSvg(id){
	//get the object holding this image and make sure it is visible
	var obj = document.getElementById(id);
	$(obj).show();
	//get the svg data from it
	var svg = obj.contentDocument;
	svg = $('svg', svg)[0];
	//set it invisible again
	$(obj).hide();
	return svg;
}

/*
*	Overlay constructor and methods
*/
function Overlay(bounds, image, clickable, map) {
	this.bounds_ = bounds;
	this.image_ = image;
	this.div_ = null;
	this.clickable_ = clickable;
	this.setMap(map);
}

Overlay.prototype.setImage = function(image) {
	this.image_ = image;
}

Overlay.prototype.onAdd = function() {
	var div = document.createElement('div');

	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	div.style.zindex = '1';

	if(this.image_)
		div.appendChild(this.image_);

	this.div_ = div;

	var panes = this.getPanes();

	if(this.clickable_)
		panes.overlayMouseTarget.appendChild(div);
	else
    	panes.mapPane.appendChild(div);
};

Overlay.prototype.draw = function() {
	var overlayProjection = this.getProjection();
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

Overlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
};

/*
* Update the overlays and redraw them in the proper order
*/
function updateCheckboxes(checkbox){
	if(!updatingChildCheckBoxes && $(checkbox).hasClass("parentCheckBox")){
		updatingChildCheckBoxes = true;
		if(checkbox.checked){
			$(checkbox).parents('fieldset:eq(0)').find('input.childCheckBox:not(#'+checkbox.id+')').each(function(){
				if(!this.checked)
				$(this).trigger('click');
			});
		}
		else{
			$(checkbox).parents('fieldset:eq(0)').find('input.childCheckBox:not(#'+checkbox.id+')').each(function(){
				if(this.checked)
				$(this).trigger('click');
			});
		}
		updatingChildCheckBoxes = false;
	}
	if(!updatingChildCheckBoxes && $(checkbox).hasClass("childCheckBox")){
		//clicking the last unchecked or checked checkbox should check or uncheck the parent checkbox
		if (checkbox.checked == false){
			$(checkbox).parents('fieldset').find('input.parentCheckBox:not(#'+checkbox.id+')').attr('checked', false);
		}
		if (checkbox.checked) {
			var flag = true;

			$(checkbox).parents('fieldset').each(
				function(){
					$(this).find('input.childCheckBox:not(.parentCheckBox, #'+checkbox.id+')').each(
						function() {
							if(this.checked == false)
								flag = false;
						}
					);
					if(flag)
						$(this).find('input.parentCheckBox:not(#'+checkbox.id+')').first().attr('checked', 'checked');
					else
						$(this).find('input.parentCheckBox:not(#'+checkbox.id+')').first().attr('checked', false);
				}
			);
		}
	}
}

function updateLayer(checkbox, others){
	//update children and parents
	updateCheckboxes(checkbox);

	var targetText = '#'+checkbox.id;
	var clickTargetText = '#'+checkbox.id+'clickable';
	if(others){
		for(var i=0;i<others.length;i++){
			targetText += ', #'+others[i];
			clickTargetText += ', #'+others[i]+'clickable';
		}
	}

	var target = $(displayOverlay.image_).find(targetText);
	var clickTarget = $(clickableOverlay.image_).find(clickTargetText);
	if(checkbox.checked){
		$(target).show('slow');
		$(clickTarget).show('slow');
	}
	else{
		$(target).hide('slow');
		$(clickTarget).hide('slow');
	}
}

/*
* Show or hide the control box
*/
function toggleControls(id){
	if($('#control-cell').is(':hidden') || $('#'+id).is(':hidden')){
		$('#control-cell').find('.toggle-div').hide('fast');
		$('#control-cell').show('fast');
		$('#'+id).show('fast');
	}
	else{
		$('#control-cell').find('.toggle-div').hide('fast');
		$('#control-cell').hide('fast');
	}
	google.maps.event.trigger(map, 'resize');
}

/*
* Find the user via geolocation in html5
*/
function getGeoLocation(success,failure){
	// Try HTML5 geolocation
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
				success(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
			},
			function(error){
				geoError = error;
				console.log('Geolocation error: '+error.code+' '+error.message);
				handleNoGeolocation(geoError);
				failure();
			}
		);
	}
	// Browser doesn't support Geolocation
	else{
		handleNoGeolocation(false);
		failure();
	}
	}

function handleNoGeolocation(errorFlag) {
	if (errorFlag.code == 1) {
		alert("We are unable to locate you.\nTo use this feature please enable location tracking in your browsers settings.");
	} else if(errorFlag != false){
		alert("We are unable to locate you.\nPlease try using a different web browser.");
 	} else {
		alert("We are unable to locate you.\nYour browser does not support geolocation");
 	}
}

function findMe(){
	var currentLoc = getGeoLocation(
		function(loc){
			map.setZoom(16);
			map.panTo(loc);

			infowindow.close();
			infowindow._setContent('You Are Here');
			infowindow.setPosition(loc);
			infowindow.setMap(map);
		},
		function(){
			infowindow.close();
		}
	);
}

/*
* Direction stuff
*/

function getCenter(path){
	var centroid;
	//if this is a mouse event, handle it differently
	if(path.target){
		var posx = 0;
		var posy = 0;
		if (path.pageX || path.pageY) 	{
			centroid = {
				x: path.pageX,
				y: path.pageY
			}
		}
		else if (path.clientX || path.clientY) 	{
			centroid = {
				x: path.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
				y: path.clientY + document.body.scrollTop + document.documentElement.scrollTop
			}
		}
	}

	//otherwise, treat it as a path
	else{
 		//check if this path is hidden or if it is part of a layer that is currently hidden
 		var hidden;
 		var layer = path;
 		if($(path).hasClass('layer')){
	 		hidden = $(path).css('display') == 'none';
 		}
 		else{
 			hidden = $(path).parents('.layer').css('display') == 'none';
 			layer = $(path).parents('.layer');
 		}
 		if(hidden)
 			$(layer).show();

 		//check if this path has a predefined center point and make it visible for calculations
 		//center points are in the svg, grouped with a lot with a class of 'center'. they can be any shape, but smaller and simpler is better
 		var centerPath = $(path).children('.center')[0];
 		// var centerPath = undefined;
 		if(centerPath != undefined){
 			$(centerPath).show();
 			path = centerPath;
 		}

 		var bbox;
 		if($(path).is('use')){
 			var box = path.getBoundingClientRect();
 			bbox = {
 				x: box.left,
 				y: box.top,
 				width: box.width,
 				height: box.height
 			}

 			// calculate center of path with respect to the displayOverlay's div
			var obbox = $(path).parents('div')[0].getBoundingClientRect();

			//(outer box position) + [(path center)*(outer box size)/(viewbox size)]
			var centroid = {
				x: bbox.x + bbox.width/2,
				y: bbox.y + bbox.height/2
			};
 		}
 		else{
 			// calculate center of path with respect to the displayOverlay's div
			bbox = path.getBBox();
			var obbox = $(path).parents('div')[0].getBoundingClientRect();

			//(outer box position) + [(path center)*(outer box size)/(viewbox size)]
			centroid = {
				x: obbox.left + (bbox.x + bbox.width/2)*obbox.width/$(path).parents('svg')[0].viewBox.baseVal.width,
				y: obbox.top + (bbox.y + bbox.height/2)*obbox.height/$(path).parents('svg')[0].viewBox.baseVal.height
			};
 		}

		//rehide everything that we unhid
		if(hidden)
			$(layer).hide();
		$(centerPath).hide();
 	}

	//subtract header height from coordinates
	centroid.y -= $('#header').height();
	//if desktop size, subtract control width from coordinates
	// if(!mobile && $('#control-cell').is(':visible'))
	// 	centroid.x -= $('#control-cell').width();
	// //if mobile size, subtract control height from coordinates
	// else if($('#control-cell').is(':visible'))
	// 	centroid.y -= $('#control-cell').height();

	//pass this point to google maps to turn it into lat/lng
	var coordinates = displayOverlay.getProjection().fromContainerPixelToLatLng(
		new google.maps.Point(centroid.x,centroid.y)
	);

	return coordinates;
}

// returns info for a lot or other clickable as a div with title and body for use in the infowindow
function getLotInfo(lot){
	//format lot info so it gets nice classes for displaying
	var div = document.createElement('div');
	var titleDiv = document.createElement('div');
	titleDiv.className = 'gm-title';
	var contentDiv = document.createElement('div');
	contentDiv.className = 'gm-addr';

	if(lot == 'metered' || lot.metered){
		if(lot.name)
			titleDiv.innerHTML = lot.name + " - ";
		titleDiv.innerHTML = titleDiv.innerHTML+'Metered Parking';
		contentDiv.innerHTML = '$1.50/hr<br/>';//Free M-F from 5p-7a, Sat & Sun all day';
	}
	else if(lot == 'pedestrian'){
		titleDiv.innerHTML = 'Pedestrian Only Zone';
		contentDiv.innerHTML = 'No Parking Any Time';
	}
	else if(lot == 'zip'){
		titleDiv.innerHTML = 'Zip Car Pick Up & Drop Off Location';
		contentDiv.innerHTML = '<br><a href="http://www.zipcar.com/">www.zipcar.com</a>';
	}
	else if(lot == 'enterprise'){
		titleDiv.innerHTML = 'Enterprise Pick Up & Drop Off Location';
		contentDiv.innerHTML = '<br><a href="http://www.enterprise.com/car_rental/home.do">www.enterprise.com</a>';
	}
	else if(lot.type == 'garage'){
		titleDiv.innerHTML = 'Parking Garage';
		contentDiv.innerHTML = '$1.75/hr<br/>'//'Current rates:<br/>5a-5p $1.75/hr<br/>5p-5a $1.75/hr*<br/><br/>Maximum fee for a single day is $20<br/>There is a maximum grace time of 15 minutes<br/>*Maximum fee for parking from 5p-5a is $3<br/>*At 5a, the normal rate of $1.50/hr resumes';
	}
	else{
 		titleDiv.innerHTML = lot.name;
 		if(lot.color)
 			titleDiv.innerHTML = titleDiv.innerHTML + " - " + lot.color;
 		if(!lot.metered){
			if(lot.twentyFour)
				contentDiv.innerHTML = contentDiv.innerHTML + "Permit Required At All Times";
			else if(lot.twentyFourSeven)
				contentDiv.innerHTML = contentDiv.innerHTML + "Permit Required M-F All Day"
			else
				contentDiv.innerHTML = contentDiv.innerHTML + "Permit Required M-F 7a-5p";
		}
		if(lot.handicapped)
			contentDiv.innerHTML = contentDiv.innerHTML + "<br/>Handicapped Parking Available";
		if(lot.motorcycle)
			contentDiv.innerHTML = contentDiv.innerHTML + "<br/>Motorcycle Parking Available";
	}

	div.appendChild(titleDiv);
	div.appendChild(contentDiv);

	return div;
}

//Shh...
function showMinuteMan(){
	var ne = imageBounds.getNorthEast();
	var sw = imageBounds.getSouthWest();
	var lat = Math.random()*(ne.lat()-sw.lat())+sw.lat();
	var lng = Math.random()*(sw.lng()-ne.lng())+ne.lng();
	var latlng = new google.maps.LatLng(lat, lng);

	jumpAndAlert(latlng, 'Here I am!')
}

//show multiple places from a generic search
function showPlaces(places){
	$('#jump_A').val('');

	clearPlaceMarkers();

	if(places.length ==1){
		jumpTo(places[0]);
	}
	else{
 		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map: map,
				icon: image,
				title: place.name,
				position: place.geometry.location
			});

			//on click, show info about this place
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.close();
				infowindow._setContent(this.title);
				infowindow.setPosition(this.position);
				infowindow.setMap(map);
			});

			placeMarkers.push(marker);
			bounds.extend(place.geometry.location);
		}
		map.fitBounds(bounds);
	}
}

function clearPlaceMarkers(){
	for (var i = 0; i < placeMarkers.length; i++) {
		if (placeMarkers[i])
			placeMarkers[i].setMap(null);
	}
	placeMarkers = [];
}

//jump to center of obj if it's a shape or mouseevent, or directly there if its a lat/lng pair, show text in the infowindow, and set to this zoom
function jumpAndAlert(obj, text, zoom){
	var coordinates;
	if(obj instanceof google.maps.LatLng)
		coordinates = obj;
	else
		coordinates = getCenter(obj);

	// move map and display relevant info
	map.panTo(coordinates);
	if(zoom)
		map.setZoom(zoom);

	infowindow.close();
	if(text != ''){
		infowindow._setContent(text);
		infowindow.setPosition(coordinates);
		infowindow.setMap(map);
	}
}

	//called from jump dropdown/searchbox to search for a place to jump to and what text to show
function jumpTo(place){
	//determine whether to use text search of selection search
	google.maps.event.trigger(map, 'resize');
	var index = -1;
	if(place == null){
		$('#jump_autocomplete').val('');

		index = $('#jump_A').val();
		//if nothing selected
		if(index == '')
			return;
		//if my location selected
		if(index == 'me')
			findMe();
		//if building selected
		else if(index.match(/(building)/) != null){
			index = index.replace('building', '');
			var center = buildings[index].location;
			var zoom = 16;
			var text = buildings[index].name;

			jumpAndAlert(center, text, zoom);
		}
		//if lot selected
		else{
			var center = $('#'+index)[0];
			var zoom = lots[index].zoom;
			if(!zoom)
				zoom = 16;
			var text = getLotInfo(lots[index]);

			jumpAndAlert(center, text, zoom);
		}
	}
	else{
		$('#jump_A').val('');

		var latlng = place.geometry.location;
		map.panTo(latlng);
		map.setZoom(16);

		infowindow.close();
		infowindow._setContent(place.formatted_address);
		infowindow.setPosition(latlng);
		infowindow.setMap(map);
	}
	if(mobile)
		toggleControls();
	google.maps.event.trigger(map, 'resize');
}

//sets the start global var to the correct lat/lng pair based off start dropdown or searchbox
function setStart(place){
	//if no place supplied, look through lots or find the users location
	if(place == null){
		$('#start_autocomplete').val('');

		var startIndex = $('#start_A').val();
		//if index of start drop down is my location, try to geolocate the user
		if(startIndex == 'me'){
			getGeoLocation(
				function(loc){
					start = loc;
					displayRoute();
				},
				function(){
					start = null;
					displayRoute();
				}
			);
		}
		//if index is a building
		else if(startIndex.match(/(building)/) != null){
			startIndex = startIndex.replace('building', '');
			start = buildings[startIndex].location;
			
			displayRoute();
		}
		//otherwise, just use the indexed lot
		else{
			start = getCenter($('#'+startIndex)[0]);
			displayRoute();
		}
	}
	//if place supplied, use its latlng
	else{
		$('#start_A').val('');

		//if place is a latlng
		if(place instanceof google.maps.LatLng){
			start = place;
			displayRoute();
		}
		//otherwise
		else{
			start = place.geometry.location;
			displayRoute();
		}
	}
}


//sets the end global var to the correct lat/lng pair based off end dropdown or searchbox
function setEnd(place){
	//if no place supplied, look through lots or find the users location
	if(place == null){
		$('#end_autocomplete').val('');

		var endIndex = $('#end_A').val();
		//if index of start drop down is 1, try to geolocate the user
		if(endIndex == 'me'){
			getGeoLocation(
				function(loc){
					end = loc;
					displayRoute();
				},
				function(){
					end = null;
					displayRoute();
				}
			);
		}
		//if index is a building
		else if(endIndex.match(/(building)/) != null){
			endIndex = endIndex.replace('building', '');
			end = buildings[endIndex].location;
			
			displayRoute();
		}
		//otherwise, just use the indexed lot
		else{
			end = getCenter($('#'+endIndex)[0]);
			displayRoute();
		}
	}
	//if place supplied, use its latlng
	else{
		$('#end_A').val('');

		//if place is a latlng
		if(place instanceof google.maps.LatLng){
			end = place;
			displayRoute();
		}
		else{
			end = place.geometry.location;
			displayRoute();
		}
	}
}

//TODO swaps the start and end positions, this works for drop downs but breaks with autocompletes
function swapStartEnd(){
	var tempStartA = $('#start_A').val();
	var tempStartAuto = $('#start_autocomplete').val();

	$('#start_A').val($('#end_A').val());
	$('#start_A').trigger('change');
	$('#start_autocomplete').val($('#end_autocomplete').val());
	$('#start_autocomplete').trigger('place_changed');

	$('#end_A').val(tempStartA);
	$('#end_A').trigger('change');
	$('#end_autocomplete').val(tempStartAuto);
	$('#end_autocomplete').trigger('place_changed');

}

//get the route between start and end via google maps service and display it on both the map and directions-cell div, if no directions found clears both of these
function displayRoute(){
	//if start and end are valid, and not the same place
	if(start != null && end != null && !start.equals(end)){
		var mode = $("input[type='radio'][name='mode']:checked").val();
		//create the diretion request
		var request = {
			origin: start,
			destination: end,
			travelMode: google.maps.TravelMode[mode],
			provideRouteAlternatives: true
		};

		//actually route the directions using the request
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK)
				directionsDisplay.setDirections(response);
		});

		//show direction panel
		$("#"+"directions-cell").show("fast");
		infowindow.close();

		//make sure directions are placed on the map
		directionsDisplay.setMap(map);
		google.maps.event.trigger(map, 'resize');
	}
	//if invalid data, clear the map
	else{
		//hide direction panel
		$("#"+"directions-cell").hide("fast");

		//remove directions
		directionsDisplay.setMap(null);
	}
}

//remove route and any google maps markers from map and directions-cell
function clearRoute(){
	$('#jump_autocomplete, #start_autocomplete, #end_autocomplete').val('');
	$('#jump_A, #start_A, #end_A').val(0);
	start = null;
	end = null;
	//hide directions panel
	$("#"+"directions-cell").hide("fast");

	//remove directions
	directionsDisplay.setMap(null);

	//remove place markers
	clearPlaceMarkers();
}

//print just the map with all overlays/icons/direction polyline
function printMap(){
	$('#main-content').height($('body').height());
	$('#main-content').width($('body').width());
	$('#map-canvas').height($('body').height());
	$('#map-canvas').width($('body').width());

	window.print();
	
	$('#main-content').height('');
	$('#main-content').width('');
	$('#main-content').height('');
	$('#map-canvas').width('');
}

//print just the text directions
function printDirections(){
	var newWindow = window.open();

	newWindow.document.write('<html><head><title>UMass Parking Services Interactive Map</title><link rel="stylesheet" type="text/css" href="stylesheets/directions-print.css"></head><body>');
	var directions = window.document.getElementById("directions-cell");
	var disclaimer = window.document.getElementById("disclaimer");
	newWindow.document.write(directions.innerHTML);
	newWindow.document.write(disclaimer.innerHTML);
	newWindow.document.write('</body></html>');

    function printWindow() {
    	setTimeout(function() {
			newWindow.focus();
			newWindow.print();
			newWindow.close();
		}, 100);
    }
    newWindow.onload = printWindow();
}

//determine which stylesheet to use, mobile or desktop
function isMobile() {
	if (navigator.userAgent.match(/Mobi/))
		return true;
	return false;
  // try{ document.createEvent("TouchEvent"); return true; }
  // catch(e){ return false; }
}
function adjustStyle(width) {
	if (isMobile()){
		mobile = true;
		$("#stylesheet").attr("href", "stylesheets/map-mobile.css");
	}
	else{
		mobile = false;
		$("#stylesheet").attr("href", "stylesheets/map.css"); 
	}
}

//edit to info windows so that there is only ever 1 open, the default google maps POI infowindow, or ours
//check this piece if google maps updates and this functionality breaks
function fixInfoWindow() {
	//Here we redefine set() method.
	//If it is called for map option, we hide InfoWindow, if "noSupress" option isnt true.
	//As Google doesn't know about this option, its InfoWindows will not be opened.
	var set = google.maps.InfoWindow.prototype.set;
	google.maps.InfoWindow.prototype.set = function (key, val) {
		if (key === "map" && val != null) {
			//if our window opened
			if(this.get("app") == 0){
				if(defaultInfoWindow && defaultInfoWindow.map != null)
					defaultInfoWindow.close();

				if(directionInfoWindow && directionInfoWindow.map != null)
					directionInfoWindow.close();

				//pan to the infowindow if we can
				if(val != null && this.position != null && this.position != undefined)
					map.panTo(this.position);
			}

			//if direction window opened
			else if(this.get("app") == 1){
				if(defaultInfoWindow && defaultInfoWindow.map != null)
					defaultInfoWindow.close();

				if(infowindow && infowindow.map != null)
					infowindow.close();
			}

			//if default window opened
			else{
				if(infowindow && infowindow.map != null)
					infowindow.close();

				if(directionInfoWindow && directionInfoWindow.map != null)
					directionInfoWindow.close();

				defaultInfoWindow = this;
			}

			//ensure directions buttons are set up correctly
			if($(this.content).find('#direction-buttons').length > 0)
				$(this.content).find('#direction-buttons').remove();
			var footer = generateInfoWindowFooter(this.getPosition());
			$(this.content).append(footer);
		}

		set.apply(this, arguments);
	}
}
fixInfoWindow();

// The panning controls are wrongly binded by Google.
// @see https://code.google.com/p/gmaps-api-issues/issues/detail?id=4598
$('div').on('touchstart', '.gmnoprint div[title^=Pan]', function () {
	$(this).trigger('click');
	return false;
});

//call adjust style method on load and everytime the window resizes
$(function() {
	adjustStyle($(this).width());
	// $(window).resize(function() {
	// 	adjustStyle($(this).width());
	// });
});

//allow show and hide jquery events to be bindable
(function ($) {
  $.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
      this.trigger(ev);
      return el.apply(this, arguments);
    };
  });
})(jQuery);



var printMap2 = function(map) {
  map.setOptions({
    mapTypeControl: false,
    zoomControl: false,
    streetViewControl: false,
    panControl: false
  });
 
  var popUpAndPrint = function() {
    dataUrl = [];
 
    $('#map-canvas canvas').filter(function() {
      dataUrl.push(this.toDataURL("image/png"));
    })
 
    var container = document.getElementById('map-canvas');
    var clone = $(container).clone();
 
    var width = container.clientWidth
    var height = container.clientHeight
 
    $(clone).find('canvas').each(function(i, item) {
      $(item).replaceWith(
        $('<img>')
          .attr('src', dataUrl[i]))
          .css('position', 'absolute')
          .css('left', '0')
          .css('top', '0')
          .css('width', width + 'px')
          .css('height', height + 'px');
    });
 
    var printWindow = window.open('', 'PrintMap',
      'width=' + width + ',height=' + height);
    printWindow.document.writeln($(clone).html());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
 
    map.setOptions({
      mapTypeControl: true,
      zoomControl: true,
      streetViewControl: true,
      panControl: true
    });
  };
 
  setTimeout(popUpAndPrint, 500);
};