
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