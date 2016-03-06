'use strict';

/**
 * @ngdoc function
 * @name rentFlatApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the rentFlatApp
 */
angular.module('rentFlatApp')
  .controller('ReportCtrl', function ($scope,authToken,$http,alert,API_URL) {
    $scope.isAuthenticated = authToken.isAuthenticated;


    function fetchList(){
      $http.post(API_URL + 'getRentals',{

      }).success(function (rentals) {
        $scope.rentals = rentals;
        console.log(rentals);
      }).error(function (err) {
        if (err) {
          alert('warning', 'Daireler yüklenemedi', err.message);
        }
      });
    }

    function fetchDash(){

      $http.get(API_URL + 'getDash1').success(function (res) {
        $scope.resCount = res.resCount;
        $scope.resCiro = res.resCiro;
        $scope.maxDate = res.maxDate;
        $scope.flatCount = res.flatCount;
      }).error(function () {
      });

    }
    fetchList();
    fetchDash();




  });
