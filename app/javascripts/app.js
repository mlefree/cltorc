// <copyright file="AuthenticationType.cs" company="Apps4Pro">
//    Copyright (c) 2014 All Right Reserved, http://www.apps4pro.com/
//
//    This source is subject to the Apache Permissive License.
//    Please see the License.txt file for more information.
//    All other rights reserved.
//
//    THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
//    KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
//    IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//    PARTICULAR PURPOSE.
//
// </copyright>
// <author>Mathieu Leprevost</author>
// <email>mat@apps4pro.com</email>
// <date>2014-09-10</date>
'use strict';

// Declare app level module which depends on filters, and services
var myAngularApp = angular.module('myAngularApp', [
  'ngRoute',
  'ngResource',
  'angular-gestures',
  'angular.filter',
  'ngTouch',
  //'ngCookies',
  'chart.js',
  'ngAnimate',
  'ngSanitize',
  'gettext',
  //'ui.bootstrap-slider',
  //'vr.directives.slider',
  'myAngularApp.config',
  'myAngularApp.services',
  'myAngularApp.directives',
  'myAngularApp.filters',
  'myAngularApp.views',
  'ptvTemplates'
]);
