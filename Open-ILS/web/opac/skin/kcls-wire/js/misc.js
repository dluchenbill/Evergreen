/* Some really basic utils copied mostly from old opac js:
 * opac_utils.js, utils.js, misc.js (kcls). */
function $(id) { return document.getElementById(id); }

function swapCSSClass(obj, old, newc) {
	removeCSSClass(obj, old);
	addCSSClass(obj, newc);
}

function addCSSClass(e,c) {
	if(!e || !c) return;

	var css_class_string = e.className;
	var css_class_array;

	if(css_class_string)
		css_class_array = css_class_string.split(/\s+/);

	var string_ip = ""; /*strip out nulls*/
	for (var css_class in css_class_array) {
		if (css_class_array[css_class] == c) { return; }
		if(css_class_array[css_class] !=null)
			string_ip += css_class_array[css_class] + " ";
	}
	string_ip += c;
	e.className = string_ip;
}

function removeCSSClass(e, c) {
	if(!e || !c) return;

	var css_class_string = '';

	var css_class_array = e.className;
	if( css_class_array )
		css_class_array = css_class_array.split(/\s+/);

	var first = 1;
	for (var css_class in css_class_array) {
		if (css_class_array[css_class] != c) {
			if (first == 1) {
				css_class_string = css_class_array[css_class];
				first = 0;
			} else {
				css_class_string = css_class_string + ' ' +
					css_class_array[css_class];
			}
		}
	}
	e.className = css_class_string;
}

function hideMe(obj) { addCSSClass(obj, "hide_me"); }
function unHideMe(obj) { removeCSSClass(obj, "hide_me"); }

function swapTabs(el) {
    if (!el) return;

    var tabs = [];
    for (var i = 0; i < el.parentNode.childNodes.length; i++) {
        var node = el.parentNode.childNodes[i];
        if (node.nodeType == 1 && node.nodeName.toLowerCase() == "a")
            tabs.push(node);
    }

    for (var n = 0; n < tabs.length; n++) {
        var i = tabs[n];
        if (i == el) {
            unHideMe($(i.rel));
            i.style.background = "url('/opac/skin/kcls/graphics/" +
                i.id + "_on.gif') no-repeat bottom";
        } else {
            hideMe($(i.rel));
            i.style.background = "url('/opac/skin/kcls/graphics/" +
                i.id + "_off.gif') no-repeat bottom";
        }
    }
}

function sortHolds() {
    alert("FIXME disconnected");
    /* XXX TODO There was a method for sorting loaded holds in the DOM
     * without reloading the page, but it was reliant on fieldmapper
     * and some stock dojo libraries.  Could be reimplemented without
     * deps if deemed worth it.
     */
}

function showDetailedResults(/* Boolean */ detailed) {
    alert("FIXME disconnected");
    /* XXX TODO this stands in for an old onchange handler that toggled
     * between simple and detailed results in the rresults page.
     * Don't know if we want to keep this around or not (I'm guessing not,
     * and that we'll do this with two different server-side pages now,
     * but leaving this stub here for now).
     */
}
