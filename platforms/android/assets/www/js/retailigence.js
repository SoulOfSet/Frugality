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
 
 
//TODO: Make a next page function for this wrapper. I can't believe i forgot that

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
                isTasking = false;
                doSuccess(data);
                authenticated = true;
                return true;
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
    this.getData = function(){
        return jsonData;
    };

    //Setter for the JSON variable
    this.setJSON = function(data){
        jsonData = data;
    };

    //Setter for location. If y = null it will assume its a zip code. If not it will act as coordinates
    this.setLocation = function(x, y){
        if(y == null){//Zip
            userLocation = x;
        }
        else{//Coords
            userLocation = x + "," + y;
        }
    };

    //Search function
    this.search = function(query, callback){
        if(!authenticated){
            console.log("retailigence.js: Application was not authenticated with the API");
            errorMessage = "Not authenticated with the API";
            return false;
        }
        else if(userLocation == null || searchType == null){
            console.log("retailigence.js: User location and search method must be set for this to work");
            errorMessage = "User location and search method must be set for this to work";
            return false;
        }
        else{
            var extraData = "";
            //Construct extra parameters
            $.each(extraParams, function(key, value){
                if(value != undefined){
                    extraData += "&" + key + "=" + value;
                }
            });
            var url = encodeURI(BASE_URL + "&apikey=" + apiKey + "&requestorid=" + apiID +"&userlocation=" + userLocation + "&" + searchType + "=" + query + extraData, null, null);
            console.log(url);
            var json = downloadJSON(url, function(data){
                console.log("retailigence.js: Search succeeded");
                jsonData = data;
                callback(true);
            }, function(){
                console.log("retailigence.js: Search failed");
                callback(false);
            });
            console.log(json);
        }
    };


    //Search type
    this.setSearchType = function(type){
        if(type != "name" && type != "keywords" && type != "productID"){
            errorMessage = "Invalid search method was passed to the setSearch method. Valid search methods are: name, keyword, productID";
            console.log("retailigence.js: There was an invalid selection pertaining to search methods. Check your documentation");
        }
        else{
            searchType = type;
            console.log("retailigence.js: Search type changed to " + type);
        }
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
            //ADD
            else if(editType == "add"){
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
            //Replace all with one
            else if(editType == "replace"){
                console.log("retailigence.js: Replacing all values within key " + key + " with value " + value);
                extraParams[key] = value;
                return true;
            }
            //Clear the value and replace with null
            else if(editType == "clear"){
                console.log("retailigence.js: Setting key " + key + " with value of null");
                extraParams[key] = null;
                return true;
            }
            //Remove just one value
            else if(editType == "remove"){
                if(extraParams[key] != null){
                    tempString = extraParams[key];
                    if(tempString.substr(0, value.length+1).trim() == value + "+"){ //If that value is up front
                        tempString = tempString.replace(value + "+", "");
                        extraParams[key] = tempString;
                        console.log("retailigence.js: Value " + value + " removed from key " + key);
                    }
                    else if(tempString.indexOf("+") > 0){ //If the value is not up front
                        tempString = tempString.replace("+" + value, "");
                        extraParams[key] = tempString;
                        console.log("retailigence.js: Value " + value + " removed from key " + key);
                    }
                    else{ //If its the last value
                        console.log("retailigence.js: Key " + key + " has had all values removed and is now null");
                        extraParams[key] = null;
                    }
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



