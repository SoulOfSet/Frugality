var data;

//home.html functions
app.controller("tabHostController", function($scope) {

});

//search.html functions
app.controller("searchController", function($scope){
    $scope.search = function(){
        data.editExtraParam("add", "brand", "sony");
        console.log(data.getExtraParam("brand"));
    }

});