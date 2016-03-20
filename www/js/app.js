var data;

//home.html functions
app.controller("tabHostController", function($scope) {

});

//search.html functions
app.controller("searchController", function($scope){
    $scope.search = function(){
        data.setSearchType("productID");
        data.setLocation(63379, null)
        data.search("0088392936007");
    }

});