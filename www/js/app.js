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
        $("#ResultError").html("");
        data.editExtraParam("add", "range", "500");
        data.editExtraParam("add", "pageSize", "30");
        data.editExtraParam("add", "expandResults", "true");
        data.setSearchType("name");
        if (localStorage.getItem("prefLocationType") != null) {
            var locationType = localStorage.getItem("prefLocationType"); //Get location type

            if (locationType == "zip") { //If zip
                console.log("User has zip set as preffered location type. Setting wrapper location to zip");
                data.setLocation(localStorage.getItem("zip"), null);
            } else if (locationType == "GPS") { //If GPS
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
                        } else {
                            consoleError += errorData[i].APIError.code + ": " + errorData[i].APIError.description + " | ";
                            errorToDisplay = errorData[i].APIError.description + " </br> ";
                        }
                    });

                    if (emptyResult) {
                        $("#ResultError").html("<p>Sorry. No results were found</p>");
                    } else {
                        $("#ResultError").html(errorToDisplay);
                    }
                } else { //The search returned some results. Good stuff
                    currentList.items = [];
                    currentList.categories = [];
                    currentList.types = [];
                    currentList.cities = [];

                    //We need to build our own object from results
                    var counter = 0;
                    $.each(workingData.results, function(i) { // for each result in the returned result array
                        var itemExists = false;
                        var itemIndex = 0;
                        var currResult = workingData.results[i].SearchResult;
                        console.log(i);
                        console.log(currResult);


                        //Set up data for local filtering.
                        var filterData = {
                            productCategory: currResult.product.productCategory,
                            productType: currResult.product.productType,
                            city: currResult.location.address.city
                        };
                        console.log(filterData);

                        //Go through each of the filter categories and make sure that the data doesnt exist already
                        $.each(filterData.productCategory, function(x, category){
                            console.log(category);
                            if(currentList.categories[category] === undefined){
                                currentList.categories[category] = "";
                            }
                           currentList.categories[category] += "/" + i;
                        });
                        $.each(filterData.producttype, function(x, type){
                            if(currentList.types[type] === undefined){
                                currentList.types[type] = "";
                            }
                           currentList.types[type] += "/" + i;
                        });

                        if(currentList.cities[filterData.city] === undefined){
                            currentList.cities[filterData.city] = "";
                        }
                        currentList.cities[filterData.city] += "/" + i;


                       /* $.each(currentList.categories, function(e, item) {
                            console.log(item);
                            if (key item[e] ) {
                                itemExists = true;
                                itemIndex = e;
                            }
                        });*/

                        //New item
                        /*if (!itemExists) {
                            currentList.items[counter] = filterData;
                            currentList.items[counter].locations[0] = currResult.location;
                            currentList.items[counter].locations[0].product = currResult.product;
                            currentList.items[counter].locations[0].price = currResult.price;
                            //Changes lowest price in root item tree
                            currentList.items[counter].lowestPrice = currResult.price;
                            counter++;
                        }
                        //Item already exists is just at a separate location
                        else {
                            var locationsLength = currentList.items[itemIndex].locations.length;
                            currentList.items[itemIndex].locations[locationsLength] = currResult.location;
                            currentList.items[itemIndex].locations[locationsLength].product = currResult.product;
                            currentList.items[itemIndex].locations[locationsLength].price = currResult.price;
                            //Changes lowest price if applicable in root item tree
                            if (currResult.price < currentList.items[itemIndex].lowestPrice || currResult.price === undefined) {
                                currentList.items[itemIndex].lowestPrice = currResult.price;
                            }

                        }*/

                    });
                    //$scope.currData = currentList;
                    //$scope.$apply();
                    console.log(currentList);

                    console.log(swag);
                }

            } else {
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