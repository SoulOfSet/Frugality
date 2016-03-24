var data;

//home.html functions
app.controller("tabHostController", function($scope) {
    if(localStorage.getItem("hasRun") == null){
        ons.createDialog('intro_dialog.html').then(function(dialog) {
            dialog.show();
        });
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

});

//intro_dialog.html functions
app.controller("introDialogController", function($scope){
   $scope.setLocationPref = function(button){
       console.log("sawg");
        if(button == 0){
            $("#ChooseType").hide();
            $("#ChooseZip").show();
        }
       else{
            console.log("do me");
        }
   }
});