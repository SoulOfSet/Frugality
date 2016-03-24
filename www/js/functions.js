/**
 * Created by SoulOfSet on 3/23/2016.
 * A js file for functions not relevant to the wrapper or any specific page
 */

//update GPS data in local storage
var updateGPSData = function(callback) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;
        localStorage.setItem("latitude", lat);
        localStorage.setItem("longitude", long);
        if (callback != null) {
            callback(true); //We were able to triangulate GPS location
        }
    }, function() {
        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        if (callback != null) {
            callback(false); //GPS triangulation failed =/
        }
    });
};

//update zip code in local storage
var updateZip = function(zip){
    localStorage.setItem("zip", zip);
}