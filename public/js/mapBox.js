export const displayMap = (locations) => {
mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2YWNjOSIsImEiOiJjazZtOTRhbXUwY2dhM3VydTkxa2w0aDl0In0.Jq-b7-s4Igw_pDvigfxmWQ';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/devacc9/ck6m9m5ga0rdr1ip428jqj7pm',
// center: [3.4360,55.3781],
zoom: 1
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);
    bounds.extend(loc.coordinates);
    new mapboxgl.Popup({
        offset: 30
      })
        .setLngLat(loc.coordinates)
        .setHTML(`${loc.description}</p>`)
        .addTo(map);
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        left: 200,
        bottom: 200,
        right: 200
    }
});
}