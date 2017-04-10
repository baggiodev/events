var config = {
    apiKey: "AIzaSyDkvt1qvr4ffpF-rps-qW8DxzYMwFEtjqQ",
    authDomain: "livemusicfinder-d1e8a.firebaseapp.com",
    databaseURL: "https://livemusicfinder-d1e8a.firebaseio.com",
    projectId: "livemusicfinder-d1e8a",
    storageBucket: "livemusicfinder-d1e8a.appspot.com",
    messagingSenderId: "422966048796"
};
firebase.initializeApp(config);
var dataRef = firebase.database();
var map;
var ajaxcall;
var performerarray = [];
var test
var perfList;
var currArtist;
var count = 1;
var s = 0;
var colorarray = ["orange","chocolate","white","yellow","maroon","grey"];
// var cityRef = dataRef.child("places").child(city);
$(".contentContainer").hide();
$(".sidebar").hide();
$(".popSearch").hide();
function initMap(lat1, lng1) {
    //makes map
    var myLatLng = {
        lat: lat1,
        lng: lng1
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: myLatLng
    });
}
var userlat;
var userlng;
var userlocation;
var queryURL;

function start(){
    //ajax call to get coords for google maps
$.ajax({
    url: queryURL,
    method: "GET"
}).done(function(response) {
    userlat = parseFloat(response.results[0].geometry.location.lat);
    userlng = parseFloat(response.results[0].geometry.location.lng);
    eventajax();
});
}

function eventajax() {
    //ajax call for eventful to grab JSON
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
            var temp = $("<div id=" + "'" + i + "'" + ">");
            temp.addClass("events");
            // makes a div inside the div for the title
            var title = $("<div>");
            var divtitle = ajaxcall.events.event[i].title;
            title.html("<h3>("+(i+1)+") "+divtitle+"</h3>");
            temp.append(title);
            var number = $("<h2>")
            number.html(i+1);
            // displays start time
            var divstart = $("<div>");
            var start = moment(ajaxcall.events.event[i].start_time).format("dddd, MMMM Do YYYY, h:mm:ss a");
            divstart.append(start);
            temp.append(divstart);
            // grabs address and makes a div to put inside of temp
            var address = $("<div>");
            var divaddress = ajaxcall.events.event[i].venue_address;
            address.html("Address: " + divaddress + "<p>Venue: " + ajaxcall.events.event[i].venue_name);
            temp.append(address);
            var viewonmap = $("<button>");
            viewonmap.attr("id",i);
            viewonmap.text("Click here to add a marker to the map!")
            viewonmap.addClass("markerbutt");
            temp.append(viewonmap);
            var divperformer = $("<div>");
            var performer;
            //checks if theres a perfomer
            if (ajaxcall.events.event[i].performers) {
                performer = ajaxcall.events.event[i].performers.performer;
                if (performer.name) {
                    performer = performer.name;
                    temp.addClass(performer.replace( /\s/g, ""));
                    divperformer.html("Performer: " + performer);
                    var button = $("<button class='spotify'>" + performer + "</button>");
                    button.attr("data-performer", performer)
                    temp.append(button);
                }
                //if performer is an array make multiple buttons for it and list it
                if (Array.isArray(performer)) {
                    for (var n = 1; n < performer.length; n++) {
                        performerarray.push("<p>Performer: " + performer[n].name + "</p>");
                        var button = $("<button class='spotify'>" + performer[n].name + "</button>");
                        button.attr("data-performer", performer[n].name)
                        temp.addClass((performer[n].name).replace( /\s/g, ""));
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
        $(".contentContainer").html(mainDiv);
    }
}




function checkIfExists(place) {
    var cityCount = {
    city: city,
    count: count
    }
}
//whenever a marker is clicked
$(document).on("click",".markerbutt",function(){
    //remove button clicked
    (this).remove();
    //grabs the int version of the id
    var whichmark = parseInt($(this).attr("id"));
    var eventLatLng = {
            lat: parseFloat(ajaxcall.events.event[whichmark].latitude),
            lng: parseFloat(ajaxcall.events.event[whichmark].longitude)
        };
            map.panTo(eventLatLng);
            //makes a marker
    marker = new google.maps.Marker({
            position: eventLatLng,
            label: (whichmark+1).toString(),
            map: map,
            title: ajaxcall.events.event[whichmark].title,
            markerid: whichmark,
            infoWindow: new google.maps.InfoWindow({
                content: "<div>"+ajaxcall.events.event[whichmark].title+"</div>"+"<div>"+ajaxcall.events.event[whichmark].description+"</div>"
        })
})
    //give marker a click function
    marker.addListener("click", function() {
        var randomcolor = colorarray[s];
        (this).set("label", "");
        (this).infoWindow.open(map, this);
        (this).setIcon('assets/images/' + randomcolor + ".png");
        //grab div with id and give it a  border
        $("#" + (this).markerid).css("border", "5px solid " + randomcolor);
        s++
        if (s === colorarray.length) {
            s = 0;
        }
    });
})
$(document).on("click",".spotify",function() {
    currArtist = $(this).text();
    // Running an initial search to identify the artist's unique Spotify id
    var queryURL = "https://api.spotify.com/v1/search?q=" + currArtist + "&type=artist";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      // Printing the artist id from the Spotify object to console
      var artistID = response.artists.items[0].id;

      // Building a SECOND URL to query another Spotify endpoint (this one for the tracks)
      var queryURLTracks = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";

      // Running a second AJAX call to get the tracks associated with that Spotify id
      $.ajax({
        url: queryURLTracks,
        method: "GET"
      }).done(function(trackResponse) {

        // Building a Spotify player playing the top song associated with the artist
        // (NOTE YOU NEED TO BE LOGGED INTO SPOTIFY)
        var player = "<iframe src='https://embed.spotify.com/?uri=spotify:track:" +
          trackResponse.tracks[0].id +
          "' frameborder='0' allowtransparency='true'></iframe>";
          currArtist = currArtist.replace( /\s/g, "");
        // Appending the new player into the HTML
        $("."+currArtist).append(player);
      });
    });
    //removes spotify button so they can't click on it again
    (this).remove();
});
$(".submitBtn").click(function(){
    $(".popSearch").fadeIn(1150)
    $(".contentContainer").fadeIn(900);
$(".sidebar").fadeIn(1350);
$(".initial").hide();
        userlocation = $("#searchInput").val();
        performerarray = [];
        queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userlocation + "&key=AIzaSyCvEv7FKUz87tJJ1WOrg2hvzEiKqRp80Yc";
        start();
        var city = userlocation;
        cityRef = dataRef.child("places").child(city);
        cityRef.once('value', function(snapshot) {
        if( snapshot.val() === null ) {
            dataRef.ref("places").push({
                city: city,
                count: count
            })
        } else {
            
            count = snapshot.val().Count;
            count++;
            dataRef.ref("places").push({
                City: city,
                Count: count
            })
        }

});
    })
window.onload = function() {



}