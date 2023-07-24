/* eslint-disable */
export const displayMap = (locations) => {
  L.mapquest.key = 'ck2OXUAJsF0iz999XGQ62jyXo8AXOVp7';

  // 'map' refers to a <div> element with the ID map
  var map = L.mapquest.map('map', {
    center: [0, 0],
    layers: L.mapquest.tileLayer('light'),
    scrollWheelZoom: false,
    zoomAnimation: true,
    zoomControl: false,
    zoom: 12,
  });

  var group = [];

  locations.forEach((loc) => {
    const customIcon = L.divIcon({
      html: '<div class="marker"></div>',
    });

    // creating marker and adding to map
    var marker = L.marker([loc.coordinates[1], loc.coordinates[0]], {
      icon: customIcon,
    }).addTo(map);

    //creating popup
    const popup = L.popup({
      closeButton: false, // Optionally, set to true if you want a close button in the popup
    });

    popup.setContent(
      `<b>${loc.description}</b><br>Day: ${loc.day} <br>location: ${loc.coordinates[1]}  ${loc.coordinates[0]}<br>`
    );

    marker.bindPopup(popup).openPopup();

    group.push(marker.getLatLng());
  });

  //fitting the locations
  const bounds = L.latLngBounds(group);

  // Fit the map view to the markers' bounds
  map.fitBounds(bounds, { padding: [150, 150, 150, 150] });
};
