/**
 * Created by SoulOfSet on 3/20/2016.
 */


/**
 * @description The constructor for the retailigence wrapper. Sets up the api key and api id. Also has callbacks for async calling
 * @param key API Key
 * @param id  API ID
 * @param onSuccess Callback for JSON retrieve success
 * @param onFail    Callback for JSON retrieve fail
 */
var retailigence = function(key, id, onSuccess, onFail){

    //The dynamic API data from the arguments
    var apiKey = key;
    var apiID = id;
    var userLocation;
    var searchType;

    //Status variables
    var authenticated = false;
    var isTasking = false;
    var taskMessage = "";
    var errorMessage = "";

    //API Base url
    var BASE_URL = "http://apitest.retailigence.com/v2.1/products?";

    //JSON Data
    var jsonData = "";

    //Parameters for the search
    var extraParams = {
        brand: null,
        productCategory: null,
        productType: null,
        model: null,
        locationID: null,
        maxPerRetailer: null,
        pageSize: null,
        page: null,
        retailerID: null,
        range: null,
        retailerCategory: null,
        color: null,
        size: null,
        gender: null,
        priceMax: null,
        priceMin: null,
        excludeAdultContent: null,
        expandResults: null
    };

    function downloadJSON(url, doSuccess, doFail){
        isTasking = true;
        taskMessage = "Downloading JSON";
        $.ajax({
            url: url,
            type: 'GET',
            //TODO: this doesn't mean necessarily they are authenticated just that a return OF SOME KIND was successful if this is the immediate constructor call. need to check that data first
            success: function(data){
                console.log("retailigence.js: GET succeeded")
                console.log(data);
                isTasking = false;
                doSuccess();
                return data;
            },
            error: function(data) {
                console.log("retailigence.js: GET failed with error" + data);
                errorMessage = data;
                isTasking = false;
                doFail();
                return "error";
            }
        });
    }

    jsonData = downloadJSON(BASE_URL + "&apikey=" + apiKey + "&requestorid=" + apiID + "&userlocation=94063&keywords=test", onSuccess, onFail);

    //Getter for the JSON variable
    this.getJSON = function(){
        return jsonData;
    };

    //Setter for the JSON variable
    this.setJSON = function(key){
        jsonData = key;
    };

    //Getter for any param value with error check
    this.getExtraParam = function(key){
        if(extraParams.hasOwnProperty(key)) {
            return extraParams[key];
        }
        else{
            errorMessage = "Error - Extra parameter key " + key + " does not exist";
            return false;
        }
    };

    //Setting for any extra param value with error check. Big deal ;p
    this.editExtraParam = function(editType, key, value){
        var tempString;

        if(!extraParams.hasOwnProperty(key)) {
            console.log("retailigence.js: Error - Attempt to edit extra parameters with key that doesn't exist");
            errorMessage = "Error - Attempt to edit extra parameters with key that doesn't exist";
            return false;
        }
        else if(editType = "add"){
            console.log("retailigence.js: Attempting to add value " + value + " to key " + key);


            if(extraParams[key] != null){//The key value already has some data that we need to add to

                //Make sure the data theyre trying to add isnt already in there
                var dataExist = false;
                tempString = extraParams[key];
                var splitString = tempString.split(',');
                for (var i = 0; i < splitString.length; i++) {
                    var stringPart = splitString[i];
                    if (stringPart != value) continue; //It is not
                    dataExist = true; //It is omg...
                    break;
                }
                if(!dataExist){ //If the data isnt already there go ahead and add it
                    tempString += "+" + value;
                    extraParams[key] = tempString;
                    console.log("retailigence.js: Value " + value + " added to key " + key);
                    return true;
                }
                else{
                    console.log("retailigence.js: Value " + value + " already exists in key " + key);
                    errorMessage = "retailigence.js: Value " + value + " already exists in key " + key;
                    return false;

                }
            }
            else{
                extraParams[key] = value;
                console.log("retailigence.js: Value " + value + " added to key " + key);
                return true;
            }
        }
        else{
            return "true";
        }
    };

    //Getter for any error message
    this.getErrorMessage = function(){
        return errorMessage;
    }
};



