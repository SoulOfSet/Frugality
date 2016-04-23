/**
 * Created by SoulOfSet on 3/23/2016.
 * A js file for functions not relevant to the wrapper or any specific page
 */

//update GPS data in local storage
var updateGPSData = function(callback) {
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log("GPS Updated");
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
};

var downloadJSON = function(url, doSuccess, doFail){
        isTasking = true;
        taskMessage = "Downloading JSON";
        $.ajax({
            url: url,
            type: 'GET',
            //TODO: this doesn't mean necessarily they are authenticated just that a return OF SOME KIND was successful if this is the immediate constructor call. need to check that data first
            success: function(data){
                console.log("retailigence.js: GET succeeded");
                isTasking = false;
                doSuccess(data);
                authenticated = true;
                return true;
            },
            error: function(data) {
                console.log("retailigence.js: GET failed with error" + data);
                errorMessage = data;
                isTasking = false;
                doFail();
                return "error";
            }
        });
    };