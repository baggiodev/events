var map;
var ajaxcall;
var performerarray = [];

function initMap(lat1, lng1) {
    var myLatLng = {
        lat: lat1,
        lng: lng1
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: myLatLng
    });
    for (var i = 0; i < ajaxcall.events.event.length; i++) {
        var eventLatLng = {
            lat: parseFloat(ajaxcall.events.event[i].latitude),
            lng: parseFloat(ajaxcall.events.event[i].longitude)
        };
        console.log(eventLatLng);
        marker = new google.maps.Marker({
            position: eventLatLng,
            map: map,
            title: ajaxcall.events.event[i].title
        });
    }
}
var userlat;
var userlng;
var userlocation = "grand rapids";
var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userlocation + "&key=AIzaSyCvEv7FKUz87tJJ1WOrg2hvzEiKqRp80Yc";
$.ajax({
    url: queryURL,
    method: "GET"
}).done(function(response) {
    userlat = parseFloat(response.results[0].geometry.location.lat);
    userlng = parseFloat(response.results[0].geometry.location.lng);
    eventajax();
});

function eventajax() {
    eventurl = "http://api.eventful.com/json/events/search?q=music&app_key=GCqrsqLnPhVxFkQD&location=" + userlocation
    $.ajax({
        url: eventurl,
        method: "GET",
        dataType: "jsonp"
    }).done(function(response) {
        ajaxcall = response;
        eventcall();
        initMap(userlat, userlng);
        console.log(ajaxcall);
    });

    function eventcall() {
        // makes a main div that needs to be appended to the page
        var mainDiv = $("<div>");
        for (var i = 0; i < ajaxcall.events.event.length; i++) {
            var temp = $("<div>");
            temp.addClass("events");
            // makes a div inside the div for the title
            var title = $("<div>");
            var divtitle = ajaxcall.events.event[i].title;
            title.text("Event Title: " + divtitle);
            temp.append(title);
            // grabs address and makes a div to put inside of temp
            var address = $("<div>");
            var divaddress = ajaxcall.events.event[i].venue_address;
            address.html("Address: " + divaddress + "<p>Venue: " + ajaxcall.events.event[i].venue_name);
            temp.append(address);
            var divperformer = $("<div>");
            var performer;
            if (ajaxcall.events.event[i].performers) {
                performer = ajaxcall.events.event[i].performers.performer;
                if (performer.name) {
                    performer = performer.name;
                    divperformer.html("Performer: " + performer);
                }
                if (Array.isArray(performer)) {
                    for (var n = 0; n < performer.length; n++) {
                        performerarray.push("<p>Performer: " + performer[n].name + "</p>");

                    }
                    divperformer.append(performerarray);
                }
            } else {
                performer = "Performer: N/A";
                divperformer.html(performer);

            }
            temp.append(divperformer);
            if (performer === "Performer: N/A") {

            } else {
                var button = $("<button>Spotify</button>");
                temp.append(button);
            }
            mainDiv.append(temp);
        }
        $("#maindivevent").append(mainDiv);
    }
}