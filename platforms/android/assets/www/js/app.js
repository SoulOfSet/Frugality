var zipReg = /^\d{5}$/;
var radiusReg = /^[0-9]*(?:\.\d{1,2})?$/;
//TODO: Scope this down relatively
var currentList = new Object();
var itemToAdd;
var currentItem;
var queueActive = false;
var queueItem;
var queueType; 
var queueItemName;
//home.html functions
app.controller("tabHostController", function($scope, $cordovaBarcodeScanner) {
    document.addEventListener('ons-tabbar:init', function(event) {
    //tabHost.setActiveTab(1);
    });
    var data = localStorage.getItem("hasRun");
    if (data == "false") {
        ons.createDialog('top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
    $scope.openScanner = function(){
        $cordovaBarcodeScanner
          .scan()
          .then(function(barcodeData) {
              console.log(data);
                queueActive = true;
                queueItem = barcodeData.text;
                queueType = "productID";
                queueItemName = barcodeData.text;
                tabHost.setActiveTab(0);
            // Success! Barcode data is here
          }, function(error) {
            // An error occurred
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
            ons.createDialog('top/dialogs/enter_zip.html').then(function(dialog) {
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
                    ons.createDialog('top/dialogs/thank_you.html').then(function(dialog) {
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
            ons.createDialog('top/dialogs/thank_you.html').then(function(dialog) {
                dialog.show();
            });
        }
    }
});

//enter_radius.html functions
app.controller("introDialogRadiusController", function($scope) {
    $scope.validateRadius = function() {
        if (!radiusReg.test($scope.Radius)) {
            $scope.RadiusError = "Please enter a valid numeric radius";
        } else {
            updateRadius($scope.Radius);
            console.log("Search radius changed to  " + $scope.Radius);
            introDialogRadius.hide();
        }
    }
});

//search.html functions
app.controller("searchController", function($scope) {
    if (localStorage.getItem("lists") === null) {
        var lists = [];
        lists[0] = {
            img: "http://apitest.retailigence.com/v2.1/rdr?id=l:ed4cbb2e-a6dc-4b61-b211-2d5e3f50e10b&requestId=4bb3e592-9763-4c98-aaf8-0d4ab30167c6&apikey=Rg7fUTHqwWL05Z8cvtTs_kp2un81oiH6",
            name: "VIZIO 39 Class 720p LED Smart TV - D39h-D0",
            productID: "ed4cbb2e-a6dc-4b61-b211-2d5e3f50e10b"
        };
        localStorage.setItem("lists", JSON.stringify(lists));
    }
    
    if(localStorage.getItem("radius") === null){
        updateRadius("30");
    }
    
    $("#ResultBar").hide();


    $scope.viewMap = function(){
        parentNavigator.app.loadUrl("https://www.google.com/maps/embed/v1/view?zoom=14&center=" + $scope.latitude + "," + $scope.longitude + "&key=AIzaSyDxRkOfiwcsRNjpJzoPI0ej8AvG4VYnnIo'");
    };
    
    $scope.popFilter = function() {
        ons.createPopover('top/tabs/filterPopOver.html').then(function(popover) {
            $scope.popover = popover;
            popover.show("#filterIcon");
        });
    };

    $scope.addToWatch = function(material) {
        var itemExist = false;
        var mod = material ? 'material' : undefined;
        ons.notification.confirm({
            message: 'Add ' + itemToAdd + ' to watch list?',
            modifier: mod,
            callback: function(idx) {
                switch (idx) {
                    case 0:
                        break;
                    case 1:
                        var listArray = JSON.parse(localStorage.getItem("lists"));
                        $.each(listArray, function(i, item) {

                            if (item.productID == currentItem.product.id) {
                                itemExist = true;
                            }
                        });
                        if (itemExist) {
                            ons.notification.alert({
                                message: "You're already tracking this item",
                                modifier: mod
                            });
                        } else {
                            if (currentItem.product.images[1].ImageInfo.link !== undefined && currentItem.product.name !== undefined && currentItem.product.id !== undefined) {
                                listArray[listArray.length] = {
                                    img: currentItem.product.images[1].ImageInfo.link,
                                    name: currentItem.product.name,
                                    productID: currentItem.product.id
                                };
                                localStorage.setItem("lists", JSON.stringify(listArray));
                            } else {
                                ons.notification.alert({
                                    message: 'Sorry! Item is not able to be tracked',
                                    modifier: mod
                                });
                            }
                        }

                        break;
                }
            }
        });
    };

    $scope.resultClick = function(data) {
        currentItem = data;
        $("#SearchResultList").hide();
        $("#ResultDetails").show();
        console.log(data);
        $scope.inStock = "Loading...";
        $scope.numInStock = "";
        $scope.name = data.product.name;
        $scope.locationName = data.location.name;
        $scope.address = data.location.address.address1;
        $scope.price = data.price;
        $scope.zip = data.location.address.postal;
        $scope.state = data.location.address.state;
        $scope.img = data.product.images[1].ImageInfo.link;
        $scope.latitude = data.location.location.latitude;
        $scope.longitude = data.location.location.longitude;

        //Product category designation
        if (data.product.productCategory === undefined) {
            if (data.product.productType !== undefined) {
                $scope.type = data.product.productType[0];
            } else {
                $scope.type = "Unknown";
            }
        } else {
            $scope.type = data.product.productCategory[0];
        }

        //Phone number formatting
        var oTime;
        var cTime;
        var numData = data.location.phone;
        var tempPhone = numData.toString();
        $scope.phoneNum = '(' + tempPhone.substr(0, 3) + ')' + ' ' + tempPhone.substr(3, 3) + '-' + tempPhone.substr(6, 4);
        //end phone formatting
        
        //Store hours formatting
		var day;
        var hData = data.location.hours; // pulls info from the database
		var sepData = hData.split(","); // creates an array of 7 data items
		var fHours = "";
		
		for(var i = 0; i < 7; i++) //trverses through the array
		{
			var dData = sepData[i];
			var daySwitch = dData.substr(0,1); // pulls the first character in an item
			                                   // this number represents the day of the week
			
			switch(daySwitch)
			{
			    case "1":
			        day = "Sun: ";
			        break;
			    case "2":
			        day = "Mon: ";
			        break;
			    case "3":
			        day = "Tue: ";
			        break;
			    case "4":
				    day = "Wed: ";
				    break;
			    case "5":
				    day = "Thur: ";
				    break;
			    case "6":
				    day = "Fri: ";
				    break;
			    case "7":
				    day = "Sat: ";
				    break;	
			}
			// This section pulls the rest of the info for open time and close time
			
			if(dData.length == 11) // a situation where the store is open in the range of 1am to 9am
			{
			    oTime = dData.substr(2,4);
			    cTime = dData.substr(7,4);
			}
			else if(dData.length == 12 && dData.substr(3,1) == ":") // open in range of 1am to 23:59
			{
			    oTime = dData.substr(2,4);
			    cTime = dData.substr(7,5); 
			}
			else if(dData.length == 12 && dData.substr(7,1) == ":") // opens in age of 10am to 9am
			{
			    oTime = dData.substr(2,5);
			    cTime = dData.substr(8,4); 
			}
			else                                                    //opens in range of 10am to 23:59
			{
			    oTime = dData.substr(2,5);
			    cTime = dData.substr(8,5);
			}
			
			var dBlock = day + oTime + " - " + cTime + " ";        //combines data to form 1 day of data
			
			fHours = fHours + dBlock;                              //combines 7 days of data
			console.log(fHours);                                   // 
			
			
			
		}
        
         $scope.hours = fHours; //sends formatted data to activity
        //$scope.hours = data.location.hours;
        //end hours formatting1
        
        itemToAdd = $scope.name;
        downloadJSON(data.product.inventory, function(data) {

            console.log(data);
            if (data.RetailigenceAPIResult.messages !== undefined) {
                $scope.inStock = "N/A";
                $scope.numInStock = "N/A";
            } else {
                $scope.inStock = data.RetailigenceAPIResult.results[0].ProductLocation.quantityText;
                $scope.numInStock = data.RetailigenceAPIResult.results[0].ProductLocation.quantity;
            }
            $scope.$apply();
        }, function() {
            console.log("Getting inventory data failed");
            $scope.inStock = "N/A";
            $scope.numInStock = "N/A";
            $scope.$apply();
        });

        $("#map").html("<iframe width='600' height='450' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/view?zoom=14&center=" + $scope.latitude + "," + $scope.longitude + "&key=AIzaSyDxRkOfiwcsRNjpJzoPI0ej8AvG4VYnnIo' allowfullscreen></iframe>");

    };

    $scope.backClick = function() {
        $("#ResultDetails").hide();
        $("#SearchResultList").show();
    };

    $scope.search = function(type, query, name) {
        $scope.searchCount = "";
        $scope.searchName = "";
        var cleanName = name;
        console.log(type);
        console.log(query);
        $("#ResultBar").hide();
        $("#ResultDetails").hide();
        $("#SearchResultList").show();
        $scope.currData = {};
        $("#ResultError").html("");
        data.editExtraParam("replace", "range", localStorage.getItem("radius"));
        data.editExtraParam("add", "pageSize", "30");
        data.editExtraParam("add", "expandResults", "true");
        data.setSearchType(type);
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
        if(query == null){
            query = $('#TxtSearch').val();
            cleanName = $('#TxtSearch').val();
        }
        data.search(query, function(worked) {
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
                $scope.searchCount = returnLength;
                $scope.searchName = cleanName;
                $("#ResultBar").show();
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
                        $("#ResultError").show();
                    } else {
                        $("#ResultError").html("<p>" + errorToDisplay + "</p>");
                        $("#ResultError").show();
                    }
                } else { //The search returned some results. Good stuff
                    currentList.items = [];
                    currentList.categories = [];
                    currentList.types = [];
                    currentList.cities = [];

                    //We need to build our own object from results
                    $.each(workingData.results, function(i) { // for each result in the returned result array
                        var currResult = workingData.results[i].SearchResult;
                        currentList.items[i] = currResult;
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
                        $.each(filterData.productCategory, function(x, category) {
                            console.log(category);
                            if (currentList.categories[category] === undefined) {
                                currentList.categories[category] = "";
                            }
                            currentList.categories[category] += "/" + i;
                            console.log(currentList.categories[category]);
                        });
                        $.each(filterData.productType, function(x, type) {
                            if (currentList.types[type] === undefined) {
                                currentList.types[type] = "";
                            }
                            currentList.types[type] += "/" + i;
                            console.log(currentList.categories[type]);
                        });

                        if (currentList.cities[filterData.city] === undefined) {
                            currentList.cities[filterData.city] = "";
                        }
                        currentList.cities[filterData.city] += "/" + i;

                    });
                    $scope.currData = currentList;
                    $scope.$apply();
                    console.log(currentList);
                    console.log("swag");
                }

            } else {
                $("ResultError").html("Sorry something went wrong. Please try again.\nIf this persists please try restarting the application and reset your location in settings");
            }
        });
    };
    if(queueActive == true){
        $scope.search(queueType, queueItem, queueItemName);
        queueActive = false;
        queueItem = null;
        queueType = null; 
        queueItemName = null;
    }

});

//settings.html functions
app.controller("settingsController", function($scope) {
    $scope.setLocationPref = function() {
        ons.createDialog('top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
    $scope.setRadius = function() {
        ons.createDialog('top/dialogs/enter_radius.html').then(function(dialog) {
            dialog.show();
        });
    }
    $scope.clearLocalData = function(){
        localStorage.clear();
        location.reload();
    }
});

//filterPopover.html functions
app.controller("filterPopController", function($scope) {
    $scope.groups = [];

    $scope.groups[0] = {
        name: "Cities",
        items: []
    };
    $scope.groups[1] = {
        name: "Categories",
        items: []
    };
    $scope.groups[2] = {
        name: "Types",
        items: []
    };

    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
    };
});


//watching.html functions
app.controller("watchListController", function($scope) {
    $scope.watching = JSON.parse(localStorage.getItem("lists"));
    $scope.watchItemTap = function(data){
        console.log(data);
        queueActive = true;
        queueItem = data.productID;
        queueType = "productID";
        queueItemName = data.name;
        tabHost.setActiveTab(0);
    };
    
    $scope.removeItem = function(data){
        console.log("swipe");
        console.log(data);
        var itemList = JSON.parse(localStorage.getItem("lists"));
        var newList = $.grep(itemList, function(e){ 
             return e.productID != data.productID; 
        });
        console.log(newList);
        localStorage.setItem("lists", JSON.stringify(newList));
        $scope.watching = JSON.parse(localStorage.getItem("lists"));
    };
});

