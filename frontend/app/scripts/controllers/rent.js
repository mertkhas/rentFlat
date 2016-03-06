'use strict';

/**
 * @ngdoc function
 * @name rentFlatApp.controller:RentCtrl
 * @description
 * # RentCtrl
 * Controller of the rentFlatApp
 */


angular.module('rentFlatApp')
  .controller('RentCtrl', function ($scope,authToken,$http,API_URL,alert) {
    $scope.isAuthenticated = authToken.isAuthenticated;
    $scope.selectedFlat = null;
    $scope.startDate = null;
    $scope.endDate = null;
    var diffDays;


    $scope.calculateDay = function () {
      if($scope.startDate !== null && $scope.endDate !== null){

        var a = new Date($scope.startDate);
        var b = new Date($scope.endDate);
        var diff = Math.abs(b.getTime()- a.getTime());
        diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        $scope.day = diffDays;

      }
    };



    function fetchList(){
      $http.get(API_URL + 'getFlats').success(function (flats) {
        $scope.flats = flats;
        console.log(flats);
      }).error(function (err) {
        if (err) {
          alert('warning', 'Daireler yüklenemedi', err.message);
        }
      });
    }

    fetchList();


    $scope.addReservation = function () {
      var totalPrice = $scope.day * $scope.dailyPrice;
      if($scope.selectedFlat !== null){
        $http.post(API_URL + 'addReservation',{
          cFirstName : $scope.cFirstName,
          cLastName : $scope.cLastName,
          cPhone : $scope.cPhone,
          startDate : new Date($scope.startDate),
          endDate : new Date($scope.endDate),
          dailyPrice : $scope.dailyPrice,
          totalPrice : totalPrice,
          flatId : $scope.selectedFlat
        }).success(function () {
          makeDefault();
          alert('success','Rezervasyon işlemi başarılı bir şekilde tamamlanmıştır...');

        }).error(function () {
          alert('warning','Rezervasyon işlemi sırasında hata meydana geldi');
        });
      }else{
        alert('warning','Lütfen bir daire seçiniz!');
      }

    };

    function makeDefault(){
      $scope.cFirstName = '';
      $scope.cLastName = '';
      $scope.cPhone = '';
      diffDays = null;
      $scope.startDate = null;
      $scope.endDate = null;
      $scope.dailyPrice = null;
      $scope.totalPrice = null;
      $scope.selectedFlat = null;
    }

  });
