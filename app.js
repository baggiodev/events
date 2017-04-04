var map;
var ajaxcall;
var performerarray = [];
var test;
function initMap(lat1, lng1) {
        
    console.log(lat1);
    console.log(lng1);
    var myLatLng = {
        lat: lat1,
        lng: lng1
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 9,
        center: myLatLng
    });
    for (var i = 0; i < ajaxcall.events.event.length; i++) {
        var eventLatLng = {
            lat: parseFloat(ajaxcall.events.event[i].latitude),
            lng: parseFloat(ajaxcall.events.event[i].longitude)
        };
        marker = new google.maps.Marker({
            position: eventLatLng,
            map: map,
            title: ajaxcall.events.event[i].title,
            infoWindow: new google.maps.InfoWindow({
                content: "<div>"+ajaxcall.events.event[i].title+"</div>"+"<div>"+ajaxcall.events.event[i].description+"</div>"
        })
        })
        var contentString = '<div id="content">' +
            "Event Title: " + ajaxcall.events.event[i].title + "</div>"
        marker.addListener("click", function() {
            (this).infoWindow.open(map, marker);
        });
    }
}
var userlat;
var userlng;
var userlocation;
var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userlocation + "&key=AIzaSyCvEv7FKUz87tJJ1WOrg2hvzEiKqRp80Yc";

function start(){
$.ajax({
    url: queryURL,
    method: "GET"
}).done(function(response) {
    debugger;
    userlat = parseFloat(response.results[0].geometry.location.lat);
    userlng = parseFloat(response.results[0].geometry.location.lng);
    console.log("userlat " + userlat);
    console.log("userlng " + userlng);
    eventajax();
});
}

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
            var temp = $("<div id=" + "'" + ajaxcall.events.event[i].title + "'" + ">");
            temp.addClass("events");
            // makes a div inside the div for the title
            var title = $("<div>");
            var divtitle = ajaxcall.events.event[i].title;
            title.html("<h3>Event Title: " + divtitle+"</h3>");
            temp.append(title);
            // displays start time
            var divstart = $("<div>");
            var start = ajaxcall.events.event[i].start_time;
            divstart.append("Start date and time: " + start);
            temp.append(divstart);
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
                    var button = $("<button>" + performer + "</button>");
                    button.attr("data-performer", performer)
                    temp.append(button);
                }
                if (Array.isArray(performer)) {
                    for (var n = 0; n < performer.length; n++) {
                        performerarray.push("<p>Performer: " + performer[n].name + "</p>");
                        var button = $("<button>" + performer[n].name + "</button>");
                        button.attr("data-performer", performer[n].name)
                        temp.append(button);
                    }
                    divperformer.append(performerarray);
                }
            } else {
                performer = "Performer: N/A";
                divperformer.html(performer);

            }
            temp.append(divperformer);
            mainDiv.append(temp);
        }
        $("#maindivevent").html(mainDiv);
    }
}

window.onload = function() {
    $(".submitBtn").click(function(){
        userlocation = $("#searchInput").val();
        console.log(userlocation);
        start();
    })
}