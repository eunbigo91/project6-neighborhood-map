var favPlaces = [
        {
        "name" : "Space Needle",
        "location" : "400 Broad St, Seattle, WA 98109",
        "lat" : "47.620538",
        "lng" : "-122.349135"
        },
        {
        "name" : "Pike Place Market",
        "location" : "85 Pike Street, Seattle, WA 98101",
        "lat" : "47.608444",
        "lng" : "-122.340549"
        },
        {
        "name" : "Seattle Underground",
        "location" : "614 1st Ave, Seattle, WA 98104",
        "lat" : "47.602365",
        "lng" : "-122.333651"
        },
        {
        "name" : "Chihuly Garden and Glass",
        "location" : "305 Harrison St, Seattle, WA 98109",
        "lat" : "47.621582",
        "lng" : "-122.350849"
        },
        {
        "name" : "Olympic Sculpture Park",
        "location" : "2901 Western Ave, Seattle, WA 98121",
        "lat" : "47.616432",
        "lng" : "-122.354148"
        },
        {
        "name" : "Safeco Field",
        "location" : "1250 1st Avenue South, Seattle, WA 98134",
        "lat" : "47.591343",
        "lng" : "-122.332007"
        },
        {
        "name" : "Seattle Great Wheel",
        "location" : "1301 Alaskan Way, Seattle, WA 98101",
        "lat" : "47.606080",
        "lng" : "-122.341431"
        },
        {
        "name" : "Pacific Science Center",
        "location" : "200 2nd Ave N, Seattle, WA 98109",
        "lat" : "47.619398",
        "lng" : "-122.351441"
        }
]

// Google Maps API error
function googleMapsError() {
    alert("Failed to load data from Google. Try again later");
}

var map;
var infoWindow;

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.606209, lng: -122.332071},
        zoom: 13
    });

    ko.applyBindings(new ViewModel());
}

// Place constructor
var Place = function(data) {
    this.name = ko.observable(data.name);
    this.location = ko.observable(data.location);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.marker;
}

// Set animation when mouseover and mouseout
var markerAnimation = function(marker) {
    marker.addListener('mouseover', function() {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    });
    marker.addListener('mouseout', function() {
        marker.setAnimation(null);
    });
}

// Make infoWindow with Wikipedia informations
var attachInfo = function(marker, name, location) {
    infoWindow = new google.maps.InfoWindow({maxWidth: 200});
    marker.addListener('click', function() {
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
        $.ajax({
            url: wikiUrl,
            dataType:"jsonp"
        })
        .done(function(response) {
            var url = response[3];
            var article = response[2][0];
            infoWindow.setContent("<a href='"+url+"'>"+name + "</a><br><b>" + location + "</b><br> > " +article + " (Wikipedia)");
        })
        // Wikipedia API error
        .fail(function() {
            infoWindow.setContent(name+"<br><b>"+location + "</b><br> > Failed to load data from Wikipedia. Please try refreshing later. ");
        });
        infoWindow.open(marker.get('map'), marker);
    });
}

var ViewModel = function() {
    var self = this;

    this.placeList = ko.observableArray([]);
    favPlaces.forEach(function(placeItem) {
        self.placeList.push( new Place(placeItem) );
    });

    // Creates markers
    var marker;
    self.placeList().forEach(function(placeItem) {
        marker = new google.maps.Marker({
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            map: map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng())
        });
        placeItem.marker = marker;
        this.markerAnimation(marker);
        this.attachInfo(marker, placeItem.name(), placeItem.location());
    });

    // Make marker appropriate response when list is clicked
    this.clickMarker = function(place) {
        google.maps.event.trigger(place.marker, "click");
    };
    this.mouseOverMarker = function(place) {
        google.maps.event.trigger(place.marker, "mouseover");
    };
    this.mouseOutMarker = function(place) {
        google.maps.event.trigger(place.marker, "mouseout");
    };

    // Filter markers based on filter (user input)
    this.filter = ko.observable("");
    this.filtered = ko.computed(function() {
        return ko.utils.arrayFilter(self.placeList(), function(place) {
            if (place.name().toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
                place.marker.setVisible(true);
                return true;
            } else {
                place.marker.setVisible(false);
                return false;
            }
        });
    });
}
