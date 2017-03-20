/**
 * Core Service - egIDL
 *
 * IDL parser
 * usage:
 *  var aou = new egIDL.aou();
 *  var fullIDL = egIDL.classes;
 *
 *  IDL TODO:
 *
 * 1. selector field only appears once per class.  We could save
 *    a lot of IDL (network) space storing it only once at the 
 *    class level.
 * 2. we don't need to store array_position in /IDL2js since it
 *    can be derived at parse time.  Ditto saving space.
 */
angular.module('egCoreMod')

.factory('egIDL', ['$window', function($window) {

    var service = {};

    // Clones data structures containing fieldmapper objects
    service.Clone = function(old) {
        var obj;
        if (typeof old == 'undefined') {
            return old;
        } else if (old._isfieldmapper) {
            obj = new service[old.classname]()

            for( var i in old.a ) {
                var thing = old.a[i];
                if(thing === null) continue;

                if (typeof thing == 'undefined') {
                    obj.a[i] = thing;
                } else if (thing._isfieldmapper) {
                    obj.a[i] = service.Clone(thing);
                } else {

                    if(angular.isArray(thing)) {
                        obj.a[i] = [];

                        for( var j in thing ) {

                            if (typeof thing[j] == 'undefined')
                                obj.a[i][j] = thing[j];
                            else if( thing[j]._isfieldmapper )
                                obj.a[i][j] = service.Clone(thing[j]);
                            else
                                obj.a[i][j] = angular.copy(thing[j]);
                        }
                    }
                }
            }
        } else {
            if(angular.isArray(old)) {
                obj = [];
                for( var j in old ) {
                    if (typeof old[j] == 'undefined')
                        obj[j] = old[j];
                    else if( old[j]._isfieldmapper )
                        obj[j] = service.Clone(old[j]);
                    else
                        obj[j] = angular.copy(old[j]);
                }
            } else if(angular.isObject(old)) {
                obj = {};
                for( var j in old ) {
                    if (typeof old[j] == 'undefined')
                        obj[j] = old[j];
                    else if( old[j]._isfieldmapper )
                        obj[j] = service.Clone(old[j]);
                    else
                        obj[j] = angular.copy(old[j]);
                }
            } else {
                obj = angular.copy(old);
            }
        }
        return obj;
    };

    service.parseIDL = function() {
        //console.debug('egIDL.parseIDL()');

        // retain a copy of the full IDL within the service
        service.classes = $window._preload_fieldmapper_IDL;

        // keep this reference around (note: not a clone, just a ref)
        // so that unit tests, which repeatedly instantiate the
        // service will work.
        //$window._preload_fieldmapper_IDL = null;

        /**
         * Creates the class constructor and getter/setter
         * methods for each IDL class.
         */
        function mkclass(cls, fields) {

            service.classes[cls].core_label = service.classes[cls].core ? 'Core sources' : 'Non-core sources';
            service.classes[cls].classname = cls;

            service[cls] = function(seed) {
                this.a = seed || [];
                this.classname = cls;
                this._isfieldmapper = true;
            }

            /** creates the getter/setter methods for each field */
            angular.forEach(fields, function(field, idx) {
                service[cls].prototype[fields[idx].name] = function(n) {
                    if (arguments.length==1) this.a[idx] = n;
                    return this.a[idx];
                }
            });

            // global class constructors required for JSON_v1.js
            $window[cls] = service[cls]; 
        }

        for (var cls in service.classes) 
            mkclass(cls, service.classes[cls].fields);
    };

    /**
     * Generate a hash version of an IDL object.
     *
     * Flatten determines if nested objects should be squashed into
     * the top-level hash.
     *
     * If 'flatten' is false, e.g.:
     *
     * {"call_number" : {"label" :  "foo"}}
     *
     * If 'flatten' is true, e.g.:
     *
     * e.g.  {"call_number.label" : "foo"}
     */
    service.toHash = function(obj, flatten) {
        if (!angular.isObject(obj)) return obj; // arrays are objects

        if (angular.isArray(obj)) { // NOTE: flatten arrays not supported
            return obj.map(function(item) {return service.toHash(item)});
        }

        var field_names = obj.classname ? 
            Object.keys(service.classes[obj.classname].field_map) :
            Object.keys(obj);

        var hash = {};
        angular.forEach(
            field_names,
            function(field) { 

                var val = service.toHash(
                    angular.isFunction(obj[field]) ? 
                        obj[field]() : obj[field], 
                    flatten
                );

                if (flatten && angular.isObject(val)) {
                    angular.forEach(val, function(sub_val, key) {
                        var fname = field + '.' + key;
                        hash[fname] = sub_val;
                    });

                } else if (val !== undefined) {
                    hash[field] = val;
                }
            }
        );

        return hash;
    }

    // returns a simple string key=value string of an IDL object.
    service.toString = function(obj) {
        var s = '';
        angular.forEach(
            service.classes[obj.classname].fields.sort(
                function(a,b) {return a.name < b.name ? -1 : 1}),
            function(field) {
                s += field.name + '=' + obj[field.name]() + '\n';
            }
        );
        return s;
    }

    // hash-to-IDL object translater.  Does not support nested values.
    service.fromHash = function(cls, hash) {
        if (!service.classes[cls]) {
            console.error('No such IDL class ' + cls);
            return null;
        }

        var new_obj = new service[cls]();
        angular.forEach(hash, function(val, key) {
            if (!angular.isFunction(new_obj[key])) return;
            new_obj[key](hash[key]);
        });

        return new_obj;
    }

    // Transforms a flattened hash (see toHash() or egGridFlatDataProvider)
    // to a nested hash.
    //
    // e.g. {"call_number.label" : "foo"} => {"call_number":{"label":"foo"}}
    service.flatToNestedHash = function(obj) {
        var hash = {};
        angular.forEach(obj, function(val, key) {
            var parts = key.split('.');
            var sub_hash = hash;
            var last_key;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (i == parts.length - 1) {
                    sub_hash[part] = val;
                    break;
                } else {
                    if (!sub_hash[part])
                        sub_hash[part] = {};
                    sub_hash = sub_hash[part];
                }
            }
        });

        return hash;
    }

    // Using IDL links, allow construction of a tree-ish data structure from
    // the IDL2js web service output.  This structure will be directly usable
    // by the <treecontrol> directive
    service.classTree = {
        top : null
    };

    function _sort_class_fields (a,b) {
        var aname = a.label || a.name;
        var bname = b.label || b.name;
        return aname > bname ? 1 : -1;
    }

    service.classTree.buildNode = function (cls, args) {
        if (!cls) return null;

        var n = service.classes[cls];
        if (!n) return null;

        if (!args)
            args = { label : n.label };

        args.id = cls;
        if (args.from)
            args.id = args.from + '.' + args.id;

        return angular.extend( args, {
            idl     : service[cls],
            jtype   : 'inner',
            uplink  : args.link,
            classname: cls,
            struct  : n,
            table   : n.table,
            fields  : n.fields.sort( _sort_class_fields ),
            links   : n.fields
                .filter( function(x) { return x.type == 'link'; } )
                .sort( _sort_class_fields ),
            children: []
        });
    }

    service.classTree.fleshNode = function ( node ) {
        if (node.children.length > 0)
            return node; // already done already

        angular.forEach(
            node.links.sort( _sort_class_fields ),
            function (n) {
                var nlabel = n.label ? n.label : n.name;
                node.children.push(
                    service.classTree.buildNode(
                        n["class"],
                        {   label : nlabel,
                            from  : node.id,
                            link  : n
                        }
                    )
                );
            }
        );

        return node;
    }

    service.classTree.setTop = function (cls) {
        console.debug('setTop: '+cls);
        return service.classTree.top = service.classTree.fleshNode(
            service.classTree.buildNode(cls)
        );
    }

    service.classTree.getTop = function () {
        return service.classTree.top;
    }

    return service;
}])
;
