/**
 * Created by SoulOfSet on 3/20/2016.
 */

var retailigence = function(key, id){

    //The dynamic API data from the arguments
    var apiKey = key;
    var apiID = id;

    //Status variables
    var authenticated = false;
    var isTasking = false;
    var taskMessage = "";
    var errorMessage = "";

    //API Base url
    var BASE_URL = "http://apitest.retailigence.com/v2.1/products?";

    //JSON Data
    jsonData = "";

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
    }
};