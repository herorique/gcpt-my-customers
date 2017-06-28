
(function () {
    'use strict';

    angular
            .module('gcpt-my-customers')
            .filter('numberNZ', function ($filter) {

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


            })
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