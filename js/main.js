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

const images = [
  { url: "./img/icons/mx_amenity_marketplace.png",   id: "mx_amenity_marketplace" },
  { url: "./img/icons/mx_shop.png",                  id: "mx_shop" },
  { url: "./img/icons/mx_shop_bakery.png",           id: "mx_shop_bakery" },
  { url: "./img/icons/mx_shop_butcher.png",          id: "mx_shop_butcher" },
  { url: "./img/icons/mx_shop_copyshop.png",         id: "mx_shop_copyshop" },
  { url: "./img/icons/mx_shop_dairy.png",            id: "mx_shop_dairy" },
  { url: "./img/icons/mx_shop_greengrocer.png",      id: "mx_shop_greengrocer" },
  { url: "./img/icons/mx_shop_mall.png",             id: "mx_shop_mall" },
  { url: "./img/icons/mx_shop_supermarket.png",      id: "mx_shop_supermarket" },
  { url: "./img/icons/mx_amenity_cinema.png",        id: "mx_amenity_cinema" },
  { url: "./img/icons/mx_amenity_library.png",       id: "mx_amenity_library" },
  { url: "./img/icons/mx_amenity_theatre.png",       id: "mx_amenity_theatre" },
  { url: "./img/icons/mx_building_type_basilica.png",id: "mx_building_type_basilica" },
  { url: "./img/icons/mx_garden.png",                id: "mx_garden" },
  { url: "./img/icons/mx_leisure_playground.png",    id: "mx_leisure_playground" },
  { url: "./img/icons/mx_music.png",                 id: "mx_music" },
  { url: "./img/icons/mx_tourism_attraction.png",    id: "mx_tourism_attraction" },
  { url: "./img/icons/mx_tourism_museum.png",        id: "mx_tourism_museum" },
  { url: "./img/icons/mx_amenity_bar.png",           id: "mx_amenity_bar" },
  { url: "./img/icons/mx_amenity_restaurant.png",    id: "mx_amenity_restaurant" },
  { url: "./img/icons/mx_amenity_dentist.png",       id: "mx_amenity_dentist" },
  { url: "./img/icons/mx_amenity_pharmacy.png",      id: "mx_amenity_pharmacy" },
  { url: "./img/icons/mx_laboratory.png",            id: "mx_laboratory" },
  { url: "./img/icons/mx_amenity_bus_station.png",   id: "mx_amenity_bus_station" },
  { url: "./img/icons/mx_bicycle_transport.png",     id: "mx_bicycle_transport" },
  { url: "./img/icons/mx_locomotive.png",            id: "mx_locomotive" },
  { url: "./img/icons/mx_railway_station_subway_map.png",          id: "mx_railway_station_subway_map" }
]

Promise.all(
  images.map(
    img => new Promise((resolve, reject) => {
      map.loadImage(img.url, function (error, res) {
        if (error) throw error;
        map.addImage(img.id, res, { 'sdf': true })
        resolve();
      })
    })
  )).then(() => {

    // console.log("Images Loaded");

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
        'type': 'symbol',
        'metadata': {
          'legend': layer['legend'],
          'color': layer['color']
        },
        'paint': {
          'icon-color': layer['color']
        },
        'layout': {
          'visibility': layer['visibility'],
          // get the icon name from the source's "icon" property
          // concatenate the name to get an icon from the style's sprite sheet
          'icon-image': ['get', 'icon'],
          'icon-size': 0.5,
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
          'name': 'culture-layer',
          'color': '#ed483f',
          'visibility': 'visible',
          'legend': '🖼️ Culture'
        },
        {
          'name': 'resto_bars-layer',
          'color': '#2274ba',
          'visibility': 'visible',
          'legend': '🍽️ Resto/Bars'
        },
        {
          'name': 'commerces-layer',
          'color': '#f6c73c',
          'visibility': 'visible',
          'legend': '🛒 Commerces'
        },
        {
          'name': 'sante-layer',
          'color': '#8b3993',
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

  })
