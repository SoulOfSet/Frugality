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
        if(button == 0){
            introDiag.hide();
            ons.createDialog('enter_zip.html').then(function(dialog) {
                dialog.show();
            });
        }
       else{
            console.log("do me");
        }
   }
});

//enter_zip.html functions
app.controller("introDialogZipController", function($scope){
    $('#zipCodeForm')
        .formValidation({
            framework: 'bootstrap',
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                postalCode: {
                    validators: {
                        zipCode: {
                            country: 'countrySelectBox',
                            message: 'The value is not valid %s postal code'
                        }
                    }
                }
            }
        })
});