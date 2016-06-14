(function () {
    'use strict';
    
    var serviceId = 'surveyFactory';

    angular.module('SurveyApp').factory(serviceId, ['$http', surveyFactory]);

    function surveyFactory($http) {
        var getResult = function () {
            return $http.get('/api/DataVisualApp').success(function (response) {
                return response;
            }).error(function (err) {
                // something went wrong
                console.log(err);
            });
        }
        var getResultByDate = function(startDate, endDate) {
            return $http.get('/api/DataVisualApp/' + startDate + '/' + endDate).success(function (response) {
                return response;
            }).error(function (err) {
                // something went wrong
                console.log(err);
            });
        }
        var getTrendData = function () {
            return $http.get('/api/DataVisualApp/GetTrendData').success(function (response) {
                return response;
            }).error(function (err) {
                // something went wrong
                console.log(err);
            });
        }

        var service = {
            getResult: getResult,
            getResultByDate: getResultByDate,
            getTrendData: getTrendData
        };

        return service;
    }

})();