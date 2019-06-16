function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 9.9333, lng: -84.0833},
      zoom: 13
    });
  
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var guardar = document.getElementById('pac-inputGuardar');
    var autocomplete = new google.maps.places.Autocomplete(input);
    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
  
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    autocomplete.bindTo('bounds', map);
  
    autocomplete.setFields(
      ['formatted_address','address_components', 'geometry', 'icon', 'name','rating','types','opening_hours',
      'formatted_phone_number','website','photo']
    );
  
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
  
    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
  
      if (!place.geometry) {
        window.alert("No hay detalles de ese lugar: '" + place.name + "'");
        return;
      }
  
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      }else{
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
  
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
  
      var address = '';
      address = [
      ('Tipo: '+place.types[0] || ''),
      ('Telefono: '+place.formatted_phone_number || ''),
      ('Rating: '+place.rating || ''),
      ('Horario: '+place.opening_hours.weekday_text || ''),
      ('Website: '+place.website || ''),
      ].join(' ');
  
      infowindowContent.children['place-icon'].src = place.icon;
      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent = address;
      infowindow.open(map, marker);
  
      guardar.addEventListener("click", function(){
        document.getElementById("coordenadasTxt").value=place.geometry.location;
        document.getElementById("nombreTxt").value=place.name;
        document.getElementById("direccionTxt").value=place.formatted_address;
      });
    });
    autocomplete.setTypes('establishment');
}