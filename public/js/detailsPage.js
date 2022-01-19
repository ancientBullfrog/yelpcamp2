mapboxgl.accessToken = mapData.mapToken;

const map = new mapboxgl.Map({
   container: 'map', // container ID
   // style: 'mapbox://styles/ovenroasted/cks4vpxbpa9kt18nxuschsexx', // style URL
   // style: 'mapbox://styles/mapbox/streets-v11', // style URL
   style: 'mapbox://styles/mapbox/light-v10', // style URL
   center: mapData.campground.geometry.coordinates, // starting position [lng, lat]
   zoom: 13 // starting zoom
});

/**
 * draggable tru if in edit mode / show edit popup
 */
const marker = new mapboxgl.Marker({ draggable: true })
   .setLngLat(mapData.campground.geometry.coordinates)
   .setPopup(
      new mapboxgl.Popup({ offset: 25 })
         .setHTML(
            `<h3>${mapData.campground.title}</h3><p>${mapData.campground.location}</p>`
         )
   )
   .addTo(map);

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

function onDragEnd() {
   /**
    * Returns new geocoding locations 
    * use to update map position - send to app endpoint campgrounds/:id/edit/:lng/:lat
    * or send with post data - hidden fields?
    */
   const lngLat = marker.getLngLat();
   console.log(lngLat);
}

// marker.addEventListener('dragend', onDragEnd);
marker.on('dragend', onDragEnd);