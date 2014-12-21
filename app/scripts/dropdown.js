/*
modo de usar:
<dropdown title="Empresa" ng-model="filterOptions.empresa" open="true">
    <dropdown-group title="j.nome" ng-repeat="j in jobs">{{j.nome}}</dropdown-group>
</dropdown>
*/
(function (angular) {
    'use strict';

    angular.module('dropdown', ['ngSanitize'])
    .controller('DropDownController', ['$scope', function($scope) {
            $scope.items = [];

            this.add_item = function(scope) {
                $scope.items.push(scope);

                scope.$on('$destroy', function(event) {
                    this.remove_accordion(scope);
                });

                return $scope.items;
            };

            this.remove_item = function(scope) {
                var index = $scope.items.indexOf(scope);
                if (index !== -1)
                    $scope.items.splice(index, 1);
            };

            this.update_title = function(title) {
                var i = 0;
                for (i in $scope.items) {
                    $scope.items[i].title = title;
                }
            };

        }
    ])
    .directive('dropdown', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            controller: 'DropDownController',
            scope: {
                title: '@',
                open: '@',
                model: '=ngModel'
            },
            template: '<div class="{{dropdown_class}}">' + '<div class="text">{{title}}</div>' + '<i class="dropdown icon"></i>' + '<div class="{{dropdown_item_class}}" ng-transclude>' + '</div>' + '</div>',
            link: function(scope, element, attrs, DropDownController) {
                scope.dropdown_class = 'ui selection dropdown';
                scope.dropdown_item_class = 'menu transition';

                if (scope.open === 'true') {
                    scope.open = true;
                    scope.dropdown_class = scope.dropdown_class + ' active visible';
                    scope.dropdown_item_class = scope.dropdown_item_class + ' visible';
                } else {
                    scope.open = false;
                }
                DropDownController.add_item(scope);

                //
                // Watch for title changing
                //
                scope.$watch('title', function(val) {
                    if (val === undefined)
                        return;

                    if (val === scope.title)
                        return;

                    scope.model = val;
                });

                //
                // Watch for ng-model changing
                //
                scope.$watch('model', function(val) {
                    // update title
                    scope.model = val;
                    DropDownController.update_title(val);
                });

                var _close = function () {
                    scope.open = false;
                    scope.model = scope.title;
                    scope.$apply(function() {
                        scope.dropdown_class = 'ui selection dropdown';
                        scope.dropdown_item_class = 'menu transition hidden';
                    });
                };

                var _open = function () {
                    scope.open = true;
                    scope.$apply(function() {
                        scope.dropdown_class = 'ui selection dropdown active visible';
                        scope.dropdown_item_class = 'menu transition visible';
                    });
                };

                element.bind('click', function() {

                    if (scope.open === false) {
                        _open();
                    } else {
                        _close();
                    }
                });

               
            }
        };
    })

    .directive('dropdownGroup', function() {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            require: '^dropdown',
            scope: {
                title: '=title'
            },
            template: '<div class="item {{item_class}}" ng-transclude >{{title}}</div>',
            link: function(scope, element, attrs, DropDownController) {
                scope.item_class = '';
                var title;
                if (scope.title === undefined) {
                    title = scope.title;
                } else {
                    title = element.children()[0].innerHTML;
                }

                element.bind('click', function() {
                    scope.item_class = 'active selected';
                    DropDownController.update_title(scope.title);
                });
            }
        };
    });


})(angular);