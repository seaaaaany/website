// Fetch all week geojson data
var APIlink_earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Fetch geojson data
var APIlink_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// Scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 3;
};


var earthquakes = new L.LayerGroup();

// Perform a GET request: APIlink_earthquakes
d3.json(APIlink_earthquakes, function (geoJson) {
    // Send the geoJson.features array to the createFeatures function while get responsed

    L.geoJSON(geoJson.features, {
        // using the pointToLayer option to create a CircleMarker
        // By default simple markers are drawn for GeoJSON Points. We can alter this by passing a pointToLayer
        // function in a GeoJSON options object when creating the GeoJSON layer
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },

        style: function (geoJsonFeature) {
            return {
                fillColor: chooseColor(geoJsonFeature.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup(
                "<h5 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h5> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }

    }).addTo(earthquakes);

});

// create a layer group for faultlines
var plateBoundary = new L.LayerGroup();

// Perform a GET request:: APIlink_plates
d3.json(APIlink_plates, function (geoJson) {
    // Send the geoJson.features array of objects object to the L.geoJSON method while we get responsed.
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 1,
                color: 'blue'
            }
        },
    }).addTo(plateBoundary);
})



// define a function to return a color based on the magnitude
function chooseColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'blue'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return '#58C9CB'
    }
};


// Create the map
function createMap() {

    // Define street map and dark map

    var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    });

    var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    });

    var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    });


    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    });


    // Baselayer object
    var baseLayers = {
        "High Contrast": highContrastMap,
        "Street": streetMap,
        "Dark": darkMap,
        "Satellite": satellite
    };

    // Overlay object
    var overlays = {
        "Earthquakes": earthquakes,
        "Plate Boundaries": plateBoundary,
    };

    // initialize the map on the "mymap" div with a given center and zoom
    mymap = L.map('mymap', {
        center: [30, 0],
        zoom: 2,
        layers: [highContrastMap, earthquakes]
    })

    // Creates an attribution control with the given layers.
    // Base layers will be switched with radio buttons, while overlays will be switched with checkboxes.
    // Note that all base layers should be passed in the base layers object, but only one should be added
    // to the map during map instantiation
    L.control.layers(baseLayers, overlays).addTo(mymap);


    // Create the legend control
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);
}




// define a function to create the heat map
function createHeatMap() {


    var mapHeat = L.map('mymapHeat', {
        center: [37.7749, -122.4194],
        zoom: 2
    });

    // add a tile layer to add to our map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
        id: 'mapbox.dark',
        maxZoom: 18,
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    }).addTo(mapHeat);

    // get data
    d3.json(APIlink_earthquakes, function (geoJson) {

        // initialize an empty array to store the coordinates. This array will then then be passed to leaflet-heat.js
        var heatArray = []
        var features = geoJson.features;

        // loop through each feature
        for (var i = 0; i < features.length; i++) {
            var coords = features[i].geometry;

            // if coordinates are available to proceed
            if (coords) {
                heatArray.push([coords.coordinates[1], coords.coordinates[0]])
            }
        }
        var heat = L.heatLayer(heatArray, {
            radius: 10,
            minOpacity: 0.8
        }).addTo(mapHeat);
    });

}



// define a function to create the heat map
function createHeatCluster() {


    var mapCluster = L.map('mymapCluster', {
        center: [37.7749, -122.4194],
        zoom: 2
    });

    // add a tile layer to add to our map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
        id: 'mapbox.streets-basic',
        maxZoom: 18,
        accessToken: 'pk.eyJ1Ijoic2VhYWFhYW4iLCJhIjoiY2pod3k4ZXlnMDY0ZTNxbzZjYXluNTBlZSJ9.g2ayihgN7qE590u8HH6XTQ'
    }).addTo(mapCluster);

    // get data
    d3.json(APIlink_earthquakes, function (geoJson) {

        // initialize an empty array to store the coordinates. This array will then then be passed to leaflet-heat.js
        var markers = L.markerClusterGroup();
        var features = geoJson.features;

        // loop through each feature
        for (var i = 0; i < features.length; i++) {
            var coords = features[i].geometry;

            // if coordinates are available to proceed
            if (coords) {
                markers.addLayer(L.marker([coords.coordinates[1], coords.coordinates[0]]))
            }
        }

        mapCluster.addLayer(markers);
    });

}




// call the create map function
createMap()
createHeatMap()
createHeatCluster()
