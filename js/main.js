import { layerControlSimple } from "./dist/mapbox-layer-control/layerControlSimple.js"
import { layerControlGrouped } from "./dist/mapbox-layer-control/layerControlGrouped.js"

// source: https://github.com/smmaurer/geojson-web-viewer

const mapCenter = [1.444, 43.6055];
const homeCenter = [1.457471183875742, 43.604214231620375];

mapboxgl.accessToken = 'pk.eyJ1IjoiYWx4Z2lyYXJkMiIsImEiOiJjbGV4ZzAydGExODA1M3ZtazByNHMxOGg0In0.7s92oKW7fiNYgqZiG8nw4g';
var map = new mapboxgl.Map({
  center: mapCenter,
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  zoom: 13
});

var setupLayer = function(map, layer) {

  const geojsonName = layer['name'].replace('-layer', '')
  const geojsonUrl = './geojson/' + geojsonName + '.geojson';

  map.addSource( geojsonName,
                 {
                   type: 'geojson',
                   data: geojsonUrl
                 }
               );

  map.addLayer({
    'id': layer['name'],
    'source': geojsonName,
    'type': 'circle' ,
    'metadata': {
      'legend': layer['legend'],
      'color': layer['color']
    },
    'paint': {
      'circle-color': layer['color']
    },
    'layout': {
      'visibility': layer['visibility']
    }
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', layer['name'], (e) => {
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.name;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', layer['name'], () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', layer['name'], () => {
    map.getCanvas().style.cursor = '';
  });

}

map.on('load', function() {

  const layers = [
    {
      'name': 'commerces-layer',
      'color': '#2274ba',
      'visibility': 'none',
      'legend': '🛒 Commerces'
    },
    {
      'name': 'culture-layer',
      'color': '#8b3993',
      'visibility': 'visible',
      'legend': '🖼️ Culture'
    },
    {
      'name': 'resto_bars-layer',
      'color': '#ed483f',
      'visibility': 'visible',
      'legend': '🍽️ Resto/Bars'
    },
    {
      'name': 'sante-layer',
      'color': '#f6c73c',
      'visibility': 'none',
      'legend': '😷 Santé'
    },
    {
      'name': 'transport-layer',
      'color': '#9e9e9e',
      'visibility': 'none',
      'legend': '🚍 Transports'
    }
  ]

  for(var i = 0; i < layers.length; i++) {
    setupLayer(map, layers[i]);
  }

  // Load an image from an external URL.
  map.loadImage(
    './img/home.png',
    (error, image) => {
      if (error) throw error;

      // Add the image to the map style.
      map.addImage('home', image);

      // Add a data source containing one point feature.
      map.addSource('point', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': homeCenter
              }
            }
          ]
        }
      });

      // Add a layer to use the image to represent the data.
      map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'point', // reference the data source
        'layout': {
          'icon-image': 'home', // reference the image
          'icon-size': 0.15
        }
      });
    }
  );

  map.addControl(new mapboxgl.GeolocateControl());
  map.addControl( new layerControlSimple({
    layers: layers.map(function(layer) { return layer['name'] })
  }), "top-left");
});
