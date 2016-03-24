var data;

//home.html functions
app.controller("tabHostController", function($scope) {

});

//search.html functions
app.controller("searchController", function($scope){
    $scope.search = function(){
        data.setSearchType("name");
        data.setLocation(localStorage.getItem("latitude"), localStorage.getItem("longitude"));
        data.search($('#txtSearch').val());
    }

});

//settings.html functions
app.controller("settingsController", function($scope){

});