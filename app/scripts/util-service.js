(function (angular) {
    'use strict';

    var app = angular.module('utilApp', []);

    app.service('util', [function () {

        this.findIndex = function (list, predicate) {

            function exists (val) {
                return val !== undefined && val !== null;
            }

            function isFunction (v) {
                return typeof v === 'function';
            }

            function _findIndex (list, predicate) {
                if (! exists(list && list.length)) {
                    throw new TypeError('list must have length property');
                }
                if (! isFunction(predicate)) {
                    throw new TypeError('predicate must be a function');
                }
                var index = -1;
                list = Array.prototype.slice.call(list); // cast as array to use some.
                list.some(function (val, i) {
                    if (predicate(val, i, list)) {
                        index = i;
                        return true;
                    }
                });
                return index;
            }

            if (exists(list && list.length) && !isFunction(list)) {
                return _findIndex(list, predicate);
            }
            else if (isFunction(list)) {
                predicate = list;
                return function (list) {
                    return _findIndex(list, predicate);
                };
            }
            else {
                throw new TypeError('first argument must be a list (have length) or function');
            }
        };

        this.clone = function (parent, circular, depth, prototype) {
            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }

            var util = {
                isArray: function(ar) {
                    return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');
                },
                isDate: function(d) {
                    return typeof d === 'object' && objectToString(d) === '[object Date]';
                },
                isRegExp: function(re) {
                    return typeof re === 'object' && objectToString(re) === '[object RegExp]';
                },
                getRegExpFlags: function(re) {
                    var flags = '';
                    re.global && (flags += 'g');
                    re.ignoreCase && (flags += 'i');
                    re.multiline && (flags += 'm');
                    return flags;
                }
            };
            // maintain two arrays for circular references, where corresponding parents
            // and children have the same index
            var allParents = [];
            var allChildren = [];
            var useBuffer = typeof Buffer != 'undefined';
            if (typeof circular == 'undefined')
                circular = true;
            if (typeof depth == 'undefined')
                depth = Infinity;
            // recurse this function so we don't reset allParents and allChildren
            function _clone(parent, depth) {
                // cloning null always returns null
                if (parent === null)
                    return null;
                if (depth === 0)
                    return parent;
                var child;
                var proto;
                if (typeof parent != 'object') {
                    return parent;
                }
                if (util.isArray(parent)) {
                    child = [];
                } else if (util.isRegExp(parent)) {
                    child = new RegExp(parent.source, util.getRegExpFlags(parent));
                    if (parent.lastIndex) child.lastIndex = parent.lastIndex;
                } else if (util.isDate(parent)) {
                    child = new Date(parent.getTime());
                } else if (useBuffer && Buffer.isBuffer(parent)) {
                    child = new Buffer(parent.length);
                    parent.copy(child);
                    return child;
                } else {
                    if (typeof prototype == 'undefined') {
                        proto = Object.getPrototypeOf(parent);
                        child = Object.create(proto);
                    } else {
                        child = Object.create(prototype);
                        proto = prototype;
                    }
                }
                if (circular) {
                    var index = allParents.indexOf(parent);
                    if (index != -1) {
                        return allChildren[index];
                    }
                    allParents.push(parent);
                    allChildren.push(child);
                }
                for (var i in parent) {
                    var attrs;
                    if (proto) {
                        attrs = Object.getOwnPropertyDescriptor(proto, i);
                    }
                    if (attrs && attrs.set === null) {
                        continue;
                    }
                    child[i] = _clone(parent[i], depth - 1);
                }
                return child;
            }
            return _clone(parent, depth);
        };
        
    }]);

})(angular);
