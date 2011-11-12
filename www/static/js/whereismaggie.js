(function() {
  var map             = null,
      confirmationMap = null,
      fullMap         = null,
      newyork         = new google.maps.LatLng(40.74, -73.99),
      marathon        = new google.maps.LatLng(40.601963, -74.061928),
      start           = "on 11/06 at 10:10am",
      api_base_url    = "http://marathon.maggiesmeals.com/api/v1/sighting/",
      sightings       = null,
      marker          = null,
      disabled        = false;

  function initUI() {
    var myOptions = {
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: newyork
    };
  
    map = new google.maps.Map(document.getElementById("map"), myOptions);
  
    refreshSightings(function(results) {
      var last_sighting = (results && (results.length > 0)) ? results[0] : null;
      
      if (last_sighting) {
        var loc = new google.maps.LatLng(last_sighting.location[0], last_sighting.location[1]);

        setTimeout(function() {
          map.setCenter(loc);
          google.maps.event.trigger(map, 'resize');
        }, 1000);
  
        var m = new google.maps.Marker({ 
          position: loc,
          map: map,
          title: "Maggie is here!",
          animation: google.maps.Animation.DROP
        });
  
        marker = m;
 
        $("#maggie-seen").html("Maggie was last seen " + parseAndPrintDate(last_sighting.time, {verbose: true, html: true}) + ":");
        $("#history-button").css("display", "");
      } else {
        $("#maggie-seen").html("Maggie was not seen anywhere yet, but she starts running here " + start + ":");
  
        var m = new google.maps.Marker({ 
          position: marathon,
          map: map,
          title: "Marathon starts here",
          animation: google.maps.Animation.DROP
        });
  
        setTimeout(function() {
          map.setCenter(marathon);
          google.maps.event.trigger(map, 'resize');
        }, 1000);
      }
    });
  }
 
  function recenterMap() {
    google.maps.event.trigger(map, 'resize');

    if (!sightings) {
      return;
    }

    var last_sighting = (sightings && (sightings.length > 0)) ? sightings[0] : null;
      
    if (last_sighting) {
      var loc = new google.maps.LatLng(last_sighting.location[0], last_sighting.location[1]);
      setTimeout(function() { map.setCenter(loc); }, 1000);
    }
  }
  
  function locate() {
    enableForm();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var loc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
        var myOptions = {
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          center: loc
        };
        
        confirmationMap = new google.maps.Map(document.getElementById("confirmation-map"), myOptions);

        var m = new google.maps.Marker({ 
          position: loc,
          map: confirmationMap,
          title: "Your location",
          animation: google.maps.Animation.DROP
        });
  
        $("input#latitude").val(position.coords.latitude);
        $("input#longitude").val(position.coords.longitude);

        setTimeout(function() { 
          confirmationMap.setCenter(loc); 
          google.maps.event.trigger(confirmationMap, 'resize');
        }, 2000);
      }, function(e) { alert("Unable to get location"); });
    }
  }
  
  function postSighting(name, message, latitude, longitude, address, callback) {
    var sighting_str = '{ "person": "'+name+'", "message": "'+message+'", "location": ['+latitude+', '+longitude+'], "address": "'+address+'" }';
  
    $.ajax({
      type:        "POST",
      url:         api_base_url,
      dataType:    'json',
      data:        sighting_str,
      contentType: 'application/json',
      success:     callback,
      error:      function() {
        alert("An error occurred while saving your location");
        $(".ui-dialog").dialog('close');
      }
    });
  }

  function enableForm() {
    disabled = false;
    $("#address-form").css("display", "none");
    $("#confirm-or-edit").css("display", "");
    $("input#address").val("");
    $("input#name").val("");
    $("input#message").val(""); 
    $("input#latitude").val("");
    $("input#longitude").val("");

    $("input#name").removeAttr("disabled");
    $("input#message").removeAttr("disabled");
    $("input#latitude").removeAttr("disabled");
    $("input#longitude").removeAttr("disabled");
    $("input#address").removeAttr("disabled");
  }

  function disableForm() {
    disabled = true;
    $("input#name").attr("disabled", "disabled");
    $("input#message").attr("disabled", "disabled");
    $("input#latitude").attr("disabled", "disabled");
    $("input#longitude").attr("disabled", "disabled");
    $("input#address").attr("disabled", "disabled");
  }
  
  function confirmLocation() {
    alert("Sorry, posting new locations has been disabled, NYC Marathon 2011 is over!");
    return;

    if (disabled) {
      return;
    }

    var name      = $("input#name").val();
    var message   = $("input#message").val(); 
    var latitude  = $("input#latitude").val();
    var longitude = $("input#longitude").val();
    
    var loc       = new google.maps.LatLng(latitude, longitude);
    var geocoder  = new google.maps.Geocoder();

    disableForm();

    geocoder.geocode({'latLng': loc}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var address = (results && (results.length > 0)) ?  results[0].formatted_address : "Unknown address";
  
        postSighting(name, message, latitude, longitude, address, function() {
          if (marker) {
            marker.setMap(null);
          }
  
          var m = new google.maps.Marker({ 
            position: loc,
            map: map,
            title: "Maggie is now here!",
            animation: google.maps.Animation.DROP
          });
          
          marker = m;
  
          $("#maggie-seen").html("Thanks for sharing your location! Maggie is now here:");
          $("#history-button").css("display", "");
  
          map.setZoom(12);
          setTimeout(function() { 
            map.setCenter(loc); 
            google.maps.event.trigger(map, 'resize');
          }, 1000);
  
          sightings = null;
          refreshSightings();
  
          $('.ui-dialog').dialog('close');
        });
      }
    });

    $("#locate-maggie").css("display", "none");
  }
  
  function verifyAddress() {
    var geocoder  = new google.maps.Geocoder();
    var address   = $("input#address").val();

    if (!address) {
      alert("Please enter an address");
      return;
    }

    address += "New York, NY";
  
    geocoder.geocode({'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var loc = (results && (results.length > 0)) ? results[0].geometry.location : null;

        if (!loc) {
          alert("Please enter a valid address");
          return;
        }

        setTimeout(function() {
          confirmationMap.setCenter(loc); 
          google.maps.event.trigger(confirmationMap, 'resize');
        }, 1000);

        var m = new google.maps.Marker({ 
          position: loc,
          map: confirmationMap,
          title: "Manual Address",
          animation: google.maps.Animation.DROP
        });
        
        $("input#latitude").val(loc.lat());
        $("input#longitude").val(loc.lng());
      } else {
        alert("Unable to verify address");
      }
    });
  }

  function refreshSightings(callback) {
    if (!sightings) {
      var url = api_base_url + "?format=json&limit=10000";
      var sightings_list = $("#sightings-list");
      sightings_list.html("");
      
      $.ajax({
        url:      url, 
        type:     'GET',
        dataType: 'json',   
        success:  function(data) {
          var meta = data.meta;
  
          data.objects.sort(function(a, b) {
            if (a.time > b.time) {
              return -1;
            }  else if (a.time < b.time) {
              return 1;
            }
  
            return 0;
          });
  
          $.each(data.objects, function(key, val) {
            var sighting = val;
            var li = $("<li>").addClass("ui-li").addClass("ui-li-static").addClass("ui-body-c");
            li.append($("<p>").addClass("ui-li-aside").addClass("ui-li-desc").html(parseAndPrintDate(sighting.time, {verbose: false, html: true})));
            li.append($("<h3>").addClass("ui-li-heading").html(sighting.person));
            li.append($("<p>").addClass("ui-li-desc").append($("<strong>").html(sighting.message)));
            li.append($("<p>").addClass("ui-li-desc").html("Near " + sighting.address));
            sightings_list.append(li);
          });
  
          sightings = data.objects;
  
          if (callback) {
            callback(sightings);
          }
        },
        error: function() { if (callback) { callback(); } }
      });
    } else {
      if (callback) {
        callback(sightings);
      }
    }
  }

  function createFullMap() {
    if (fullMap) {
      setTimeout(function() {
         google.maps.event.trigger(fullMap, 'resize');
        fullMap.setCenter(newyork);
      }, 2000);
      return;
    }

    var last_sighting = (sightings && (sightings.length > 0)) ? sightings[0] : null;
    var loc = new google.maps.LatLng(last_sighting.location[0], last_sighting.location[1]);

    var myOptions = {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: loc
    };

    fullMap = new google.maps.Map(document.getElementById("full-map"), myOptions);

    if (!sightings) {
      return;
    }

    $.each(sightings, function(key, val) {
      var sighting = val;
      var loc = new google.maps.LatLng(sighting.location[0], sighting.location[1]);
  
      var m = new google.maps.Marker({ 
        position: loc,
        map: fullMap,
        title: "Maggie is here!",
      });
    });

    setTimeout(function() {
      google.maps.event.trigger(fullMap, 'resize');
      fullMap.setCenter(newyork);
    }, 2000);
  }

  // Date Utils

  function isToday(d) {
    var now = new Date();
  
    return ((now.getMonth() == d.getMonth()) &&
            (now.getDate() == d.getDate()) &&
            (now.getFullYear() == d.getFullYear()))
  }
  
  function parseAndPrintDate(d_str, config) {
    // Parsing date manually because the iphone implementation of Date() is a POJ!
    var arr = d_str.split(/[-T:]/);
    var d = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
    var str = "";
  
    if (!isToday(d)) {
      if (config.verbose) { str += "on "; }
      var month = d.getMonth() + 1;
      var day = d.getDate();
  
      if (month < 10) { month = "0" + month };
      if (day < 10)   { day   = "0" + day   };
  
      str += month + "/" + day + "/" + d.getFullYear() + " ";
    } else {
      str += "Today ";
    }
  
    if (config.verbose) { str += "at ";      }
    if (config.html)    { str += "<strong>"; }
  
    var ap      = "AM";
    var hour    = d.getHours();
    var minutes = d.getMinutes();
  
    if (hour > 11) { ap = "PM";         }
    if (hour > 12) { hour = hour - 12;  }
    if (hour == 0) { hour = 12;         }
    if (hour < 10) { hour = "0" + hour; }
    if (minutes < 10) { minutes = "0" + minutes; }
  
    str += hour + ":" + minutes;
  
    if (config.html) {  str += "</strong>"; }
  
    str += ap;
  
    return str;
  }
  
  $('#home').live('pageinit',         function(event) { initUI();           });
  $('#home').live('pageshow',         function(event) { recenterMap();      });
  $('#sightings').live('pageinit',    function(event) { refreshSightings(); });
  $('#locate-maggie').live('tap',     function(event) { locate(); });
  $('#confirm-location').live('tap',  function(event) { confirmLocation(); });
  $('#edit-location').live('tap',     function(event) { 
    event.preventDefault();
    $("#address-form").css("display", ""); 
    $("#confirm-or-edit").css("display", "none");
  });
  $('#verify-address').live('tap',    function(event) { verifyAddress(); });
  $('#confirm-address').live('tap',   function(event) { confirmAddress() });
  $('#refresh-button').live('tap',    function(event) { 
    event.preventDefault();
    map = null; 
    sightings = null;
    initUI(); 
  });
  $('#fullmap-button').live('tap',    function(event) { createFullMap(); });
})();
