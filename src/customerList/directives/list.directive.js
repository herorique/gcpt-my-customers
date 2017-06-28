
/*
 * @author Nhut Nguyen
 * @description controller to controll customer list
 */
(function () {
    'use strict';
    agGrid.initialiseAgGridWithAngular1(angular);
    angular.module('gcpt-my-customers', ['agGrid', 'ngMaterial'])
            .directive('gcptMyCustomers', gcptMyCustomers)
            .controller('gcptMyCustomersCtrl', gcptMyCustomersCtrl);
})();



gcptMyCustomersCtrl.$inject = ['$scope','$location', 'MyCustomersFactory'];

function gcptMyCustomers()
{
    var customerListTemplate = '<div ng-hide="myCustomers.loaded" class="spinner-tab"></div>' +
            '<div ng-show="myCustomers.loaded">   ' +
            '    <input ng-show="isManagerGrowSowPage() == false && loggedUser.user.COUNTRY.SEARCH_MY_CUST == \'Y\'" type="text" ng-model="myCustomerSearch" class="form-control" placeholder="Search by GSFA ID, Customer Name, Territory, Account Number, Account Name, Contact Name, Phone, Email">' +
            '    <md-button class="md-raised md-primary" ng-show="isManagerGrowSowPage() == false && (loggedUser.user.COUNTRY.SEARCH_MY_CUST == \'Y\' && !showListForAnotherUser)" type="button" class="btn btn-sm btn-primary" ng-click="myCustomers.searchMyCustomer(myCustomerSearch, url)">Search</md-button>' +
            '    <md-button class="md-raised md-primary" ng-show="isManagerGrowSowPage() == false && (loggedUser.user.COUNTRY.SEARCH_MY_CUST == \'Y\' && showListForAnotherUser)" type="button" class="btn btn-sm btn-primary" ng-click="myCustomers.searchMyCustomerUser(myCustomerSearch, customerListUserID, url)">Search</md-button>      ' +
            '    <md-button class="md-raised md-primary" ng-show="isManagerGrowSowPage() == true || ((loggedUser.user.COUNTRY.SEARCH_MY_CUST != \'Y\' && !showListForAnotherUser) && myCustomers.data.length == 0)" type="button" class="btn btn-sm btn-primary" ng-click="myCustomers.load(url)">Load My Customers</md-button>' +
            '    <md-button class="md-raised md-primary" ng-show="((loggedUser.user.COUNTRY.SEARCH_MY_CUST != \'Y\' && showListForAnotherUser) && myCustomers.data.length == 0)" type="button" class="btn btn-sm btn-primary" ng-click="myCustomers.loadUser(customerListUserID, url)">Load My Customers</md-button>' +
            '    <br>' +
            '    <div ng-show="myCustomers.data.length>0">' +
            '        <md-input-container style="width:50%" flex-gt-sm>' +
            '            <label>Filter by Customer Name, ID, ... anything</label>' +
            '            <input ng-model="myCustomers.grid.quickFilter" ng-change="myCustomers.grid.onFilterChanged()">' +
            '        </md-input-container>' +
            '        <span ng-click="getAppliedFilters(\'myCustomers\')" class="textLink">Filtered Rows: {{myCustomers.grid.getCountRows()}}</span>' +
            '        <br>' +
            '        <div ag-grid="myCustomers.grid.options" class="ag-fresh call-list-grid" id="my-customers-grid" ng-style="myCustomers.grid.style"></div>' +
            '    </div>     ' +
            '</div>';


    return {
        restrict: "AE",
        controller: "gcptMyCustomersCtrl",
        template: customerListTemplate  
    };
}
function gcptMyCustomersCtrl($scope,$location, MyCustomersFactory) {
    $scope.url = $location.path();
    $scope.$on('$destroy', function () {
        //GrowSowTabsFactory.destroy();
    });
    //$scope.checkAccess(['IS_SE','IS_SM']);
    $scope.allStatuses = ['', 'OPEN', 'SCHEDULED', 'DONE'];
    //$scope.setShowGcptDetailMarkDoneButton(true);
    $scope.myCustomers = MyCustomersFactory;
    $scope.myCustomerSearch = "";
//    if ($scope.showListForAnotherUser)
//        $scope.setUSRID($scope.customerListUserID);
//    else
//        $scope.setUSRID($scope.loggedUser.user.USR_ID);
    
    $scope.isManagerGrowSowPage = function() {
        return $scope.url === '/gcpt/manager-list';
    };

    $scope.filters = {
        myCustomers: {factoryObject: $scope.myCustomers, appliedFilters: null, showAppliedFilters: false},
    };

    $scope.activeFilter;

    $scope.getAppliedFilters = function (type) {
        $scope.filters[type].appliedFilters = $scope.filters[type].factoryObject.grid.getAppliedFilters();
        $scope.filters[type].showAppliedFilters = true;
        $scope.activeFilter = type;
    };

    $scope.resetFilters = function (type) {
        $scope.filters[type].factoryObject.grid.resetFilters();
        $scope.filters[type].appliedFilters = null;
    };
}

