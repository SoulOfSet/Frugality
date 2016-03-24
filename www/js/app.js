var zipReg = /^\d{5}$/;

//home.html functions
app.controller("tabHostController", function($scope) {
    var data = localStorage.getItem("hasRun");
    if(data == "false"){
        ons.createDialog('/top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
});

//intro_dialog.html functions
app.controller("introDialogController", function($scope){
    $scope.setLocationPref = function(button){
        if(button == 0){
            introDialog.hide();
            ons.createDialog('/top/dialogs/enter_zip.html').then(function(dialog) {
                dialog.show();
            });
        }
        else{
           updateGPSData(function(){
               localStorage.setItem("prefLocationType", "GPS");
               localStorage.setItem("hasRun", true);
               introDialog.hide();
           });
        }
    }
});

//enter_zip.html functions
app.controller("introDialogZipController", function($scope){
    $scope.validateZip = function(){
        if(!zipReg.test($scope.Zip)){
            $scope.ZipError = "Please enter a valid zip code";
        }
        else{
            localStorage.setItem("prefLocationType", "zip");
            updateZip($scope.zip);
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
app.controller("searchController", function($scope){
    $scope.search = function(){
        data.setSearchType("name");
        data.setLocation(localStorage.getItem("latitude"), localStorage.getItem("longitude"));
        data.search($('#TxtSearch').val());
    }

});

//settings.html functions
app.controller("settingsController", function($scope){
    $scope.setLocationPref = function(){
        ons.createDialog('/top/dialogs/intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
    }
});

