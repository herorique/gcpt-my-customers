(function() {


    // Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('gcpt-my-customers.config', [])
    .value('gcpt-my-customers.config', {
        debug: true
    });

// Modules
angular.module('gcpt-my-customers.directives', []);
angular.module('gcpt-my-customers.filters', []);
angular.module('gcpt-my-customers.services', []);
angular.module('gcpt-my-customers',
    [    
        'ngSanitize',
        'gcpt-my-customers.config',
        'gcpt-my-customers.directives',
        'gcpt-my-customers.filters',
        'gcpt-my-customers.services',
        'ng',
        'ngAria',
        'ngAnimate',
        'ngMaterial'
    ]);


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



(function () {
    'use strict';

    angular
            .module('gcpt-my-customers')
            .factory('GCPTAuth', GCPTAuth);

    //GCPTAuth.$inject = ['$http', 'restUrl', 'ipCookie', '$location'];
    GCPTAuth.$inject = ['$http', 'ipCookie', '$location'];
    function GCPTAuth($http, ipCookie, $location) {
        var currentUser = {EMAIL: '', AUTH_HASH: ''};
        var restUrl = "/GCPT/rest";
        var cookieUser = ipCookie('gsrt_auth');
        changeUser(cookieUser);

        if ('AUTH_HASH' in currentUser && currentUser.AUTH_HASH !== "") {
            $http.defaults.headers.common['auth-token'] = currentUser.AUTH_HASH;
            $http.post(restUrl + '/login20', currentUser).success(function (data) {
                changeUser(data);
                ipCookie('gsrt_auth', {EMAIL: currentUser.EMAIL, AUTH_HASH: currentUser.AUTH_HASH}, {expires: 7});
                $http.defaults.headers.common['auth-token'] = user.AUTH_HASH;
            }).error(function (data) {
                currentUser = {EMAIL: '', AUTH_HASH: ''};
                logout();
                $location.path('/login');
            });
        }

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function logout() {
            currentUser = {EMAIL: '', AUTH_HASH: ''};
            delete $http.defaults.headers.common['auth-token'];
            ipCookie.remove('gsrt_auth');
        }

        return {
            login: function (user, success, error) {
                //console.log('Auth login',user);
                var rememberme = user.REMEMBERME;
                $http.post(restUrl + '/login20', {EMAIL: user.EMAIL, PASS: user.PASS, ORGANIZATION_ID: user.ORGANIZATION}).success(function (user) {
                    //console.log("Auth - login success");
                    user.ORIG_USR_EMAIL = user.EMAIL;
                    user.ORIG_USR_NM = user.USR_NM;
                    changeUser(user);
                    //console.log('Auth - currentUser',currentUser);
                    if (rememberme) {
                        ipCookie('gsrt_auth', {EMAIL: currentUser.EMAIL, AUTH_HASH: currentUser.AUTH_HASH}, {expires: 7});
                    }
                    //console.log("Logged in, adding auth-token ",user.AUTH_HASH);
                    $http.defaults.headers.common['auth-token'] = user.AUTH_HASH;

                    success(user);

                }).error(function (msg) {
                    //console.log("Auth - login failed");
                    logout();
                    error(msg);
                });

            },
            loginas: function (user, success, error) {
                //console.log('Auth loginAs',user);
                $http.post(restUrl + '/loginas', user).success(function (user) {
                    //console.log("Auth - loginAs success");
                    changeUser(user);
                    success(user);
                }).error(function (msg) {
                    //console.log("Auth - loginAs failed");
                    error(msg);
                });
            },
            logout: function (success, error) {
                logout();
                success();
            },
            isLoggedIn: function () {
                return ('EMAIL' in currentUser && currentUser.EMAIL !== "") ? true : false;
            },
            isAuth: function (right) {
                return (currentUser[right] === true) ? true : false;
            },
            isOnBehalf: function () {
                return (currentUser.EMAIL !== currentUser.ORIG_USR_EMAIL);
            },
            user: currentUser,
            previousPath: "/"
        };
    }
})();

(function () {
    'use strict';

    angular
            .module('gcpt-my-customers')
            .factory('ipCookie', ipCookie);

    ipCookie.$inject = ['$document'];
    function ipCookie($document) {
        return (function () {
            function cookieFun(key, value, options) {

                var cookies,
                        list,
                        i,
                        cookie,
                        pos,
                        name,
                        hasCookies,
                        all,
                        expiresFor;

                options = options || {};

                if (value !== undefined) {
                    // we are setting value
                    value = typeof value === 'object' ? JSON.stringify(value) : String(value);

                    if (typeof options.expires === 'number') {
                        expiresFor = options.expires;
                        options.expires = new Date();
                        // Trying to delete a cookie; set a date far in the past
                        if (expiresFor === -1) {
                            options.expires = new Date('Thu, 01 Jan 1970 00:00:00 GMT');
                            // A new 
                        } else {
                            if (options.expirationUnit !== undefined) {
                                if (options.expirationUnit === 'minutes') {
                                    options.expires.setMinutes(options.expires.getMinutes() + expiresFor);
                                } else {
                                    options.expires.setDate(options.expires.getDate() + expiresFor);
                                }
                            } else {
                                options.expires.setDate(options.expires.getDate() + expiresFor);
                            }
                        }
                    }
                    return ($document[0].cookie = [
                        encodeURIComponent(key),
                        '=',
                        encodeURIComponent(value),
                        options.expires ? '; expires=' + options.expires.toUTCString() : '',
                        options.path ? '; path=' + options.path : '',
                        options.domain ? '; domain=' + options.domain : '',
                        options.secure ? '; secure' : ''
                    ].join(''));
                }

                list = [];
                all = $document[0].cookie;
                if (all) {
                    list = all.split("; ");
                }

                cookies = {};
                hasCookies = false;

                for (i = 0; i < list.length; ++i) {
                    if (list[i]) {
                        cookie = list[i];
                        pos = cookie.indexOf("=");
                        name = cookie.substring(0, pos);
                        value = decodeURIComponent(cookie.substring(pos + 1));

                        if (key === undefined || key === name) {
                            try {
                                cookies[name] = JSON.parse(value);
                            } catch (e) {
                                cookies[name] = value;
                            }
                            if (key === name) {
                                return cookies[name];
                            }
                            hasCookies = true;
                        }
                    }
                }
                if (hasCookies && key === undefined) {
                    return cookies;
                }
            }
            cookieFun.remove = function (key, options) {

                var hasCookie = cookieFun(key) !== undefined;
                if (hasCookie) {
                    if (!options) {
                        options = {};
                    }
                    options.expires = -1;
                    cookieFun(key, '', options);
                }
                return hasCookie;
            };
            return cookieFun;
        }());
    }
})();

(function () {
    'use strict';

    angular
            .module('gcpt-my-customers')
            .factory('MyCustomersFactory', MyCustomersFactory);

    MyCustomersFactory.$inject = ['$http','GCPTAuth', 'TifGrid', '$window'];

    function MyCustomersFactory($http,GCPTAuth, TifGrid, $window) {
        var factory = {};

        factory.data = [];
        factory.loaded = true;
        var restUrl = "/GCPT/rest";
        function getColumnDefs(source) {
            var columnDefs = [];
            if (source === '/gcpt/manager-list')
                columnDefs.push({headerName: "Sales Team", field: "SALES_TEAM", width: 90, cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "Status", field: "STATUS", width: 70, cellStyle: TifGrid.changeRowColor, comparator: TifGrid.statusComparator});
            columnDefs.push({headerName: "Sales territory", field: "SALES_TERRITORY", width: 100, cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "GSFA Cust. ID", field: "GSFA_CUSTOMER_ID", cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "Customer name", field: "CUSTOMER_NAME", cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.getCustomerName});
            columnDefs.push({headerName: "Local name", field: "CUTOMER_NAME_LOCAL", hide: true});
            columnDefs.push({headerName: "Customers Sales Stage", field: "SALES_STAGE", cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "# of days since last contact", field: "DAYS_SINCE_LAST_CONTACT", width: 125, cellStyle: TifGrid.changeRowColor, filterParams: {comparator: TifGrid.comparatorNumberFilter}});
            columnDefs.push({headerName: "GCPT activity", field: "NEXT_VISIT", width: 140, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridLocaleDate});
            columnDefs.push({headerName: "COMET activity", field: "NEXT_PLANNED_DATE", width: 90, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridLocaleDate});
            columnDefs.push({headerName: "Frequency Expiry Date", field: "FREQUENCY_EXPIRY_DATE", width: 110, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridLocaleDate});
            columnDefs.push({headerName: "YTD Loyalty", field: "LOYALTY_YTD", width: 90, cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "YTD Revenue", field: "REVENUE_YTD_LCY", width: 90, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridConvertCurrency, filterParams: {comparator: TifGrid.comparatorNumberFilter, cellRenderer: TifGrid.roundNumber}});
            columnDefs.push({headerName: "YTD Variance", field: "REVENUE_YTD_VS_LY", width: 90, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridConvertCurrency, filterParams: {comparator: TifGrid.comparatorNumberFilter, cellRenderer: TifGrid.roundNumber}});
            columnDefs.push({headerName: "FTB Month", field: "FTB_MONTH", width: 90, cellStyle: TifGrid.changeRowColor});
            columnDefs.push({headerName: "Current potential revenue", field: "STG_1TO5_REV", width: 140, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridConvertCurrency, filterParams: {comparator: TifGrid.comparatorNumberFilter, cellRenderer: TifGrid.roundNumber}});
            columnDefs.push({headerName: "Future potential revenue", field: "STG_9_REV", width: 140, cellStyle: TifGrid.changeRowColor, cellRenderer: TifGrid.gridConvertCurrency, filterParams: {comparator: TifGrid.comparatorNumberFilter, cellRenderer: TifGrid.roundNumber}});
            columnDefs.push({headerName: "Active Priorities", field: "ALL_PRIORITY_NAMES", width: 200, cellStyle: TifGrid.changeRowColor, filter: TifGrid.MultiplePartialSearchFilter, filterParams: {title: "Active Priorities Filter", delimiterSearch: ",", delimiterSearchName: "comma", delimiterValues: ","}});
            columnDefs.push({headerName: "Search Info", field: "SEARCH_INFO", hide: true});
            return columnDefs;
        }
        ;

        var cssId = "my-customers-grid";

        factory.grid = new TifGrid(cssId);

        factory.load = function (source) {
            //var url = '/customers/mycustomers/' + GCPTAuth.user.USR_ID;
            
            //For testing
            var url = 'src/customerList/rest/LSVOBODO';
            restUrl = "";
            if (source === '/gcpt/manager-list') {
                url = '/customers/manager/mycustomers/' + GCPTAuth.user.USR_ID;
            }
            factory.loaded = false;
            return $http({
                method: 'GET',
                url: restUrl + url
            }).then(function (response) {
                factory.data = response.data;
                factory.grid.setCountRows(response.data.length);
                factory.loaded = true;

                factory.grid.options.api.setColumnDefs(getColumnDefs(source));
                factory.grid.options.api.setRowData(response.data);

                factory.grid.options.api.setSortModel([{
                        colId: "STATUS",
                        sort: "asc"
                    }]);
            }, function (data) {
                // TODO: add alert
            });
            ;
        };

        factory.searchMyCustomer = function (myCustomerSearch, source) {
            var url = '/customers/mycustomers/' + GCPTAuth.user.USR_ID + '/' + myCustomerSearch;
            if (source === '/gcpt/manager-list') {
                url = '/customers/manager/mycustomers/' + GCPTAuth.user.USR_ID + '/' + myCustomerSearch;
            }
            factory.loaded = false;
            $http({
                method: 'GET',
                url: restUrl + url
            }).then(function (response) {
                factory.data = response.data;
                factory.grid.setCountRows(response.data.length);
                factory.loaded = true;

                factory.grid.options.api.setColumnDefs(getColumnDefs(source));
                factory.grid.options.api.setRowData(response.data);

                factory.grid.options.api.setSortModel([{
                        colId: "STATUS",
                        sort: "asc"
                    }]);
            }, function (data) {
                // TODO: add alert
            });
        }

        factory.loadUser = function (usrId, source) {
            var url = '/customers/mycustomers/' + usrId;
            if (source === '/gcpt/manager-list') {
                url = '/customers/manager/mycustomers/' + usrId;
            }
            factory.loaded = false;
            return $http({
                method: 'GET',
                url: restUrl + url
            }).then(function (response) {
                factory.data = response.data;
                factory.grid.setCountRows(response.data.length);
                factory.loaded = true;

                factory.grid.options.api.setColumnDefs(getColumnDefs(source));
                factory.grid.options.api.setRowData(response.data);

                factory.grid.options.api.setSortModel([{
                        colId: "STATUS",
                        sort: "asc"
                    }]);
            }, function (data) {
                // TODO: add alert
            });
            ;
        };

        factory.searchMyCustomerUser = function (myCustomerSearch, usrId, source) {
            var url = '/customers/mycustomers/' + usrId + '/' + myCustomerSearch;
            if (source === '/gcpt/manager-list') {
                url = '/customers/manager/mycustomers/' + usrId + '/' + myCustomerSearch;
            }
            factory.loaded = false;
            $http({
                method: 'GET',
                url: restUrl + url
            }).then(function (response) {
                factory.data = response.data;
                factory.grid.setCountRows(response.data.length);
                factory.loaded = true;

                factory.grid.options.api.setColumnDefs(getColumnDefs(source));
                factory.grid.options.api.setRowData(response.data);

                factory.grid.options.api.setSortModel([{
                        colId: "STATUS",
                        sort: "asc"
                    }]);
            }, function (data) {
                // TODO: add alert
            });
        }

        factory.getGridHeight = function (additionalSpace) {
            if (additionalSpace == undefined) {
                additionalSpace = 40;
            }
            var heightOfTopSize = 184;
            var heightOfBottomPadding = 65;
            var value = $window.innerHeight - heightOfTopSize - heightOfBottomPadding - additionalSpace;
            return value + "px";
        }

        factory.grid.style = {
            'height': factory.getGridHeight(40)
        };

        factory.destroy = function () {
            factory.data = [];
            factory.loaded = true;
            factory.grid = new TifGrid(cssId);
            factory.grid.style = {
                'height': factory.getGridHeight(40)
            };
        };

        return factory;
    }
})();

(function () {
    'use strict';

    angular
            .module('gcpt-my-customers')
            .filter('numberNZ', ["$filter", function ($filter) {

                return function (input, optional1, optional2) {
                    if (isNaN(input)) {
                        return input;
                    } else {
                        if (input == 0) {
                            return "-";
                        } else {
                            var nF = $filter('number')
                            var output = nF(input, optional1, optional2)
                            return output;

                        }

                    }
                };


            }])
            .factory('TifGrid', TifGrid);

    TifGrid.$inject = ['$location', '$timeout', 'GCPTAuth', 'numberNZFilter', '$filter'];

    function TifGrid($location, $timeout, GCPTAuth, numberNZFilter, $filter) {
        function TifGrid(cssId) {
            this.cssId = cssId;

            var options = {
                columnDefs: [],
                rowData: [],
                enableSorting: true,
                enableFilter: true,
                enableColResize: true,
                onFilterModified: onFilterModelUpdated,
                rowSelection: 'single',
                onSelectionChanged: selectRow,
                onReady: applyFilters,
                onAfterSortChanged: saveSort,
                onAfterFilterChanged: countNodes,
                quickFilterText: this.quickFilter,
                headerHeight: 48,
                rowHeight: 25,
                suppressMenuHide: true,
                rowBuffer: 40,
                customF: []
            };

            this.options = options;

            var countRows = 0;
            var scrollPosition = -1;
            var selectedRowId = -1;
            var filter = {};
            var sorting = {};

            this.quickFilter = "";
            this.scrollPosition = -1;
            this.selectedRowId = -1;
            this.filter = {};
            this.sorting = {};

            this.getCountRows = function () {
                return countRows;
            };

            this.setCountRows = function (value) {
                countRows = value;
            };

            this.setFilter = function (f) {
                filter = f;
                applyFilter();
            };

            this.setSorting = function (s) {
                sorting = s;
                applySort();
            };

            function datum() {
                var d = new Date();
                return d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
            }

            function applyFilter() {
                if (!options.api)
                    return;
                console.log(datum() + ": " + cssId + "applyFilter");
                options.api.setFilterModel(filter);
                countNodes();
                console.log(datum() + ": " + cssId + "applyFilter finish");
            }

            this.onFilterChanged = function () {
                console.log(datum() + ": " + cssId + "onFilterChanged");
                options.api.setQuickFilter(this.quickFilter);
                console.log(datum() + ": " + cssId + "onFilterChanged finish");
            };

            function applyFilters() {
                if (!options.api)
                    return;
                console.log(datum() + ": " + cssId + "applyFilters");
                applyFilter();
                applySort();
                if (document.querySelector("#" + cssId + " .ag-body-viewport") != null) {
                    document.querySelector("#" + cssId + " .ag-body-viewport").scrollTop = scrollPosition;
                }
                focusRow();
                console.log(datum() + ": " + cssId + "applyFilters finish");
            }

            function focusRow() {
                console.log(datum() + ": " + cssId + "focusRow");
                var selId = -1;
                options.api.getRenderedNodes().map(function (entry, i) {
                    if (entry.data == selectedRowId) {
                        selId = entry.childIndex;
                    }
                });
                var selectedRow = document.querySelectorAll('#' + cssId + ' .ag-row[row="' + selId + '"]');
                if (selectedRow != null) {
                    for (var i = 0; i < selectedRow.length; i++) {
                        selectedRow[i].className = selectedRow[i].className + " ag-row-focus";
                    }
                } else if (selId >= 0) {
                    $timeout(focusRow, 500);
                }
                console.log(datum() + ": " + cssId + "focusRow finish");
            }

            function selectRow(params) {
                console.log(datum() + ": " + cssId + "selectRow");
                params.selectedRows.map(function (entry, i) {
                    selectedRowId = entry;
                });
                scrollPosition = document.querySelector("#" + cssId + " .ag-body-viewport").scrollTop;
                console.log(datum() + ": " + cssId + "selectRow finish");
                $location.path('gcpt/detail/' + params.selectedRows[0].GSFA_CUSTOMER_ID);
            }

            this.selectRowMH = function (params) {
                console.log(datum() + ": " + cssId + "selectRowMH");
                params.selectedRows.map(function (entry, i) {
                    selectedRowId = entry;
                });
                scrollPosition = document.querySelector("#" + cssId + " .ag-body-viewport").scrollTop;
                console.log(datum() + ": " + cssId + "selectRowMH finish");
            };

            function applySort() {
                console.log(datum() + ": " + cssId + "applySort");
                options.api.setSortModel(sorting);
                console.log(datum() + ": " + cssId + "applySort finish");
            }

            function saveSort() {
                console.log(datum() + ": " + cssId + "saveSort");
                sorting = options.api.getSortModel();
                console.log(datum() + ": " + cssId + "saveSort finish");
            }

            function countNodes() {
                console.log(datum() + ": " + cssId + "countRows");
                countRows = 0;
                options.api.forEachNodeAfterFilter(incrementRows);
                console.log(datum() + ": " + cssId + "countRows finish");
            }

            function incrementRows() {
                countRows++;
            }

            function onFilterModelUpdated() {
                console.log(datum() + ": " + cssId + "onFilterModelUpdated");
                filter = options.api.getFilterModel();
                for (var key in filter) {
                    if (filter.hasOwnProperty(key)) {
                        for (var i = 0; i < filter[key].length; i++) {
                            if (filter[key][i] == "null") {
                                filter[key][i] = null;
                            }
                        }
                    }
                }
                console.log(datum() + ": " + cssId + "onFilterModelUpdated finish");
            }

            this.getAppliedFilters = function () {
                console.log(datum() + ": " + cssId + "getAppliedFilters");
                filter = options.api.getFilterModel();
                var appFilters = [];
                for (var key in filter) {
                    if (filter.hasOwnProperty(key)) {
                        appFilters.push(options.api.getColumnDef(key).headerName);
                    }
                }
                console.log(datum() + ": " + cssId + "getAppliedFilters finish");
                return appFilters.length > 0 ? appFilters : null;
            };

            this.resetFilters = function () {
                console.log(datum() + ": " + cssId + "resetFilters");
                options.api.filterManager.setFilterModel(null);
                this.setFilter(null);
                console.log(datum() + ": " + cssId + "resetFilters finish");
            };

        }

        TifGrid.comparatorNumberFilter = function (a, b) {
            return a - b;
        };

        TifGrid.statusComparator = function (valueA, valueB, nodeA, nodeB, isInverted) {
            if (nodeA != undefined && nodeB != undefined && nodeA.data.STAT_ORDERING != undefined && nodeB.data.STAT_ORDERING != undefined && valueA != "DONE" && valueB != "DONE") {
                if (nodeA.data.STAT_ORDERING == -1) {
                    return -1;
                }
                if (nodeB.data.STAT_ORDERING == -1) {
                    return 1;
                }
            }

            if (valueA == "SCHEDULED" && valueB == "SCHEDULED") {
                // both are scheduled, sort them by next scheduled date
                var nextDate1 = null;
                var nextDate2 = null;
                if (nodeA.data.NEXT_PLANNED_DATETIME != null && nodeA.data.NEXT_PLANNED_DATETIME != "NO" && nodeA.data.NEXT_PLANNED_DATETIME != "") {
                    nextDate1 = getDateFromFormat(nodeA.data.NEXT_PLANNED_DATETIME, "yyyy-MM-dd HH:mm");
                }
                if (nodeB.data.NEXT_PLANNED_DATETIME != null && nodeB.data.NEXT_PLANNED_DATETIME != "NO" && nodeB.data.NEXT_PLANNED_DATETIME != "") {
                    nextDate2 = getDateFromFormat(nodeB.data.NEXT_PLANNED_DATETIME, "yyyy-MM-dd HH:mm");
                }

                if (nextDate1 != null && nextDate2 != null) {
                    if (nextDate1 >= nextDate2) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    if (nextDate1 != null) {
                        return -1;
                    } else if (nextDate2 != null) {
                        return 1;
                    }
                }
            }

            if (valueA == "SCHEDULED") {
                return -1;
            }
            if (valueB == "SCHEDULED") {
                return 1;
            }
            if (valueA == "DONE") {
                return 1;
            }
            if (valueB == "DONE") {
                return -1;
            }
            if (valueA == "OPEN") {
                return -1;
            }
            if (valueB == "OPEN") {
                return 1;
            }
        };

        TifGrid.changeRowColor = function (params) {
            if (params.data.STATUS === "SCHEDULED") // || params.data.NEXT_PLANNED_DATE != null)
            {
                return {'color': '#c70000'};
            }

            if (params.data.IS_LAST_INBOUND_THIS_WEEK === "true") {
                return {'background-color': '#ffff00'};
            }
            if (params.data.STATUS === "DONE") {
                return {'background-color': '#dff0d8'};
            }
            /*
             if(params.data.STATUS === "DONE"){
             if(params.data.IS_LAST_INBOUND_THIS_WEEK === "true"){
             return {'background-color': '#ffff00'};
             } else
             return {'background-color': '#dff0d8'};    
             } 
             */
        };

        TifGrid.changeRowColorMH = function (params) {
            if (params.data.MH_STATUS === "SCHEDULED") // || params.data.NEXT_PLANNED_DATE != null)
            {
                return {'color': '#c70000'};
            }

            if (params.data.MH_STATUS === "DONE") {
                return {'background-color': '#dff0d8'};
            }
        };

        TifGrid.nextVisit = function (params) {
            params.$scope.n_NEXT_VISIT = params.data.STATUS == 'DONE' ? 'NO' : params.data.NEXT_VISIT;
            params.$scope.n_NEXT_PLANNED_DATE = params.data.NEXT_PLANNED_DATE;

            return '<span ng-show="n_NEXT_PLANNED_DATE == null">{{n_NEXT_VISIT | localeDate}}</span><span ng-show="n_NEXT_PLANNED_DATE != null">GCPT: {{n_NEXT_VISIT | localeDate}}<br> COMET: {{n_NEXT_PLANNED_DATE | localeDate}}</span>';
        };

        TifGrid.percentage = function (params) {
            if (params.value == null || params.value == undefined || params.value == "") {
                return "";
            }
            return params.value + '%';
        };

        TifGrid.gridFormatNumber = function (params) {
            return '{{' + params.value + ' | number:0}}';
        };

        TifGrid.getCustomerName = function (params) {
            if (params.data.CUTOMER_NAME_LOCAL == null) {
                return params.value;
            }
            return params.data.CUTOMER_NAME_LOCAL;
        };

        TifGrid.negativeNumberRed = function (params) {
            if (params.value < 0) // || params.data.NEXT_PLANNED_DATE != null)
            {
                return {'color': '#c70000'};
            }
            return {};
        };

        TifGrid.gridConvertCurrency = function (params) {
            
            function convertCurrency(input, fromCurrency) {
                if (isNaN(input)) {
                    return input;
                }

                if (fromCurrency) {
                    var customerRate = $filter('getByProperty')('CURRENCY_CODE', fromCurrency, GCPTAuth.user.CONVERSION_RATES);
                    if (customerRate == null || customerRate == undefined) {
                        return numberNZFilter(input, 0);
                    }
                    var custRate = customerRate.CONVERSION_RATE;

                    input = input / custRate;
                }


                //input = input * GCPTAuth.user.CURRENT_CONVERSION_RATE.CONVERSION_RATE;
                //For testing
                input = input * GCPTAuth.user.CURRENT_CONVERSION_RATE;
                var convertedInput = numberNZFilter(input, 0);
                if (input == 0) {
                    return convertedInput;
                }
                /*
                 // add symbol after number
                 if (GCPTAuth.user.CURRENT_CONVERSION_RATE.SYMBOL_AFTER) {
                 convertedInput += GCPTAuth.user.CURRENT_CONVERSION_RATE.CURRENCY_SYMBOL;
                 } else {
                 convertedInput = GCPTAuth.user.CURRENT_CONVERSION_RATE.CURRENCY_SYMBOL + convertedInput;
                 }*/
                return convertedInput;

            }
            ;
            return convertCurrency(params.value);
        };

        TifGrid.roundNumber = function (params) {
            if (params.value == null) {
                return "(Blanks)";
            }
            return Math.round(params.value);
        };

        TifGrid.roundNumberEW = function (params) {
            if (params.value == null) {
                return "";
            }
            return Math.round(params.value);
        };

        TifGrid.cellSpd = function (params) {
            if (params.value == null) {
                return "";
            }
            if (params.value < 1) {
                return Math.round(params.value * 10) / 10;
            }
            return Math.round(params.value);
        };

        TifGrid.gridLocaleDate = function (params) {

            function localeDate(input) {

                if (input == null || input == "null") {
                    return "";
                } else if (input.length < 10) {
                    return input;
                }

                if (input.length == 10) {
                    // format YYYY-MM-DD
                    var dateParts = input.split("-");
                    var year = dateParts[0];
                    var month = dateParts[1] - 1;
                    var day = dateParts[2];
                    var date = new Date(year, month, day);
                    return date.toLocaleDateString();
                } else if (input.length == 16) {
                    // format YYYY-MM-DD HH:MM
                    var dateParts = input.split("-");
                    var year = dateParts[0];
                    var month = dateParts[1] - 1;
                    var lastParts = dateParts[2].split(" ");
                    var day = lastParts[0];
                    var time = lastParts[1].split(":");
                    var hours = time[0];
                    var minutes = time[1];
                    var date = new Date(year, month, day, hours, minutes);
                    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
                }

            }
            ;

            return localeDate(params.value);
        };

        TifGrid.MultiplePartialSearchFilter = function () {
        };

        TifGrid.MultiplePartialSearchFilter.prototype.init = function (params) {
            this.valueGetter = params.valueGetter;
            this.filterText = null;
            this.title = params.filterParams.title;
            this.delimiterSearch = params.filterParams.delimiterSearch;
            this.delimiterSearchName = params.filterParams.delimiterSearchName;
            this.delimiterValues = params.filterParams.delimiterValues;
            this.setupGui(params);
            this.createApi(params);
        };

        // not called by ag-Grid, just for us to help setup
        TifGrid.MultiplePartialSearchFilter.prototype.setupGui = function (params) {
            this.gui = document.createElement('div');
            this.gui.innerHTML =
                    '<div style="padding: 4px; width: 200px;">' +
                    '<div style="font-weight: bold;">' + this.title + '</div>' +
                    '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Search..."/></div>' +
                    '<div class="ag-filter-apply-panel" id="applyPanel"><button type="button" id="applyButton">APPLY FILTER</button></div>' +
                    '<div style="margin-top: 20px;">Press Enter or Apply Filter Button.</div>' +
                    '<div style="margin-top: 20px;"><b>Use ' + this.delimiterSearchName + ' "' + this.delimiterSearch + '" as delimiter for multiple partial word search.</b></div>' +
                    '</div>';

            this.eFilterText = this.gui.querySelector('#filterText');
            this.applyButton = this.gui.querySelector('#applyButton');
            // IE doesn't fire changed for special keys (eg delete, backspace), so need to
            // listen for this further ones
            this.eFilterText.addEventListener("keydown", listener);
            this.applyButton.addEventListener("click", listener);

            var that = this;
            function listener(event) {
                if ((event.type === "keydown" && event.keyCode === 13) || (event.type === "click")) {
                    that.filterText = that.eFilterText.value;
                    params.filterChangedCallback();
                }
            }
        };

        TifGrid.MultiplePartialSearchFilter.prototype.getGui = function () {
            return this.gui;
        };

        TifGrid.MultiplePartialSearchFilter.prototype.doesFilterPass = function (params) {
            // make sure each word passes separately, ie search for firstname, lastname
            if (this.filterText === "")
                return true;
            var value = this.valueGetter(params);
            if (value === undefined || value === null)
                return false;
            var values = value.toLowerCase().split(this.delimiterValues);
            var filterTexts = this.filterText.toLowerCase().split(this.delimiterSearch);
            for (var i = 0; i < filterTexts.length; i++) {
                var pass = false;
                for (var j = 0; j < values.length; j++) {
                    if (values[j].indexOf(filterTexts[i]) > -1) {
                        pass = true;
                        break;
                    }
                }
                if (pass === false) {
                    return false;
                }
            }
            return true;
        };

        TifGrid.MultiplePartialSearchFilter.prototype.isFilterActive = function () {
            return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
        };

        TifGrid.MultiplePartialSearchFilter.prototype.getModel = function () {
            if (!this.isFilterActive())
                return null;
            var model = {value: this.filterText};
            return model;
        };

        TifGrid.MultiplePartialSearchFilter.prototype.setModel = function (model) {
            this.eFilterText.value = model === null ? null : model.value;
            this.filterText = this.eFilterText.value;
        };

        TifGrid.MultiplePartialSearchFilter.prototype.getApi = function () {
            return this.api;
        };

        TifGrid.MultiplePartialSearchFilter.prototype.createApi = function () {
            var t = this;
            this.api = {
                isFilterActive: function () {
                    return t.isFilterActive();
                },
                getModel: function () {
                    return t.getModel();
                },
                setModel: function (i) {
                    t.setModel(i);
                }
            };
        };
        return TifGrid;
    }
})();
}());