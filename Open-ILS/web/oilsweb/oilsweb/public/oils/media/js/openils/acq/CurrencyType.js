/* ---------------------------------------------------------------------------
 * Copyright (C) 2008  Georgia Public Library Service
 * Bill Erickson <erickson@esilibrary.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * ---------------------------------------------------------------------------
 */

if(!dojo._hasResource["openils.acq.CurrencyType"]) {

    dojo._hasResource["openils.acq.CurrencyType"] = true;
    dojo.provide("openils.acq.CurrencyType");
    dojo.declare('openils.acq.CurrencyType', null, {
    });

    openils.acq.CurrencyType.cache = {};

    /**
     * Retrieves all of the currency types
     */
    openils.acq.CurrencyType.fetchAll = function(onComplete) {
        var req = new OpenSRF.ClientSession('open-ils.acq').request(
            'open-ils.acq.currency_type.all.retrieve', openils.User.authtoken);

        req.oncomplete = function(r) {
            var msg = r.recv();
            var types = msg.content();
            for(var i in types) 
                openils.acq.CurrencyType.cache[types[i].code()] = types[i];
            onComplete(types);
        }
        req.send();
    }
}

