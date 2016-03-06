/**
 * Created by mk on 25.2.2016.
 */
'use strict';

angular.module('rentFlatApp').config(function($urlRouterProvider,$stateProvider,$httpProvider){


  $urlRouterProvider.otherwise('/');

  $stateProvider

    .state('layout',{
      templateUrl:'layout.html',
      reloadOnSearch:false
    })

    .state('main',{
      url: '/',
      templateUrl: '/views/main.html',
      parent:'layout'

    })

    .state('logout',{
      url: '/logout',
      controller : 'LogoutCtrl'
    })

    .state('login',{
      url: '/login',
      templateUrl: '/views/login.html',
      controller : 'LoginCtrl',
      parent:'layout'
    })

    .state('report',{
      url: '/report',
      templateUrl: '/views/report.html',
      controller : 'ReportCtrl',
      parent:'layout'
    })

    .state('rent',{
      url: '/rent',
      templateUrl: '/views/rent.html',
      controller:'RentCtrl',
      parent:'layout'

    })

    .state('flat',{
      url: '/flat',
      templateUrl: '/views/flat.html',
      controller:'FlatCtrl',
      parent:'layout'

    })

    .state('register',{
      url: '/register',
      templateUrl: '/views/register.html',
      controller:'RegisterCtrl'
    });

  $httpProvider.interceptors.push('authInterceptor');

}).constant('API_URL','http://localhost:3000/');
