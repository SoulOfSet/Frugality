var zipReg = /^\d{5}$/;

//home.html functions
app.controller("tabHostController", function($scope) {
    var data = localStorage.getItem("hasRun");
    if (data == "false") {
        ons.createDialog('/top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
});

//intro_dialog.html functions
app.controller("introDialogController", function($scope) {
    $scope.GPSError = "";
    $scope.showLoad = true;
    $scope.setLocationPref = function(button) {
        if (button == 0) {
            introDialog.hide();
            ons.createDialog('/top/dialogs/enter_zip.html').then(function(dialog) {
                dialog.show();
            });
        } else {
            $scope.showLoad = false;
            $scope.showChoose = true;
            updateGPSData(function(worked) {
                if (worked == true) {
                    $scope.showChoose = true;
                    $scope.showLoad = false;
                    $scope.GPSError = "";
                    localStorage.setItem("prefLocationType", "GPS");
                    localStorage.setItem("hasRun", true);
                    introDialog.hide();
                    ons.createDialog('/top/dialogs/thank_you.html').then(function(dialog) {
                        dialog.show();
                    });
                } else {
                    $scope.showChoose = true;
                    $scope.showLoad = false;
                    $scope.GPSError = "We were not able to find your GPS location. Please check your location services";
                }

            });

        }
    }
});

//enter_zip.html functions
app.controller("introDialogZipController", function($scope) {
    $scope.validateZip = function() {
        if (!zipReg.test($scope.Zip)) {
            $scope.ZipError = "Please enter a valid zip code";
        } else {
            localStorage.setItem("prefLocationType", "zip");
            updateZip($scope.Zip);
            console.log("Preferred location type changed to zip code with stored value of zip changed to " + $scope.Zip);
            $scope.ZipError = "";
            //Make sure this doesn't pop up again
            localStorage.setItem("hasRun", true);
            introDialogZip.hide();
            ons.createDialog('/top/dialogs/thank_you.html').then(function(dialog) {
                dialog.show();
            });
        }
    }
});

//search.html functions
app.controller("searchController", function($scope) {
    $scope.search = function() {
        data.setSearchType("name");
        if(localStorage.getItem("prefLocationType") != null){
            var locationType = localStorage.getItem("prefLocationType"); //Get location type
            
            if(locationType == "zip"){//If zip
                console.log("User has zip set as preffered location type. Setting wrapper location to zip");
                data.setLocation(localStorage.getItem("zip"), null);
            }
            else if(locationType == "GPS"){//If GPS
                console.log("User has GPS set as preffered location type. Setting wrapper location to GPS");
                data.setLocation(localStorage.getItem("latitude"), localStorage.getItem("longitude"));
            }
        }
        data.search($('#TxtSearch').val(), function(worked){
            if(worked){
                console.log("Search came back as successful from the wrapper");
                var json = $.parseJSON(data.getJSON());
                
                //Things are about to get really intense
                var returnLength = data.RetailigenceSearchResult.count;
                console.log(returnLength);
                
            }
            else{//TODO: Make this show some kind of error message
                
            }
        });
        
        
    }

});

//settings.html functions
app.controller("settingsController", function($scope) {
    $scope.setLocationPref = function() {
        ons.createDialog('/top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
});