angular.module('egCoreMod')

.directive('egNavbar', function() {
    return {
        restrict : 'AE',
        transclude : true,
        templateUrl : 'eg-navbar-template',
        controller:['$scope','$window','$location','$timeout','hotkeys','$rootScope',
                    'egCore','$uibModal','ngToast','egOpChange','$element',
            function($scope , $window , $location , $timeout , hotkeys , $rootScope ,
                     egCore , $uibModal , ngToast , egOpChange , $element) {

                $scope.rs = $rootScope;

                $scope.reprintLast = function (e) {
                    egCore.print.reprintLast();
                    return e.preventDefault();
                }

                function navTo(path) {
                    path = path.replace(/^\.\//,'');
                    $window.location.href = egCore.env.basePath + path;
                }       

                // adds a keyboard shortcut
                // http://chieffancypants.github.io/angular-hotkeys/
                $scope.addHotkey = function(key, path, desc, elm) {
                    angular.forEach(key.split(' '), function (k) {
                        hotkeys.add({
                            combo: k,
                            allowIn: ['INPUT','SELECT','TEXTAREA'],
                            description: desc,
                            callback: function(e) {
                                e.preventDefault();
                                if (path) return navTo(path,route);
                                return $timeout(function(){$(elm).trigger('click')});
                            }
                        });
                    });
                };

                function inspect(elm) {
                    elm = angular.element(elm);
                    if (elm.attr('eg-accesskey')) {
                        $scope.addHotkey(
                            elm.attr('eg-accesskey'),
                            elm.attr('href'),
                            elm.attr('eg-accesskey-desc'),
                            elm
                        );
                    }
                    angular.forEach(elm.children(), inspect);
                }
                $timeout(function(){inspect($element)});

                $scope.retrieveLastRecord = function() {
                    var last_record = egCore.hatch.getLocalItem("eg.cat.last_record_retrieved");
                    if (last_record) {
                        $window.location.href =
                            egCore.env.basePath + 'cat/catalog/record/' + last_record;
                    }
                }

                $scope.applyLocale = function(locale) {
                    // EGWeb.pm can change the locale for us w/ the right param
                    // Note: avoid using $location.search() to derive a new
                    // URL, since it creates an intermediate path change.
                    // Instead, use the ham-fisted approach of killing any
                    // search args and applying the args we want.
                    $window.location.href = 
                        $window.location.href.replace(
                            /(\?|\&).*/,
                            '?set_eg_locale=' + encodeURIComponent(locale)
                        );
                }

                $scope.changeOperatorUndo = function() {
                    egOpChange.changeOperatorUndo().then(function() {
                        $scope.op_changed = false;
                        $scope.username = egCore.auth.user().usrname();
                    });
                }

                $scope.changeOperator = function() {
                    egOpChange.changeOperator().then(function() {
                        $scope.op_changed = egCore.auth.OCtoken() ? true : false;
                        $scope.username = egCore.auth.user().usrname();
                    });
                }

                $scope.currentToken = function () {
                    return egCore.auth.token();
                }

                // Returns true if the browser is connected to Hatch
                $scope.hatchConnected = function() {
                    return egCore.hatch.hatchAvailable;
                }

                // tied to logout link
                $scope.logout = function() {
                    egCore.auth.logout();
                    return true;
                };

                egCore.startup.go().then(
                    function() {
                        if (egCore.auth.user()) {
                            $scope.op_changed = egCore.auth.OCtoken() ? true : false;
                            $scope.username = egCore.auth.user().usrname();
                            $scope.workstation = egCore.auth.workstation();
                        }
                    }
                );
            }
        ]
    }
});
 
