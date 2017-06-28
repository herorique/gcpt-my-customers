
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