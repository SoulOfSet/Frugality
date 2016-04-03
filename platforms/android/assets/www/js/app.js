var zipReg = /^\d{5}$/;

//TODO: Scope this down relatively
var currentList = new Object();

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
        } 
        else {
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
                } 
                else {
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
        } 
        else {
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
        $("#ResultError").html("");
        data.setSearchType("name");
        if (localStorage.getItem("prefLocationType") != null) {
            var locationType = localStorage.getItem("prefLocationType"); //Get location type

            if (locationType == "zip") { //If zip
                console.log("User has zip set as preffered location type. Setting wrapper location to zip");
                data.setLocation(localStorage.getItem("zip"), null);
            } 
            else if (locationType == "GPS") { //If GPS
                console.log("User has GPS set as preffered location type. Setting wrapper location to GPS");
                data.setLocation(localStorage.getItem("latitude"), localStorage.getItem("longitude"));
            }
        }
        data.search($('#TxtSearch').val(), function(worked) {
            if (worked) {
                console.log("Search came back as successful from the wrapper");
                var emptyResult;
                var errorToDisplay;
                var consoleError;

                //Get the JSON from the wrapper because the search is over 
                var resultObj = data.getData();
                console.log(resultObj);

                //Make things a bit easier to work with
                var workingData = resultObj.RetailigenceSearchResult;


                //First we need the make sure the search actually worked. Get the length of the return data
                var returnLength = workingData.count;
                if (returnLength == 0) { //Either something broke or there were not results
                    var errorData = workingData.messages;
                    console.log("Retailigence API has returned " + errorData.length + " error(s)");

                    //Loop through the errors. There may be more than one =/
                    $.each(errorData, function(i, item) {
                        if (errorData[i].APIError.code == "INFO_API_NO_RESULTS_FOUND") {
                            emptyResult = true;
                        } 
                        else {
                            consoleError += errorData[i].APIError.code + ": " + errorData[i].APIError.description + " | ";
                            errorToDisplay = errorData[i].APIError.description + " </br> ";
                        }
                    });

                    if (emptyResult) {
                        $("#ResultError").html("<p>Sorry. No results were found</p>");
                    } 
                    else {
                        $("#ResultError").html(errorToDisplay);
                    }
                }
                else{//The search returned some results. Good stuff
                    currentList.items = [];
                    //We need to build our own object from results
                    $.each(workingData.results, function(i){// for each result in the returned result array
                        //TODO: I'm not actually sure is this external product id remains consistent between identical items. I dont think so. So this might have to be revamped
                        console.log(workingData.results[i].SearchResult.product.externalproductid);
                        var currResult = workingData.results[i].SearchResult;
                        var currentExternalProductID = currResult.product.externalproductid;
                        
                        //TODO: This needs way more work. I'm extremely tired so this may be wrong but data needs to be reconciled between external id's/internal ids/eans/skus/upcs etc to do our best to make sure we merge identical data?
                        var currData = {name:currResult.product.name, price:currResult.price, location:currResult.location.name, };
                        currentList.items[i] = currData;

                    })
                    
                    console.log("merr: " + currentList);
                }

            } 
            else { 
                    $("ResultError").html("Sorry something went wrong. Please try again.\nIf this persists please try restarting the application and reset your location in settings");
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