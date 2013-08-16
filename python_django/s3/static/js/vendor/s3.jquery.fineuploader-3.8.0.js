/*!
 * Fine Uploader
 *
 * Copyright 2013, Widen Enterprises, Inc. info@fineuploader.com
 *
 * Version: 3.8.0
 *
 * Homepage: http://fineuploader.com
 *
 * Repository: git://github.com/Widen/fine-uploader.git
 *
 * Licensed under GNU GPL v3, see LICENSE
 */ 


/*globals window, navigator, document, FormData, File, HTMLInputElement, XMLHttpRequest, Blob, Storage*/
var qq = function(element) {
    "use strict";

    return {
        hide: function() {
            element.style.display = 'none';
            return this;
        },

        /** Returns the function which detaches attached event */
        attach: function(type, fn) {
            if (element.addEventListener){
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.attachEvent('on' + type, fn);
            }
            return function() {
                qq(element).detach(type, fn);
            };
        },

        detach: function(type, fn) {
            if (element.removeEventListener){
                element.removeEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.detachEvent('on' + type, fn);
            }
            return this;
        },

        contains: function(descendant) {
            // The [W3C spec](http://www.w3.org/TR/domcore/#dom-node-contains)
            // says a `null` (or ostensibly `undefined`) parameter
            // passed into `Node.contains` should result in a false return value.
            // IE7 throws an exception if the parameter is `undefined` though.
            if (!descendant) {
                return false;
            }

            // compareposition returns false in this case
            if (element === descendant) {
                return true;
            }

            if (element.contains){
                return element.contains(descendant);
            } else {
                /*jslint bitwise: true*/
                return !!(descendant.compareDocumentPosition(element) & 8);
            }
        },

        /**
         * Insert this element before elementB.
         */
        insertBefore: function(elementB) {
            elementB.parentNode.insertBefore(element, elementB);
            return this;
        },

        remove: function() {
            element.parentNode.removeChild(element);
            return this;
        },

        /**
         * Sets styles for an element.
         * Fixes opacity in IE6-8.
         */
        css: function(styles) {
            if (styles.opacity != null){
                if (typeof element.style.opacity !== 'string' && typeof(element.filters) !== 'undefined'){
                    styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
                }
            }
            qq.extend(element.style, styles);

            return this;
        },

        hasClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            return re.test(element.className);
        },

        addClass: function(name) {
            if (!qq(element).hasClass(name)){
                element.className += ' ' + name;
            }
            return this;
        },

        removeClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
            return this;
        },

        getByClass: function(className) {
            var candidates,
                result = [];

            if (element.querySelectorAll){
                return element.querySelectorAll('.' + className);
            }

            candidates = element.getElementsByTagName("*");

            qq.each(candidates, function(idx, val) {
                if (qq(val).hasClass(className)){
                    result.push(val);
                }
            });
            return result;
        },

        children: function() {
            var children = [],
                child = element.firstChild;

            while (child){
                if (child.nodeType === 1){
                    children.push(child);
                }
                child = child.nextSibling;
            }

            return children;
        },

        setText: function(text) {
            element.innerText = text;
            element.textContent = text;
            return this;
        },

        clearText: function() {
            return qq(element).setText("");
        }
    };
};

qq.log = function(message, level) {
    "use strict";

    if (window.console) {
        if (!level || level === 'info') {
            window.console.log(message);
        }
        else
        {
            if (window.console[level]) {
                window.console[level](message);
            }
            else {
                window.console.log('<' + level + '> ' + message);
            }
        }
    }
};

qq.isObject = function(variable) {
    "use strict";
    return variable && !variable.nodeType && Object.prototype.toString.call(variable) === '[object Object]';
};

qq.isFunction = function(variable) {
    "use strict";
    return typeof(variable) === "function";
};

qq.isArray = function(variable) {
    "use strict";
    return Object.prototype.toString.call(variable) === "[object Array]";
};

// Looks for an object on a `DataTransfer` object that is associated with drop events when utilizing the Filesystem API.
qq.isItemList = function(maybeItemList) {
    "use strict";
    return Object.prototype.toString.call(maybeItemList) === "[object DataTransferItemList]";
};

qq.isString = function(maybeString) {
    "use strict";
    return Object.prototype.toString.call(maybeString) === '[object String]';
};

qq.trimStr = function(string) {
    if (String.prototype.trim) {
        return string.trim();
    }

    return string.replace(/^\s+|\s+$/g,'');
};


/**
 * @param str String to format.
 * @returns {string} A string, swapping argument values with the associated occurrence of {} in the passed string.
 */
qq.format = function(str) {
    "use strict";

    var args =  Array.prototype.slice.call(arguments, 1),
        newStr = str;

    qq.each(args, function(idx, val) {
        newStr = newStr.replace(/{}/, val);
    });

    return newStr;
};

qq.isFile = function(maybeFile) {
    "use strict";

    return window.File && Object.prototype.toString.call(maybeFile) === '[object File]'
};

qq.isFileList = function(maybeFileList) {
    return window.FileList && Object.prototype.toString.call(maybeFileList) === '[object FileList]'
}

qq.isFileOrInput = function(maybeFileOrInput) {
    "use strict";

    return qq.isFile(maybeFileOrInput) || qq.isInput(maybeFileOrInput);
};

qq.isInput = function(maybeInput) {
    if (window.HTMLInputElement) {
        if (Object.prototype.toString.call(maybeInput) === '[object HTMLInputElement]') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }
    if (maybeInput.tagName) {
        if (maybeInput.tagName.toLowerCase() === 'input') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }

    return false;
};

qq.isBlob = function(maybeBlob) {
    "use strict";
    return window.Blob && Object.prototype.toString.call(maybeBlob) === '[object Blob]';
};

qq.isXhrUploadSupported = function() {
    "use strict";
    var input = document.createElement('input');
    input.type = 'file';

    return (
        input.multiple !== undefined &&
            typeof File !== "undefined" &&
            typeof FormData !== "undefined" &&
            typeof (new XMLHttpRequest()).upload !== "undefined" );
};

qq.isFolderDropSupported = function(dataTransfer) {
    "use strict";
    return (dataTransfer.items && dataTransfer.items[0].webkitGetAsEntry);
};

qq.isFileChunkingSupported = function() {
    "use strict";
    return !qq.android() && //android's impl of Blob.slice is broken
        qq.isXhrUploadSupported() &&
        (File.prototype.slice !== undefined || File.prototype.webkitSlice !== undefined || File.prototype.mozSlice !== undefined);
};

qq.extend = function(first, second, extendNested) {
    "use strict";

    qq.each(second, function(prop, val) {
        if (extendNested && qq.isObject(val)) {
            if (first[prop] === undefined) {
                first[prop] = {};
            }
            qq.extend(first[prop], val, true);
        }
        else {
            first[prop] = val;
        }
    });

    return first;
};

/**
 * Allow properties in one object to override properties in another,
 * keeping track of the original values from the target object.
 *
 * Note that the pre-overriden properties to be overriden by the source will be passed into the `sourceFn` when it is invoked.
 *
 * @param target Update properties in this object from some source
 * @param sourceFn A function that, when invoked, will return properties that will replace properties with the same name in the target.
 * @returns {object} The target object
 */
qq.override = function(target, sourceFn) {
    var super_ = {},
        source = sourceFn(super_);

    qq.each(source, function(srcPropName, srcPropVal) {
        if (target[srcPropName] !== undefined) {
            super_[srcPropName] = target[srcPropName];
        }

        target[srcPropName] = srcPropVal;
    });

    return target;
};

/**
 * Searches for a given element in the array, returns -1 if it is not present.
 * @param {Number} [from] The index at which to begin the search
 */
qq.indexOf = function(arr, elt, from){
    "use strict";

    if (arr.indexOf) {
        return arr.indexOf(elt, from);
    }

    from = from || 0;
    var len = arr.length;

    if (from < 0) {
        from += len;
    }

    for (; from < len; from+=1){
        if (arr.hasOwnProperty(from) && arr[from] === elt){
            return from;
        }
    }
    return -1;
};

//this is a version 4 UUID
qq.getUniqueId = function(){
    "use strict";

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        /*jslint eqeq: true, bitwise: true*/
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//
// Browsers and platforms detection

qq.ie       = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE') !== -1;
};
qq.ie7      = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 7') !== -1;
};
qq.ie10     = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 10') !== -1;
};
qq.safari   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf("Apple") !== -1;
};
qq.chrome   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf('Google') !== -1;
};
qq.firefox  = function(){
    "use strict";
    return (navigator.userAgent.indexOf('Mozilla') !== -1 && navigator.vendor !== undefined && navigator.vendor === '');
};
qq.windows  = function(){
    "use strict";
    return navigator.platform === "Win32";
};
qq.android = function(){
    "use strict";
    return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
};
qq.ios = function() {
    "use strict";
    return navigator.userAgent.indexOf("iPad") !== -1
        || navigator.userAgent.indexOf("iPod") !== -1
        || navigator.userAgent.indexOf("iPhone") !== -1;
};

//
// Events

qq.preventDefault = function(e){
    "use strict";
    if (e.preventDefault){
        e.preventDefault();
    } else{
        e.returnValue = false;
    }
};

/**
 * Creates and returns element from html string
 * Uses innerHTML to create an element
 */
qq.toElement = (function(){
    "use strict";
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var element = div.firstChild;
        div.removeChild(element);
        return element;
    };
}());

//key and value are passed to callback for each entry in the iterable item
qq.each = function(iterableItem, callback) {
    "use strict";
    var keyOrIndex, retVal;

    if (iterableItem) {
        // Iterate through [`Storage`](http://www.w3.org/TR/webstorage/#the-storage-interface) items
        if (window.Storage && iterableItem.constructor === window.Storage) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(iterableItem.key(keyOrIndex), iterableItem.getItem(iterableItem.key(keyOrIndex)));
                if (retVal === false) {
                    break;
                }
            }
        }
        // `DataTransferItemList` objects are array-like and should be treated as arrays when iterating over items inside the object.
        else if (qq.isArray(iterableItem) || qq.isItemList(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                if (retVal === false) {
                    break;
                }
            }
        }
        else if (qq.isString(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem.charAt(keyOrIndex));
                if (retVal === false) {
                    break;
                }
            }
        }
        else {
            for (keyOrIndex in iterableItem) {
                if (Object.prototype.hasOwnProperty.call(iterableItem, keyOrIndex)) {
                    retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                    if (retVal === false) {
                        break;
                    }
                }
            }
        }
    }
};

//include any args that should be passed to the new function after the context arg
qq.bind = function(oldFunc, context) {
    if (qq.isFunction(oldFunc)) {
        var args =  Array.prototype.slice.call(arguments, 2);

        return function() {
            var newArgs = qq.extend([], args);
            if (arguments.length) {
                newArgs = newArgs.concat(Array.prototype.slice.call(arguments))
            }
            return oldFunc.apply(context, newArgs);
        };
    }

    throw new Error("first parameter must be a function!");
};

/**
 * obj2url() takes a json-object as argument and generates
 * a querystring. pretty much like jQuery.param()
 *
 * how to use:
 *
 *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 * will result in:
 *
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  Object JSON-Object
 * @param  String current querystring-part
 * @return String encoded querystring
 */
qq.obj2url = function(obj, temp, prefixDone){
    "use strict";
    /*jshint laxbreak: true*/
     var uristrings = [],
         prefix = '&',
         add = function(nextObj, i){
            var nextTemp = temp
                ? (/\[\]$/.test(temp)) // prevent double-encoding
                ? temp
                : temp+'['+i+']'
                : i;
            if ((nextTemp !== 'undefined') && (i !== 'undefined')) {
                uristrings.push(
                    (typeof nextObj === 'object')
                        ? qq.obj2url(nextObj, nextTemp, true)
                        : (Object.prototype.toString.call(nextObj) === '[object Function]')
                        ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                        : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)
                );
            }
        };

    if (!prefixDone && temp) {
        prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
        uristrings.push(temp);
        uristrings.push(qq.obj2url(obj));
    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj !== 'undefined') ) {
        qq.each(obj, function(idx, val) {
            add(val, idx);
        });
    } else if ((typeof obj !== 'undefined') && (obj !== null) && (typeof obj === "object")){
        qq.each(obj, function(prop, val) {
            add(val, prop);
        });
    } else {
        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
    }

    if (temp) {
        return uristrings.join(prefix);
    } else {
        return uristrings.join(prefix)
            .replace(/^&/, '')
            .replace(/%20/g, '+');
    }
};

qq.obj2FormData = function(obj, formData, arrayKeyName) {
    "use strict";
    if (!formData) {
        formData = new FormData();
    }

    qq.each(obj, function(key, val) {
        key = arrayKeyName ? arrayKeyName + '[' + key + ']' : key;

        if (qq.isObject(val)) {
            qq.obj2FormData(val, formData, key);
        }
        else if (qq.isFunction(val)) {
            formData.append(key, val());
        }
        else {
            formData.append(key, val);
        }
    });

    return formData;
};

qq.obj2Inputs = function(obj, form) {
    "use strict";
    var input;

    if (!form) {
        form = document.createElement('form');
    }

    qq.obj2FormData(obj, {
        append: function(key, val) {
            input = document.createElement('input');
            input.setAttribute('name', key);
            input.setAttribute('value', val);
            form.appendChild(input);
        }
    });

    return form;
};

qq.setCookie = function(name, value, days) {
    var date = new Date(),
        expires = "";

	if (days) {
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}

	document.cookie = name+"="+value+expires+"; path=/";
};

qq.getCookie = function(name) {
	var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        cookie;

    qq.each(ca, function(idx, part) {
        var cookiePart = part;
        while (cookiePart.charAt(0)==' ') {
            cookiePart = cookiePart.substring(1, cookiePart.length);
        }

        if (cookiePart.indexOf(nameEQ) === 0) {
            cookie = cookiePart.substring(nameEQ.length, cookiePart.length);
            return false;
        }
    });

    return cookie;
};

qq.getCookieNames = function(regexp) {
    var cookies = document.cookie.split(';'),
        cookieNames = [];

    qq.each(cookies, function(idx, cookie) {
        cookie = qq.trimStr(cookie);

        var equalsIdx = cookie.indexOf("=");

        if (cookie.match(regexp)) {
            cookieNames.push(cookie.substr(0, equalsIdx));
        }
    });

    return cookieNames;
};

qq.deleteCookie = function(name) {
	qq.setCookie(name, "", -1);
};

qq.areCookiesEnabled = function() {
    var randNum = Math.random() * 100000,
        name = "qqCookieTest:" + randNum;
    qq.setCookie(name, 1);

    if (qq.getCookie(name)) {
        qq.deleteCookie(name);
        return true;
    }
    return false;
};

/**
 * Not recommended for use outside of Fine Uploader since this falls back to an unchecked eval if JSON.parse is not
 * implemented.  For a more secure JSON.parse polyfill, use Douglas Crockford's json2.js.
 */
qq.parseJson = function(json) {
    /*jshint evil: true*/
    if (window.JSON && qq.isFunction(JSON.parse)) {
        return JSON.parse(json);
    } else {
        return eval("(" + json + ")");
    }
};

/**
 * Retrieve the extension of a file, if it exists.
 *
 * @param filename
 * @returns {string || undefined}
 */
qq.getExtension = function(filename) {
    var extIdx = filename.lastIndexOf('.') + 1;

    if (extIdx > 0) {
        return filename.substr(extIdx, filename.length - extIdx);
    }
};

/**
 * A generic module which supports object disposing in dispose() method.
 * */
qq.DisposeSupport = function() {
    "use strict";
    var disposers = [];

    return {
        /** Run all registered disposers */
        dispose: function() {
            var disposer;
            do {
                disposer = disposers.shift();
                if (disposer) {
                    disposer();
                }
            }
            while (disposer);
        },

        /** Attach event handler and register de-attacher as a disposer */
        attach: function() {
            var args = arguments;
            /*jslint undef:true*/
            this.addDisposer(qq(args[0]).attach.apply(this, Array.prototype.slice.call(arguments, 1)));
        },

        /** Add disposer to the collection */
        addDisposer: function(disposeFunction) {
            disposers.push(disposeFunction);
        }
    };
};

qq.version="3.8.0";
qq.supportedFeatures = (function () {
    var supportsUploading,
        supportsAjaxFileUploading,
        supportsFolderDrop,
        supportsChunking,
        supportsResume,
        supportsUploadViaPaste,
        supportsUploadCors,
        supportsDeleteFileXdr,
        supportsDeleteFileCorsXhr,
        supportsDeleteFileCors;


    function testSupportsFileInputElement() {
        var supported = true,
            tempInput;

        try {
            tempInput = document.createElement('input');
            tempInput.type = 'file';
            qq(tempInput).hide();

            if (tempInput.disabled) {
                supported = false;
            }
        }
        catch (ex) {
            supported = false;
        }

        return supported;
    }

    //only way to test for Filesystem API support since webkit does not expose the DataTransfer interface
    function isChrome21OrHigher() {
        return qq.chrome() &&
            navigator.userAgent.match(/Chrome\/[2][1-9]|Chrome\/[3-9][0-9]/) !== undefined;
    }

    //only way to test for complete Clipboard API support at this time
    function isChrome14OrHigher() {
        return qq.chrome() &&
            navigator.userAgent.match(/Chrome\/[1][4-9]|Chrome\/[2-9][0-9]/) !== undefined;
    }

    //Ensure we can send cross-origin `XMLHttpRequest`s
    function isCrossOriginXhrSupported() {
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();

            //Commonly accepted test for XHR CORS support.
            return xhr.withCredentials !== undefined;
        }

        return false;
    }

    //Test for (terrible) cross-origin ajax transport fallback for IE9 and IE8
    function isXdrSupported() {
        return window.XDomainRequest !== undefined;
    }

    // CORS Ajax requests are supported if it is either possible to send credentialed `XMLHttpRequest`s,
    // or if `XDomainRequest` is an available alternative.
    function isCrossOriginAjaxSupported() {
        if (isCrossOriginXhrSupported()) {
            return true;
        }

        return isXdrSupported();
    }


    supportsUploading = testSupportsFileInputElement();

    supportsAjaxFileUploading = supportsUploading && qq.isXhrUploadSupported();

    supportsFolderDrop = supportsAjaxFileUploading && isChrome21OrHigher();

    supportsChunking = supportsAjaxFileUploading && qq.isFileChunkingSupported();

    supportsResume = supportsAjaxFileUploading && supportsChunking && qq.areCookiesEnabled();

    supportsUploadViaPaste = supportsAjaxFileUploading && isChrome14OrHigher();

    supportsUploadCors = supportsUploading && (window.postMessage !== undefined || supportsAjaxFileUploading);

    supportsDeleteFileCorsXhr = isCrossOriginXhrSupported();

    supportsDeleteFileXdr = isXdrSupported();

    supportsDeleteFileCors = isCrossOriginAjaxSupported();


    return {
        uploading: supportsUploading,
        ajaxUploading: supportsAjaxFileUploading,
        fileDrop: supportsAjaxFileUploading, //NOTE: will also return true for touch-only devices.  It's not currently possible to accurately test for touch-only devices
        folderDrop: supportsFolderDrop,
        chunking: supportsChunking,
        resume: supportsResume,
        uploadCustomHeaders: supportsAjaxFileUploading,
        uploadNonMultipart: supportsAjaxFileUploading,
        itemSizeValidation: supportsAjaxFileUploading,
        uploadViaPaste: supportsUploadViaPaste,
        progressBar: supportsAjaxFileUploading,
        uploadCors: supportsUploadCors,
        deleteFileCorsXhr: supportsDeleteFileCorsXhr,
        deleteFileCorsXdr: supportsDeleteFileXdr, //NOTE: will also return true in IE10, where XDR is also supported
        deleteFileCors: supportsDeleteFileCors,
        canDetermineSize: supportsAjaxFileUploading
    }

}());

/*globals qq*/
qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
        successCallbacks = [],
        failureCallbacks = [],
        doneCallbacks = [],
        state = 0;

    return {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1 && onFailure) {
                onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null,successArgs);
            }

            return this;
        },

        done: function(callback) {
            if (state === 0) {
                doneCallbacks.push(callback);
            }
            else {
                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);
            }

            return this;
        },

        success: function() {
            state = 1;
            successArgs = arguments;

            if (successCallbacks.length) {
                qq.each(successCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            if(doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            return this;
        },

        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            if(doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            return this;
        }
    };
};

qq.isPromise = function(maybePromise) {
    return maybePromise && maybePromise.then && maybePromise.done;
};

/*globals qq*/

/**
 * This module represents an upload or "Select File(s)" button.  It's job is to embed an opaque `<input type="file">`
 * element as a child of a provided "container" element.  This "container" element (`options.element`) is used to provide
 * a custom style for the `<input type="file">` element.  The ability to change the style of the container element is also
 * provided here by adding CSS classes to the container on hover/focus.
 *
 * TODO Eliminate the mouseover and mouseout event handlers since the :hover CSS pseudo-class should now be
 * available on all supported browsers.
 *
 * @param o Options to override the default values
 */
qq.UploadButton = function(o) {
    "use strict";

    var input,
       // Used to detach all event handlers created at once for this instance
        disposeSupport = new qq.DisposeSupport(),

        options = {
            // "Container" element
            element: null,

            // If true adds `multiple` attribute to `<input type="file">`
            multiple: false,

            // Corresponds to the `accept` attribute on the associated `<input type="file">`

            acceptFiles: null,

            // `name` attribute of `<input type="file">`
            name: 'qqfile',

            // Called when the browser invokes the onchange handler on the `<input type="file">`
            onChange: function(input) {},

            // **This option will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
            hoverClass: 'qq-upload-button-hover',

            focusClass: 'qq-upload-button-focus'
        };

    // Overrides any of the default option values with any option values passed in during construction.
    qq.extend(options, o);


    // Embed an opaque `<input type="file">` element as a child of `options.element`.
    function createInput() {
        var input = document.createElement("input");

        if (options.multiple){
            input.setAttribute("multiple", "multiple");
        }

        if (options.acceptFiles) {
            input.setAttribute("accept", options.acceptFiles);
        }

        input.setAttribute("type", "file");
        input.setAttribute("name", options.name);

        qq(input).css({
            position: 'absolute',
            // in Opera only 'browse' button
            // is clickable and it is located at
            // the right side of the input
            right: 0,
            top: 0,
            fontFamily: 'Arial',
            // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
            fontSize: '118px',
            margin: 0,
            padding: 0,
            cursor: 'pointer',
            opacity: 0
        });

        options.element.appendChild(input);

        disposeSupport.attach(input, 'change', function(){
            options.onChange(input);
        });

        // **These event handlers will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
        disposeSupport.attach(input, 'mouseover', function(){
            qq(options.element).addClass(options.hoverClass);
        });
        disposeSupport.attach(input, 'mouseout', function(){
            qq(options.element).removeClass(options.hoverClass);
        });

        disposeSupport.attach(input, 'focus', function(){
            qq(options.element).addClass(options.focusClass);
        });
        disposeSupport.attach(input, 'blur', function(){
            qq(options.element).removeClass(options.focusClass);
        });

        // IE and Opera, unfortunately have 2 tab stops on file input
        // which is unacceptable in our case, disable keyboard access
        if (window.attachEvent) {
            // it is IE or Opera
            input.setAttribute('tabIndex', "-1");
        }

        return input;
    }

    // Make button suitable container for input
    qq(options.element).css({
        position: 'relative',
        overflow: 'hidden',
        // Make sure browse button is in the right side in Internet Explorer
        direction: 'ltr'
    });

    input = createInput();


    // Exposed API
    return {
        getInput: function(){
            return input;
        },

        reset: function(){
            if (input.parentNode){
                qq(input).remove();
            }

            qq(options.element).removeClass(options.focusClass);
            input = createInput();
        }
    };
};

/*globals qq*/
qq.PasteSupport = function(o) {
    "use strict";

    var options, detachPasteHandler;

    options = {
        targetElement: null,
        callbacks: {
            log: function(message, level) {},
            pasteReceived: function(blob) {}
        }
    };

    function isImage(item) {
        return item.type &&
            item.type.indexOf("image/") === 0;
    }

    function registerPasteHandler() {
        qq(options.targetElement).attach("paste", function(event) {
            var clipboardData = event.clipboardData;

            if (clipboardData) {
                qq.each(clipboardData.items, function(idx, item) {
                    if (isImage(item)) {
                        var blob = item.getAsFile();
                        options.callbacks.pasteReceived(blob);
                    }
                });
            }
        });
    }

    function unregisterPasteHandler() {
        if (detachPasteHandler) {
            detachPasteHandler();
        }
    }

    qq.extend(options, o);
    registerPasteHandler();

    return {
        reset: function() {
            unregisterPasteHandler();
        }
    };
};
qq.UploadData = function(uploaderProxy) {
    var data = [],
        byId = {},
        byUuid = {},
        byStatus = {},
        api;

    function getDataByIds(ids) {
        if (qq.isArray(ids)) {
            var entries = [];

            qq.each(ids, function(idx, id) {
                entries.push(data[byId[id]]);
            });

            return entries;
        }

        return data[byId[ids]];
    }

    function getDataByUuids(uuids) {
        if (qq.isArray(uuids)) {
            var entries = [];

            qq.each(uuids, function(idx, uuid) {
                entries.push(data[byUuid[uuid]]);
            });

            return entries;
        }

        return data[byUuid[uuids]];
    }

    function getDataByStatus(status) {
        var statusResults = [],
            statuses = [].concat(status);

        qq.each(statuses, function(index, statusEnum) {
            var statusResultIndexes = byStatus[statusEnum];

            if (statusResultIndexes !== undefined) {
                qq.each(statusResultIndexes, function(i, dataIndex) {
                    statusResults.push(data[dataIndex]);
                });
            }
        });

        return statusResults;
    }

    api = {
        added: function(id) {
            var uuid = uploaderProxy.getUuid(id),
                name = uploaderProxy.getName(id),
                size = uploaderProxy.getSize(id),
                status = qq.status.SUBMITTING;

            var index = data.push({
                id: id,
                name: name,
                originalName: name,
                uuid: uuid,
                size: size,
                status: status
            }) - 1;

            byId[id] = index;

            byUuid[uuid] = index;

            if (byStatus[status] === undefined) {
                byStatus[status] = [];
            }
            byStatus[status].push(index);

            uploaderProxy.onStatusChange(id, undefined, status);
        },

        retrieve: function(optionalFilter) {
            if (qq.isObject(optionalFilter) && data.length)  {
                if (optionalFilter.id !== undefined) {
                    return getDataByIds(optionalFilter.id);
                }

                else if (optionalFilter.uuid !== undefined) {
                    return getDataByUuids(optionalFilter.uuid);
                }

                else if (optionalFilter.status) {
                    return getDataByStatus(optionalFilter.status);
                }
            }
            else {
                return qq.extend([], data, true);
            }
        },

        reset: function() {
            data = [];
            byId = {};
            byUuid = {};
            byStatus = {};
        },

        setStatus: function(id, newStatus) {
            var dataIndex = byId[id],
                oldStatus = data[dataIndex].status,
                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], dataIndex);

            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);

            data[dataIndex].status = newStatus;

            if (byStatus[newStatus] === undefined) {
                byStatus[newStatus] = [];
            }
            byStatus[newStatus].push(dataIndex);

            uploaderProxy.onStatusChange(id, oldStatus, newStatus);
        },

        uuidChanged: function(id, newUuid) {
            var dataIndex = byId[id],
                oldUuid = data[dataIndex].uuid;

            data[dataIndex].uuid = newUuid;
            byUuid[newUuid] = dataIndex;
            delete byUuid[oldUuid];
        },

        nameChanged: function(id, newName) {
            var dataIndex = byId[id];

            data[dataIndex].name = newName;
        }
    };

    return api;
};

qq.status = {
    SUBMITTING: "submitting",
    SUBMITTED: "submitted",
    REJECTED: "rejected",
    QUEUED: "queued",
    CANCELED: "canceled",
    UPLOADING: "uploading",
    UPLOAD_RETRYING: "retrying upload",
    UPLOAD_SUCCESSFUL: "upload successful",
    UPLOAD_FAILED: "upload failed",
    DELETE_FAILED: "delete failed",
    DELETING: "deleting",
    DELETED: "deleted"
};

/**
 * Defines the public API for FineUploaderBasic mode.
 */
qq.basePublicApi = {
    log: function(str, level) {
        if (this._options.debug && (!level || level === 'info')) {
            qq.log('[FineUploader ' + qq.version + '] ' + str);
        }
        else if (level && level !== 'info') {
            qq.log('[FineUploader ' + qq.version + '] ' + str, level);

        }
    },
    setParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.params = params;
        }
        else {
            this._paramsStore.setParams(params, id);
        }
    },
    setDeleteFileParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.params = params;
        }
        else {
            this._deleteFileParamsStore.setParams(params, id);
        }
    },
    setEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.endpoint = endpoint;
        }
        else {
            this._endpointStore.setEndpoint(endpoint, id);
        }
    },
    getInProgress: function() {
        return this._filesInProgress.length;
    },
    getNetUploads: function() {
        return this._netUploaded;
    },
    uploadStoredFiles: function() {
        var idToUpload;

        if (this._storedIds.length === 0) {
            this._itemError('noFilesError');
        }
        else {
            while (this._storedIds.length) {
                idToUpload = this._storedIds.shift();
                this._filesInProgress.push(idToUpload);
                this._handler.upload(idToUpload);
            }
        }
    },
    clearStoredFiles: function(){
        this._storedIds = [];
    },
    retry: function(id) {
        if (this._onBeforeManualRetry(id)) {
            this._netUploadedOrQueued++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);
            this._handler.retry(id);
            return true;
        }
        else {
            return false;
        }
    },
    cancel: function(id) {
        this._handler.cancel(id);
    },
    cancelAll: function() {
        var storedIdsCopy = [],
            self = this;

        qq.extend(storedIdsCopy, this._storedIds);
        qq.each(storedIdsCopy, function(idx, storedFileId) {
            self.cancel(storedFileId);
        });

        this._handler.cancelAll();
    },
    reset: function() {
        this.log("Resetting uploader...");

        this._handler.reset();
        this._filesInProgress = [];
        this._storedIds = [];
        this._autoRetries = [];
        this._retryTimeouts = [];
        this._preventRetries = [];
        this._button.reset();
        this._paramsStore.reset();
        this._endpointStore.reset();
        this._netUploadedOrQueued = 0;
        this._netUploaded = 0;
        this._uploadData.reset();

        if (this._pasteHandler) {
            this._pasteHandler.reset();
        }
    },
    addFiles: function(filesOrInputs, params, endpoint) {
        var self = this,
            verifiedFilesOrInputs = [],
            fileOrInputIndex, fileOrInput, fileIndex;

        if (filesOrInputs) {
            if (!qq.isFileList(filesOrInputs)) {
                filesOrInputs = [].concat(filesOrInputs);
            }

            for (fileOrInputIndex = 0; fileOrInputIndex < filesOrInputs.length; fileOrInputIndex+=1) {
                fileOrInput = filesOrInputs[fileOrInputIndex];

                if (qq.isFileOrInput(fileOrInput)) {
                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {
                        for (fileIndex = 0; fileIndex < fileOrInput.files.length; fileIndex++) {
                            verifiedFilesOrInputs.push(fileOrInput.files[fileIndex]);
                        }
                    }
                    else {
                        verifiedFilesOrInputs.push(fileOrInput);
                    }
                }
                else {
                    self.log(fileOrInput + ' is not a File or INPUT element!  Ignoring!', 'warn');
                }
            }

            this.log('Received ' + verifiedFilesOrInputs.length + ' files or inputs.');
            this._prepareItemsForUpload(verifiedFilesOrInputs, params, endpoint);
        }
    },
    addBlobs: function(blobDataOrArray, params, endpoint) {
        if (blobDataOrArray) {
            var blobDataArray = [].concat(blobDataOrArray),
                verifiedBlobDataList = [],
                self = this;

            qq.each(blobDataArray, function(idx, blobData) {
                if (qq.isBlob(blobData) && !qq.isFileOrInput(blobData)) {
                    verifiedBlobDataList.push({
                        blob: blobData,
                        name: self._options.blobs.defaultName
                    });
                }
                else if (qq.isObject(blobData) && blobData.blob && blobData.name) {
                    verifiedBlobDataList.push(blobData);
                }
                else {
                    self.log("addBlobs: entry at index " + idx + " is not a Blob or a BlobData object", "error");
                }
            });

            this._prepareItemsForUpload(verifiedBlobDataList, params, endpoint);
        }
        else {
            this.log("undefined or non-array parameter passed into addBlobs", "error");
        }
    },
    getUuid: function(id) {
        return this._handler.getUuid(id);
    },
    setUuid: function(id, newUuid) {
        return this._handler.setUuid(id, newUuid);
    },
    getResumableFilesData: function() {
        return this._handler.getResumableFilesData();
    },
    getSize: function(id) {
        return this._handler.getSize(id);
    },
    getName: function(id) {
        return this._handler.getName(id);
    },
    setName: function(id, newName) {
        this._handler.setName(id, newName);
        this._uploadData.nameChanged(id, newName);
    },
    getFile: function(fileOrBlobId) {
        return this._handler.getFile(fileOrBlobId);
    },
    deleteFile: function(id) {
        this._onSubmitDelete(id);
    },
    setDeleteFileEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.endpoint = endpoint;
        }
        else {
            this._deleteFileEndpointStore.setEndpoint(endpoint, id);
        }
    },
    doesExist: function(fileOrBlobId) {
        return this._handler.isValid(fileOrBlobId);
    },
    getUploads: function(optionalFilter) {
        return this._uploadData.retrieve(optionalFilter);
    }
};




/**
 * Defines the private (internal) API for FineUploaderBasic mode.
 */
qq.basePrivateApi = {
    _handleCheckedCallback: function(details) {
        var self = this,
            callbackRetVal = details.callback();

        if (qq.isPromise(callbackRetVal)) {
            this.log(details.name + " - waiting for " + details.name + " promise to be fulfilled for " + details.identifier);
            return callbackRetVal.then(
                function(successParam) {
                    self.log(details.name + " promise success for " + details.identifier);
                    details.onSuccess(successParam);
                },
                function() {
                    if (details.onFailure) {
                        self.log(details.name + " promise failure for " + details.identifier);
                        details.onFailure();
                    }
                    else {
                        self.log(details.name + " promise failure for " + details.identifier);
                    }
                });
        }

        if (callbackRetVal !== false) {
            details.onSuccess(callbackRetVal);
        }
        else {
            if (details.onFailure) {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Invoking failure callback.")
                details.onFailure();
            }
            else {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Will not proceed.")
            }
        }

        return callbackRetVal;
    },
    _createUploadButton: function(element){
        var self = this;

        var button = new qq.UploadButton({
            element: element,
            multiple: this._options.multiple && qq.supportedFeatures.ajaxUploading,
            acceptFiles: this._options.validation.acceptFiles,
            onChange: function(input){
                self._onInputChange(input);
            },
            hoverClass: this._options.classes.buttonHover,
            focusClass: this._options.classes.buttonFocus
        });

        this._disposeSupport.addDisposer(function() { button.dispose(); });
        return button;
    },
    _createUploadHandler: function(additionalOptions, namespace) {
        var self = this,
            options = {
                debug: this._options.debug,
                maxConnections: this._options.maxConnections,
                inputName: this._options.request.inputName,
                cors: this._options.cors,
                demoMode: this._options.demoMode,
                paramsStore: this._paramsStore,
                endpointStore: this._endpointStore,
                chunking: this._options.chunking,
                resume: this._options.resume,
                blobs: this._options.blobs,
                log: function(str, level) {
                    self.log(str, level);
                },
                onProgress: function(id, name, loaded, total){
                    self._onProgress(id, name, loaded, total);
                    self._options.callbacks.onProgress(id, name, loaded, total);
                },
                onComplete: function(id, name, result, xhr){
                    var retVal = self._onComplete(id, name, result, xhr);

                    // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback
                    // until the promise has been fulfilled.
                    if (qq.isPromise(retVal)) {
                        retVal.done(function() {
                            self._options.callbacks.onComplete(id, name, result, xhr);
                        });
                    }
                    else {
                        self._options.callbacks.onComplete(id, name, result, xhr);
                    }
                },
                onCancel: function(id, name) {
                    return self._handleCheckedCallback({
                        name: "onCancel",
                        callback: qq.bind(self._options.callbacks.onCancel, self, id, name),
                        onSuccess: qq.bind(self._onCancel, self, id, name),
                        identifier: id
                    });
                },
                onUpload: function(id, name) {
                    self._onUpload(id, name);
                    self._options.callbacks.onUpload(id, name);
                },
                onUploadChunk: function(id, name, chunkData){
                    self._options.callbacks.onUploadChunk(id, name, chunkData);
                },
                onResume: function(id, name, chunkData) {
                    return self._options.callbacks.onResume(id, name, chunkData);
                },
                onAutoRetry: function(id, name, responseJSON, xhr) {
                    self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];

                    if (self._shouldAutoRetry(id, name, responseJSON)) {
                        self._maybeParseAndSendUploadError(id, name, responseJSON, xhr);
                        self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id] + 1);
                        self._onBeforeAutoRetry(id, name);

                        self._retryTimeouts[id] = setTimeout(function() {
                            self._onAutoRetry(id, name, responseJSON)
                        }, self._options.retry.autoAttemptDelay * 1000);

                        return true;
                    }
                    else {
                        return false;
                    }
                },
                onUuidChanged: function(id, newUuid) {
                    self._uploadData.uuidChanged(id, newUuid);
                }
            };

        qq.each(this._options.request, function(prop, val) {
            options[prop] = val;
        });

        if (additionalOptions) {
            qq.each(additionalOptions, function(key, val) {
                options[key] = val;
            });
        }

        return new qq.UploadHandler(options, namespace);
    },
    _createDeleteHandler: function() {
        var self = this;

        return new qq.DeleteFileAjaxRequestor({
            method: this._options.deleteFile.method,
            maxConnections: this._options.maxConnections,
            uuidParamName: this._options.request.uuidName,
            customHeaders: this._options.deleteFile.customHeaders,
            paramsStore: this._deleteFileParamsStore,
            endpointStore: this._deleteFileEndpointStore,
            demoMode: this._options.demoMode,
            cors: this._options.cors,
            log: function(str, level) {
                self.log(str, level);
            },
            onDelete: function(id) {
                self._onDelete(id);
                self._options.callbacks.onDelete(id);
            },
            onDeleteComplete: function(id, xhrOrXdr, isError) {
                self._onDeleteComplete(id, xhrOrXdr, isError);
                self._options.callbacks.onDeleteComplete(id, xhrOrXdr, isError);
            }

        });
    },
    _createPasteHandler: function() {
        var self = this;

        return new qq.PasteSupport({
            targetElement: this._options.paste.targetElement,
            callbacks: {
                log: function(str, level) {
                    self.log(str, level);
                },
                pasteReceived: function(blob) {
                    self._handleCheckedCallback({
                        name: "onPasteReceived",
                        callback: qq.bind(self._options.callbacks.onPasteReceived, self, blob),
                        onSuccess: qq.bind(self._handlePasteSuccess, self, blob),
                        identifier: "pasted image"
                    });
                }
            }
        });
    },
    _createUploadDataTracker: function() {
        var self = this;

        return new qq.UploadData({
            getName: function(id) {
                return self.getName(id);
            },
            getUuid: function(id) {
                return self.getUuid(id);
            },
            getSize: function(id) {
                return self.getSize(id);
            },
            onStatusChange: function(id, oldStatus, newStatus) {
                self._onUploadStatusChange(id, oldStatus, newStatus);
                self._options.callbacks.onStatusChange(id, oldStatus, newStatus);
            }
        });
    },
    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        //nothing to do in the basic uploader
    },
    _handlePasteSuccess: function(blob, extSuppliedName) {
        var extension = blob.type.split("/")[1],
            name = extSuppliedName;

        /*jshint eqeqeq: true, eqnull: true*/
        if (name == null) {
            name = this._options.paste.defaultName;
        }

        name += '.' + extension;

        this.addBlobs({
            name: name,
            blob: blob
        });
    },
    _preventLeaveInProgress: function(){
        var self = this;

        this._disposeSupport.attach(window, 'beforeunload', function(e){
            if (!self._filesInProgress.length){return;}

            var e = e || window.event;
            // for ie, ff
            e.returnValue = self._options.messages.onLeave;
            // for webkit
            return self._options.messages.onLeave;
        });
    },
    _onSubmit: function(id, name) {
        this._netUploadedOrQueued++;

        if (this._options.autoUpload) {
            this._filesInProgress.push(id);
        }
    },
    _onProgress: function(id, name, loaded, total) {
        //nothing to do yet in core uploader
    },
    _onComplete: function(id, name, result, xhr) {
        if (!result.success) {
            this._netUploadedOrQueued--;
            this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);
        }
        else {
            this._netUploaded++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);
        }

        this._removeFromFilesInProgress(id);
        this._maybeParseAndSendUploadError(id, name, result, xhr);

        return result.success ? true : false;
    },
    _onCancel: function(id, name) {
        this._netUploadedOrQueued--;

        this._removeFromFilesInProgress(id);

        clearTimeout(this._retryTimeouts[id]);

        var storedItemIndex = qq.indexOf(this._storedIds, id);
        if (!this._options.autoUpload && storedItemIndex >= 0) {
            this._storedIds.splice(storedItemIndex, 1);
        }

        this._uploadData.setStatus(id, qq.status.CANCELED);
    },
    _isDeletePossible: function() {
        if (!this._options.deleteFile.enabled) {
            return false;
        }

        if (this._options.cors.expected) {
            if (qq.supportedFeatures.deleteFileCorsXhr) {
                return true;
            }

            if (qq.supportedFeatures.deleteFileCorsXdr && this._options.cors.allowXdr) {
                return true;
            }

            return false;
        }

        return true;
    },
    _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {
        var uuid = this.getUuid(id),
            adjustedOnSuccessCallback;

        if (onSuccessCallback) {
            adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);
        }

        if (this._isDeletePossible()) {
            return this._handleCheckedCallback({
                name: "onSubmitDelete",
                callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),
                onSuccess: adjustedOnSuccessCallback ||
                    qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),
                identifier: id
            });
        }
        else {
            this.log("Delete request ignored for ID " + id + ", delete feature is disabled or request not possible " +
                "due to CORS on a user agent that does not support pre-flighting.", "warn");
            return false;
        }
    },
    _onDelete: function(id) {
        this._uploadData.setStatus(id, qq.status.DELETING);
    },
    _onDeleteComplete: function(id, xhrOrXdr, isError) {
        var name = this._handler.getName(id);

        if (isError) {
            this._uploadData.setStatus(id, qq.status.DELETE_FAILED);
            this.log("Delete request for '" + name + "' has failed.", "error");

            // For error reporing, we only have accesss to the response status if this is not
            // an `XDomainRequest`.
            if (xhrOrXdr.withCredentials === undefined) {
                this._options.callbacks.onError(id, name, "Delete request failed", xhrOrXdr);
            }
            else {
                this._options.callbacks.onError(id, name, "Delete request failed with response code " + xhrOrXdr.status, xhrOrXdr);
            }
        }
        else {
            this._netUploadedOrQueued--;
            this._netUploaded--;
            this._handler.expunge(id);
            this._uploadData.setStatus(id, qq.status.DELETED);
            this.log("Delete request for '" + name + "' has succeeded.");
        }
    },
    _removeFromFilesInProgress: function(id) {
        var index = qq.indexOf(this._filesInProgress, id);
        if (index >= 0) {
            this._filesInProgress.splice(index, 1);
        }
    },
    _onUpload: function(id, name) {
        this._uploadData.setStatus(id, qq.status.UPLOADING);
    },
    _onInputChange: function(input){
        if (qq.supportedFeatures.ajaxUploading) {
            this.addFiles(input.files);
        }
        else {
            this.addFiles(input);
        }

        this._button.reset();
    },
    _onBeforeAutoRetry: function(id, name) {
        this.log("Waiting " + this._options.retry.autoAttemptDelay + " seconds before retrying " + name + "...");
    },
    _onAutoRetry: function(id, name, responseJSON) {
        this.log("Retrying " + name + "...");
        this._autoRetries[id]++;
        this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);
        this._handler.retry(id);
    },
    _shouldAutoRetry: function(id, name, responseJSON) {
        if (!this._preventRetries[id] && this._options.retry.enableAuto) {
            if (this._autoRetries[id] === undefined) {
                this._autoRetries[id] = 0;
            }

            return this._autoRetries[id] < this._options.retry.maxAutoAttempts;
        }

        return false;
    },
    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var itemLimit = this._options.validation.itemLimit;

        if (this._preventRetries[id]) {
            this.log("Retries are forbidden for id " + id, 'warn');
            return false;
        }
        else if (this._handler.isValid(id)) {
            var fileName = this._handler.getName(id);

            if (this._options.callbacks.onManualRetry(id, fileName) === false) {
                return false;
            }

            if (itemLimit > 0 && this._netUploadedOrQueued+1 > itemLimit) {
                this._itemError("retryFailTooManyItems");
                return false;
            }

            this.log("Retrying upload for '" + fileName + "' (id: " + id + ")...");
            this._filesInProgress.push(id);
            return true;
        }
        else {
            this.log("'" + id + "' is not a valid file ID", 'error');
            return false;
        }
    },
    _maybeParseAndSendUploadError: function(id, name, response, xhr) {
        //assuming no one will actually set the response code to something other than 200 and still set 'success' to true
        if (!response.success){
            if (xhr && xhr.status !== 200 && !response.error) {
                this._options.callbacks.onError(id, name, "XHR returned response code " + xhr.status, xhr);
            }
            else {
                var errorReason = response.error ? response.error : this._options.text.defaultResponseError;
                this._options.callbacks.onError(id, name, errorReason, xhr);
            }
        }
    },
    _prepareItemsForUpload: function(items, params, endpoint) {
        var validationDescriptors = this._getValidationDescriptors(items);

        this._handleCheckedCallback({
            name: "onValidateBatch",
            callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors),
            onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint),
            identifier: "batch validation"
        });
    },
    _upload: function(blobOrFileContainer, params, endpoint) {
        var id = this._handler.add(blobOrFileContainer),
            name = this._handler.getName(id);

        this._uploadData.added(id);

        if (params) {
            this.setParams(params, id);
        }

        if (endpoint) {
            this.setEndpoint(endpoint, id);
        }

        this._handleCheckedCallback({
            name: "onSubmit",
            callback: qq.bind(this._options.callbacks.onSubmit, this, id, name),
            onSuccess: qq.bind(this._onSubmitCallbackSuccess, this, id, name),
            onFailure: qq.bind(this._fileOrBlobRejected, this, id, name),
            identifier: id
        });
    },
    _onSubmitCallbackSuccess: function(id, name) {
        this._uploadData.setStatus(id, qq.status.SUBMITTED);

        this._onSubmit.apply(this, arguments);
        this._onSubmitted.apply(this, arguments);
        this._options.callbacks.onSubmitted.apply(this, arguments);

        if (this._options.autoUpload) {
            if (!this._handler.upload(id)) {
                this._uploadData.setStatus(id, qq.status.QUEUED);
            }
        }
        else {
            this._storeForLater(id);
        }
    },
    _onSubmitted: function(id) {
        //nothing to do in the base uploader
    },
    _storeForLater: function(id) {
        this._storedIds.push(id);
    },
    _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint) {
        var errorMessage,
            itemLimit = this._options.validation.itemLimit,
            proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued + validationDescriptors.length;

        if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {
            if (items.length > 0) {
                this._handleCheckedCallback({
                    name: "onValidate",
                    callback: qq.bind(this._options.callbacks.onValidate, this, items[0]),
                    onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),
                    onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),
                    identifier: "Item '" + items[0].name + "', size: " + items[0].size
                });
            }
            else {
                this._itemError("noFilesError");
            }
        }
        else {
            errorMessage = this._options.messages.tooManyItemsError
                .replace(/\{netItems\}/g, proposedNetFilesUploadedOrQueued)
                .replace(/\{itemLimit\}/g, itemLimit);
            this._batchError(errorMessage);
        }
    },
    _onValidateCallbackSuccess: function(items, index, params, endpoint) {
        var nextIndex = index+1,
            validationDescriptor = this._getValidationDescriptor(items[index]),
            validItem = false;

        if (this._validateFileOrBlobData(items[index], validationDescriptor)) {
            validItem = true;
            this._upload(items[index], params, endpoint);
        }

        this._maybeProcessNextItemAfterOnValidateCallback(validItem, items, nextIndex, params, endpoint);
    },
    _onValidateCallbackFailure: function(items, index, params, endpoint) {
        var nextIndex = index+ 1;

        this._fileOrBlobRejected(undefined, items[0].name);

        this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
    },
    _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {
        var self = this;

        if (items.length > index) {
            if (validItem || !this._options.validation.stopOnFirstInvalidFile) {
                //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks
                setTimeout(function() {
                    var validationDescriptor = self._getValidationDescriptor(items[index]);

                    self._handleCheckedCallback({
                        name: "onValidate",
                        callback: qq.bind(self._options.callbacks.onValidate, self, items[index]),
                        onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),
                        onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),
                        identifier: "Item '" + validationDescriptor.name + "', size: " + validationDescriptor.size
                    });
                }, 0);
            }
        }
    },
    _validateFileOrBlobData: function(item, validationDescriptor) {
        var name = validationDescriptor.name,
            size = validationDescriptor.size,
            valid = true;

        if (this._options.callbacks.onValidate(validationDescriptor) === false) {
            valid = false;
        }

        if (qq.isFileOrInput(item) && !this._isAllowedExtension(name)){
            this._itemError('typeError', name);
            valid = false;

        }
        else if (size === 0){
            this._itemError('emptyError', name);
            valid = false;

        }
        else if (size && this._options.validation.sizeLimit && size > this._options.validation.sizeLimit){
            this._itemError('sizeError', name);
            valid = false;

        }
        else if (size && size < this._options.validation.minSizeLimit){
            this._itemError('minSizeError', name);
            valid = false;
        }

        if (!valid) {
            this._fileOrBlobRejected(undefined, name);
        }

        return valid;
    },
    _fileOrBlobRejected: function(id, name) {
        if (id !== undefined) {
            this._uploadData.setStatus(id, qq.status.REJECTED);
        }
    },
    _itemError: function(code, maybeNameOrNames) {
        var message = this._options.messages[code],
            allowedExtensions = [],
            names = [].concat(maybeNameOrNames),
            name = names[0],
            extensionsForMessage, placeholderMatch;

        function r(name, replacement){ message = message.replace(name, replacement); }

        qq.each(this._options.validation.allowedExtensions, function(idx, allowedExtension) {
                /**
                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
                 */
                if (qq.isString(allowedExtension)) {
                    allowedExtensions.push(allowedExtension);
                }
        });

        extensionsForMessage = allowedExtensions.join(', ').toLowerCase();

        r('{file}', this._options.formatFileName(name));
        r('{extensions}', extensionsForMessage);
        r('{sizeLimit}', this._formatSize(this._options.validation.sizeLimit));
        r('{minSizeLimit}', this._formatSize(this._options.validation.minSizeLimit));

        placeholderMatch = message.match(/(\{\w+\})/g);
        if (placeholderMatch !== null) {
            qq.each(placeholderMatch, function(idx, placeholder) {
                r(placeholder, names[idx]);
            });
        }

        this._options.callbacks.onError(null, name, message, undefined);

        return message;
    },
    _batchError: function(message) {
        this._options.callbacks.onError(null, null, message, undefined);
    },
    _isAllowedExtension: function(fileName){
        var allowed = this._options.validation.allowedExtensions,
            valid = false;

        if (!allowed.length) {
            return true;
        }

        qq.each(allowed, function(idx, allowedExt) {
            /**
             * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
             * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
             */
            if (qq.isString(allowedExt)) {
                /*jshint eqeqeq: true, eqnull: true*/
                var extRegex = new RegExp('\\.' + allowedExt + "$", 'i');

                if (fileName.match(extRegex) != null) {
                    valid = true;
                    return false;
                }
            }
        });

        return valid;
    },
    _formatSize: function(bytes){
        var i = -1;
        do {
            bytes = bytes / 1000;
            i++;
        } while (bytes > 999);

        return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];
    },
    _wrapCallbacks: function() {
        var self, safeCallback;

        self = this;

        safeCallback = function(name, callback, args) {
            try {
                return callback.apply(self, args);
            }
            catch (exception) {
                self.log("Caught exception in '" + name + "' callback - " + exception.message, 'error');
            }
        };

        for (var prop in this._options.callbacks) {
            (function() {
                var callbackName, callbackFunc;
                callbackName = prop;
                callbackFunc = self._options.callbacks[callbackName];
                self._options.callbacks[callbackName] = function() {
                    return safeCallback(callbackName, callbackFunc, arguments);
                };
            }());
        }
    },
    _parseFileOrBlobDataName: function(fileOrBlobData) {
        var name;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (fileOrBlobData.value) {
                // it is a file input
                // get input value and remove path to normalize
                name = fileOrBlobData.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari 4 and firefox 11.0a2
                name = (fileOrBlobData.fileName !== null && fileOrBlobData.fileName !== undefined) ? fileOrBlobData.fileName : fileOrBlobData.name;
            }
        }
        else {
            name = fileOrBlobData.name;
        }

        return name;
    },
    _parseFileOrBlobDataSize: function(fileOrBlobData) {
        var size;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (!fileOrBlobData.value){
                // fix missing properties in Safari 4 and firefox 11.0a2
                size = (fileOrBlobData.fileSize !== null && fileOrBlobData.fileSize !== undefined) ? fileOrBlobData.fileSize : fileOrBlobData.size;
            }
        }
        else {
            size = fileOrBlobData.blob.size;
        }

        return size;
    },
    _getValidationDescriptor: function(fileOrBlobData) {
        var name, size, fileDescriptor;

        fileDescriptor = {};
        name = this._parseFileOrBlobDataName(fileOrBlobData);
        size = this._parseFileOrBlobDataSize(fileOrBlobData);

        fileDescriptor.name = name;
        if (size !== undefined) {
            fileDescriptor.size = size;
        }

        return fileDescriptor;
    },
    _getValidationDescriptors: function(files) {
        var self = this,
            fileDescriptors = [];

        qq.each(files, function(idx, file) {
            fileDescriptors.push(self._getValidationDescriptor(file));
        });

        return fileDescriptors;
    },
    _createParamsStore: function(type) {
        var paramsStore = {},
            self = this;

        return {
            setParams: function(params, id) {
                var paramsCopy = {};
                qq.extend(paramsCopy, params);
                paramsStore[id] = paramsCopy;
            },

            getParams: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                var paramsCopy = {};

                if (id != null && paramsStore[id]) {
                    qq.extend(paramsCopy, paramsStore[id]);
                }
                else {
                    qq.extend(paramsCopy, self._options[type].params);
                }

                return paramsCopy;
            },

            remove: function(fileId) {
                return delete paramsStore[fileId];
            },

            reset: function() {
                paramsStore = {};
            }
        };
    },
    _createEndpointStore: function(type) {
        var endpointStore = {},
        self = this;

        return {
            setEndpoint: function(endpoint, id) {
                endpointStore[id] = endpoint;
            },

            getEndpoint: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                if (id != null && endpointStore[id]) {
                    return endpointStore[id];
                }

                return self._options[type].endpoint;
            },

            remove: function(fileId) {
                return delete endpointStore[fileId];
            },

            reset: function() {
                endpointStore = {};
            }
        };
    },
    _handleCameraAccess: function() {
        if (this._options.camera.ios && qq.ios()) {
            this._options.multiple = false;

            if (this._options.validation.acceptFiles === null) {
                this._options.validation.acceptFiles = "image/*;capture=camera";
            }
            else {
                this._options.validation.acceptFiles += ",image/*;capture=camera";
            }
        }
    }
};

qq.FineUploaderBasic = function(o) {
    // These options define FineUploaderBasic mode.
    this._options = {
        debug: false,
        button: null,
        multiple: true,
        maxConnections: 3,
        disableCancelForFormUploads: false,
        autoUpload: true,
        request: {
            endpoint: '/server/upload',
            params: {},
            paramsInBody: true,
            customHeaders: {},
            forceMultipart: true,
            inputName: 'qqfile',
            uuidName: 'qquuid',
            totalFileSizeName: 'qqtotalfilesize',
            filenameParam: 'qqfilename'
        },
        validation: {
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            itemLimit: 0,
            stopOnFirstInvalidFile: true,
            acceptFiles: null
        },
        callbacks: {
            onSubmit: function(id, name){},
            onSubmitted: function(id, name){},
            onComplete: function(id, name, responseJSON, maybeXhr){},
            onCancel: function(id, name){},
            onUpload: function(id, name){},
            onUploadChunk: function(id, name, chunkData){},
            onResume: function(id, fileName, chunkData){},
            onProgress: function(id, name, loaded, total){},
            onError: function(id, name, reason, maybeXhrOrXdr) {},
            onAutoRetry: function(id, name, attemptNumber) {},
            onManualRetry: function(id, name) {},
            onValidateBatch: function(fileOrBlobData) {},
            onValidate: function(fileOrBlobData) {},
            onSubmitDelete: function(id) {},
            onDelete: function(id){},
            onDeleteComplete: function(id, xhrOrXdr, isError){},
            onPasteReceived: function(blob) {},
            onStatusChange: function(id, oldStatus, newStatus) {}
        },
        messages: {
            typeError: "{file} has an invalid extension. Valid extension(s): {extensions}.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            noFilesError: "No files to upload.",
            tooManyItemsError: "Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.",
            retryFailTooManyItems: "Retry failed - you have reached your file limit.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
        },
        retry: {
            enableAuto: false,
            maxAutoAttempts: 3,
            autoAttemptDelay: 5,
            preventRetryResponseProperty: 'preventRetry'
        },
        classes: {
            buttonHover: 'qq-upload-button-hover',
            buttonFocus: 'qq-upload-button-focus'
        },
        chunking: {
            enabled: false,
            partSize: 2000000,
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalFileSize: 'qqtotalfilesize',
                totalParts: 'qqtotalparts'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        formatFileName: function(fileOrBlobName) {
            if (fileOrBlobName !== undefined && fileOrBlobName.length > 33) {
                fileOrBlobName = fileOrBlobName.slice(0, 19) + '...' + fileOrBlobName.slice(-14);
            }
            return fileOrBlobName;
        },
        text: {
            defaultResponseError: "Upload failure reason unknown",
            sizeSymbols: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']
        },
        deleteFile : {
            enabled: false,
            method: "DELETE",
            endpoint: '/server/upload',
            customHeaders: {},
            params: {}
        },
        cors: {
            expected: false,
            sendCredentials: false,
            allowXdr: false
        },
        blobs: {
            defaultName: 'misc_data'
        },
        paste: {
            targetElement: null,
            defaultName: 'pasted_image'
        },
        camera: {
            ios: false
        }
    };

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);


    this._handleCameraAccess();

    this._wrapCallbacks();
    this._disposeSupport =  new qq.DisposeSupport();

    this._filesInProgress = [];
    this._storedIds = [];
    this._autoRetries = [];
    this._retryTimeouts = [];
    this._preventRetries = [];

    this._netUploadedOrQueued = 0;
    this._netUploaded = 0;
    this._uploadData = this._createUploadDataTracker();

    this._paramsStore = this._createParamsStore("request");
    this._deleteFileParamsStore = this._createParamsStore("deleteFile");

    this._endpointStore = this._createEndpointStore("request");
    this._deleteFileEndpointStore = this._createEndpointStore("deleteFile");

    this._handler = this._createUploadHandler();
    this._deleteHandler = this._createDeleteHandler();

    if (this._options.button){
        this._button = this._createUploadButton(this._options.button);
    }

    if (this._options.paste.targetElement) {
        this._pasteHandler = this._createPasteHandler();
    }

    this._preventLeaveInProgress();
};

// Define the private & public API methods.
qq.FineUploaderBasic.prototype = qq.basePublicApi;
qq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);

/*globals qq, document*/
qq.DragAndDrop = function(o) {
    "use strict";

    var options, dz,
        droppedFiles = [],
        disposeSupport = new qq.DisposeSupport();

     options = {
        dropZoneElements: [],
        hideDropZonesBeforeEnter: false,
        allowMultipleItems: true,
        classes: {
            dropActive: null
        },
        callbacks: new qq.DragAndDrop.callbacks()
    };

    qq.extend(options, o, true);

    setupDragDrop();

    function uploadDroppedFiles(files) {
        options.callbacks.dropLog('Grabbed ' + files.length + " dropped files.");
        dz.dropDisabled(false);
        options.callbacks.processingDroppedFilesComplete(files);
    }

    function traverseFileTree(entry) {
        var dirReader,
            parseEntryPromise = new qq.Promise();

        if (entry.isFile) {
            entry.file(function(file) {
                droppedFiles.push(file);
                parseEntryPromise.success();
            },
            function(fileError) {
                options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                parseEntryPromise.failure();
            });
        }
        else if (entry.isDirectory) {
            dirReader = entry.createReader();
            dirReader.readEntries(function(entries) {
                var entriesLeft = entries.length;

                qq.each(entries, function(idx, entry) {
                    traverseFileTree(entry).done(function() {
                        entriesLeft-=1;

                        if (entriesLeft === 0) {
                            parseEntryPromise.success();
                        }
                    });
                });

                if (!entries.length) {
                    parseEntryPromise.success();
                }
            }, function(fileError) {
                options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                parseEntryPromise.failure();
            });
        }

        return parseEntryPromise;
    }

    function handleDataTransfer(dataTransfer) {
        var pendingFolderPromises = [],
            handleDataTransferPromise = new qq.Promise();

        options.callbacks.processingDroppedFiles();
        dz.dropDisabled(true);

        if (dataTransfer.files.length > 1 && !options.allowMultipleItems) {
            options.callbacks.processingDroppedFilesComplete([]);
            options.callbacks.dropError('tooManyFilesError', "");
            dz.dropDisabled(false);
            handleDataTransferPromise.failure();
        }
        else {
            droppedFiles = [];

            if (qq.isFolderDropSupported(dataTransfer)) {
                qq.each(dataTransfer.items, function(idx, item) {
                    var entry = item.webkitGetAsEntry();

                    if (entry) {
                        //due to a bug in Chrome's File System API impl - #149735
                        if (entry.isFile) {
                            droppedFiles.push(item.getAsFile());
                        }

                        else {
                            pendingFolderPromises.push(traverseFileTree(entry).done(function() {
                                pendingFolderPromises.pop();
                                if (pendingFolderPromises.length === 0) {
                                    handleDataTransferPromise.success();
                                }
                            }));
                        }
                    }
                });
            }
            else {
                droppedFiles = dataTransfer.files;
            }

            if (pendingFolderPromises.length === 0) {
                handleDataTransferPromise.success();
            }
        }

        return handleDataTransferPromise;
    }

    function setupDropzone(dropArea){
        dz = new qq.UploadDropZone({
            element: dropArea,
            onEnter: function(e){
                qq(dropArea).addClass(options.classes.dropActive);
                e.stopPropagation();
            },
            onLeaveNotDescendants: function(e){
                qq(dropArea).removeClass(options.classes.dropActive);
            },
            onDrop: function(e){
                if (options.hideDropZonesBeforeEnter) {
                    qq(dropArea).hide();
                }
                qq(dropArea).removeClass(options.classes.dropActive);

                handleDataTransfer(e.dataTransfer).done(function() {
                    uploadDroppedFiles(droppedFiles);
                });
            }
        });

        disposeSupport.addDisposer(function() {
            dz.dispose();
        });

        if (options.hideDropZonesBeforeEnter) {
            qq(dropArea).hide();
        }
    }

    function isFileDrag(dragEvent) {
        var fileDrag;

        qq.each(dragEvent.dataTransfer.types, function(key, val) {
            if (val === 'Files') {
                fileDrag = true;
                return false;
            }
        });

        return fileDrag;
    }

    function setupDragDrop(){
        var dropZones = options.dropZoneElements;

        qq.each(dropZones, function(idx, dropZone) {
           setupDropzone(dropZone);
        })

        // IE <= 9 does not support the File API used for drag+drop uploads
        if (dropZones.length && (!qq.ie() || qq.ie10())) {
            disposeSupport.attach(document, 'dragenter', function(e) {
                if (!dz.dropDisabled() && isFileDrag(e)) {
                    qq.each(dropZones, function(idx, dropZone) {
                        qq(dropZone).css({display: 'block'});
                    });
                }
            });
        }
        disposeSupport.attach(document, 'dragleave', function(e){
            if (options.hideDropZonesBeforeEnter && qq.FineUploader.prototype._leaving_document_out(e)) {
                qq.each(dropZones, function(idx, dropZone) {
                    qq(dropZone).hide();
                });
            }
        });
        disposeSupport.attach(document, 'drop', function(e){
            if (options.hideDropZonesBeforeEnter) {
                qq.each(dropZones, function(idx, dropZone) {
                    qq(dropZone).hide();
                });
            }
            e.preventDefault();
        });
    }

    return {
        setupExtraDropzone: function(element) {
            options.dropZoneElements.push(element);
            setupDropzone(element);
        },

        removeDropzone: function(element) {
            var i,
                dzs = options.dropZoneElements;

            for(i in dzs) {
                if (dzs[i] === element) {
                    return dzs.splice(i, 1);
                }
            }
        },

        dispose: function() {
            disposeSupport.dispose();
            dz.dispose();
        }
    };
};

qq.DragAndDrop.callbacks = function() {
    return {
        processingDroppedFiles: function() {},
        processingDroppedFilesComplete: function(files) {},
        dropError: function(code, errorSpecifics) {
            qq.log("Drag & drop error code '" + code + " with these specifics: '" + errorSpecifics + "'", "error");
        },
        dropLog: function(message, level) {
            qq.log(message, level);
        }
    }
}

qq.UploadDropZone = function(o){
    "use strict";

    var options, element, preventDrop, dropOutsideDisabled, disposeSupport = new qq.DisposeSupport();

    options = {
        element: null,
        onEnter: function(e){},
        onLeave: function(e){},
        // is not fired when leaving element by hovering descendants
        onLeaveNotDescendants: function(e){},
        onDrop: function(e){}
    };

    qq.extend(options, o);
    element = options.element;

    function dragover_should_be_canceled(){
        return qq.safari() || (qq.firefox() && qq.windows());
    }

    function disableDropOutside(e){
        // run only once for all instances
        if (!dropOutsideDisabled ){

            // for these cases we need to catch onDrop to reset dropArea
            if (dragover_should_be_canceled){
               disposeSupport.attach(document, 'dragover', function(e){
                    e.preventDefault();
                });
            } else {
                disposeSupport.attach(document, 'dragover', function(e){
                    if (e.dataTransfer){
                        e.dataTransfer.dropEffect = 'none';
                        e.preventDefault();
                    }
                });
            }

            dropOutsideDisabled = true;
        }
    }

    function isValidFileDrag(e){
        // e.dataTransfer currently causing IE errors
        // IE9 does NOT support file API, so drag-and-drop is not possible
        if (qq.ie() && !qq.ie10()) {
            return false;
        }

        var effectTest, dt = e.dataTransfer,
        // do not check dt.types.contains in webkit, because it crashes safari 4
        isSafari = qq.safari();

        // dt.effectAllowed is none in Safari 5
        // dt.types.contains check is for firefox
        effectTest = qq.ie10() ? true : dt.effectAllowed !== 'none';
        return dt && effectTest && (dt.files || (!isSafari && dt.types.contains && dt.types.contains('Files')));
    }

    function isOrSetDropDisabled(isDisabled) {
        if (isDisabled !== undefined) {
            preventDrop = isDisabled;
        }
        return preventDrop;
    }

    function attachEvents(){
        disposeSupport.attach(element, 'dragover', function(e){
            if (!isValidFileDrag(e)) {
                return;
            }

            var effect = qq.ie() ? null : e.dataTransfer.effectAllowed;
            if (effect === 'move' || effect === 'linkMove'){
                e.dataTransfer.dropEffect = 'move'; // for FF (only move allowed)
            } else {
                e.dataTransfer.dropEffect = 'copy'; // for Chrome
            }

            e.stopPropagation();
            e.preventDefault();
        });

        disposeSupport.attach(element, 'dragenter', function(e){
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }
                options.onEnter(e);
            }
        });

        disposeSupport.attach(element, 'dragleave', function(e){
            if (!isValidFileDrag(e)) {
                return;
            }

            options.onLeave(e);

            var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
            // do not fire when moving a mouse over a descendant
            if (qq(this).contains(relatedTarget)) {
                return;
            }

            options.onLeaveNotDescendants(e);
        });

        disposeSupport.attach(element, 'drop', function(e){
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }

                e.preventDefault();
                options.onDrop(e);
            }
        });
    }

    disableDropOutside();
    attachEvents();

    return {
        dropDisabled: function(isDisabled) {
            return isOrSetDropDisabled(isDisabled);
        },

        dispose: function() {
            disposeSupport.dispose();
        }
    };
};

/**
 * Defines the public API for FineUploader mode.
 */
qq.uiPublicApi = {
    clearStoredFiles: function() {
        this._parent.prototype.clearStoredFiles.apply(this, arguments);
        this._listElement.innerHTML = "";
    },
    addExtraDropzone: function(element){
        this._dnd.setupExtraDropzone(element);
    },
    removeExtraDropzone: function(element){
        return this._dnd.removeDropzone(element);
    },
    getItemByFileId: function(id){
        var item = this._listElement.firstChild;

        // there can't be txt nodes in dynamically created list
        // and we can  use nextSibling
        while (item){
            if (item.qqFileId == id) return item;
            item = item.nextSibling;
        }
    },
    reset: function() {
        this._parent.prototype.reset.apply(this, arguments);
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');
        if (!this._options.button) {
            this._button = this._createUploadButton(this._find(this._element, 'button'));
        }

        this._dnd.dispose();
        this._dnd = this._setupDragAndDrop();

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;
    }
};




/**
 * Defines the private (internal) API for FineUploader mode.
 */
qq.uiPrivateApi = {
    _removeFileItem: function(fileId) {
        var item = this.getItemByFileId(fileId);
        qq(item).remove();
    },
    _setupDragAndDrop: function() {
        var self = this,
            dropProcessingEl = this._find(this._element, 'dropProcessing'),
            dropZoneElements = this._options.dragAndDrop.extraDropzones,
            preventSelectFiles;

        preventSelectFiles = function(event) {
            event.preventDefault();
        };

        if (!this._options.dragAndDrop.disableDefaultDropzone) {
            dropZoneElements.push(this._find(this._options.element, 'drop'));
        }

        return new qq.DragAndDrop({
            dropZoneElements: dropZoneElements,
            hideDropZonesBeforeEnter: this._options.dragAndDrop.hideDropzones,
            allowMultipleItems: this._options.multiple,
            classes: {
                dropActive: this._options.classes.dropActive
            },
            callbacks: {
                processingDroppedFiles: function() {
                    var input = self._button.getInput();

                    qq(dropProcessingEl).css({display: 'block'});
                    qq(input).attach('click', preventSelectFiles);
                },
                processingDroppedFilesComplete: function(files) {
                    var input = self._button.getInput();

                    qq(dropProcessingEl).hide();
                    qq(input).detach('click', preventSelectFiles);

                    if (files) {
                        self.addFiles(files);
                    }
                },
                dropError: function(code, errorData) {
                    self._itemError(code, errorData);
                },
                dropLog: function(message, level) {
                    self.log(message, level);
                }
            }
        });
    },
    _bindDeleteRetryOrCancelClickEvent: function() {
        var self = this;

        return new qq.DeleteRetryOrCancelClickHandler({
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onDeleteFile: function(fileId) {
                self.deleteFile(fileId);
            },
            onCancel: function(fileId) {
                self.cancel(fileId);
            },
            onRetry: function(fileId) {
                var item = self.getItemByFileId(fileId);

                qq(item).removeClass(self._classes.retryable);
                self.retry(fileId);
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            }
        });
    },
    _isEditFilenameEnabled: function() {
        return this._options.editFilename.enabled && !this._options.autoUpload;
    },
    _filenameEditHandler: function() {
        var self = this;

        return {
            listElement: this._listElement,
            classes: this._classes,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onGetUploadStatus: function(fileId) {
                return self.getUploads({id: fileId}).status;
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            },
            onSetName: function(fileId, newName) {
                var item = self.getItemByFileId(fileId),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    formattedFilename = self._options.formatFileName(newName);

                qqFilenameDisplay.setText(formattedFilename);
                self.setName(fileId, newName);
            },
            onGetInput: function(item) {
                return self._find(item, 'editFilenameInput');
            },
            onEditingStatusChange: function(fileId, isEditing) {
                var item = self.getItemByFileId(fileId),
                    qqInput = qq(self._find(item, 'editFilenameInput')),
                    qqFilenameDisplay = qq(self._find(item, 'file')),
                    qqEditFilenameIcon = qq(self._find(item, 'editNameIcon')),
                    editableClass = self._classes.editable;

                if (isEditing) {
                    qqInput.addClass('qq-editing');

                    qqFilenameDisplay.hide();
                    qqEditFilenameIcon.removeClass(editableClass);
                }
                else {
                    qqInput.removeClass('qq-editing');
                    qqFilenameDisplay.css({display: ''});
                    qqEditFilenameIcon.addClass(editableClass);
                }

                // Force IE8 and older to repaint
                qq(item).addClass('qq-temp').removeClass('qq-temp');
            }
        };
    },
    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                editableClass = this._classes.editable,
                qqFilenameDisplay, qqEditFilenameIcon;

            // Status for a file exists before it has been added to the DOM, so we must be careful here.
            if (item && newStatus !== qq.status.SUBMITTED) {
                qqFilenameDisplay = qq(this._find(item, 'file'));
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon'));

                qqFilenameDisplay.removeClass(editableClass);
                qqEditFilenameIcon.removeClass(editableClass);
            }
        }
    },
    _bindFilenameInputFocusInEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusInHandler(spec);
    },
    _bindFilenameInputFocusEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusHandler(spec);
    },
    _bindFilenameClickEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameClickHandler(spec);
    },
    _leaving_document_out: function(e){
        return ((qq.chrome() || (qq.safari() && qq.windows())) && e.clientX == 0 && e.clientY == 0) // null coords for Chrome and Safari Windows
            || (qq.firefox() && !e.relatedTarget); // null e.relatedTarget for Firefox
    },
    _storeForLater: function(id) {
        this._parent.prototype._storeForLater.apply(this, arguments);
        var item = this.getItemByFileId(id);
        qq(this._find(item, 'spinner')).hide();
    },
    /**
     * Gets one of the elements listed in this._options.classes
     **/
    _find: function(parent, type) {
        var element = qq(parent).getByClass(this._options.classes[type])[0];
        if (!element){
            throw new Error('element not found ' + type);
        }

        return element;
    },
    _onSubmit: function(id, name) {
        this._parent.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, name);
    },
    // The file item has been added to the DOM.
    _onSubmitted: function(id) {
        // If the edit filename feature is enabled, mark the filename element as "editable" and the associated edit icon
        if (this._isEditFilenameEnabled()) {
            var item = this.getItemByFileId(id),
                qqFilenameDisplay = qq(this._find(item, 'file')),
                qqEditFilenameIcon = qq(this._find(item, 'editNameIcon')),
                editableClass = this._classes.editable;

            qqFilenameDisplay.addClass(editableClass);
            qqEditFilenameIcon.addClass(editableClass);

            // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input
            if (!this._focusinEventSupported) {
                this._filenameInputFocusHandler.addHandler(this._find(item, 'editFilenameInput'));
            }
        }
    },
    // Update the progress bar & percentage as the file is uploaded
    _onProgress: function(id, name, loaded, total){
        this._parent.prototype._onProgress.apply(this, arguments);

        var item, progressBar, percent, cancelLink;

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');
        percent = Math.round(loaded / total * 100);

        if (loaded === total) {
            cancelLink = this._find(item, 'cancel');
            qq(cancelLink).hide();

            qq(progressBar).hide();
            qq(this._find(item, 'statusText')).setText(this._options.text.waitingForResponse);

            // If last byte was sent, display total file size
            this._displayFileSize(id);
        }
        else {
            // If still uploading, display percentage - total size is actually the total request(s) size
            this._displayFileSize(id, loaded, total);

            qq(progressBar).css({display: 'block'});
        }

        // Update progress bar element
        qq(progressBar).css({width: percent + '%'});
    },
    _onComplete: function(id, name, result, xhr) {
        var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),
            self = this;

        function completeUpload(result) {
            var item = self.getItemByFileId(id);

            qq(self._find(item, 'statusText')).clearText();

            qq(item).removeClass(self._classes.retrying);
            qq(self._find(item, 'progressBar')).hide();

            if (!self._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
                qq(self._find(item, 'cancel')).hide();
            }
            qq(self._find(item, 'spinner')).hide();

            if (result.success) {
                if (self._isDeletePossible()) {
                    self._showDeleteLink(id);
                }

                qq(item).addClass(self._classes.success);
                if (self._classes.successIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.successIcon);
                }
            }
            else {
                qq(item).addClass(self._classes.fail);
                if (self._classes.failIcon) {
                    self._find(item, 'finished').style.display = "inline-block";
                    qq(item).addClass(self._classes.failIcon);
                }
                if (self._options.retry.showButton && !self._preventRetries[id]) {
                    qq(item).addClass(self._classes.retryable);
                }
                self._controlFailureTextDisplay(item, result);
            }
        }

        // The parent may need to perform some async operation before we can accurately determine the status of the upload.
        if (qq.isPromise(parentRetVal)) {
            parentRetVal.done(function(newResult) {
                completeUpload(newResult);
            });

        }
        else {
            completeUpload(result);
        }

        return parentRetVal;
    },
    _onUpload: function(id, name){
        var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);

        this._showSpinner(id);

        return parentRetVal;
    },
    _onCancel: function(id, name) {
        this._parent.prototype._onCancel.apply(this, arguments);
        this._removeFileItem(id);
    },
    _onBeforeAutoRetry: function(id) {
        var item, progressBar, failTextEl, retryNumForDisplay, maxAuto, retryNote;

        this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);

        item = this.getItemByFileId(id);
        progressBar = this._find(item, 'progressBar');

        this._showCancelLink(item);
        progressBar.style.width = 0;
        qq(progressBar).hide();

        if (this._options.retry.showAutoRetryNote) {
            failTextEl = this._find(item, 'statusText');
            retryNumForDisplay = this._autoRetries[id] + 1;
            maxAuto = this._options.retry.maxAutoAttempts;

            retryNote = this._options.retry.autoRetryNote.replace(/\{retryNum\}/g, retryNumForDisplay);
            retryNote = retryNote.replace(/\{maxAuto\}/g, maxAuto);

            qq(failTextEl).setText(retryNote);
            if (retryNumForDisplay === 1) {
                qq(item).addClass(this._classes.retrying);
            }
        }
    },
    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var item = this.getItemByFileId(id);

        if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {
            this._find(item, 'progressBar').style.width = 0;
            qq(item).removeClass(this._classes.fail);
            qq(this._find(item, 'statusText')).clearText();
            this._showSpinner(id);
            this._showCancelLink(item);
            return true;
        }
        else {
            qq(item).addClass(this._classes.retryable);
            return false;
        }
    },
    _onSubmitDelete: function(id) {
        var onSuccessCallback = qq.bind(this._onSubmitDeleteSuccess, this);

        this._parent.prototype._onSubmitDelete.call(this, id, onSuccessCallback);
    },
    _onSubmitDeleteSuccess: function(id, uuid, additionalMandatedParams) {
        if (this._options.deleteFile.forceConfirm) {
            this._showDeleteConfirm.apply(this, arguments);
        }
        else {
            this._sendDeleteRequest.apply(this, arguments);
        }
    },
    _onDeleteComplete: function(id, xhr, isError) {
        this._parent.prototype._onDeleteComplete.apply(this, arguments);

        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner'),
            statusTextEl = this._find(item, 'statusText');

        qq(spinnerEl).hide();

        if (isError) {
            qq(statusTextEl).setText(this._options.deleteFile.deletingFailedText);
            this._showDeleteLink(id);
        }
        else {
            this._removeFileItem(id);
        }
    },
    _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton'),
            statusTextEl = this._find(item, 'statusText');

        qq(deleteLink).hide();
        this._showSpinner(id);
        qq(statusTextEl).setText(this._options.deleteFile.deletingStatusText);
        this._deleteHandler.sendDelete.apply(this, arguments);
    },
    _showDeleteConfirm: function(id, uuid, mandatedParams) {
        var fileName = this._handler.getName(id),
            confirmMessage = this._options.deleteFile.confirmMessage.replace(/\{filename\}/g, fileName),
            uuid = this.getUuid(id),
            deleteRequestArgs = arguments,
            self = this;

        this._options.showConfirm(confirmMessage, function() {
            self._sendDeleteRequest.apply(self, deleteRequestArgs);
        });
    },
    _addToList: function(id, name){
        var item = qq.toElement(this._options.fileTemplate);
        if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');
            qq(cancelLink).remove();
        }

        item.qqFileId = id;

        var fileElement = this._find(item, 'file');
        qq(fileElement).setText(this._options.formatFileName(name));
        qq(this._find(item, 'size')).hide();
        if (!this._options.multiple) {
            this._handler.cancelAll();
            this._clearList();
        }

        if (this._options.display.prependFiles) {
            this._prependItem(item);
        }
        else {
            this._listElement.appendChild(item);
        }
        this._filesInBatchAddedToUi += 1;

        if (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading) {
            this._displayFileSize(id);
        }
    },
    _prependItem: function(item) {
        var parentEl = this._listElement,
            beforeEl = parentEl.firstChild;

        if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {
            beforeEl = qq(parentEl).children()[this._filesInBatchAddedToUi - 1].nextSibling;

        }

        parentEl.insertBefore(item, beforeEl);
    },
    _clearList: function(){
        this._listElement.innerHTML = '';
        this.clearStoredFiles();
    },
    _displayFileSize: function(id, loadedSize, totalSize) {
        var item = this.getItemByFileId(id),
            size = this.getSize(id),
            sizeForDisplay = this._formatSize(size),
            sizeEl = this._find(item, 'size');

        if (loadedSize !== undefined && totalSize !== undefined) {
            sizeForDisplay = this._formatProgress(loadedSize, totalSize);
        }

        qq(sizeEl).css({display: 'inline'});
        qq(sizeEl).setText(sizeForDisplay);
    },
    _formatProgress: function (uploadedSize, totalSize) {
        var message = this._options.text.formatProgress;
        function r(name, replacement) { message = message.replace(name, replacement); }

        r('{percent}', Math.round(uploadedSize / totalSize * 100));
        r('{total_size}', this._formatSize(totalSize));
        return message;
    },
    _controlFailureTextDisplay: function(item, response) {
        var mode, maxChars, responseProperty, failureReason, shortFailureReason;

        mode = this._options.failedUploadTextDisplay.mode;
        maxChars = this._options.failedUploadTextDisplay.maxChars;
        responseProperty = this._options.failedUploadTextDisplay.responseProperty;

        if (mode === 'custom') {
            failureReason = response[responseProperty];
            if (failureReason) {
                if (failureReason.length > maxChars) {
                    shortFailureReason = failureReason.substring(0, maxChars) + '...';
                }
            }
            else {
                failureReason = this._options.text.failUpload;
                this.log("'" + responseProperty + "' is not a valid property on the server response.", 'warn');
            }

            qq(this._find(item, 'statusText')).setText(shortFailureReason || failureReason);

            if (this._options.failedUploadTextDisplay.enableTooltip) {
                this._showTooltip(item, failureReason);
            }
        }
        else if (mode === 'default') {
            qq(this._find(item, 'statusText')).setText(this._options.text.failUpload);
        }
        else if (mode !== 'none') {
            this.log("failedUploadTextDisplay.mode value of '" + mode + "' is not valid", 'warn');
        }
    },
    _showTooltip: function(item, text) {
        item.title = text;
    },
    _showSpinner: function(id) {
        var item = this.getItemByFileId(id),
            spinnerEl = this._find(item, 'spinner');

        spinnerEl.style.display = "inline-block";
    },
    _showCancelLink: function(item) {
        if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
            var cancelLink = this._find(item, 'cancel');

            qq(cancelLink).css({display: 'inline'});
        }
    },
    _showDeleteLink: function(id) {
        var item = this.getItemByFileId(id),
            deleteLink = this._find(item, 'deleteButton');

        qq(deleteLink).css({display: 'inline'});
    },
    _itemError: function(code, name){
        var message = this._parent.prototype._itemError.apply(this, arguments);
        this._options.showMessage(message);
    },
    _batchError: function(message) {
        this._parent.prototype._batchError.apply(this, arguments);
        this._options.showMessage(message);
    },
    _setupPastePrompt: function() {
        var self = this;

        this._options.callbacks.onPasteReceived = function() {
            var message = self._options.paste.namePromptMessage,
                defaultVal = self._options.paste.defaultName;

            return self._options.showPrompt(message, defaultVal);
        };
    },
    _fileOrBlobRejected: function(id, name) {
        this._totalFilesInBatch -= 1;
        this._parent.prototype._fileOrBlobRejected.apply(this, arguments);
    },
    _prepareItemsForUpload: function(items, params, endpoint) {
        this._totalFilesInBatch = items.length;
        this._filesInBatchAddedToUi = 0;
        this._parent.prototype._prepareItemsForUpload.apply(this, arguments);
    }
};

/**
 * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.
 */
qq.FineUploader = function(o, namespace) {
    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden
    // if the (internal) caller defines a different parent.  The parent is also used by
    // the private and public API functions that need to delegate to a parent function.
    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;
    this._parent.apply(this, arguments);

    // Options provided by FineUploader mode
    qq.extend(this._options, {
        element: null,
        listElement: null,
        dragAndDrop: {
            extraDropzones: [],
            hideDropzones: true,
            disableDefaultDropzone: false
        },
        text: {
            uploadButton: 'Upload a file',
            cancelButton: 'Cancel',
            retryButton: 'Retry',
            deleteButton: 'Delete',
            failUpload: 'Upload failed',
            dragZone: 'Drop files here to upload',
            dropProcessing: 'Processing dropped files...',
            formatProgress: "{percent}% of {total_size}",
            waitingForResponse: "Processing..."
        },
        template: '<div class="qq-uploader">' +
            ((!this._options.dragAndDrop || !this._options.dragAndDrop.disableDefaultDropzone) ? '<div class="qq-upload-drop-area"><span>{dragZoneText}</span></div>' : '') +
            (!this._options.button ? '<div class="qq-upload-button"><div>{uploadButtonText}</div></div>' : '') +
            '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
            (!this._options.listElement ? '<ul class="qq-upload-list"></ul>' : '') +
            '</div>',

        // template for one item in file list
        fileTemplate: '<li>' +
            '<div class="qq-progress-bar"></div>' +
            '<span class="qq-upload-spinner"></span>' +
            '<span class="qq-upload-finished"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<span class="qq-edit-filename-icon"></span>' : '') +
            '<span class="qq-upload-file"></span>' +
            (this._options.editFilename && this._options.editFilename.enabled ? '<input class="qq-edit-filename" tabindex="0" type="text">' : '') +
            '<span class="qq-upload-size"></span>' +
            '<a class="qq-upload-cancel" href="#">{cancelButtonText}</a>' +
            '<a class="qq-upload-retry" href="#">{retryButtonText}</a>' +
            '<a class="qq-upload-delete" href="#">{deleteButtonText}</a>' +
            '<span class="qq-upload-status-text">{statusText}</span>' +
            '</li>',
        classes: {
            button: 'qq-upload-button',
            drop: 'qq-upload-drop-area',
            dropActive: 'qq-upload-drop-area-active',
            list: 'qq-upload-list',
            progressBar: 'qq-progress-bar',
            file: 'qq-upload-file',
            spinner: 'qq-upload-spinner',
            finished: 'qq-upload-finished',
            retrying: 'qq-upload-retrying',
            retryable: 'qq-upload-retryable',
            size: 'qq-upload-size',
            cancel: 'qq-upload-cancel',
            deleteButton: 'qq-upload-delete',
            retry: 'qq-upload-retry',
            statusText: 'qq-upload-status-text',
            editFilenameInput: 'qq-edit-filename',

            success: 'qq-upload-success',
            fail: 'qq-upload-fail',

            successIcon: null,
            failIcon: null,
            editNameIcon: 'qq-edit-filename-icon',
            editable: 'qq-editable',

            dropProcessing: 'qq-drop-processing',
            dropProcessingSpinner: 'qq-drop-processing-spinner'
        },
        failedUploadTextDisplay: {
            mode: 'default', //default, custom, or none
            maxChars: 50,
            responseProperty: 'error',
            enableTooltip: true
        },
        messages: {
            tooManyFilesError: "You may only drop one file",
            unsupportedBrowser: "Unrecoverable error - this browser does not permit file uploading of any kind."
        },
        retry: {
            showAutoRetryNote: true,
            autoRetryNote: "Retrying {retryNum}/{maxAuto}...",
            showButton: false
        },
        deleteFile: {
            forceConfirm: false,
            confirmMessage: "Are you sure you want to delete {filename}?",
            deletingStatusText: "Deleting...",
            deletingFailedText: "Delete failed"

        },
        display: {
            fileSizeOnSubmit: false,
            prependFiles: false
        },
        paste: {
            promptForName: false,
            namePromptMessage: "Please name this image"
        },
        editFilename: {
            enabled: false
        },
        showMessage: function(message){
            setTimeout(function() {
                window.alert(message);
            }, 0);
        },
        showConfirm: function(message, okCallback, cancelCallback) {
            setTimeout(function() {
                var result = window.confirm(message);
                if (result) {
                    okCallback();
                }
                else if (cancelCallback) {
                    cancelCallback();
                }
            }, 0);
        },
        showPrompt: function(message, defaultValue) {
            var promise = new qq.Promise(),
                retVal = window.prompt(message, defaultValue);

            /*jshint eqeqeq: true, eqnull: true*/
            if (retVal != null && qq.trimStr(retVal).length > 0) {
                promise.success(retVal);
            }
            else {
                promise.failure("Undefined or invalid user-supplied value.");
            }

            return promise;
        }
    }, true);

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {
        this._options.element.innerHTML = "<div>" + this._options.messages.unsupportedBrowser + "</div>"
    }
    else {
        this._wrapCallbacks();

        // overwrite the upload button text if any
        // same for the Cancel button and Fail message text
        this._options.template     = this._options.template.replace(/\{dragZoneText\}/g, this._options.text.dragZone);
        this._options.template     = this._options.template.replace(/\{uploadButtonText\}/g, this._options.text.uploadButton);
        this._options.template     = this._options.template.replace(/\{dropProcessingText\}/g, this._options.text.dropProcessing);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{cancelButtonText\}/g, this._options.text.cancelButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{retryButtonText\}/g, this._options.text.retryButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{deleteButtonText\}/g, this._options.text.deleteButton);
        this._options.fileTemplate = this._options.fileTemplate.replace(/\{statusText\}/g, "");

        this._element = this._options.element;
        this._element.innerHTML = this._options.template;
        this._listElement = this._options.listElement || this._find(this._element, 'list');

        this._classes = this._options.classes;

        if (!this._button) {
            this._button = this._createUploadButton(this._find(this._element, 'button'));
        }

        this._deleteRetryOrCancelClickHandler = this._bindDeleteRetryOrCancelClickEvent();

        // A better approach would be to check specifically for focusin event support by querying the DOM API,
        // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.
        this._focusinEventSupported = !qq.firefox();

        if (this._isEditFilenameEnabled()) {
            this._filenameClickHandler = this._bindFilenameClickEvent();
            this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();
            this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();
        }

        this._dnd = this._setupDragAndDrop();

        if (this._options.paste.targetElement && this._options.paste.promptForName) {
            this._setupPastePrompt();
        }

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;
    }
};

// Inherit the base public & private API methods
qq.extend(qq.FineUploader.prototype, qq.basePublicApi);
qq.extend(qq.FineUploader.prototype, qq.basePrivateApi);

// Add the FineUploader/default UI public & private UI methods, which may override some base methods.
qq.extend(qq.FineUploader.prototype, qq.uiPublicApi);
qq.extend(qq.FineUploader.prototype, qq.uiPrivateApi);

/** Generic class for sending non-upload ajax requests and handling the associated responses **/
/*globals qq, XMLHttpRequest*/
qq.AjaxRequestor = function (o) {
    "use strict";

    var log, shouldParamsBeInQueryString,
        queue = [],
        requestData = [],
        options = {
            validMethods: ['POST'],
            method: 'POST',
            contentType: "application/x-www-form-urlencoded",
            maxConnections: 3,
            customHeaders: {},
            endpointStore: {},
            paramsStore: {},
            mandatedParams: {},
            successfulResponseCodes: {
                "DELETE": [200, 202, 204],
                "POST": [200, 204]
            },
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function (str, level) {},
            onSend: function (id) {},
            onComplete: function (id, xhrOrXdr, isError) {},
            onCancel: function (id) {}
        };

    qq.extend(options, o);
    log = options.log;

        // TODO remove code duplication among all ajax requesters
    if (qq.indexOf(options.validMethods, getNormalizedMethod()) < 0) {
        throw new Error("'" + getNormalizedMethod() + "' is not a supported method for this type of request!");
    }

    // TODO remove code duplication among all ajax requesters
    function getNormalizedMethod() {
        return options.method.toUpperCase();
    }

    // [Simple methods](http://www.w3.org/TR/cors/#simple-method)
    // are defined by the W3C in the CORS spec as a list of methods that, in part,
    // make a CORS request eligible to be exempt from preflighting.
    function isSimpleMethod() {
        return qq.indexOf(["GET", "POST", "HEAD"], getNormalizedMethod()) >= 0;
    }

    // [Simple headers](http://www.w3.org/TR/cors/#simple-header)
    // are defined by the W3C in the CORS spec as a list of headers that, in part,
    // make a CORS request eligible to be exempt from preflighting.
    function containsNonSimpleHeaders(headers) {
        var containsNonSimple = false;

        qq.each(containsNonSimple, function(idx, header) {
            if (qq.indexOf(["Accept", "Accept-Language", "Content-Language", "Content-Type"], header) < 0) {
                containsNonSimple = true;
                return false;
            }
        });

        return containsNonSimple;
    }

    function isXdr(xhr) {
        //The `withCredentials` test is a commonly accepted way to determine if XHR supports CORS.
        return options.cors.expected && xhr.withCredentials === undefined;
    }

    // Returns either a new `XMLHttpRequest` or `XDomainRequest` instance.
    function getCorsAjaxTransport() {
        var xhrOrXdr;

        if (window.XMLHttpRequest) {
            xhrOrXdr = new XMLHttpRequest();

            if (xhrOrXdr.withCredentials === undefined) {
                xhrOrXdr = new XDomainRequest();
            }
        }

        return xhrOrXdr;
    }

    // Returns either a new XHR/XDR instance, or an existing one for the associated `File` or `Blob`.
    function getXhrOrXdr(id, dontCreateIfNotExist) {
        var xhrOrXdr = requestData[id].xhr;

        if (!xhrOrXdr && !dontCreateIfNotExist) {
            if (options.cors.expected) {
                xhrOrXdr = getCorsAjaxTransport();
            }
            else {
                xhrOrXdr = new XMLHttpRequest();
            }

            requestData[id].xhr = xhrOrXdr;
        }

        return xhrOrXdr;
    }

    // Removes element from queue, sends next request
    function dequeue(id) {
        var i = qq.indexOf(queue, id),
            max = options.maxConnections,
            nextId;

        delete requestData[id];
        queue.splice(i, 1);

        if (queue.length >= max && i < max) {
            nextId = queue[max - 1];
            sendRequest(nextId);
        }
    }

    function onComplete(id, xdrError) {
        var xhr = getXhrOrXdr(id),
            method = getNormalizedMethod(),
            isError = xdrError === true;

        dequeue(id);

        if (isError) {
            log(method + " request for " + id + " has failed", "error");
        }
        else if (!isXdr(xhr) && !isResponseSuccessful(xhr.status)) {
            isError = true;
            log(method + " request for " + id + " has failed - response code " + xhr.status, "error");
        }

        options.onComplete(id, xhr, isError);
    }

    function getParams(id) {
        var onDemandParams = requestData[id].onDemandParams,
            mandatedParams = options.mandatedParams,
            params;

        if (options.paramsStore.getParams) {
            params = options.paramsStore.getParams(id);
        }

        if (onDemandParams) {
            qq.each(onDemandParams, function (name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        if (mandatedParams) {
            qq.each(mandatedParams, function (name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        return params;
    }

    function sendRequest(id) {
        var xhr = getXhrOrXdr(id),
            method = getNormalizedMethod(),
            params = getParams(id),
            body = requestData[id].body,
            url;

        options.onSend(id);

        url = createUrl(id, params);

        // XDR and XHR status detection APIs differ a bit.
        if (isXdr(xhr)) {
            xhr.onload = getXdrLoadHandler(id);
            xhr.onerror = getXdrErrorHandler(id);
        }
        else {
            xhr.onreadystatechange = getXhrReadyStateChangeHandler(id);
        }

        // The last parameter is assumed to be ignored if we are actually using `XDomainRequest`.
        xhr.open(method, url, true);

        // Instruct the transport to send cookies along with the CORS request,
        // unless we are using `XDomainRequest`, which is not capable of this.
        if (options.cors.expected && options.cors.sendCredentials && !isXdr(xhr)) {
            xhr.withCredentials = true;
        }

        setHeaders(id);

        log('Sending ' + method + " request for " + id);

        if (body) {
            xhr.send(body)
        }
        else if (shouldParamsBeInQueryString || !params) {
            xhr.send();
        }
        else if (params && options.contentType.toLowerCase().indexOf("application/x-www-form-urlencoded") >= 0) {
            xhr.send(qq.obj2url(params, ""));
        }
        else if (params && options.contentType.toLowerCase().indexOf("application/json") >= 0) {
            xhr.send(JSON.stringify(params));
        }
        else {
            xhr.send(params);
        }
    }

    function createUrl(id, params) {
        var endpoint = options.endpointStore.getEndpoint(id),
            addToPath = requestData[id].addToPath;

        if (addToPath != undefined) {
            endpoint += "/" + addToPath;
        }

        if (shouldParamsBeInQueryString && params) {
            return qq.obj2url(params, endpoint);
        }
        else {
            return endpoint;
        }
    }

    // Invoked by the UA to indicate a number of possible states that describe
    // a live `XMLHttpRequest` transport.
    function getXhrReadyStateChangeHandler(id) {
        return function () {
            if (getXhrOrXdr(id).readyState === 4) {
                onComplete(id);
            }
        };
    }

    // This will be called by IE to indicate **success** for an associated
    // `XDomainRequest` transported request.
    function getXdrLoadHandler(id) {
        return function () {
            onComplete(id);
        }
    }

    // This will be called by IE to indicate **failure** for an associated
    // `XDomainRequest` transported request.
    function getXdrErrorHandler(id) {
        return function () {
            onComplete(id, true);
        }
    }

    function setHeaders(id) {
        var xhr = getXhrOrXdr(id),
            customHeaders = options.customHeaders,
            onDemandHeaders = requestData[id].additionalHeaders || {},
            method = getNormalizedMethod(),
            allHeaders = {};

        // If this is a CORS request and a simple method with simple headers are used
        // on an `XMLHttpRequest`, exclude these specific non-simple headers
        // in an attempt to prevent preflighting.  `XDomainRequest` does not support setting
        // request headers, so we will take this into account as well.
        if (isXdr(xhr)) {
            if (!options.cors.expected || (!isSimpleMethod() || containsNonSimpleHeaders(customHeaders))) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("Cache-Control", "no-cache");
            }
        }

        // Note that we can't set the Content-Type when using this transport XDR, and it is
        // not relevant unless we will be including the params in the payload.
        if (options.contentType && (method === "POST" || method === "PUT") && !isXdr(xhr)) {
            xhr.setRequestHeader("Content-Type", options.contentType);
        }

        // `XDomainRequest` doesn't allow you to set any headers.
        if (!isXdr(xhr)) {
            qq.extend(allHeaders, customHeaders);
            qq.extend(allHeaders, onDemandHeaders);

            qq.each(allHeaders, function (name, val) {
                xhr.setRequestHeader(name, val);
            });
        }
    }

    function cancelRequest(id) {
        var xhr = getXhrOrXdr(id, true),
            method = getNormalizedMethod();

        if (xhr) {
            // The event handlers we remove/unregister is dependant on whether we are
            // using `XDomainRequest` or `XMLHttpRequest`.
            if (isXdr(xhr)) {
                xhr.onerror = null;
                xhr.onload = null;
            }
            else {
                xhr.onreadystatechange = null;
            }

            xhr.abort();
            dequeue(id);

            log('Cancelled ' + method + " for " + id);
            options.onCancel(id);

            return true;
        }

        return false;
    }

    function isResponseSuccessful(responseCode) {
        return qq.indexOf(options.successfulResponseCodes[getNormalizedMethod()], responseCode) >= 0;
    }

    shouldParamsBeInQueryString = getNormalizedMethod() === 'GET' || getNormalizedMethod() === 'DELETE';

    return {
        send: function (id, addToPath, onDemandParams, onDemandHeaders, body) {
            requestData[id] = {
                addToPath: addToPath,
                onDemandParams: onDemandParams,
                additionalHeaders: onDemandHeaders,
                body: body
            };

            var len = queue.push(id);

            // if too many active connections, wait...
            if (len <= options.maxConnections) {
                sendRequest(id);
            }
        },

        cancel: function (id) {
            return cancelRequest(id);
        },

        getMethod: function() {
            return getNormalizedMethod();
        }
    };
};

/** Generic class for sending non-upload ajax requests and handling the associated responses **/
/*globals qq, XMLHttpRequest*/
qq.DeleteFileAjaxRequestor = function(o) {
    "use strict";

    var requestor,
        options = {
            method: "DELETE",
            uuidParamName: "qquuid",
            endpointStore: {},
            maxConnections: 3,
            customHeaders: {},
            paramsStore: {},
            demoMode: false,
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {},
            onDelete: function(id) {},
            onDeleteComplete: function(id, xhrOrXdr, isError) {}
        };

    qq.extend(options, o);

    function getMandatedParams() {
        if (options.method.toUpperCase() === "POST") {
            return {
                "_method": "DELETE"
            };
        }

        return {};
    }

    requestor = new qq.AjaxRequestor({
        validMethods: ["POST", "DELETE"],
        method: options.method,
        endpointStore: options.endpointStore,
        paramsStore: options.paramsStore,
        mandatedParams: getMandatedParams(),
        maxConnections: options.maxConnections,
        customHeaders: options.customHeaders,
        demoMode: options.demoMode,
        log: options.log,
        onSend: options.onDelete,
        onComplete: options.onDeleteComplete,
        cors: options.cors
    });


    return {
        sendDelete: function(id, uuid, additionalMandatedParams) {
            var additionalOptions = additionalMandatedParams || {};

            options.log("Submitting delete file request for " + id);

            if (requestor.getMethod() === "DELETE") {
                requestor.send(id, uuid, additionalOptions);
            }
            else {
                additionalOptions[options.uuidParamName] = uuid;
                requestor.send(id, null, additionalOptions);
            }
        }
    };
};

qq.WindowReceiveMessage = function(o) {
    var options = {
            log: function(message, level) {}
        },
        callbackWrapperDetachers = {};

    qq.extend(options, o);

    return {
        receiveMessage : function(id, callback) {
            var onMessageCallbackWrapper = function(event) {
                    callback(event.data);
                };

            if (window.postMessage) {
                callbackWrapperDetachers[id] = qq(window).attach("message", onMessageCallbackWrapper);
            }
            else {
                log("iframe message passing not supported in this browser!", "error");
            }
        },

        stopReceivingMessages : function(id) {
            if (window.postMessage) {
                var detacher = callbackWrapperDetachers[id];
                if (detacher) {
                    detacher();
                }
            }
        }
    };
};

/*globals qq*/
/**
 * Base upload handler module.  Delegates to more specific handlers.
 *
 * @param o Options.  Passed along to the specific handler submodule as well.
 * @param namespace [optional] Namespace for the specific handler.
 */
qq.UploadHandler = function(o, namespace) {
    "use strict";

    var queue = [],
        options, log, handlerImpl, api;

    // Default options, can be overridden by the user
    options = {
        debug: false,
        forceMultipart: true,
        paramsInBody: false,
        paramsStore: {},
        endpointStore: {},
        filenameParam: 'qqfilename',
        cors: {
            expected: false,
            sendCredentials: false
        },
        maxConnections: 3, // maximum number of concurrent uploads
        uuidParam: 'qquuid',
        totalFileSizeParam: 'qqtotalfilesize',
        chunking: {
            enabled: false,
            partSize: 2000000, //bytes
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalParts: 'qqtotalparts',
                filename: 'qqfilename'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        log: function(str, level) {},
        onProgress: function(id, fileName, loaded, total){},
        onComplete: function(id, fileName, response, xhr){},
        onCancel: function(id, fileName){},
        onUpload: function(id, fileName){},
        onUploadChunk: function(id, fileName, chunkData){},
        onAutoRetry: function(id, fileName, response, xhr){},
        onResume: function(id, fileName, chunkData){},
        onUuidChanged: function(id, newUuid){}

    };
    qq.extend(options, o);

    log = options.log;

    /**
     * Removes element from queue, starts upload of next
     */
    function dequeue(id) {
        var i = qq.indexOf(queue, id),
            max = options.maxConnections,
            nextId;

        if (i >= 0) {
            queue.splice(i, 1);

            if (queue.length >= max && i < max){
                nextId = queue[max-1];
                handlerImpl.upload(nextId);
            }
        }
    };

    function cancelSuccess(id) {
        log('Cancelling ' + id);
        options.paramsStore.remove(id);
        dequeue(id);
    }

    function determineHandlerImpl() {
        var handlerType = namespace ? qq[namespace] : qq,
            handlerModuleSubtype = qq.supportedFeatures.ajaxUploading ? "Xhr" : "Form";

        handlerImpl = new handlerType["UploadHandler" + handlerModuleSubtype](options, dequeue, options.onUuidChanged, log);
    }


    api = {
        /**
         * Adds file or file input to the queue
         * @returns id
         **/
        add: function(file){
            return handlerImpl.add(file);
        },
        /**
         * Sends the file identified by id
         */
        upload: function(id){
            var len = queue.push(id);

            // if too many active uploads, wait...
            if (len <= options.maxConnections){
                handlerImpl.upload(id);
                return true;
            }

            return false;
        },
        retry: function(id) {
            var i = qq.indexOf(queue, id);
            if (i >= 0) {
                return handlerImpl.upload(id, true);
            }
            else {
                return this.upload(id);
            }
        },
        /**
         * Cancels file upload by id
         */
        cancel: function(id) {
            var cancelRetVal = handlerImpl.cancel(id);

            if (qq.isPromise(cancelRetVal)) {
                cancelRetVal.then(function() {
                    cancelSuccess(id);
                });
            }
            else if (cancelRetVal !== false) {
                cancelSuccess(id);
            }
        },
        /**
         * Cancels all queued or in-progress uploads
         */
        cancelAll: function() {
            var self = this,
                queueCopy = [];

            qq.extend(queueCopy, queue);
            qq.each(queueCopy, function(idx, fileId) {
                self.cancel(fileId);
            });

            queue = [];
        },
        /**
         * Returns name of the file identified by id
         */
        getName: function(id) {
            return handlerImpl.getName(id);
        },
        // Update/change the name of the associated file.
        // This updated name should be sent as a parameter.
        setName: function(id, newName) {
            handlerImpl.setName(id, newName);
        },
        /**
         * Returns size of the file identified by id
         */
        getSize: function(id){
            if (handlerImpl.getSize) {
                return handlerImpl.getSize(id);
            }
        },
        getFile: function(id) {
            if (handlerImpl.getFile) {
                return handlerImpl.getFile(id);
            }
        },
        reset: function() {
            log('Resetting upload handler');
            api.cancelAll();
            queue = [];
            handlerImpl.reset();
        },
        expunge: function(id) {
            return handlerImpl.expunge(id);
        },
        getUuid: function(id) {
            return handlerImpl.getUuid(id);
        },
        setUuid: function(id, newUuid) {
            return handlerImpl.setUuid(id, newUuid);
        },
        /**
         * Determine if the file exists.
         */
        isValid: function(id) {
            return handlerImpl.isValid(id);
        },
        getResumableFilesData: function() {
            if (handlerImpl.getResumableFilesData) {
                return handlerImpl.getResumableFilesData();
            }
            return [];
        },
        /**
         * This may or may not be implemented, depending on the handler.  For handlers where a third-party ID is
         * available (such as the "key" for Amazon S3), this will return that value.  Otherwise, the return value
         * will be undefined.
         *
         * @param id Internal file ID
         * @returns {*} Some identifier used by a 3rd-party service involved in the upload process
         */
        getThirdPartyFileId: function(id) {
            if (handlerImpl.getThirdPartyFileId && api.isValid(id)) {
                return handlerImpl.getThirdPartyFileId(id);
            }
        }
    };

    determineHandlerImpl();

    return api;
};

/**
 * Common API exposed to creators of XHR handlers.  This is reused and possibly overriding in some cases by specific
 * XHR upload handlers.
 *
 * @param internalApi Object that will be filled with internal API methods
 * @param fileState An array containing objects that describe files tracked by the XHR upload handler.
 * @param chunking Properties that describe chunking option values.  Null if chunking is not enabled or possible.
 * @param onUpload Used to call the specific XHR upload handler when an upload has been request.
 * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.
 * @param onUuidChanged Callback to be invoked when the internal UUID is altered.
 * @param log Method used to send messages to the log.
 * @returns Various methods
 * @constructor
 */
qq.UploadHandlerXhrApi = function(internalApi, fileState, chunking, onUpload, onCancel, onUuidChanged, log) {
    "use strict";

    var publicApi;


    function getChunk(fileOrBlob, startByte, endByte) {
        if (fileOrBlob.slice) {
            return fileOrBlob.slice(startByte, endByte);
        }
        else if (fileOrBlob.mozSlice) {
            return fileOrBlob.mozSlice(startByte, endByte);
        }
        else if (fileOrBlob.webkitSlice) {
            return fileOrBlob.webkitSlice(startByte, endByte);
        }
    }

    qq.extend(internalApi, {
        /**
         * Creates an XHR instance for this file and stores it in the fileState.
         *
         * @param id File ID
         * @returns {XMLHttpRequest}
         */
        createXhr: function(id) {
            var xhr = new XMLHttpRequest();

            fileState[id].xhr = xhr;

            return xhr;
        },

        /**
         * @param id ID of the associated file
         * @returns {number} Number of parts this file can be divided into, or undefined if chunking is not supported in this UA
         */
        getTotalChunks: function(id) {
            if (chunking) {
                var fileSize = publicApi.getSize(id),
                    chunkSize = chunking.partSize;

                return Math.ceil(fileSize / chunkSize);
            }
        },

        getChunkData: function(id, chunkIndex) {
            var chunkSize = chunking.partSize,
                fileSize = publicApi.getSize(id),
                fileOrBlob = publicApi.getFile(id),
                startBytes = chunkSize * chunkIndex,
                endBytes = startBytes+chunkSize >= fileSize ? fileSize : startBytes+chunkSize,
                totalChunks = internalApi.getTotalChunks(id);

            return {
                part: chunkIndex,
                start: startBytes,
                end: endBytes,
                count: totalChunks,
                blob: getChunk(fileOrBlob, startBytes, endBytes),
                size: endBytes - startBytes
            };
        },

        getChunkDataForCallback: function(chunkData) {
            return {
                partIndex: chunkData.part,
                startByte: chunkData.start + 1,
                endByte: chunkData.end,
                totalParts: chunkData.count
            };
        }
    });

    publicApi = {
        /**
         * Adds File or Blob to the queue
         * Returns id to use with upload, cancel
         **/
        add: function(fileOrBlobData){
            var id,
                uuid = qq.getUniqueId();

            if (qq.isFile(fileOrBlobData)) {
                id = fileState.push({file: fileOrBlobData}) - 1;
            }
            else if (qq.isBlob(fileOrBlobData.blob)) {
                id = fileState.push({blobData: fileOrBlobData}) - 1;
            }
            else {
                throw new Error('Passed obj in not a File or BlobData (in qq.UploadHandlerXhr)');
            }

            fileState[id].uuid = uuid;

            return id;
        },

        getName: function(id) {
            if (publicApi.isValid(id)) {
                var file = fileState[id].file,
                    blobData = fileState[id].blobData,
                    newName = fileState[id].newName;

                if (newName !== undefined) {
                    return newName;
                }
                else if (file) {
                    // fix missing name in Safari 4
                    //NOTE: fixed missing name firefox 11.0a2 file.fileName is actually undefined
                    return (file.fileName !== null && file.fileName !== undefined) ? file.fileName : file.name;
                }
                else {
                    return blobData.name;
                }
            }
            else {
                log(id + " is not a valid item ID.", "error");
            }
        },

        setName: function(id, newName) {
            fileState[id].newName = newName;
        },

        getSize: function(id) {
            /*jshint eqnull: true*/
            var fileOrBlob = fileState[id].file || fileState[id].blobData.blob;

            if (qq.isFileOrInput(fileOrBlob)) {
                return fileOrBlob.fileSize != null ? fileOrBlob.fileSize : fileOrBlob.size;
            }
            else {
                return fileOrBlob.size;
            }
        },

        getFile: function(id) {
            if (fileState[id]) {
                return fileState[id].file || fileState[id].blobData.blob;
            }
        },

        isValid: function(id) {
            return fileState[id] !== undefined;
        },

        reset: function() {
            fileState.length = 0;
        },

        expunge: function(id) {
            var xhr = fileState[id].xhr;

            if (xhr) {
                xhr.onreadystatechange = null;
                xhr.abort();
            }

            delete fileState[id];
        },

        getUuid: function(id) {
            return fileState[id].uuid;
        },

        /**
         * Sends the file identified by id to the server
         */
        upload: function(id, retry) {
            return onUpload(id, retry);
        },

        cancel: function(id) {
            var onCancelRetVal = onCancel(id, publicApi.getName(id));

            if (qq.isPromise(onCancelRetVal)) {
                return onCancelRetVal.then(function() {
                    publicApi.expunge(id);
                });
            }
            else if (onCancelRetVal !== false) {
                publicApi.expunge(id);
                return true;
            }

            return false;
        },

        setUuid: function(id, newUuid) {
            log("Server requested UUID change from '" + fileState[id].uuid + "' to '" + newUuid + "'");
            fileState[id].uuid = newUuid;
            onUuidChanged(id, newUuid);
        }
    };

    return publicApi;
};

/**
 * Common APIs exposed to creators of upload via form/iframe handlers.  This is reused and possibly overridden
 * in some cases by specific form upload handlers.
 *
 * @param internalApi Object that will be filled with internal API methods
 * @param fileState An array containing objects that describe files tracked by the XHR upload handler.
 * @param isCors true if we should expect the response to come from a different origin.
 * @param inputName Name of the file input field/parameter.
 * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.
 * @param onUuidChanged Callback to be invoked when the internal UUID is altered.
 * @param log Method used to send messages to the log.
 * @returns {} Various methods
 * @constructor
 */
qq.UploadHandlerFormApi = function(internalApi, fileState, isCors, inputName, onCancel, onUuidChanged, log) {
    "use strict";

    var formHandlerInstanceId = qq.getUniqueId(),
        corsMessageReceiver = new qq.WindowReceiveMessage({log: log}),
        onloadCallbacks = {},
        detachLoadEvents = {},
        postMessageCallbackTimers = {},
        publicApi;


    /**
     * Remove any trace of the file from the handler.
     *
     * @param id ID of the associated file
     */
    function expungeFile(id) {
        delete detachLoadEvents[id];
        delete fileState[id];

        // If we are dealing with CORS, we might still be waiting for a response from a loaded iframe.
        // In that case, terminate the timer waiting for a message from the loaded iframe
        // and stop listening for any more messages coming from this iframe.
        if (isCors) {
            clearTimeout(postMessageCallbackTimers[id]);
            delete postMessageCallbackTimers[id];
            corsMessageReceiver.stopReceivingMessages(id);
        }

        var iframe = document.getElementById(internalApi.getIframeName(id));
        if (iframe) {
            // To cancel request set src to something else.  We use src="javascript:false;"
            // because it doesn't trigger ie6 prompt on https
            iframe.setAttribute('src', 'java' + String.fromCharCode(115) + 'cript:false;'); //deal with "JSLint: javascript URL" warning, which apparently cannot be turned off

            qq(iframe).remove();
        }
    }

    /**
     * If we are in CORS mode, we must listen for messages (containing the server response) from the associated
     * iframe, since we cannot directly parse the content of the iframe due to cross-origin restrictions.
     *
     * @param iframe Listen for messages on this iframe.
     * @param callback Invoke this callback with the message from the iframe.
     */
    function registerPostMessageCallback(iframe, callback) {
        var iframeName = iframe.id,
            fileId = getFileIdForIframeName(iframeName),
            uuid = fileState[fileId].uuid;

        onloadCallbacks[uuid] = callback;

        // When the iframe has loaded (after the server responds to an upload request)
        // declare the attempt a failure if we don't receive a valid message shortly after the response comes in.
        detachLoadEvents[fileId] = qq(iframe).attach('load', function() {
            if (fileState[fileId].input) {
                log("Received iframe load event for CORS upload request (iframe name " + iframeName + ")");

                postMessageCallbackTimers[iframeName] = setTimeout(function() {
                    var errorMessage = "No valid message received from loaded iframe for iframe name " + iframeName;
                    log(errorMessage, "error");
                    callback({
                        error: errorMessage
                    });
                }, 1000);
            }
        });

        // Listen for messages coming from this iframe.  When a message has been received, cancel the timer
        // that declares the upload a failure if a message is not received within a reasonable amount of time.
        corsMessageReceiver.receiveMessage(iframeName, function(message) {
            log("Received the following window message: '" + message + "'");
            var fileId = getFileIdForIframeName(iframeName),
                response = internalApi.parseJsonResponse(fileId, message),
                uuid = response.uuid,
                onloadCallback;

            if (uuid && onloadCallbacks[uuid]) {
                log("Handling response for iframe name " + iframeName);
                clearTimeout(postMessageCallbackTimers[iframeName]);
                delete postMessageCallbackTimers[iframeName];

                internalApi.detachLoadEvent(iframeName);

                onloadCallback = onloadCallbacks[uuid];

                delete onloadCallbacks[uuid];
                corsMessageReceiver.stopReceivingMessages(iframeName);
                onloadCallback(response);
            }
            else if (!uuid) {
                log("'" + message + "' does not contain a UUID - ignoring.");
            }
        });
    }

    /**
     * Generates an iframe to be used as a target for upload-related form submits.  This also adds the iframe
     * to the current `document`.  Note that the iframe is hidden from view.
     *
     * @param name Name of the iframe.
     * @returns {HTMLIFrameElement} The created iframe
     */
    function initIframeForUpload(name) {
        var iframe = qq.toElement('<iframe src="javascript:false;" name="' + name + '" />');

        iframe.setAttribute('id', name);

        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        return iframe;
    }

    /**
     * @param iframeName `document`-unique Name of the associated iframe
     * @returns {*} ID of the associated file
     */
    function getFileIdForIframeName(iframeName) {
        return iframeName.split("_")[0];
    }


// INTERNAL API

    qq.extend(internalApi, {
        /**
         * @param fileId ID of the associated file
         * @returns {string} The `document`-unique name of the iframe
         */
        getIframeName: function(fileId) {
            return fileId + "_" + formHandlerInstanceId;
        },

        /**
         * Creates an iframe with a specific document-unique name.
         *
         * @param id ID of the associated file
         * @returns {HTMLIFrameElement}
         */
        createIframe: function(id) {
            var iframeName = internalApi.getIframeName(id);

            return initIframeForUpload(iframeName);
        },

        /**
         * @param id ID of the associated file
         * @param innerHtmlOrMessage JSON message
         * @returns {*} The parsed response, or an empty object if the response could not be parsed
         */
        parseJsonResponse: function(id, innerHtmlOrMessage) {
            var response;

            try {
                response = qq.parseJson(innerHtmlOrMessage);

                if (response.newUuid !== undefined) {
                    publicApi.setUuid(id, response.newUuid);
                }
            }
            catch(error) {
                log('Error when attempting to parse iframe upload response (' + error.message + ')', 'error');
                response = {};
            }

            return response;
        },

        /**
         * Generates a form element and appends it to the `document`.  When the form is submitted, a specific iframe is targeted.
         * The name of the iframe is passed in as a property of the spec parameter, and must be unique in the `document`.  Note
         * that the form is hidden from view.
         *
         * @param spec An object containing various properties to be used when constructing the form.  Required properties are
         * currently: `method`, `endpoint`, `params`, `paramsInBody`, and `targetName`.
         * @returns {HTMLFormElement} The created form
         */
        initFormForUpload: function(spec) {
            var method = spec.method,
                endpoint = spec.endpoint,
                params = spec.params,
                paramsInBody = spec.paramsInBody,
                targetName = spec.targetName,
                form = qq.toElement('<form method="' + method + '" enctype="multipart/form-data"></form>'),
                url = endpoint;

            if (paramsInBody) {
                qq.obj2Inputs(params, form);
            }
            else {
                url = qq.obj2url(params, endpoint);
            }

            form.setAttribute('action', url);
            form.setAttribute('target', targetName);
            form.style.display = 'none';
            document.body.appendChild(form);

            return form;
        },

        /**
         * This function either delegates to a more specific message handler if CORS is involved,
         * or simply registers a callback when the iframe has been loaded that invokes the passed callback
         * after determining if the content of the iframe is accessible.
         *
         * @param iframe Associated iframe
         * @param callback Callback to invoke after we have determined if the iframe content is accessible.
         */
        attachLoadEvent: function(iframe, callback) {
            /*jslint eqeq: true*/
            var responseDescriptor;

            if (isCors) {
                registerPostMessageCallback(iframe, callback);
            }
            else {
                detachLoadEvents[iframe.id] = qq(iframe).attach('load', function(){
                    log('Received response for ' + iframe.id);

                    // when we remove iframe from dom
                    // the request stops, but in IE load
                    // event fires
                    if (!iframe.parentNode){
                        return;
                    }

                    try {
                        // fixing Opera 10.53
                        if (iframe.contentDocument &&
                            iframe.contentDocument.body &&
                            iframe.contentDocument.body.innerHTML == "false"){
                            // In Opera event is fired second time
                            // when body.innerHTML changed from false
                            // to server response approx. after 1 sec
                            // when we upload file with iframe
                            return;
                        }
                    }
                    catch (error) {
                        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
                        log('Error when attempting to access iframe during handling of upload response (' + error.message + ")", 'error');
                        responseDescriptor = {success: false};
                    }

                    callback(responseDescriptor);
                });
            }
        },

        /**
         * Called when we are no longer interested in being notified when an iframe has loaded.
         *
         * @param id Associated file ID
         */
        detachLoadEvent: function(id) {
            if (detachLoadEvents[id] !== undefined) {
                detachLoadEvents[id]();
                delete detachLoadEvents[id];
            }
        }
    });


// PUBLIC API

    publicApi = {
        add: function(fileInput) {
            var id = fileState.push({input: fileInput}) - 1;

            fileInput.setAttribute('name', inputName);

            fileState[id].uuid = qq.getUniqueId();

            // remove file input from DOM
            if (fileInput.parentNode){
                qq(fileInput).remove();
            }

            return id;
        },

        getName: function(id) {
            /*jslint regexp: true*/

            if (fileState[id].newName !== undefined) {
                return fileState[id].newName;
            }
            else if (publicApi.isValid(id)) {
                // get input value and remove path to normalize
                return fileState[id].input.value.replace(/.*(\/|\\)/, "");
            }
            else {
                log(id + " is not a valid item ID.", "error");
            }
        },

        setName: function(id, newName) {
            fileState[id].newName = newName;
        },

        isValid: function(id) {
            return fileState[id] !== undefined
                && fileState[id].input !== undefined;
        },

        reset: function() {
            fileState.length = 0;
        },

        expunge: function(id) {
            return expungeFile(id);
        },

        getUuid: function(id) {
            return fileState[id].uuid;
        },

        cancel: function(id) {
            var onCancelRetVal = onCancel(id, publicApi.getName(id));

            if (qq.isPromise(onCancelRetVal)) {
                return onCancelRetVal.then(function() {
                    publicApi.expunge(id);
                });
            }
            else if (onCancelRetVal !== false) {
                publicApi.expunge(id);
                return true;
            }

            return false;
        },

        upload: function(id) {
            // implementation-specific
        },

        setUuid: function(id, newUuid) {
            log("Server requested UUID change from '" + fileState[id].uuid + "' to '" + newUuid + "'");
            fileState[id].uuid = newUuid;
            onUuidChanged(id, newUuid);
        }
    };

    return publicApi;
};

// Base handler for UI (FineUploader mode) events.
// Some more specific handlers inherit from this one.
qq.UiEventHandler = function(s, protectedApi) {
    "use strict";

    var disposer = new qq.DisposeSupport(),
        spec = {
            eventType: 'click',
            attachTo: null,
            onHandled: function(target, event) {}
        },
        // This makes up the "public" API methods that will be accessible
        // to instances constructing a base or child handler
        publicApi = {
            addHandler: function(element) {
                addHandler(element);
            },

            dispose: function() {
                disposer.dispose();
            }
        };



    function addHandler(element) {
        disposer.attach(element, spec.eventType, function(event) {
            // Only in IE: the `event` is a property of the `window`.
            event = event || window.event;

            // On older browsers, we must check the `srcElement` instead of the `target`.
            var target = event.target || event.srcElement;

            spec.onHandled(target, event);
        });
    }

    // These make up the "protected" API methods that children of this base handler will utilize.
    qq.extend(protectedApi, {
        // Find the ID of the associated file by looking for an
        // expando property present on each file item in the DOM.
        getItemFromEventTarget: function(target) {
            var item = target.parentNode;

            while(item.qqFileId === undefined) {
                item = item.parentNode;
            }

            return item;
        },

        getFileIdFromItem: function(item) {
            return item.qqFileId;
        },

        getDisposeSupport: function() {
            return disposer;
        }
    });


    qq.extend(spec, s);

    if (spec.attachTo) {
        addHandler(spec.attachTo);
    }

    return publicApi;
};

qq.DeleteRetryOrCancelClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            listElement: document,
            log: function(message, lvl) {},
            classes: {
                cancel: 'qq-upload-cancel',
                deleteButton: 'qq-upload-delete',
                retry: 'qq-upload-retry'
            },
            onDeleteFile: function(fileId) {},
            onCancel: function(fileId) {},
            onRetry: function(fileId) {},
            onGetName: function(fileId) {}
    };

    function examineEvent(target, event) {
        if (qq(target).hasClass(spec.classes.cancel)
            || qq(target).hasClass(spec.classes.retry)
            || qq(target).hasClass(spec.classes.deleteButton)) {

            var item = inheritedInternalApi.getItemFromEventTarget(target),
                fileId = inheritedInternalApi.getFileIdFromItem(item);

            qq.preventDefault(event);

            spec.log(qq.format("Detected valid cancel, retry, or delete click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
            deleteRetryOrCancel(target, fileId);
        }
    }

    function deleteRetryOrCancel(target, fileId) {
        if (qq(target).hasClass(spec.classes.deleteButton)) {
            spec.onDeleteFile(fileId);
        }
        else if (qq(target).hasClass(spec.classes.cancel)) {
            spec.onCancel(fileId);
        }
        else {
            spec.onRetry(fileId);
        }
    }

    qq.extend(spec, s);

    spec.eventType = 'click';
    spec.onHandled = examineEvent;
    spec.attachTo = spec.listElement;

    qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));
};

// Handles edit-related events on a file item (FineUploader mode).  This is meant to be a parent handler.
// Children will delegate to this handler when specific edit-related actions are detected.
qq.FilenameEditHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            listElement: null,
            log: function(message, lvl) {},
            classes: {
                file: 'qq-upload-file'
            },
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {},
            onSetName: function(fileId, newName) {},
            onGetInput: function(item) {},
            onEditingStatusChange: function(fileId, isEditing) {}
        },
        publicApi;

    function getFilenameSansExtension(fileId) {
        var filenameSansExt = spec.onGetName(fileId),
            extIdx = filenameSansExt.lastIndexOf('.');

        if (extIdx > 0) {
            filenameSansExt = filenameSansExt.substr(0, extIdx);
        }

        return filenameSansExt;
    }

    function getOriginalExtension(fileId) {
        var origName = spec.onGetName(fileId);
        return qq.getExtension(origName);
    }

    // Callback iff the name has been changed
    function handleNameUpdate(newFilenameInputEl, fileId) {
        var newName = newFilenameInputEl.value,
            origExtension;

        if (newName !== undefined && qq.trimStr(newName).length > 0) {
            origExtension = getOriginalExtension(fileId);

            if (origExtension !== undefined) {
                newName = newName + "." + origExtension;
            }

            spec.onSetName(fileId, newName);
        }

        spec.onEditingStatusChange(fileId, false);
    }

    // The name has been updated if the filename edit input loses focus.
    function registerInputBlurHandler(inputEl, fileId) {
        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'blur', function() {
            handleNameUpdate(inputEl, fileId)
        });
    }

    // The name has been updated if the user presses enter.
    function registerInputEnterKeyHandler(inputEl, fileId) {
        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'keyup', function(event) {

            var code = event.keyCode || event.which;

            if (code === 13) {
                handleNameUpdate(inputEl, fileId)
            }
        });
    }

    qq.extend(spec, s);

    spec.attachTo = spec.listElement;

    publicApi = qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));

    qq.extend(inheritedInternalApi, {
        handleFilenameEdit: function(fileId, target, item, focusInput) {
            var newFilenameInputEl = spec.onGetInput(item);

            spec.onEditingStatusChange(fileId, true);

            newFilenameInputEl.value = getFilenameSansExtension(fileId);

            if (focusInput) {
                newFilenameInputEl.focus();
            }

            registerInputBlurHandler(newFilenameInputEl, fileId);
            registerInputEnterKeyHandler(newFilenameInputEl, fileId);
        }
    });

    return publicApi;
};

// Child of FilenameEditHandler.  Used to detect click events on filename display elements.
qq.FilenameClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            log: function(message, lvl) {},
            classes: {
                file: 'qq-upload-file',
                editNameIcon: 'qq-edit-filename-icon'
            },
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {}
    };

    qq.extend(spec, s);

    // This will be called by the parent handler when a `click` event is received on the list element.
    function examineEvent(target, event) {
        if (qq(target).hasClass(spec.classes.file) || qq(target).hasClass(spec.classes.editNameIcon)) {
            var item = inheritedInternalApi.getItemFromEventTarget(target),
                fileId = inheritedInternalApi.getFileIdFromItem(item),
                status = spec.onGetUploadStatus(fileId);

            // We only allow users to change filenames of files that have been submitted but not yet uploaded.
            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                qq.preventDefault(event);

                inheritedInternalApi.handleFilenameEdit(fileId, target, item, true);
            }
        }
    }

    spec.eventType = 'click';
    spec.onHandled = examineEvent;

    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

// Child of FilenameEditHandler.  Used to detect focusin events on file edit input elements.
qq.FilenameInputFocusInHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            listElement: null,
            classes: {
                editFilenameInput: 'qq-edit-filename'
            },
            onGetUploadStatus: function(fileId) {},
            log: function(message, lvl) {}
    };

    if (!inheritedInternalApi) {
        inheritedInternalApi = {};
    }

    // This will be called by the parent handler when a `focusin` event is received on the list element.
    function handleInputFocus(target, event) {
        if (qq(target).hasClass(spec.classes.editFilenameInput)) {
            var item = inheritedInternalApi.getItemFromEventTarget(target),
                fileId = inheritedInternalApi.getFileIdFromItem(item),
                status = spec.onGetUploadStatus(fileId);

            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename input focus event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                inheritedInternalApi.handleFilenameEdit(fileId, target, item);
            }
        }
    }

    spec.eventType = 'focusin';
    spec.onHandled = handleInputFocus;

    qq.extend(spec, s);

    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

/**
 * Child of FilenameInputFocusInHandler.  Used to detect focus events on file edit input elements.  This child module is only
 * needed for UAs that do not support the focusin event.  Currently, only Firefox lacks this event.
 *
 * @param spec Overrides for default specifications
 */
qq.FilenameInputFocusHandler = function(spec) {
    "use strict";

    spec.eventType = 'focus';
    spec.attachTo = null;

    return qq.extend(this, new qq.FilenameInputFocusInHandler(spec, {}));
};

/*globals jQuery, qq*/
(function($) {
    "use strict";
    var $el,
        pluginOptions = ['uploaderType', 'endpointType'];

    function init(options) {
        if (options) {
            var xformedOpts = transformVariables(options),
                newUploaderInstance = getNewUploaderInstance(xformedOpts);

            uploader(newUploaderInstance);
            addCallbacks(xformedOpts, newUploaderInstance);
        }

        return $el;
    };

    function getNewUploaderInstance(params) {
        var uploaderType = pluginOption('uploaderType'),
            namespace = pluginOption('endpointType');

        // If the integrator has defined a specific type of uploader to load, use that, otherwise assume `qq.FineUploader`
        if (uploaderType) {
            // We can determine the correct constructor function to invoke by combining "FineUploader"
            // with the upper camel cased `uploaderType` value.
            uploaderType = uploaderType.charAt(0).toUpperCase() + uploaderType.slice(1).toLowerCase();

            if (namespace) {
                return new qq[namespace]["FineUploader" + uploaderType](params);
            }

            return new qq["FineUploader" + uploaderType](params);
        }
        else {
            if (namespace) {
                return new qq[namespace]["FineUploader"](params);
            }

            return new qq.FineUploader(params);
        }
    }

    function dataStore(key, val) {
        var data = $el.data('fineuploader');

        if (val) {
            if (data === undefined) {
                data = {};
            }
            data[key] = val;
            $el.data('fineuploader', data);
        }
        else {
            if (data === undefined) {
                return null;
            }
            return data[key];
        }
    };

    //the underlying Fine Uploader instance is stored in jQuery's data stored, associated with the element
    // tied to this instance of the plug-in
    function uploader(instanceToStore) {
        return dataStore('uploader', instanceToStore);
    };

    function pluginOption(option, optionVal) {
        return dataStore(option, optionVal);
    };

    // Implement all callbacks defined in Fine Uploader as functions that trigger appropriately names events and
    // return the result of executing the bound handler back to Fine Uploader
    function addCallbacks(transformedOpts, newUploaderInstance) {
        var callbacks = transformedOpts.callbacks = {};

        $.each(newUploaderInstance._options.callbacks, function(prop, func) {
            var name, $callbackEl;

            name = /^on(\w+)/.exec(prop)[1];
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
            $callbackEl = $el;

            callbacks[prop] = function() {
                var args = Array.prototype.slice.call(arguments);

                return $callbackEl.triggerHandler(name, args);
            };
        });

        newUploaderInstance._options.callbacks = callbacks;
    };

    //transform jQuery objects into HTMLElements, and pass along all other option properties
    function transformVariables(source, dest) {
        var xformed, arrayVals;

        if (dest === undefined) {
            if (source.uploaderType !== 'basic') {
                xformed = { element : $el[0] };
            }
            else {
                xformed = {};
            }
        }
        else {
            xformed = dest;
        }

        $.each(source, function(prop, val) {
            if ($.inArray(prop, pluginOptions) >= 0) {
                pluginOption(prop, val);
            }
            else if (val instanceof $) {
                xformed[prop] = val[0];
            }
            else if ($.isPlainObject(val)) {
                xformed[prop] = {};
                transformVariables(val, xformed[prop]);
            }
            else if ($.isArray(val)) {
                arrayVals = [];
                $.each(val, function(idx, arrayVal) {
                    if (arrayVal instanceof $) {
                        $.merge(arrayVals, arrayVal);
                    }
                    else {
                        arrayVals.push(arrayVal);
                    }
                });
                xformed[prop] = arrayVals;
            }
            else {
                xformed[prop] = val;
            }
        });

        if (dest === undefined) {
            return xformed;
        }
    };

    function isValidCommand(command) {
        return $.type(command) === "string" &&
            !command.match(/^_/) && //enforce private methods convention
            uploader()[command] !== undefined;
    };

    // Assuming we have already verified that this is a valid command, call the associated function in the underlying
    // Fine Uploader instance (passing along the arguments from the caller) and return the result of the call back to the caller
    function delegateCommand(command) {
        var xformedArgs = [],
            origArgs = Array.prototype.slice.call(arguments, 1),
            retVal;

        transformVariables(origArgs, xformedArgs);

        retVal = uploader()[command].apply(uploader(), xformedArgs);

        // If the command is returning an `HTMLElement` or `HTMLDocument`, wrap it in a `jQuery` object
        if(typeof retVal === "object"
            && (retVal.nodeType === 1 || retVal.nodeType === 9)
            && retVal.cloneNode) {

            retVal = $(retVal);
        }

        return retVal;
    };

    $.fn.fineUploader = function(optionsOrCommand) {
        var self = this, selfArgs = arguments, retVals = [];

        this.each(function(index, el) {
            $el = $(el);

            if (uploader() && isValidCommand(optionsOrCommand)) {
                retVals.push(delegateCommand.apply(self, selfArgs));

                if (self.length === 1) {
                    return false;
                }
            }
            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {
                init.apply(self, selfArgs);
            }
            else {
                $.error('Method ' +  optionsOrCommand + ' does not exist on jQuery.fineUploader');
            }
        });

        if (retVals.length === 1) {
            return retVals[0];
        }
        else if (retVals.length > 1) {
            return retVals;
        }

        return this;
    };

}(jQuery));

/*globals jQuery, qq*/
(function($) {
    "use strict";
    var rootDataKey = "fineUploaderDnd",
        $el;

    function init (options) {
        if (!options) {
            options = {};
        }

        options.dropZoneElements = [$el];
        var xformedOpts = transformVariables(options);
        addCallbacks(xformedOpts);
        dnd(new qq.DragAndDrop(xformedOpts));

        return $el;
    };

    function dataStore(key, val) {
        var data = $el.data(rootDataKey);

        if (val) {
            if (data === undefined) {
                data = {};
            }
            data[key] = val;
            $el.data(rootDataKey, data);
        }
        else {
            if (data === undefined) {
                return null;
            }
            return data[key];
        }
    };

    function dnd(instanceToStore) {
        return dataStore('dndInstance', instanceToStore);
    };

    function addCallbacks(transformedOpts) {
        var callbacks = transformedOpts.callbacks = {},
            dndInst = new qq.FineUploaderBasic();

        $.each(new qq.DragAndDrop.callbacks(), function(prop, func) {
            var name = prop,
                $callbackEl;

            $callbackEl = $el;

            callbacks[prop] = function() {
                var args = Array.prototype.slice.call(arguments),
                    jqueryHandlerResult = $callbackEl.triggerHandler(name, args);

                return jqueryHandlerResult;
            };
        });
    };

    //transform jQuery objects into HTMLElements, and pass along all other option properties
    function transformVariables(source, dest) {
        var xformed, arrayVals;

        if (dest === undefined) {
            xformed = {};
        }
        else {
            xformed = dest;
        }

        $.each(source, function(prop, val) {
            if (val instanceof $) {
                xformed[prop] = val[0];
            }
            else if ($.isPlainObject(val)) {
                xformed[prop] = {};
                transformVariables(val, xformed[prop]);
            }
            else if ($.isArray(val)) {
                arrayVals = [];
                $.each(val, function(idx, arrayVal) {
                    if (arrayVal instanceof $) {
                        $.merge(arrayVals, arrayVal);
                    }
                    else {
                        arrayVals.push(arrayVal);
                    }
                });
                xformed[prop] = arrayVals;
            }
            else {
                xformed[prop] = val;
            }
        });

        if (dest === undefined) {
            return xformed;
        }
    };

    function isValidCommand(command) {
        return $.type(command) === "string" &&
            command === "dispose" &&
            dnd()[command] !== undefined;
    };

    function delegateCommand(command) {
        var xformedArgs = [], origArgs = Array.prototype.slice.call(arguments, 1);
        transformVariables(origArgs, xformedArgs);
        return dnd()[command].apply(dnd(), xformedArgs);
    };

    $.fn.fineUploaderDnd = function(optionsOrCommand) {
        var self = this, selfArgs = arguments, retVals = [];

        this.each(function(index, el) {
            $el = $(el);

            if (dnd() && isValidCommand(optionsOrCommand)) {
                retVals.push(delegateCommand.apply(self, selfArgs));

                if (self.length === 1) {
                    return false;
                }
            }
            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {
                init.apply(self, selfArgs);
            }
            else {
                $.error("Method " +  optionsOrCommand + " does not exist in Fine Uploader's DnD module.");
            }
        });

        if (retVals.length === 1) {
            return retVals[0];
        }
        else if (retVals.length > 1) {
            return retVals;
        }

        return this;
    };

}(jQuery));

qq.s3 = qq.s3 || {};

qq.s3.util = qq.s3.util || (function() {
    return {
        AWS_PARAM_PREFIX: "x-amz-meta-",

        /**
         * This allows for the region to be specified in the bucket's endpoint URL, or not.
         *
         * Examples of some valid endpoints are:
         *     http://foo.s3.amazonaws.com
         *     https://foo.s3.amazonaws.com
         *     http://foo.s3-ap-northeast-1.amazonaws.com
         *     foo.s3.amazonaws.com
         *     http://foo.bar.com
         *     http://s3.amazonaws.com/foo.bar.com
         * ...etc
         *
         * @param endpoint The bucket's URL.
         * @returns {String || undefined} The bucket name, or undefined if the URL cannot be parsed.
         */
        getBucket: function(endpoint) {
            var patterns = [
                    //bucket in domain
                    /^(?:https?:\/\/)?([a-z0-9.\-]+)\.s3(?:-[a-z0-9\-]+)?\.amazonaws\.com/i,
                    //bucket in path
                    /^(?:https?:\/\/)?s3(?:-[a-z0-9\-]+)?\.amazonaws\.com\/([a-z0-9.\-]+)/i,
                    //custom domain
                    /^(?:https?:\/\/)?([a-z0-9.\-]+)/i
                ],
                bucket;

            qq.each(patterns, function(idx, pattern) {
                var match = pattern.exec(endpoint);

                if (match) {
                    bucket = match[1];
                    return false;
                }
            });

            return bucket;
        },

        /**
         * Create a policy document to be signed and sent along with the S3 upload request.
         *
         * @param spec Object with properties: `endpoint`, `key`, `acl`, `type`, `expectedStatus`, `params`, `minFileSize`, and `maxFileSize`.
         * @returns {Object} Policy doc.
         */
        getPolicy: function(spec) {
            var policy = {},
                conditions = [],
                bucket = qq.s3.util.getBucket(spec.endpoint),
                key = spec.key,
                acl = spec.acl,
                type = spec.type,
                expirationDate = new Date(),
                expectedStatus = spec.expectedStatus,
                params = spec.params,
                successRedirectUrl = qq.s3.util.getSuccessRedirectAbsoluteUrl(spec.successRedirectUrl),
                minFileSize = spec.minFileSize,
                maxFileSize = spec.maxFileSize;

            policy.expiration = qq.s3.util.getPolicyExpirationDate(expirationDate);

            conditions.push({acl: acl});
            conditions.push({bucket: bucket});

            if (type) {
                conditions.push({"Content-Type": type});
            }

            if (expectedStatus) {
                conditions.push({success_action_status: expectedStatus.toString()});
            }

            if (successRedirectUrl) {
                conditions.push({success_action_redirect: successRedirectUrl});
            }

            conditions.push({key: key});

            // user metadata
            qq.each(params, function(name, val) {
                var awsParamName = qq.s3.util.AWS_PARAM_PREFIX + name,
                    param = {};

                param[awsParamName] = encodeURIComponent(val);
                conditions.push(param);
            });

            policy.conditions = conditions;

            qq.s3.util.enforceSizeLimits(policy, minFileSize, maxFileSize);

            return policy;
        },

        /**
         * Generates all parameters to be passed along with the S3 upload request.  This includes invoking a callback
         * that is expected to asynchronously retrieve a signature for the policy document.  Note that the server
         * signing the request should reject a "tainted" policy document that includes unexpected values, since it is
         * still possible for a malicious user to tamper with these values during policy document generation, b
         * before it is sent to the server for signing.
         *
         * @param spec Object with properties: `params`, `type`, `key`, `accessKey`, `acl`, `expectedStatus`, `successRedirectUrl`,
         * and `log()`, along with any options associated with `qq.s3.util.getPolicy()`.
         * @returns {qq.Promise} Promise that will be fulfilled once all parameters have been determined.
         */
        generateAwsParams: function(spec, signPolicyCallback) {
            var awsParams = {},
                customParams = spec.params,
                promise = new qq.Promise(),
                policyJson = qq.s3.util.getPolicy(spec),
                type = spec.type,
                key = spec.key,
                accessKey = spec.accessKey,
                acl = spec.acl,
                expectedStatus = spec.expectedStatus,
                successRedirectUrl = qq.s3.util.getSuccessRedirectAbsoluteUrl(spec.successRedirectUrl),
                log = spec.log;

            awsParams.key = key;
            awsParams.AWSAccessKeyId = accessKey;

            if (type) {
                awsParams["Content-Type"] = type;
            }

            if (expectedStatus) {
                awsParams.success_action_status = expectedStatus;
            }

            if (successRedirectUrl) {
                awsParams["success_action_redirect"] = successRedirectUrl;
            }

            awsParams.acl = acl;

            // Custom (user-supplied) params must be prefixed with the value of `qq.s3.util.AWS_PARAM_PREFIX`.
            // Custom param values will be URI encoded as well.
            qq.each(customParams, function(name, val) {
                var awsParamName = qq.s3.util.AWS_PARAM_PREFIX + name;
                awsParams[awsParamName] = encodeURIComponent(val);
            });

            // Invoke a promissory callback that should provide us with a base64-encoded policy doc and an
            // HMAC signature for the policy doc.
            signPolicyCallback(policyJson).then(
                function(policyAndSignature) {
                    awsParams.policy = policyAndSignature.policy;
                    awsParams.signature = policyAndSignature.signature;
                    promise.success(awsParams);
                },
                function(errorMessage) {
                    errorMessage = errorMessage || "Can't continue further with request to S3 as we did not receive " +
                                                   "a valid signature and policy from the server."

                    log("Policy signing failed.  " + errorMessage, "error");
                    promise.failure(errorMessage);
                }
            );

            return promise;
        },

        /**
         * Add a condition to an existing S3 upload request policy document used to ensure AWS enforces any size
         * restrictions placed on files server-side.  This is important to do, in case users mess with the client-side
         * checks already in place.
         *
         * @param policy Policy document as an `Object`, with a `conditions` property already attached
         * @param minSize Minimum acceptable size, in bytes
         * @param maxSize Maximum acceptable size, in bytes (0 = unlimited)
         */
        enforceSizeLimits: function(policy, minSize, maxSize) {
            var adjustedMinSize = minSize < 0 ? 0 : minSize,
                // Adjust a maxSize of 0 to the largest possible integer, since we must specify a high and a low in the request
                adjustedMaxSize = maxSize <= 0 ? 9007199254740992 : maxSize;

            if (minSize > 0 || maxSize > 0) {
                policy.conditions.push(['content-length-range', adjustedMinSize.toString(), adjustedMaxSize.toString()]);
            }
        },

        getPolicyExpirationDate: function(date) {
            // Is this going to be a problem if we encounter this moments before 2 AM just before daylight savings time ends?
            date.setMinutes(date.getMinutes() + 5);

            if (Date.prototype.toISOString) {
                return date.toISOString();
            }
            else {
                function pad(number) {
                    var r = String(number);

                    if ( r.length === 1 ) {
                        r = '0' + r;
                    }

                    return r;
                }

                return date.getUTCFullYear()
                        + '-' + pad( date.getUTCMonth() + 1 )
                        + '-' + pad( date.getUTCDate() )
                        + 'T' + pad( date.getUTCHours() )
                        + ':' + pad( date.getUTCMinutes() )
                        + ':' + pad( date.getUTCSeconds() )
                        + '.' + String( (date.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                        + 'Z';            }
        },

        /**
         * Looks at a response from S3 contained in an iframe and parses the query string in an attempt to identify
         * the associated resource.
         *
         * @param iframe Iframe containing response
         * @returns {{bucket: *, key: *, etag: *}}
         */
        parseIframeResponse: function(iframe) {
            var doc = iframe.contentDocument || iframe.contentWindow.document,
                queryString = doc.location.search,
                match = /bucket=(.+)&key=(.+)&etag=(.+)/.exec(queryString);

            if (match) {
                return {
                    bucket: match[1],
                    key: match[2],
                    etag: match[3]
                };
            }
        },

        /**
         * @param successRedirectUrl Relative or absolute location of success redirect page
         * @returns {*|string} undefined if the parameter is undefined, otherwise the absolute location of the success redirect page
         */
        getSuccessRedirectAbsoluteUrl: function(successRedirectUrl) {
            if (successRedirectUrl) {
                var targetAnchorContainer = document.createElement('div'),
                    targetAnchor;

                if (qq.ie7()) {
                    // Note that we must make use of `innerHTML` for IE7 only instead of simply creating an anchor via
                    // `document.createElement('a')` and setting the `href` attribute.  The latter approach does not allow us to
                    // obtain an absolute URL in IE7 if the `endpoint` is a relative URL.
                    targetAnchorContainer.innerHTML = '<a href="' + successRedirectUrl + '"></a>';
                    targetAnchor = targetAnchorContainer.firstChild;
                    return targetAnchor.href;
                }
                else {
                    // IE8 and IE9 do not seem to derive an absolute URL from a relative URL using the `innerHTML`
                    // approach above, so we'll just create an anchor this way and set it's `href` attribute.
                    // Due to yet another quirk in IE8 and IE9, we have to set the `href` equal to itself
                    // in order to ensure relative URLs will be properly parsed.
                    targetAnchor = document.createElement('a');
                    targetAnchor.href = successRedirectUrl;
                    targetAnchor.href = targetAnchor.href;
                    return targetAnchor.href;
                }
            }
        }
    };
}());

/**
 * This defines FineUploaderBasic mode w/ support for uploading to S3, which provides all the basic
 * functionality of Fine Uploader Basic as well as code to handle uploads directly to S3.
 * Some inherited options and API methods have a special meaning in the context of the S3 uploader.
 */
qq.s3.FineUploaderBasic = function(o) {
    var options = {
        request: {
            // Making this configurable in the traditional uploader was probably a bad idea.
            // Let's just set this to "uuid" in the S3 uploader and not document the fact that this can be changed.
            uuidName: "uuid",

            signatureEndpoint: null,
            successEndpoint: null,
            accessKey: null,
            acl: 'private',

            // required if non-File-API browsers, such as IE9 and older, are used
            successRedirectEndpoint: null,

            // 'uuid', 'filename', or a function, which may be promissory
            key: 'uuid'
        },
        chunking: {
            // minimum part size is 5 MiB when uploading to S3
            partSize: 5242880
        },
        resume: {
            recordsExpireIn: 7 // days
        },
        cors: {
            allowXdr: true
        }
    };

    // Replace any default options with user defined ones
    qq.extend(options, o, true);

    // Call base module
    qq.FineUploaderBasic.call(this, options);
};

// Inherit basic public & private API methods.
qq.extend(qq.s3.FineUploaderBasic.prototype, qq.basePublicApi);
qq.extend(qq.s3.FineUploaderBasic.prototype, qq.basePrivateApi);

// Define public & private API methods for this module.
qq.extend(qq.s3.FineUploaderBasic.prototype, {
    /**
     * @param id File ID
     * @returns {*} Key name associated w/ the file, if one exists
     */
    getKey: function(id) {
        return this._handler.getThirdPartyFileId(id);
    },

    /**
     * Override the parent's reset function to cleanup various S3-related items.
     */
    reset: function() {
        qq.FineUploaderBasic.prototype.reset.call(this);
    },

    /**
     * Ensures the parent's upload handler creator passes any additional S3-specific options to the handler as well
     * as information required to instantiate the specific handler based on the current browser's capabilities.
     *
     * @returns {qq.UploadHandler}
     * @private
     */
    _createUploadHandler: function() {
        var additionalOptions = {
            getKeyName: qq.bind(this._determineKeyName, this),
            // pass size limit validation values to include in the request so AWS enforces this server-side
            validation: {
                minSizeLimit: this._options.validation.minSizeLimit,
                maxSizeLimit: this._options.validation.sizeLimit
            }
        };

        // We assume HTTP if it is missing from the start of the endpoint string.
        qq.override(this._endpointStore, function(super_) {
            return {
                getEndpoint: function(id) {
                    var endpoint = super_.getEndpoint(id);

                    if (endpoint.indexOf("http") < 0) {
                        return "http://" + endpoint;
                    }

                    return endpoint;
                }
            }
        });

        return qq.FineUploaderBasic.prototype._createUploadHandler.call(this, additionalOptions, "s3");
    },

    /**
     * Determine the file's key name and passes it to the caller via a promissory callback.  This also may
     * delegate to an integrator-defined function that determines the file's key name on demand,
     * which also may be promissory.
     *
     * @param id ID of the file
     * @param filename Name of the file
     * @returns {qq.Promise} A promise that will be fulfilled when the key name has been determined (and will be passed to the caller via the success callback).
     * @private
     */
    _determineKeyName: function(id, filename) {
        var self = this,
            promise = new qq.Promise(),
            keynameLogic = this._options.request.key,
            extension = qq.getExtension(filename),
            onGetKeynameFailure = promise.failure,
            onGetKeynameSuccess = function(keyname, extension) {
                var keynameToUse = keyname;

                if (extension !== undefined) {
                    keynameToUse += "." + extension;
                }

                promise.success(keynameToUse);
            };

        switch(keynameLogic) {
            case 'uuid':
                onGetKeynameSuccess(this.getUuid(id), extension);
                break;
            case 'filename':
                onGetKeynameSuccess(filename);
                break;
            default:
                if (qq.isFunction(keynameLogic)) {
                    this._handleKeynameFunction(keynameLogic, id, onGetKeynameSuccess, onGetKeynameFailure);
                }
                else {
                    this.log(keynameLogic + " is not a valid value for the s3.keyname option!", "error");
                    onGetKeynameFailure();
                }
        }

        return promise;
    },

    /**
     * Called by the internal onUpload handler if the integrator has supplied a function to determine
     * the file's key name.  The integrator's function may be promissory.  We also need to fulfill
     * the promise contract associated with the caller as well.
     *
     * @param keynameFunc Integrator-supplied function that must be executed to determine the key name.  May be promissory.
     * @param id ID of the associated file
     * @param successCallback Invoke this if key name retrieval is successful, passing in the key name.
     * @param failureCallback Invoke this if key name retrieval was unsuccessful.
     * @private
     */
    _handleKeynameFunction: function(keynameFunc, id, successCallback, failureCallback) {
        var onSuccess = function(keyname) {
                successCallback(keyname);
            },
            onFailure = function() {
                this.log('Failed to retrieve key name for ' + id, "error");
                failureCallback();
            },
            keyname = keynameFunc(id);


        if (qq.isPromise(keyname)) {
            keyname.then(onSuccess, onFailure);
        }
        else if (keyname == null) {
            onFailure();
        }
        else {
            onSuccess(keyname)
        }
    },

    /**
     * When the upload has completed, if it is successful, send a request to the `successEndpoint` (if defined).
     * This will hold up the call to the `onComplete` callback until we have determined success of the upload to S3
     * according to the local server, if a `successEndpoint` has been defined by the integrator.
     *
     * @param id ID of the completed upload
     * @param name Name of the associated item
     * @param result Object created from the server's parsed JSON response.
     * @param xhr Associated XmlHttpRequest, if this was used to send the request.
     * @returns {boolean || qq.Promise} true/false if success can be determined immediately, otherwise a `qq.Promise`
     * if we need to ask the server.
     * @private
     */
    _onComplete: function(id, name, result, xhr) {
        var success = result.success ? true : false,
            self = this,
            onCompleteArgs = arguments,
            key = this.getKey(id),
            successEndpoint = this._options.request.successEndpoint,
            cors = this._options.cors,
            uuid = this.getUuid(id),
            bucket = qq.s3.util.getBucket(this._endpointStore.getEndpoint(id)),
            promise = new qq.Promise(),

            // If we are waiting for confirmation from the local server, and have received it,
            // include properties from the local server response in the `response` parameter
            // sent to the `onComplete` callback, delegate to the parent `_onComplete`, and
            // fulfill the associated promise.
            onSuccessFromServer = function(awsSuccessRequestResult) {
                qq.extend(result, awsSuccessRequestResult);
                qq.FineUploaderBasic.prototype._onComplete.apply(self, onCompleteArgs);
                promise.success(awsSuccessRequestResult);
            },
            onFailureFromServer = function(awsSuccessRequestResult) {
                qq.extend(result, awsSuccessRequestResult);

                // The server might not want the user to be able to re-send the file.
                if (result[self._options.retry.preventRetryResponseProperty]) {
                    self._preventRetries[id] = true;
                }

                qq.FineUploaderBasic.prototype._onComplete.apply(self, onCompleteArgs);
                promise.failure(awsSuccessRequestResult);
            },

            successAjaxRequestor;

        // Ask the local server if the file sent to S3 is ok.
        if (success && successEndpoint) {
            successAjaxRequestor = new qq.s3.UploadSuccessAjaxRequester({
                endpoint: successEndpoint,
                cors: cors,
                log: qq.bind(this.log, this)
            });

            successAjaxRequestor.sendSuccessRequest(id, {
                key: key,
                uuid: uuid,
                name: name,
                bucket: bucket
            })
                .then(onSuccessFromServer, onFailureFromServer);

            return promise;
        }

        // If we are not asking the local server about the file in S3, just delegate to the parent `_onComplete`.
        return qq.FineUploaderBasic.prototype._onComplete.apply(this, arguments);
    },

    // Hooks into the base internal `_onSubmitDelete` to add key and bucket params to the delete file request.
    _onSubmitDelete: function(id, onSuccessCallback) {
        var additionalMandatedParams = {
            key: this.getKey(id),
            bucket: qq.s3.util.getBucket(this._endpointStore.getEndpoint(id))
        };

        qq.FineUploaderBasic.prototype._onSubmitDelete.call(this, id, onSuccessCallback, additionalMandatedParams);
    }
});

/**
 * This defines FineUploader mode w/ support for uploading to S3, which provides all the basic
 * functionality of Fine Uploader as well as code to handle uploads directly to S3.
 * This module inherits all logic from FineUploader mode and FineUploaderBasicS3 mode and adds some UI-related logic
 * specific to the upload-to-S3 workflow.  Some inherited options and API methods have a special meaning
 * in the context of the S3 uploader.
 */
qq.s3.FineUploader = function(o) {
    var options = {
        failedUploadTextDisplay: {
            mode: 'custom'
        }
    };

    // Replace any default options with user defined ones
    qq.extend(options, o, true);

    // Inherit instance data from FineUploader, which should in turn inherit from s3.FineUploaderBasic.
    qq.FineUploader.call(this, options, "s3");

    if (!qq.supportedFeatures.ajaxUploading && options.request.successRedirectEndpoint === undefined) {
        this._options.element.innerHTML = "<div>You MUST set the <code>successRedirectEndpoint</code> property " +
            "of the <code>request</code> option since this browser does not support the File API!</div>"
    }
};

// Inherit the API methods from FineUploaderBasicS3
qq.extend(qq.s3.FineUploader.prototype, qq.s3.FineUploaderBasic.prototype);

// Inherit public and private API methods related to UI
qq.extend(qq.s3.FineUploader.prototype, qq.uiPublicApi);
qq.extend(qq.s3.FineUploader.prototype, qq.uiPrivateApi);

// Define public & private API methods for this module.
qq.extend(qq.s3.FineUploader.prototype, {
    /**
     * When the upload has completed, change the visible status to "processing" if we are expecting an async operation to
     * determine status of the file in S3.
     *
     * @param id ID of the completed upload
     * @param name Name of the associated item
     * @param result Object created from the server's parsed JSON response.
     * @param xhr Associated XmlHttpRequest, if this was used to send the request.
     * @returns {boolean || qq.Promise} true/false if success can be determined immediately, otherwise a `qq.Promise`
     * if we need to ask the server.
     * @private
     */
    _onComplete: function(id, name, result, xhr) {
        var parentRetVal = qq.FineUploader.prototype._onComplete.apply(this, arguments),
            item = this.getItemByFileId(id),
            progressBar = this._find(item, 'progressBar');

        if (qq.isPromise(parentRetVal)) {
            qq(progressBar).hide();
            qq(this._find(item, 'statusText')).setText(this._options.text.waitingForResponse);
        }

        return parentRetVal;
    }
});

/*globals qq*/
/**
 * Sends a POST request to the server in an attempt to solicit signatures for various S3-related requests.  This include
 * (but are not limited to) HTML Form Upload requests and Multipart Uploader requests (via the S3 REST API).
 * This module also parses the response and attempts to determine if the effort was successful.
 *
 * @param o Options associated with all such requests
 * @returns {{getSignature: Function}} API method used to initiate the signature request.
 * @constructor
 */
qq.s3.SignatureAjaxRequestor = function(o) {
    "use strict";

    var requester,
        pendingSignatures = {},
        options = {
            expectingPolicy: false,
            method: "POST",
            endpoint: null,
            maxConnections: 3,
            customHeaders: {},
            paramsStore: {},
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {}
        };

    qq.extend(options, o);

    function handleSignatureReceived(id, xhrOrXdr, isError) {
        var responseJson = xhrOrXdr.responseText,
            pendingSignatureData = pendingSignatures[id],
            expectingPolicy = pendingSignatureData.expectingPolicy,
            promise = pendingSignatureData.promise,
            errorMessage, response;

        delete pendingSignatures[id];

        // Attempt to parse what we would expect to be a JSON response
        if (responseJson) {
            try {
                response = qq.parseJson(responseJson);
            }
            catch (error) {
                options.log('Error attempting to parse signature response: ' + error, "error");
            }
        }

        // If we have received a parsable response, and it has an `invalid` property,
        // the policy document or request headers may have been tampered with client-side.
        if (response && response.invalid) {
            isError = true;
            errorMessage = "Invalid policy document or request headers!";
        }
        // Make sure the response contains policy & signature properties
        else if (response) {
            if (expectingPolicy && !response.policy) {
                isError = true;
                errorMessage = "Response does not include the base64 encoded policy!";
            }
            else if (!response.signature) {
                isError = true;
                errorMessage = "Response does not include the signature!";
            }
        }
        // Something unknown went wrong
        else {
            isError = true;
            errorMessage = "Received an empty or invalid response from the server!";
        }

        if (isError) {
            if (errorMessage) {
                options.log(errorMessage, "error");
            }

            promise.failure(errorMessage);
        }
        else {
            promise.success(response);
        }
    }

    requester = new qq.AjaxRequestor({
        method: options.method,
        contentType: "application/json; charset=utf-8",
        endpointStore: {
            getEndpoint: function() {
                return options.endpoint;
            }
        },
        paramsStore: options.paramsStore,
        maxConnections: options.maxConnections,
        customHeaders: options.customHeaders,
        log: options.log,
        onComplete: handleSignatureReceived,
        cors: options.cors,
        successfulResponseCodes: {
            POST: [200]
        }
    });


    return {
        /**
         * On success, an object containing the parsed JSON response will be passed into the success handler if the
         * request succeeds.  Otherwise an error message will be passed into the failure method.
         *
         * @param id File ID.
         * @param toBeSigned an Object that holds the item(s) to be signed
         * @returns {qq.Promise} A promise that is fulfilled when the response has been received.
         */
        getSignature: function(id, toBeSigned) {
            var params = toBeSigned,
                promise = new qq.Promise();

            options.log("Submitting S3 signature request for " + id);

            requester.send(id, null, params);
            pendingSignatures[id] = {
                promise: promise,
                expectingPolicy: options.expectingPolicy
            };

            return promise;
        }
    };
};

/*globals qq, XMLHttpRequest*/
/**
 * Sends a POST request to the server to notify it of a successful upload to S3.  The server is expected to indicate success
 * or failure via the response status.  Specific information about the failure can be passed from the server via an `error`
 * property (by default) in an "application/json" response.
 *
 * @param o Options associated with all requests.
 * @returns {{sendSuccessRequest: Function}} API method used to initiate the request.
 * @constructor
 */
qq.s3.UploadSuccessAjaxRequester = function(o) {
    "use strict";

    var requester,
        pendingRequests = [],
        options = {
            method: "POST",
            endpoint: null,
            maxConnections: 3,
            customHeaders: {},
            paramsStore: {},
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {}
        };

    qq.extend(options, o);

    function handleSuccessResponse(id, xhrOrXdr, isError) {
        var promise = pendingRequests[id],
            responseJson = xhrOrXdr.responseText,
            successIndicator = {success: true},
            failureIndicator = {success: false},
            parsedResponse;

        delete pendingRequests[id];

        options.log(qq.format("Received the following response body to an AWS upload success request for id {}: {}", id, responseJson));

        try {
            parsedResponse = qq.parseJson(responseJson);

            // If this is a cross-origin request, the server may return a 200 response w/ error or success properties
            // in order to ensure any specific error message is picked up by Fine Uploader for all browsers,
            // since XDomainRequest (used in IE9 and IE8) doesn't give you access to the
            // response body for an "error" response.
            if (isError || (parsedResponse && (parsedResponse.error || parsedResponse.success === false))) {
                options.log('Upload success request was rejected by the server.', 'error');
                promise.failure(qq.extend(parsedResponse, failureIndicator));
            }
            else {
                options.log('Upload success was acknowledged by the server.');
                promise.success(qq.extend(parsedResponse, successIndicator));
            }
        }
        catch (error) {
            // This will be executed if a JSON response is not present.  This is not mandatory, so account for this properly.
            if (isError) {
                options.log(qq.format('Your server indicated failure in its AWS upload success request response for id {}!', id), 'error');
                promise.failure(failureIndicator);
            }
            else {
                options.log('Upload success was acknowledged by the server.');
                promise.success(successIndicator);
            }
        }
    }

    requester = new qq.AjaxRequestor({
        method: options.method,
        endpointStore: {
            getEndpoint: function() {
                return options.endpoint;
            }
        },
        paramsStore: options.paramsStore,
        maxConnections: options.maxConnections,
        customHeaders: options.customHeaders,
        log: options.log,
        onComplete: handleSuccessResponse,
        cors: options.cors,
        successfulResponseCodes: {
            POST: [200]
        }
    });


    return {
        /**
         * Sends a request to the server, notifying it that a recently submitted file was successfully sent to S3.
         *
         * @param id ID of the associated file
         * @param spec `Object` with the properties that correspond to important values that we want to
         * send to the server with this request.
         * @returns {qq.Promise} A promise to be fulfilled when the response has been received and parsed.  The parsed
         * payload of the response will be passed into the `failure` or `success` promise method.
         */
        sendSuccessRequest: function(id, spec) {
            var promise = new qq.Promise();

            options.log("Submitting upload success request/notification for " + id);
            requester.send(id, null, spec);
            pendingRequests[id] = promise;

            return promise;
        }
    };
};

/*globals qq*/
/**
 * Ajax requester used to send an ["Initiate Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadInitiate.html)
 * request to S3 via the REST API.
 *
 * @param o Options from the caller - will override the defaults.
 * @returns {{send: Function}}
 * @constructor
 */
qq.s3.InitiateMultipartAjaxRequester = function(o) {
    "use strict";

    var requester,
        pendingInitiateRequests = {},
        options = {
            filenameParam: "qqfilename",
            method: "POST",
            endpointStore: null,
            paramsStore: null,
            signatureEndpoint: null,
            accessKey: null,
            acl: "private",
            maxConnections: 3,
            getContentType: function(id) {},
            getKey: function(id) {},
            getName: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    getSignatureAjaxRequester = new qq.s3.SignatureAjaxRequestor({
        endpoint: options.signatureEndpoint,
        cors: options.cors,
        log: options.log
    });


    /**
     * Determine all headers for the "Initiate MPU" request, including the "Authorization" header, which must be determined
     * by the local server.  This is a promissory function.  If the server responds with a signature, the headers
     * (including the Authorization header) will be passed into the success method of the promise.  Otherwise, the failure
     * method on the promise will be called.
     *
     * @param id Associated file ID
     * @returns {qq.Promise}
     */
    function getHeaders(id) {
        var bucket = qq.s3.util.getBucket(options.endpointStore.getEndpoint(id)),
            headers = {},
            promise = new qq.Promise(),
            key = options.getKey(id),
            toSign;

        headers["x-amz-date"] = new Date().toUTCString();
        headers["Content-Type"] = options.getContentType(id);
        headers["x-amz-acl"] = options.acl;
        headers[qq.s3.util.AWS_PARAM_PREFIX + options.filenameParam] = encodeURIComponent(options.getName(id));

        qq.each(options.paramsStore.getParams(id), function(name, val) {
            headers[qq.s3.util.AWS_PARAM_PREFIX + name] = encodeURIComponent(val);
        });

        toSign = {headers: getStringToSign(headers, bucket, key)};

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, toSign).then(function(response) {
            headers.Authorization = "AWS " + options.accessKey + ":" + response.signature;
            promise.success(headers);
        }, promise.failure);

        return promise;
    }

    /**
     * @param headers All headers to be sent with the initiate request
     * @param bucket Bucket where the file parts will reside
     * @param key S3 Object name for the file
     * @returns {string} The string that must be signed by the local server before sending the initiate request
     */
    function getStringToSign(headers, bucket, key) {
        var headerNames = [],
            headersAsString = "";

        qq.each(headers, function(name, val) {
            if (name !== "Content-Type") {
                headerNames.push(name);
            }
        });

        headerNames.sort();

        qq.each(headerNames, function(idx, name) {
            headersAsString += name + ":" + headers[name] + "\n";
        });

        return "POST\n\n" + headers["Content-Type"] + "\n\n" + headersAsString + "/" + bucket + "/" + key + "?uploads";
    }


    /**
     * Called by the base ajax requester when the response has been received.  We definitively determine here if the
     * "Initiate MPU" request has been a success or not.
     *
     * @param id ID associated with the file.
     * @param xhr `XMLHttpRequest` object containing the response, among other things.
     * @param isError A boolean indicating success or failure according to the base ajax requester (primarily based on status code).
     */
    function handleInitiateRequestComplete(id, xhr, isError) {
        var promise = pendingInitiateRequests[id],
            domParser = new DOMParser(),
            responseDoc = domParser.parseFromString(xhr.responseText, "application/xml"),
            uploadIdElements, messageElements, uploadId, errorMessage, status;

        delete pendingInitiateRequests[id];

        // The base ajax requester may declare the request to be a failure based on status code.
        if (isError) {
            status = xhr.status;

            messageElements = responseDoc.getElementsByTagName("Message");
            if (messageElements.length > 0) {
                errorMessage = messageElements[0].textContent;
            }
        }
        // If the base ajax requester has not declared this a failure, make sure we can retrieve the uploadId from the response.
        else {
            uploadIdElements = responseDoc.getElementsByTagName("UploadId");
            if (uploadIdElements.length > 0) {
                uploadId = uploadIdElements[0].textContent;
            }
            else {
                errorMessage = "Upload ID missing from request";
            }
        }

        // Either fail the promise (passing a descriptive error message) or declare it a success (passing the upload ID)
        if (uploadId === undefined) {
            if (errorMessage) {
                options.log(qq.format("Specific problem detected initiating multipart upload request for {}: '{}'.", id, errorMessage), "error");
            }
            else {
                options.log(qq.format("Unexplained error with initiate multipart upload request for {}.  Status code {}.", id, status), "error");
            }

            promise.failure("Problem initiating upload request with Amazon.", xhr);
        }
        else {
            options.log(qq.format("Initiate multipart upload request successful for {}.  Upload ID is {}", id, uploadId));
            promise.success(uploadId, xhr);
        }
    }

    requester = new qq.AjaxRequestor({
        method: options.method,
        contentType: null,
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        log: options.log,
        onComplete: handleInitiateRequestComplete,
        successfulResponseCodes: {
            POST: [200]
        }
    });


    return {
        /**
         * Sends the "Initiate MPU" request to AWS via the REST API.  First, though, we must get a signature from the
         * local server for the request.  If all is successful, the uploadId from AWS will be passed into the promise's
         * success handler. Otherwise, an error message will ultimately be passed into the failure method.
         *
         * @param id The ID associated with the file
         * @returns {qq.Promise}
         */
        send: function(id) {
            var promise = new qq.Promise(),
                addToPath = options.getKey(id) + "?uploads";

            getHeaders(id).then(function(headers) {
                options.log("Submitting S3 initiate multipart upload request for " + id);

                pendingInitiateRequests[id] = promise;
                requester.send(id, addToPath, null, headers);
            }, promise.failure);

            return promise;
        }
    };
};

/*globals qq*/
/**
 * Ajax requester used to send an ["Complete Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html)
 * request to S3 via the REST API.
 *
 * @param o Options passed by the creator, to overwrite any default option values.
 * @returns {{send: Function}} Used to send the request.
 * @constructor
 */
qq.s3.CompleteMultipartAjaxRequester = function(o) {
    "use strict";

    var requester,
        pendingCompleteRequests = {},
        options = {
            method: "POST",
            endpointStore: null,
            signatureEndpoint: null,
            accessKey: null,
            maxConnections: 3,
            getKey: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    // Transport for requesting signatures (for the "Complete" requests) from the local server
    getSignatureAjaxRequester = new qq.s3.SignatureAjaxRequestor({
        endpoint: options.signatureEndpoint,
        cors: options.cors,
        log: options.log
    });

    /**
     * Attach all required headers (including Authorization) to the "Complete" request.  This is a promissory function
     * that will fulfill the associated promise once all headers have been attached or when an error has occurred that
     * prevents headers from being attached.
     *
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @returns {qq.Promise}
     */
    function getHeaders(id, uploadId) {
        var headers = {},
            promise = new qq.Promise(),
            toSign;

        headers["x-amz-date"] = new Date().toUTCString();

        toSign = {headers: getStringToSign(id, uploadId, headers["x-amz-date"])};

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, toSign).then(function(response) {
            headers.Authorization = "AWS " + options.accessKey + ":" + response.signature;
            promise.success(headers);
        }, promise.failure);

        return promise;
    }

    /**
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @param utcDateStr The date, formatted as a UTC string
     * @returns {string} A string that must be signed by the local server in order to send the associated "Complete" request.
     */
    function getStringToSign(id, uploadId, utcDateStr) {
        var endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint),
            endOfUrl = getEndOfUrl(id, uploadId);

        return "POST" +
            "\n\n" +
            "application/xml; charset=UTF-8" +
            "\n\n" +
            "x-amz-date:" + utcDateStr +
            "\n" +
            "/" + bucket + "/" + endOfUrl;
    }

    /**
     * Called by the base ajax requester when the response has been received.  We definitively determine here if the
     * "Complete MPU" request has been a success or not.
     *
     * @param id ID associated with the file.
     * @param xhr `XMLHttpRequest` object containing the response, among other things.
     * @param isError A boolean indicating success or failure according to the base ajax requester (primarily based on status code).
     */
    function handleCompleteRequestComplete(id, xhr, isError) {
        var promise = pendingCompleteRequests[id],
            domParser = new DOMParser(),
            endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint),
            key = options.getKey(id),
            responseDoc = domParser.parseFromString(xhr.responseText, "application/xml"),
            bucketEls = responseDoc.getElementsByTagName("Bucket"),
            keyEls = responseDoc.getElementsByTagName("Key");

        delete pendingCompleteRequests[id];

        options.log(qq.format("Complete response status {}, body = {}", xhr.status, xhr.responseText));

        // If the base requester has determine this a failure, give up.
        if (isError) {
            options.log(qq.format("Complete Multipart Upload request for {} failed with status {}.", id, xhr.status), "error");
        }
        else {
            // Make sure the correct bucket and key has been specified in the XML response from AWS.
            if (bucketEls.length && keyEls.length) {
                if (bucketEls[0].textContent !== bucket) {
                    isError = true;
                    options.log(qq.format("Wrong bucket in response to Complete Multipart Upload request for {}.", id), "error");
                }
                if (keyEls[0].textContent !== key) {
                    isError = true;
                    options.log(qq.format("Wrong key in response to Complete Multipart Upload request for {}.", id), "error");
                }
            }
            else {
                isError = true;
                options.log(qq.format("Missing bucket and/or key in response to Complete Multipart Upload request for {}.", id), "error");
            }
        }

        if (isError) {
            promise.failure("Problem asking Amazon to combine the parts!", xhr);
        }
        else {
            promise.success(xhr);
        }
    }

    /**
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @returns {String} The last part of the URL where we will send this request.  Includes the resource (key) and any params.
     */
    function getEndOfUrl(id, uploadId) {
        return qq.format("{}?uploadId={}", options.getKey(id), uploadId);
    }

    /**
     * @param etagEntries Array of objects containing `etag` values and their associated `part` numbers.
     * @returns {string} XML string containing the body to send with the "Complete" request
     */
    function getCompleteRequestBody(etagEntries) {
        var doc = document.implementation.createDocument(null, "CompleteMultipartUpload", null);

        // Construct an XML document for each pair of etag/part values that correspond to part uploads.
        qq.each(etagEntries, function(idx, etagEntry) {
            var part = etagEntry.part,
                etag = etagEntry.etag,
                partEl = doc.createElement("Part"),
                partNumEl = doc.createElement("PartNumber"),
                partNumTextEl = doc.createTextNode(part),
                etagTextEl = doc.createTextNode(etag),
                etagEl = doc.createElement("ETag");

            etagEl.appendChild(etagTextEl);
            partNumEl.appendChild(partNumTextEl);
            partEl.appendChild(partNumEl);
            partEl.appendChild(etagEl);
            qq(doc).children()[0].appendChild(partEl);
        });

        // Turn the resulting XML document into a string fit for transport.
        return new XMLSerializer().serializeToString(doc);
    }

    requester = new qq.AjaxRequestor({
        method: options.method,
        contentType: "application/xml; charset=UTF-8",
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        log: options.log,
        onComplete: handleCompleteRequestComplete,
        successfulResponseCodes: {
            POST: [200]
        }
    });


    return {
        /**
         * Sends the "Complete" request and fulfills the returned promise when the success of this request is known.
         *
         * @param id ID associated with the file.
         * @param uploadId AWS uploadId for this file
         * @param etagEntries Array of objects containing `etag` values and their associated `part` numbers.
         * @returns {qq.Promise}
         */
        send: function(id, uploadId, etagEntries) {
            var promise = new qq.Promise();

            getHeaders(id, uploadId).then(function(headers) {
                var body = getCompleteRequestBody(etagEntries);

                options.log("Submitting S3 complete multipart upload request for " + id);

                pendingCompleteRequests[id] = promise;
                requester.send(id, getEndOfUrl(id, uploadId), null, headers, body);
            }, promise.failure);

            return promise;
        }
    };
};

/**
 * Ajax requester used to send an ["Abort Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadAbort.html)
 * request to S3 via the REST API.

 * @param o
 * @returns {{send: Function}}
 * @constructor
 */
qq.s3.AbortMultipartAjaxRequester = function(o) {
    "use strict";

    var requester,
        options = {
            method: "DELETE",
            endpointStore: null,
            signatureEndpoint: null,
            accessKey: null,
            maxConnections: 3,
            getKey: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    // Transport for requesting signatures (for the "Complete" requests) from the local server
    getSignatureAjaxRequester = new qq.s3.SignatureAjaxRequestor({
        endpoint: options.signatureEndpoint,
        cors: options.cors,
        log: options.log
    });

    /**
     * Attach all required headers (including Authorization) to the "Abort" request.  This is a promissory function
     * that will fulfill the associated promise once all headers have been attached or when an error has occurred that
     * prevents headers from being attached.
     *
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @returns {qq.Promise}
     */
    function getHeaders(id, uploadId) {
        var headers = {},
            promise = new qq.Promise(),
            toSign;

        headers["x-amz-date"] = new Date().toUTCString();

        toSign = {headers: getStringToSign(id, uploadId, headers["x-amz-date"])};

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, toSign).then(function(response) {
            headers.Authorization = "AWS " + options.accessKey + ":" + response.signature;
            promise.success(headers);
        }, promise.failure);

        return promise;
    }

    /**
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @param utcDateStr The date, formatted as a UTC string
     * @returns {string} A string that must be signed by the local server in order to send the associated "Abort" request.
     */
    function getStringToSign(id, uploadId, utcDateStr) {
        var endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint),
            endOfUrl = getEndOfUrl(id, uploadId);

        return "DELETE" +
            "\n\n\n\n" +
            "x-amz-date:" + utcDateStr +
            "\n" +
            "/" + bucket + "/" + endOfUrl;
    }

    /**
     * Called by the base ajax requester when the response has been received.  We definitively determine here if the
     * "Abort MPU" request has been a success or not.
     *
     * @param id ID associated with the file.
     * @param xhr `XMLHttpRequest` object containing the response, among other things.
     * @param isError A boolean indicating success or failure according to the base ajax requester (primarily based on status code).
     */
    function handleAbortRequestComplete(id, xhr, isError) {
        var domParser = new DOMParser(),
            responseDoc = domParser.parseFromString(xhr.responseText, "application/xml"),
            errorEls = responseDoc.getElementsByTagName("Error"),
            awsErrorMsg;


        options.log(qq.format("Abort response status {}, body = {}", xhr.status, xhr.responseText));

        // If the base requester has determine this a failure, give up.
        if (isError) {
            options.log(qq.format("Abort Multipart Upload request for {} failed with status {}.", id, xhr.status), "error");
        }
        else {
            // Make sure the correct bucket and key has been specified in the XML response from AWS.
            if (errorEls.length) {
                isError = true;
                awsErrorMsg = responseDoc.getElementsByTagName("Message")[0].textContent;
                options.log(qq.format("Failed to Abort Multipart Upload request for {}.  Error: {}", id, awsErrorMsg), "error");
            }
            else {
                options.log(qq.format("Abort MPU request succeeded for file ID {}.", id));
            }
        }
    }

    /**
     * @param id Associated file ID
     * @param uploadId ID of the associated upload, according to AWS
     * @returns {String} The last part of the URL where we will send this request.  Includes the resource (key) and any params.
     */
    function getEndOfUrl(id, uploadId) {
        return qq.format("{}?uploadId={}", options.getKey(id), uploadId);
    }


    requester = new qq.AjaxRequestor({
        validMethods: ["DELETE"],
        method: options.method,
        contentType: null,
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        log: options.log,
        onComplete: handleAbortRequestComplete,
        successfulResponseCodes: {
            DELETE: [204]
        }
    });


    return {
        /**
         * Sends the "Abort" request.
         *
         * @param id ID associated with the file.
         * @param uploadId AWS uploadId for this file
         */
        send: function(id, uploadId) {
            var endOfUrl = getEndOfUrl(id, uploadId);

            getHeaders(id, uploadId).then(function(headers) {
                options.log("Submitting S3 Abort multipart upload request for " + id);

                requester.send(id, endOfUrl, null, headers);
            });
        }
    };
};

/**
 * Upload handler used by the upload to S3 module that depends on File API support, and, therefore, makes use of
 * `XMLHttpRequest` level 2 to upload `File`s and `Blob`s directly to S3 buckets via the associated AWS API.
 *
 * If chunking is supported and enabled, the S3 Multipart Upload REST API is utilized.
 *
 * @param options Options passed from the base handler
 * @param uploadCompleteCallback Callback to invoke when the upload has completed, regardless of success.
 * @param onUuidChanged Callback to invoke when the associated items UUID has changed by order of the server.
 * @param logCallback Used to posting log messages.
 */
qq.s3.UploadHandlerXhr = function(options, uploadCompleteCallback, onUuidChanged, log) {
    "use strict";

    var fileState = [],
        expectedStatus = 200,
        onProgress = options.onProgress,
        onComplete = options.onComplete,
        onUpload = options.onUpload,
        onGetKeyName = options.getKeyName,
        filenameParam = options.filenameParam,
        paramsStore = options.paramsStore,
        endpointStore = options.endpointStore,
        accessKey = options.accessKey,
        acl = options.acl,
        validation = options.validation,
        chunkingPossible = options.chunking.enabled && qq.supportedFeatures.chunking,
        resumeEnabled = options.resume.enabled && chunkingPossible && qq.supportedFeatures.resume && window.localStorage !== undefined,
        internalApi = {},
        publicApi,
        policySignatureRequester = new qq.s3.SignatureAjaxRequestor({
            expectingPolicy: true,
            endpoint: options.signatureEndpoint,
            cors: options.cors,
            log: log
        }),
        restSignatureRequester = new qq.s3.SignatureAjaxRequestor({
            endpoint: options.signatureEndpoint,
            cors: options.cors,
            log: log
        }),
        initiateMultipartRequester = new qq.s3.InitiateMultipartAjaxRequester({
            filenameParam: filenameParam,
            endpointStore: endpointStore,
            paramsStore: paramsStore,
            signatureEndpoint: options.signatureEndpoint,
            accessKey: options.accessKey,
            acl: options.acl,
            cors: options.cors,
            log: log,
            getContentType: function(id) {
                return publicApi.getFile(id).type;
            },
            getKey: function(id) {
                return getUrlSafeKey(id);
            },
            getName: function(id) {
                return publicApi.getName(id);
            }
        }),
        completeMultipartRequester = new qq.s3.CompleteMultipartAjaxRequester({
            endpointStore: endpointStore,
            signatureEndpoint: options.signatureEndpoint,
            accessKey: options.accessKey,
            cors: options.cors,
            log: log,
            getKey: function(id) {
                return getUrlSafeKey(id);
            }
        }),
        abortMultipartRequester = new qq.s3.AbortMultipartAjaxRequester({
            endpointStore: endpointStore,
            signatureEndpoint: options.signatureEndpoint,
            accessKey: options.accessKey,
            cors: options.cors,
            log: log,
            getKey: function(id) {
                return getUrlSafeKey(id);
            }
        });


// ************************** Shared ******************************

    function getUrlSafeKey(id) {
        return encodeURIComponent(getActualKey(id));
    }

    function getActualKey(id) {
        return fileState[id].key;
    }

    function setKey(id, key) {
        fileState[id].key = key;
    }

    /**
     * Initiate the upload process and possibly delegate to a more specific handler if chunking is required.
     *
     * @param id Associated file ID
     */
    function handleUpload(id) {
        var fileOrBlob = publicApi.getFile(id);

        fileState[id].type = fileOrBlob.type;

        internalApi.createXhr(id);

        if (shouldChunkThisFile(id)) {
            // We might be retrying a failed in-progress upload, so it's important that we
            // don't reset this value so we don't wipe out the record of all successfully
            // uploaded chunks for this file.
            if (fileState[id].loaded === undefined) {
                fileState[id].loaded = 0;
            }

            handleChunkedUpload(id);
        }
        else {
            fileState[id].loaded = 0;
            handleSimpleUpload(id);
        }
    }

    function getReadyStateChangeHandler(id) {
        var xhr = fileState[id].xhr;

        return function() {
            if (xhr.readyState === 4) {
                if (fileState[id].chunking.enabled) {
                    uploadChunkCompleted(id);
                }
                else {
                    uploadCompleted(id);
                }
            }
        };
    }

    // Determine if the upload should be restarted on the next retry attempt
    // based on the error code returned in the response from AWS.
    function shouldResetOnRetry(errorCode) {
        return errorCode === "EntityTooSmall"
            || errorCode === "InvalidPart"
            || errorCode === "InvalidPartOrder"
            || errorCode === "NoSuchUpload";
    }

    /**
     * Note that this is called when an upload has reached a termination point,
     * regardless of success/failure.  For example, it is called when we have
     * encountered an error during the upload or when the file may have uploaded successfully.
     *
     * @param id file ID
     * @param errorDetails Any error details associated with the upload.  Format: {error: message}.
     * @param requestXhr The XHR object associated with the call, if the upload XHR is not appropriate.
     */
    function uploadCompleted(id, errorDetails, requestXhr) {
        var xhr = requestXhr || fileState[id].xhr,
            name = publicApi.getName(id),
            size = publicApi.getSize(id),
            // This is the response we will use internally to determine if we need to do something special in case of a failure
            responseToExamine = parseResponse(id, requestXhr),
            // This is the response we plan on passing to external callbacks
            responseToBubble = errorDetails || parseResponse(id);

        // If this upload failed, we might want to completely start the upload over on retry in some cases.
        if (!responseToExamine.success) {
            if (shouldResetOnRetry(responseToExamine.code)) {
                log('This is an unrecoverable error, we must restart the upload entirely on the next retry attempt.', 'error');
                maybeDeletePersistedChunkData(id);
                delete fileState[id].loaded;
                delete fileState[id].chunking;
            }
        }

        // If this upload failed AND we are expecting an auto-retry, we are not done yet.
        if (responseToExamine.success || !options.onAutoRetry(id, name, responseToBubble, xhr)) {
            log(qq.format("Upload attempt for file ID {} to S3 is complete", id));

            if (responseToExamine.success) {
                responseToBubble.success = true;
            }

            onProgress(id, name, size, size);
            onComplete(id, name, responseToBubble, xhr);

            if (fileState[id]) {
                delete fileState[id].xhr;
            }

            if (responseToExamine.success) {
                maybeDeletePersistedChunkData(id);
            }

            uploadCompleteCallback(id);
        }
    }

    /**
     * @param id File ID
     * @param requestXhr The XHR object associated with the call, if the upload XHR is not appropriate.
     * @returns {object} Object containing the parsed response, or perhaps some error data injected in `error` and `code` properties
     */
    function parseResponse(id, requestXhr) {
        var xhr = requestXhr || fileState[id].xhr,
            response = {},
            parsedErrorProps;

        try {
            log(qq.format("Received response status {} with body: {}", xhr.status, xhr.responseText));

            if (xhr.status === expectedStatus) {
                response.success = true;
            }
            else {
                parsedErrorProps = parseError(xhr.responseText);

                if (parsedErrorProps) {
                    response.error = parsedErrorProps.message;
                    response.code = parsedErrorProps.code;
                }
            }
        }
        catch(error) {
            log('Error when attempting to parse xhr response text (' + error.message + ')', 'error');
        }

        return response;
    }

    /**
     * This parses an XML response by extracting the "Message" and "Code" elements that accompany AWS error responses.
     *
     * @param awsResponseXml XML response from AWS
     * @returns {object} Object w/ `code` and `message` properties, or undefined if we couldn't find error info in the XML document.
     */
    function parseError(awsResponseXml) {
        var parser = new DOMParser(),
            parsedDoc = parser.parseFromString(awsResponseXml, "application/xml"),
            errorEls = parsedDoc.getElementsByTagName("Error"),
            errorDetails = {},
            codeEls, messageEls;

        if (errorEls.length) {
            codeEls = parsedDoc.getElementsByTagName("Code");
            messageEls = parsedDoc.getElementsByTagName("Message");

            if (messageEls.length) {
                errorDetails.message = messageEls[0].textContent;
            }

            if (codeEls.length) {
                errorDetails.code = codeEls[0].textContent;
            }

            return errorDetails;
        }
    }

    function handleStartUploadSignal(id, retry) {
        var name = publicApi.getName(id);

        if (publicApi.isValid(id)) {
            maybePrepareForResume(id);

            if (getActualKey(id) !== undefined) {
                onUpload(id, name);
                handleUpload(id);
            }
            else {
                // The S3 uploader module will either calculate the key or ask the server for it
                // and will call us back once it is known.
                onGetKeyName(id, name).then(function(key) {
                    setKey(id, key);
                    onUpload(id, name);
                    handleUpload(id);
                });
            }
        }
    }


// ************************** Simple Uploads ******************************

    // Starting point for incoming requests for simple (non-chunked) uploads.
    function handleSimpleUpload(id) {
        var xhr = fileState[id].xhr,
            name = publicApi.getName(id),
            fileOrBlob = publicApi.getFile(id);

        xhr.upload.onprogress = function(e){
            if (e.lengthComputable){
                fileState[id].loaded = e.loaded;
                onProgress(id, name, e.loaded, e.total);
            }
        };

        xhr.onreadystatechange = getReadyStateChangeHandler(id);

        // Delegate to a function the sets up the XHR request and notifies us when it is ready to be sent, along w/ the payload.
        prepareForSend(id, fileOrBlob).then(function(toSend) {
            log('Sending upload request for ' + id);
            xhr.send(toSend);
        });
    }

    /**
     * Used for simple (non-chunked) uploads to determine the parameters to send along with the request.  Part of this
     * process involves asking the local server to sign the request, so this function returns a promise.  The promise
     * is fulfilled when all parameters are determined, or when we determine that all parameters cannnot be calculated
     * due to some error.
     *
     * @param id File ID
     * @returns {qq.Promise}
     */
    function generateAwsParams(id) {
        var customParams = paramsStore.getParams(id);
        customParams[filenameParam] = publicApi.getName(id);

        return qq.s3.util.generateAwsParams({
                endpoint: endpointStore.getEndpoint(id),
                params: customParams,
                type: fileState[id].type,
                key: getActualKey(id),
                accessKey: accessKey,
                acl: acl,
                expectedStatus: expectedStatus,
                minFileSize: validation.minSizeLimit,
                maxFileSize: validation.maxSizeLimit,
                log: log
            },
            qq.bind(policySignatureRequester.getSignature, this, id));
    }

    /**
     * Starts the upload process by delegating to an async function that determine parameters to be attached to the
     * request.  If all params can be determined, we are called back with the params and the caller of this function is
     * informed by invoking the `success` method on the promise returned by this function, passing the payload of the
     * request.  If some error occurs here, we delegate to a function that signals a failure for this upload attempt.
     *
     * Note that this is only used by the simple (non-chunked) upload process.
     *
     * @param id File ID
     * @param fileOrBlob `File` or `Blob` to send
     * @returns {qq.Promise}
     */
    function prepareForSend(id, fileOrBlob) {
        var formData = new FormData(),
            endpoint = endpointStore.getEndpoint(id),
            url = endpoint,
            xhr = fileState[id].xhr,
            promise = new qq.Promise();

        generateAwsParams(id).then(
            // Success - all params determined
            function(awsParams) {
                xhr.open("POST", url, true);

                qq.obj2FormData(awsParams, formData);

                // AWS requires the file field be named "file".
                formData.append("file", fileOrBlob);

                promise.success(formData);
            },

            // Failure - we couldn't determine some params (likely the signature)
            function(errorMessage) {
                promise.failure(errorMessage);
                uploadCompleted(id, {error: errorMessage});
            }
        );

        return promise;
    }


// ************************** Chunked Uploads ******************************


    // If this is a resumable upload, grab the relevant data from storage and items in memory that track this upload
    // so we can pick up from where we left off.
    function maybePrepareForResume(id) {
        var localStorageId, persistedData;

        // Resume is enabled and possible and this is the first time we've tried to upload this file in this session,
        // so prepare for a resume attempt.
        if (resumeEnabled && getActualKey(id) === undefined) {
            localStorageId = getLocalStorageId(id);
            persistedData = localStorage.getItem(localStorageId);

            // If we haven't found this item in local storage, give up
            if (persistedData) {
                log(qq.format("Identified file with ID {} and name of {} as resumable.", id, publicApi.getName(id)));

                persistedData = JSON.parse(persistedData);

                fileState[id].uuid = persistedData.uuid;
                setKey(id, persistedData.key);
                fileState[id].loaded = persistedData.loaded;
                fileState[id].chunking = persistedData.chunking;
            }
        }
    }

    // Persist any data needed to resume this upload in a new session.
    function maybePersistChunkedState(id) {
        var localStorageId, persistedData;

        // If local storage isn't supported by the browser, or if resume isn't enabled or possible, give up
        if (resumeEnabled) {
            localStorageId = getLocalStorageId(id);

            persistedData = {
                name: publicApi.getName(id),
                size: publicApi.getSize(id),
                uuid: publicApi.getUuid(id),
                key: getActualKey(id),
                loaded: fileState[id].loaded,
                chunking: fileState[id].chunking,
                lastUpdated: Date.now()
            };

            localStorage.setItem(localStorageId, JSON.stringify(persistedData));
        }
    }

    // Removes a chunked upload record from local storage, if possible.
    // Returns true if the item was removed, false otherwise.
    function maybeDeletePersistedChunkData(id) {
        var localStorageId;

        if (resumeEnabled) {
            localStorageId = getLocalStorageId(id);

            if (localStorageId && localStorage.getItem(localStorageId)) {
                localStorage.removeItem(localStorageId);
                return true;
            }
        }

        return false;
    }

    // Iterates through all S3 XHR handler-created resume records (in local storage),
    // invoking the passed callback and passing in the key and value of each local storage record.
    function iterateResumeRecords(callback) {
        if (resumeEnabled) {
            qq.each(localStorage, function(key, item) {
                if (key.indexOf("qqs3resume-") === 0) {
                    var uploadData = JSON.parse(item);
                    callback(key, uploadData);
                }
            });
        }
    }

    /**
     * @returns {Array} Array of objects containing properties useful to integrators
     * when it is important to determine which files are potentially resumable.
     */
    function getResumableFilesData() {
        var resumableFilesData = [];

        iterateResumeRecords(function(key, uploadData) {
            resumableFilesData.push({
                name: uploadData.name,
                size: uploadData.size,
                uuid: uploadData.uuid,
                partIdx: uploadData.chunking.lastSent + 1,
                key: uploadData.key
            });
        });

        return resumableFilesData;
    }

    // Deletes any local storage records that are "expired".
    function removeExpiredChunkingRecords() {
        var expirationDays = options.resume.recordsExpireIn;

        iterateResumeRecords(function(key, uploadData) {
            var expirationDate = new Date(uploadData.lastUpdated);

            // transform updated date into expiration date
            expirationDate.setDate(expirationDate.getDate() + expirationDays);

            if (expirationDate.getTime() <= Date.now()) {
                log("Removing expired resume record with key " + key);
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * @param id File ID
     * @returns {string} Identifier for this item that may appear in the browser's local storage
     */
    function getLocalStorageId(id) {
        var name = publicApi.getName(id),
            size = publicApi.getSize(id),
            chunkSize = options.chunking.partSize,
            endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint);

        return qq.format("qqs3resume-{}-{}-{}-{}", name, size, chunkSize, bucket);
    }

    /**
     * Determine if the associated file should be chunked.
     *
     * @param id ID of the associated file
     * @returns {*} true if chunking is enabled, possible, and the file can be split into more than 1 part
     */
    function shouldChunkThisFile(id) {
        var totalChunks;

        if (!fileState[id].chunking) {
            fileState[id].chunking = {};
            totalChunks = internalApi.getTotalChunks(id);
            if (totalChunks > 1) {
                fileState[id].chunking.enabled = true;
                fileState[id].chunking.parts = totalChunks;
            }
            else {
                fileState[id].chunking.enabled = false;
            }
        }

        return fileState[id].chunking.enabled;
    }

    // Starting point for incoming requests for chunked uploads.
    function handleChunkedUpload(id) {
        maybeInitiateMultipart(id).then(
            // The "Initiate" request succeeded.  We are ready to send the first chunk.
            function(uploadId, xhr) {
                maybeUploadNextChunk(id);
            },

            // We were unable to initiate the chunked upload process.
            function(errorMessage, xhr) {
                uploadCompleted(id, {error: errorMessage}, xhr);
            }
        );
    }

    /**
     * Retrieves the 0-based index of the next chunk to send.  Note that AWS uses 1-based indexing.
     *
     * @param id File ID
     * @returns {number} The 0-based index of the next file chunk to be sent to S3
     */
    function getNextPartIdxToSend(id) {
        return fileState[id].chunking.lastSent >= 0 ? fileState[id].chunking.lastSent + 1 : 0
    }

    /**
     * @param id File ID
     * @returns {string} The query string portion of the URL used to direct multipart upload requests
     */
    function getNextChunkUrlParams(id) {
        // Amazon part indexing starts at 1
        var idx = getNextPartIdxToSend(id) + 1,
            uploadId = fileState[id].chunking.uploadId;

        return qq.format("?partNumber={}&uploadId={}", idx, uploadId);
    }

    /**
     * @param id File ID
     * @returns {string} The entire URL to use when sending a multipart upload PUT request for the next chunk to be sent
     */
    function getNextChunkUrl(id) {
        var domain = options.endpointStore.getEndpoint(id),
            urlParams = getNextChunkUrlParams(id),
            key = getUrlSafeKey(id);

        return qq.format("{}/{}{}", domain, key, urlParams);
    }

    // Either initiate an upload for the next chunk for an associated file, or initiate a
    // "Complete Multipart Upload" request if there are no more parts to be sent.
    function maybeUploadNextChunk(id) {
        var totalParts = fileState[id].chunking.parts,
            nextPartIdx = getNextPartIdxToSend(id);

        if (nextPartIdx < totalParts) {
            uploadNextChunk(id);
        }
        else {
            completeMultipart(id);
        }
    }

    // Sends a "Complete Multipart Upload" request and then signals completion of the upload
    // when the response to this request has been parsed.
    function completeMultipart(id) {
        var uploadId = fileState[id].chunking.uploadId,
            etagMap = fileState[id].chunking.etags;

        completeMultipartRequester.send(id, uploadId, etagMap).then(
            // Successfully completed
            function(xhr) {
                uploadCompleted(id, null, xhr);
            },

            // Complete request failed
            function(errorMsg, xhr) {
                uploadCompleted(id, {error: errorMsg}, xhr);
            }
        );
    }

    // Initiate the process to send the next chunk for a file.  This assumes there IS a "next" chunk.
    function uploadNextChunk(id) {
        var idx = getNextPartIdxToSend(id),
            name = publicApi.getName(id),
            xhr = fileState[id].xhr,
            url = getNextChunkUrl(id),
            totalFileSize = publicApi.getSize(id),
            chunkData = internalApi.getChunkData(id, idx);

        // Add appropriate headers to the multipart upload request.
        // Once these have been determined (asynchronously) attach the headers and send the chunk.
        addChunkedHeaders(id).then(function(headers) {
            options.onUploadChunk(id, name, internalApi.getChunkDataForCallback(chunkData));

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    var totalLoaded = e.loaded + fileState[id].loaded;

                    options.onProgress(id, name, totalLoaded, totalFileSize);
                }
            };

            xhr.onreadystatechange = getReadyStateChangeHandler(id);

            xhr.open("PUT", url, true);

            qq.each(headers, function(name, val) {
                xhr.setRequestHeader(name, val);
            });

            log(qq.format("Sending part {} of {} for file ID {} - {} ({} bytes)", chunkData.part+1, chunkData.count, id, name, chunkData.size));
            xhr.send(chunkData.blob);
        });
    }

    /**
     * Determines headers that must be attached to the chunked (Multipart Upload) request.  One of these headers is an
     * Authorization value, which must be determined by asking the local server to sign the request first.  So, this
     * function returns a promise.  Once all headers are determined, the `success` method of the promise is called with
     * the headers object.  If there was some problem determining the headers, we delegate to the caller's `failure`
     * callback.
     *
     * @param id File ID
     * @returns {qq.Promise}
     */
    function addChunkedHeaders(id) {
        var headers = {},
            endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint),
            key = getUrlSafeKey(id),
            date = new Date().toUTCString(),
            queryString = getNextChunkUrlParams(id),
            promise = new qq.Promise(),
            toSign;

        headers["x-amz-date"] = date;

        toSign = {headers: "PUT\n\n\n\n" + "x-amz-date:" + date + "\n" + "/" + bucket + "/" + key + queryString};

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        restSignatureRequester.getSignature(id, toSign).then(function(response) {
            headers.Authorization = "AWS " + options.accessKey + ":" + response.signature;
            promise.success(headers);
        }, promise.failure);

        return promise;
    }

    /**
     * Sends an "Initiate Multipart Upload" request to S3 via the REST API, but only if the MPU has not already been
     * initiated.
     *
     * @param id Associated file ID
     * @returns {qq.Promise} A promise that is fulfilled when the initiate request has been sent and the response has been parsed.
     */
    function maybeInitiateMultipart(id) {
        if (!fileState[id].chunking.uploadId) {
            return initiateMultipartRequester.send(id).then(
                function(uploadId) {
                    fileState[id].chunking.uploadId = uploadId;
                }
            );
        }
        else {
            return new qq.Promise().success(fileState[id].chunking.uploadId);
        }
    }

    // The (usually) last step in handling a chunked upload.  This is called after each chunk has been sent.
    // The request may be successful, or not.  If it was successful, we must extract the "ETag" element
    // in the XML response and store that along with the associated part number.
    // We need these items to "Complete" the multipart upload after all chunks have been successfully sent.
    function uploadChunkCompleted(id) {
        var idxSent = getNextPartIdxToSend(id),
            xhr = fileState[id].xhr,
            response = parseResponse(id),
            chunkData = internalApi.getChunkData(id, idxSent),
            etag;

        if (response.success) {
            fileState[id].chunking.lastSent = idxSent;
            etag = xhr.getResponseHeader("ETag");

            if (!fileState[id].chunking.etags) {
                fileState[id].chunking.etags = [];
            }
            fileState[id].chunking.etags.push({part: idxSent+1, etag: etag});

            // Update the bytes loaded counter to reflect all bytes successfully transferred in the associated chunked request
            fileState[id].loaded += chunkData.size;

            maybePersistChunkedState(id);

            // We might not be done with this file...
            maybeUploadNextChunk(id);
        }
        else {
            if (response.error) {
                log(response.error, "error");
            }

            uploadCompleted(id);
        }
    }


    publicApi = new qq.UploadHandlerXhrApi(
        internalApi,
        fileState,
        chunkingPossible ? options.chunking : null,
        handleStartUploadSignal,
        options.onCancel,
        onUuidChanged,
        log
    );


    removeExpiredChunkingRecords();


    // Base XHR API overrides
    return qq.override(publicApi, function(super_) {
        return {
            add: function(fileOrBlobData) {
                var id = super_.add(fileOrBlobData);

                if (resumeEnabled) {
                    maybePrepareForResume(id);
                }

                return id;
            },

            getResumableFilesData: function() {
                return getResumableFilesData();
            },

            expunge: function(id) {
                var uploadId = fileState[id].chunking.uploadId,
                    existedInLocalStorage = maybeDeletePersistedChunkData(id);

                if (uploadId !== undefined && existedInLocalStorage) {
                    abortMultipartRequester.send(id, uploadId);
                }

                super_.expunge(id);
            },

            getThirdPartyFileId: function(id) {
                return getActualKey(id);
            }
        };
    });
};

/**
 * Upload handler used by the upload to S3 module that assumes the current user agent does not have any support for the
 * File API, and, therefore, makes use of iframes and forms to submit the files directly to S3 buckets via the associated
 * AWS API.
 *
 * @param options Options passed from the base handler
 * @param uploadCompleteCallback Callback to invoke when the upload has completed, regardless of success.
 * @param onUuidChanged Callback to invoke when the associated items UUID has changed by order of the server.
 * @param logCallback Used to posting log messages.
 */
qq.s3.UploadHandlerForm = function(options, uploadCompleteCallback, onUuidChanged, logCallback) {
    "use strict";

    var fileState = [],
        uploadCompleteCallback = uploadCompleteCallback,
        log = logCallback,
        onCompleteCallback = options.onComplete,
        onUpload = options.onUpload,
        onGetKeyName = options.getKeyName,
        filenameParam = options.filenameParam,
        paramsStore = options.paramsStore,
        endpointStore = options.endpointStore,
        accessKey = options.accessKey,
        acl = options.acl,
        validation = options.validation,
        successRedirectUrl = options.successRedirectEndpoint,
        getSignatureAjaxRequester = new qq.s3.SignatureAjaxRequestor({
            endpoint: options.signatureEndpoint,
            cors: options.cors,
            log: log
        }),
        internalApi = {},
        publicApi;


    if (successRedirectUrl === undefined) {
        throw new Error("successRedirectEndpoint MUST be defined if you intend to use browsers that do not support the File API!");
    }

    /**
     * Attempt to parse the contents of an iframe after receiving a response from the server.  If the contents cannot be
     * read (perhaps due to a security error) it is safe to assume that the upload was not successful since Amazon should
     * have redirected to a known endpoint that should provide a parseable response.
     *
     * @param id ID of the associated file
     * @param iframe target of the form submit
     * @returns {boolean} true if the contents can be read, false otherwise
     */
    function isValidResponse(id, iframe) {
        var response,
            endpoint = options.endpointStore.getEndpoint(id),
            bucket = qq.s3.util.getBucket(endpoint);


        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
        try {
            // iframe.contentWindow.document - for IE<7
            var doc = iframe.contentDocument || iframe.contentWindow.document,
                innerHtml = doc.body.innerHTML;

            var responseData = qq.s3.util.parseIframeResponse(iframe);
            if (responseData.bucket === bucket && responseData.key === encodeURIComponent(fileState[id].key)) {

                return true;
            }
        }
        catch(error) {
            log('Error when attempting to parse form upload response (' + error.message + ")", 'error');
        }

        return false;
    }

    function generateAwsParams(id) {
        var customParams = paramsStore.getParams(id);

        customParams[filenameParam] = publicApi.getName(id);

        return qq.s3.util.generateAwsParams({
                endpoint: endpointStore.getEndpoint(id),
                params: customParams,
                key: fileState[id].key,
                accessKey: accessKey,
                acl: acl,
                minFileSize: validation.minSizeLimit,
                maxFileSize: validation.maxSizeLimit,
                successRedirectUrl: successRedirectUrl,
                log: log
            },
            qq.bind(getSignatureAjaxRequester.getSignature, this, id));
    }

    /**
     * Creates form, that will be submitted to iframe
     */
    function createForm(id, iframe) {
        var promise = new qq.Promise(),
            method = options.demoMode ? "GET" : "POST",
            endpoint = options.endpointStore.getEndpoint(id),
            fileName = publicApi.getName(id);

        generateAwsParams(id).then(function(params) {
            var form = internalApi.initFormForUpload({
                method: method,
                endpoint: endpoint,
                params: params,
                paramsInBody: true,
                targetName: iframe.name
            });

            promise.success(form);
        }, function(errorMessage) {
            promise.failure(errorMessage);
            handleFinishedUpload(id, iframe, fileName, {error: errorMessage});
        });

        return promise;
    }

    function handleUpload(id) {
        var fileName = publicApi.getName(id),
            iframe = internalApi.createIframe(id),
            input = fileState[id].input;

        createForm(id, iframe).then(function(form) {
            onUpload(id, fileName);

            form.appendChild(input);

            // Register a callback when the response comes in from S3
            internalApi.attachLoadEvent(iframe, function(response) {
                log('iframe loaded');

                // If the common response handler has determined success or failure immediately
                if (response) {
                    // If there is something fundamentally wrong with the response (such as iframe content is not accessible)
                    if (response.success === false) {
                        log('Amazon likely rejected the upload request', 'error');
                    }
                }
                // The generic response (iframe onload) handler was not able to make a determination regarding the success of the request
                else {
                    response = {};
                    response.success = isValidResponse(id, iframe);

                    // If the more specific response handle detected a problem with the response from S3
                    if (response.success === false) {
                        log('A success response was received by Amazon, but it was invalid in some way.', 'error');
                    }
                }

                handleFinishedUpload(id, iframe, fileName, response);
            });

            log('Sending upload request for ' + id);
            form.submit();
            qq(form).remove();
        });
    }

    function handleFinishedUpload(id, iframe, fileName, response) {
        internalApi.detachLoadEvent(id);

        qq(iframe).remove();

        if (!response.success) {
            if (options.onAutoRetry(id, fileName, response)) {
                return;
            }
        }
        onCompleteCallback(id, fileName, response);
        uploadCompleteCallback(id);
    }

    publicApi = new qq.UploadHandlerFormApi(internalApi, fileState, false, "file", options.onCancel, onUuidChanged, log);

    qq.extend(publicApi, {
        upload: function(id) {
            var input = fileState[id].input,
                name = publicApi.getName(id);

            if (!input){
                throw new Error('file with passed id was not added, or already uploaded or cancelled');
            }

            if (publicApi.isValid(id)) {
                if (fileState[id].key) {
                    handleUpload(id);
                }
                else {
                    // The S3 uploader module will either calculate the key or ask the server for it
                    // and will call us back once it is known.
                    onGetKeyName(id, name).then(function(key) {
                        fileState[id].key = key;
                        handleUpload(id);
                    });
                }
            }
        },

        getThirdPartyFileId: function(id) {
            return fileState[id].key;
        }
    });

    return publicApi;
};

/*globals jQuery*/
/**
 * Simply an alias for the `fineUploader` plug-in wrapper, but hides the required `endpointType` option from the
 * integrator.  I thought it may be confusing to convey to the integrator that, when using Fine Uploader in S3 mode,
 * you need to specify an `endpointType` with a value of S3, and perhaps an `uploaderType` with a value of "basic" if
 * you want to use basic mode when uploading directly to S3 as well.  So, you can use this plug-in alias and not worry
 * about the `endpointType` option at all.
 */
(function($) {
    "use strict";

    $.fn.fineUploaderS3 = function(optionsOrCommand) {
        if (typeof optionsOrCommand === 'object') {

            // This option is used to tell the plug-in wrapper to instantiate the appropriate S3-namespace modules.
            optionsOrCommand.endpointType = "s3";
        }

        return $.fn.fineUploader.apply(this, arguments);
    };

}(jQuery));

/*! 2013-08-15 */
