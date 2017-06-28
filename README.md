# customer-list
1/
Currently, CONVERSION_RATE can't run. Thus, we remove it for testing as below :

Location : src/customerList/services/grid.factory.js
//input = input * GCPTAuth.user.CURRENT_CONVERSION_RATE.CONVERSION_RATE;
//For testing
input = input * GCPTAuth.user.CURRENT_CONVERSION_RATE;
