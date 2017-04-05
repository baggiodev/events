var map;
var ajaxcall;
var performerarray = [];
var test
var perfList;
var currArtist;
$(".contentContainer").hide();
$(".sidebar").hide();
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
        var labels = i + 1;
        console.log(labels);
        marker = new google.maps.Marker({
            position: eventLatLng,
            label: labels.toString(),
            map: map,
            title: ajaxcall.events.event[i].title,
            testing: i,
            infoWindow: new google.maps.InfoWindow({
                content: "<div>"+ajaxcall.events.event[i].title+"</div>"+"<div>"+ajaxcall.events.event[i].description+"</div>"
        })
        })
        var contentString = '<div id="content">' +
            "Event Title: " + ajaxcall.events.event[i].title + "</div>"
        marker.addListener("click", function() {
            (this).infoWindow.open(map, this);
            (this).setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
            console.log((this).testing)
            $("#"+(this).testing).css("background","red");
        });
    }
}
var userlat;
var userlng;
var userlocation;
var queryURL;

function start(){
$.ajax({
    url: queryURL,
    method: "GET"
}).done(function(response) {
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
            var temp = $("<div id=" + "'" + i + "'" + ">");
            temp.addClass("events");
            // makes a div inside the div for the title
            var title = $("<div>");
            var divtitle = ajaxcall.events.event[i].title;
            title.html("<h3>"+(i+1)+" Event Title: " + divtitle+"</h3>");
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
                    temp.addClass(performer.replace( /\s/g, ""));
                    divperformer.html("Performer: " + performer);
                    var button = $("<button class='spotify'>" + performer + "</button>");
                    button.attr("data-performer", performer)
                    temp.append(button);
                }
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
    $(document).on("click",".spotify",function() {
    currArtist = $(this).text();
    console.log(currArtist);
    // Running an initial search to identify the artist's unique Spotify id
    var queryURL = "https://api.spotify.com/v1/search?q=" + currArtist + "&type=artist";
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {

      // Printing the entire object to console
      console.log(response);

      // Printing the artist id from the Spotify object to console
      var artistID = response.artists.items[0].id;

      // Building a SECOND URL to query another Spotify endpoint (this one for the tracks)
      var queryURLTracks = "https://api.spotify.com/v1/artists/" + artistID + "/top-tracks?country=US";

      // Running a second AJAX call to get the tracks associated with that Spotify id
      $.ajax({
        url: queryURLTracks,
        method: "GET"
      }).done(function(trackResponse) {

        // Logging the tracks
        console.log(trackResponse);

        // Building a Spotify player playing the top song associated with the artist
        // (NOTE YOU NEED TO BE LOGGED INTO SPOTIFY)
        var player = "<iframe src='https://embed.spotify.com/?uri=spotify:track:" +
          trackResponse.tracks[0].id +
          "' frameborder='0' allowtransparency='true'></iframe>";
          currArtist = currArtist.replace( /\s/g, "");
        // Appending the new player into the HTML
        console.log(currArtist);
        $("."+currArtist).append(player);
      });
    });
  });
$(".submitBtn").click(function(){
    $(".contentContainer").show();
$(".sidebar").show();
        userlocation = $("#searchInput").val();
        console.log(userlocation);
        performerarray = [];
        queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userlocation + "&key=AIzaSyCvEv7FKUz87tJJ1WOrg2hvzEiKqRp80Yc";
        start();
    })
window.onload = function() {



}