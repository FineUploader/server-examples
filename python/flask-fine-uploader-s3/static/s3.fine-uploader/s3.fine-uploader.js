/*!
* Fine Uploader
*
* Copyright 2013-present, Widen Enterprises, Inc.
*
* Version: 5.9.0
*
* Homepage: http://fineuploader.com
*
* Repository: git://github.com/FineUploader/fine-uploader.git
*
* Licensed only under the MIT license (http://fineuploader.com/licensing).
*/ 


(function(global) {
/*globals window, navigator, document, FormData, File, HTMLInputElement, XMLHttpRequest, Blob, Storage, ActiveXObject */
/* jshint -W079 */
var qq = function(element) {
    "use strict";

    return {
        hide: function() {
            element.style.display = "none";
            return this;
        },

        /** Returns the function which detaches attached event */
        attach: function(type, fn) {
            if (element.addEventListener) {
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, fn);
            }
            return function() {
                qq(element).detach(type, fn);
            };
        },

        detach: function(type, fn) {
            if (element.removeEventListener) {
                element.removeEventListener(type, fn, false);
            } else if (element.attachEvent) {
                element.detachEvent("on" + type, fn);
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

            if (element.contains) {
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
            /*jshint eqnull: true*/
            if (element.style == null) {
                throw new qq.Error("Can't apply style to node as it is not on the HTMLElement prototype chain!");
            }

            /*jshint -W116*/
            if (styles.opacity != null) {
                if (typeof element.style.opacity !== "string" && typeof (element.filters) !== "undefined") {
                    styles.filter = "alpha(opacity=" + Math.round(100 * styles.opacity) + ")";
                }
            }
            qq.extend(element.style, styles);

            return this;
        },

        hasClass: function(name, considerParent) {
            var re = new RegExp("(^| )" + name + "( |$)");
            return re.test(element.className) || !!(considerParent && re.test(element.parentNode.className));
        },

        addClass: function(name) {
            if (!qq(element).hasClass(name)) {
                element.className += " " + name;
            }
            return this;
        },

        removeClass: function(name) {
            var re = new RegExp("(^| )" + name + "( |$)");
            element.className = element.className.replace(re, " ").replace(/^\s+|\s+$/g, "");
            return this;
        },

        getByClass: function(className, first) {
            var candidates,
                result = [];

            if (first && element.querySelector) {
                return element.querySelector("." + className);
            }
            else if (element.querySelectorAll) {
                return element.querySelectorAll("." + className);
            }

            candidates = element.getElementsByTagName("*");

            qq.each(candidates, function(idx, val) {
                if (qq(val).hasClass(className)) {
                    result.push(val);
                }
            });
            return first ? result[0] : result;
        },

        getFirstByClass: function(className) {
            return qq(element).getByClass(className, true);
        },

        children: function() {
            var children = [],
                child = element.firstChild;

            while (child) {
                if (child.nodeType === 1) {
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
        },

        // Returns true if the attribute exists on the element
        // AND the value of the attribute is NOT "false" (case-insensitive)
        hasAttribute: function(attrName) {
            var attrVal;

            if (element.hasAttribute) {

                if (!element.hasAttribute(attrName)) {
                    return false;
                }

                /*jshint -W116*/
                return (/^false$/i).exec(element.getAttribute(attrName)) == null;
            }
            else {
                attrVal = element[attrName];

                if (attrVal === undefined) {
                    return false;
                }

                /*jshint -W116*/
                return (/^false$/i).exec(attrVal) == null;
            }
        }
    };
};

(function() {
    "use strict";

    qq.canvasToBlob = function(canvas, mime, quality) {
        return qq.dataUriToBlob(canvas.toDataURL(mime, quality));
    };

    qq.dataUriToBlob = function(dataUri) {
        var arrayBuffer, byteString,
            createBlob = function(data, mime) {
                var BlobBuilder = window.BlobBuilder ||
                        window.WebKitBlobBuilder ||
                        window.MozBlobBuilder ||
                        window.MSBlobBuilder,
                    blobBuilder = BlobBuilder && new BlobBuilder();

                if (blobBuilder) {
                    blobBuilder.append(data);
                    return blobBuilder.getBlob(mime);
                }
                else {
                    return new Blob([data], {type: mime});
                }
            },
            intArray, mimeString;

        // convert base64 to raw binary data held in a string
        if (dataUri.split(",")[0].indexOf("base64") >= 0) {
            byteString = atob(dataUri.split(",")[1]);
        }
        else {
            byteString = decodeURI(dataUri.split(",")[1]);
        }

        // extract the MIME
        mimeString = dataUri.split(",")[0]
            .split(":")[1]
            .split(";")[0];

        // write the bytes of the binary string to an ArrayBuffer
        arrayBuffer = new ArrayBuffer(byteString.length);
        intArray = new Uint8Array(arrayBuffer);
        qq.each(byteString, function(idx, character) {
            intArray[idx] = character.charCodeAt(0);
        });

        return createBlob(arrayBuffer, mimeString);
    };

    qq.log = function(message, level) {
        if (window.console) {
            if (!level || level === "info") {
                window.console.log(message);
            }
            else
            {
                if (window.console[level]) {
                    window.console[level](message);
                }
                else {
                    window.console.log("<" + level + "> " + message);
                }
            }
        }
    };

    qq.isObject = function(variable) {
        return variable && !variable.nodeType && Object.prototype.toString.call(variable) === "[object Object]";
    };

    qq.isFunction = function(variable) {
        return typeof (variable) === "function";
    };

    /**
     * Check the type of a value.  Is it an "array"?
     *
     * @param value value to test.
     * @returns true if the value is an array or associated with an `ArrayBuffer`
     */
    qq.isArray = function(value) {
        return Object.prototype.toString.call(value) === "[object Array]" ||
            (value && window.ArrayBuffer && value.buffer && value.buffer.constructor === ArrayBuffer);
    };

    // Looks for an object on a `DataTransfer` object that is associated with drop events when utilizing the Filesystem API.
    qq.isItemList = function(maybeItemList) {
        return Object.prototype.toString.call(maybeItemList) === "[object DataTransferItemList]";
    };

    // Looks for an object on a `NodeList` or an `HTMLCollection`|`HTMLFormElement`|`HTMLSelectElement`
    // object that is associated with collections of Nodes.
    qq.isNodeList = function(maybeNodeList) {
        return Object.prototype.toString.call(maybeNodeList) === "[object NodeList]" ||
            // If `HTMLCollection` is the actual type of the object, we must determine this
            // by checking for expected properties/methods on the object
            (maybeNodeList.item && maybeNodeList.namedItem);
    };

    qq.isString = function(maybeString) {
        return Object.prototype.toString.call(maybeString) === "[object String]";
    };

    qq.trimStr = function(string) {
        if (String.prototype.trim) {
            return string.trim();
        }

        return string.replace(/^\s+|\s+$/g, "");
    };

    /**
     * @param str String to format.
     * @returns {string} A string, swapping argument values with the associated occurrence of {} in the passed string.
     */
    qq.format = function(str) {

        var args =  Array.prototype.slice.call(arguments, 1),
            newStr = str,
            nextIdxToReplace = newStr.indexOf("{}");

        qq.each(args, function(idx, val) {
            var strBefore = newStr.substring(0, nextIdxToReplace),
                strAfter = newStr.substring(nextIdxToReplace + 2);

            newStr = strBefore + val + strAfter;
            nextIdxToReplace = newStr.indexOf("{}", nextIdxToReplace + val.length);

            // End the loop if we have run out of tokens (when the arguments exceed the # of tokens)
            if (nextIdxToReplace < 0) {
                return false;
            }
        });

        return newStr;
    };

    qq.isFile = function(maybeFile) {
        return window.File && Object.prototype.toString.call(maybeFile) === "[object File]";
    };

    qq.isFileList = function(maybeFileList) {
        return window.FileList && Object.prototype.toString.call(maybeFileList) === "[object FileList]";
    };

    qq.isFileOrInput = function(maybeFileOrInput) {
        return qq.isFile(maybeFileOrInput) || qq.isInput(maybeFileOrInput);
    };

    qq.isInput = function(maybeInput, notFile) {
        var evaluateType = function(type) {
            var normalizedType = type.toLowerCase();

            if (notFile) {
                return normalizedType !== "file";
            }

            return normalizedType === "file";
        };

        if (window.HTMLInputElement) {
            if (Object.prototype.toString.call(maybeInput) === "[object HTMLInputElement]") {
                if (maybeInput.type && evaluateType(maybeInput.type)) {
                    return true;
                }
            }
        }
        if (maybeInput.tagName) {
            if (maybeInput.tagName.toLowerCase() === "input") {
                if (maybeInput.type && evaluateType(maybeInput.type)) {
                    return true;
                }
            }
        }

        return false;
    };

    qq.isBlob = function(maybeBlob) {
        if (window.Blob && Object.prototype.toString.call(maybeBlob) === "[object Blob]") {
            return true;
        }
    };

    qq.isXhrUploadSupported = function() {
        var input = document.createElement("input");
        input.type = "file";

        return (
            input.multiple !== undefined &&
                typeof File !== "undefined" &&
                typeof FormData !== "undefined" &&
                typeof (qq.createXhrInstance()).upload !== "undefined");
    };

    // Fall back to ActiveX is native XHR is disabled (possible in any version of IE).
    qq.createXhrInstance = function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }

        try {
            return new ActiveXObject("MSXML2.XMLHTTP.3.0");
        }
        catch (error) {
            qq.log("Neither XHR or ActiveX are supported!", "error");
            return null;
        }
    };

    qq.isFolderDropSupported = function(dataTransfer) {
        return dataTransfer.items &&
            dataTransfer.items.length > 0 &&
            dataTransfer.items[0].webkitGetAsEntry;
    };

    qq.isFileChunkingSupported = function() {
        return !qq.androidStock() && //Android's stock browser cannot upload Blobs correctly
            qq.isXhrUploadSupported() &&
            (File.prototype.slice !== undefined || File.prototype.webkitSlice !== undefined || File.prototype.mozSlice !== undefined);
    };

    qq.sliceBlob = function(fileOrBlob, start, end) {
        var slicer = fileOrBlob.slice || fileOrBlob.mozSlice || fileOrBlob.webkitSlice;

        return slicer.call(fileOrBlob, start, end);
    };

    qq.arrayBufferToHex = function(buffer) {
        var bytesAsHex = "",
            bytes = new Uint8Array(buffer);

        qq.each(bytes, function(idx, byt) {
            var byteAsHexStr = byt.toString(16);

            if (byteAsHexStr.length < 2) {
                byteAsHexStr = "0" + byteAsHexStr;
            }

            bytesAsHex += byteAsHexStr;
        });

        return bytesAsHex;
    };

    qq.readBlobToHex = function(blob, startOffset, length) {
        var initialBlob = qq.sliceBlob(blob, startOffset, startOffset + length),
            fileReader = new FileReader(),
            promise = new qq.Promise();

        fileReader.onload = function() {
            promise.success(qq.arrayBufferToHex(fileReader.result));
        };

        fileReader.onerror = promise.failure;

        fileReader.readAsArrayBuffer(initialBlob);

        return promise;
    };

    qq.extend = function(first, second, extendNested) {
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
     * Searches for a given element (elt) in the array, returns -1 if it is not present.
     */
    qq.indexOf = function(arr, elt, from) {
        if (arr.indexOf) {
            return arr.indexOf(elt, from);
        }

        from = from || 0;
        var len = arr.length;

        if (from < 0) {
            from += len;
        }

        for (; from < len; from += 1) {
            if (arr.hasOwnProperty(from) && arr[from] === elt) {
                return from;
            }
        }
        return -1;
    };

    //this is a version 4 UUID
    qq.getUniqueId = function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            /*jslint eqeq: true, bitwise: true*/
            var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    //
    // Browsers and platforms detection
    qq.ie = function() {
        return navigator.userAgent.indexOf("MSIE") !== -1 ||
            navigator.userAgent.indexOf("Trident") !== -1;
    };

    qq.ie7 = function() {
        return navigator.userAgent.indexOf("MSIE 7") !== -1;
    };

    qq.ie8 = function() {
        return navigator.userAgent.indexOf("MSIE 8") !== -1;
    };

    qq.ie10 = function() {
        return navigator.userAgent.indexOf("MSIE 10") !== -1;
    };

    qq.ie11 = function() {
        return qq.ie() && navigator.userAgent.indexOf("rv:11") !== -1;
    };

    qq.edge = function() {
        return navigator.userAgent.indexOf("Edge") >= 0;
    };

    qq.safari = function() {
        return navigator.vendor !== undefined && navigator.vendor.indexOf("Apple") !== -1;
    };

    qq.chrome = function() {
        return navigator.vendor !== undefined && navigator.vendor.indexOf("Google") !== -1;
    };

    qq.opera = function() {
        return navigator.vendor !== undefined && navigator.vendor.indexOf("Opera") !== -1;
    };

    qq.firefox = function() {
        return (!qq.edge() && !qq.ie11() && navigator.userAgent.indexOf("Mozilla") !== -1 && navigator.vendor !== undefined && navigator.vendor === "");
    };

    qq.windows = function() {
        return navigator.platform === "Win32";
    };

    qq.android = function() {
        return navigator.userAgent.toLowerCase().indexOf("android") !== -1;
    };

    // We need to identify the Android stock browser via the UA string to work around various bugs in this browser,
    // such as the one that prevents a `Blob` from being uploaded.
    qq.androidStock = function() {
        return qq.android() && navigator.userAgent.toLowerCase().indexOf("chrome") < 0;
    };

    qq.ios6 = function() {
        return qq.ios() && navigator.userAgent.indexOf(" OS 6_") !== -1;
    };

    qq.ios7 = function() {
        return qq.ios() && navigator.userAgent.indexOf(" OS 7_") !== -1;
    };

    qq.ios8 = function() {
        return qq.ios() && navigator.userAgent.indexOf(" OS 8_") !== -1;
    };

    // iOS 8.0.0
    qq.ios800 = function() {
        return qq.ios() && navigator.userAgent.indexOf(" OS 8_0 ") !== -1;
    };

    qq.ios = function() {
        /*jshint -W014 */
        return navigator.userAgent.indexOf("iPad") !== -1
            || navigator.userAgent.indexOf("iPod") !== -1
            || navigator.userAgent.indexOf("iPhone") !== -1;
    };

    qq.iosChrome = function() {
        return qq.ios() && navigator.userAgent.indexOf("CriOS") !== -1;
    };

    qq.iosSafari = function() {
        return qq.ios() && !qq.iosChrome() && navigator.userAgent.indexOf("Safari") !== -1;
    };

    qq.iosSafariWebView = function() {
        return qq.ios() && !qq.iosChrome() && !qq.iosSafari();
    };

    //
    // Events

    qq.preventDefault = function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    };

    /**
     * Creates and returns element from html string
     * Uses innerHTML to create an element
     */
    qq.toElement = (function() {
        var div = document.createElement("div");
        return function(html) {
            div.innerHTML = html;
            var element = div.firstChild;
            div.removeChild(element);
            return element;
        };
    }());

    //key and value are passed to callback for each entry in the iterable item
    qq.each = function(iterableItem, callback) {
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
            // `DataTransferItemList` & `NodeList` objects are array-like and should be treated as arrays
            // when iterating over items inside the object.
            else if (qq.isArray(iterableItem) || qq.isItemList(iterableItem) || qq.isNodeList(iterableItem)) {
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
                    newArgs = newArgs.concat(Array.prototype.slice.call(arguments));
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
    qq.obj2url = function(obj, temp, prefixDone) {
        /*jshint laxbreak: true*/
        var uristrings = [],
            prefix = "&",
            add = function(nextObj, i) {
                var nextTemp = temp
                    ? (/\[\]$/.test(temp)) // prevent double-encoding
                    ? temp
                    : temp + "[" + i + "]"
                    : i;
                if ((nextTemp !== "undefined") && (i !== "undefined")) {
                    uristrings.push(
                        (typeof nextObj === "object")
                            ? qq.obj2url(nextObj, nextTemp, true)
                            : (Object.prototype.toString.call(nextObj) === "[object Function]")
                            ? encodeURIComponent(nextTemp) + "=" + encodeURIComponent(nextObj())
                            : encodeURIComponent(nextTemp) + "=" + encodeURIComponent(nextObj)
                    );
                }
            };

        if (!prefixDone && temp) {
            prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? "" : "&" : "?";
            uristrings.push(temp);
            uristrings.push(qq.obj2url(obj));
        } else if ((Object.prototype.toString.call(obj) === "[object Array]") && (typeof obj !== "undefined")) {
            qq.each(obj, function(idx, val) {
                add(val, idx);
            });
        } else if ((typeof obj !== "undefined") && (obj !== null) && (typeof obj === "object")) {
            qq.each(obj, function(prop, val) {
                add(val, prop);
            });
        } else {
            uristrings.push(encodeURIComponent(temp) + "=" + encodeURIComponent(obj));
        }

        if (temp) {
            return uristrings.join(prefix);
        } else {
            return uristrings.join(prefix)
                .replace(/^&/, "")
                .replace(/%20/g, "+");
        }
    };

    qq.obj2FormData = function(obj, formData, arrayKeyName) {
        if (!formData) {
            formData = new FormData();
        }

        qq.each(obj, function(key, val) {
            key = arrayKeyName ? arrayKeyName + "[" + key + "]" : key;

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
        var input;

        if (!form) {
            form = document.createElement("form");
        }

        qq.obj2FormData(obj, {
            append: function(key, val) {
                input = document.createElement("input");
                input.setAttribute("name", key);
                input.setAttribute("value", val);
                form.appendChild(input);
            }
        });

        return form;
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
        var extIdx = filename.lastIndexOf(".") + 1;

        if (extIdx > 0) {
            return filename.substr(extIdx, filename.length - extIdx);
        }
    };

    qq.getFilename = function(blobOrFileInput) {
        /*jslint regexp: true*/

        if (qq.isInput(blobOrFileInput)) {
            // get input value and remove path to normalize
            return blobOrFileInput.value.replace(/.*(\/|\\)/, "");
        }
        else if (qq.isFile(blobOrFileInput)) {
            if (blobOrFileInput.fileName !== null && blobOrFileInput.fileName !== undefined) {
                return blobOrFileInput.fileName;
            }
        }

        return blobOrFileInput.name;
    };

    /**
     * A generic module which supports object disposing in dispose() method.
     * */
    qq.DisposeSupport = function() {
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
}());

/* globals qq */
/**
 * Fine Uploader top-level Error container.  Inherits from `Error`.
 */
(function() {
    "use strict";

    qq.Error = function(message) {
        this.message = "[Fine Uploader " + qq.version + "] " + message;
    };

    qq.Error.prototype = new Error();
}());

/*global qq */
qq.version = "5.9.0";

/* globals qq */
qq.supportedFeatures = (function() {
    "use strict";

    var supportsUploading,
        supportsUploadingBlobs,
        supportsFileDrop,
        supportsAjaxFileUploading,
        supportsFolderDrop,
        supportsChunking,
        supportsResume,
        supportsUploadViaPaste,
        supportsUploadCors,
        supportsDeleteFileXdr,
        supportsDeleteFileCorsXhr,
        supportsDeleteFileCors,
        supportsFolderSelection,
        supportsImagePreviews,
        supportsUploadProgress;

    function testSupportsFileInputElement() {
        var supported = true,
            tempInput;

        try {
            tempInput = document.createElement("input");
            tempInput.type = "file";
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
        return (qq.chrome() || qq.opera()) &&
            navigator.userAgent.match(/Chrome\/[2][1-9]|Chrome\/[3-9][0-9]/) !== undefined;
    }

    //only way to test for complete Clipboard API support at this time
    function isChrome14OrHigher() {
        return (qq.chrome() || qq.opera()) &&
            navigator.userAgent.match(/Chrome\/[1][4-9]|Chrome\/[2-9][0-9]/) !== undefined;
    }

    //Ensure we can send cross-origin `XMLHttpRequest`s
    function isCrossOriginXhrSupported() {
        if (window.XMLHttpRequest) {
            var xhr = qq.createXhrInstance();

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

    function isFolderSelectionSupported() {
        // We know that folder selection is only supported in Chrome via this proprietary attribute for now
        return document.createElement("input").webkitdirectory !== undefined;
    }

    function isLocalStorageSupported() {
        try {
            return !!window.localStorage &&
                // unpatched versions of IE10/11 have buggy impls of localStorage where setItem is a string
                qq.isFunction(window.localStorage.setItem);
        }
        catch (error) {
            // probably caught a security exception, so no localStorage for you
            return false;
        }
    }

    function isDragAndDropSupported() {
        var span = document.createElement("span");

        return ("draggable" in span || ("ondragstart" in span && "ondrop" in span)) &&
            !qq.android() && !qq.ios();
    }

    supportsUploading = testSupportsFileInputElement();

    supportsAjaxFileUploading = supportsUploading && qq.isXhrUploadSupported();

    supportsUploadingBlobs = supportsAjaxFileUploading && !qq.androidStock();

    supportsFileDrop = supportsAjaxFileUploading && isDragAndDropSupported();

    supportsFolderDrop = supportsFileDrop && isChrome21OrHigher();

    supportsChunking = supportsAjaxFileUploading && qq.isFileChunkingSupported();

    supportsResume = supportsAjaxFileUploading && supportsChunking && isLocalStorageSupported();

    supportsUploadViaPaste = supportsAjaxFileUploading && isChrome14OrHigher();

    supportsUploadCors = supportsUploading && (window.postMessage !== undefined || supportsAjaxFileUploading);

    supportsDeleteFileCorsXhr = isCrossOriginXhrSupported();

    supportsDeleteFileXdr = isXdrSupported();

    supportsDeleteFileCors = isCrossOriginAjaxSupported();

    supportsFolderSelection = isFolderSelectionSupported();

    supportsImagePreviews = supportsAjaxFileUploading && window.FileReader !== undefined;

    supportsUploadProgress = (function() {
        if (supportsAjaxFileUploading) {
            return !qq.androidStock() && !qq.iosChrome();
        }
        return false;
    }());

    return {
        ajaxUploading: supportsAjaxFileUploading,
        blobUploading: supportsUploadingBlobs,
        canDetermineSize: supportsAjaxFileUploading,
        chunking: supportsChunking,
        deleteFileCors: supportsDeleteFileCors,
        deleteFileCorsXdr: supportsDeleteFileXdr, //NOTE: will also return true in IE10, where XDR is also supported
        deleteFileCorsXhr: supportsDeleteFileCorsXhr,
        dialogElement: !!window.HTMLDialogElement,
        fileDrop: supportsFileDrop,
        folderDrop: supportsFolderDrop,
        folderSelection: supportsFolderSelection,
        imagePreviews: supportsImagePreviews,
        imageValidation: supportsImagePreviews,
        itemSizeValidation: supportsAjaxFileUploading,
        pause: supportsChunking,
        progressBar: supportsUploadProgress,
        resume: supportsResume,
        scaling: supportsImagePreviews && supportsUploadingBlobs,
        tiffPreviews: qq.safari(), // Not the best solution, but simple and probably accurate enough (for now)
        unlimitedScaledImageSize: !qq.ios(), // false simply indicates that there is some known limit
        uploading: supportsUploading,
        uploadCors: supportsUploadCors,
        uploadCustomHeaders: supportsAjaxFileUploading,
        uploadNonMultipart: supportsAjaxFileUploading,
        uploadViaPaste: supportsUploadViaPaste
    };

}());

/*globals qq*/

// Is the passed object a promise instance?
qq.isGenericPromise = function(maybePromise) {
    "use strict";
    return !!(maybePromise && maybePromise.then && qq.isFunction(maybePromise.then));
};

qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
        successCallbacks = [],
        failureCallbacks = [],
        doneCallbacks = [],
        state = 0;

    qq.extend(this, {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1) {
                onFailure && onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null, successArgs);
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
                    callback.apply(null, successArgs);
                });
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs);
                });
            }

            return this;
        },

        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                });
            }

            if (doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                });
            }

            return this;
        }
    });
};

/* globals qq */
/**
 * Placeholder for a Blob that will be generated on-demand.
 *
 * @param referenceBlob Parent of the generated blob
 * @param onCreate Function to invoke when the blob must be created.  Must be promissory.
 * @constructor
 */
qq.BlobProxy = function(referenceBlob, onCreate) {
    "use strict";

    qq.extend(this, {
        referenceBlob: referenceBlob,

        create: function() {
            return onCreate(referenceBlob);
        }
    });
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

    var self = this,

        disposeSupport = new qq.DisposeSupport(),

        options = {
            // Corresponds to the `accept` attribute on the associated `<input type="file">`
            acceptFiles: null,

            // "Container" element
            element: null,

            focusClass: "qq-upload-button-focus",

            // A true value allows folders to be selected, if supported by the UA
            folders: false,

            // **This option will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
            hoverClass: "qq-upload-button-hover",

            ios8BrowserCrashWorkaround: false,

            // If true adds `multiple` attribute to `<input type="file">`
            multiple: false,

            // `name` attribute of `<input type="file">`
            name: "qqfile",

            // Called when the browser invokes the onchange handler on the `<input type="file">`
            onChange: function(input) {},

            title: null
        },
        input, buttonId;

    // Overrides any of the default option values with any option values passed in during construction.
    qq.extend(options, o);

    buttonId = qq.getUniqueId();

    // Embed an opaque `<input type="file">` element as a child of `options.element`.
    function createInput() {
        var input = document.createElement("input");

        input.setAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME, buttonId);
        input.setAttribute("title", options.title);

        self.setMultiple(options.multiple, input);

        if (options.folders && qq.supportedFeatures.folderSelection) {
            // selecting directories is only possible in Chrome now, via a vendor-specific prefixed attribute
            input.setAttribute("webkitdirectory", "");
        }

        if (options.acceptFiles) {
            input.setAttribute("accept", options.acceptFiles);
        }

        input.setAttribute("type", "file");
        input.setAttribute("name", options.name);

        qq(input).css({
            position: "absolute",
            // in Opera only 'browse' button
            // is clickable and it is located at
            // the right side of the input
            right: 0,
            top: 0,
            fontFamily: "Arial",
            // It's especially important to make this an arbitrarily large value
            // to ensure the rendered input button in IE takes up the entire
            // space of the container element.  Otherwise, the left side of the
            // button will require a double-click to invoke the file chooser.
            // In other browsers, this might cause other issues, so a large font-size
            // is only used in IE.  There is a bug in IE8 where the opacity style is  ignored
            // in some cases when the font-size is large.  So, this workaround is not applied
            // to IE8.
            fontSize: qq.ie() && !qq.ie8() ? "3500px" : "118px",
            margin: 0,
            padding: 0,
            cursor: "pointer",
            opacity: 0
        });

        // Setting the file input's height to 100% in IE7 causes
        // most of the visible button to be unclickable.
        !qq.ie7() && qq(input).css({height: "100%"});

        options.element.appendChild(input);

        disposeSupport.attach(input, "change", function() {
            options.onChange(input);
        });

        // **These event handlers will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
        disposeSupport.attach(input, "mouseover", function() {
            qq(options.element).addClass(options.hoverClass);
        });
        disposeSupport.attach(input, "mouseout", function() {
            qq(options.element).removeClass(options.hoverClass);
        });

        disposeSupport.attach(input, "focus", function() {
            qq(options.element).addClass(options.focusClass);
        });
        disposeSupport.attach(input, "blur", function() {
            qq(options.element).removeClass(options.focusClass);
        });

        return input;
    }

    // Make button suitable container for input
    qq(options.element).css({
        position: "relative",
        overflow: "hidden",
        // Make sure browse button is in the right side in Internet Explorer
        direction: "ltr"
    });

    // Exposed API
    qq.extend(this, {
        getInput: function() {
            return input;
        },

        getButtonId: function() {
            return buttonId;
        },

        setMultiple: function(isMultiple, optInput) {
            var input = optInput || this.getInput();

            // Temporary workaround for bug in in iOS8 UIWebView that causes the browser to crash
            // before the file chooser appears if the file input doesn't contain a multiple attribute.
            // See #1283.
            if (options.ios8BrowserCrashWorkaround && qq.ios8() && (qq.iosChrome() || qq.iosSafariWebView())) {
                input.setAttribute("multiple", "");
            }

            else {
                if (isMultiple) {
                    input.setAttribute("multiple", "");
                }
                else {
                    input.removeAttribute("multiple");
                }
            }
        },

        setAcceptFiles: function(acceptFiles) {
            if (acceptFiles !== options.acceptFiles) {
                input.setAttribute("accept", acceptFiles);
            }
        },

        reset: function() {
            if (input.parentNode) {
                qq(input).remove();
            }

            qq(options.element).removeClass(options.focusClass);
            input = null;
            input = createInput();
        }
    });

    input = createInput();
};

qq.UploadButton.BUTTON_ID_ATTR_NAME = "qq-button-id";

/*globals qq */
qq.UploadData = function(uploaderProxy) {
    "use strict";

    var data = [],
        byUuid = {},
        byStatus = {},
        byProxyGroupId = {},
        byBatchId = {};

    function getDataByIds(idOrIds) {
        if (qq.isArray(idOrIds)) {
            var entries = [];

            qq.each(idOrIds, function(idx, id) {
                entries.push(data[id]);
            });

            return entries;
        }

        return data[idOrIds];
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

    qq.extend(this, {
        /**
         * Adds a new file to the data cache for tracking purposes.
         *
         * @param spec Data that describes this file.  Possible properties are:
         *
         * - uuid: Initial UUID for this file.
         * - name: Initial name of this file.
         * - size: Size of this file, omit if this cannot be determined
         * - status: Initial `qq.status` for this file.  Omit for `qq.status.SUBMITTING`.
         * - batchId: ID of the batch this file belongs to
         * - proxyGroupId: ID of the proxy group associated with this file
         *
         * @returns {number} Internal ID for this file.
         */
        addFile: function(spec) {
            var status = spec.status || qq.status.SUBMITTING,
                id = data.push({
                    name: spec.name,
                    originalName: spec.name,
                    uuid: spec.uuid,
                    size: spec.size == null ? -1 : spec.size,
                    status: status
                }) - 1;

            if (spec.batchId) {
                data[id].batchId = spec.batchId;

                if (byBatchId[spec.batchId] === undefined) {
                    byBatchId[spec.batchId] = [];
                }
                byBatchId[spec.batchId].push(id);
            }

            if (spec.proxyGroupId) {
                data[id].proxyGroupId = spec.proxyGroupId;

                if (byProxyGroupId[spec.proxyGroupId] === undefined) {
                    byProxyGroupId[spec.proxyGroupId] = [];
                }
                byProxyGroupId[spec.proxyGroupId].push(id);
            }

            data[id].id = id;
            byUuid[spec.uuid] = id;

            if (byStatus[status] === undefined) {
                byStatus[status] = [];
            }
            byStatus[status].push(id);

            uploaderProxy.onStatusChange(id, null, status);

            return id;
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
            byUuid = {};
            byStatus = {};
            byBatchId = {};
        },

        setStatus: function(id, newStatus) {
            var oldStatus = data[id].status,
                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], id);

            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);

            data[id].status = newStatus;

            if (byStatus[newStatus] === undefined) {
                byStatus[newStatus] = [];
            }
            byStatus[newStatus].push(id);

            uploaderProxy.onStatusChange(id, oldStatus, newStatus);
        },

        uuidChanged: function(id, newUuid) {
            var oldUuid = data[id].uuid;

            data[id].uuid = newUuid;
            byUuid[newUuid] = id;
            delete byUuid[oldUuid];
        },

        updateName: function(id, newName) {
            data[id].name = newName;
        },

        updateSize: function(id, newSize) {
            data[id].size = newSize;
        },

        // Only applicable if this file has a parent that we may want to reference later.
        setParentId: function(targetId, parentId) {
            data[targetId].parentId = parentId;
        },

        getIdsInProxyGroup: function(id) {
            var proxyGroupId = data[id].proxyGroupId;

            if (proxyGroupId) {
                return byProxyGroupId[proxyGroupId];
            }
            return [];
        },

        getIdsInBatch: function(id) {
            var batchId = data[id].batchId;

            return byBatchId[batchId];
        }
    });
};

qq.status = {
    SUBMITTING: "submitting",
    SUBMITTED: "submitted",
    REJECTED: "rejected",
    QUEUED: "queued",
    CANCELED: "canceled",
    PAUSED: "paused",
    UPLOADING: "uploading",
    UPLOAD_RETRYING: "retrying upload",
    UPLOAD_SUCCESSFUL: "upload successful",
    UPLOAD_FAILED: "upload failed",
    DELETE_FAILED: "delete failed",
    DELETING: "deleting",
    DELETED: "deleted"
};

/*globals qq*/
/**
 * Defines the public API for FineUploaderBasic mode.
 */
(function() {
    "use strict";

    qq.basePublicApi = {
        // DEPRECATED - TODO REMOVE IN NEXT MAJOR RELEASE (replaced by addFiles)
        addBlobs: function(blobDataOrArray, params, endpoint) {
            this.addFiles(blobDataOrArray, params, endpoint);
        },

        addInitialFiles: function(cannedFileList) {
            var self = this;

            qq.each(cannedFileList, function(index, cannedFile) {
                self._addCannedFile(cannedFile);
            });
        },

        addFiles: function(data, params, endpoint) {
            this._maybeHandleIos8SafariWorkaround();

            var batchId = this._storedIds.length === 0 ? qq.getUniqueId() : this._currentBatchId,

                processBlob = qq.bind(function(blob) {
                    this._handleNewFile({
                        blob: blob,
                        name: this._options.blobs.defaultName
                    }, batchId, verifiedFiles);
                }, this),

                processBlobData = qq.bind(function(blobData) {
                    this._handleNewFile(blobData, batchId, verifiedFiles);
                }, this),

                processCanvas = qq.bind(function(canvas) {
                    var blob = qq.canvasToBlob(canvas);

                    this._handleNewFile({
                        blob: blob,
                        name: this._options.blobs.defaultName + ".png"
                    }, batchId, verifiedFiles);
                }, this),

                processCanvasData = qq.bind(function(canvasData) {
                    var normalizedQuality = canvasData.quality && canvasData.quality / 100,
                        blob = qq.canvasToBlob(canvasData.canvas, canvasData.type, normalizedQuality);

                    this._handleNewFile({
                        blob: blob,
                        name: canvasData.name
                    }, batchId, verifiedFiles);
                }, this),

                processFileOrInput = qq.bind(function(fileOrInput) {
                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {
                        var files = Array.prototype.slice.call(fileOrInput.files),
                            self = this;

                        qq.each(files, function(idx, file) {
                            self._handleNewFile(file, batchId, verifiedFiles);
                        });
                    }
                    else {
                        this._handleNewFile(fileOrInput, batchId, verifiedFiles);
                    }
                }, this),

                normalizeData = function() {
                    if (qq.isFileList(data)) {
                        data = Array.prototype.slice.call(data);
                    }
                    data = [].concat(data);
                },

                self = this,
                verifiedFiles = [];

            this._currentBatchId = batchId;

            if (data) {
                normalizeData();

                qq.each(data, function(idx, fileContainer) {
                    if (qq.isFileOrInput(fileContainer)) {
                        processFileOrInput(fileContainer);
                    }
                    else if (qq.isBlob(fileContainer)) {
                        processBlob(fileContainer);
                    }
                    else if (qq.isObject(fileContainer)) {
                        if (fileContainer.blob && fileContainer.name) {
                            processBlobData(fileContainer);
                        }
                        else if (fileContainer.canvas && fileContainer.name) {
                            processCanvasData(fileContainer);
                        }
                    }
                    else if (fileContainer.tagName && fileContainer.tagName.toLowerCase() === "canvas") {
                        processCanvas(fileContainer);
                    }
                    else {
                        self.log(fileContainer + " is not a valid file container!  Ignoring!", "warn");
                    }
                });

                this.log("Received " + verifiedFiles.length + " files.");
                this._prepareItemsForUpload(verifiedFiles, params, endpoint);
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

        clearStoredFiles: function() {
            this._storedIds = [];
        },

        continueUpload: function(id) {
            var uploadData = this._uploadData.retrieve({id: id});

            if (!qq.supportedFeatures.pause || !this._options.chunking.enabled) {
                return false;
            }

            if (uploadData.status === qq.status.PAUSED) {
                this.log(qq.format("Paused file ID {} ({}) will be continued.  Not paused.", id, this.getName(id)));
                this._uploadFile(id);
                return true;
            }
            else {
                this.log(qq.format("Ignoring continue for file ID {} ({}).  Not paused.", id, this.getName(id)), "error");
            }

            return false;
        },

        deleteFile: function(id) {
            return this._onSubmitDelete(id);
        },

        // TODO document?
        doesExist: function(fileOrBlobId) {
            return this._handler.isValid(fileOrBlobId);
        },

        // Generate a variable size thumbnail on an img or canvas,
        // returning a promise that is fulfilled when the attempt completes.
        // Thumbnail can either be based off of a URL for an image returned
        // by the server in the upload response, or the associated `Blob`.
        drawThumbnail: function(fileId, imgOrCanvas, maxSize, fromServer) {
            var promiseToReturn = new qq.Promise(),
                fileOrUrl, options;

            if (this._imageGenerator) {
                fileOrUrl = this._thumbnailUrls[fileId];
                options = {
                    scale: maxSize > 0,
                    maxSize: maxSize > 0 ? maxSize : null
                };

                // If client-side preview generation is possible
                // and we are not specifically looking for the image URl returned by the server...
                if (!fromServer && qq.supportedFeatures.imagePreviews) {
                    fileOrUrl = this.getFile(fileId);
                }

                /* jshint eqeqeq:false,eqnull:true */
                if (fileOrUrl == null) {
                    promiseToReturn.failure({container: imgOrCanvas, error: "File or URL not found."});
                }
                else {
                    this._imageGenerator.generate(fileOrUrl, imgOrCanvas, options).then(
                        function success(modifiedContainer) {
                            promiseToReturn.success(modifiedContainer);
                        },

                        function failure(container, reason) {
                            promiseToReturn.failure({container: container, error: reason || "Problem generating thumbnail"});
                        }
                    );
                }
            }
            else {
                promiseToReturn.failure({container: imgOrCanvas, error: "Missing image generator module"});
            }

            return promiseToReturn;
        },

        getButton: function(fileId) {
            return this._getButton(this._buttonIdsForFileIds[fileId]);
        },

        getEndpoint: function(fileId) {
            return this._endpointStore.get(fileId);
        },

        getFile: function(fileOrBlobId) {
            return this._handler.getFile(fileOrBlobId) || null;
        },

        getInProgress: function() {
            return this._uploadData.retrieve({
                status: [
                    qq.status.UPLOADING,
                    qq.status.UPLOAD_RETRYING,
                    qq.status.QUEUED
                ]
            }).length;
        },

        getName: function(id) {
            return this._uploadData.retrieve({id: id}).name;
        },

                // Parent ID for a specific file, or null if this is the parent, or if it has no parent.
        getParentId: function(id) {
            var uploadDataEntry = this.getUploads({id: id}),
                parentId = null;

            if (uploadDataEntry) {
                if (uploadDataEntry.parentId !== undefined) {
                    parentId = uploadDataEntry.parentId;
                }
            }

            return parentId;
        },

        getResumableFilesData: function() {
            return this._handler.getResumableFilesData();
        },

        getSize: function(id) {
            return this._uploadData.retrieve({id: id}).size;
        },

        getNetUploads: function() {
            return this._netUploaded;
        },

        getRemainingAllowedItems: function() {
            var allowedItems = this._currentItemLimit;

            if (allowedItems > 0) {
                return allowedItems - this._netUploadedOrQueued;
            }

            return null;
        },

        getUploads: function(optionalFilter) {
            return this._uploadData.retrieve(optionalFilter);
        },

        getUuid: function(id) {
            return this._uploadData.retrieve({id: id}).uuid;
        },

        log: function(str, level) {
            if (this._options.debug && (!level || level === "info")) {
                qq.log("[Fine Uploader " + qq.version + "] " + str);
            }
            else if (level && level !== "info") {
                qq.log("[Fine Uploader " + qq.version + "] " + str, level);

            }
        },

        pauseUpload: function(id) {
            var uploadData = this._uploadData.retrieve({id: id});

            if (!qq.supportedFeatures.pause || !this._options.chunking.enabled) {
                return false;
            }

            // Pause only really makes sense if the file is uploading or retrying
            if (qq.indexOf([qq.status.UPLOADING, qq.status.UPLOAD_RETRYING], uploadData.status) >= 0) {
                if (this._handler.pause(id)) {
                    this._uploadData.setStatus(id, qq.status.PAUSED);
                    return true;
                }
                else {
                    this.log(qq.format("Unable to pause file ID {} ({}).", id, this.getName(id)), "error");
                }
            }
            else {
                this.log(qq.format("Ignoring pause for file ID {} ({}).  Not in progress.", id, this.getName(id)), "error");
            }

            return false;
        },

        reset: function() {
            this.log("Resetting uploader...");

            this._handler.reset();
            this._storedIds = [];
            this._autoRetries = [];
            this._retryTimeouts = [];
            this._preventRetries = [];
            this._thumbnailUrls = [];

            qq.each(this._buttons, function(idx, button) {
                button.reset();
            });

            this._paramsStore.reset();
            this._endpointStore.reset();
            this._netUploadedOrQueued = 0;
            this._netUploaded = 0;
            this._uploadData.reset();
            this._buttonIdsForFileIds = [];

            this._pasteHandler && this._pasteHandler.reset();
            this._options.session.refreshOnReset && this._refreshSessionData();

            this._succeededSinceLastAllComplete = [];
            this._failedSinceLastAllComplete = [];

            this._totalProgress && this._totalProgress.reset();
        },

        retry: function(id) {
            return this._manualRetry(id);
        },

        scaleImage: function(id, specs) {
            var self = this;

            return qq.Scaler.prototype.scaleImage(id, specs, {
                log: qq.bind(self.log, self),
                getFile: qq.bind(self.getFile, self),
                uploadData: self._uploadData
            });
        },

        setCustomHeaders: function(headers, id) {
            this._customHeadersStore.set(headers, id);
        },

        setDeleteFileCustomHeaders: function(headers, id) {
            this._deleteFileCustomHeadersStore.set(headers, id);
        },

        setDeleteFileEndpoint: function(endpoint, id) {
            this._deleteFileEndpointStore.set(endpoint, id);
        },

        setDeleteFileParams: function(params, id) {
            this._deleteFileParamsStore.set(params, id);
        },

        // Re-sets the default endpoint, an endpoint for a specific file, or an endpoint for a specific button
        setEndpoint: function(endpoint, id) {
            this._endpointStore.set(endpoint, id);
        },

        setForm: function(elementOrId) {
            this._updateFormSupportAndParams(elementOrId);
        },

        setItemLimit: function(newItemLimit) {
            this._currentItemLimit = newItemLimit;
        },

        setName: function(id, newName) {
            this._uploadData.updateName(id, newName);
        },

        setParams: function(params, id) {
            this._paramsStore.set(params, id);
        },

        setUuid: function(id, newUuid) {
            return this._uploadData.uuidChanged(id, newUuid);
        },

        uploadStoredFiles: function() {
            if (this._storedIds.length === 0) {
                this._itemError("noFilesError");
            }
            else {
                this._uploadStoredFiles();
            }
        }
    };

    /**
     * Defines the private (internal) API for FineUploaderBasic mode.
     */
    qq.basePrivateApi = {
        // Updates internal state with a file record (not backed by a live file).  Returns the assigned ID.
        _addCannedFile: function(sessionData) {
            var id = this._uploadData.addFile({
                uuid: sessionData.uuid,
                name: sessionData.name,
                size: sessionData.size,
                status: qq.status.UPLOAD_SUCCESSFUL
            });

            sessionData.deleteFileEndpoint && this.setDeleteFileEndpoint(sessionData.deleteFileEndpoint, id);
            sessionData.deleteFileParams && this.setDeleteFileParams(sessionData.deleteFileParams, id);

            if (sessionData.thumbnailUrl) {
                this._thumbnailUrls[id] = sessionData.thumbnailUrl;
            }

            this._netUploaded++;
            this._netUploadedOrQueued++;

            return id;
        },

        _annotateWithButtonId: function(file, associatedInput) {
            if (qq.isFile(file)) {
                file.qqButtonId = this._getButtonId(associatedInput);
            }
        },

        _batchError: function(message) {
            this._options.callbacks.onError(null, null, message, undefined);
        },

        _createDeleteHandler: function() {
            var self = this;

            return new qq.DeleteFileAjaxRequester({
                method: this._options.deleteFile.method.toUpperCase(),
                maxConnections: this._options.maxConnections,
                uuidParamName: this._options.request.uuidName,
                customHeaders: this._deleteFileCustomHeadersStore,
                paramsStore: this._deleteFileParamsStore,
                endpointStore: this._deleteFileEndpointStore,
                cors: this._options.cors,
                log: qq.bind(self.log, self),
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
                    log: qq.bind(self.log, self),
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

        _createStore: function(initialValue, _readOnlyValues_) {
            var store = {},
                catchall = initialValue,
                perIdReadOnlyValues = {},
                readOnlyValues = _readOnlyValues_,
                copy = function(orig) {
                    if (qq.isObject(orig)) {
                        return qq.extend({}, orig);
                    }
                    return orig;
                },
                getReadOnlyValues = function() {
                    if (qq.isFunction(readOnlyValues)) {
                        return readOnlyValues();
                    }
                    return readOnlyValues;
                },
                includeReadOnlyValues = function(id, existing) {
                    if (readOnlyValues && qq.isObject(existing)) {
                        qq.extend(existing, getReadOnlyValues());
                    }

                    if (perIdReadOnlyValues[id]) {
                        qq.extend(existing, perIdReadOnlyValues[id]);
                    }
                };

            return {
                set: function(val, id) {
                    /*jshint eqeqeq: true, eqnull: true*/
                    if (id == null) {
                        store = {};
                        catchall = copy(val);
                    }
                    else {
                        store[id] = copy(val);
                    }
                },

                get: function(id) {
                    var values;

                    /*jshint eqeqeq: true, eqnull: true*/
                    if (id != null && store[id]) {
                        values = store[id];
                    }
                    else {
                        values = copy(catchall);
                    }

                    includeReadOnlyValues(id, values);

                    return copy(values);
                },

                addReadOnly: function(id, values) {
                    // Only applicable to Object stores
                    if (qq.isObject(store)) {
                        // If null ID, apply readonly values to all files
                        if (id === null) {
                            if (qq.isFunction(values)) {
                                readOnlyValues = values;
                            }
                            else {
                                readOnlyValues = readOnlyValues || {};
                                qq.extend(readOnlyValues, values);
                            }
                        }
                        else {
                            perIdReadOnlyValues[id] = perIdReadOnlyValues[id] || {};
                            qq.extend(perIdReadOnlyValues[id], values);
                        }
                    }
                },

                remove: function(fileId) {
                    return delete store[fileId];
                },

                reset: function() {
                    store = {};
                    perIdReadOnlyValues = {};
                    catchall = initialValue;
                }
            };
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
                    self._maybeAllComplete(id, newStatus);

                    if (self._totalProgress) {
                        setTimeout(function() {
                            self._totalProgress.onStatusChange(id, oldStatus, newStatus);
                        }, 0);
                    }
                }
            });
        },

        /**
         * Generate a tracked upload button.
         *
         * @param spec Object containing a required `element` property
         * along with optional `multiple`, `accept`, and `folders`.
         * @returns {qq.UploadButton}
         * @private
         */
        _createUploadButton: function(spec) {
            var self = this,
                acceptFiles = spec.accept || this._options.validation.acceptFiles,
                allowedExtensions = spec.allowedExtensions || this._options.validation.allowedExtensions,
                button;

            function allowMultiple() {
                if (qq.supportedFeatures.ajaxUploading) {
                    // Workaround for bug in iOS7+ (see #1039)
                    if (self._options.workarounds.iosEmptyVideos &&
                        qq.ios() &&
                        !qq.ios6() &&
                        self._isAllowedExtension(allowedExtensions, ".mov")) {

                        return false;
                    }

                    if (spec.multiple === undefined) {
                        return self._options.multiple;
                    }

                    return spec.multiple;
                }

                return false;
            }

            button = new qq.UploadButton({
                acceptFiles: acceptFiles,
                element: spec.element,
                focusClass: this._options.classes.buttonFocus,
                folders: spec.folders,
                hoverClass: this._options.classes.buttonHover,
                ios8BrowserCrashWorkaround: this._options.workarounds.ios8BrowserCrash,
                multiple: allowMultiple(),
                name: this._options.request.inputName,
                onChange: function(input) {
                    self._onInputChange(input);
                },
                title: spec.title == null ? this._options.text.fileInputTitle : spec.title
            });

            this._disposeSupport.addDisposer(function() {
                button.dispose();
            });

            self._buttons.push(button);

            return button;
        },

        _createUploadHandler: function(additionalOptions, namespace) {
            var self = this,
                lastOnProgress = {},
                options = {
                    debug: this._options.debug,
                    maxConnections: this._options.maxConnections,
                    cors: this._options.cors,
                    paramsStore: this._paramsStore,
                    endpointStore: this._endpointStore,
                    chunking: this._options.chunking,
                    resume: this._options.resume,
                    blobs: this._options.blobs,
                    log: qq.bind(self.log, self),
                    preventRetryParam: this._options.retry.preventRetryResponseProperty,
                    onProgress: function(id, name, loaded, total) {
                        if (loaded < 0 || total < 0) {
                            return;
                        }

                        if (lastOnProgress[id]) {
                            if (lastOnProgress[id].loaded !== loaded || lastOnProgress[id].total !== total) {
                                self._onProgress(id, name, loaded, total);
                                self._options.callbacks.onProgress(id, name, loaded, total);
                            }
                        }
                        else {
                            self._onProgress(id, name, loaded, total);
                            self._options.callbacks.onProgress(id, name, loaded, total);
                        }

                        lastOnProgress[id] = {loaded: loaded, total: total};

                    },
                    onComplete: function(id, name, result, xhr) {
                        delete lastOnProgress[id];

                        var status = self.getUploads({id: id}).status,
                            retVal;

                        // This is to deal with some observed cases where the XHR readyStateChange handler is
                        // invoked by the browser multiple times for the same XHR instance with the same state
                        // readyState value.  Higher level: don't invoke complete-related code if we've already
                        // done this.
                        if (status === qq.status.UPLOAD_SUCCESSFUL || status === qq.status.UPLOAD_FAILED) {
                            return;
                        }

                        retVal = self._onComplete(id, name, result, xhr);

                        // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback
                        // until the promise has been fulfilled.
                        if (retVal instanceof  qq.Promise) {
                            retVal.done(function() {
                                self._options.callbacks.onComplete(id, name, result, xhr);
                            });
                        }
                        else {
                            self._options.callbacks.onComplete(id, name, result, xhr);
                        }
                    },
                    onCancel: function(id, name, cancelFinalizationEffort) {
                        var promise = new qq.Promise();

                        self._handleCheckedCallback({
                            name: "onCancel",
                            callback: qq.bind(self._options.callbacks.onCancel, self, id, name),
                            onFailure: promise.failure,
                            onSuccess: function() {
                                cancelFinalizationEffort.then(function() {
                                    self._onCancel(id, name);
                                });

                                promise.success();
                            },
                            identifier: id
                        });

                        return promise;
                    },
                    onUploadPrep: qq.bind(this._onUploadPrep, this),
                    onUpload: function(id, name) {
                        self._onUpload(id, name);
                        self._options.callbacks.onUpload(id, name);
                    },
                    onUploadChunk: function(id, name, chunkData) {
                        self._onUploadChunk(id, chunkData);
                        self._options.callbacks.onUploadChunk(id, name, chunkData);
                    },
                    onUploadChunkSuccess: function(id, chunkData, result, xhr) {
                        self._options.callbacks.onUploadChunkSuccess.apply(self, arguments);
                    },
                    onResume: function(id, name, chunkData) {
                        return self._options.callbacks.onResume(id, name, chunkData);
                    },
                    onAutoRetry: function(id, name, responseJSON, xhr) {
                        return self._onAutoRetry.apply(self, arguments);
                    },
                    onUuidChanged: function(id, newUuid) {
                        self.log("Server requested UUID change from '" + self.getUuid(id) + "' to '" + newUuid + "'");
                        self.setUuid(id, newUuid);
                    },
                    getName: qq.bind(self.getName, self),
                    getUuid: qq.bind(self.getUuid, self),
                    getSize: qq.bind(self.getSize, self),
                    setSize: qq.bind(self._setSize, self),
                    getDataByUuid: function(uuid) {
                        return self.getUploads({uuid: uuid});
                    },
                    isQueued: function(id) {
                        var status = self.getUploads({id: id}).status;
                        return status === qq.status.QUEUED ||
                            status === qq.status.SUBMITTED ||
                            status === qq.status.UPLOAD_RETRYING ||
                            status === qq.status.PAUSED;
                    },
                    getIdsInProxyGroup: self._uploadData.getIdsInProxyGroup,
                    getIdsInBatch: self._uploadData.getIdsInBatch
                };

            qq.each(this._options.request, function(prop, val) {
                options[prop] = val;
            });

            options.customHeaders = this._customHeadersStore;

            if (additionalOptions) {
                qq.each(additionalOptions, function(key, val) {
                    options[key] = val;
                });
            }

            return new qq.UploadHandlerController(options, namespace);
        },

        _fileOrBlobRejected: function(id) {
            this._netUploadedOrQueued--;
            this._uploadData.setStatus(id, qq.status.REJECTED);
        },

        _formatSize: function(bytes) {
            var i = -1;
            do {
                bytes = bytes / 1000;
                i++;
            } while (bytes > 999);

            return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];
        },

        // Creates an internal object that tracks various properties of each extra button,
        // and then actually creates the extra button.
        _generateExtraButtonSpecs: function() {
            var self = this;

            this._extraButtonSpecs = {};

            qq.each(this._options.extraButtons, function(idx, extraButtonOptionEntry) {
                var multiple = extraButtonOptionEntry.multiple,
                    validation = qq.extend({}, self._options.validation, true),
                    extraButtonSpec = qq.extend({}, extraButtonOptionEntry);

                if (multiple === undefined) {
                    multiple = self._options.multiple;
                }

                if (extraButtonSpec.validation) {
                    qq.extend(validation, extraButtonOptionEntry.validation, true);
                }

                qq.extend(extraButtonSpec, {
                    multiple: multiple,
                    validation: validation
                }, true);

                self._initExtraButton(extraButtonSpec);
            });
        },

        _getButton: function(buttonId) {
            var extraButtonsSpec = this._extraButtonSpecs[buttonId];

            if (extraButtonsSpec) {
                return extraButtonsSpec.element;
            }
            else if (buttonId === this._defaultButtonId) {
                return this._options.button;
            }
        },

        /**
         * Gets the internally used tracking ID for a button.
         *
         * @param buttonOrFileInputOrFile `File`, `<input type="file">`, or a button container element
         * @returns {*} The button's ID, or undefined if no ID is recoverable
         * @private
         */
        _getButtonId: function(buttonOrFileInputOrFile) {
            var inputs, fileInput,
                fileBlobOrInput = buttonOrFileInputOrFile;

            // We want the reference file/blob here if this is a proxy (a file that will be generated on-demand later)
            if (fileBlobOrInput instanceof qq.BlobProxy) {
                fileBlobOrInput = fileBlobOrInput.referenceBlob;
            }

            // If the item is a `Blob` it will never be associated with a button or drop zone.
            if (fileBlobOrInput && !qq.isBlob(fileBlobOrInput)) {
                if (qq.isFile(fileBlobOrInput)) {
                    return fileBlobOrInput.qqButtonId;
                }
                else if (fileBlobOrInput.tagName.toLowerCase() === "input" &&
                    fileBlobOrInput.type.toLowerCase() === "file") {

                    return fileBlobOrInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
                }

                inputs = fileBlobOrInput.getElementsByTagName("input");

                qq.each(inputs, function(idx, input) {
                    if (input.getAttribute("type") === "file") {
                        fileInput = input;
                        return false;
                    }
                });

                if (fileInput) {
                    return fileInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
                }
            }
        },

        _getNotFinished: function() {
            return this._uploadData.retrieve({
                status: [
                    qq.status.UPLOADING,
                    qq.status.UPLOAD_RETRYING,
                    qq.status.QUEUED,
                    qq.status.SUBMITTING,
                    qq.status.SUBMITTED,
                    qq.status.PAUSED
                ]
            }).length;
        },

        // Get the validation options for this button.  Could be the default validation option
        // or a specific one assigned to this particular button.
        _getValidationBase: function(buttonId) {
            var extraButtonSpec = this._extraButtonSpecs[buttonId];

            return extraButtonSpec ? extraButtonSpec.validation : this._options.validation;
        },

        _getValidationDescriptor: function(fileWrapper) {
            if (fileWrapper.file instanceof qq.BlobProxy) {
                return {
                    name: qq.getFilename(fileWrapper.file.referenceBlob),
                    size: fileWrapper.file.referenceBlob.size
                };
            }

            return {
                name: this.getUploads({id: fileWrapper.id}).name,
                size: this.getUploads({id: fileWrapper.id}).size
            };
        },

        _getValidationDescriptors: function(fileWrappers) {
            var self = this,
                fileDescriptors = [];

            qq.each(fileWrappers, function(idx, fileWrapper) {
                fileDescriptors.push(self._getValidationDescriptor(fileWrapper));
            });

            return fileDescriptors;
        },

        // Allows camera access on either the default or an extra button for iOS devices.
        _handleCameraAccess: function() {
            if (this._options.camera.ios && qq.ios()) {
                var acceptIosCamera = "image/*;capture=camera",
                    button = this._options.camera.button,
                    buttonId = button ? this._getButtonId(button) : this._defaultButtonId,
                    optionRoot = this._options;

                // If we are not targeting the default button, it is an "extra" button
                if (buttonId && buttonId !== this._defaultButtonId) {
                    optionRoot = this._extraButtonSpecs[buttonId];
                }

                // Camera access won't work in iOS if the `multiple` attribute is present on the file input
                optionRoot.multiple = false;

                // update the options
                if (optionRoot.validation.acceptFiles === null) {
                    optionRoot.validation.acceptFiles = acceptIosCamera;
                }
                else {
                    optionRoot.validation.acceptFiles += "," + acceptIosCamera;
                }

                // update the already-created button
                qq.each(this._buttons, function(idx, button) {
                    if (button.getButtonId() === buttonId) {
                        button.setMultiple(optionRoot.multiple);
                        button.setAcceptFiles(optionRoot.acceptFiles);

                        return false;
                    }
                });
            }
        },

        _handleCheckedCallback: function(details) {
            var self = this,
                callbackRetVal = details.callback();

            if (qq.isGenericPromise(callbackRetVal)) {
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
                    this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Invoking failure callback.");
                    details.onFailure();
                }
                else {
                    this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Will not proceed.");
                }
            }

            return callbackRetVal;
        },

        // Updates internal state when a new file has been received, and adds it along with its ID to a passed array.
        _handleNewFile: function(file, batchId, newFileWrapperList) {
            var self = this,
                uuid = qq.getUniqueId(),
                size = -1,
                name = qq.getFilename(file),
                actualFile = file.blob || file,
                handler = this._customNewFileHandler ?
                    this._customNewFileHandler :
                    qq.bind(self._handleNewFileGeneric, self);

            if (!qq.isInput(actualFile) && actualFile.size >= 0) {
                size = actualFile.size;
            }

            handler(actualFile, name, uuid, size, newFileWrapperList, batchId, this._options.request.uuidName, {
                uploadData: self._uploadData,
                paramsStore: self._paramsStore,
                addFileToHandler: function(id, file) {
                    self._handler.add(id, file);
                    self._netUploadedOrQueued++;
                    self._trackButton(id);
                }
            });
        },

        _handleNewFileGeneric: function(file, name, uuid, size, fileList, batchId) {
            var id = this._uploadData.addFile({uuid: uuid, name: name, size: size, batchId: batchId});

            this._handler.add(id, file);
            this._trackButton(id);

            this._netUploadedOrQueued++;

            fileList.push({id: id, file: file});
        },

        _handlePasteSuccess: function(blob, extSuppliedName) {
            var extension = blob.type.split("/")[1],
                name = extSuppliedName;

            /*jshint eqeqeq: true, eqnull: true*/
            if (name == null) {
                name = this._options.paste.defaultName;
            }

            name += "." + extension;

            this.addFiles({
                name: name,
                blob: blob
            });
        },

        // Creates an extra button element
        _initExtraButton: function(spec) {
            var button = this._createUploadButton({
                accept: spec.validation.acceptFiles,
                allowedExtensions: spec.validation.allowedExtensions,
                element: spec.element,
                folders: spec.folders,
                multiple: spec.multiple,
                title: spec.fileInputTitle
            });

            this._extraButtonSpecs[button.getButtonId()] = spec;
        },

        _initFormSupportAndParams: function() {
            this._formSupport = qq.FormSupport && new qq.FormSupport(
                this._options.form, qq.bind(this.uploadStoredFiles, this), qq.bind(this.log, this)
            );

            if (this._formSupport && this._formSupport.attachedToForm) {
                this._paramsStore = this._createStore(
                    this._options.request.params,  this._formSupport.getFormInputsAsObject
                );

                this._options.autoUpload = this._formSupport.newAutoUpload;
                if (this._formSupport.newEndpoint) {
                    this._options.request.endpoint = this._formSupport.newEndpoint;
                }
            }
            else {
                this._paramsStore = this._createStore(this._options.request.params);
            }
        },

        _isDeletePossible: function() {
            if (!qq.DeleteFileAjaxRequester || !this._options.deleteFile.enabled) {
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

        _isAllowedExtension: function(allowed, fileName) {
            var valid = false;

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
                    var extRegex = new RegExp("\\." + allowedExt + "$", "i");

                    if (fileName.match(extRegex) != null) {
                        valid = true;
                        return false;
                    }
                }
            });

            return valid;
        },

        /**
         * Constructs and returns a message that describes an item/file error.  Also calls `onError` callback.
         *
         * @param code REQUIRED - a code that corresponds to a stock message describing this type of error
         * @param maybeNameOrNames names of the items that have failed, if applicable
         * @param item `File`, `Blob`, or `<input type="file">`
         * @private
         */
        _itemError: function(code, maybeNameOrNames, item) {
            var message = this._options.messages[code],
                allowedExtensions = [],
                names = [].concat(maybeNameOrNames),
                name = names[0],
                buttonId = this._getButtonId(item),
                validationBase = this._getValidationBase(buttonId),
                extensionsForMessage, placeholderMatch;

            function r(name, replacement) { message = message.replace(name, replacement); }

            qq.each(validationBase.allowedExtensions, function(idx, allowedExtension) {
                /**
                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
                 */
                if (qq.isString(allowedExtension)) {
                    allowedExtensions.push(allowedExtension);
                }
            });

            extensionsForMessage = allowedExtensions.join(", ").toLowerCase();

            r("{file}", this._options.formatFileName(name));
            r("{extensions}", extensionsForMessage);
            r("{sizeLimit}", this._formatSize(validationBase.sizeLimit));
            r("{minSizeLimit}", this._formatSize(validationBase.minSizeLimit));

            placeholderMatch = message.match(/(\{\w+\})/g);
            if (placeholderMatch !== null) {
                qq.each(placeholderMatch, function(idx, placeholder) {
                    r(placeholder, names[idx]);
                });
            }

            this._options.callbacks.onError(null, name, message, undefined);

            return message;
        },

        /**
         * Conditionally orders a manual retry of a failed upload.
         *
         * @param id File ID of the failed upload
         * @param callback Optional callback to invoke if a retry is prudent.
         * In lieu of asking the upload handler to retry.
         * @returns {boolean} true if a manual retry will occur
         * @private
         */
        _manualRetry: function(id, callback) {
            if (this._onBeforeManualRetry(id)) {
                this._netUploadedOrQueued++;
                this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

                if (callback) {
                    callback(id);
                }
                else {
                    this._handler.retry(id);
                }

                return true;
            }
        },

        _maybeAllComplete: function(id, status) {
            var self = this,
                notFinished = this._getNotFinished();

            if (status === qq.status.UPLOAD_SUCCESSFUL) {
                this._succeededSinceLastAllComplete.push(id);
            }
            else if (status === qq.status.UPLOAD_FAILED) {
                this._failedSinceLastAllComplete.push(id);
            }

            if (notFinished === 0 &&
                (this._succeededSinceLastAllComplete.length || this._failedSinceLastAllComplete.length)) {
                // Attempt to ensure onAllComplete is not invoked before other callbacks, such as onCancel & onComplete
                setTimeout(function() {
                    self._onAllComplete(self._succeededSinceLastAllComplete, self._failedSinceLastAllComplete);
                }, 0);
            }
        },

        _maybeHandleIos8SafariWorkaround: function() {
            var self = this;

            if (this._options.workarounds.ios8SafariUploads && qq.ios800() && qq.iosSafari()) {
                setTimeout(function() {
                    window.alert(self._options.messages.unsupportedBrowserIos8Safari);
                }, 0);
                throw new qq.Error(this._options.messages.unsupportedBrowserIos8Safari);
            }
        },

        _maybeParseAndSendUploadError: function(id, name, response, xhr) {
            // Assuming no one will actually set the response code to something other than 200
            // and still set 'success' to true...
            if (!response.success) {
                if (xhr && xhr.status !== 200 && !response.error) {
                    this._options.callbacks.onError(id, name, "XHR returned response code " + xhr.status, xhr);
                }
                else {
                    var errorReason = response.error ? response.error : this._options.text.defaultResponseError;
                    this._options.callbacks.onError(id, name, errorReason, xhr);
                }
            }
        },

        _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {
            var self = this;

            if (items.length > index) {
                if (validItem || !this._options.validation.stopOnFirstInvalidFile) {
                    //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks
                    setTimeout(function() {
                        var validationDescriptor = self._getValidationDescriptor(items[index]),
                            buttonId = self._getButtonId(items[index].file),
                            button = self._getButton(buttonId);

                        self._handleCheckedCallback({
                            name: "onValidate",
                            callback: qq.bind(self._options.callbacks.onValidate, self, validationDescriptor, button),
                            onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),
                            onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),
                            identifier: "Item '" + validationDescriptor.name + "', size: " + validationDescriptor.size
                        });
                    }, 0);
                }
                else if (!validItem) {
                    for (; index < items.length; index++) {
                        self._fileOrBlobRejected(items[index].id);
                    }
                }
            }
        },

        _onAllComplete: function(successful, failed) {
            this._totalProgress && this._totalProgress.onAllComplete(successful, failed, this._preventRetries);

            this._options.callbacks.onAllComplete(qq.extend([], successful), qq.extend([], failed));

            this._succeededSinceLastAllComplete = [];
            this._failedSinceLastAllComplete = [];
        },

        /**
         * Attempt to automatically retry a failed upload.
         *
         * @param id The file ID of the failed upload
         * @param name The name of the file associated with the failed upload
         * @param responseJSON Response from the server, parsed into a javascript object
         * @param xhr Ajax transport used to send the failed request
         * @param callback Optional callback to be invoked if a retry is prudent.
         * Invoked in lieu of asking the upload handler to retry.
         * @returns {boolean} true if an auto-retry will occur
         * @private
         */
        _onAutoRetry: function(id, name, responseJSON, xhr, callback) {
            var self = this;

            self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];

            if (self._shouldAutoRetry(id, name, responseJSON)) {
                self._maybeParseAndSendUploadError.apply(self, arguments);
                self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id]);
                self._onBeforeAutoRetry(id, name);

                self._retryTimeouts[id] = setTimeout(function() {
                    self.log("Retrying " + name + "...");
                    self._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

                    if (callback) {
                        callback(id);
                    }
                    else {
                        self._handler.retry(id);
                    }
                }, self._options.retry.autoAttemptDelay * 1000);

                return true;
            }
        },

        _onBeforeAutoRetry: function(id, name) {
            this.log("Waiting " + this._options.retry.autoAttemptDelay + " seconds before retrying " + name + "...");
        },

        //return false if we should not attempt the requested retry
        _onBeforeManualRetry: function(id) {
            var itemLimit = this._currentItemLimit,
                fileName;

            if (this._preventRetries[id]) {
                this.log("Retries are forbidden for id " + id, "warn");
                return false;
            }
            else if (this._handler.isValid(id)) {
                fileName = this.getName(id);

                if (this._options.callbacks.onManualRetry(id, fileName) === false) {
                    return false;
                }

                if (itemLimit > 0 && this._netUploadedOrQueued + 1 > itemLimit) {
                    this._itemError("retryFailTooManyItems");
                    return false;
                }

                this.log("Retrying upload for '" + fileName + "' (id: " + id + ")...");
                return true;
            }
            else {
                this.log("'" + id + "' is not a valid file ID", "error");
                return false;
            }
        },

        _onCancel: function(id, name) {
            this._netUploadedOrQueued--;

            clearTimeout(this._retryTimeouts[id]);

            var storedItemIndex = qq.indexOf(this._storedIds, id);
            if (!this._options.autoUpload && storedItemIndex >= 0) {
                this._storedIds.splice(storedItemIndex, 1);
            }

            this._uploadData.setStatus(id, qq.status.CANCELED);
        },

        _onComplete: function(id, name, result, xhr) {
            if (!result.success) {
                this._netUploadedOrQueued--;
                this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);

                if (result[this._options.retry.preventRetryResponseProperty] === true) {
                    this._preventRetries[id] = true;
                }
            }
            else {
                if (result.thumbnailUrl) {
                    this._thumbnailUrls[id] = result.thumbnailUrl;
                }

                this._netUploaded++;
                this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);
            }

            this._maybeParseAndSendUploadError(id, name, result, xhr);

            return result.success ? true : false;
        },

        _onDelete: function(id) {
            this._uploadData.setStatus(id, qq.status.DELETING);
        },

        _onDeleteComplete: function(id, xhrOrXdr, isError) {
            var name = this.getName(id);

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

        _onInputChange: function(input) {
            var fileIndex;

            if (qq.supportedFeatures.ajaxUploading) {
                for (fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
                    this._annotateWithButtonId(input.files[fileIndex], input);
                }

                this.addFiles(input.files);
            }
            // Android 2.3.x will fire `onchange` even if no file has been selected
            else if (input.value.length > 0) {
                this.addFiles(input);
            }

            qq.each(this._buttons, function(idx, button) {
                button.reset();
            });
        },

        _onProgress: function(id, name, loaded, total) {
            this._totalProgress && this._totalProgress.onIndividualProgress(id, loaded, total);
        },

        _onSubmit: function(id, name) {
            //nothing to do yet in core uploader
        },

        _onSubmitCallbackSuccess: function(id, name) {
            this._onSubmit.apply(this, arguments);
            this._uploadData.setStatus(id, qq.status.SUBMITTED);
            this._onSubmitted.apply(this, arguments);

            if (this._options.autoUpload) {
                this._options.callbacks.onSubmitted.apply(this, arguments);
                this._uploadFile(id);
            }
            else {
                this._storeForLater(id);
                this._options.callbacks.onSubmitted.apply(this, arguments);
            }
        },

        _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {
            var uuid = this.getUuid(id),
                adjustedOnSuccessCallback;

            if (onSuccessCallback) {
                adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);
            }

            if (this._isDeletePossible()) {
                this._handleCheckedCallback({
                    name: "onSubmitDelete",
                    callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),
                    onSuccess: adjustedOnSuccessCallback ||
                        qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),
                    identifier: id
                });
                return true;
            }
            else {
                this.log("Delete request ignored for ID " + id + ", delete feature is disabled or request not possible " +
                    "due to CORS on a user agent that does not support pre-flighting.", "warn");
                return false;
            }
        },

        _onSubmitted: function(id) {
            //nothing to do in the base uploader
        },

        _onTotalProgress: function(loaded, total) {
            this._options.callbacks.onTotalProgress(loaded, total);
        },

        _onUploadPrep: function(id) {
            // nothing to do in the core uploader for now
        },

        _onUpload: function(id, name) {
            this._uploadData.setStatus(id, qq.status.UPLOADING);
        },

        _onUploadChunk: function(id, chunkData) {
            //nothing to do in the base uploader
        },

        _onUploadStatusChange: function(id, oldStatus, newStatus) {
            // Make sure a "queued" retry attempt is canceled if the upload has been paused
            if (newStatus === qq.status.PAUSED) {
                clearTimeout(this._retryTimeouts[id]);
            }
        },

        _onValidateBatchCallbackFailure: function(fileWrappers) {
            var self = this;

            qq.each(fileWrappers, function(idx, fileWrapper) {
                self._fileOrBlobRejected(fileWrapper.id);
            });
        },

        _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint, button) {
            var errorMessage,
                itemLimit = this._currentItemLimit,
                proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued;

            if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {
                if (items.length > 0) {
                    this._handleCheckedCallback({
                        name: "onValidate",
                        callback: qq.bind(this._options.callbacks.onValidate, this, validationDescriptors[0], button),
                        onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),
                        onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),
                        identifier: "Item '" + items[0].file.name + "', size: " + items[0].file.size
                    });
                }
                else {
                    this._itemError("noFilesError");
                }
            }
            else {
                this._onValidateBatchCallbackFailure(items);
                errorMessage = this._options.messages.tooManyItemsError
                    .replace(/\{netItems\}/g, proposedNetFilesUploadedOrQueued)
                    .replace(/\{itemLimit\}/g, itemLimit);
                this._batchError(errorMessage);
            }
        },

        _onValidateCallbackFailure: function(items, index, params, endpoint) {
            var nextIndex = index + 1;

            this._fileOrBlobRejected(items[index].id, items[index].file.name);

            this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
        },

        _onValidateCallbackSuccess: function(items, index, params, endpoint) {
            var self = this,
                nextIndex = index + 1,
                validationDescriptor = this._getValidationDescriptor(items[index]);

            this._validateFileOrBlobData(items[index], validationDescriptor)
                .then(
                function() {
                    self._upload(items[index].id, params, endpoint);
                    self._maybeProcessNextItemAfterOnValidateCallback(true, items, nextIndex, params, endpoint);
                },
                function() {
                    self._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
                }
            );
        },

        _prepareItemsForUpload: function(items, params, endpoint) {
            if (items.length === 0) {
                this._itemError("noFilesError");
                return;
            }

            var validationDescriptors = this._getValidationDescriptors(items),
                buttonId = this._getButtonId(items[0].file),
                button = this._getButton(buttonId);

            this._handleCheckedCallback({
                name: "onValidateBatch",
                callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors, button),
                onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint, button),
                onFailure: qq.bind(this._onValidateBatchCallbackFailure, this, items),
                identifier: "batch validation"
            });
        },

        _preventLeaveInProgress: function() {
            var self = this;

            this._disposeSupport.attach(window, "beforeunload", function(e) {
                if (self.getInProgress()) {
                    e = e || window.event;
                    // for ie, ff
                    e.returnValue = self._options.messages.onLeave;
                    // for webkit
                    return self._options.messages.onLeave;
                }
            });
        },

        // Attempts to refresh session data only if the `qq.Session` module exists
        // and a session endpoint has been specified.  The `onSessionRequestComplete`
        // callback will be invoked once the refresh is complete.
        _refreshSessionData: function() {
            var self = this,
                options = this._options.session;

            /* jshint eqnull:true */
            if (qq.Session && this._options.session.endpoint != null) {
                if (!this._session) {
                    qq.extend(options, this._options.cors);

                    options.log = qq.bind(this.log, this);
                    options.addFileRecord = qq.bind(this._addCannedFile, this);

                    this._session = new qq.Session(options);
                }

                setTimeout(function() {
                    self._session.refresh().then(function(response, xhrOrXdr) {
                        self._sessionRequestComplete();
                        self._options.callbacks.onSessionRequestComplete(response, true, xhrOrXdr);

                    }, function(response, xhrOrXdr) {

                        self._options.callbacks.onSessionRequestComplete(response, false, xhrOrXdr);
                    });
                }, 0);
            }
        },

        _sessionRequestComplete: function() {},

        _setSize: function(id, newSize) {
            this._uploadData.updateSize(id, newSize);
            this._totalProgress && this._totalProgress.onNewSize(id);
        },

        _shouldAutoRetry: function(id, name, responseJSON) {
            var uploadData = this._uploadData.retrieve({id: id});

            /*jshint laxbreak: true */
            if (!this._preventRetries[id]
                && this._options.retry.enableAuto
                && uploadData.status !== qq.status.PAUSED) {

                if (this._autoRetries[id] === undefined) {
                    this._autoRetries[id] = 0;
                }

                if (this._autoRetries[id] < this._options.retry.maxAutoAttempts) {
                    this._autoRetries[id] += 1;
                    return true;
                }
            }

            return false;
        },

        _storeForLater: function(id) {
            this._storedIds.push(id);
        },

        // Maps a file with the button that was used to select it.
        _trackButton: function(id) {
            var buttonId;

            if (qq.supportedFeatures.ajaxUploading) {
                buttonId = this._handler.getFile(id).qqButtonId;
            }
            else {
                buttonId = this._getButtonId(this._handler.getInput(id));
            }

            if (buttonId) {
                this._buttonIdsForFileIds[id] = buttonId;
            }
        },

        _updateFormSupportAndParams: function(formElementOrId) {
            this._options.form.element = formElementOrId;

            this._formSupport = qq.FormSupport && new qq.FormSupport(
                    this._options.form, qq.bind(this.uploadStoredFiles, this), qq.bind(this.log, this)
                );

            if (this._formSupport && this._formSupport.attachedToForm) {
                this._paramsStore.addReadOnly(null, this._formSupport.getFormInputsAsObject);

                this._options.autoUpload = this._formSupport.newAutoUpload;
                if (this._formSupport.newEndpoint) {
                    this.setEndpoint(this._formSupport.newEndpoint);
                }
            }
        },

        _upload: function(id, params, endpoint) {
            var name = this.getName(id);

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

        _uploadFile: function(id) {
            if (!this._handler.upload(id)) {
                this._uploadData.setStatus(id, qq.status.QUEUED);
            }
        },

        _uploadStoredFiles: function() {
            var idToUpload, stillSubmitting,
                self = this;

            while (this._storedIds.length) {
                idToUpload = this._storedIds.shift();
                this._uploadFile(idToUpload);
            }

            // If we are still waiting for some files to clear validation, attempt to upload these again in a bit
            stillSubmitting = this.getUploads({status: qq.status.SUBMITTING}).length;
            if (stillSubmitting) {
                qq.log("Still waiting for " + stillSubmitting + " files to clear submit queue. Will re-parse stored IDs array shortly.");
                setTimeout(function() {
                    self._uploadStoredFiles();
                }, 1000);
            }
        },

        /**
         * Performs some internal validation checks on an item, defined in the `validation` option.
         *
         * @param fileWrapper Wrapper containing a `file` along with an `id`
         * @param validationDescriptor Normalized information about the item (`size`, `name`).
         * @returns qq.Promise with appropriate callbacks invoked depending on the validity of the file
         * @private
         */
        _validateFileOrBlobData: function(fileWrapper, validationDescriptor) {
            var self = this,
                file = (function() {
                    if (fileWrapper.file instanceof qq.BlobProxy) {
                        return fileWrapper.file.referenceBlob;
                    }
                    return fileWrapper.file;
                }()),
                name = validationDescriptor.name,
                size = validationDescriptor.size,
                buttonId = this._getButtonId(fileWrapper.file),
                validationBase = this._getValidationBase(buttonId),
                validityChecker = new qq.Promise();

            validityChecker.then(
                function() {},
                function() {
                    self._fileOrBlobRejected(fileWrapper.id, name);
                });

            if (qq.isFileOrInput(file) && !this._isAllowedExtension(validationBase.allowedExtensions, name)) {
                this._itemError("typeError", name, file);
                return validityChecker.failure();
            }

            if (size === 0) {
                this._itemError("emptyError", name, file);
                return validityChecker.failure();
            }

            if (size > 0 && validationBase.sizeLimit && size > validationBase.sizeLimit) {
                this._itemError("sizeError", name, file);
                return validityChecker.failure();
            }

            if (size > 0 && size < validationBase.minSizeLimit) {
                this._itemError("minSizeError", name, file);
                return validityChecker.failure();
            }

            if (qq.ImageValidation && qq.supportedFeatures.imagePreviews && qq.isFile(file)) {
                new qq.ImageValidation(file, qq.bind(self.log, self)).validate(validationBase.image).then(
                    validityChecker.success,
                    function(errorCode) {
                        self._itemError(errorCode + "ImageError", name, file);
                        validityChecker.failure();
                    }
                );
            }
            else {
                validityChecker.success();
            }

            return validityChecker;
        },

        _wrapCallbacks: function() {
            var self, safeCallback, prop;

            self = this;

            safeCallback = function(name, callback, args) {
                var errorMsg;

                try {
                    return callback.apply(self, args);
                }
                catch (exception) {
                    errorMsg = exception.message || exception.toString();
                    self.log("Caught exception in '" + name + "' callback - " + errorMsg, "error");
                }
            };

            /* jshint forin: false, loopfunc: true */
            for (prop in this._options.callbacks) {
                (function() {
                    var callbackName, callbackFunc;
                    callbackName = prop;
                    callbackFunc = self._options.callbacks[callbackName];
                    self._options.callbacks[callbackName] = function() {
                        return safeCallback(callbackName, callbackFunc, arguments);
                    };
                }());
            }
        }
    };
}());

/*globals qq*/
(function() {
    "use strict";

    qq.FineUploaderBasic = function(o) {
        var self = this;

        // These options define FineUploaderBasic mode.
        this._options = {
            debug: false,
            button: null,
            multiple: true,
            maxConnections: 3,
            disableCancelForFormUploads: false,
            autoUpload: true,

            request: {
                customHeaders: {},
                endpoint: "/server/upload",
                filenameParam: "qqfilename",
                forceMultipart: true,
                inputName: "qqfile",
                method: "POST",
                params: {},
                paramsInBody: true,
                totalFileSizeName: "qqtotalfilesize",
                uuidName: "qquuid"
            },

            validation: {
                allowedExtensions: [],
                sizeLimit: 0,
                minSizeLimit: 0,
                itemLimit: 0,
                stopOnFirstInvalidFile: true,
                acceptFiles: null,
                image: {
                    maxHeight: 0,
                    maxWidth: 0,
                    minHeight: 0,
                    minWidth: 0
                }
            },

            callbacks: {
                onSubmit: function(id, name) {},
                onSubmitted: function(id, name) {},
                onComplete: function(id, name, responseJSON, maybeXhr) {},
                onAllComplete: function(successful, failed) {},
                onCancel: function(id, name) {},
                onUpload: function(id, name) {},
                onUploadChunk: function(id, name, chunkData) {},
                onUploadChunkSuccess: function(id, chunkData, responseJSON, xhr) {},
                onResume: function(id, fileName, chunkData) {},
                onProgress: function(id, name, loaded, total) {},
                onTotalProgress: function(loaded, total) {},
                onError: function(id, name, reason, maybeXhrOrXdr) {},
                onAutoRetry: function(id, name, attemptNumber) {},
                onManualRetry: function(id, name) {},
                onValidateBatch: function(fileOrBlobData) {},
                onValidate: function(fileOrBlobData) {},
                onSubmitDelete: function(id) {},
                onDelete: function(id) {},
                onDeleteComplete: function(id, xhrOrXdr, isError) {},
                onPasteReceived: function(blob) {},
                onStatusChange: function(id, oldStatus, newStatus) {},
                onSessionRequestComplete: function(response, success, xhrOrXdr) {}
            },

            messages: {
                typeError: "{file} has an invalid extension. Valid extension(s): {extensions}.",
                sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
                minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
                emptyError: "{file} is empty, please select files again without it.",
                noFilesError: "No files to upload.",
                tooManyItemsError: "Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.",
                maxHeightImageError: "Image is too tall.",
                maxWidthImageError: "Image is too wide.",
                minHeightImageError: "Image is not tall enough.",
                minWidthImageError: "Image is not wide enough.",
                retryFailTooManyItems: "Retry failed - you have reached your file limit.",
                onLeave: "The files are being uploaded, if you leave now the upload will be canceled.",
                unsupportedBrowserIos8Safari: "Unrecoverable error - this browser does not permit file uploading of any kind due to serious bugs in iOS8 Safari.  Please use iOS8 Chrome until Apple fixes these issues."
            },

            retry: {
                enableAuto: false,
                maxAutoAttempts: 3,
                autoAttemptDelay: 5,
                preventRetryResponseProperty: "preventRetry"
            },

            classes: {
                buttonHover: "qq-upload-button-hover",
                buttonFocus: "qq-upload-button-focus"
            },

            chunking: {
                enabled: false,
                concurrent: {
                    enabled: false
                },
                mandatory: false,
                paramNames: {
                    partIndex: "qqpartindex",
                    partByteOffset: "qqpartbyteoffset",
                    chunkSize: "qqchunksize",
                    totalFileSize: "qqtotalfilesize",
                    totalParts: "qqtotalparts"
                },
                partSize: 2000000,
                // only relevant for traditional endpoints, only required when concurrent.enabled === true
                success: {
                    endpoint: null
                }
            },

            resume: {
                enabled: false,
                recordsExpireIn: 7, //days
                paramNames: {
                    resuming: "qqresume"
                }
            },

            formatFileName: function(fileOrBlobName) {
                return fileOrBlobName;
            },

            text: {
                defaultResponseError: "Upload failure reason unknown",
                fileInputTitle: "file input",
                sizeSymbols: ["kB", "MB", "GB", "TB", "PB", "EB"]
            },

            deleteFile: {
                enabled: false,
                method: "DELETE",
                endpoint: "/server/upload",
                customHeaders: {},
                params: {}
            },

            cors: {
                expected: false,
                sendCredentials: false,
                allowXdr: false
            },

            blobs: {
                defaultName: "misc_data"
            },

            paste: {
                targetElement: null,
                defaultName: "pasted_image"
            },

            camera: {
                ios: false,

                // if ios is true: button is null means target the default button, otherwise target the button specified
                button: null
            },

            // This refers to additional upload buttons to be handled by Fine Uploader.
            // Each element is an object, containing `element` as the only required
            // property.  The `element` must be a container that will ultimately
            // contain an invisible `<input type="file">` created by Fine Uploader.
            // Optional properties of each object include `multiple`, `validation`,
            // and `folders`.
            extraButtons: [],

            // Depends on the session module.  Used to query the server for an initial file list
            // during initialization and optionally after a `reset`.
            session: {
                endpoint: null,
                params: {},
                customHeaders: {},
                refreshOnReset: true
            },

            // Send parameters associated with an existing form along with the files
            form: {
                // Element ID, HTMLElement, or null
                element: "qq-form",

                // Overrides the base `autoUpload`, unless `element` is null.
                autoUpload: false,

                // true = upload files on form submission (and squelch submit event)
                interceptSubmit: true
            },

            // scale images client side, upload a new file for each scaled version
            scaling: {
                // send the original file as well
                sendOriginal: true,

                // fox orientation for scaled images
                orient: true,

                // If null, scaled image type will match reference image type.  This value will be referred to
                // for any size record that does not specific a type.
                defaultType: null,

                defaultQuality: 80,

                failureText: "Failed to scale",

                includeExif: false,

                // metadata about each requested scaled version
                sizes: []
            },

            workarounds: {
                iosEmptyVideos: true,
                ios8SafariUploads: true,
                ios8BrowserCrash: false
            }
        };

        // Replace any default options with user defined ones
        qq.extend(this._options, o, true);

        this._buttons = [];
        this._extraButtonSpecs = {};
        this._buttonIdsForFileIds = [];

        this._wrapCallbacks();
        this._disposeSupport =  new qq.DisposeSupport();

        this._storedIds = [];
        this._autoRetries = [];
        this._retryTimeouts = [];
        this._preventRetries = [];
        this._thumbnailUrls = [];

        this._netUploadedOrQueued = 0;
        this._netUploaded = 0;
        this._uploadData = this._createUploadDataTracker();

        this._initFormSupportAndParams();

        this._customHeadersStore = this._createStore(this._options.request.customHeaders);
        this._deleteFileCustomHeadersStore = this._createStore(this._options.deleteFile.customHeaders);

        this._deleteFileParamsStore = this._createStore(this._options.deleteFile.params);

        this._endpointStore = this._createStore(this._options.request.endpoint);
        this._deleteFileEndpointStore = this._createStore(this._options.deleteFile.endpoint);

        this._handler = this._createUploadHandler();

        this._deleteHandler = qq.DeleteFileAjaxRequester && this._createDeleteHandler();

        if (this._options.button) {
            this._defaultButtonId = this._createUploadButton({
                element: this._options.button,
                title: this._options.text.fileInputTitle
            }).getButtonId();
        }

        this._generateExtraButtonSpecs();

        this._handleCameraAccess();

        if (this._options.paste.targetElement) {
            if (qq.PasteSupport) {
                this._pasteHandler = this._createPasteHandler();
            }
            else {
                this.log("Paste support module not found", "error");
            }
        }

        this._preventLeaveInProgress();

        this._imageGenerator = qq.ImageGenerator && new qq.ImageGenerator(qq.bind(this.log, this));
        this._refreshSessionData();

        this._succeededSinceLastAllComplete = [];
        this._failedSinceLastAllComplete = [];

        this._scaler = (qq.Scaler && new qq.Scaler(this._options.scaling, qq.bind(this.log, this))) || {};
        if (this._scaler.enabled) {
            this._customNewFileHandler = qq.bind(this._scaler.handleNewFile, this._scaler);
        }

        if (qq.TotalProgress && qq.supportedFeatures.progressBar) {
            this._totalProgress = new qq.TotalProgress(
                qq.bind(this._onTotalProgress, this),

                function(id) {
                    var entry = self._uploadData.retrieve({id: id});
                    return (entry && entry.size) || 0;
                }
            );
        }

        this._currentItemLimit = this._options.validation.itemLimit;
    };

    // Define the private & public API methods.
    qq.FineUploaderBasic.prototype = qq.basePublicApi;
    qq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);
}());

/*globals qq, XDomainRequest*/
/** Generic class for sending non-upload ajax requests and handling the associated responses **/
qq.AjaxRequester = function(o) {
    "use strict";

    var log, shouldParamsBeInQueryString,
        queue = [],
        requestData = {},
        options = {
            acceptHeader: null,
            validMethods: ["PATCH", "POST", "PUT"],
            method: "POST",
            contentType: "application/x-www-form-urlencoded",
            maxConnections: 3,
            customHeaders: {},
            endpointStore: {},
            paramsStore: {},
            mandatedParams: {},
            allowXRequestedWithAndCacheControl: true,
            successfulResponseCodes: {
                DELETE: [200, 202, 204],
                PATCH: [200, 201, 202, 203, 204],
                POST: [200, 201, 202, 203, 204],
                PUT: [200, 201, 202, 203, 204],
                GET: [200]
            },
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {},
            onSend: function(id) {},
            onComplete: function(id, xhrOrXdr, isError) {},
            onProgress: null
        };

    qq.extend(options, o);
    log = options.log;

    if (qq.indexOf(options.validMethods, options.method) < 0) {
        throw new Error("'" + options.method + "' is not a supported method for this type of request!");
    }

    // [Simple methods](http://www.w3.org/TR/cors/#simple-method)
    // are defined by the W3C in the CORS spec as a list of methods that, in part,
    // make a CORS request eligible to be exempt from preflighting.
    function isSimpleMethod() {
        return qq.indexOf(["GET", "POST", "HEAD"], options.method) >= 0;
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

        if (window.XMLHttpRequest || window.ActiveXObject) {
            xhrOrXdr = qq.createXhrInstance();

            if (xhrOrXdr.withCredentials === undefined) {
                xhrOrXdr = new XDomainRequest();
                // Workaround for XDR bug in IE9 - https://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
                xhrOrXdr.onload = function() {};
                xhrOrXdr.onerror = function() {};
                xhrOrXdr.ontimeout = function() {};
                xhrOrXdr.onprogress = function() {};
            }
        }

        return xhrOrXdr;
    }

    // Returns either a new XHR/XDR instance, or an existing one for the associated `File` or `Blob`.
    function getXhrOrXdr(id, suppliedXhr) {
        var xhrOrXdr = requestData[id].xhr;

        if (!xhrOrXdr) {
            if (suppliedXhr) {
                xhrOrXdr = suppliedXhr;
            }
            else {
                if (options.cors.expected) {
                    xhrOrXdr = getCorsAjaxTransport();
                }
                else {
                    xhrOrXdr = qq.createXhrInstance();
                }
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
            method = options.method,
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
        var onDemandParams = requestData[id].additionalParams,
            mandatedParams = options.mandatedParams,
            params;

        if (options.paramsStore.get) {
            params = options.paramsStore.get(id);
        }

        if (onDemandParams) {
            qq.each(onDemandParams, function(name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        if (mandatedParams) {
            qq.each(mandatedParams, function(name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        return params;
    }

    function sendRequest(id, optXhr) {
        var xhr = getXhrOrXdr(id, optXhr),
            method = options.method,
            params = getParams(id),
            payload = requestData[id].payload,
            url;

        options.onSend(id);

        url = createUrl(id, params, requestData[id].additionalQueryParams);

        // XDR and XHR status detection APIs differ a bit.
        if (isXdr(xhr)) {
            xhr.onload = getXdrLoadHandler(id);
            xhr.onerror = getXdrErrorHandler(id);
        }
        else {
            xhr.onreadystatechange = getXhrReadyStateChangeHandler(id);
        }

        registerForUploadProgress(id);

        // The last parameter is assumed to be ignored if we are actually using `XDomainRequest`.
        xhr.open(method, url, true);

        // Instruct the transport to send cookies along with the CORS request,
        // unless we are using `XDomainRequest`, which is not capable of this.
        if (options.cors.expected && options.cors.sendCredentials && !isXdr(xhr)) {
            xhr.withCredentials = true;
        }

        setHeaders(id);

        log("Sending " + method + " request for " + id);

        if (payload) {
            xhr.send(payload);
        }
        else if (shouldParamsBeInQueryString || !params) {
            xhr.send();
        }
        else if (params && options.contentType && options.contentType.toLowerCase().indexOf("application/x-www-form-urlencoded") >= 0) {
            xhr.send(qq.obj2url(params, ""));
        }
        else if (params && options.contentType && options.contentType.toLowerCase().indexOf("application/json") >= 0) {
            xhr.send(JSON.stringify(params));
        }
        else {
            xhr.send(params);
        }

        return xhr;
    }

    function createUrl(id, params, additionalQueryParams) {
        var endpoint = options.endpointStore.get(id),
            addToPath = requestData[id].addToPath;

        /*jshint -W116,-W041 */
        if (addToPath != undefined) {
            endpoint += "/" + addToPath;
        }

        if (shouldParamsBeInQueryString && params) {
            endpoint = qq.obj2url(params, endpoint);
        }

        if (additionalQueryParams) {
            endpoint = qq.obj2url(additionalQueryParams, endpoint);
        }

        return endpoint;
    }

    // Invoked by the UA to indicate a number of possible states that describe
    // a live `XMLHttpRequest` transport.
    function getXhrReadyStateChangeHandler(id) {
        return function() {
            if (getXhrOrXdr(id).readyState === 4) {
                onComplete(id);
            }
        };
    }

    function registerForUploadProgress(id) {
        var onProgress = options.onProgress;

        if (onProgress) {
            getXhrOrXdr(id).upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    onProgress(id, e.loaded, e.total);
                }
            };
        }
    }

    // This will be called by IE to indicate **success** for an associated
    // `XDomainRequest` transported request.
    function getXdrLoadHandler(id) {
        return function() {
            onComplete(id);
        };
    }

    // This will be called by IE to indicate **failure** for an associated
    // `XDomainRequest` transported request.
    function getXdrErrorHandler(id) {
        return function() {
            onComplete(id, true);
        };
    }

    function setHeaders(id) {
        var xhr = getXhrOrXdr(id),
            customHeaders = options.customHeaders,
            onDemandHeaders = requestData[id].additionalHeaders || {},
            method = options.method,
            allHeaders = {};

        // If XDomainRequest is being used, we can't set headers, so just ignore this block.
        if (!isXdr(xhr)) {
            options.acceptHeader && xhr.setRequestHeader("Accept", options.acceptHeader);

            // Only attempt to add X-Requested-With & Cache-Control if permitted
            if (options.allowXRequestedWithAndCacheControl) {
                // Do not add X-Requested-With & Cache-Control if this is a cross-origin request
                // OR the cross-origin request contains a non-simple method or header.
                // This is done to ensure a preflight is not triggered exclusively based on the
                // addition of these 2 non-simple headers.
                if (!options.cors.expected || (!isSimpleMethod() || containsNonSimpleHeaders(customHeaders))) {
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    xhr.setRequestHeader("Cache-Control", "no-cache");
                }
            }

            if (options.contentType && (method === "POST" || method === "PUT")) {
                xhr.setRequestHeader("Content-Type", options.contentType);
            }

            qq.extend(allHeaders, qq.isFunction(customHeaders) ? customHeaders(id) : customHeaders);
            qq.extend(allHeaders, onDemandHeaders);

            qq.each(allHeaders, function(name, val) {
                xhr.setRequestHeader(name, val);
            });
        }
    }

    function isResponseSuccessful(responseCode) {
        return qq.indexOf(options.successfulResponseCodes[options.method], responseCode) >= 0;
    }

    function prepareToSend(id, optXhr, addToPath, additionalParams, additionalQueryParams, additionalHeaders, payload) {
        requestData[id] = {
            addToPath: addToPath,
            additionalParams: additionalParams,
            additionalQueryParams: additionalQueryParams,
            additionalHeaders: additionalHeaders,
            payload: payload
        };

        var len = queue.push(id);

        // if too many active connections, wait...
        if (len <= options.maxConnections) {
            return sendRequest(id, optXhr);
        }
    }

    shouldParamsBeInQueryString = options.method === "GET" || options.method === "DELETE";

    qq.extend(this, {
        // Start the process of sending the request.  The ID refers to the file associated with the request.
        initTransport: function(id) {
            var path, params, headers, payload, cacheBuster, additionalQueryParams;

            return {
                // Optionally specify the end of the endpoint path for the request.
                withPath: function(appendToPath) {
                    path = appendToPath;
                    return this;
                },

                // Optionally specify additional parameters to send along with the request.
                // These will be added to the query string for GET/DELETE requests or the payload
                // for POST/PUT requests.  The Content-Type of the request will be used to determine
                // how these parameters should be formatted as well.
                withParams: function(additionalParams) {
                    params = additionalParams;
                    return this;
                },

                withQueryParams: function(_additionalQueryParams_) {
                    additionalQueryParams = _additionalQueryParams_;
                    return this;
                },

                // Optionally specify additional headers to send along with the request.
                withHeaders: function(additionalHeaders) {
                    headers = additionalHeaders;
                    return this;
                },

                // Optionally specify a payload/body for the request.
                withPayload: function(thePayload) {
                    payload = thePayload;
                    return this;
                },

                // Appends a cache buster (timestamp) to the request URL as a query parameter (only if GET or DELETE)
                withCacheBuster: function() {
                    cacheBuster = true;
                    return this;
                },

                // Send the constructed request.
                send: function(optXhr) {
                    if (cacheBuster && qq.indexOf(["GET", "DELETE"], options.method) >= 0) {
                        params.qqtimestamp = new Date().getTime();
                    }

                    return prepareToSend(id, optXhr, path, params, additionalQueryParams, headers, payload);
                }
            };
        },

        canceled: function(id) {
            dequeue(id);
        }
    });
};

/* globals qq */
/**
 * Common upload handler functions.
 *
 * @constructor
 */
qq.UploadHandler = function(spec) {
    "use strict";

    var proxy = spec.proxy,
        fileState = {},
        onCancel = proxy.onCancel,
        getName = proxy.getName;

    qq.extend(this, {
        add: function(id, fileItem) {
            fileState[id] = fileItem;
            fileState[id].temp = {};
        },

        cancel: function(id) {
            var self = this,
                cancelFinalizationEffort = new qq.Promise(),
                onCancelRetVal = onCancel(id, getName(id), cancelFinalizationEffort);

            onCancelRetVal.then(function() {
                if (self.isValid(id)) {
                    fileState[id].canceled = true;
                    self.expunge(id);
                }
                cancelFinalizationEffort.success();
            });
        },

        expunge: function(id) {
            delete fileState[id];
        },

        getThirdPartyFileId: function(id) {
            return fileState[id].key;
        },

        isValid: function(id) {
            return fileState[id] !== undefined;
        },

        reset: function() {
            fileState = {};
        },

        _getFileState: function(id) {
            return fileState[id];
        },

        _setThirdPartyFileId: function(id, thirdPartyFileId) {
            fileState[id].key = thirdPartyFileId;
        },

        _wasCanceled: function(id) {
            return !!fileState[id].canceled;
        }
    });
};

/*globals qq*/
/**
 * Base upload handler module.  Controls more specific handlers.
 *
 * @param o Options.  Passed along to the specific handler submodule as well.
 * @param namespace [optional] Namespace for the specific handler.
 */
qq.UploadHandlerController = function(o, namespace) {
    "use strict";

    var controller = this,
        chunkingPossible = false,
        concurrentChunkingPossible = false,
        chunking, preventRetryResponse, log, handler,

    options = {
        paramsStore: {},
        maxConnections: 3, // maximum number of concurrent uploads
        chunking: {
            enabled: false,
            multiple: {
                enabled: false
            }
        },
        log: function(str, level) {},
        onProgress: function(id, fileName, loaded, total) {},
        onComplete: function(id, fileName, response, xhr) {},
        onCancel: function(id, fileName) {},
        onUploadPrep: function(id) {}, // Called if non-trivial operations will be performed before onUpload
        onUpload: function(id, fileName) {},
        onUploadChunk: function(id, fileName, chunkData) {},
        onUploadChunkSuccess: function(id, chunkData, response, xhr) {},
        onAutoRetry: function(id, fileName, response, xhr) {},
        onResume: function(id, fileName, chunkData) {},
        onUuidChanged: function(id, newUuid) {},
        getName: function(id) {},
        setSize: function(id, newSize) {},
        isQueued: function(id) {},
        getIdsInProxyGroup: function(id) {},
        getIdsInBatch: function(id) {}
    },

    chunked = {
        // Called when each chunk has uploaded successfully
        done: function(id, chunkIdx, response, xhr) {
            var chunkData = handler._getChunkData(id, chunkIdx);

            handler._getFileState(id).attemptingResume = false;

            delete handler._getFileState(id).temp.chunkProgress[chunkIdx];
            handler._getFileState(id).loaded += chunkData.size;

            options.onUploadChunkSuccess(id, handler._getChunkDataForCallback(chunkData), response, xhr);
        },

        // Called when all chunks have been successfully uploaded and we want to ask the handler to perform any
        // logic associated with closing out the file, such as combining the chunks.
        finalize: function(id) {
            var size = options.getSize(id),
                name = options.getName(id);

            log("All chunks have been uploaded for " + id + " - finalizing....");
            handler.finalizeChunks(id).then(
                function(response, xhr) {
                    log("Finalize successful for " + id);

                    var normaizedResponse = upload.normalizeResponse(response, true);

                    options.onProgress(id, name, size, size);
                    handler._maybeDeletePersistedChunkData(id);
                    upload.cleanup(id, normaizedResponse, xhr);
                },
                function(response, xhr) {
                    var normaizedResponse = upload.normalizeResponse(response, false);

                    log("Problem finalizing chunks for file ID " + id + " - " + normaizedResponse.error, "error");

                    if (normaizedResponse.reset) {
                        chunked.reset(id);
                    }

                    if (!options.onAutoRetry(id, name, normaizedResponse, xhr)) {
                        upload.cleanup(id, normaizedResponse, xhr);
                    }
                }
            );
        },

        hasMoreParts: function(id) {
            return !!handler._getFileState(id).chunking.remaining.length;
        },

        nextPart: function(id) {
            var nextIdx = handler._getFileState(id).chunking.remaining.shift();

            if (nextIdx >= handler._getTotalChunks(id)) {
                nextIdx = null;
            }

            return nextIdx;
        },

        reset: function(id) {
            log("Server or callback has ordered chunking effort to be restarted on next attempt for item ID " + id, "error");

            handler._maybeDeletePersistedChunkData(id);
            handler.reevaluateChunking(id);
            handler._getFileState(id).loaded = 0;
        },

        sendNext: function(id) {
            var size = options.getSize(id),
                name = options.getName(id),
                chunkIdx = chunked.nextPart(id),
                chunkData = handler._getChunkData(id, chunkIdx),
                resuming = handler._getFileState(id).attemptingResume,
                inProgressChunks = handler._getFileState(id).chunking.inProgress || [];

            if (handler._getFileState(id).loaded == null) {
                handler._getFileState(id).loaded = 0;
            }

            // Don't follow-through with the resume attempt if the integrator returns false from onResume
            if (resuming && options.onResume(id, name, chunkData) === false) {
                chunked.reset(id);
                chunkIdx = chunked.nextPart(id);
                chunkData = handler._getChunkData(id, chunkIdx);
                resuming = false;
            }

            // If all chunks have already uploaded successfully, we must be re-attempting the finalize step.
            if (chunkIdx == null && inProgressChunks.length === 0) {
                chunked.finalize(id);
            }

            // Send the next chunk
            else {
                log(qq.format("Sending chunked upload request for item {}.{}, bytes {}-{} of {}.", id, chunkIdx, chunkData.start + 1, chunkData.end, size));
                options.onUploadChunk(id, name, handler._getChunkDataForCallback(chunkData));
                inProgressChunks.push(chunkIdx);
                handler._getFileState(id).chunking.inProgress = inProgressChunks;

                if (concurrentChunkingPossible) {
                    connectionManager.open(id, chunkIdx);
                }

                if (concurrentChunkingPossible && connectionManager.available() && handler._getFileState(id).chunking.remaining.length) {
                    chunked.sendNext(id);
                }

                handler.uploadChunk(id, chunkIdx, resuming).then(
                    // upload chunk success
                    function success(response, xhr) {
                        log("Chunked upload request succeeded for " + id + ", chunk " + chunkIdx);

                        handler.clearCachedChunk(id, chunkIdx);

                        var inProgressChunks = handler._getFileState(id).chunking.inProgress || [],
                            responseToReport = upload.normalizeResponse(response, true),
                            inProgressChunkIdx = qq.indexOf(inProgressChunks, chunkIdx);

                        log(qq.format("Chunk {} for file {} uploaded successfully.", chunkIdx, id));

                        chunked.done(id, chunkIdx, responseToReport, xhr);

                        if (inProgressChunkIdx >= 0) {
                            inProgressChunks.splice(inProgressChunkIdx, 1);
                        }

                        handler._maybePersistChunkedState(id);

                        if (!chunked.hasMoreParts(id) && inProgressChunks.length === 0) {
                            chunked.finalize(id);
                        }
                        else if (chunked.hasMoreParts(id)) {
                            chunked.sendNext(id);
                        }
                        else {
                            log(qq.format("File ID {} has no more chunks to send and these chunk indexes are still marked as in-progress: {}", id, JSON.stringify(inProgressChunks)));
                        }
                    },

                    // upload chunk failure
                    function failure(response, xhr) {
                        log("Chunked upload request failed for " + id + ", chunk " + chunkIdx);

                        handler.clearCachedChunk(id, chunkIdx);

                        var responseToReport = upload.normalizeResponse(response, false),
                            inProgressIdx;

                        if (responseToReport.reset) {
                            chunked.reset(id);
                        }
                        else {
                            inProgressIdx = qq.indexOf(handler._getFileState(id).chunking.inProgress, chunkIdx);
                            if (inProgressIdx >= 0) {
                                handler._getFileState(id).chunking.inProgress.splice(inProgressIdx, 1);
                                handler._getFileState(id).chunking.remaining.unshift(chunkIdx);
                            }
                        }

                        // We may have aborted all other in-progress chunks for this file due to a failure.
                        // If so, ignore the failures associated with those aborts.
                        if (!handler._getFileState(id).temp.ignoreFailure) {
                            // If this chunk has failed, we want to ignore all other failures of currently in-progress
                            // chunks since they will be explicitly aborted
                            if (concurrentChunkingPossible) {
                                handler._getFileState(id).temp.ignoreFailure = true;

                                log(qq.format("Going to attempt to abort these chunks: {}. These are currently in-progress: {}.", JSON.stringify(Object.keys(handler._getXhrs(id))), JSON.stringify(handler._getFileState(id).chunking.inProgress)));
                                qq.each(handler._getXhrs(id), function(ckid, ckXhr) {
                                    log(qq.format("Attempting to abort file {}.{}. XHR readyState {}. ", id, ckid, ckXhr.readyState));
                                    ckXhr.abort();
                                    // Flag the transport, in case we are waiting for some other async operation
                                    // to complete before attempting to upload the chunk
                                    ckXhr._cancelled = true;
                                });

                                // We must indicate that all aborted chunks are no longer in progress
                                handler.moveInProgressToRemaining(id);

                                // Free up any connections used by these chunks, but don't allow any
                                // other files to take up the connections (until we have exhausted all auto-retries)
                                connectionManager.free(id, true);
                            }

                            if (!options.onAutoRetry(id, name, responseToReport, xhr)) {
                                // If one chunk fails, abort all of the others to avoid odd race conditions that occur
                                // if a chunk succeeds immediately after one fails before we have determined if the upload
                                // is a failure or not.
                                upload.cleanup(id, responseToReport, xhr);
                            }
                        }
                    }
                )
                    .done(function() {
                        handler.clearXhr(id, chunkIdx);
                    }) ;
            }
        }
    },

    connectionManager = {
        _open: [],
        _openChunks: {},
        _waiting: [],

        available: function() {
            var max = options.maxConnections,
                openChunkEntriesCount = 0,
                openChunksCount = 0;

            qq.each(connectionManager._openChunks, function(fileId, openChunkIndexes) {
                openChunkEntriesCount++;
                openChunksCount += openChunkIndexes.length;
            });

            return max - (connectionManager._open.length - openChunkEntriesCount + openChunksCount);
        },

        /**
         * Removes element from queue, starts upload of next
         */
        free: function(id, dontAllowNext) {
            var allowNext = !dontAllowNext,
                waitingIndex = qq.indexOf(connectionManager._waiting, id),
                connectionsIndex = qq.indexOf(connectionManager._open, id),
                nextId;

            delete connectionManager._openChunks[id];

            if (upload.getProxyOrBlob(id) instanceof qq.BlobProxy) {
                log("Generated blob upload has ended for " + id + ", disposing generated blob.");
                delete handler._getFileState(id).file;
            }

            // If this file was not consuming a connection, it was just waiting, so remove it from the waiting array
            if (waitingIndex >= 0) {
                connectionManager._waiting.splice(waitingIndex, 1);
            }
            // If this file was consuming a connection, allow the next file to be uploaded
            else if (allowNext && connectionsIndex >= 0) {
                connectionManager._open.splice(connectionsIndex, 1);

                nextId = connectionManager._waiting.shift();
                if (nextId >= 0) {
                    connectionManager._open.push(nextId);
                    upload.start(nextId);
                }
            }
        },

        getWaitingOrConnected: function() {
            var waitingOrConnected = [];

            // Chunked files may have multiple connections open per chunk (if concurrent chunking is enabled)
            // We need to grab the file ID of any file that has at least one chunk consuming a connection.
            qq.each(connectionManager._openChunks, function(fileId, chunks) {
                if (chunks && chunks.length) {
                    waitingOrConnected.push(parseInt(fileId));
                }
            });

            // For non-chunked files, only one connection will be consumed per file.
            // This is where we aggregate those file IDs.
            qq.each(connectionManager._open, function(idx, fileId) {
                if (!connectionManager._openChunks[fileId]) {
                    waitingOrConnected.push(parseInt(fileId));
                }
            });

            // There may be files waiting for a connection.
            waitingOrConnected = waitingOrConnected.concat(connectionManager._waiting);

            return waitingOrConnected;
        },

        isUsingConnection: function(id) {
            return qq.indexOf(connectionManager._open, id) >= 0;
        },

        open: function(id, chunkIdx) {
            if (chunkIdx == null) {
                connectionManager._waiting.push(id);
            }

            if (connectionManager.available()) {
                if (chunkIdx == null) {
                    connectionManager._waiting.pop();
                    connectionManager._open.push(id);
                }
                else {
                    (function() {
                        var openChunksEntry = connectionManager._openChunks[id] || [];
                        openChunksEntry.push(chunkIdx);
                        connectionManager._openChunks[id] = openChunksEntry;
                    }());
                }

                return true;
            }

            return false;
        },

        reset: function() {
            connectionManager._waiting = [];
            connectionManager._open = [];
        }
    },

    simple = {
        send: function(id, name) {
            handler._getFileState(id).loaded = 0;

            log("Sending simple upload request for " + id);
            handler.uploadFile(id).then(
                function(response, optXhr) {
                    log("Simple upload request succeeded for " + id);

                    var responseToReport = upload.normalizeResponse(response, true),
                        size = options.getSize(id);

                    options.onProgress(id, name, size, size);
                    upload.maybeNewUuid(id, responseToReport);
                    upload.cleanup(id, responseToReport, optXhr);
                },

                function(response, optXhr) {
                    log("Simple upload request failed for " + id);

                    var responseToReport = upload.normalizeResponse(response, false);

                    if (!options.onAutoRetry(id, name, responseToReport, optXhr)) {
                        upload.cleanup(id, responseToReport, optXhr);
                    }
                }
            );
        }
    },

    upload = {
        cancel: function(id) {
            log("Cancelling " + id);
            options.paramsStore.remove(id);
            connectionManager.free(id);
        },

        cleanup: function(id, response, optXhr) {
            var name = options.getName(id);

            options.onComplete(id, name, response, optXhr);

            if (handler._getFileState(id)) {
                handler._clearXhrs && handler._clearXhrs(id);
            }

            connectionManager.free(id);
        },

        // Returns a qq.BlobProxy, or an actual File/Blob if no proxy is involved, or undefined
        // if none of these are available for the ID
        getProxyOrBlob: function(id) {
            return (handler.getProxy && handler.getProxy(id)) ||
                (handler.getFile && handler.getFile(id));
        },

        initHandler: function() {
            var handlerType = namespace ? qq[namespace] : qq.traditional,
                handlerModuleSubtype = qq.supportedFeatures.ajaxUploading ? "Xhr" : "Form";

            handler = new handlerType[handlerModuleSubtype + "UploadHandler"](
                options,
                {
                    getDataByUuid: options.getDataByUuid,
                    getName: options.getName,
                    getSize: options.getSize,
                    getUuid: options.getUuid,
                    log: log,
                    onCancel: options.onCancel,
                    onProgress: options.onProgress,
                    onUuidChanged: options.onUuidChanged
                }
            );

            if (handler._removeExpiredChunkingRecords) {
                handler._removeExpiredChunkingRecords();
            }
        },

        isDeferredEligibleForUpload: function(id) {
            return options.isQueued(id);
        },

        // For Blobs that are part of a group of generated images, along with a reference image,
        // this will ensure the blobs in the group are uploaded in the order they were triggered,
        // even if some async processing must be completed on one or more Blobs first.
        maybeDefer: function(id, blob) {
            // If we don't have a file/blob yet & no file/blob exists for this item, request it,
            // and then submit the upload to the specific handler once the blob is available.
            // ASSUMPTION: This condition will only ever be true if XHR uploading is supported.
            if (blob && !handler.getFile(id) && blob instanceof qq.BlobProxy) {

                // Blob creation may take some time, so the caller may want to update the
                // UI to indicate that an operation is in progress, even before the actual
                // upload begins and an onUpload callback is invoked.
                options.onUploadPrep(id);

                log("Attempting to generate a blob on-demand for " + id);
                blob.create().then(function(generatedBlob) {
                    log("Generated an on-demand blob for " + id);

                    // Update record associated with this file by providing the generated Blob
                    handler.updateBlob(id, generatedBlob);

                    // Propagate the size for this generated Blob
                    options.setSize(id, generatedBlob.size);

                    // Order handler to recalculate chunking possibility, if applicable
                    handler.reevaluateChunking(id);

                    upload.maybeSendDeferredFiles(id);
                },

                // Blob could not be generated.  Fail the upload & attempt to prevent retries.  Also bubble error message.
                function(errorMessage) {
                    var errorResponse = {};

                    if (errorMessage) {
                        errorResponse.error = errorMessage;
                    }

                    log(qq.format("Failed to generate blob for ID {}.  Error message: {}.", id, errorMessage), "error");

                    options.onComplete(id, options.getName(id), qq.extend(errorResponse, preventRetryResponse), null);
                    upload.maybeSendDeferredFiles(id);
                    connectionManager.free(id);
                });
            }
            else {
                return upload.maybeSendDeferredFiles(id);
            }

            return false;
        },

        // Upload any grouped blobs, in the proper order, that are ready to be uploaded
        maybeSendDeferredFiles: function(id) {
            var idsInGroup = options.getIdsInProxyGroup(id),
                uploadedThisId = false;

            if (idsInGroup && idsInGroup.length) {
                log("Maybe ready to upload proxy group file " + id);

                qq.each(idsInGroup, function(idx, idInGroup) {
                    if (upload.isDeferredEligibleForUpload(idInGroup) && !!handler.getFile(idInGroup)) {
                        uploadedThisId = idInGroup === id;
                        upload.now(idInGroup);
                    }
                    else if (upload.isDeferredEligibleForUpload(idInGroup)) {
                        return false;
                    }
                });
            }
            else {
                uploadedThisId = true;
                upload.now(id);
            }

            return uploadedThisId;
        },

        maybeNewUuid: function(id, response) {
            if (response.newUuid !== undefined) {
                options.onUuidChanged(id, response.newUuid);
            }
        },

        // The response coming from handler implementations may be in various formats.
        // Instead of hoping a promise nested 5 levels deep will always return an object
        // as its first param, let's just normalize the response here.
        normalizeResponse: function(originalResponse, successful) {
            var response = originalResponse;

            // The passed "response" param may not be a response at all.
            // It could be a string, detailing the error, for example.
            if (!qq.isObject(originalResponse)) {
                response = {};

                if (qq.isString(originalResponse) && !successful) {
                    response.error = originalResponse;
                }
            }

            response.success = successful;

            return response;
        },

        now: function(id) {
            var name = options.getName(id);

            if (!controller.isValid(id)) {
                throw new qq.Error(id + " is not a valid file ID to upload!");
            }

            options.onUpload(id, name);

            if (chunkingPossible && handler._shouldChunkThisFile(id)) {
                chunked.sendNext(id);
            }
            else {
                simple.send(id, name);
            }
        },

        start: function(id) {
            var blobToUpload = upload.getProxyOrBlob(id);

            if (blobToUpload) {
                return upload.maybeDefer(id, blobToUpload);
            }
            else {
                upload.now(id);
                return true;
            }
        }
    };

    qq.extend(this, {
        /**
         * Adds file or file input to the queue
         **/
        add: function(id, file) {
            handler.add.apply(this, arguments);
        },

        /**
         * Sends the file identified by id
         */
        upload: function(id) {
            if (connectionManager.open(id)) {
                return upload.start(id);
            }
            return false;
        },

        retry: function(id) {
            // On retry, if concurrent chunking has been enabled, we may have aborted all other in-progress chunks
            // for a file when encountering a failed chunk upload.  We then signaled the controller to ignore
            // all failures associated with these aborts.  We are now retrying, so we don't want to ignore
            // any more failures at this point.
            if (concurrentChunkingPossible) {
                handler._getFileState(id).temp.ignoreFailure = false;
            }

            // If we are attempting to retry a file that is already consuming a connection, this is likely an auto-retry.
            // Just go ahead and ask the handler to upload again.
            if (connectionManager.isUsingConnection(id)) {
                return upload.start(id);
            }

            // If we are attempting to retry a file that is not currently consuming a connection,
            // this is likely a manual retry attempt.  We will need to ensure a connection is available
            // before the retry commences.
            else {
                return controller.upload(id);
            }
        },

        /**
         * Cancels file upload by id
         */
        cancel: function(id) {
            var cancelRetVal = handler.cancel(id);

            if (qq.isGenericPromise(cancelRetVal)) {
                cancelRetVal.then(function() {
                    upload.cancel(id);
                });
            }
            else if (cancelRetVal !== false) {
                upload.cancel(id);
            }
        },

        /**
         * Cancels all queued or in-progress uploads
         */
        cancelAll: function() {
            var waitingOrConnected = connectionManager.getWaitingOrConnected(),
                i;

            // ensure files are cancelled in reverse order which they were added
            // to avoid a flash of time where a queued file begins to upload before it is canceled
            if (waitingOrConnected.length) {
                for (i = waitingOrConnected.length - 1; i >= 0; i--) {
                    controller.cancel(waitingOrConnected[i]);
                }
            }

            connectionManager.reset();
        },

        // Returns a File, Blob, or the Blob/File for the reference/parent file if the targeted blob is a proxy.
        // Undefined if no file record is available.
        getFile: function(id) {
            if (handler.getProxy && handler.getProxy(id)) {
                return handler.getProxy(id).referenceBlob;
            }

            return handler.getFile && handler.getFile(id);
        },

        // Returns true if the Blob associated with the ID is related to a proxy s
        isProxied: function(id) {
            return !!(handler.getProxy && handler.getProxy(id));
        },

        getInput: function(id) {
            if (handler.getInput) {
                return handler.getInput(id);
            }
        },

        reset: function() {
            log("Resetting upload handler");
            controller.cancelAll();
            connectionManager.reset();
            handler.reset();
        },

        expunge: function(id) {
            if (controller.isValid(id)) {
                return handler.expunge(id);
            }
        },

        /**
         * Determine if the file exists.
         */
        isValid: function(id) {
            return handler.isValid(id);
        },

        getResumableFilesData: function() {
            if (handler.getResumableFilesData) {
                return handler.getResumableFilesData();
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
            if (controller.isValid(id)) {
                return handler.getThirdPartyFileId(id);
            }
        },

        /**
         * Attempts to pause the associated upload if the specific handler supports this and the file is "valid".
         * @param id ID of the upload/file to pause
         * @returns {boolean} true if the upload was paused
         */
        pause: function(id) {
            if (controller.isResumable(id) && handler.pause && controller.isValid(id) && handler.pause(id)) {
                connectionManager.free(id);
                handler.moveInProgressToRemaining(id);
                return true;
            }
            return false;
        },

        // True if the file is eligible for pause/resume.
        isResumable: function(id) {
            return !!handler.isResumable && handler.isResumable(id);
        }
    });

    qq.extend(options, o);
    log = options.log;
    chunkingPossible = options.chunking.enabled && qq.supportedFeatures.chunking;
    concurrentChunkingPossible = chunkingPossible && options.chunking.concurrent.enabled;

    preventRetryResponse = (function() {
        var response = {};

        response[options.preventRetryParam] = true;

        return response;
    }());

    upload.initHandler();
};

/* globals qq */
/**
 * Common APIs exposed to creators of upload via form/iframe handlers.  This is reused and possibly overridden
 * in some cases by specific form upload handlers.
 *
 * @constructor
 */
qq.FormUploadHandler = function(spec) {
    "use strict";

    var options = spec.options,
        handler = this,
        proxy = spec.proxy,
        formHandlerInstanceId = qq.getUniqueId(),
        onloadCallbacks = {},
        detachLoadEvents = {},
        postMessageCallbackTimers = {},
        isCors = options.isCors,
        inputName = options.inputName,
        getUuid = proxy.getUuid,
        log = proxy.log,
        corsMessageReceiver = new qq.WindowReceiveMessage({log: log});

    /**
     * Remove any trace of the file from the handler.
     *
     * @param id ID of the associated file
     */
    function expungeFile(id) {
        delete detachLoadEvents[id];

        // If we are dealing with CORS, we might still be waiting for a response from a loaded iframe.
        // In that case, terminate the timer waiting for a message from the loaded iframe
        // and stop listening for any more messages coming from this iframe.
        if (isCors) {
            clearTimeout(postMessageCallbackTimers[id]);
            delete postMessageCallbackTimers[id];
            corsMessageReceiver.stopReceivingMessages(id);
        }

        var iframe = document.getElementById(handler._getIframeName(id));
        if (iframe) {
            // To cancel request set src to something else.  We use src="javascript:false;"
            // because it doesn't trigger ie6 prompt on https
            /* jshint scripturl:true */
            iframe.setAttribute("src", "javascript:false;");

            qq(iframe).remove();
        }
    }

    /**
     * @param iframeName `document`-unique Name of the associated iframe
     * @returns {*} ID of the associated file
     */
    function getFileIdForIframeName(iframeName) {
        return iframeName.split("_")[0];
    }

    /**
     * Generates an iframe to be used as a target for upload-related form submits.  This also adds the iframe
     * to the current `document`.  Note that the iframe is hidden from view.
     *
     * @param name Name of the iframe.
     * @returns {HTMLIFrameElement} The created iframe
     */
    function initIframeForUpload(name) {
        var iframe = qq.toElement("<iframe src='javascript:false;' name='" + name + "' />");

        iframe.setAttribute("id", name);

        iframe.style.display = "none";
        document.body.appendChild(iframe);

        return iframe;
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
            uuid = getUuid(fileId);

        onloadCallbacks[uuid] = callback;

        // When the iframe has loaded (after the server responds to an upload request)
        // declare the attempt a failure if we don't receive a valid message shortly after the response comes in.
        detachLoadEvents[fileId] = qq(iframe).attach("load", function() {
            if (handler.getInput(fileId)) {
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
                response = handler._parseJsonResponse(message),
                uuid = response.uuid,
                onloadCallback;

            if (uuid && onloadCallbacks[uuid]) {
                log("Handling response for iframe name " + iframeName);
                clearTimeout(postMessageCallbackTimers[iframeName]);
                delete postMessageCallbackTimers[iframeName];

                handler._detachLoadEvent(iframeName);

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

    qq.extend(this, new qq.UploadHandler(spec));

    qq.override(this, function(super_) {
        return {
            /**
             * Adds File or Blob to the queue
             **/
            add: function(id, fileInput) {
                super_.add(id, {input: fileInput});

                fileInput.setAttribute("name", inputName);

                // remove file input from DOM
                if (fileInput.parentNode) {
                    qq(fileInput).remove();
                }
            },

            expunge: function(id) {
                expungeFile(id);
                super_.expunge(id);
            },

            isValid: function(id) {
                return super_.isValid(id) &&
                    handler._getFileState(id).input !== undefined;
            }
        };
    });

    qq.extend(this, {
        getInput: function(id) {
            return handler._getFileState(id).input;
        },

        /**
         * This function either delegates to a more specific message handler if CORS is involved,
         * or simply registers a callback when the iframe has been loaded that invokes the passed callback
         * after determining if the content of the iframe is accessible.
         *
         * @param iframe Associated iframe
         * @param callback Callback to invoke after we have determined if the iframe content is accessible.
         */
        _attachLoadEvent: function(iframe, callback) {
            /*jslint eqeq: true*/
            var responseDescriptor;

            if (isCors) {
                registerPostMessageCallback(iframe, callback);
            }
            else {
                detachLoadEvents[iframe.id] = qq(iframe).attach("load", function() {
                    log("Received response for " + iframe.id);

                    // when we remove iframe from dom
                    // the request stops, but in IE load
                    // event fires
                    if (!iframe.parentNode) {
                        return;
                    }

                    try {
                        // fixing Opera 10.53
                        if (iframe.contentDocument &&
                            iframe.contentDocument.body &&
                            iframe.contentDocument.body.innerHTML == "false") {
                            // In Opera event is fired second time
                            // when body.innerHTML changed from false
                            // to server response approx. after 1 sec
                            // when we upload file with iframe
                            return;
                        }
                    }
                    catch (error) {
                        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
                        log("Error when attempting to access iframe during handling of upload response (" + error.message + ")", "error");
                        responseDescriptor = {success: false};
                    }

                    callback(responseDescriptor);
                });
            }
        },

        /**
         * Creates an iframe with a specific document-unique name.
         *
         * @param id ID of the associated file
         * @returns {HTMLIFrameElement}
         */
        _createIframe: function(id) {
            var iframeName = handler._getIframeName(id);

            return initIframeForUpload(iframeName);
        },

        /**
         * Called when we are no longer interested in being notified when an iframe has loaded.
         *
         * @param id Associated file ID
         */
        _detachLoadEvent: function(id) {
            if (detachLoadEvents[id] !== undefined) {
                detachLoadEvents[id]();
                delete detachLoadEvents[id];
            }
        },

        /**
         * @param fileId ID of the associated file
         * @returns {string} The `document`-unique name of the iframe
         */
        _getIframeName: function(fileId) {
            return fileId + "_" + formHandlerInstanceId;
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
        _initFormForUpload: function(spec) {
            var method = spec.method,
                endpoint = spec.endpoint,
                params = spec.params,
                paramsInBody = spec.paramsInBody,
                targetName = spec.targetName,
                form = qq.toElement("<form method='" + method + "' enctype='multipart/form-data'></form>"),
                url = endpoint;

            if (paramsInBody) {
                qq.obj2Inputs(params, form);
            }
            else {
                url = qq.obj2url(params, endpoint);
            }

            form.setAttribute("action", url);
            form.setAttribute("target", targetName);
            form.style.display = "none";
            document.body.appendChild(form);

            return form;
        },

        /**
         * @param innerHtmlOrMessage JSON message
         * @returns {*} The parsed response, or an empty object if the response could not be parsed
         */
        _parseJsonResponse: function(innerHtmlOrMessage) {
            var response = {};

            try {
                response = qq.parseJson(innerHtmlOrMessage);
            }
            catch (error) {
                log("Error when attempting to parse iframe upload response (" + error.message + ")", "error");
            }

            return response;
        }
    });
};

/* globals qq */
/**
 * Common API exposed to creators of XHR handlers.  This is reused and possibly overriding in some cases by specific
 * XHR upload handlers.
 *
 * @constructor
 */
qq.XhrUploadHandler = function(spec) {
    "use strict";

    var handler = this,
        namespace = spec.options.namespace,
        proxy = spec.proxy,
        chunking = spec.options.chunking,
        resume = spec.options.resume,
        chunkFiles = chunking && spec.options.chunking.enabled && qq.supportedFeatures.chunking,
        resumeEnabled = resume && spec.options.resume.enabled && chunkFiles && qq.supportedFeatures.resume,
        getName = proxy.getName,
        getSize = proxy.getSize,
        getUuid = proxy.getUuid,
        getEndpoint = proxy.getEndpoint,
        getDataByUuid = proxy.getDataByUuid,
        onUuidChanged = proxy.onUuidChanged,
        onProgress = proxy.onProgress,
        log = proxy.log;

    function abort(id) {
        qq.each(handler._getXhrs(id), function(xhrId, xhr) {
            var ajaxRequester = handler._getAjaxRequester(id, xhrId);

            xhr.onreadystatechange = null;
            xhr.upload.onprogress = null;
            xhr.abort();
            ajaxRequester && ajaxRequester.canceled && ajaxRequester.canceled(id);
        });
    }

    qq.extend(this, new qq.UploadHandler(spec));

    qq.override(this, function(super_) {
        return {
            /**
             * Adds File or Blob to the queue
             **/
            add: function(id, blobOrProxy) {
                if (qq.isFile(blobOrProxy) || qq.isBlob(blobOrProxy)) {
                    super_.add(id, {file: blobOrProxy});
                }
                else if (blobOrProxy instanceof qq.BlobProxy) {
                    super_.add(id, {proxy: blobOrProxy});
                }
                else {
                    throw new Error("Passed obj is not a File, Blob, or proxy");
                }

                handler._initTempState(id);
                resumeEnabled && handler._maybePrepareForResume(id);
            },

            expunge: function(id) {
                abort(id);
                handler._maybeDeletePersistedChunkData(id);
                handler._clearXhrs(id);
                super_.expunge(id);
            }
        };
    });

    qq.extend(this, {
        // Clear the cached chunk `Blob` after we are done with it, just in case the `Blob` bytes are stored in memory.
        clearCachedChunk: function(id, chunkIdx) {
            delete handler._getFileState(id).temp.cachedChunks[chunkIdx];
        },

        clearXhr: function(id, chunkIdx) {
            var tempState = handler._getFileState(id).temp;

            if (tempState.xhrs) {
                delete tempState.xhrs[chunkIdx];
            }
            if (tempState.ajaxRequesters) {
                delete tempState.ajaxRequesters[chunkIdx];
            }
        },

        // Called when all chunks have been successfully uploaded.  Expected promissory return type.
        // This defines the default behavior if nothing further is required when all chunks have been uploaded.
        finalizeChunks: function(id, responseParser) {
            var lastChunkIdx = handler._getTotalChunks(id) - 1,
                xhr = handler._getXhr(id, lastChunkIdx);

            if (responseParser) {
                return new qq.Promise().success(responseParser(xhr), xhr);
            }

            return new qq.Promise().success({}, xhr);
        },

        getFile: function(id) {
            return handler.isValid(id) && handler._getFileState(id).file;
        },

        getProxy: function(id) {
            return handler.isValid(id) && handler._getFileState(id).proxy;
        },

        /**
         * @returns {Array} Array of objects containing properties useful to integrators
         * when it is important to determine which files are potentially resumable.
         */
        getResumableFilesData: function() {
            var resumableFilesData = [];

            handler._iterateResumeRecords(function(key, uploadData) {
                handler.moveInProgressToRemaining(null, uploadData.chunking.inProgress,  uploadData.chunking.remaining);

                var data = {
                    name: uploadData.name,
                    remaining: uploadData.chunking.remaining,
                    size: uploadData.size,
                    uuid: uploadData.uuid
                };

                if (uploadData.key) {
                    data.key = uploadData.key;
                }

                resumableFilesData.push(data);
            });

            return resumableFilesData;
        },

        isResumable: function(id) {
            return !!chunking && handler.isValid(id) && !handler._getFileState(id).notResumable;
        },

        moveInProgressToRemaining: function(id, optInProgress, optRemaining) {
            var inProgress = optInProgress || handler._getFileState(id).chunking.inProgress,
                remaining = optRemaining || handler._getFileState(id).chunking.remaining;

            if (inProgress) {
                log(qq.format("Moving these chunks from in-progress {}, to remaining.", JSON.stringify(inProgress)));
                inProgress.reverse();
                qq.each(inProgress, function(idx, chunkIdx) {
                    remaining.unshift(chunkIdx);
                });
                inProgress.length = 0;
            }
        },

        pause: function(id) {
            if (handler.isValid(id)) {
                log(qq.format("Aborting XHR upload for {} '{}' due to pause instruction.", id, getName(id)));
                handler._getFileState(id).paused = true;
                abort(id);
                return true;
            }
        },

        reevaluateChunking: function(id) {
            if (chunking && handler.isValid(id)) {
                var state = handler._getFileState(id),
                    totalChunks,
                    i;

                delete state.chunking;

                state.chunking = {};
                totalChunks = handler._getTotalChunks(id);
                if (totalChunks > 1 || chunking.mandatory) {
                    state.chunking.enabled = true;
                    state.chunking.parts = totalChunks;
                    state.chunking.remaining = [];

                    for (i = 0; i < totalChunks; i++) {
                        state.chunking.remaining.push(i);
                    }

                    handler._initTempState(id);
                }
                else {
                    state.chunking.enabled = false;
                }
            }
        },

        updateBlob: function(id, newBlob) {
            if (handler.isValid(id)) {
                handler._getFileState(id).file = newBlob;
            }
        },

        _clearXhrs: function(id) {
            var tempState = handler._getFileState(id).temp;

            qq.each(tempState.ajaxRequesters, function(chunkId) {
                delete tempState.ajaxRequesters[chunkId];
            });

            qq.each(tempState.xhrs, function(chunkId) {
                delete tempState.xhrs[chunkId];
            });
        },

        /**
         * Creates an XHR instance for this file and stores it in the fileState.
         *
         * @param id File ID
         * @param optChunkIdx The chunk index associated with this XHR, if applicable
         * @returns {XMLHttpRequest}
         */
        _createXhr: function(id, optChunkIdx) {
            return handler._registerXhr(id, optChunkIdx, qq.createXhrInstance());
        },

        _getAjaxRequester: function(id, optChunkIdx) {
            var chunkIdx = optChunkIdx == null ? -1 : optChunkIdx;
            return handler._getFileState(id).temp.ajaxRequesters[chunkIdx];
        },

        _getChunkData: function(id, chunkIndex) {
            var chunkSize = chunking.partSize,
                fileSize = getSize(id),
                fileOrBlob = handler.getFile(id),
                startBytes = chunkSize * chunkIndex,
                endBytes = startBytes + chunkSize >= fileSize ? fileSize : startBytes + chunkSize,
                totalChunks = handler._getTotalChunks(id),
                cachedChunks = this._getFileState(id).temp.cachedChunks,

            // To work around a Webkit GC bug, we must keep each chunk `Blob` in scope until we are done with it.
            // See https://github.com/Widen/fine-uploader/issues/937#issuecomment-41418760
                blob = cachedChunks[chunkIndex] || qq.sliceBlob(fileOrBlob, startBytes, endBytes);

            cachedChunks[chunkIndex] = blob;

            return {
                part: chunkIndex,
                start: startBytes,
                end: endBytes,
                count: totalChunks,
                blob: blob,
                size: endBytes - startBytes
            };
        },

        _getChunkDataForCallback: function(chunkData) {
            return {
                partIndex: chunkData.part,
                startByte: chunkData.start + 1,
                endByte: chunkData.end,
                totalParts: chunkData.count
            };
        },

        /**
         * @param id File ID
         * @returns {string} Identifier for this item that may appear in the browser's local storage
         */
        _getLocalStorageId: function(id) {
            var formatVersion = "5.0",
                name = getName(id),
                size = getSize(id),
                chunkSize = chunking.partSize,
                endpoint = getEndpoint(id);

            return qq.format("qq{}resume{}-{}-{}-{}-{}", namespace, formatVersion, name, size, chunkSize, endpoint);
        },

        _getMimeType: function(id) {
            return handler.getFile(id).type;
        },

        _getPersistableData: function(id) {
            return handler._getFileState(id).chunking;
        },

        /**
         * @param id ID of the associated file
         * @returns {number} Number of parts this file can be divided into, or undefined if chunking is not supported in this UA
         */
        _getTotalChunks: function(id) {
            if (chunking) {
                var fileSize = getSize(id),
                    chunkSize = chunking.partSize;

                return Math.ceil(fileSize / chunkSize);
            }
        },

        _getXhr: function(id, optChunkIdx) {
            var chunkIdx = optChunkIdx == null ? -1 : optChunkIdx;
            return handler._getFileState(id).temp.xhrs[chunkIdx];
        },

        _getXhrs: function(id) {
            return handler._getFileState(id).temp.xhrs;
        },

        // Iterates through all XHR handler-created resume records (in local storage),
        // invoking the passed callback and passing in the key and value of each local storage record.
        _iterateResumeRecords: function(callback) {
            if (resumeEnabled) {
                qq.each(localStorage, function(key, item) {
                    if (key.indexOf(qq.format("qq{}resume", namespace)) === 0) {
                        var uploadData = JSON.parse(item);
                        callback(key, uploadData);
                    }
                });
            }
        },

        _initTempState: function(id) {
            handler._getFileState(id).temp = {
                ajaxRequesters: {},
                chunkProgress: {},
                xhrs: {},
                cachedChunks: {}
            };
        },

        _markNotResumable: function(id) {
            handler._getFileState(id).notResumable = true;
        },

        // Removes a chunked upload record from local storage, if possible.
        // Returns true if the item was removed, false otherwise.
        _maybeDeletePersistedChunkData: function(id) {
            var localStorageId;

            if (resumeEnabled && handler.isResumable(id)) {
                localStorageId = handler._getLocalStorageId(id);

                if (localStorageId && localStorage.getItem(localStorageId)) {
                    localStorage.removeItem(localStorageId);
                    return true;
                }
            }

            return false;
        },

        // If this is a resumable upload, grab the relevant data from storage and items in memory that track this upload
        // so we can pick up from where we left off.
        _maybePrepareForResume: function(id) {
            var state = handler._getFileState(id),
                localStorageId, persistedData;

            // Resume is enabled and possible and this is the first time we've tried to upload this file in this session,
            // so prepare for a resume attempt.
            if (resumeEnabled && state.key === undefined) {
                localStorageId = handler._getLocalStorageId(id);
                persistedData = localStorage.getItem(localStorageId);

                // If we found this item in local storage, maybe we should resume it.
                if (persistedData) {
                    persistedData = JSON.parse(persistedData);

                    // If we found a resume record but we have already handled this file in this session,
                    // don't try to resume it & ensure we don't persist future check data
                    if (getDataByUuid(persistedData.uuid)) {
                        handler._markNotResumable(id);
                    }
                    else {
                        log(qq.format("Identified file with ID {} and name of {} as resumable.", id, getName(id)));

                        onUuidChanged(id, persistedData.uuid);

                        state.key = persistedData.key;
                        state.chunking = persistedData.chunking;
                        state.loaded = persistedData.loaded;
                        state.attemptingResume = true;

                        handler.moveInProgressToRemaining(id);
                    }
                }
            }
        },

        // Persist any data needed to resume this upload in a new session.
        _maybePersistChunkedState: function(id) {
            var state = handler._getFileState(id),
                localStorageId, persistedData;

            // If local storage isn't supported by the browser, or if resume isn't enabled or possible, give up
            if (resumeEnabled && handler.isResumable(id)) {
                localStorageId = handler._getLocalStorageId(id);

                persistedData = {
                    name: getName(id),
                    size: getSize(id),
                    uuid: getUuid(id),
                    key: state.key,
                    chunking: state.chunking,
                    loaded: state.loaded,
                    lastUpdated: Date.now()
                };

                try {
                    localStorage.setItem(localStorageId, JSON.stringify(persistedData));
                }
                catch (error) {
                    log(qq.format("Unable to save resume data for '{}' due to error: '{}'.", id, error.toString()), "warn");
                }
            }
        },

        _registerProgressHandler: function(id, chunkIdx, chunkSize) {
            var xhr = handler._getXhr(id, chunkIdx),
                name = getName(id),
                progressCalculator = {
                    simple: function(loaded, total) {
                        var fileSize = getSize(id);

                        if (loaded === total) {
                            onProgress(id, name, fileSize, fileSize);
                        }
                        else {
                            onProgress(id, name, (loaded >= fileSize ? fileSize - 1 : loaded), fileSize);
                        }
                    },

                    chunked: function(loaded, total) {
                        var chunkProgress = handler._getFileState(id).temp.chunkProgress,
                            totalSuccessfullyLoadedForFile = handler._getFileState(id).loaded,
                            loadedForRequest = loaded,
                            totalForRequest = total,
                            totalFileSize = getSize(id),
                            estActualChunkLoaded = loadedForRequest - (totalForRequest - chunkSize),
                            totalLoadedForFile = totalSuccessfullyLoadedForFile;

                        chunkProgress[chunkIdx] = estActualChunkLoaded;

                        qq.each(chunkProgress, function(chunkIdx, chunkLoaded) {
                            totalLoadedForFile += chunkLoaded;
                        });

                        onProgress(id, name, totalLoadedForFile, totalFileSize);
                    }
                };

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    /* jshint eqnull: true */
                    var type = chunkSize == null ? "simple" : "chunked";
                    progressCalculator[type](e.loaded, e.total);
                }
            };
        },

        /**
         * Registers an XHR transport instance created elsewhere.
         *
         * @param id ID of the associated file
         * @param optChunkIdx The chunk index associated with this XHR, if applicable
         * @param xhr XMLHttpRequest object instance
         * @param optAjaxRequester `qq.AjaxRequester` associated with this request, if applicable.
         * @returns {XMLHttpRequest}
         */
        _registerXhr: function(id, optChunkIdx, xhr, optAjaxRequester) {
            var xhrsId = optChunkIdx == null ? -1 : optChunkIdx,
                tempState = handler._getFileState(id).temp;

            tempState.xhrs = tempState.xhrs || {};
            tempState.ajaxRequesters = tempState.ajaxRequesters || {};

            tempState.xhrs[xhrsId] = xhr;

            if (optAjaxRequester) {
                tempState.ajaxRequesters[xhrsId] = optAjaxRequester;
            }

            return xhr;
        },

        // Deletes any local storage records that are "expired".
        _removeExpiredChunkingRecords: function() {
            var expirationDays = resume.recordsExpireIn;

            handler._iterateResumeRecords(function(key, uploadData) {
                var expirationDate = new Date(uploadData.lastUpdated);

                // transform updated date into expiration date
                expirationDate.setDate(expirationDate.getDate() + expirationDays);

                if (expirationDate.getTime() <= Date.now()) {
                    log("Removing expired resume record with key " + key);
                    localStorage.removeItem(key);
                }
            });
        },

        /**
         * Determine if the associated file should be chunked.
         *
         * @param id ID of the associated file
         * @returns {*} true if chunking is enabled, possible, and the file can be split into more than 1 part
         */
        _shouldChunkThisFile: function(id) {
            var state = handler._getFileState(id);

            if (!state.chunking) {
                handler.reevaluateChunking(id);
            }

            return state.chunking.enabled;
        }
    });
};

/*globals qq */
/*jshint -W117 */
qq.WindowReceiveMessage = function(o) {
    "use strict";

    var options = {
            log: function(message, level) {}
        },
        callbackWrapperDetachers = {};

    qq.extend(options, o);

    qq.extend(this, {
        receiveMessage: function(id, callback) {
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

        stopReceivingMessages: function(id) {
            if (window.postMessage) {
                var detacher = callbackWrapperDetachers[id];
                if (detacher) {
                    detacher();
                }
            }
        }
    });
};

/*globals qq */
/**
 * Defines the public API for FineUploader mode.
 */
(function() {
    "use strict";

    qq.uiPublicApi = {
        addInitialFiles: function(cannedFileList) {
            this._parent.prototype.addInitialFiles.apply(this, arguments);
            this._templating.addCacheToDom();
        },

        clearStoredFiles: function() {
            this._parent.prototype.clearStoredFiles.apply(this, arguments);
            this._templating.clearFiles();
        },

        addExtraDropzone: function(element) {
            this._dnd && this._dnd.setupExtraDropzone(element);
        },

        removeExtraDropzone: function(element) {
            if (this._dnd) {
                return this._dnd.removeDropzone(element);
            }
        },

        getItemByFileId: function(id) {
            if (!this._templating.isHiddenForever(id)) {
                return this._templating.getFileContainer(id);
            }
        },

        reset: function() {
            this._parent.prototype.reset.apply(this, arguments);
            this._templating.reset();

            if (!this._options.button && this._templating.getButton()) {
                this._defaultButtonId = this._createUploadButton({
                    element: this._templating.getButton(),
                    title: this._options.text.fileInputTitle
                }).getButtonId();
            }

            if (this._dnd) {
                this._dnd.dispose();
                this._dnd = this._setupDragAndDrop();
            }

            this._totalFilesInBatch = 0;
            this._filesInBatchAddedToUi = 0;

            this._setupClickAndEditEventHandlers();
        },

        setName: function(id, newName) {
            var formattedFilename = this._options.formatFileName(newName);

            this._parent.prototype.setName.apply(this, arguments);
            this._templating.updateFilename(id, formattedFilename);
        },

        pauseUpload: function(id) {
            var paused = this._parent.prototype.pauseUpload.apply(this, arguments);

            paused && this._templating.uploadPaused(id);
            return paused;
        },

        continueUpload: function(id) {
            var continued = this._parent.prototype.continueUpload.apply(this, arguments);

            continued && this._templating.uploadContinued(id);
            return continued;
        },

        getId: function(fileContainerOrChildEl) {
            return this._templating.getFileId(fileContainerOrChildEl);
        },

        getDropTarget: function(fileId) {
            var file = this.getFile(fileId);

            return file.qqDropTarget;
        }
    };

    /**
     * Defines the private (internal) API for FineUploader mode.
     */
    qq.uiPrivateApi = {
        _getButton: function(buttonId) {
            var button = this._parent.prototype._getButton.apply(this, arguments);

            if (!button) {
                if (buttonId === this._defaultButtonId) {
                    button = this._templating.getButton();
                }
            }

            return button;
        },

        _removeFileItem: function(fileId) {
            this._templating.removeFile(fileId);
        },

        _setupClickAndEditEventHandlers: function() {
            this._fileButtonsClickHandler = qq.FileButtonsClickHandler && this._bindFileButtonsClickEvent();

            // A better approach would be to check specifically for focusin event support by querying the DOM API,
            // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.
            this._focusinEventSupported = !qq.firefox();

            if (this._isEditFilenameEnabled())
            {
                this._filenameClickHandler = this._bindFilenameClickEvent();
                this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();
                this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();
            }
        },

        _setupDragAndDrop: function() {
            var self = this,
                dropZoneElements = this._options.dragAndDrop.extraDropzones,
                templating = this._templating,
                defaultDropZone = templating.getDropZone();

            defaultDropZone && dropZoneElements.push(defaultDropZone);

            return new qq.DragAndDrop({
                dropZoneElements: dropZoneElements,
                allowMultipleItems: this._options.multiple,
                classes: {
                    dropActive: this._options.classes.dropActive
                },
                callbacks: {
                    processingDroppedFiles: function() {
                        templating.showDropProcessing();
                    },
                    processingDroppedFilesComplete: function(files, targetEl) {
                        templating.hideDropProcessing();

                        qq.each(files, function(idx, file) {
                            file.qqDropTarget = targetEl;
                        });

                        if (files.length) {
                            self.addFiles(files, null, null);
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

        _bindFileButtonsClickEvent: function() {
            var self = this;

            return new qq.FileButtonsClickHandler({
                templating: this._templating,

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
                    self.retry(fileId);
                },

                onPause: function(fileId) {
                    self.pauseUpload(fileId);
                },

                onContinue: function(fileId) {
                    self.continueUpload(fileId);
                },

                onGetName: function(fileId) {
                    return self.getName(fileId);
                }
            });
        },

        _isEditFilenameEnabled: function() {
            /*jshint -W014 */
            return this._templating.isEditFilenamePossible()
                && !this._options.autoUpload
                && qq.FilenameClickHandler
                && qq.FilenameInputFocusHandler
                && qq.FilenameInputFocusHandler;
        },

        _filenameEditHandler: function() {
            var self = this,
                templating = this._templating;

            return {
                templating: templating,
                log: function(message, lvl) {
                    self.log(message, lvl);
                },
                onGetUploadStatus: function(fileId) {
                    return self.getUploads({id: fileId}).status;
                },
                onGetName: function(fileId) {
                    return self.getName(fileId);
                },
                onSetName: function(id, newName) {
                    self.setName(id, newName);
                },
                onEditingStatusChange: function(id, isEditing) {
                    var qqInput = qq(templating.getEditInput(id)),
                        qqFileContainer = qq(templating.getFileContainer(id));

                    if (isEditing) {
                        qqInput.addClass("qq-editing");
                        templating.hideFilename(id);
                        templating.hideEditIcon(id);
                    }
                    else {
                        qqInput.removeClass("qq-editing");
                        templating.showFilename(id);
                        templating.showEditIcon(id);
                    }

                    // Force IE8 and older to repaint
                    qqFileContainer.addClass("qq-temp").removeClass("qq-temp");
                }
            };
        },

        _onUploadStatusChange: function(id, oldStatus, newStatus) {
            this._parent.prototype._onUploadStatusChange.apply(this, arguments);

            if (this._isEditFilenameEnabled()) {
                // Status for a file exists before it has been added to the DOM, so we must be careful here.
                if (this._templating.getFileContainer(id) && newStatus !== qq.status.SUBMITTED) {
                    this._templating.markFilenameEditable(id);
                    this._templating.hideEditIcon(id);
                }
            }

            if (newStatus === qq.status.UPLOAD_RETRYING) {
                this._templating.hideRetry(id);
                this._templating.setStatusText(id);
                qq(this._templating.getFileContainer(id)).removeClass(this._classes.retrying);
            }
            else if (newStatus === qq.status.UPLOAD_FAILED) {
                this._templating.hidePause(id);
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

        _storeForLater: function(id) {
            this._parent.prototype._storeForLater.apply(this, arguments);
            this._templating.hideSpinner(id);
        },

        _onAllComplete: function(successful, failed) {
            this._parent.prototype._onAllComplete.apply(this, arguments);
            this._templating.resetTotalProgress();
        },

        _onSubmit: function(id, name) {
            var file = this.getFile(id);

            if (file && file.qqPath && this._options.dragAndDrop.reportDirectoryPaths) {
                this._paramsStore.addReadOnly(id, {
                    qqpath: file.qqPath
                });
            }

            this._parent.prototype._onSubmit.apply(this, arguments);
            this._addToList(id, name);
        },

        // The file item has been added to the DOM.
        _onSubmitted: function(id) {
            // If the edit filename feature is enabled, mark the filename element as "editable" and the associated edit icon
            if (this._isEditFilenameEnabled()) {
                this._templating.markFilenameEditable(id);
                this._templating.showEditIcon(id);

                // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input
                if (!this._focusinEventSupported) {
                    this._filenameInputFocusHandler.addHandler(this._templating.getEditInput(id));
                }
            }
        },

        // Update the progress bar & percentage as the file is uploaded
        _onProgress: function(id, name, loaded, total) {
            this._parent.prototype._onProgress.apply(this, arguments);

            this._templating.updateProgress(id, loaded, total);

            if (Math.round(loaded / total * 100) === 100) {
                this._templating.hideCancel(id);
                this._templating.hidePause(id);
                this._templating.hideProgress(id);
                this._templating.setStatusText(id, this._options.text.waitingForResponse);

                // If ~last byte was sent, display total file size
                this._displayFileSize(id);
            }
            else {
                // If still uploading, display percentage - total size is actually the total request(s) size
                this._displayFileSize(id, loaded, total);
            }
        },

        _onTotalProgress: function(loaded, total) {
            this._parent.prototype._onTotalProgress.apply(this, arguments);
            this._templating.updateTotalProgress(loaded, total);
        },

        _onComplete: function(id, name, result, xhr) {
            var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),
                templating = this._templating,
                fileContainer = templating.getFileContainer(id),
                self = this;

            function completeUpload(result) {
                // If this file is not represented in the templating module, perhaps it was hidden intentionally.
                // If so, don't perform any UI-related tasks related to this file.
                if (!fileContainer) {
                    return;
                }

                templating.setStatusText(id);

                qq(fileContainer).removeClass(self._classes.retrying);
                templating.hideProgress(id);

                if (self.getUploads({id: id}).status !== qq.status.UPLOAD_FAILED) {
                    templating.hideCancel(id);
                }
                templating.hideSpinner(id);

                if (result.success) {
                    self._markFileAsSuccessful(id);
                }
                else {
                    qq(fileContainer).addClass(self._classes.fail);
                    templating.showCancel(id);

                    if (templating.isRetryPossible() && !self._preventRetries[id]) {
                        qq(fileContainer).addClass(self._classes.retryable);
                        templating.showRetry(id);
                    }
                    self._controlFailureTextDisplay(id, result);
                }
            }

            // The parent may need to perform some async operation before we can accurately determine the status of the upload.
            if (parentRetVal instanceof qq.Promise) {
                parentRetVal.done(function(newResult) {
                    completeUpload(newResult);
                });

            }
            else {
                completeUpload(result);
            }

            return parentRetVal;
        },

        _markFileAsSuccessful: function(id) {
            var templating = this._templating;

            if (this._isDeletePossible()) {
                templating.showDeleteButton(id);
            }

            qq(templating.getFileContainer(id)).addClass(this._classes.success);

            this._maybeUpdateThumbnail(id);
        },

        _onUploadPrep: function(id) {
            this._parent.prototype._onUploadPrep.apply(this, arguments);
            this._templating.showSpinner(id);
        },

        _onUpload: function(id, name) {
            var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);

            this._templating.showSpinner(id);

            return parentRetVal;
        },

        _onUploadChunk: function(id, chunkData) {
            this._parent.prototype._onUploadChunk.apply(this, arguments);

            // Only display the pause button if we have finished uploading at least one chunk
            // & this file can be resumed
            if (chunkData.partIndex > 0 && this._handler.isResumable(id)) {
                this._templating.allowPause(id);
            }
        },

        _onCancel: function(id, name) {
            this._parent.prototype._onCancel.apply(this, arguments);
            this._removeFileItem(id);

            if (this._getNotFinished() === 0) {
                this._templating.resetTotalProgress();
            }
        },

        _onBeforeAutoRetry: function(id) {
            var retryNumForDisplay, maxAuto, retryNote;

            this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);

            this._showCancelLink(id);

            if (this._options.retry.showAutoRetryNote) {
                retryNumForDisplay = this._autoRetries[id];
                maxAuto = this._options.retry.maxAutoAttempts;

                retryNote = this._options.retry.autoRetryNote.replace(/\{retryNum\}/g, retryNumForDisplay);
                retryNote = retryNote.replace(/\{maxAuto\}/g, maxAuto);

                this._templating.setStatusText(id, retryNote);
                qq(this._templating.getFileContainer(id)).addClass(this._classes.retrying);
            }
        },

        //return false if we should not attempt the requested retry
        _onBeforeManualRetry: function(id) {
            if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {
                this._templating.resetProgress(id);
                qq(this._templating.getFileContainer(id)).removeClass(this._classes.fail);
                this._templating.setStatusText(id);
                this._templating.showSpinner(id);
                this._showCancelLink(id);
                return true;
            }
            else {
                qq(this._templating.getFileContainer(id)).addClass(this._classes.retryable);
                this._templating.showRetry(id);
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

            this._templating.hideSpinner(id);

            if (isError) {
                this._templating.setStatusText(id, this._options.deleteFile.deletingFailedText);
                this._templating.showDeleteButton(id);
            }
            else {
                this._removeFileItem(id);
            }
        },

        _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {
            this._templating.hideDeleteButton(id);
            this._templating.showSpinner(id);
            this._templating.setStatusText(id, this._options.deleteFile.deletingStatusText);
            this._deleteHandler.sendDelete.apply(this, arguments);
        },

        _showDeleteConfirm: function(id, uuid, mandatedParams) {
            /*jshint -W004 */
            var fileName = this.getName(id),
                confirmMessage = this._options.deleteFile.confirmMessage.replace(/\{filename\}/g, fileName),
                uuid = this.getUuid(id),
                deleteRequestArgs = arguments,
                self = this,
                retVal;

            retVal = this._options.showConfirm(confirmMessage);

            if (qq.isGenericPromise(retVal)) {
                retVal.then(function() {
                    self._sendDeleteRequest.apply(self, deleteRequestArgs);
                });
            }
            else if (retVal !== false) {
                self._sendDeleteRequest.apply(self, deleteRequestArgs);
            }
        },

        _addToList: function(id, name, canned) {
            var prependData,
                prependIndex = 0,
                dontDisplay = this._handler.isProxied(id) && this._options.scaling.hideScaled,
                record;

            if (this._options.display.prependFiles) {
                if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {
                    prependIndex = this._filesInBatchAddedToUi - 1;
                }

                prependData = {
                    index: prependIndex
                };
            }

            if (!canned) {
                if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {
                    this._templating.disableCancel();
                }

                // Cancel all existing (previous) files and clear the list if this file is not part of
                // a scaled file group that has already been accepted, or if this file is not part of
                // a scaled file group at all.
                if (!this._options.multiple) {
                    record = this.getUploads({id: id});

                    this._handledProxyGroup = this._handledProxyGroup || record.proxyGroupId;

                    if (record.proxyGroupId !== this._handledProxyGroup || !record.proxyGroupId) {
                        this._handler.cancelAll();
                        this._clearList();
                        this._handledProxyGroup = null;
                    }
                }
            }

            if (canned) {
                this._templating.addFileToCache(id, this._options.formatFileName(name), prependData, dontDisplay);
                this._templating.updateThumbnail(id, this._thumbnailUrls[id], true);
            }
            else {
                this._templating.addFile(id, this._options.formatFileName(name), prependData, dontDisplay);
                this._templating.generatePreview(id, this.getFile(id));
            }

            this._filesInBatchAddedToUi += 1;

            if (canned ||
                (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading)) {

                this._displayFileSize(id);
            }
        },

        _clearList: function() {
            this._templating.clearFiles();
            this.clearStoredFiles();
        },

        _displayFileSize: function(id, loadedSize, totalSize) {
            var size = this.getSize(id),
                sizeForDisplay = this._formatSize(size);

            if (size >= 0) {
                if (loadedSize !== undefined && totalSize !== undefined) {
                    sizeForDisplay = this._formatProgress(loadedSize, totalSize);
                }

                this._templating.updateSize(id, sizeForDisplay);
            }
        },

        _formatProgress: function(uploadedSize, totalSize) {
            var message = this._options.text.formatProgress;
            function r(name, replacement) { message = message.replace(name, replacement); }

            r("{percent}", Math.round(uploadedSize / totalSize * 100));
            r("{total_size}", this._formatSize(totalSize));
            return message;
        },

        _controlFailureTextDisplay: function(id, response) {
            var mode, responseProperty, failureReason;

            mode = this._options.failedUploadTextDisplay.mode;
            responseProperty = this._options.failedUploadTextDisplay.responseProperty;

            if (mode === "custom") {
                failureReason = response[responseProperty];
                if (!failureReason) {
                    failureReason = this._options.text.failUpload;
                }

                this._templating.setStatusText(id, failureReason);

                if (this._options.failedUploadTextDisplay.enableTooltip) {
                    this._showTooltip(id, failureReason);
                }
            }
            else if (mode === "default") {
                this._templating.setStatusText(id, this._options.text.failUpload);
            }
            else if (mode !== "none") {
                this.log("failedUploadTextDisplay.mode value of '" + mode + "' is not valid", "warn");
            }
        },

        _showTooltip: function(id, text) {
            this._templating.getFileContainer(id).title = text;
        },

        _showCancelLink: function(id) {
            if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
                this._templating.showCancel(id);
            }
        },

        _itemError: function(code, name, item) {
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
        },

        _maybeUpdateThumbnail: function(fileId) {
            var thumbnailUrl = this._thumbnailUrls[fileId],
                fileStatus = this.getUploads({id: fileId}).status;

            if (fileStatus !== qq.status.DELETED &&
                (thumbnailUrl ||
                this._options.thumbnails.placeholders.waitUntilResponse ||
                !qq.supportedFeatures.imagePreviews)) {

                // This will replace the "waiting" placeholder with a "preview not available" placeholder
                // if called with a null thumbnailUrl.
                this._templating.updateThumbnail(fileId, thumbnailUrl);
            }
        },

        _addCannedFile: function(sessionData) {
            var id = this._parent.prototype._addCannedFile.apply(this, arguments);

            this._addToList(id, this.getName(id), true);
            this._templating.hideSpinner(id);
            this._templating.hideCancel(id);
            this._markFileAsSuccessful(id);

            return id;
        },

        _setSize: function(id, newSize) {
            this._parent.prototype._setSize.apply(this, arguments);

            this._templating.updateSize(id, this._formatSize(newSize));
        },

        _sessionRequestComplete: function() {
            this._templating.addCacheToDom();
            this._parent.prototype._sessionRequestComplete.apply(this, arguments);
        }
    };
}());

/*globals qq */
/**
 * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.
 */
qq.FineUploader = function(o, namespace) {
    "use strict";

    var self = this;

    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden
    // if the (internal) caller defines a different parent.  The parent is also used by
    // the private and public API functions that need to delegate to a parent function.
    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;
    this._parent.apply(this, arguments);

    // Options provided by FineUploader mode
    qq.extend(this._options, {
        element: null,

        button: null,

        listElement: null,

        dragAndDrop: {
            extraDropzones: [],
            reportDirectoryPaths: false
        },

        text: {
            formatProgress: "{percent}% of {total_size}",
            failUpload: "Upload failed",
            waitingForResponse: "Processing...",
            paused: "Paused"
        },

        template: "qq-template",

        classes: {
            retrying: "qq-upload-retrying",
            retryable: "qq-upload-retryable",
            success: "qq-upload-success",
            fail: "qq-upload-fail",
            editable: "qq-editable",
            hide: "qq-hide",
            dropActive: "qq-upload-drop-area-active"
        },

        failedUploadTextDisplay: {
            mode: "default", //default, custom, or none
            responseProperty: "error",
            enableTooltip: true
        },

        messages: {
            tooManyFilesError: "You may only drop one file",
            unsupportedBrowser: "Unrecoverable error - this browser does not permit file uploading of any kind."
        },

        retry: {
            showAutoRetryNote: true,
            autoRetryNote: "Retrying {retryNum}/{maxAuto}..."
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

        thumbnails: {
            maxCount: 0,
            placeholders: {
                waitUntilResponse: false,
                notAvailablePath: null,
                waitingPath: null
            },
            timeBetweenThumbs: 750
        },

        scaling: {
            hideScaled: false
        },

        showMessage: function(message) {
            if (self._templating.hasDialog("alert")) {
                return self._templating.showDialog("alert", message);
            }
            else {
                setTimeout(function() {
                    window.alert(message);
                }, 0);
            }
        },

        showConfirm: function(message) {
            if (self._templating.hasDialog("confirm")) {
                return self._templating.showDialog("confirm", message);
            }
            else {
                return window.confirm(message);
            }
        },

        showPrompt: function(message, defaultValue) {
            if (self._templating.hasDialog("prompt")) {
                return self._templating.showDialog("prompt", message, defaultValue);
            }
            else {
                return window.prompt(message, defaultValue);
            }
        }
    }, true);

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    this._templating = new qq.Templating({
        log: qq.bind(this.log, this),
        templateIdOrEl: this._options.template,
        containerEl: this._options.element,
        fileContainerEl: this._options.listElement,
        button: this._options.button,
        imageGenerator: this._imageGenerator,
        classes: {
            hide: this._options.classes.hide,
            editable: this._options.classes.editable
        },
        limits: {
            maxThumbs: this._options.thumbnails.maxCount,
            timeBetweenThumbs: this._options.thumbnails.timeBetweenThumbs
        },
        placeholders: {
            waitUntilUpdate: this._options.thumbnails.placeholders.waitUntilResponse,
            thumbnailNotAvailable: this._options.thumbnails.placeholders.notAvailablePath,
            waitingForThumbnail: this._options.thumbnails.placeholders.waitingPath
        },
        text: this._options.text
    });

    if (this._options.workarounds.ios8SafariUploads && qq.ios800() && qq.iosSafari()) {
        this._templating.renderFailure(this._options.messages.unsupportedBrowserIos8Safari);
    }
    else if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {
        this._templating.renderFailure(this._options.messages.unsupportedBrowser);
    }
    else {
        this._wrapCallbacks();

        this._templating.render();

        this._classes = this._options.classes;

        if (!this._options.button && this._templating.getButton()) {
            this._defaultButtonId = this._createUploadButton({
                element: this._templating.getButton(),
                title: this._options.text.fileInputTitle
            }).getButtonId();
        }

        this._setupClickAndEditEventHandlers();

        if (qq.DragAndDrop && qq.supportedFeatures.fileDrop) {
            this._dnd = this._setupDragAndDrop();
        }

        if (this._options.paste.targetElement && this._options.paste.promptForName) {
            if (qq.PasteSupport) {
                this._setupPastePrompt();
            }
            else {
                this.log("Paste support module not found.", "error");
            }
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

/* globals qq */
/* jshint -W065 */
/**
 * Module responsible for rendering all Fine Uploader UI templates.  This module also asserts at least
 * a limited amount of control over the template elements after they are added to the DOM.
 * Wherever possible, this module asserts total control over template elements present in the DOM.
 *
 * @param spec Specification object used to control various templating behaviors
 * @constructor
 */
qq.Templating = function(spec) {
    "use strict";

    var FILE_ID_ATTR = "qq-file-id",
        FILE_CLASS_PREFIX = "qq-file-id-",
        THUMBNAIL_MAX_SIZE_ATTR = "qq-max-size",
        THUMBNAIL_SERVER_SCALE_ATTR = "qq-server-scale",
        // This variable is duplicated in the DnD module since it can function as a standalone as well
        HIDE_DROPZONE_ATTR = "qq-hide-dropzone",
        DROPZPONE_TEXT_ATTR = "qq-drop-area-text",
        IN_PROGRESS_CLASS = "qq-in-progress",
        HIDDEN_FOREVER_CLASS = "qq-hidden-forever",
        fileBatch = {
            content: document.createDocumentFragment(),
            map: {}
        },
        isCancelDisabled = false,
        generatedThumbnails = 0,
        thumbnailQueueMonitorRunning = false,
        thumbGenerationQueue = [],
        thumbnailMaxSize = -1,
        options = {
            log: null,
            limits: {
                maxThumbs: 0,
                timeBetweenThumbs: 750
            },
            templateIdOrEl: "qq-template",
            containerEl: null,
            fileContainerEl: null,
            button: null,
            imageGenerator: null,
            classes: {
                hide: "qq-hide",
                editable: "qq-editable"
            },
            placeholders: {
                waitUntilUpdate: false,
                thumbnailNotAvailable: null,
                waitingForThumbnail: null
            },
            text: {
                paused: "Paused"
            }
        },
        selectorClasses = {
            button: "qq-upload-button-selector",
            alertDialog: "qq-alert-dialog-selector",
            dialogCancelButton: "qq-cancel-button-selector",
            confirmDialog: "qq-confirm-dialog-selector",
            dialogMessage: "qq-dialog-message-selector",
            dialogOkButton: "qq-ok-button-selector",
            promptDialog: "qq-prompt-dialog-selector",
            uploader: "qq-uploader-selector",
            drop: "qq-upload-drop-area-selector",
            list: "qq-upload-list-selector",
            progressBarContainer: "qq-progress-bar-container-selector",
            progressBar: "qq-progress-bar-selector",
            totalProgressBarContainer: "qq-total-progress-bar-container-selector",
            totalProgressBar: "qq-total-progress-bar-selector",
            file: "qq-upload-file-selector",
            spinner: "qq-upload-spinner-selector",
            size: "qq-upload-size-selector",
            cancel: "qq-upload-cancel-selector",
            pause: "qq-upload-pause-selector",
            continueButton: "qq-upload-continue-selector",
            deleteButton: "qq-upload-delete-selector",
            retry: "qq-upload-retry-selector",
            statusText: "qq-upload-status-text-selector",
            editFilenameInput: "qq-edit-filename-selector",
            editNameIcon: "qq-edit-filename-icon-selector",
            dropText: "qq-upload-drop-area-text-selector",
            dropProcessing: "qq-drop-processing-selector",
            dropProcessingSpinner: "qq-drop-processing-spinner-selector",
            thumbnail: "qq-thumbnail-selector"
        },
        previewGeneration = {},
        cachedThumbnailNotAvailableImg = new qq.Promise(),
        cachedWaitingForThumbnailImg = new qq.Promise(),
        log,
        isEditElementsExist,
        isRetryElementExist,
        templateHtml,
        container,
        fileList,
        showThumbnails,
        serverScale,

        // During initialization of the templating module we should cache any
        // placeholder images so we can quickly swap them into the file list on demand.
        // Any placeholder images that cannot be loaded/found are simply ignored.
        cacheThumbnailPlaceholders = function() {
            var notAvailableUrl =  options.placeholders.thumbnailNotAvailable,
                waitingUrl = options.placeholders.waitingForThumbnail,
                spec = {
                    maxSize: thumbnailMaxSize,
                    scale: serverScale
                };

            if (showThumbnails) {
                if (notAvailableUrl) {
                    options.imageGenerator.generate(notAvailableUrl, new Image(), spec).then(
                        function(updatedImg) {
                            cachedThumbnailNotAvailableImg.success(updatedImg);
                        },
                        function() {
                            cachedThumbnailNotAvailableImg.failure();
                            log("Problem loading 'not available' placeholder image at " + notAvailableUrl, "error");
                        }
                    );
                }
                else {
                    cachedThumbnailNotAvailableImg.failure();
                }

                if (waitingUrl) {
                    options.imageGenerator.generate(waitingUrl, new Image(), spec).then(
                        function(updatedImg) {
                            cachedWaitingForThumbnailImg.success(updatedImg);
                        },
                        function() {
                            cachedWaitingForThumbnailImg.failure();
                            log("Problem loading 'waiting for thumbnail' placeholder image at " + waitingUrl, "error");
                        }
                    );
                }
                else {
                    cachedWaitingForThumbnailImg.failure();
                }
            }
        },

        // Displays a "waiting for thumbnail" type placeholder image
        // iff we were able to load it during initialization of the templating module.
        displayWaitingImg = function(thumbnail) {
            var waitingImgPlacement = new qq.Promise();

            cachedWaitingForThumbnailImg.then(function(img) {
                maybeScalePlaceholderViaCss(img, thumbnail);
                /* jshint eqnull:true */
                if (!thumbnail.src) {
                    thumbnail.src = img.src;
                    thumbnail.onload = function() {
                        thumbnail.onload = null;
                        show(thumbnail);
                        waitingImgPlacement.success();
                    };
                }
                else {
                    waitingImgPlacement.success();
                }
            }, function() {
                // In some browsers (such as IE9 and older) an img w/out a src attribute
                // are displayed as "broken" images, so we should just hide the img tag
                // if we aren't going to display the "waiting" placeholder.
                hide(thumbnail);
                waitingImgPlacement.success();
            });

            return waitingImgPlacement;
        },

        generateNewPreview = function(id, blob, spec) {
            var thumbnail = getThumbnail(id);

            log("Generating new thumbnail for " + id);
            blob.qqThumbnailId = id;

            return options.imageGenerator.generate(blob, thumbnail, spec).then(
                function() {
                    generatedThumbnails++;
                    show(thumbnail);
                    previewGeneration[id].success();
                },
                function() {
                    previewGeneration[id].failure();

                    // Display the "not available" placeholder img only if we are
                    // not expecting a thumbnail at a later point, such as in a server response.
                    if (!options.placeholders.waitUntilUpdate) {
                        maybeSetDisplayNotAvailableImg(id, thumbnail);
                    }
                });
        },

        generateNextQueuedPreview = function() {
            if (thumbGenerationQueue.length) {
                thumbnailQueueMonitorRunning = true;

                var queuedThumbRequest = thumbGenerationQueue.shift();

                if (queuedThumbRequest.update) {
                    processUpdateQueuedPreviewRequest(queuedThumbRequest);
                }
                else {
                    processNewQueuedPreviewRequest(queuedThumbRequest);
                }
            }
            else {
                thumbnailQueueMonitorRunning = false;
            }
        },

        getCancel = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.cancel);
        },

        getContinue = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.continueButton);
        },

        getDialog = function(type) {
            return getTemplateEl(container, selectorClasses[type + "Dialog"]);
        },

        getDelete = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.deleteButton);
        },

        getDropProcessing = function() {
            return getTemplateEl(container, selectorClasses.dropProcessing);
        },

        getEditIcon = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.editNameIcon);
        },

        getFile = function(id) {
            return fileBatch.map[id] || qq(fileList).getFirstByClass(FILE_CLASS_PREFIX + id);
        },

        getFilename = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.file);
        },

        getPause = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.pause);
        },

        getProgress = function(id) {
            /* jshint eqnull:true */
            // Total progress bar
            if (id == null) {
                return getTemplateEl(container, selectorClasses.totalProgressBarContainer) ||
                    getTemplateEl(container, selectorClasses.totalProgressBar);
            }

            // Per-file progress bar
            return getTemplateEl(getFile(id), selectorClasses.progressBarContainer) ||
                getTemplateEl(getFile(id), selectorClasses.progressBar);
        },

        getRetry = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.retry);
        },

        getSize = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.size);
        },

        getSpinner = function(id) {
            return getTemplateEl(getFile(id), selectorClasses.spinner);
        },

        getTemplateEl = function(context, cssClass) {
            return context && qq(context).getFirstByClass(cssClass);
        },

        getThumbnail = function(id) {
            return showThumbnails && getTemplateEl(getFile(id), selectorClasses.thumbnail);
        },

        hide = function(el) {
            el && qq(el).addClass(options.classes.hide);
        },

        // Ensures a placeholder image does not exceed any max size specified
        // via `style` attribute properties iff <canvas> was not used to scale
        // the placeholder AND the target <img> doesn't already have these `style` attribute properties set.
        maybeScalePlaceholderViaCss = function(placeholder, thumbnail) {
            var maxWidth = placeholder.style.maxWidth,
                maxHeight = placeholder.style.maxHeight;

            if (maxHeight && maxWidth && !thumbnail.style.maxWidth && !thumbnail.style.maxHeight) {
                qq(thumbnail).css({
                    maxWidth: maxWidth,
                    maxHeight: maxHeight
                });
            }
        },

        // Displays a "thumbnail not available" type placeholder image
        // iff we were able to load this placeholder during initialization
        // of the templating module or after preview generation has failed.
        maybeSetDisplayNotAvailableImg = function(id, thumbnail) {
            var previewing = previewGeneration[id] || new qq.Promise().failure(),
                notAvailableImgPlacement = new qq.Promise();

            cachedThumbnailNotAvailableImg.then(function(img) {
                previewing.then(
                    function() {
                        notAvailableImgPlacement.success();
                    },
                    function() {
                        maybeScalePlaceholderViaCss(img, thumbnail);

                        thumbnail.onload = function() {
                            thumbnail.onload = null;
                            notAvailableImgPlacement.success();
                        };

                        thumbnail.src = img.src;
                        show(thumbnail);
                    }
                );
            });

            return notAvailableImgPlacement;
        },

        /**
         * Grabs the HTML from the script tag holding the template markup.  This function will also adjust
         * some internally-tracked state variables based on the contents of the template.
         * The template is filtered so that irrelevant elements (such as the drop zone if DnD is not supported)
         * are omitted from the DOM.  Useful errors will be thrown if the template cannot be parsed.
         *
         * @returns {{template: *, fileTemplate: *}} HTML for the top-level file items templates
         */
        parseAndGetTemplate = function() {
            var scriptEl,
                scriptHtml,
                fileListNode,
                tempTemplateEl,
                fileListHtml,
                defaultButton,
                dropArea,
                thumbnail,
                dropProcessing,
                dropTextEl,
                uploaderEl;

            log("Parsing template");

            /*jshint -W116*/
            if (options.templateIdOrEl == null) {
                throw new Error("You MUST specify either a template element or ID!");
            }

            // Grab the contents of the script tag holding the template.
            if (qq.isString(options.templateIdOrEl)) {
                scriptEl = document.getElementById(options.templateIdOrEl);

                if (scriptEl === null) {
                    throw new Error(qq.format("Cannot find template script at ID '{}'!", options.templateIdOrEl));
                }

                scriptHtml = scriptEl.innerHTML;
            }
            else {
                if (options.templateIdOrEl.innerHTML === undefined) {
                    throw new Error("You have specified an invalid value for the template option!  " +
                        "It must be an ID or an Element.");
                }

                scriptHtml = options.templateIdOrEl.innerHTML;
            }

            scriptHtml = qq.trimStr(scriptHtml);
            tempTemplateEl = document.createElement("div");
            tempTemplateEl.appendChild(qq.toElement(scriptHtml));
            uploaderEl = qq(tempTemplateEl).getFirstByClass(selectorClasses.uploader);

            // Don't include the default template button in the DOM
            // if an alternate button container has been specified.
            if (options.button) {
                defaultButton = qq(tempTemplateEl).getFirstByClass(selectorClasses.button);
                if (defaultButton) {
                    qq(defaultButton).remove();
                }
            }

            // Omit the drop processing element from the DOM if DnD is not supported by the UA,
            // or the drag and drop module is not found.
            // NOTE: We are consciously not removing the drop zone if the UA doesn't support DnD
            // to support layouts where the drop zone is also a container for visible elements,
            // such as the file list.
            if (!qq.DragAndDrop || !qq.supportedFeatures.fileDrop) {
                dropProcessing = qq(tempTemplateEl).getFirstByClass(selectorClasses.dropProcessing);
                if (dropProcessing) {
                    qq(dropProcessing).remove();
                }
            }

            dropArea = qq(tempTemplateEl).getFirstByClass(selectorClasses.drop);

            // If DnD is not available then remove
            // it from the DOM as well.
            if (dropArea && !qq.DragAndDrop) {
                log("DnD module unavailable.", "info");
                qq(dropArea).remove();
            }

            if (!qq.supportedFeatures.fileDrop) {
                // don't display any "drop files to upload" background text
                uploaderEl.removeAttribute(DROPZPONE_TEXT_ATTR);

                if (dropArea && qq(dropArea).hasAttribute(HIDE_DROPZONE_ATTR)) {
                    // If there is a drop area defined in the template, and the current UA doesn't support DnD,
                    // and the drop area is marked as "hide before enter", ensure it is hidden as the DnD module
                    // will not do this (since we will not be loading the DnD module)
                    qq(dropArea).css({
                        display: "none"
                    });
                }
            }
            else if (qq(uploaderEl).hasAttribute(DROPZPONE_TEXT_ATTR) && dropArea) {
                dropTextEl = qq(dropArea).getFirstByClass(selectorClasses.dropText);
                dropTextEl && qq(dropTextEl).remove();
            }

            // Ensure the `showThumbnails` flag is only set if the thumbnail element
            // is present in the template AND the current UA is capable of generating client-side previews.
            thumbnail = qq(tempTemplateEl).getFirstByClass(selectorClasses.thumbnail);
            if (!showThumbnails) {
                thumbnail && qq(thumbnail).remove();
            }
            else if (thumbnail) {
                thumbnailMaxSize = parseInt(thumbnail.getAttribute(THUMBNAIL_MAX_SIZE_ATTR));
                // Only enforce max size if the attr value is non-zero
                thumbnailMaxSize = thumbnailMaxSize > 0 ? thumbnailMaxSize : null;

                serverScale = qq(thumbnail).hasAttribute(THUMBNAIL_SERVER_SCALE_ATTR);
            }
            showThumbnails = showThumbnails && thumbnail;

            isEditElementsExist = qq(tempTemplateEl).getByClass(selectorClasses.editFilenameInput).length > 0;
            isRetryElementExist = qq(tempTemplateEl).getByClass(selectorClasses.retry).length > 0;

            fileListNode = qq(tempTemplateEl).getFirstByClass(selectorClasses.list);
            /*jshint -W116*/
            if (fileListNode == null) {
                throw new Error("Could not find the file list container in the template!");
            }

            fileListHtml = fileListNode.innerHTML;
            fileListNode.innerHTML = "";

            // We must call `createElement` in IE8 in order to target and hide any <dialog> via CSS
            if (tempTemplateEl.getElementsByTagName("DIALOG").length) {
                document.createElement("dialog");
            }

            log("Template parsing complete");

            return {
                template: qq.trimStr(tempTemplateEl.innerHTML),
                fileTemplate: qq.trimStr(fileListHtml)
            };
        },

        prependFile = function(el, index, fileList) {
            var parentEl = fileList,
                beforeEl = parentEl.firstChild;

            if (index > 0) {
                beforeEl = qq(parentEl).children()[index].nextSibling;

            }

            parentEl.insertBefore(el, beforeEl);
        },

        processNewQueuedPreviewRequest = function(queuedThumbRequest) {
            var id = queuedThumbRequest.id,
                optFileOrBlob = queuedThumbRequest.optFileOrBlob,
                relatedThumbnailId = optFileOrBlob && optFileOrBlob.qqThumbnailId,
                thumbnail = getThumbnail(id),
                spec = {
                    maxSize: thumbnailMaxSize,
                    scale: true,
                    orient: true
                };

            if (qq.supportedFeatures.imagePreviews) {
                if (thumbnail) {
                    if (options.limits.maxThumbs && options.limits.maxThumbs <= generatedThumbnails) {
                        maybeSetDisplayNotAvailableImg(id, thumbnail);
                        generateNextQueuedPreview();
                    }
                    else {
                        displayWaitingImg(thumbnail).done(function() {
                            previewGeneration[id] = new qq.Promise();

                            previewGeneration[id].done(function() {
                                setTimeout(generateNextQueuedPreview, options.limits.timeBetweenThumbs);
                            });

                            /* jshint eqnull: true */
                            // If we've already generated an <img> for this file, use the one that exists,
                            // don't waste resources generating a new one.
                            if (relatedThumbnailId != null) {
                                useCachedPreview(id, relatedThumbnailId);
                            }
                            else {
                                generateNewPreview(id, optFileOrBlob, spec);
                            }
                        });
                    }
                }
                // File element in template may have been removed, so move on to next item in queue
                else {
                    generateNextQueuedPreview();
                }
            }
            else if (thumbnail) {
                displayWaitingImg(thumbnail);
                generateNextQueuedPreview();
            }
        },

        processUpdateQueuedPreviewRequest = function(queuedThumbRequest) {
            var id = queuedThumbRequest.id,
                thumbnailUrl = queuedThumbRequest.thumbnailUrl,
                showWaitingImg = queuedThumbRequest.showWaitingImg,
                thumbnail = getThumbnail(id),
                spec = {
                    maxSize: thumbnailMaxSize,
                    scale: serverScale
                };

            if (thumbnail) {
                if (thumbnailUrl) {
                    if (options.limits.maxThumbs && options.limits.maxThumbs <= generatedThumbnails) {
                        maybeSetDisplayNotAvailableImg(id, thumbnail);
                        generateNextQueuedPreview();
                    }
                    else {
                        if (showWaitingImg) {
                            displayWaitingImg(thumbnail);
                        }

                        return options.imageGenerator.generate(thumbnailUrl, thumbnail, spec).then(
                            function() {
                                show(thumbnail);
                                generatedThumbnails++;
                                setTimeout(generateNextQueuedPreview, options.limits.timeBetweenThumbs);
                            },

                            function() {
                                maybeSetDisplayNotAvailableImg(id, thumbnail);
                                setTimeout(generateNextQueuedPreview, options.limits.timeBetweenThumbs);
                            }
                        );
                    }
                }
                else {
                    maybeSetDisplayNotAvailableImg(id, thumbnail);
                    generateNextQueuedPreview();
                }
            }
        },

        setProgressBarWidth = function(id, percent) {
            var bar = getProgress(id),
                /* jshint eqnull:true */
                progressBarSelector = id == null ? selectorClasses.totalProgressBar : selectorClasses.progressBar;

            if (bar && !qq(bar).hasClass(progressBarSelector)) {
                bar = qq(bar).getFirstByClass(progressBarSelector);
            }

            if (bar) {
                qq(bar).css({width: percent + "%"});
                bar.setAttribute("aria-valuenow", percent);
            }
        },

        show = function(el) {
            el && qq(el).removeClass(options.classes.hide);
        },

        useCachedPreview = function(targetThumbnailId, cachedThumbnailId) {
            var targetThumnail = getThumbnail(targetThumbnailId),
                cachedThumbnail = getThumbnail(cachedThumbnailId);

            log(qq.format("ID {} is the same file as ID {}.  Will use generated thumbnail from ID {} instead.", targetThumbnailId, cachedThumbnailId, cachedThumbnailId));

            // Generation of the related thumbnail may still be in progress, so, wait until it is done.
            previewGeneration[cachedThumbnailId].then(function() {
                generatedThumbnails++;
                previewGeneration[targetThumbnailId].success();
                log(qq.format("Now using previously generated thumbnail created for ID {} on ID {}.", cachedThumbnailId, targetThumbnailId));
                targetThumnail.src = cachedThumbnail.src;
                show(targetThumnail);
            },
            function() {
                previewGeneration[targetThumbnailId].failure();
                if (!options.placeholders.waitUntilUpdate) {
                    maybeSetDisplayNotAvailableImg(targetThumbnailId, targetThumnail);
                }
            });
        };

    qq.extend(options, spec);
    log = options.log;

    // No need to worry about conserving CPU or memory on older browsers,
    // since there is no ability to preview, and thumbnail display is primitive and quick.
    if (!qq.supportedFeatures.imagePreviews) {
        options.limits.timeBetweenThumbs = 0;
        options.limits.maxThumbs = 0;
    }

    container = options.containerEl;
    showThumbnails = options.imageGenerator !== undefined;
    templateHtml = parseAndGetTemplate();

    cacheThumbnailPlaceholders();

    qq.extend(this, {
        render: function() {
            log("Rendering template in DOM.");

            generatedThumbnails = 0;

            container.innerHTML = templateHtml.template;
            hide(getDropProcessing());
            this.hideTotalProgress();
            fileList = options.fileContainerEl || getTemplateEl(container, selectorClasses.list);

            log("Template rendering complete");
        },

        renderFailure: function(message) {
            var cantRenderEl = qq.toElement(message);
            container.innerHTML = "";
            container.appendChild(cantRenderEl);
        },

        reset: function() {
            this.render();
        },

        clearFiles: function() {
            fileList.innerHTML = "";
        },

        disableCancel: function() {
            isCancelDisabled = true;
        },

        addFile: function(id, name, prependInfo, hideForever, batch) {
            var fileEl = qq.toElement(templateHtml.fileTemplate),
                fileNameEl = getTemplateEl(fileEl, selectorClasses.file),
                uploaderEl = getTemplateEl(container, selectorClasses.uploader),
                fileContainer = batch ? fileBatch.content : fileList,
                thumb;

            if (batch) {
                fileBatch.map[id] = fileEl;
            }

            qq(fileEl).addClass(FILE_CLASS_PREFIX + id);
            uploaderEl.removeAttribute(DROPZPONE_TEXT_ATTR);

            if (fileNameEl) {
                qq(fileNameEl).setText(name);
                fileNameEl.setAttribute("title", name);
            }

            fileEl.setAttribute(FILE_ID_ATTR, id);

            if (prependInfo) {
                prependFile(fileEl, prependInfo.index, fileContainer);
            }
            else {
                fileContainer.appendChild(fileEl);
            }

            if (hideForever) {
                fileEl.style.display = "none";
                qq(fileEl).addClass(HIDDEN_FOREVER_CLASS);
            }
            else {
                hide(getProgress(id));
                hide(getSize(id));
                hide(getDelete(id));
                hide(getRetry(id));
                hide(getPause(id));
                hide(getContinue(id));

                if (isCancelDisabled) {
                    this.hideCancel(id);
                }

                thumb = getThumbnail(id);
                if (thumb && !thumb.src) {
                    cachedWaitingForThumbnailImg.then(function(waitingImg) {
                        thumb.src = waitingImg.src;
                        if (waitingImg.style.maxHeight && waitingImg.style.maxWidth) {
                            qq(thumb).css({
                                maxHeight: waitingImg.style.maxHeight,
                                maxWidth: waitingImg.style.maxWidth
                            });
                        }

                        show(thumb);
                    });
                }
            }
        },

        addFileToCache: function(id, name, prependInfo, hideForever) {
            this.addFile(id, name, prependInfo, hideForever, true);
        },

        addCacheToDom: function() {
            fileList.appendChild(fileBatch.content);
            fileBatch.content = document.createDocumentFragment();
            fileBatch.map = {};
        },

        removeFile: function(id) {
            qq(getFile(id)).remove();
        },

        getFileId: function(el) {
            var currentNode = el;

            if (currentNode) {
                /*jshint -W116*/
                while (currentNode.getAttribute(FILE_ID_ATTR) == null) {
                    currentNode = currentNode.parentNode;
                }

                return parseInt(currentNode.getAttribute(FILE_ID_ATTR));
            }
        },

        getFileList: function() {
            return fileList;
        },

        markFilenameEditable: function(id) {
            var filename = getFilename(id);

            filename && qq(filename).addClass(options.classes.editable);
        },

        updateFilename: function(id, name) {
            var filenameEl = getFilename(id);

            if (filenameEl) {
                qq(filenameEl).setText(name);
                filenameEl.setAttribute("title", name);
            }
        },

        hideFilename: function(id) {
            hide(getFilename(id));
        },

        showFilename: function(id) {
            show(getFilename(id));
        },

        isFileName: function(el) {
            return qq(el).hasClass(selectorClasses.file);
        },

        getButton: function() {
            return options.button || getTemplateEl(container, selectorClasses.button);
        },

        hideDropProcessing: function() {
            hide(getDropProcessing());
        },

        showDropProcessing: function() {
            show(getDropProcessing());
        },

        getDropZone: function() {
            return getTemplateEl(container, selectorClasses.drop);
        },

        isEditFilenamePossible: function() {
            return isEditElementsExist;
        },

        hideRetry: function(id) {
            hide(getRetry(id));
        },

        isRetryPossible: function() {
            return isRetryElementExist;
        },

        showRetry: function(id) {
            show(getRetry(id));
        },

        getFileContainer: function(id) {
            return getFile(id);
        },

        showEditIcon: function(id) {
            var icon = getEditIcon(id);

            icon && qq(icon).addClass(options.classes.editable);
        },

        isHiddenForever: function(id) {
            return qq(getFile(id)).hasClass(HIDDEN_FOREVER_CLASS);
        },

        hideEditIcon: function(id) {
            var icon = getEditIcon(id);

            icon && qq(icon).removeClass(options.classes.editable);
        },

        isEditIcon: function(el) {
            return qq(el).hasClass(selectorClasses.editNameIcon, true);
        },

        getEditInput: function(id) {
            return getTemplateEl(getFile(id), selectorClasses.editFilenameInput);
        },

        isEditInput: function(el) {
            return qq(el).hasClass(selectorClasses.editFilenameInput, true);
        },

        updateProgress: function(id, loaded, total) {
            var bar = getProgress(id),
                percent;

            if (bar && total > 0) {
                percent = Math.round(loaded / total * 100);

                if (percent === 100) {
                    hide(bar);
                }
                else {
                    show(bar);
                }

                setProgressBarWidth(id, percent);
            }
        },

        updateTotalProgress: function(loaded, total) {
            this.updateProgress(null, loaded, total);
        },

        hideProgress: function(id) {
            var bar = getProgress(id);

            bar && hide(bar);
        },

        hideTotalProgress: function() {
            this.hideProgress();
        },

        resetProgress: function(id) {
            setProgressBarWidth(id, 0);
            this.hideTotalProgress(id);
        },

        resetTotalProgress: function() {
            this.resetProgress();
        },

        showCancel: function(id) {
            if (!isCancelDisabled) {
                var cancel = getCancel(id);

                cancel && qq(cancel).removeClass(options.classes.hide);
            }
        },

        hideCancel: function(id) {
            hide(getCancel(id));
        },

        isCancel: function(el)  {
            return qq(el).hasClass(selectorClasses.cancel, true);
        },

        allowPause: function(id) {
            show(getPause(id));
            hide(getContinue(id));
        },

        uploadPaused: function(id) {
            this.setStatusText(id, options.text.paused);
            this.allowContinueButton(id);
            hide(getSpinner(id));
        },

        hidePause: function(id) {
            hide(getPause(id));
        },

        isPause: function(el) {
            return qq(el).hasClass(selectorClasses.pause, true);
        },

        isContinueButton: function(el) {
            return qq(el).hasClass(selectorClasses.continueButton, true);
        },

        allowContinueButton: function(id) {
            show(getContinue(id));
            hide(getPause(id));
        },

        uploadContinued: function(id) {
            this.setStatusText(id, "");
            this.allowPause(id);
            show(getSpinner(id));
        },

        showDeleteButton: function(id) {
            show(getDelete(id));
        },

        hideDeleteButton: function(id) {
            hide(getDelete(id));
        },

        isDeleteButton: function(el) {
            return qq(el).hasClass(selectorClasses.deleteButton, true);
        },

        isRetry: function(el) {
            return qq(el).hasClass(selectorClasses.retry, true);
        },

        updateSize: function(id, text) {
            var size = getSize(id);

            if (size) {
                show(size);
                qq(size).setText(text);
            }
        },

        setStatusText: function(id, text) {
            var textEl = getTemplateEl(getFile(id), selectorClasses.statusText);

            if (textEl) {
                /*jshint -W116*/
                if (text == null) {
                    qq(textEl).clearText();
                }
                else {
                    qq(textEl).setText(text);
                }
            }
        },

        hideSpinner: function(id) {
            qq(getFile(id)).removeClass(IN_PROGRESS_CLASS);
            hide(getSpinner(id));
        },

        showSpinner: function(id) {
            qq(getFile(id)).addClass(IN_PROGRESS_CLASS);
            show(getSpinner(id));
        },

        generatePreview: function(id, optFileOrBlob) {
            if (!this.isHiddenForever(id)) {
                thumbGenerationQueue.push({id: id, optFileOrBlob: optFileOrBlob});
                !thumbnailQueueMonitorRunning && generateNextQueuedPreview();
            }
        },

        updateThumbnail: function(id, thumbnailUrl, showWaitingImg) {
            if (!this.isHiddenForever(id)) {
                thumbGenerationQueue.push({update: true, id: id, thumbnailUrl: thumbnailUrl, showWaitingImg: showWaitingImg});
                !thumbnailQueueMonitorRunning && generateNextQueuedPreview();
            }
        },

        hasDialog: function(type) {
            return qq.supportedFeatures.dialogElement && !!getDialog(type);
        },

        showDialog: function(type, message, defaultValue) {
            var dialog = getDialog(type),
                messageEl = getTemplateEl(dialog, selectorClasses.dialogMessage),
                inputEl = dialog.getElementsByTagName("INPUT")[0],
                cancelBtn = getTemplateEl(dialog, selectorClasses.dialogCancelButton),
                okBtn = getTemplateEl(dialog, selectorClasses.dialogOkButton),
                promise = new qq.Promise(),

                closeHandler = function() {
                    cancelBtn.removeEventListener("click", cancelClickHandler);
                    okBtn && okBtn.removeEventListener("click", okClickHandler);
                    promise.failure();
                },

                cancelClickHandler = function() {
                    cancelBtn.removeEventListener("click", cancelClickHandler);
                    dialog.close();
                },

                okClickHandler = function() {
                    dialog.removeEventListener("close", closeHandler);
                    okBtn.removeEventListener("click", okClickHandler);
                    dialog.close();

                    promise.success(inputEl && inputEl.value);
                };

            dialog.addEventListener("close", closeHandler);
            cancelBtn.addEventListener("click", cancelClickHandler);
            okBtn && okBtn.addEventListener("click", okClickHandler);

            if (inputEl) {
                inputEl.value = defaultValue;
            }
            messageEl.textContent = message;

            dialog.showModal();

            return promise;
        }
    });
};

/*globals qq */
qq.s3 = qq.s3 || {};

qq.s3.util = qq.s3.util || (function() {
    "use strict";

    return {
        ALGORITHM_PARAM_NAME: "x-amz-algorithm",

        AWS_PARAM_PREFIX: "x-amz-meta-",

        CREDENTIAL_PARAM_NAME: "x-amz-credential",

        DATE_PARAM_NAME: "x-amz-date",

        REDUCED_REDUNDANCY_PARAM_NAME: "x-amz-storage-class",
        REDUCED_REDUNDANCY_PARAM_VALUE: "REDUCED_REDUNDANCY",

        SERVER_SIDE_ENCRYPTION_PARAM_NAME: "x-amz-server-side-encryption",
        SERVER_SIDE_ENCRYPTION_PARAM_VALUE: "AES256",

        SESSION_TOKEN_PARAM_NAME: "x-amz-security-token",

        V4_ALGORITHM_PARAM_VALUE: "AWS4-HMAC-SHA256",

        V4_SIGNATURE_PARAM_NAME: "x-amz-signature",

        CASE_SENSITIVE_PARAM_NAMES: [
            "Cache-Control",
            "Content-Disposition",
            "Content-Encoding",
            "Content-MD5"
        ],

        UNSIGNABLE_REST_HEADER_NAMES: [
            "Cache-Control",
            "Content-Disposition",
            "Content-Encoding",
            "Content-MD5"
        ],

        UNPREFIXED_PARAM_NAMES: [
            "Cache-Control",
            "Content-Disposition",
            "Content-Encoding",
            "Content-MD5",
            "x-amz-server-side-encryption-customer-algorithm",
            "x-amz-server-side-encryption-customer-key",
            "x-amz-server-side-encryption-customer-key-MD5"
        ],

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
                    /^(?:https?:\/\/)?([a-z0-9.\-_]+)\.s3(?:-[a-z0-9\-]+)?\.amazonaws\.com/i,
                    //bucket in path
                    /^(?:https?:\/\/)?s3(?:-[a-z0-9\-]+)?\.amazonaws\.com\/([a-z0-9.\-_]+)/i,
                    //custom domain
                    /^(?:https?:\/\/)?([a-z0-9.\-_]+)/i
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

        /** Create Prefixed request headers which are appropriate for S3.
         *
         * If the request header is appropriate for S3 (e.g. Cache-Control) then pass
         * it along without a metadata prefix. For all other request header parameter names,
         * apply qq.s3.util.AWS_PARAM_PREFIX before the name.
         * See: http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
         */
        _getPrefixedParamName: function(name) {
            if (qq.indexOf(qq.s3.util.UNPREFIXED_PARAM_NAMES, name) >= 0) {
                return name;
            }
            return qq.s3.util.AWS_PARAM_PREFIX + name;
        },

        /**
         * Create a policy document to be signed and sent along with the S3 upload request.
         *
         * @param spec Object with properties use to construct the policy document.
         * @returns {Object} Policy doc.
         */
        getPolicy: function(spec) {
            var policy = {},
                conditions = [],
                bucket = spec.bucket,
                date = spec.date,
                drift = spec.clockDrift,
                key = spec.key,
                accessKey = spec.accessKey,
                acl = spec.acl,
                type = spec.type,
                expectedStatus = spec.expectedStatus,
                sessionToken = spec.sessionToken,
                params = spec.params,
                successRedirectUrl = qq.s3.util.getSuccessRedirectAbsoluteUrl(spec.successRedirectUrl),
                minFileSize = spec.minFileSize,
                maxFileSize = spec.maxFileSize,
                reducedRedundancy = spec.reducedRedundancy,
                region = spec.region,
                serverSideEncryption = spec.serverSideEncryption,
                signatureVersion = spec.signatureVersion;

            policy.expiration = qq.s3.util.getPolicyExpirationDate(date, drift);

            conditions.push({acl: acl});
            conditions.push({bucket: bucket});

            if (type) {
                conditions.push({"Content-Type": type});
            }

            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            if (expectedStatus) {
                conditions.push({success_action_status: expectedStatus.toString()});
            }

            if (successRedirectUrl) {
                conditions.push({success_action_redirect: successRedirectUrl});
            }
            // jscs:enable
            if (reducedRedundancy) {
                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.REDUCED_REDUNDANCY_PARAM_NAME] = qq.s3.util.REDUCED_REDUNDANCY_PARAM_VALUE;
            }

            if (sessionToken) {
                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.SESSION_TOKEN_PARAM_NAME] = sessionToken;
            }

            if (serverSideEncryption) {
                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_NAME] = qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_VALUE;
            }

            if (signatureVersion === 2) {
                conditions.push({key: key});
            }
            else if (signatureVersion === 4) {
                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.ALGORITHM_PARAM_NAME] = qq.s3.util.V4_ALGORITHM_PARAM_VALUE;

                conditions.push({});
                conditions[conditions.length - 1].key = key;

                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.CREDENTIAL_PARAM_NAME] =
                    qq.s3.util.getV4CredentialsString({date: date, key: accessKey, region: region});

                conditions.push({});
                conditions[conditions.length - 1][qq.s3.util.DATE_PARAM_NAME] =
                    qq.s3.util.getV4PolicyDate(date, drift);
            }

            // user metadata
            qq.each(params, function(name, val) {
                var awsParamName = qq.s3.util._getPrefixedParamName(name),
                    param = {};

                if (qq.indexOf(qq.s3.util.UNPREFIXED_PARAM_NAMES, awsParamName) >= 0) {
                    param[awsParamName] = val;
                }
                else {
                    param[awsParamName] = encodeURIComponent(val);
                }

                conditions.push(param);
            });

            policy.conditions = conditions;

            qq.s3.util.enforceSizeLimits(policy, minFileSize, maxFileSize);

            return policy;
        },

        /**
         * Update a previously constructed policy document with updated credentials.  Currently, this only requires we
         * update the session token.  This is only relevant if requests are being signed client-side.
         *
         * @param policy Live policy document
         * @param newSessionToken Updated session token.
         */
        refreshPolicyCredentials: function(policy, newSessionToken) {
            var sessionTokenFound = false;

            qq.each(policy.conditions, function(oldCondIdx, oldCondObj) {
                qq.each(oldCondObj, function(oldCondName, oldCondVal) {
                    if (oldCondName === qq.s3.util.SESSION_TOKEN_PARAM_NAME) {
                        oldCondObj[oldCondName] = newSessionToken;
                        sessionTokenFound = true;
                    }
                });
            });

            if (!sessionTokenFound) {
                policy.conditions.push({});
                policy.conditions[policy.conditions.length - 1][qq.s3.util.SESSION_TOKEN_PARAM_NAME] = newSessionToken;
            }
        },

        /**
         * Generates all parameters to be passed along with the S3 upload request.  This includes invoking a callback
         * that is expected to asynchronously retrieve a signature for the policy document.  Note that the server
         * signing the request should reject a "tainted" policy document that includes unexpected values, since it is
         * still possible for a malicious user to tamper with these values during policy document generation,
         * before it is sent to the server for signing.
         *
         * @param spec Object with properties: `params`, `type`, `key`, `accessKey`, `acl`, `expectedStatus`, `successRedirectUrl`,
         * `reducedRedundancy`, `region`, `serverSideEncryption`, `version`, and `log()`, along with any options associated with `qq.s3.util.getPolicy()`.
         * @returns {qq.Promise} Promise that will be fulfilled once all parameters have been determined.
         */
        generateAwsParams: function(spec, signPolicyCallback) {
            var awsParams = {},
                customParams = spec.params,
                promise = new qq.Promise(),
                sessionToken = spec.sessionToken,
                drift = spec.clockDrift,
                type = spec.type,
                key = spec.key,
                accessKey = spec.accessKey,
                acl = spec.acl,
                expectedStatus = spec.expectedStatus,
                successRedirectUrl = qq.s3.util.getSuccessRedirectAbsoluteUrl(spec.successRedirectUrl),
                reducedRedundancy = spec.reducedRedundancy,
                region = spec.region,
                serverSideEncryption = spec.serverSideEncryption,
                signatureVersion = spec.signatureVersion,
                now = new Date(),
                log = spec.log,
                policyJson;

            spec.date = now;
            policyJson = qq.s3.util.getPolicy(spec);

            awsParams.key = key;

            if (type) {
                awsParams["Content-Type"] = type;
            }
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            if (expectedStatus) {
                awsParams.success_action_status = expectedStatus;
            }

            if (successRedirectUrl) {
                awsParams.success_action_redirect = successRedirectUrl;
            }
            // jscs:enable
            if (reducedRedundancy) {
                awsParams[qq.s3.util.REDUCED_REDUNDANCY_PARAM_NAME] = qq.s3.util.REDUCED_REDUNDANCY_PARAM_VALUE;
            }

            if (serverSideEncryption) {
                awsParams[qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_NAME] = qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_VALUE;
            }

            if (sessionToken) {
                awsParams[qq.s3.util.SESSION_TOKEN_PARAM_NAME] = sessionToken;
            }

            awsParams.acl = acl;

            // Custom (user-supplied) params must be prefixed with the value of `qq.s3.util.AWS_PARAM_PREFIX`.
            // Params such as Cache-Control or Content-Disposition will not be prefixed.
            // Prefixed param values will be URI encoded as well.
            qq.each(customParams, function(name, val) {
                var awsParamName = qq.s3.util._getPrefixedParamName(name);

                if (qq.indexOf(qq.s3.util.UNPREFIXED_PARAM_NAMES, awsParamName) >= 0) {
                    awsParams[awsParamName] = val;
                }
                else {
                    awsParams[awsParamName] = encodeURIComponent(val);
                }
            });

            if (signatureVersion === 2) {
                awsParams.AWSAccessKeyId = accessKey;
            }
            else if (signatureVersion === 4) {
                awsParams[qq.s3.util.ALGORITHM_PARAM_NAME] = qq.s3.util.V4_ALGORITHM_PARAM_VALUE;
                awsParams[qq.s3.util.CREDENTIAL_PARAM_NAME] = qq.s3.util.getV4CredentialsString({date: now, key: accessKey, region: region});
                awsParams[qq.s3.util.DATE_PARAM_NAME] = qq.s3.util.getV4PolicyDate(now, drift);
            }

            // Invoke a promissory callback that should provide us with a base64-encoded policy doc and an
            // HMAC signature for the policy doc.
            signPolicyCallback(policyJson).then(
                function(policyAndSignature, updatedAccessKey, updatedSessionToken) {
                    awsParams.policy = policyAndSignature.policy;

                    if (spec.signatureVersion === 2) {
                        awsParams.signature = policyAndSignature.signature;

                        if (updatedAccessKey) {
                            awsParams.AWSAccessKeyId = updatedAccessKey;
                        }
                    }
                    else if (spec.signatureVersion === 4) {
                        awsParams[qq.s3.util.V4_SIGNATURE_PARAM_NAME] = policyAndSignature.signature;
                    }

                    if (updatedSessionToken) {
                        awsParams[qq.s3.util.SESSION_TOKEN_PARAM_NAME] = updatedSessionToken;
                    }

                    promise.success(awsParams);
                },
                function(errorMessage) {
                    errorMessage = errorMessage || "Can't continue further with request to S3 as we did not receive " +
                                                   "a valid signature and policy from the server.";

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
                policy.conditions.push(["content-length-range", adjustedMinSize.toString(), adjustedMaxSize.toString()]);
            }
        },

        getPolicyExpirationDate: function(date, drift) {
            var adjustedDate = new Date(date.getTime() + drift);
            return qq.s3.util.getPolicyDate(adjustedDate, 5);
        },

        getCredentialsDate: function(date) {
            return date.getUTCFullYear() + "" +
                ("0" + (date.getUTCMonth() + 1)).slice(-2) +
                ("0" + date.getUTCDate()).slice(-2);
        },

        getPolicyDate: function(date, _minutesToAdd_) {
            var minutesToAdd = _minutesToAdd_ || 0,
                pad, r;

            /*jshint -W014 */
            // Is this going to be a problem if we encounter this moments before 2 AM just before daylight savings time ends?
            date.setMinutes(date.getMinutes() + (minutesToAdd || 0));

            if (Date.prototype.toISOString) {
                return date.toISOString();
            }
            else {
                pad = function(number) {
                    r = String(number);

                    if (r.length === 1) {
                        r = "0" + r;
                    }

                    return r;
                };

                return date.getUTCFullYear()
                    + "-" + pad(date.getUTCMonth() + 1)
                    + "-" + pad(date.getUTCDate())
                    + "T" + pad(date.getUTCHours())
                    + ":" + pad(date.getUTCMinutes())
                    + ":" + pad(date.getUTCSeconds())
                    + "." + String((date.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
                    + "Z";
            }
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
                    etag: match[3].replace(/%22/g, "")
                };
            }
        },

        /**
         * @param successRedirectUrl Relative or absolute location of success redirect page
         * @returns {*|string} undefined if the parameter is undefined, otherwise the absolute location of the success redirect page
         */
        getSuccessRedirectAbsoluteUrl: function(successRedirectUrl) {
            if (successRedirectUrl) {
                var targetAnchorContainer = document.createElement("div"),
                    targetAnchor;

                if (qq.ie7()) {
                    // Note that we must make use of `innerHTML` for IE7 only instead of simply creating an anchor via
                    // `document.createElement('a')` and setting the `href` attribute.  The latter approach does not allow us to
                    // obtain an absolute URL in IE7 if the `endpoint` is a relative URL.
                    targetAnchorContainer.innerHTML = "<a href='" + successRedirectUrl + "'></a>";
                    targetAnchor = targetAnchorContainer.firstChild;
                    return targetAnchor.href;
                }
                else {
                    // IE8 and IE9 do not seem to derive an absolute URL from a relative URL using the `innerHTML`
                    // approach above, so we'll just create an anchor this way and set it's `href` attribute.
                    // Due to yet another quirk in IE8 and IE9, we have to set the `href` equal to itself
                    // in order to ensure relative URLs will be properly parsed.
                    targetAnchor = document.createElement("a");
                    targetAnchor.href = successRedirectUrl;
                    targetAnchor.href = targetAnchor.href;
                    return targetAnchor.href;
                }
            }
        },

        getV4CredentialsString: function(spec) {
            return spec.key + "/" +
                qq.s3.util.getCredentialsDate(spec.date) + "/" +
                spec.region + "/s3/aws4_request";
        },

        getV4PolicyDate: function(date, drift) {
            var adjustedDate = new Date(date.getTime() + drift);

            return qq.s3.util.getCredentialsDate(adjustedDate) + "T" +
                    ("0" + adjustedDate.getUTCHours()).slice(-2) +
                    ("0" + adjustedDate.getUTCMinutes()).slice(-2) +
                    ("0" + adjustedDate.getUTCSeconds()).slice(-2) +
                    "Z";
        },

        // AWS employs a strict interpretation of [RFC 3986](http://tools.ietf.org/html/rfc3986#page-12).
        // So, we must ensure all reserved characters listed in the spec are percent-encoded,
        // and spaces are replaced with "+".
        encodeQueryStringParam: function(param) {
            var percentEncoded = encodeURIComponent(param);

            // %-encode characters not handled by `encodeURIComponent` (to follow RFC 3986)
            percentEncoded = percentEncoded.replace(/[!'()]/g, escape);

            // %-encode characters not handled by `escape` (to follow RFC 3986)
            percentEncoded = percentEncoded.replace(/\*/g, "%2A");

            // replace percent-encoded spaces with a "+"
            return percentEncoded.replace(/%20/g, "+");
        }
    };
}());

/*globals qq*/
/**
 * Defines the public API for non-traditional FineUploaderBasic mode.
 */
(function() {
    "use strict";

    qq.nonTraditionalBasePublicApi = {
        setUploadSuccessParams: function(params, id) {
            this._uploadSuccessParamsStore.set(params, id);
        },
        setUploadSuccessEndpoint: function(endpoint, id) {
            this._uploadSuccessEndpointStore.set(endpoint, id);
        }
    };

    qq.nonTraditionalBasePrivateApi = {
        /**
         * When the upload has completed, if it is successful, send a request to the `successEndpoint` (if defined).
         * This will hold up the call to the `onComplete` callback until we have determined success of the upload
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
                successEndpoint = this._uploadSuccessEndpointStore.get(id),
                successCustomHeaders = this._options.uploadSuccess.customHeaders,
                successMethod = this._options.uploadSuccess.method,
                cors = this._options.cors,
                promise = new qq.Promise(),
                uploadSuccessParams = this._uploadSuccessParamsStore.get(id),
                fileParams = this._paramsStore.get(id),

                // If we are waiting for confirmation from the local server, and have received it,
                // include properties from the local server response in the `response` parameter
                // sent to the `onComplete` callback, delegate to the parent `_onComplete`, and
                // fulfill the associated promise.
                onSuccessFromServer = function(successRequestResult) {
                    delete self._failedSuccessRequestCallbacks[id];
                    qq.extend(result, successRequestResult);
                    qq.FineUploaderBasic.prototype._onComplete.apply(self, onCompleteArgs);
                    promise.success(successRequestResult);
                },

                // If the upload success request fails, attempt to re-send the success request (via the core retry code).
                // The entire upload may be restarted if the server returns a "reset" property with a value of true as well.
                onFailureFromServer = function(successRequestResult) {
                    var callback = submitSuccessRequest;

                    qq.extend(result, successRequestResult);

                    if (result && result.reset) {
                        callback = null;
                    }

                    if (!callback) {
                        delete self._failedSuccessRequestCallbacks[id];
                    }
                    else {
                        self._failedSuccessRequestCallbacks[id] = callback;
                    }

                    if (!self._onAutoRetry(id, name, result, xhr, callback)) {
                        qq.FineUploaderBasic.prototype._onComplete.apply(self, onCompleteArgs);
                        promise.failure(successRequestResult);
                    }
                },
                submitSuccessRequest,
                successAjaxRequester;

            // Ask the local server if the file sent is ok.
            if (success && successEndpoint) {
                successAjaxRequester = new qq.UploadSuccessAjaxRequester({
                    endpoint: successEndpoint,
                    method: successMethod,
                    customHeaders: successCustomHeaders,
                    cors: cors,
                    log: qq.bind(this.log, this)
                });

                // combine custom params and default params
                qq.extend(uploadSuccessParams, self._getEndpointSpecificParams(id, result, xhr), true);

                // include any params associated with the file
                fileParams && qq.extend(uploadSuccessParams, fileParams, true);

                submitSuccessRequest = qq.bind(function() {
                    successAjaxRequester.sendSuccessRequest(id, uploadSuccessParams)
                        .then(onSuccessFromServer, onFailureFromServer);
                }, self);

                submitSuccessRequest();

                return promise;
            }

            // If we are not asking the local server about the file, just delegate to the parent `_onComplete`.
            return qq.FineUploaderBasic.prototype._onComplete.apply(this, arguments);
        },

        // If the failure occurred on an upload success request (and a reset was not ordered), try to resend that instead.
        _manualRetry: function(id) {
            var successRequestCallback = this._failedSuccessRequestCallbacks[id];

            return qq.FineUploaderBasic.prototype._manualRetry.call(this, id, successRequestCallback);
        }
    };
}());

/*globals qq */
/**
 * This defines FineUploaderBasic mode w/ support for uploading to S3, which provides all the basic
 * functionality of Fine Uploader Basic as well as code to handle uploads directly to S3.
 * Some inherited options and API methods have a special meaning in the context of the S3 uploader.
 */
(function() {
    "use strict";

    qq.s3.FineUploaderBasic = function(o) {
        var options = {
            request: {
                // public key (required for server-side signing, ignored if `credentials` have been provided)
                accessKey: null,

                // padding, in milliseconds, to add to the x-amz-date header & the policy expiration date
                clockDrift: 0
            },

            objectProperties: {
                acl: "private",

                // string or a function which may be promissory
                bucket: qq.bind(function(id) {
                    return qq.s3.util.getBucket(this.getEndpoint(id));
                }, this),

                // string or a function which may be promissory - only used for V4 multipart uploads
                host: qq.bind(function(id) {
                    return (/(?:http|https):\/\/(.+)(?:\/.+)?/).exec(this._endpointStore.get(id))[1];
                }, this),

                // 'uuid', 'filename', or a function which may be promissory
                key: "uuid",

                reducedRedundancy: false,

                // Defined at http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
                region: "us-east-1",

                serverSideEncryption: false
            },

            credentials: {
                // Public key (required).
                accessKey: null,
                // Private key (required).
                secretKey: null,
                // Expiration date for the credentials (required).  May be an ISO string or a `Date`.
                expiration: null,
                // Temporary credentials session token.
                // Only required for temporary credentials obtained via AssumeRoleWithWebIdentity.
                sessionToken: null
            },

            // All but `version` are ignored if `credentials` is provided.
            signature: {
                customHeaders: {},
                endpoint: null,
                version: 2
            },

            uploadSuccess: {
                endpoint: null,

                method: "POST",

                // In addition to the default params sent by Fine Uploader
                params: {},

                customHeaders: {}
            },

            // required if non-File-API browsers, such as IE9 and older, are used
            iframeSupport: {
                localBlankPagePath: null
            },

            chunking: {
                // minimum part size is 5 MiB when uploading to S3
                partSize: 5242880
            },

            cors: {
                allowXdr: true
            },

            callbacks: {
                onCredentialsExpired: function() {}
            }
        };

        // Replace any default options with user defined ones
        qq.extend(options, o, true);

        if (!this.setCredentials(options.credentials, true)) {
            this._currentCredentials.accessKey = options.request.accessKey;
        }

        this._aclStore = this._createStore(options.objectProperties.acl);

        // Call base module
        qq.FineUploaderBasic.call(this, options);

        this._uploadSuccessParamsStore = this._createStore(this._options.uploadSuccess.params);
        this._uploadSuccessEndpointStore = this._createStore(this._options.uploadSuccess.endpoint);

        // This will hold callbacks for failed uploadSuccess requests that will be invoked on retry.
        // Indexed by file ID.
        this._failedSuccessRequestCallbacks = {};

        // Holds S3 keys for file representations constructed from a session request.
        this._cannedKeys = {};
        // Holds S3 buckets for file representations constructed from a session request.
        this._cannedBuckets = {};

        this._buckets = {};
        this._hosts = {};
    };

    // Inherit basic public & private API methods.
    qq.extend(qq.s3.FineUploaderBasic.prototype, qq.basePublicApi);
    qq.extend(qq.s3.FineUploaderBasic.prototype, qq.basePrivateApi);
    qq.extend(qq.s3.FineUploaderBasic.prototype, qq.nonTraditionalBasePublicApi);
    qq.extend(qq.s3.FineUploaderBasic.prototype, qq.nonTraditionalBasePrivateApi);

    // Define public & private API methods for this module.
    qq.extend(qq.s3.FineUploaderBasic.prototype, {
        getBucket: function(id) {
            if (this._cannedBuckets[id] == null) {
                return this._buckets[id];
            }
            return this._cannedBuckets[id];
        },

        /**
         * @param id File ID
         * @returns {*} Key name associated w/ the file, if one exists
         */
        getKey: function(id) {
            /* jshint eqnull:true */
            if (this._cannedKeys[id] == null) {
                return this._handler.getThirdPartyFileId(id);
            }

            return this._cannedKeys[id];
        },

        /**
         * Override the parent's reset function to cleanup various S3-related items.
         */
        reset: function() {
            qq.FineUploaderBasic.prototype.reset.call(this);
            this._failedSuccessRequestCallbacks = [];
            this._buckets = {};
            this._hosts = {};
        },

        setCredentials: function(credentials, ignoreEmpty) {
            if (credentials && credentials.secretKey) {
                if (!credentials.accessKey) {
                    throw new qq.Error("Invalid credentials: no accessKey");
                }
                else if (!credentials.expiration) {
                    throw new qq.Error("Invalid credentials: no expiration");
                }
                else {
                    this._currentCredentials = qq.extend({}, credentials);

                    // Ensure expiration is a `Date`.  If initially a string, assuming it is in ISO format.
                    if (qq.isString(credentials.expiration)) {
                        this._currentCredentials.expiration = new Date(credentials.expiration);
                    }
                }

                return true;
            }
            else if (!ignoreEmpty) {
                throw new qq.Error("Invalid credentials parameter!");
            }
            else {
                this._currentCredentials = {};
            }
        },

        setAcl: function(acl, id) {
            this._aclStore.set(acl, id);
        },

        /**
         * Ensures the parent's upload handler creator passes any additional S3-specific options to the handler as well
         * as information required to instantiate the specific handler based on the current browser's capabilities.
         *
         * @returns {qq.UploadHandlerController}
         * @private
         */
        _createUploadHandler: function() {
            var self = this,
                additionalOptions = {
                    aclStore: this._aclStore,
                    getBucket: qq.bind(this._determineBucket, this),
                    getHost: qq.bind(this._determineHost, this),
                    getKeyName: qq.bind(this._determineKeyName, this),
                    iframeSupport: this._options.iframeSupport,
                    objectProperties: this._options.objectProperties,
                    signature: this._options.signature,
                    clockDrift: this._options.request.clockDrift,
                    // pass size limit validation values to include in the request so AWS enforces this server-side
                    validation: {
                        minSizeLimit: this._options.validation.minSizeLimit,
                        maxSizeLimit: this._options.validation.sizeLimit
                    }
                };

            // We assume HTTP if it is missing from the start of the endpoint string.
            qq.override(this._endpointStore, function(super_) {
                return {
                    get: function(id) {
                        var endpoint = super_.get(id);

                        if (endpoint.indexOf("http") < 0) {
                            return "http://" + endpoint;
                        }

                        return endpoint;
                    }
                };
            });

            // Some param names should be lower case to avoid signature mismatches
            qq.override(this._paramsStore, function(super_) {
                return {
                    get: function(id) {
                        var oldParams = super_.get(id),
                            modifiedParams = {};

                        qq.each(oldParams, function(name, val) {
                            var paramName = name;

                            if (qq.indexOf(qq.s3.util.CASE_SENSITIVE_PARAM_NAMES, paramName) < 0) {
                                paramName = paramName.toLowerCase();
                            }

                            modifiedParams[paramName] = qq.isFunction(val) ? val() : val;
                        });

                        return modifiedParams;
                    }
                };
            });

            additionalOptions.signature.credentialsProvider = {
                get: function() {
                    return self._currentCredentials;
                },

                onExpired: function() {
                    var updateCredentials = new qq.Promise(),
                        callbackRetVal = self._options.callbacks.onCredentialsExpired();

                    if (qq.isGenericPromise(callbackRetVal)) {
                        callbackRetVal.then(function(credentials) {
                            try {
                                self.setCredentials(credentials);
                                updateCredentials.success();
                            }
                            catch (error) {
                                self.log("Invalid credentials returned from onCredentialsExpired callback! (" + error.message + ")", "error");
                                updateCredentials.failure("onCredentialsExpired did not return valid credentials.");
                            }
                        }, function(errorMsg) {
                            self.log("onCredentialsExpired callback indicated failure! (" + errorMsg + ")", "error");
                            updateCredentials.failure("onCredentialsExpired callback failed.");
                        });
                    }
                    else {
                        self.log("onCredentialsExpired callback did not return a promise!", "error");
                        updateCredentials.failure("Unexpected return value for onCredentialsExpired.");
                    }

                    return updateCredentials;
                }
            };

            return qq.FineUploaderBasic.prototype._createUploadHandler.call(this, additionalOptions, "s3");
        },

        _determineObjectPropertyValue: function(id, property) {
            var maybe = this._options.objectProperties[property],
                promise = new qq.Promise(),
                self = this;

            if (qq.isFunction(maybe)) {
                maybe = maybe(id);
                if (qq.isGenericPromise(maybe)) {
                    promise = maybe;
                }
                else {
                    promise.success(maybe);
                }
            }
            else if (qq.isString(maybe)) {
                promise.success(maybe);
            }

            promise.then(
                function success(value) {
                    self["_" + property + "s"][id] = value;
                },

                function failure(errorMsg) {
                    qq.log("Problem determining " + property + " for ID " + id + " (" + errorMsg + ")", "error");
                }
            );

            return promise;
        },

        _determineBucket: function(id) {
            return this._determineObjectPropertyValue(id, "bucket");
        },

        _determineHost: function(id) {
            return this._determineObjectPropertyValue(id, "host");
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
            /*jshint -W015*/
            var promise = new qq.Promise(),
                keynameLogic = this._options.objectProperties.key,
                extension = qq.getExtension(filename),
                onGetKeynameFailure = promise.failure,
                onGetKeynameSuccess = function(keyname, extension) {
                    var keynameToUse = keyname;

                    if (extension !== undefined) {
                        keynameToUse += "." + extension;
                    }

                    promise.success(keynameToUse);
                };

            switch (keynameLogic) {
                case "uuid":
                    onGetKeynameSuccess(this.getUuid(id), extension);
                    break;
                case "filename":
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
            var self = this,
                onSuccess = function(keyname) {
                    successCallback(keyname);
                },
                onFailure = function(reason) {
                    self.log(qq.format("Failed to retrieve key name for {}.  Reason: {}", id, reason || "null"), "error");
                    failureCallback(reason);
                },
                keyname = keynameFunc.call(this, id);

            if (qq.isGenericPromise(keyname)) {
                keyname.then(onSuccess, onFailure);
            }
            /*jshint -W116*/
            else if (keyname == null) {
                onFailure();
            }
            else {
                onSuccess(keyname);
            }
        },

        _getEndpointSpecificParams: function(id, response, maybeXhr) {
            var params = {
                key: this.getKey(id),
                uuid: this.getUuid(id),
                name: this.getName(id),
                bucket: this.getBucket(id)
            };

            if (maybeXhr && maybeXhr.getResponseHeader("ETag")) {
                params.etag = maybeXhr.getResponseHeader("ETag");
            }
            else if (response.etag) {
                params.etag = response.etag;
            }

            return params;
        },

        // Hooks into the base internal `_onSubmitDelete` to add key and bucket params to the delete file request.
        _onSubmitDelete: function(id, onSuccessCallback) {
            var additionalMandatedParams = {
                key: this.getKey(id),
                bucket: this.getBucket(id)
            };

            return qq.FineUploaderBasic.prototype._onSubmitDelete.call(this, id, onSuccessCallback, additionalMandatedParams);
        },

        _addCannedFile: function(sessionData) {
            var id;

            /* jshint eqnull:true */
            if (sessionData.s3Key == null) {
                throw new qq.Error("Did not find s3Key property in server session response.  This is required!");
            }
            else {
                id = qq.FineUploaderBasic.prototype._addCannedFile.apply(this, arguments);
                this._cannedKeys[id] = sessionData.s3Key;
                this._cannedBuckets[id] = sessionData.s3Bucket;
            }

            return id;
        }
    });
}());

/* globals qq, CryptoJS */

// IE 10 does not support Uint8ClampedArray. We don't need it, but CryptoJS attempts to reference it
// inside a conditional via an instanceof check, which breaks S3 v4 signatures for chunked uploads.
if (!window.Uint8ClampedArray) {
    window.Uint8ClampedArray = function() {};
}
/**
 * Handles signature determination for HTML Form Upload requests and Multipart Uploader requests (via the S3 REST API).
 *
 * If the S3 requests are to be signed server side, this module will send a POST request to the server in an attempt
 * to solicit signatures for various S3-related requests.  This module also parses the response and attempts
 * to determine if the effort was successful.
 *
 * If the S3 requests are to be signed client-side, without the help of a server, this module will utilize CryptoJS to
 * sign the requests directly in the browser and send them off to S3.
 *
 * @param o Options associated with all such requests
 * @returns {{getSignature: Function}} API method used to initiate the signature request.
 * @constructor
 */
qq.s3.RequestSigner = function(o) {
    "use strict";

    var requester,
        thisSignatureRequester = this,
        pendingSignatures = {},
        options = {
            expectingPolicy: false,
            method: "POST",
            signatureSpec: {
                drift: 0,
                credentialsProvider: {},
                endpoint: null,
                customHeaders: {},
                version: 2
            },
            maxConnections: 3,
            endpointStore: {},
            paramsStore: {},
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {}
        },
        credentialsProvider,

        generateHeaders = function(signatureConstructor, signature, promise) {
            var headers = signatureConstructor.getHeaders();

            if (options.signatureSpec.version === 4) {
                headers.Authorization = qq.s3.util.V4_ALGORITHM_PARAM_VALUE +
                    " Credential=" + options.signatureSpec.credentialsProvider.get().accessKey + "/" +
                    qq.s3.util.getCredentialsDate(signatureConstructor.getRequestDate()) + "/" +
                    options.signatureSpec.region + "/" +
                    "s3/aws4_request," +
                    "SignedHeaders=" + signatureConstructor.getSignedHeaders() + "," +
                    "Signature=" + signature;
            }
            else {
                headers.Authorization = "AWS " + options.signatureSpec.credentialsProvider.get().accessKey + ":" + signature;
            }

            promise.success(headers, signatureConstructor.getEndOfUrl());
        },

        v2 = {
            getStringToSign: function(signatureSpec) {
                return qq.format("{}\n{}\n{}\n\n{}/{}/{}",
                    signatureSpec.method,
                    signatureSpec.contentMd5 || "",
                    signatureSpec.contentType || "",
                    signatureSpec.headersStr || "\n",
                    signatureSpec.bucket,
                    signatureSpec.endOfUrl);
            },

            signApiRequest: function(signatureConstructor, headersStr, signatureEffort) {
                var headersWordArray = qq.CryptoJS.enc.Utf8.parse(headersStr),
                    headersHmacSha1 = qq.CryptoJS.HmacSHA1(headersWordArray, credentialsProvider.get().secretKey),
                    headersHmacSha1Base64 = qq.CryptoJS.enc.Base64.stringify(headersHmacSha1);

                generateHeaders(signatureConstructor, headersHmacSha1Base64, signatureEffort);
            },

            signPolicy: function(policy, signatureEffort, updatedAccessKey, updatedSessionToken) {
                var policyStr = JSON.stringify(policy),
                    policyWordArray = qq.CryptoJS.enc.Utf8.parse(policyStr),
                    base64Policy = qq.CryptoJS.enc.Base64.stringify(policyWordArray),
                    policyHmacSha1 = qq.CryptoJS.HmacSHA1(base64Policy, credentialsProvider.get().secretKey),
                    policyHmacSha1Base64 = qq.CryptoJS.enc.Base64.stringify(policyHmacSha1);

                signatureEffort.success({
                    policy: base64Policy,
                    signature: policyHmacSha1Base64
                }, updatedAccessKey, updatedSessionToken);
            }
        },

        v4 = {
            getCanonicalQueryString: function(endOfUri) {
                var queryParamIdx = endOfUri.indexOf("?"),
                    canonicalQueryString = "",
                    encodedQueryParams, encodedQueryParamNames, queryStrings;

                if (queryParamIdx >= 0) {
                    encodedQueryParams = {};
                    queryStrings = endOfUri.substr(queryParamIdx + 1).split("&");

                    qq.each(queryStrings, function(idx, queryString) {
                        var nameAndVal = queryString.split("="),
                            paramVal = nameAndVal[1];

                        if (paramVal == null) {
                            paramVal = "";
                        }

                        encodedQueryParams[encodeURIComponent(nameAndVal[0])] = encodeURIComponent(paramVal);
                    });

                    encodedQueryParamNames = Object.keys(encodedQueryParams).sort();
                    encodedQueryParamNames.forEach(function(encodedQueryParamName, idx) {
                        canonicalQueryString += encodedQueryParamName + "=" + encodedQueryParams[encodedQueryParamName];
                        if (idx < encodedQueryParamNames.length - 1) {
                            canonicalQueryString += "&";
                        }
                    });
                }

                return canonicalQueryString;
            },

            getCanonicalRequest: function(signatureSpec) {
                return qq.format("{}\n{}\n{}\n{}\n{}\n{}",
                    signatureSpec.method,
                    v4.getCanonicalUri(signatureSpec.endOfUrl),
                    v4.getCanonicalQueryString(signatureSpec.endOfUrl),
                    signatureSpec.headersStr || "\n",
                    v4.getSignedHeaders(signatureSpec.headerNames),
                    signatureSpec.hashedContent);
            },

            getCanonicalUri: function(endOfUri) {
                var path = endOfUri,
                    queryParamIdx = endOfUri.indexOf("?");

                if (queryParamIdx > 0) {
                    path = endOfUri.substr(0, queryParamIdx);
                }
                return escape("/" + decodeURIComponent(path));
            },

            getEncodedHashedPayload: function(body) {
                var promise = new qq.Promise(),
                    reader;

                if (qq.isBlob(body)) {
                    // TODO hash blob in webworker if this becomes a notable perf issue
                    reader = new FileReader();
                    reader.onloadend = function(e) {
                        if (e.target.readyState === FileReader.DONE) {
                            if (e.target.error) {
                                promise.failure(e.target.error);
                            }
                            else {
                                var wordArray = qq.CryptoJS.lib.WordArray.create(e.target.result);
                                promise.success(qq.CryptoJS.SHA256(wordArray).toString());
                            }
                        }
                    };
                    reader.readAsArrayBuffer(body);
                }
                else {
                    body = body || "";
                    promise.success(qq.CryptoJS.SHA256(body).toString());
                }

                return promise;
            },

            getScope: function(date, region) {
                return qq.s3.util.getCredentialsDate(date) + "/" +
                    region + "/s3/aws4_request";
            },

            getStringToSign: function(signatureSpec) {
                var canonicalRequest = v4.getCanonicalRequest(signatureSpec),
                    date = qq.s3.util.getV4PolicyDate(signatureSpec.date, signatureSpec.drift),
                    hashedRequest = qq.CryptoJS.SHA256(canonicalRequest).toString(),
                    scope = v4.getScope(signatureSpec.date, options.signatureSpec.region),
                    stringToSignTemplate = "AWS4-HMAC-SHA256\n{}\n{}\n{}";

                return {
                    hashed: qq.format(stringToSignTemplate, date, scope, hashedRequest),
                    raw: qq.format(stringToSignTemplate, date, scope, canonicalRequest)
                };
            },

            getSignedHeaders: function(headerNames) {
                var signedHeaders = "";

                headerNames.forEach(function(headerName, idx) {
                    signedHeaders += headerName.toLowerCase();

                    if (idx < headerNames.length - 1) {
                        signedHeaders += ";";
                    }
                });

                return signedHeaders;
            },

            signApiRequest: function(signatureConstructor, headersStr, signatureEffort) {
                var secretKey = credentialsProvider.get().secretKey,
                    headersPattern = /.+\n.+\n(\d+)\/(.+)\/s3\/.+\n(.+)/,
                    matches = headersPattern.exec(headersStr),
                    dateKey, dateRegionKey, dateRegionServiceKey, signingKey;

                dateKey = qq.CryptoJS.HmacSHA256(matches[1], "AWS4" + secretKey);
                dateRegionKey = qq.CryptoJS.HmacSHA256(matches[2], dateKey);
                dateRegionServiceKey = qq.CryptoJS.HmacSHA256("s3", dateRegionKey);
                signingKey = qq.CryptoJS.HmacSHA256("aws4_request", dateRegionServiceKey);

                generateHeaders(signatureConstructor, qq.CryptoJS.HmacSHA256(headersStr, signingKey), signatureEffort);
            },

            signPolicy: function(policy, signatureEffort, updatedAccessKey, updatedSessionToken) {
                var policyStr = JSON.stringify(policy),
                    policyWordArray = qq.CryptoJS.enc.Utf8.parse(policyStr),
                    base64Policy = qq.CryptoJS.enc.Base64.stringify(policyWordArray),
                    secretKey = credentialsProvider.get().secretKey,
                    credentialPattern = /.+\/(.+)\/(.+)\/s3\/aws4_request/,
                    credentialCondition = (function() {
                        var credential = null;
                        qq.each(policy.conditions, function(key, condition) {
                            var val = condition["x-amz-credential"];
                            if (val) {
                                credential = val;
                                return false;
                            }
                        });
                        return credential;
                    }()),
                    matches, dateKey, dateRegionKey, dateRegionServiceKey, signingKey;

                matches = credentialPattern.exec(credentialCondition);
                dateKey = qq.CryptoJS.HmacSHA256(matches[1], "AWS4" + secretKey);
                dateRegionKey = qq.CryptoJS.HmacSHA256(matches[2], dateKey);
                dateRegionServiceKey = qq.CryptoJS.HmacSHA256("s3", dateRegionKey);
                signingKey = qq.CryptoJS.HmacSHA256("aws4_request", dateRegionServiceKey);

                signatureEffort.success({
                    policy: base64Policy,
                    signature: qq.CryptoJS.HmacSHA256(base64Policy, signingKey).toString()
                }, updatedAccessKey, updatedSessionToken);
            }
        };

    qq.extend(options, o, true);
    credentialsProvider = options.signatureSpec.credentialsProvider;

    function handleSignatureReceived(id, xhrOrXdr, isError) {
        var responseJson = xhrOrXdr.responseText,
            pendingSignatureData = pendingSignatures[id],
            promise = pendingSignatureData.promise,
            signatureConstructor = pendingSignatureData.signatureConstructor,
            errorMessage, response;

        delete pendingSignatures[id];

        // Attempt to parse what we would expect to be a JSON response
        if (responseJson) {
            try {
                response = qq.parseJson(responseJson);
            }
            catch (error) {
                options.log("Error attempting to parse signature response: " + error, "error");
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
            if (options.expectingPolicy && !response.policy) {
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
        else if (signatureConstructor) {
            generateHeaders(signatureConstructor, response.signature, promise);
        }
        else {
            promise.success(response);
        }
    }

    function getStringToSignArtifacts(id, version, requestInfo) {
        var promise = new qq.Promise(),
            method = "POST",
            headerNames = [],
            headersStr = "",
            now = new Date(),
            endOfUrl, signatureSpec, toSign,

            generateStringToSign = function(requestInfo) {
                var contentMd5,
                    headerIndexesToRemove = [];

                qq.each(requestInfo.headers, function(name) {
                    headerNames.push(name);
                });
                headerNames.sort();

                qq.each(headerNames, function(idx, headerName) {
                    if (qq.indexOf(qq.s3.util.UNSIGNABLE_REST_HEADER_NAMES, headerName) < 0) {
                        headersStr += headerName.toLowerCase() + ":" + requestInfo.headers[headerName].trim() + "\n";
                    }
                    else if (headerName === "Content-MD5") {
                        contentMd5 = requestInfo.headers[headerName];
                    }
                    else {
                        headerIndexesToRemove.unshift(idx);
                    }
                });

                qq.each(headerIndexesToRemove, function(idx, headerIdx) {
                    headerNames.splice(headerIdx, 1);
                });

                signatureSpec = {
                    bucket: requestInfo.bucket,
                    contentMd5: contentMd5,
                    contentType: requestInfo.contentType,
                    date: now,
                    drift: options.signatureSpec.drift,
                    endOfUrl: endOfUrl,
                    hashedContent: requestInfo.hashedContent,
                    headerNames: headerNames,
                    headersStr: headersStr,
                    method: method
                };

                toSign = version === 2 ? v2.getStringToSign(signatureSpec) : v4.getStringToSign(signatureSpec);

                return {
                    date: now,
                    endOfUrl: endOfUrl,
                    signedHeaders: version === 4 ? v4.getSignedHeaders(signatureSpec.headerNames) : null,
                    toSign: version === 4 ? toSign.hashed : toSign,
                    toSignRaw: version === 4 ? toSign.raw : toSign
                };
            };

        /*jshint indent:false */
        switch (requestInfo.type) {
            case thisSignatureRequester.REQUEST_TYPE.MULTIPART_ABORT:
                method = "DELETE";
                endOfUrl = qq.format("uploadId={}", requestInfo.uploadId);
                break;
            case thisSignatureRequester.REQUEST_TYPE.MULTIPART_INITIATE:
                endOfUrl = "uploads";
                break;
            case thisSignatureRequester.REQUEST_TYPE.MULTIPART_COMPLETE:
                endOfUrl = qq.format("uploadId={}", requestInfo.uploadId);
                break;
            case thisSignatureRequester.REQUEST_TYPE.MULTIPART_UPLOAD:
                method = "PUT";
                endOfUrl = qq.format("partNumber={}&uploadId={}", requestInfo.partNum, requestInfo.uploadId);
                break;
        }

        endOfUrl = requestInfo.key + "?" + endOfUrl;

        if (version === 4) {
            v4.getEncodedHashedPayload(requestInfo.content).then(function(hashedContent) {
                requestInfo.headers["x-amz-content-sha256"] = hashedContent;
                requestInfo.headers.Host = requestInfo.host;
                requestInfo.headers["x-amz-date"] = qq.s3.util.getV4PolicyDate(now, options.signatureSpec.drift);
                requestInfo.hashedContent = hashedContent;

                promise.success(generateStringToSign(requestInfo));
            });
        }
        else {
            promise.success(generateStringToSign(requestInfo));
        }

        return promise;
    }

    function determineSignatureClientSide(id, toBeSigned, signatureEffort, updatedAccessKey, updatedSessionToken) {
        var updatedHeaders;

        // REST API request
        if (toBeSigned.signatureConstructor) {
            if (updatedSessionToken) {
                updatedHeaders = toBeSigned.signatureConstructor.getHeaders();
                updatedHeaders[qq.s3.util.SESSION_TOKEN_PARAM_NAME] = updatedSessionToken;
                toBeSigned.signatureConstructor.withHeaders(updatedHeaders);
            }

            toBeSigned.signatureConstructor.getToSign(id).then(function(signatureArtifacts) {
                signApiRequest(toBeSigned.signatureConstructor, signatureArtifacts.stringToSign, signatureEffort);
            });
        }
        // Form upload (w/ policy document)
        else {
            updatedSessionToken && qq.s3.util.refreshPolicyCredentials(toBeSigned, updatedSessionToken);
            signPolicy(toBeSigned, signatureEffort, updatedAccessKey, updatedSessionToken);
        }
    }

    function signPolicy(policy, signatureEffort, updatedAccessKey, updatedSessionToken) {
        if (options.signatureSpec.version === 4) {
            v4.signPolicy(policy, signatureEffort, updatedAccessKey, updatedSessionToken);
        }
        else {
            v2.signPolicy(policy, signatureEffort, updatedAccessKey, updatedSessionToken);
        }
    }

    function signApiRequest(signatureConstructor, headersStr, signatureEffort) {
        if (options.signatureSpec.version === 4) {
            v4.signApiRequest(signatureConstructor, headersStr, signatureEffort);
        }
        else {
            v2.signApiRequest(signatureConstructor, headersStr, signatureEffort);
        }
    }

    requester = qq.extend(this, new qq.AjaxRequester({
        acceptHeader: "application/json",
        method: options.method,
        contentType: "application/json; charset=utf-8",
        endpointStore: {
            get: function() {
                return options.signatureSpec.endpoint;
            }
        },
        paramsStore: options.paramsStore,
        maxConnections: options.maxConnections,
        customHeaders: options.signatureSpec.customHeaders,
        log: options.log,
        onComplete: handleSignatureReceived,
        cors: options.cors
    }));

    qq.extend(this, {
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
                signatureConstructor = toBeSigned.signatureConstructor,
                signatureEffort = new qq.Promise(),
                queryParams;

            if (options.signatureSpec.version === 4) {
                queryParams = {v4: true};
            }

            if (credentialsProvider.get().secretKey && qq.CryptoJS) {
                if (credentialsProvider.get().expiration.getTime() > Date.now()) {
                    determineSignatureClientSide(id, toBeSigned, signatureEffort);
                }
                // If credentials are expired, ask for new ones before attempting to sign request
                else {
                    credentialsProvider.onExpired().then(function() {
                        determineSignatureClientSide(id, toBeSigned,
                            signatureEffort,
                            credentialsProvider.get().accessKey,
                            credentialsProvider.get().sessionToken);
                    }, function(errorMsg) {
                        options.log("Attempt to update expired credentials apparently failed! Unable to sign request.  ", "error");
                        signatureEffort.failure("Unable to sign request - expired credentials.");
                    });
                }
            }
            else {
                options.log("Submitting S3 signature request for " + id);

                if (signatureConstructor) {
                    signatureConstructor.getToSign(id).then(function(signatureArtifacts) {
                        params = {headers: signatureArtifacts.stringToSignRaw};
                        requester.initTransport(id)
                            .withParams(params)
                            .withQueryParams(queryParams)
                            .send();
                    });
                }
                else {
                    requester.initTransport(id)
                        .withParams(params)
                        .withQueryParams(queryParams)
                        .send();
                }

                pendingSignatures[id] = {
                    promise: signatureEffort,
                    signatureConstructor: signatureConstructor
                };
            }

            return signatureEffort;
        },

        constructStringToSign: function(type, bucket, host, key) {
            var headers = {},
                uploadId, content, contentType, partNum, artifacts;

            return {
                withHeaders: function(theHeaders) {
                    headers = theHeaders;
                    return this;
                },

                withUploadId: function(theUploadId) {
                    uploadId = theUploadId;
                    return this;
                },

                withContent: function(theContent) {
                    content = theContent;
                    return this;
                },

                withContentType: function(theContentType) {
                    contentType = theContentType;
                    return this;
                },

                withPartNum: function(thePartNum) {
                    partNum = thePartNum;
                    return this;
                },

                getToSign: function(id) {
                    var sessionToken = credentialsProvider.get().sessionToken,
                        promise = new qq.Promise(),
                        adjustedDate = new Date(Date.now() + options.signatureSpec.drift);

                    headers["x-amz-date"] = adjustedDate.toUTCString();

                    if (sessionToken) {
                        headers[qq.s3.util.SESSION_TOKEN_PARAM_NAME] = sessionToken;
                    }

                    getStringToSignArtifacts(id, options.signatureSpec.version, {
                        bucket: bucket,
                        content: content,
                        contentType: contentType,
                        headers: headers,
                        host: host,
                        key: key,
                        partNum: partNum,
                        type: type,
                        uploadId: uploadId
                    }).then(function(_artifacts_) {
                        artifacts = _artifacts_;
                        promise.success({
                            headers: (function() {
                                if (contentType) {
                                    headers["Content-Type"] = contentType;
                                }

                                delete headers.Host; // we don't want this to be set on the XHR-initiated request
                                return headers;
                            }()),
                            date: artifacts.date,
                            endOfUrl: artifacts.endOfUrl,
                            signedHeaders: artifacts.signedHeaders,
                            stringToSign: artifacts.toSign,
                            stringToSignRaw: artifacts.toSignRaw
                        });
                    });

                    return promise;
                },

                getHeaders: function() {
                    return qq.extend({}, headers);
                },

                getEndOfUrl: function() {
                    return artifacts && artifacts.endOfUrl;
                },

                getRequestDate: function() {
                    return artifacts && artifacts.date;
                },

                getSignedHeaders: function() {
                    return artifacts && artifacts.signedHeaders;
                }
            };
        }
    });
};

qq.s3.RequestSigner.prototype.REQUEST_TYPE = {
    MULTIPART_INITIATE: "multipart_initiate",
    MULTIPART_COMPLETE: "multipart_complete",
    MULTIPART_ABORT: "multipart_abort",
    MULTIPART_UPLOAD: "multipart_upload"
};

/*globals qq, XMLHttpRequest*/
/**
 * Sends a POST request to the server to notify it of a successful upload to an endpoint.  The server is expected to indicate success
 * or failure via the response status.  Specific information about the failure can be passed from the server via an `error`
 * property (by default) in an "application/json" response.
 *
 * @param o Options associated with all requests.
 * @constructor
 */
qq.UploadSuccessAjaxRequester = function(o) {
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

        options.log(qq.format("Received the following response body to an upload success request for id {}: {}", id, responseJson));

        try {
            parsedResponse = qq.parseJson(responseJson);

            // If this is a cross-origin request, the server may return a 200 response w/ error or success properties
            // in order to ensure any specific error message is picked up by Fine Uploader for all browsers,
            // since XDomainRequest (used in IE9 and IE8) doesn't give you access to the
            // response body for an "error" response.
            if (isError || (parsedResponse && (parsedResponse.error || parsedResponse.success === false))) {
                options.log("Upload success request was rejected by the server.", "error");
                promise.failure(qq.extend(parsedResponse, failureIndicator));
            }
            else {
                options.log("Upload success was acknowledged by the server.");
                promise.success(qq.extend(parsedResponse, successIndicator));
            }
        }
        catch (error) {
            // This will be executed if a JSON response is not present.  This is not mandatory, so account for this properly.
            if (isError) {
                options.log(qq.format("Your server indicated failure in its upload success request response for id {}!", id), "error");
                promise.failure(failureIndicator);
            }
            else {
                options.log("Upload success was acknowledged by the server.");
                promise.success(successIndicator);
            }
        }
    }

    requester = qq.extend(this, new qq.AjaxRequester({
        acceptHeader: "application/json",
        method: options.method,
        endpointStore: {
            get: function() {
                return options.endpoint;
            }
        },
        paramsStore: options.paramsStore,
        maxConnections: options.maxConnections,
        customHeaders: options.customHeaders,
        log: options.log,
        onComplete: handleSuccessResponse,
        cors: options.cors
    }));

    qq.extend(this, {
        /**
         * Sends a request to the server, notifying it that a recently submitted file was successfully sent.
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

            requester.initTransport(id)
                .withParams(spec)
                .send();

            pendingRequests[id] = promise;

            return promise;
        }
    });
};

/*globals qq*/
/**
 * Ajax requester used to send an ["Initiate Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadInitiate.html)
 * request to S3 via the REST API.
 *
 * @param o Options from the caller - will override the defaults.
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
            signatureSpec: null,
            aclStore: null,
            reducedRedundancy: false,
            serverSideEncryption: false,
            maxConnections: 3,
            getContentType: function(id) {},
            getBucket: function(id) {},
            getHost: function(id) {},
            getKey: function(id) {},
            getName: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    getSignatureAjaxRequester = new qq.s3.RequestSigner({
        endpointStore: options.endpointStore,
        signatureSpec: options.signatureSpec,
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
        var bucket = options.getBucket(id),
            host = options.getHost(id),
            headers = {},
            promise = new qq.Promise(),
            key = options.getKey(id),
            signatureConstructor;

        headers["x-amz-acl"] = options.aclStore.get(id);

        if (options.reducedRedundancy) {
            headers[qq.s3.util.REDUCED_REDUNDANCY_PARAM_NAME] = qq.s3.util.REDUCED_REDUNDANCY_PARAM_VALUE;
        }

        if (options.serverSideEncryption) {
            headers[qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_NAME] = qq.s3.util.SERVER_SIDE_ENCRYPTION_PARAM_VALUE;
        }

        headers[qq.s3.util.AWS_PARAM_PREFIX + options.filenameParam] = encodeURIComponent(options.getName(id));

        qq.each(options.paramsStore.get(id), function(name, val) {
            if (qq.indexOf(qq.s3.util.UNPREFIXED_PARAM_NAMES, name) >= 0) {
                headers[name] = val;
            }
            else {
                headers[qq.s3.util.AWS_PARAM_PREFIX + name] = encodeURIComponent(val);
            }
        });

        signatureConstructor = getSignatureAjaxRequester.constructStringToSign
            (getSignatureAjaxRequester.REQUEST_TYPE.MULTIPART_INITIATE, bucket, host, key)
            .withContentType(options.getContentType(id))
            .withHeaders(headers);

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, {signatureConstructor: signatureConstructor}).then(promise.success, promise.failure);

        return promise;
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

            promise.failure("Problem initiating upload request.", xhr);
        }
        else {
            options.log(qq.format("Initiate multipart upload request successful for {}.  Upload ID is {}", id, uploadId));
            promise.success(uploadId, xhr);
        }
    }

    requester = qq.extend(this, new qq.AjaxRequester({
        method: options.method,
        contentType: null,
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        allowXRequestedWithAndCacheControl: false, //These headers are not necessary & would break some installations if added
        log: options.log,
        onComplete: handleInitiateRequestComplete,
        successfulResponseCodes: {
            POST: [200]
        }
    }));

    qq.extend(this, {
        /**
         * Sends the "Initiate MPU" request to AWS via the REST API.  First, though, we must get a signature from the
         * local server for the request.  If all is successful, the uploadId from AWS will be passed into the promise's
         * success handler. Otherwise, an error message will ultimately be passed into the failure method.
         *
         * @param id The ID associated with the file
         * @returns {qq.Promise}
         */
        send: function(id) {
            var promise = new qq.Promise();

            getHeaders(id).then(function(headers, endOfUrl) {
                options.log("Submitting S3 initiate multipart upload request for " + id);

                pendingInitiateRequests[id] = promise;
                requester.initTransport(id)
                    .withPath(endOfUrl)
                    .withHeaders(headers)
                    .send();
            }, promise.failure);

            return promise;
        }
    });
};

/*globals qq*/
/**
 * Ajax requester used to send an ["Complete Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html)
 * request to S3 via the REST API.
 *
 * @param o Options passed by the creator, to overwrite any default option values.
 * @constructor
 */
qq.s3.CompleteMultipartAjaxRequester = function(o) {
    "use strict";

    var requester,
        pendingCompleteRequests = {},
        options = {
            method: "POST",
            contentType: "text/xml",
            endpointStore: null,
            signatureSpec: null,
            maxConnections: 3,
            getBucket: function(id) {},
            getHost: function(id) {},
            getKey: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    // Transport for requesting signatures (for the "Complete" requests) from the local server
    getSignatureAjaxRequester = new qq.s3.RequestSigner({
        endpointStore: options.endpointStore,
        signatureSpec: options.signatureSpec,
        cors: options.cors,
        log: options.log
    });

    /**
     * Attach all required headers (including Authorization) to the "Complete" request.  This is a promissory function
     * that will fulfill the associated promise once all headers have been attached or when an error has occurred that
     * prevents headers from being attached.
     *
     * @returns {qq.Promise}
     */
    function getHeaders(id, uploadId, body) {
        var headers = {},
            promise = new qq.Promise(),
            bucket = options.getBucket(id),
            host = options.getHost(id),
            signatureConstructor = getSignatureAjaxRequester.constructStringToSign
                (getSignatureAjaxRequester.REQUEST_TYPE.MULTIPART_COMPLETE, bucket, host, options.getKey(id))
                .withUploadId(uploadId)
                .withContent(body)
                .withContentType("application/xml; charset=UTF-8");

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, {signatureConstructor: signatureConstructor}).then(promise.success, promise.failure);

        return promise;
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
            bucket = options.getBucket(id),
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

                // TODO Compare key name from response w/ expected key name if AWS ever fixes the encoding of key names in this response.
            }
            else {
                isError = true;
                options.log(qq.format("Missing bucket and/or key in response to Complete Multipart Upload request for {}.", id), "error");
            }
        }

        if (isError) {
            promise.failure("Problem combining the file parts!", xhr);
        }
        else {
            promise.success({}, xhr);
        }
    }

    /**
     * @param etagEntries Array of objects containing `etag` values and their associated `part` numbers.
     * @returns {string} XML string containing the body to send with the "Complete" request
     */
    function getCompleteRequestBody(etagEntries) {
        var doc = document.implementation.createDocument(null, "CompleteMultipartUpload", null);

        // The entries MUST be sorted by part number, per the AWS API spec.
        etagEntries.sort(function(a, b) {
            return a.part - b.part;
        });

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

    requester = qq.extend(this, new qq.AjaxRequester({
        method: options.method,
        contentType: "application/xml; charset=UTF-8",
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        allowXRequestedWithAndCacheControl: false, //These headers are not necessary & would break some installations if added
        log: options.log,
        onComplete: handleCompleteRequestComplete,
        successfulResponseCodes: {
            POST: [200]
        }
    }));

    qq.extend(this, {
        /**
         * Sends the "Complete" request and fulfills the returned promise when the success of this request is known.
         *
         * @param id ID associated with the file.
         * @param uploadId AWS uploadId for this file
         * @param etagEntries Array of objects containing `etag` values and their associated `part` numbers.
         * @returns {qq.Promise}
         */
        send: function(id, uploadId, etagEntries) {
            var promise = new qq.Promise(),
                body = getCompleteRequestBody(etagEntries);

            getHeaders(id, uploadId, body).then(function(headers, endOfUrl) {
                options.log("Submitting S3 complete multipart upload request for " + id);

                pendingCompleteRequests[id] = promise;
                delete headers["Content-Type"];

                requester.initTransport(id)
                    .withPath(endOfUrl)
                    .withHeaders(headers)
                    .withPayload(body)
                    .send();
            }, promise.failure);

            return promise;
        }
    });
};

/*globals qq */
/**
 * Ajax requester used to send an ["Abort Multipart Upload"](http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadAbort.html)
 * request to S3 via the REST API.

 * @param o
 * @constructor
 */
qq.s3.AbortMultipartAjaxRequester = function(o) {
    "use strict";

    var requester,
        options = {
            method: "DELETE",
            endpointStore: null,
            signatureSpec: null,
            maxConnections: 3,
            getBucket: function(id) {},
            getHost: function(id) {},
            getKey: function(id) {},
            log: function(str, level) {}
        },
        getSignatureAjaxRequester;

    qq.extend(options, o);

    // Transport for requesting signatures (for the "Complete" requests) from the local server
    getSignatureAjaxRequester = new qq.s3.RequestSigner({
        endpointStore: options.endpointStore,
        signatureSpec: options.signatureSpec,
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
            bucket = options.getBucket(id),
            host = options.getHost(id),
            signatureConstructor = getSignatureAjaxRequester.constructStringToSign
                (getSignatureAjaxRequester.REQUEST_TYPE.MULTIPART_ABORT, bucket, host, options.getKey(id))
                .withUploadId(uploadId);

        // Ask the local server to sign the request.  Use this signature to form the Authorization header.
        getSignatureAjaxRequester.getSignature(id, {signatureConstructor: signatureConstructor}).then(promise.success, promise.failure);

        return promise;
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

    requester = qq.extend(this, new qq.AjaxRequester({
        validMethods: ["DELETE"],
        method: options.method,
        contentType: null,
        endpointStore: options.endpointStore,
        maxConnections: options.maxConnections,
        allowXRequestedWithAndCacheControl: false, //These headers are not necessary & would break some installations if added
        log: options.log,
        onComplete: handleAbortRequestComplete,
        successfulResponseCodes: {
            DELETE: [204]
        }
    }));

    qq.extend(this, {
        /**
         * Sends the "Abort" request.
         *
         * @param id ID associated with the file.
         * @param uploadId AWS uploadId for this file
         */
        send: function(id, uploadId) {
            getHeaders(id, uploadId).then(function(headers, endOfUrl) {
                options.log("Submitting S3 Abort multipart upload request for " + id);
                requester.initTransport(id)
                    .withPath(endOfUrl)
                    .withHeaders(headers)
                    .send();
            });
        }
    });
};

/*globals qq */
/**
 * Upload handler used by the upload to S3 module that depends on File API support, and, therefore, makes use of
 * `XMLHttpRequest` level 2 to upload `File`s and `Blob`s directly to S3 buckets via the associated AWS API.
 *
 * If chunking is supported and enabled, the S3 Multipart Upload REST API is utilized.
 *
 * @param spec Options passed from the base handler
 * @param proxy Callbacks & methods used to query for or push out data/changes
 */
qq.s3.XhrUploadHandler = function(spec, proxy) {
    "use strict";

    var getName = proxy.getName,
        log = proxy.log,
        clockDrift = spec.clockDrift,
        expectedStatus = 200,
        onGetBucket = spec.getBucket,
        onGetHost = spec.getHost,
        onGetKeyName = spec.getKeyName,
        filenameParam = spec.filenameParam,
        paramsStore = spec.paramsStore,
        endpointStore = spec.endpointStore,
        aclStore = spec.aclStore,
        reducedRedundancy = spec.objectProperties.reducedRedundancy,
        region = spec.objectProperties.region,
        serverSideEncryption = spec.objectProperties.serverSideEncryption,
        validation = spec.validation,
        signature = qq.extend({region: region, drift: clockDrift}, spec.signature),
        handler = this,
        credentialsProvider = spec.signature.credentialsProvider,

        chunked = {
            // Sends a "Complete Multipart Upload" request and then signals completion of the upload
            // when the response to this request has been parsed.
            combine: function(id) {
                var uploadId = handler._getPersistableData(id).uploadId,
                    etagMap = handler._getPersistableData(id).etags,
                    result = new qq.Promise();

                requesters.completeMultipart.send(id, uploadId, etagMap).then(
                    result.success,

                    function failure(reason, xhr) {
                        result.failure(upload.done(id, xhr).response, xhr);
                    }
                );

                return result;
            },

            // The last step in handling a chunked upload.  This is called after each chunk has been sent.
            // The request may be successful, or not.  If it was successful, we must extract the "ETag" element
            // in the XML response and store that along with the associated part number.
            // We need these items to "Complete" the multipart upload after all chunks have been successfully sent.
            done: function(id, xhr, chunkIdx) {
                var response = upload.response.parse(id, xhr),
                    etag;

                if (response.success) {
                    etag = xhr.getResponseHeader("ETag");

                    if (!handler._getPersistableData(id).etags) {
                        handler._getPersistableData(id).etags = [];
                    }
                    handler._getPersistableData(id).etags.push({part: chunkIdx + 1, etag: etag});
                }
            },

            /**
             * Determines headers that must be attached to the chunked (Multipart Upload) request.  One of these headers is an
             * Authorization value, which must be determined by asking the local server to sign the request first.  So, this
             * function returns a promise.  Once all headers are determined, the `success` method of the promise is called with
             * the headers object.  If there was some problem determining the headers, we delegate to the caller's `failure`
             * callback.
             *
             * @param id File ID
             * @param chunkIdx Index of the chunk to PUT
             * @returns {qq.Promise}
             */
            initHeaders: function(id, chunkIdx, blob) {
                var headers = {},
                    bucket = upload.bucket.getName(id),
                    host = upload.host.getName(id),
                    key = upload.key.urlSafe(id),
                    promise = new qq.Promise(),
                    signatureConstructor = requesters.restSignature.constructStringToSign
                        (requesters.restSignature.REQUEST_TYPE.MULTIPART_UPLOAD, bucket, host, key)
                        .withPartNum(chunkIdx + 1)
                        .withContent(blob)
                        .withUploadId(handler._getPersistableData(id).uploadId);

                // Ask the local server to sign the request.  Use this signature to form the Authorization header.
                requesters.restSignature.getSignature(id + "." + chunkIdx, {signatureConstructor: signatureConstructor}).then(promise.success, promise.failure);

                return promise;
            },

            put: function(id, chunkIdx) {
                var xhr = handler._createXhr(id, chunkIdx),
                    chunkData = handler._getChunkData(id, chunkIdx),
                    domain = spec.endpointStore.get(id),
                    promise = new qq.Promise();

                // Add appropriate headers to the multipart upload request.
                // Once these have been determined (asynchronously) attach the headers and send the chunk.
                chunked.initHeaders(id, chunkIdx, chunkData.blob).then(function(headers, endOfUrl) {
                    if (xhr._cancelled) {
                        log(qq.format("Upload of item {}.{} cancelled. Upload will not start after successful signature request.", id, chunkIdx));
                        promise.failure({error: "Chunk upload cancelled"});
                    }
                    else {
                        var url = domain + "/" + endOfUrl;
                        handler._registerProgressHandler(id, chunkIdx, chunkData.size);
                        upload.track(id, xhr, chunkIdx).then(promise.success, promise.failure);
                        xhr.open("PUT", url, true);

                        qq.each(headers, function(name, val) {
                            xhr.setRequestHeader(name, val);
                        });

                        xhr.send(chunkData.blob);
                    }
                }, function() {
                    promise.failure({error: "Problem signing the chunk!"}, xhr);
                });

                return promise;
            },

            send: function(id, chunkIdx) {
                var promise = new qq.Promise();

                chunked.setup(id).then(
                    // The "Initiate" request succeeded.  We are ready to send the first chunk.
                    function() {
                        chunked.put(id, chunkIdx).then(promise.success, promise.failure);
                    },

                    // We were unable to initiate the chunked upload process.
                    function(errorMessage, xhr) {
                        promise.failure({error: errorMessage}, xhr);
                    }
                );

                return promise;
            },

            /**
             * Sends an "Initiate Multipart Upload" request to S3 via the REST API, but only if the MPU has not already been
             * initiated.
             *
             * @param id Associated file ID
             * @returns {qq.Promise} A promise that is fulfilled when the initiate request has been sent and the response has been parsed.
             */
            setup: function(id) {
                var promise = new qq.Promise(),
                    uploadId = handler._getPersistableData(id).uploadId,
                    uploadIdPromise = new qq.Promise();

                if (!uploadId) {
                    handler._getPersistableData(id).uploadId = uploadIdPromise;
                    requesters.initiateMultipart.send(id).then(
                        function(uploadId) {
                            handler._getPersistableData(id).uploadId = uploadId;
                            uploadIdPromise.success(uploadId);
                            promise.success(uploadId);
                        },
                        function(errorMsg, xhr) {
                            handler._getPersistableData(id).uploadId = null;
                            promise.failure(errorMsg, xhr);
                            uploadIdPromise.failure(errorMsg, xhr);
                        }
                    );
                }
                else if (uploadId instanceof qq.Promise) {
                    uploadId.then(function(uploadId) {
                        promise.success(uploadId);
                    });
                }
                else {
                    promise.success(uploadId);
                }

                return promise;
            }
        },

        requesters = {
            abortMultipart: new qq.s3.AbortMultipartAjaxRequester({
                endpointStore: endpointStore,
                signatureSpec: signature,
                cors: spec.cors,
                log: log,
                getBucket: function(id) {
                    return upload.bucket.getName(id);
                },
                getHost: function(id) {
                    return upload.host.getName(id);
                },
                getKey: function(id) {
                    return upload.key.urlSafe(id);
                }
            }),

            completeMultipart: new qq.s3.CompleteMultipartAjaxRequester({
                endpointStore: endpointStore,
                signatureSpec: signature,
                cors: spec.cors,
                log: log,
                getBucket: function(id) {
                    return upload.bucket.getName(id);
                },
                getHost: function(id) {
                    return upload.host.getName(id);
                },
                getKey: function(id) {
                    return upload.key.urlSafe(id);
                }
            }),

            initiateMultipart: new qq.s3.InitiateMultipartAjaxRequester({
                filenameParam: filenameParam,
                endpointStore: endpointStore,
                paramsStore: paramsStore,
                signatureSpec: signature,
                aclStore: aclStore,
                reducedRedundancy: reducedRedundancy,
                serverSideEncryption: serverSideEncryption,
                cors: spec.cors,
                log: log,
                getContentType: function(id) {
                    return handler._getMimeType(id);
                },
                getBucket: function(id) {
                    return upload.bucket.getName(id);
                },
                getHost: function(id) {
                    return upload.host.getName(id);
                },
                getKey: function(id) {
                    return upload.key.urlSafe(id);
                },
                getName: function(id) {
                    return getName(id);
                }
            }),

            policySignature: new qq.s3.RequestSigner({
                expectingPolicy: true,
                signatureSpec: signature,
                cors: spec.cors,
                log: log
            }),

            restSignature: new qq.s3.RequestSigner({
                endpointStore: endpointStore,
                signatureSpec: signature,
                cors: spec.cors,
                log: log
            })
        },

        simple = {
            /**
             * Used for simple (non-chunked) uploads to determine the parameters to send along with the request.  Part of this
             * process involves asking the local server to sign the request, so this function returns a promise.  The promise
             * is fulfilled when all parameters are determined, or when we determine that all parameters cannnot be calculated
             * due to some error.
             *
             * @param id File ID
             * @returns {qq.Promise}
             */
            initParams: function(id) {
                /*jshint -W040 */
                var customParams = paramsStore.get(id);
                customParams[filenameParam] = getName(id);

                return qq.s3.util.generateAwsParams({
                    endpoint: endpointStore.get(id),
                    clockDrift: clockDrift,
                    params: customParams,
                    type: handler._getMimeType(id),
                    bucket: upload.bucket.getName(id),
                    key: handler.getThirdPartyFileId(id),
                    accessKey: credentialsProvider.get().accessKey,
                    sessionToken: credentialsProvider.get().sessionToken,
                    acl: aclStore.get(id),
                    expectedStatus: expectedStatus,
                    minFileSize: validation.minSizeLimit,
                    maxFileSize: validation.maxSizeLimit,
                    reducedRedundancy: reducedRedundancy,
                    region: region,
                    serverSideEncryption: serverSideEncryption,
                    signatureVersion: signature.version,
                    log: log
                },
                qq.bind(requesters.policySignature.getSignature, this, id));
            },

            send: function(id) {
                var promise = new qq.Promise(),
                    xhr = handler._createXhr(id),
                    fileOrBlob = handler.getFile(id);

                handler._registerProgressHandler(id);
                upload.track(id, xhr).then(promise.success, promise.failure);

                // Delegate to a function the sets up the XHR request and notifies us when it is ready to be sent, along w/ the payload.
                simple.setup(id, xhr, fileOrBlob).then(function(toSend) {
                    log("Sending upload request for " + id);
                    xhr.send(toSend);
                }, promise.failure);

                return promise;
            },

            /**
             * Starts the upload process by delegating to an async function that determine parameters to be attached to the
             * request.  If all params can be determined, we are called back with the params and the caller of this function is
             * informed by invoking the `success` method on the promise returned by this function, passing the payload of the
             * request.  If some error occurs here, we delegate to a function that signals a failure for this upload attempt.
             *
             * Note that this is only used by the simple (non-chunked) upload process.
             *
             * @param id File ID
             * @param xhr XMLHttpRequest to use for the upload
             * @param fileOrBlob `File` or `Blob` to send
             * @returns {qq.Promise}
             */
            setup: function(id, xhr, fileOrBlob) {
                var formData = new FormData(),
                    endpoint = endpointStore.get(id),
                    url = endpoint,
                    promise = new qq.Promise();

                simple.initParams(id).then(
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
                        promise.failure({error: errorMessage});
                    }
                );

                return promise;
            }
        },

        upload = {
            /**
             * Note that this is called when an upload has reached a termination point,
             * regardless of success/failure.  For example, it is called when we have
             * encountered an error during the upload or when the file may have uploaded successfully.
             *
             * @param id file ID
             */
            bucket: {
                promise: function(id) {
                    var promise = new qq.Promise(),
                        cachedBucket = handler._getFileState(id).bucket;

                    if (cachedBucket) {
                        promise.success(cachedBucket);
                    }
                    else {
                        onGetBucket(id).then(function(bucket) {
                            handler._getFileState(id).bucket = bucket;
                            promise.success(bucket);
                        }, promise.failure);
                    }

                    return promise;
                },

                getName: function(id) {
                    return handler._getFileState(id).bucket;
                }
            },

            host: {
                promise: function(id) {
                    var promise = new qq.Promise(),
                        cachedHost = handler._getFileState(id).host;

                    if (cachedHost) {
                        promise.success(cachedHost);
                    }
                    else {
                        onGetHost(id).then(function(host) {
                            handler._getFileState(id).host = host;
                            promise.success(host);
                        }, promise.failure);
                    }

                    return promise;
                },

                getName: function(id) {
                    return handler._getFileState(id).host;
                }
            },

            done: function(id, xhr) {
                var response = upload.response.parse(id, xhr),
                    isError = response.success !== true;

                if (isError && upload.response.shouldReset(response.code)) {
                    log("This is an unrecoverable error, we must restart the upload entirely on the next retry attempt.", "error");
                    response.reset = true;
                }

                return {
                    success: !isError,
                    response: response
                };
            },

            key: {
                promise: function(id) {
                    var promise = new qq.Promise(),
                        key = handler.getThirdPartyFileId(id);

                    /* jshint eqnull:true */
                    if (key == null) {
                        handler._setThirdPartyFileId(id, promise);
                        onGetKeyName(id, getName(id)).then(
                            function(keyName) {
                                handler._setThirdPartyFileId(id, keyName);
                                promise.success(keyName);
                            },
                            function(errorReason) {
                                handler._setThirdPartyFileId(id, null);
                                promise.failure(errorReason);
                            }
                        );
                    }
                    else if (qq.isGenericPromise(key)) {
                        key.then(promise.success, promise.failure);
                    }
                    else {
                        promise.success(key);
                    }

                    return promise;
                },

                urlSafe: function(id) {
                    var encodedKey = encodeURIComponent(handler.getThirdPartyFileId(id));
                    return encodedKey.replace(/%2F/g, "/");
                }
            },

            response: {
                parse: function(id, xhr) {
                    var response = {},
                        parsedErrorProps;

                    try {
                        log(qq.format("Received response status {} with body: {}", xhr.status, xhr.responseText));

                        if (xhr.status === expectedStatus) {
                            response.success = true;
                        }
                        else {
                            parsedErrorProps = upload.response.parseError(xhr.responseText);

                            if (parsedErrorProps) {
                                response.error = parsedErrorProps.message;
                                response.code = parsedErrorProps.code;
                            }
                        }
                    }
                    catch (error) {
                        log("Error when attempting to parse xhr response text (" + error.message + ")", "error");
                    }

                    return response;
                },

                /**
                 * This parses an XML response by extracting the "Message" and "Code" elements that accompany AWS error responses.
                 *
                 * @param awsResponseXml XML response from AWS
                 * @returns {object} Object w/ `code` and `message` properties, or undefined if we couldn't find error info in the XML document.
                 */
                parseError: function(awsResponseXml) {
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
                },

                // Determine if the upload should be restarted on the next retry attempt
                // based on the error code returned in the response from AWS.
                shouldReset: function(errorCode) {
                    /*jshint -W014 */
                    return errorCode === "EntityTooSmall"
                        || errorCode === "InvalidPart"
                        || errorCode === "InvalidPartOrder"
                        || errorCode === "NoSuchUpload";
                }
            },

            start: function(id, optChunkIdx) {
                var promise = new qq.Promise();

                upload.key.promise(id).then(function() {
                    upload.bucket.promise(id).then(function() {
                        upload.host.promise(id).then(function() {
                            /* jshint eqnull:true */
                            if (optChunkIdx == null) {
                                simple.send(id).then(promise.success, promise.failure);
                            }
                            else {
                                chunked.send(id, optChunkIdx).then(promise.success, promise.failure);
                            }
                        });
                    });
                },
                function(errorReason) {
                    promise.failure({error: errorReason});
                });

                return promise;
            },

            track: function(id, xhr, optChunkIdx) {
                var promise = new qq.Promise();

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var result;

                        /* jshint eqnull:true */
                        if (optChunkIdx == null) {
                            result = upload.done(id, xhr);
                            promise[result.success ? "success" : "failure"](result.response, xhr);
                        }
                        else {
                            chunked.done(id, xhr, optChunkIdx);
                            result = upload.done(id, xhr);
                            promise[result.success ? "success" : "failure"](result.response, xhr);
                        }
                    }
                };

                return promise;
            }
        };

    qq.extend(this, {
        uploadChunk: upload.start,
        uploadFile: upload.start
    });

    qq.extend(this, new qq.XhrUploadHandler({
        options: qq.extend({namespace: "s3"}, spec),
        proxy: qq.extend({getEndpoint: spec.endpointStore.get}, proxy)
    }));

    qq.override(this, function(super_) {
        return {
            expunge: function(id) {
                var uploadId = handler._getPersistableData(id) && handler._getPersistableData(id).uploadId,
                    existedInLocalStorage = handler._maybeDeletePersistedChunkData(id);

                if (uploadId !== undefined && existedInLocalStorage) {
                    requesters.abortMultipart.send(id, uploadId);
                }

                super_.expunge(id);
            },

            finalizeChunks: function(id) {
                return chunked.combine(id);
            },

            _getLocalStorageId: function(id) {
                var baseStorageId = super_._getLocalStorageId(id),
                    bucketName = upload.bucket.getName(id);

                return baseStorageId + "-" + bucketName;
            }
        };
    });
};

/*globals qq */
/**
 * Upload handler used by the upload to S3 module that assumes the current user agent does not have any support for the
 * File API, and, therefore, makes use of iframes and forms to submit the files directly to S3 buckets via the associated
 * AWS API.
 *
 * @param options Options passed from the base handler
 * @param proxy Callbacks & methods used to query for or push out data/changes
 */
qq.s3.FormUploadHandler = function(options, proxy) {
    "use strict";

    var handler = this,
        clockDrift = options.clockDrift,
        onUuidChanged = proxy.onUuidChanged,
        getName = proxy.getName,
        getUuid = proxy.getUuid,
        log = proxy.log,
        onGetBucket = options.getBucket,
        onGetKeyName = options.getKeyName,
        filenameParam = options.filenameParam,
        paramsStore = options.paramsStore,
        endpointStore = options.endpointStore,
        aclStore = options.aclStore,
        reducedRedundancy = options.objectProperties.reducedRedundancy,
        region = options.objectProperties.region,
        serverSideEncryption = options.objectProperties.serverSideEncryption,
        validation = options.validation,
        signature = options.signature,
        successRedirectUrl = options.iframeSupport.localBlankPagePath,
        credentialsProvider = options.signature.credentialsProvider,
        getSignatureAjaxRequester = new qq.s3.RequestSigner({
            signatureSpec: signature,
            cors: options.cors,
            log: log
        });

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
            endpoint = options.endpointStore.get(id),
            bucket = handler._getFileState(id).bucket,
            doc,
            innerHtml,
            responseData;

        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
        try {
            // iframe.contentWindow.document - for IE<7
            doc = iframe.contentDocument || iframe.contentWindow.document;
            innerHtml = doc.body.innerHTML;

            responseData = qq.s3.util.parseIframeResponse(iframe);
            if (responseData.bucket === bucket &&
                responseData.key === qq.s3.util.encodeQueryStringParam(handler.getThirdPartyFileId(id))) {

                return true;
            }

            log("Response from AWS included an unexpected bucket or key name.", "error");

        }
        catch (error) {
            log("Error when attempting to parse form upload response (" + error.message + ")", "error");
        }

        return false;
    }

    function generateAwsParams(id) {
        /*jshint -W040 */
        var customParams = paramsStore.get(id);

        customParams[filenameParam] = getName(id);

        return qq.s3.util.generateAwsParams({
            endpoint: endpointStore.get(id),
            clockDrift: clockDrift,
            params: customParams,
            bucket: handler._getFileState(id).bucket,
            key: handler.getThirdPartyFileId(id),
            accessKey: credentialsProvider.get().accessKey,
            sessionToken: credentialsProvider.get().sessionToken,
            acl: aclStore.get(id),
            minFileSize: validation.minSizeLimit,
            maxFileSize: validation.maxSizeLimit,
            successRedirectUrl: successRedirectUrl,
            reducedRedundancy: reducedRedundancy,
            region: region,
            serverSideEncryption: serverSideEncryption,
            signatureVersion: signature.version,
            log: log
        },
        qq.bind(getSignatureAjaxRequester.getSignature, this, id));
    }

    /**
     * Creates form, that will be submitted to iframe
     */
    function createForm(id, iframe) {
        var promise = new qq.Promise(),
            method = "POST",
            endpoint = options.endpointStore.get(id),
            fileName = getName(id);

        generateAwsParams(id).then(function(params) {
            var form = handler._initFormForUpload({
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
        var iframe = handler._createIframe(id),
            input = handler.getInput(id),
            promise = new qq.Promise();

        createForm(id, iframe).then(function(form) {
            form.appendChild(input);

            // Register a callback when the response comes in from S3
            handler._attachLoadEvent(iframe, function(response) {
                log("iframe loaded");

                // If the common response handler has determined success or failure immediately
                if (response) {
                    // If there is something fundamentally wrong with the response (such as iframe content is not accessible)
                    if (response.success === false) {
                        log("Amazon likely rejected the upload request", "error");
                        promise.failure(response);
                    }
                }
                // The generic response (iframe onload) handler was not able to make a determination regarding the success of the request
                else {
                    response = {};
                    response.success = isValidResponse(id, iframe);

                    // If the more specific response handle detected a problem with the response from S3
                    if (response.success === false) {
                        log("A success response was received by Amazon, but it was invalid in some way.", "error");
                        promise.failure(response);
                    }
                    else {
                        qq.extend(response, qq.s3.util.parseIframeResponse(iframe));
                        promise.success(response);
                    }
                }

                handleFinishedUpload(id, iframe);
            });

            log("Sending upload request for " + id);
            form.submit();
            qq(form).remove();
        }, promise.failure);

        return promise;
    }

    function handleFinishedUpload(id, iframe) {
        handler._detachLoadEvent(id);
        iframe && qq(iframe).remove();
    }

    qq.extend(this, new qq.FormUploadHandler({
        options: {
            isCors: false,
            inputName: "file"
        },

        proxy: {
            onCancel: options.onCancel,
            onUuidChanged: onUuidChanged,
            getName: getName,
            getUuid: getUuid,
            log: log
        }
    }));

    qq.extend(this, {
        uploadFile: function(id) {
            var name = getName(id),
                promise = new qq.Promise();

            if (handler.getThirdPartyFileId(id)) {
                if (handler._getFileState(id).bucket) {
                    handleUpload(id).then(promise.success, promise.failure);
                }
                else {
                    onGetBucket(id).then(function(bucket) {
                        handler._getFileState(id).bucket = bucket;
                        handleUpload(id).then(promise.success, promise.failure);
                    });
                }
            }
            else {
                // The S3 uploader module will either calculate the key or ask the server for it
                // and will call us back once it is known.
                onGetKeyName(id, name).then(function(key) {
                    onGetBucket(id).then(function(bucket) {
                        handler._getFileState(id).bucket = bucket;
                        handler._setThirdPartyFileId(id, key);
                        handleUpload(id).then(promise.success, promise.failure);
                    }, function(errorReason) {
                        promise.failure({error: errorReason});
                    });
                }, function(errorReason) {
                    promise.failure({error: errorReason});
                });
            }

            return promise;
        }
    });
};

/*globals qq */
/**
 * This defines FineUploader mode w/ support for uploading to S3, which provides all the basic
 * functionality of Fine Uploader as well as code to handle uploads directly to S3.
 * This module inherits all logic from FineUploader mode and FineUploaderBasicS3 mode and adds some UI-related logic
 * specific to the upload-to-S3 workflow.  Some inherited options and API methods have a special meaning
 * in the context of the S3 uploader.
 */
(function() {
    "use strict";

    qq.s3.FineUploader = function(o) {
        var options = {
            failedUploadTextDisplay: {
                mode: "custom"
            }
        };

        // Replace any default options with user defined ones
        qq.extend(options, o, true);

        // Inherit instance data from FineUploader, which should in turn inherit from s3.FineUploaderBasic.
        qq.FineUploader.call(this, options, "s3");

        if (!qq.supportedFeatures.ajaxUploading && options.iframeSupport.localBlankPagePath === undefined) {
            this._options.element.innerHTML = "<div>You MUST set the <code>localBlankPagePath</code> property " +
                "of the <code>iframeSupport</code> option since this browser does not support the File API!</div>";
        }
    };

    // Inherit the API methods from FineUploaderBasicS3
    qq.extend(qq.s3.FineUploader.prototype, qq.s3.FineUploaderBasic.prototype);

    // Inherit public and private API methods related to UI
    qq.extend(qq.s3.FineUploader.prototype, qq.uiPublicApi);
    qq.extend(qq.s3.FineUploader.prototype, qq.uiPrivateApi);
}());

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
        detachPasteHandler = qq(options.targetElement).attach("paste", function(event) {
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

    qq.extend(this, {
        reset: function() {
            unregisterPasteHandler();
        }
    });
};

/*globals qq, document, CustomEvent*/
qq.DragAndDrop = function(o) {
    "use strict";

    var options,
        HIDE_ZONES_EVENT_NAME = "qq-hidezones",
        HIDE_BEFORE_ENTER_ATTR = "qq-hide-dropzone",
        uploadDropZones = [],
        droppedFiles = [],
        disposeSupport = new qq.DisposeSupport();

    options = {
        dropZoneElements: [],
        allowMultipleItems: true,
        classes: {
            dropActive: null
        },
        callbacks: new qq.DragAndDrop.callbacks()
    };

    qq.extend(options, o, true);

    function uploadDroppedFiles(files, uploadDropZone) {
        // We need to convert the `FileList` to an actual `Array` to avoid iteration issues
        var filesAsArray = Array.prototype.slice.call(files);

        options.callbacks.dropLog("Grabbed " + files.length + " dropped files.");
        uploadDropZone.dropDisabled(false);
        options.callbacks.processingDroppedFilesComplete(filesAsArray, uploadDropZone.getElement());
    }

    function traverseFileTree(entry) {
        var parseEntryPromise = new qq.Promise();

        if (entry.isFile) {
            entry.file(function(file) {
                var name = entry.name,
                    fullPath = entry.fullPath,
                    indexOfNameInFullPath = fullPath.indexOf(name);

                // remove file name from full path string
                fullPath = fullPath.substr(0, indexOfNameInFullPath);

                // remove leading slash in full path string
                if (fullPath.charAt(0) === "/") {
                    fullPath = fullPath.substr(1);
                }

                file.qqPath = fullPath;
                droppedFiles.push(file);
                parseEntryPromise.success();
            },
            function(fileError) {
                options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                parseEntryPromise.failure();
            });
        }
        else if (entry.isDirectory) {
            getFilesInDirectory(entry).then(
                function allEntriesRead(entries) {
                    var entriesLeft = entries.length;

                    qq.each(entries, function(idx, entry) {
                        traverseFileTree(entry).done(function() {
                            entriesLeft -= 1;

                            if (entriesLeft === 0) {
                                parseEntryPromise.success();
                            }
                        });
                    });

                    if (!entries.length) {
                        parseEntryPromise.success();
                    }
                },

                function readFailure(fileError) {
                    options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                    parseEntryPromise.failure();
                }
            );
        }

        return parseEntryPromise;
    }

    // Promissory.  Guaranteed to read all files in the root of the passed directory.
    function getFilesInDirectory(entry, reader, accumEntries, existingPromise) {
        var promise = existingPromise || new qq.Promise(),
            dirReader = reader || entry.createReader();

        dirReader.readEntries(
            function readSuccess(entries) {
                var newEntries = accumEntries ? accumEntries.concat(entries) : entries;

                if (entries.length) {
                    setTimeout(function() { // prevent stack oveflow, however unlikely
                        getFilesInDirectory(entry, dirReader, newEntries, promise);
                    }, 0);
                }
                else {
                    promise.success(newEntries);
                }
            },

            promise.failure
        );

        return promise;
    }

    function handleDataTransfer(dataTransfer, uploadDropZone) {
        var pendingFolderPromises = [],
            handleDataTransferPromise = new qq.Promise();

        options.callbacks.processingDroppedFiles();
        uploadDropZone.dropDisabled(true);

        if (dataTransfer.files.length > 1 && !options.allowMultipleItems) {
            options.callbacks.processingDroppedFilesComplete([]);
            options.callbacks.dropError("tooManyFilesError", "");
            uploadDropZone.dropDisabled(false);
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

    function setupDropzone(dropArea) {
        var dropZone = new qq.UploadDropZone({
            HIDE_ZONES_EVENT_NAME: HIDE_ZONES_EVENT_NAME,
            element: dropArea,
            onEnter: function(e) {
                qq(dropArea).addClass(options.classes.dropActive);
                e.stopPropagation();
            },
            onLeaveNotDescendants: function(e) {
                qq(dropArea).removeClass(options.classes.dropActive);
            },
            onDrop: function(e) {
                handleDataTransfer(e.dataTransfer, dropZone).then(
                    function() {
                        uploadDroppedFiles(droppedFiles, dropZone);
                    },
                    function() {
                        options.callbacks.dropLog("Drop event DataTransfer parsing failed.  No files will be uploaded.", "error");
                    }
                );
            }
        });

        disposeSupport.addDisposer(function() {
            dropZone.dispose();
        });

        qq(dropArea).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropArea).hide();

        uploadDropZones.push(dropZone);

        return dropZone;
    }

    function isFileDrag(dragEvent) {
        var fileDrag;

        qq.each(dragEvent.dataTransfer.types, function(key, val) {
            if (val === "Files") {
                fileDrag = true;
                return false;
            }
        });

        return fileDrag;
    }

    // Attempt to determine when the file has left the document.  It is not always possible to detect this
    // in all cases, but it is generally possible in all browsers, with a few exceptions.
    //
    // Exceptions:
    // * IE10+ & Safari: We can't detect a file leaving the document if the Explorer window housing the file
    //                   overlays the browser window.
    // * IE10+: If the file is dragged out of the window too quickly, IE does not set the expected values of the
    //          event's X & Y properties.
    function leavingDocumentOut(e) {
        if (qq.firefox()) {
            return !e.relatedTarget;
        }

        if (qq.safari()) {
            return e.x < 0 || e.y < 0;
        }

        return e.x === 0 && e.y === 0;
    }

    function setupDragDrop() {
        var dropZones = options.dropZoneElements,

            maybeHideDropZones = function() {
                setTimeout(function() {
                    qq.each(dropZones, function(idx, dropZone) {
                        qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropZone).hide();
                        qq(dropZone).removeClass(options.classes.dropActive);
                    });
                }, 10);
            };

        qq.each(dropZones, function(idx, dropZone) {
            var uploadDropZone = setupDropzone(dropZone);

            // IE <= 9 does not support the File API used for drag+drop uploads
            if (dropZones.length && qq.supportedFeatures.fileDrop) {
                disposeSupport.attach(document, "dragenter", function(e) {
                    if (!uploadDropZone.dropDisabled() && isFileDrag(e)) {
                        qq.each(dropZones, function(idx, dropZone) {
                            // We can't apply styles to non-HTMLElements, since they lack the `style` property.
                            // Also, if the drop zone isn't initially hidden, let's not mess with `style.display`.
                            if (dropZone instanceof HTMLElement &&
                                qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR)) {

                                qq(dropZone).css({display: "block"});
                            }
                        });
                    }
                });
            }
        });

        disposeSupport.attach(document, "dragleave", function(e) {
            if (leavingDocumentOut(e)) {
                maybeHideDropZones();
            }
        });

        // Just in case we were not able to detect when a dragged file has left the document,
        // hide all relevant drop zones the next time the mouse enters the document.
        // Note that mouse events such as this one are not fired during drag operations.
        disposeSupport.attach(qq(document).children()[0], "mouseenter", function(e) {
            maybeHideDropZones();
        });

        disposeSupport.attach(document, "drop", function(e) {
            e.preventDefault();
            maybeHideDropZones();
        });

        disposeSupport.attach(document, HIDE_ZONES_EVENT_NAME, maybeHideDropZones);
    }

    setupDragDrop();

    qq.extend(this, {
        setupExtraDropzone: function(element) {
            options.dropZoneElements.push(element);
            setupDropzone(element);
        },

        removeDropzone: function(element) {
            var i,
                dzs = options.dropZoneElements;

            for (i in dzs) {
                if (dzs[i] === element) {
                    return dzs.splice(i, 1);
                }
            }
        },

        dispose: function() {
            disposeSupport.dispose();
            qq.each(uploadDropZones, function(idx, dropZone) {
                dropZone.dispose();
            });
        }
    });
};

qq.DragAndDrop.callbacks = function() {
    "use strict";

    return {
        processingDroppedFiles: function() {},
        processingDroppedFilesComplete: function(files, targetEl) {},
        dropError: function(code, errorSpecifics) {
            qq.log("Drag & drop error code '" + code + " with these specifics: '" + errorSpecifics + "'", "error");
        },
        dropLog: function(message, level) {
            qq.log(message, level);
        }
    };
};

qq.UploadDropZone = function(o) {
    "use strict";

    var disposeSupport = new qq.DisposeSupport(),
        options, element, preventDrop, dropOutsideDisabled;

    options = {
        element: null,
        onEnter: function(e) {},
        onLeave: function(e) {},
        // is not fired when leaving element by hovering descendants
        onLeaveNotDescendants: function(e) {},
        onDrop: function(e) {}
    };

    qq.extend(options, o);
    element = options.element;

    function dragoverShouldBeCanceled() {
        return qq.safari() || (qq.firefox() && qq.windows());
    }

    function disableDropOutside(e) {
        // run only once for all instances
        if (!dropOutsideDisabled) {

            // for these cases we need to catch onDrop to reset dropArea
            if (dragoverShouldBeCanceled) {
                disposeSupport.attach(document, "dragover", function(e) {
                    e.preventDefault();
                });
            } else {
                disposeSupport.attach(document, "dragover", function(e) {
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = "none";
                        e.preventDefault();
                    }
                });
            }

            dropOutsideDisabled = true;
        }
    }

    function isValidFileDrag(e) {
        // e.dataTransfer currently causing IE errors
        // IE9 does NOT support file API, so drag-and-drop is not possible
        if (!qq.supportedFeatures.fileDrop) {
            return false;
        }

        var effectTest, dt = e.dataTransfer,
        // do not check dt.types.contains in webkit, because it crashes safari 4
        isSafari = qq.safari();

        // dt.effectAllowed is none in Safari 5
        // dt.types.contains check is for firefox

        // dt.effectAllowed crashes IE 11 & 10 when files have been dragged from
        // the filesystem
        effectTest = qq.ie() && qq.supportedFeatures.fileDrop ? true : dt.effectAllowed !== "none";
        return dt && effectTest && (dt.files || (!isSafari && dt.types.contains && dt.types.contains("Files")));
    }

    function isOrSetDropDisabled(isDisabled) {
        if (isDisabled !== undefined) {
            preventDrop = isDisabled;
        }
        return preventDrop;
    }

    function triggerHidezonesEvent() {
        var hideZonesEvent;

        function triggerUsingOldApi() {
            hideZonesEvent = document.createEvent("Event");
            hideZonesEvent.initEvent(options.HIDE_ZONES_EVENT_NAME, true, true);
        }

        if (window.CustomEvent) {
            try {
                hideZonesEvent = new CustomEvent(options.HIDE_ZONES_EVENT_NAME);
            }
            catch (err) {
                triggerUsingOldApi();
            }
        }
        else {
            triggerUsingOldApi();
        }

        document.dispatchEvent(hideZonesEvent);
    }

    function attachEvents() {
        disposeSupport.attach(element, "dragover", function(e) {
            if (!isValidFileDrag(e)) {
                return;
            }

            // dt.effectAllowed crashes IE 11 & 10 when files have been dragged from
            // the filesystem
            var effect = qq.ie() && qq.supportedFeatures.fileDrop ? null : e.dataTransfer.effectAllowed;
            if (effect === "move" || effect === "linkMove") {
                e.dataTransfer.dropEffect = "move"; // for FF (only move allowed)
            } else {
                e.dataTransfer.dropEffect = "copy"; // for Chrome
            }

            e.stopPropagation();
            e.preventDefault();
        });

        disposeSupport.attach(element, "dragenter", function(e) {
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }
                options.onEnter(e);
            }
        });

        disposeSupport.attach(element, "dragleave", function(e) {
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

        disposeSupport.attach(element, "drop", function(e) {
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                options.onDrop(e);

                triggerHidezonesEvent();
            }
        });
    }

    disableDropOutside();
    attachEvents();

    qq.extend(this, {
        dropDisabled: function(isDisabled) {
            return isOrSetDropDisabled(isDisabled);
        },

        dispose: function() {
            disposeSupport.dispose();
        },

        getElement: function() {
            return element;
        }
    });
};

/*globals qq, XMLHttpRequest*/
qq.DeleteFileAjaxRequester = function(o) {
    "use strict";

    var requester,
        options = {
            method: "DELETE",
            uuidParamName: "qquuid",
            endpointStore: {},
            maxConnections: 3,
            customHeaders: function(id) {return {};},
            paramsStore: {},
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
                _method: "DELETE"
            };
        }

        return {};
    }

    requester = qq.extend(this, new qq.AjaxRequester({
        acceptHeader: "application/json",
        validMethods: ["POST", "DELETE"],
        method: options.method,
        endpointStore: options.endpointStore,
        paramsStore: options.paramsStore,
        mandatedParams: getMandatedParams(),
        maxConnections: options.maxConnections,
        customHeaders: function(id) {
            return options.customHeaders.get(id);
        },
        log: options.log,
        onSend: options.onDelete,
        onComplete: options.onDeleteComplete,
        cors: options.cors
    }));

    qq.extend(this, {
        sendDelete: function(id, uuid, additionalMandatedParams) {
            var additionalOptions = additionalMandatedParams || {};

            options.log("Submitting delete file request for " + id);

            if (options.method === "DELETE") {
                requester.initTransport(id)
                    .withPath(uuid)
                    .withParams(additionalOptions)
                    .send();
            }
            else {
                additionalOptions[options.uuidParamName] = uuid;
                requester.initTransport(id)
                    .withParams(additionalOptions)
                    .send();
            }
        }
    });
};

/*global qq, define */
/*jshint strict:false,bitwise:false,nonew:false,asi:true,-W064,-W116,-W089 */
/**
 * Mega pixel image rendering library for iOS6+
 *
 * Fixes iOS6+'s image file rendering issue for large size image (over mega-pixel),
 * which causes unexpected subsampling when drawing it in canvas.
 * By using this library, you can safely render the image with proper stretching.
 *
 * Copyright (c) 2012 Shinichi Tomita <shinichi.tomita@gmail.com>
 * Released under the MIT license
 *
 * Heavily modified by Widen for Fine Uploader
 */
(function() {

    /**
     * Detect subsampling in loaded image.
     * In iOS, larger images than 2M pixels may be subsampled in rendering.
     */
    function detectSubsampling(img) {
        var iw = img.naturalWidth,
            ih = img.naturalHeight,
            canvas = document.createElement("canvas"),
            ctx;

        if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
            canvas.width = canvas.height = 1;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, -iw + 1, 0);
            // subsampled image becomes half smaller in rendering size.
            // check alpha channel value to confirm image is covering edge pixel or not.
            // if alpha value is 0 image is not covering, hence subsampled.
            return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        } else {
            return false;
        }
    }

    /**
     * Detecting vertical squash in loaded image.
     * Fixes a bug which squash image vertically while drawing into canvas for some images.
     */
    function detectVerticalSquash(img, iw, ih) {
        var canvas = document.createElement("canvas"),
            sy = 0,
            ey = ih,
            py = ih,
            ctx, data, alpha, ratio;

        canvas.width = 1;
        canvas.height = ih;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        data = ctx.getImageData(0, 0, 1, ih).data;

        // search image edge pixel position in case it is squashed vertically.
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }

        ratio = (py / ih);
        return (ratio === 0) ? 1 : ratio;
    }

    /**
     * Rendering image element (with resizing) and get its data URL
     */
    function renderImageToDataURL(img, options, doSquash) {
        var canvas = document.createElement("canvas"),
            mime = options.mime || "image/jpeg";

        renderImageToCanvas(img, canvas, options, doSquash);
        return canvas.toDataURL(mime, options.quality || 0.8);
    }

    function maybeCalculateDownsampledDimensions(spec) {
        var maxPixels = 5241000; //iOS specific value

        if (!qq.ios()) {
            throw new qq.Error("Downsampled dimensions can only be reliably calculated for iOS!");
        }

        if (spec.origHeight * spec.origWidth > maxPixels) {
            return {
                newHeight: Math.round(Math.sqrt(maxPixels * (spec.origHeight / spec.origWidth))),
                newWidth: Math.round(Math.sqrt(maxPixels * (spec.origWidth / spec.origHeight)))
            }
        }
    }

    /**
     * Rendering image element (with resizing) into the canvas element
     */
    function renderImageToCanvas(img, canvas, options, doSquash) {
        var iw = img.naturalWidth,
            ih = img.naturalHeight,
            width = options.width,
            height = options.height,
            ctx = canvas.getContext("2d"),
            modifiedDimensions;

        ctx.save();

        if (!qq.supportedFeatures.unlimitedScaledImageSize) {
            modifiedDimensions = maybeCalculateDownsampledDimensions({
                origWidth: width,
                origHeight: height
            });

            if (modifiedDimensions) {
                qq.log(qq.format("Had to reduce dimensions due to device limitations from {}w / {}h to {}w / {}h",
                    width, height, modifiedDimensions.newWidth, modifiedDimensions.newHeight),
                "warn");

                width = modifiedDimensions.newWidth;
                height = modifiedDimensions.newHeight;
            }
        }

        transformCoordinate(canvas, width, height, options.orientation);

        // Fine Uploader specific: Save some CPU cycles if not using iOS
        // Assumption: This logic is only needed to overcome iOS image sampling issues
        if (qq.ios()) {
            (function() {
                if (detectSubsampling(img)) {
                    iw /= 2;
                    ih /= 2;
                }

                var d = 1024, // size of tiling canvas
                    tmpCanvas = document.createElement("canvas"),
                    vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1,
                    dw = Math.ceil(d * width / iw),
                    dh = Math.ceil(d * height / ih / vertSquashRatio),
                    sy = 0,
                    dy = 0,
                    tmpCtx, sx, dx;

                tmpCanvas.width = tmpCanvas.height = d;
                tmpCtx = tmpCanvas.getContext("2d");

                while (sy < ih) {
                    sx = 0,
                    dx = 0;
                    while (sx < iw) {
                        tmpCtx.clearRect(0, 0, d, d);
                        tmpCtx.drawImage(img, -sx, -sy);
                        ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
                        sx += d;
                        dx += dw;
                    }
                    sy += d;
                    dy += dh;
                }
                ctx.restore();
                tmpCanvas = tmpCtx = null;
            }())
        }
        else {
            ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.qqImageRendered && canvas.qqImageRendered();
    }

    /**
     * Transform canvas coordination according to specified frame size and orientation
     * Orientation value is from EXIF tag
     */
    function transformCoordinate(canvas, width, height, orientation) {
        switch (orientation) {
            case 5:
            case 6:
            case 7:
            case 8:
                canvas.width = height;
                canvas.height = width;
                break;
            default:
                canvas.width = width;
                canvas.height = height;
        }
        var ctx = canvas.getContext("2d");
        switch (orientation) {
            case 2:
                // horizontal flip
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                break;
            case 3:
                // 180 rotate left
                ctx.translate(width, height);
                ctx.rotate(Math.PI);
                break;
            case 4:
                // vertical flip
                ctx.translate(0, height);
                ctx.scale(1, -1);
                break;
            case 5:
                // vertical flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
            case 6:
                // 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(0, -height);
                break;
            case 7:
                // horizontal flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(width, -height);
                ctx.scale(-1, 1);
                break;
            case 8:
                // 90 rotate left
                ctx.rotate(-0.5 * Math.PI);
                ctx.translate(-width, 0);
                break;
            default:
                break;
        }
    }

    /**
     * MegaPixImage class
     */
    function MegaPixImage(srcImage, errorCallback) {
        var self = this;

        if (window.Blob && srcImage instanceof Blob) {
            (function() {
                var img = new Image(),
                    URL = window.URL && window.URL.createObjectURL ? window.URL :
                        window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL : null;
                if (!URL) { throw Error("No createObjectURL function found to create blob url"); }
                img.src = URL.createObjectURL(srcImage);
                self.blob = srcImage;
                srcImage = img;
            }());
        }
        if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
            srcImage.onload = function() {
                var listeners = self.imageLoadListeners;
                if (listeners) {
                    self.imageLoadListeners = null;
                    // IE11 doesn't reliably report actual image dimensions immediately after onload for small files,
                    // so let's push this to the end of the UI thread queue.
                    setTimeout(function() {
                        for (var i = 0, len = listeners.length; i < len; i++) {
                            listeners[i]();
                        }
                    }, 0);
                }
            };
            srcImage.onerror = errorCallback;
            this.imageLoadListeners = [];
        }
        this.srcImage = srcImage;
    }

    /**
     * Rendering megapix image into specified target element
     */
    MegaPixImage.prototype.render = function(target, options) {
        options = options || {};

        var self = this,
            imgWidth = this.srcImage.naturalWidth,
            imgHeight = this.srcImage.naturalHeight,
            width = options.width,
            height = options.height,
            maxWidth = options.maxWidth,
            maxHeight = options.maxHeight,
            doSquash = !this.blob || this.blob.type === "image/jpeg",
            tagName = target.tagName.toLowerCase(),
            opt;

        if (this.imageLoadListeners) {
            this.imageLoadListeners.push(function() { self.render(target, options) });
            return;
        }

        if (width && !height) {
            height = (imgHeight * width / imgWidth) << 0;
        } else if (height && !width) {
            width = (imgWidth * height / imgHeight) << 0;
        } else {
            width = imgWidth;
            height = imgHeight;
        }
        if (maxWidth && width > maxWidth) {
            width = maxWidth;
            height = (imgHeight * width / imgWidth) << 0;
        }
        if (maxHeight && height > maxHeight) {
            height = maxHeight;
            width = (imgWidth * height / imgHeight) << 0;
        }

        opt = { width: width, height: height },
        qq.each(options, function(optionsKey, optionsValue) {
            opt[optionsKey] = optionsValue;
        });

        if (tagName === "img") {
            (function() {
                var oldTargetSrc = target.src;
                target.src = renderImageToDataURL(self.srcImage, opt, doSquash);
                oldTargetSrc === target.src && target.onload();
            }())
        } else if (tagName === "canvas") {
            renderImageToCanvas(this.srcImage, target, opt, doSquash);
        }
        if (typeof this.onrender === "function") {
            this.onrender(target);
        }
    };

    qq.MegaPixImage = MegaPixImage;
})();

/*globals qq */
/**
 * Draws a thumbnail of a Blob/File/URL onto an <img> or <canvas>.
 *
 * @constructor
 */
qq.ImageGenerator = function(log) {
    "use strict";

    function isImg(el) {
        return el.tagName.toLowerCase() === "img";
    }

    function isCanvas(el) {
        return el.tagName.toLowerCase() === "canvas";
    }

    function isImgCorsSupported() {
        return new Image().crossOrigin !== undefined;
    }

    function isCanvasSupported() {
        var canvas = document.createElement("canvas");

        return canvas.getContext && canvas.getContext("2d");
    }

    // This is only meant to determine the MIME type of a renderable image file.
    // It is used to ensure images drawn from a URL that have transparent backgrounds
    // are rendered correctly, among other things.
    function determineMimeOfFileName(nameWithPath) {
        /*jshint -W015 */
        var pathSegments = nameWithPath.split("/"),
            name = pathSegments[pathSegments.length - 1],
            extension = qq.getExtension(name);

        extension = extension && extension.toLowerCase();

        switch (extension) {
            case "jpeg":
            case "jpg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "bmp":
                return "image/bmp";
            case "gif":
                return "image/gif";
            case "tiff":
            case "tif":
                return "image/tiff";
        }
    }

    // This will likely not work correctly in IE8 and older.
    // It's only used as part of a formula to determine
    // if a canvas can be used to scale a server-hosted thumbnail.
    // If canvas isn't supported by the UA (IE8 and older)
    // this method should not even be called.
    function isCrossOrigin(url) {
        var targetAnchor = document.createElement("a"),
            targetProtocol, targetHostname, targetPort;

        targetAnchor.href = url;

        targetProtocol = targetAnchor.protocol;
        targetPort = targetAnchor.port;
        targetHostname = targetAnchor.hostname;

        if (targetProtocol.toLowerCase() !== window.location.protocol.toLowerCase()) {
            return true;
        }

        if (targetHostname.toLowerCase() !== window.location.hostname.toLowerCase()) {
            return true;
        }

        // IE doesn't take ports into consideration when determining if two endpoints are same origin.
        if (targetPort !== window.location.port && !qq.ie()) {
            return true;
        }

        return false;
    }

    function registerImgLoadListeners(img, promise) {
        img.onload = function() {
            img.onload = null;
            img.onerror = null;
            promise.success(img);
        };

        img.onerror = function() {
            img.onload = null;
            img.onerror = null;
            log("Problem drawing thumbnail!", "error");
            promise.failure(img, "Problem drawing thumbnail!");
        };
    }

    function registerCanvasDrawImageListener(canvas, promise) {
        // The image is drawn on the canvas by a third-party library,
        // and we want to know when this is completed.  Since the library
        // may invoke drawImage many times in a loop, we need to be called
        // back when the image is fully rendered.  So, we are expecting the
        // code that draws this image to follow a convention that involves a
        // function attached to the canvas instance be invoked when it is done.
        canvas.qqImageRendered = function() {
            promise.success(canvas);
        };
    }

    // Fulfills a `qq.Promise` when an image has been drawn onto the target,
    // whether that is a <canvas> or an <img>.  The attempt is considered a
    // failure if the target is not an <img> or a <canvas>, or if the drawing
    // attempt was not successful.
    function registerThumbnailRenderedListener(imgOrCanvas, promise) {
        var registered = isImg(imgOrCanvas) || isCanvas(imgOrCanvas);

        if (isImg(imgOrCanvas)) {
            registerImgLoadListeners(imgOrCanvas, promise);
        }
        else if (isCanvas(imgOrCanvas)) {
            registerCanvasDrawImageListener(imgOrCanvas, promise);
        }
        else {
            promise.failure(imgOrCanvas);
            log(qq.format("Element container of type {} is not supported!", imgOrCanvas.tagName), "error");
        }

        return registered;
    }

    // Draw a preview iff the current UA can natively display it.
    // Also rotate the image if necessary.
    function draw(fileOrBlob, container, options) {
        var drawPreview = new qq.Promise(),
            identifier = new qq.Identify(fileOrBlob, log),
            maxSize = options.maxSize,
            // jshint eqnull:true
            orient = options.orient == null ? true : options.orient,
            megapixErrorHandler = function() {
                container.onerror = null;
                container.onload = null;
                log("Could not render preview, file may be too large!", "error");
                drawPreview.failure(container, "Browser cannot render image!");
            };

        identifier.isPreviewable().then(
            function(mime) {
                // If options explicitly specify that Orientation is not desired,
                // replace the orient task with a dummy promise that "succeeds" immediately.
                var dummyExif = {
                        parse: function() {
                            return new qq.Promise().success();
                        }
                    },
                    exif = orient ? new qq.Exif(fileOrBlob, log) : dummyExif,
                    mpImg = new qq.MegaPixImage(fileOrBlob, megapixErrorHandler);

                if (registerThumbnailRenderedListener(container, drawPreview)) {
                    exif.parse().then(
                        function(exif) {
                            var orientation = exif && exif.Orientation;

                            mpImg.render(container, {
                                maxWidth: maxSize,
                                maxHeight: maxSize,
                                orientation: orientation,
                                mime: mime
                            });
                        },

                        function(failureMsg) {
                            log(qq.format("EXIF data could not be parsed ({}).  Assuming orientation = 1.", failureMsg));

                            mpImg.render(container, {
                                maxWidth: maxSize,
                                maxHeight: maxSize,
                                mime: mime
                            });
                        }
                    );
                }
            },

            function() {
                log("Not previewable");
                drawPreview.failure(container, "Not previewable");
            }
        );

        return drawPreview;
    }

    function drawOnCanvasOrImgFromUrl(url, canvasOrImg, draw, maxSize) {
        var tempImg = new Image(),
            tempImgRender = new qq.Promise();

        registerThumbnailRenderedListener(tempImg, tempImgRender);

        if (isCrossOrigin(url)) {
            tempImg.crossOrigin = "anonymous";
        }

        tempImg.src = url;

        tempImgRender.then(
            function rendered() {
                registerThumbnailRenderedListener(canvasOrImg, draw);

                var mpImg = new qq.MegaPixImage(tempImg);
                mpImg.render(canvasOrImg, {
                    maxWidth: maxSize,
                    maxHeight: maxSize,
                    mime: determineMimeOfFileName(url)
                });
            },

            draw.failure
        );
    }

    function drawOnImgFromUrlWithCssScaling(url, img, draw, maxSize) {
        registerThumbnailRenderedListener(img, draw);
        // NOTE: The fact that maxWidth/height is set on the thumbnail for scaled images
        // that must drop back to CSS is known and exploited by the templating module.
        // In this module, we pre-render "waiting" thumbs for all files immediately after they
        // are submitted, and we must be sure to pass any style associated with the "waiting" preview.
        qq(img).css({
            maxWidth: maxSize + "px",
            maxHeight: maxSize + "px"
        });

        img.src = url;
    }

    // Draw a (server-hosted) thumbnail given a URL.
    // This will optionally scale the thumbnail as well.
    // It attempts to use <canvas> to scale, but will fall back
    // to max-width and max-height style properties if the UA
    // doesn't support canvas or if the images is cross-domain and
    // the UA doesn't support the crossorigin attribute on img tags,
    // which is required to scale a cross-origin image using <canvas> &
    // then export it back to an <img>.
    function drawFromUrl(url, container, options) {
        var draw = new qq.Promise(),
            scale = options.scale,
            maxSize = scale ? options.maxSize : null;

        // container is an img, scaling needed
        if (scale && isImg(container)) {
            // Iff canvas is available in this UA, try to use it for scaling.
            // Otherwise, fall back to CSS scaling
            if (isCanvasSupported()) {
                // Attempt to use <canvas> for image scaling,
                // but we must fall back to scaling via CSS/styles
                // if this is a cross-origin image and the UA doesn't support <img> CORS.
                if (isCrossOrigin(url) && !isImgCorsSupported()) {
                    drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);
                }
                else {
                    drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);
                }
            }
            else {
                drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);
            }
        }
        // container is a canvas, scaling optional
        else if (isCanvas(container)) {
            drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);
        }
        // container is an img & no scaling: just set the src attr to the passed url
        else if (registerThumbnailRenderedListener(container, draw)) {
            container.src = url;
        }

        return draw;
    }

    qq.extend(this, {
        /**
         * Generate a thumbnail.  Depending on the arguments, this may either result in
         * a client-side rendering of an image (if a `Blob` is supplied) or a server-generated
         * image that may optionally be scaled client-side using <canvas> or CSS/styles (as a fallback).
         *
         * @param fileBlobOrUrl a `File`, `Blob`, or a URL pointing to the image
         * @param container <img> or <canvas> to contain the preview
         * @param options possible properties include `maxSize` (int), `orient` (bool - default true), and `resize` (bool - default true)
         * @returns qq.Promise fulfilled when the preview has been drawn, or the attempt has failed
         */
        generate: function(fileBlobOrUrl, container, options) {
            if (qq.isString(fileBlobOrUrl)) {
                log("Attempting to update thumbnail based on server response.");
                return drawFromUrl(fileBlobOrUrl, container, options || {});
            }
            else {
                log("Attempting to draw client-side image preview.");
                return draw(fileBlobOrUrl, container, options || {});
            }
        }
    });

};

/*globals qq */
/**
 * EXIF image data parser.  Currently only parses the Orientation tag value,
 * but this may be expanded to other tags in the future.
 *
 * @param fileOrBlob Attempt to parse EXIF data in this `Blob`
 * @constructor
 */
qq.Exif = function(fileOrBlob, log) {
    "use strict";

    // Orientation is the only tag parsed here at this time.
    var TAG_IDS = [274],
        TAG_INFO = {
            274: {
                name: "Orientation",
                bytes: 2
            }
        };

    // Convert a little endian (hex string) to big endian (decimal).
    function parseLittleEndian(hex) {
        var result = 0,
            pow = 0;

        while (hex.length > 0) {
            result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
            hex = hex.substring(2, hex.length);
            pow += 8;
        }

        return result;
    }

    // Find the byte offset, of Application Segment 1 (EXIF).
    // External callers need not supply any arguments.
    function seekToApp1(offset, promise) {
        var theOffset = offset,
            thePromise = promise;
        if (theOffset === undefined) {
            theOffset = 2;
            thePromise = new qq.Promise();
        }

        qq.readBlobToHex(fileOrBlob, theOffset, 4).then(function(hex) {
            var match = /^ffe([0-9])/.exec(hex),
                segmentLength;

            if (match) {
                if (match[1] !== "1") {
                    segmentLength = parseInt(hex.slice(4, 8), 16);
                    seekToApp1(theOffset + segmentLength + 2, thePromise);
                }
                else {
                    thePromise.success(theOffset);
                }
            }
            else {
                thePromise.failure("No EXIF header to be found!");
            }
        });

        return thePromise;
    }

    // Find the byte offset of Application Segment 1 (EXIF) for valid JPEGs only.
    function getApp1Offset() {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, 0, 6).then(function(hex) {
            if (hex.indexOf("ffd8") !== 0) {
                promise.failure("Not a valid JPEG!");
            }
            else {
                seekToApp1().then(function(offset) {
                    promise.success(offset);
                },
                function(error) {
                    promise.failure(error);
                });
            }
        });

        return promise;
    }

    // Determine the byte ordering of the EXIF header.
    function isLittleEndian(app1Start) {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, app1Start + 10, 2).then(function(hex) {
            promise.success(hex === "4949");
        });

        return promise;
    }

    // Determine the number of directory entries in the EXIF header.
    function getDirEntryCount(app1Start, littleEndian) {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, app1Start + 18, 2).then(function(hex) {
            if (littleEndian) {
                return promise.success(parseLittleEndian(hex));
            }
            else {
                promise.success(parseInt(hex, 16));
            }
        });

        return promise;
    }

    // Get the IFD portion of the EXIF header as a hex string.
    function getIfd(app1Start, dirEntries) {
        var offset = app1Start + 20,
            bytes = dirEntries * 12;

        return qq.readBlobToHex(fileOrBlob, offset, bytes);
    }

    // Obtain an array of all directory entries (as hex strings) in the EXIF header.
    function getDirEntries(ifdHex) {
        var entries = [],
            offset = 0;

        while (offset + 24 <= ifdHex.length) {
            entries.push(ifdHex.slice(offset, offset + 24));
            offset += 24;
        }

        return entries;
    }

    // Obtain values for all relevant tags and return them.
    function getTagValues(littleEndian, dirEntries) {
        var TAG_VAL_OFFSET = 16,
            tagsToFind = qq.extend([], TAG_IDS),
            vals = {};

        qq.each(dirEntries, function(idx, entry) {
            var idHex = entry.slice(0, 4),
                id = littleEndian ? parseLittleEndian(idHex) : parseInt(idHex, 16),
                tagsToFindIdx = tagsToFind.indexOf(id),
                tagValHex, tagName, tagValLength;

            if (tagsToFindIdx >= 0) {
                tagName = TAG_INFO[id].name;
                tagValLength = TAG_INFO[id].bytes;
                tagValHex = entry.slice(TAG_VAL_OFFSET, TAG_VAL_OFFSET + (tagValLength * 2));
                vals[tagName] = littleEndian ? parseLittleEndian(tagValHex) : parseInt(tagValHex, 16);

                tagsToFind.splice(tagsToFindIdx, 1);
            }

            if (tagsToFind.length === 0) {
                return false;
            }
        });

        return vals;
    }

    qq.extend(this, {
        /**
         * Attempt to parse the EXIF header for the `Blob` associated with this instance.
         *
         * @returns {qq.Promise} To be fulfilled when the parsing is complete.
         * If successful, the parsed EXIF header as an object will be included.
         */
        parse: function() {
            var parser = new qq.Promise(),
                onParseFailure = function(message) {
                    log(qq.format("EXIF header parse failed: '{}' ", message));
                    parser.failure(message);
                };

            getApp1Offset().then(function(app1Offset) {
                log(qq.format("Moving forward with EXIF header parsing for '{}'", fileOrBlob.name === undefined ? "blob" : fileOrBlob.name));

                isLittleEndian(app1Offset).then(function(littleEndian) {

                    log(qq.format("EXIF Byte order is {} endian", littleEndian ? "little" : "big"));

                    getDirEntryCount(app1Offset, littleEndian).then(function(dirEntryCount) {

                        log(qq.format("Found {} APP1 directory entries", dirEntryCount));

                        getIfd(app1Offset, dirEntryCount).then(function(ifdHex) {
                            var dirEntries = getDirEntries(ifdHex),
                                tagValues = getTagValues(littleEndian, dirEntries);

                            log("Successfully parsed some EXIF tags");

                            parser.success(tagValues);
                        }, onParseFailure);
                    }, onParseFailure);
                }, onParseFailure);
            }, onParseFailure);

            return parser;
        }
    });

};

/*globals qq */
qq.Identify = function(fileOrBlob, log) {
    "use strict";

    function isIdentifiable(magicBytes, questionableBytes) {
        var identifiable = false,
            magicBytesEntries = [].concat(magicBytes);

        qq.each(magicBytesEntries, function(idx, magicBytesArrayEntry) {
            if (questionableBytes.indexOf(magicBytesArrayEntry) === 0) {
                identifiable = true;
                return false;
            }
        });

        return identifiable;
    }

    qq.extend(this, {
        /**
         * Determines if a Blob can be displayed natively in the current browser.  This is done by reading magic
         * bytes in the beginning of the file, so this is an asynchronous operation.  Before we attempt to read the
         * file, we will examine the blob's type attribute to save CPU cycles.
         *
         * @returns {qq.Promise} Promise that is fulfilled when identification is complete.
         * If successful, the MIME string is passed to the success handler.
         */
        isPreviewable: function() {
            var self = this,
                idenitifer = new qq.Promise(),
                previewable = false,
                name = fileOrBlob.name === undefined ? "blob" : fileOrBlob.name;

            log(qq.format("Attempting to determine if {} can be rendered in this browser", name));

            log("First pass: check type attribute of blob object.");

            if (this.isPreviewableSync()) {
                log("Second pass: check for magic bytes in file header.");

                qq.readBlobToHex(fileOrBlob, 0, 4).then(function(hex) {
                    qq.each(self.PREVIEWABLE_MIME_TYPES, function(mime, bytes) {
                        if (isIdentifiable(bytes, hex)) {
                            // Safari is the only supported browser that can deal with TIFFs natively,
                            // so, if this is a TIFF and the UA isn't Safari, declare this file "non-previewable".
                            if (mime !== "image/tiff" || qq.supportedFeatures.tiffPreviews) {
                                previewable = true;
                                idenitifer.success(mime);
                            }

                            return false;
                        }
                    });

                    log(qq.format("'{}' is {} able to be rendered in this browser", name, previewable ? "" : "NOT"));

                    if (!previewable) {
                        idenitifer.failure();
                    }
                },
                function() {
                    log("Error reading file w/ name '" + name + "'.  Not able to be rendered in this browser.");
                    idenitifer.failure();
                });
            }
            else {
                idenitifer.failure();
            }

            return idenitifer;
        },

        /**
         * Determines if a Blob can be displayed natively in the current browser.  This is done by checking the
         * blob's type attribute.  This is a synchronous operation, useful for situations where an asynchronous operation
         * would be challenging to support.  Note that the blob's type property is not as accurate as reading the
         * file's magic bytes.
         *
         * @returns {Boolean} true if the blob can be rendered in the current browser
         */
        isPreviewableSync: function() {
            var fileMime = fileOrBlob.type,
                // Assumption: This will only ever be executed in browsers that support `Object.keys`.
                isRecognizedImage = qq.indexOf(Object.keys(this.PREVIEWABLE_MIME_TYPES), fileMime) >= 0,
                previewable = false,
                name = fileOrBlob.name === undefined ? "blob" : fileOrBlob.name;

            if (isRecognizedImage) {
                if (fileMime === "image/tiff") {
                    previewable = qq.supportedFeatures.tiffPreviews;
                }
                else {
                    previewable = true;
                }
            }

            !previewable && log(name + " is not previewable in this browser per the blob's type attr");

            return previewable;
        }
    });
};

qq.Identify.prototype.PREVIEWABLE_MIME_TYPES = {
    "image/jpeg": "ffd8ff",
    "image/gif": "474946",
    "image/png": "89504e",
    "image/bmp": "424d",
    "image/tiff": ["49492a00", "4d4d002a"]
};

/*globals qq*/
/**
 * Attempts to validate an image, wherever possible.
 *
 * @param blob File or Blob representing a user-selecting image.
 * @param log Uses this to post log messages to the console.
 * @constructor
 */
qq.ImageValidation = function(blob, log) {
    "use strict";

    /**
     * @param limits Object with possible image-related limits to enforce.
     * @returns {boolean} true if at least one of the limits has a non-zero value
     */
    function hasNonZeroLimits(limits) {
        var atLeastOne = false;

        qq.each(limits, function(limit, value) {
            if (value > 0) {
                atLeastOne = true;
                return false;
            }
        });

        return atLeastOne;
    }

    /**
     * @returns {qq.Promise} The promise is a failure if we can't obtain the width & height.
     * Otherwise, `success` is called on the returned promise with an object containing
     * `width` and `height` properties.
     */
    function getWidthHeight() {
        var sizeDetermination = new qq.Promise();

        new qq.Identify(blob, log).isPreviewable().then(function() {
            var image = new Image(),
                url = window.URL && window.URL.createObjectURL ? window.URL :
                      window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL :
                      null;

            if (url) {
                image.onerror = function() {
                    log("Cannot determine dimensions for image.  May be too large.", "error");
                    sizeDetermination.failure();
                };

                image.onload = function() {
                    sizeDetermination.success({
                        width: this.width,
                        height: this.height
                    });
                };

                image.src = url.createObjectURL(blob);
            }
            else {
                log("No createObjectURL function available to generate image URL!", "error");
                sizeDetermination.failure();
            }
        }, sizeDetermination.failure);

        return sizeDetermination;
    }

    /**
     *
     * @param limits Object with possible image-related limits to enforce.
     * @param dimensions Object containing `width` & `height` properties for the image to test.
     * @returns {String || undefined} The name of the failing limit.  Undefined if no failing limits.
     */
    function getFailingLimit(limits, dimensions) {
        var failingLimit;

        qq.each(limits, function(limitName, limitValue) {
            if (limitValue > 0) {
                var limitMatcher = /(max|min)(Width|Height)/.exec(limitName),
                    dimensionPropName = limitMatcher[2].charAt(0).toLowerCase() + limitMatcher[2].slice(1),
                    actualValue = dimensions[dimensionPropName];

                /*jshint -W015*/
                switch (limitMatcher[1]) {
                    case "min":
                        if (actualValue < limitValue) {
                            failingLimit = limitName;
                            return false;
                        }
                        break;
                    case "max":
                        if (actualValue > limitValue) {
                            failingLimit = limitName;
                            return false;
                        }
                        break;
                }
            }
        });

        return failingLimit;
    }

    /**
     * Validate the associated blob.
     *
     * @param limits
     * @returns {qq.Promise} `success` is called on the promise is the image is valid or
     * if the blob is not an image, or if the image is not verifiable.
     * Otherwise, `failure` with the name of the failing limit.
     */
    this.validate = function(limits) {
        var validationEffort = new qq.Promise();

        log("Attempting to validate image.");

        if (hasNonZeroLimits(limits)) {
            getWidthHeight().then(function(dimensions) {
                var failingLimit = getFailingLimit(limits, dimensions);

                if (failingLimit) {
                    validationEffort.failure(failingLimit);
                }
                else {
                    validationEffort.success();
                }
            }, validationEffort.success);
        }
        else {
            validationEffort.success();
        }

        return validationEffort;
    };
};

/* globals qq */
/**
 * Module used to control populating the initial list of files.
 *
 * @constructor
 */
qq.Session = function(spec) {
    "use strict";

    var options = {
        endpoint: null,
        params: {},
        customHeaders: {},
        cors: {},
        addFileRecord: function(sessionData) {},
        log: function(message, level) {}
    };

    qq.extend(options, spec, true);

    function isJsonResponseValid(response) {
        if (qq.isArray(response)) {
            return true;
        }

        options.log("Session response is not an array.", "error");
    }

    function handleFileItems(fileItems, success, xhrOrXdr, promise) {
        var someItemsIgnored = false;

        success = success && isJsonResponseValid(fileItems);

        if (success) {
            qq.each(fileItems, function(idx, fileItem) {
                /* jshint eqnull:true */
                if (fileItem.uuid == null) {
                    someItemsIgnored = true;
                    options.log(qq.format("Session response item {} did not include a valid UUID - ignoring.", idx), "error");
                }
                else if (fileItem.name == null) {
                    someItemsIgnored = true;
                    options.log(qq.format("Session response item {} did not include a valid name - ignoring.", idx), "error");
                }
                else {
                    try {
                        options.addFileRecord(fileItem);
                        return true;
                    }
                    catch (err) {
                        someItemsIgnored = true;
                        options.log(err.message, "error");
                    }
                }

                return false;
            });
        }

        promise[success && !someItemsIgnored ? "success" : "failure"](fileItems, xhrOrXdr);
    }

    // Initiate a call to the server that will be used to populate the initial file list.
    // Returns a `qq.Promise`.
    this.refresh = function() {
        /*jshint indent:false */
        var refreshEffort = new qq.Promise(),
            refreshCompleteCallback = function(response, success, xhrOrXdr) {
                handleFileItems(response, success, xhrOrXdr, refreshEffort);
            },
            requsterOptions = qq.extend({}, options),
            requester = new qq.SessionAjaxRequester(
                qq.extend(requsterOptions, {onComplete: refreshCompleteCallback})
            );

        requester.queryServer();

        return refreshEffort;
    };
};

/*globals qq, XMLHttpRequest*/
/**
 * Thin module used to send GET requests to the server, expecting information about session
 * data used to initialize an uploader instance.
 *
 * @param spec Various options used to influence the associated request.
 * @constructor
 */
qq.SessionAjaxRequester = function(spec) {
    "use strict";

    var requester,
        options = {
            endpoint: null,
            customHeaders: {},
            params: {},
            cors: {
                expected: false,
                sendCredentials: false
            },
            onComplete: function(response, success, xhrOrXdr) {},
            log: function(str, level) {}
        };

    qq.extend(options, spec);

    function onComplete(id, xhrOrXdr, isError) {
        var response = null;

        /* jshint eqnull:true */
        if (xhrOrXdr.responseText != null) {
            try {
                response = qq.parseJson(xhrOrXdr.responseText);
            }
            catch (err) {
                options.log("Problem parsing session response: " + err.message, "error");
                isError = true;
            }
        }

        options.onComplete(response, !isError, xhrOrXdr);
    }

    requester = qq.extend(this, new qq.AjaxRequester({
        acceptHeader: "application/json",
        validMethods: ["GET"],
        method: "GET",
        endpointStore: {
            get: function() {
                return options.endpoint;
            }
        },
        customHeaders: options.customHeaders,
        log: options.log,
        onComplete: onComplete,
        cors: options.cors
    }));

    qq.extend(this, {
        queryServer: function() {
            var params = qq.extend({}, options.params);

            options.log("Session query request.");

            requester.initTransport("sessionRefresh")
                .withParams(params)
                .withCacheBuster()
                .send();
        }
    });
};

/* globals qq */
/**
 * Module that handles support for existing forms.
 *
 * @param options Options passed from the integrator-supplied options related to form support.
 * @param startUpload Callback to invoke when files "stored" should be uploaded.
 * @param log Proxy for the logger
 * @constructor
 */
qq.FormSupport = function(options, startUpload, log) {
    "use strict";
    var self  = this,
        interceptSubmit = options.interceptSubmit,
        formEl = options.element,
        autoUpload = options.autoUpload;

    // Available on the public API associated with this module.
    qq.extend(this, {
        // To be used by the caller to determine if the endpoint will be determined by some processing
        // that occurs in this module, such as if the form has an action attribute.
        // Ignore if `attachToForm === false`.
        newEndpoint: null,

        // To be used by the caller to determine if auto uploading should be allowed.
        // Ignore if `attachToForm === false`.
        newAutoUpload: autoUpload,

        // true if a form was detected and is being tracked by this module
        attachedToForm: false,

        // Returns an object with names and values for all valid form elements associated with the attached form.
        getFormInputsAsObject: function() {
            /* jshint eqnull:true */
            if (formEl == null) {
                return null;
            }

            return self._form2Obj(formEl);
        }
    });

    // If the form contains an action attribute, this should be the new upload endpoint.
    function determineNewEndpoint(formEl) {
        if (formEl.getAttribute("action")) {
            self.newEndpoint = formEl.getAttribute("action");
        }
    }

    // Return true only if the form is valid, or if we cannot make this determination.
    // If the form is invalid, ensure invalid field(s) are highlighted in the UI.
    function validateForm(formEl, nativeSubmit) {
        if (formEl.checkValidity && !formEl.checkValidity()) {
            log("Form did not pass validation checks - will not upload.", "error");
            nativeSubmit();
        }
        else {
            return true;
        }
    }

    // Intercept form submit attempts, unless the integrator has told us not to do this.
    function maybeUploadOnSubmit(formEl) {
        var nativeSubmit = formEl.submit;

        // Intercept and squelch submit events.
        qq(formEl).attach("submit", function(event) {
            event = event || window.event;

            if (event.preventDefault) {
                event.preventDefault();
            }
            else {
                event.returnValue = false;
            }

            validateForm(formEl, nativeSubmit) && startUpload();
        });

        // The form's `submit()` function may be called instead (i.e. via jQuery.submit()).
        // Intercept that too.
        formEl.submit = function() {
            validateForm(formEl, nativeSubmit) && startUpload();
        };
    }

    // If the element value passed from the uploader is a string, assume it is an element ID - select it.
    // The rest of the code in this module depends on this being an HTMLElement.
    function determineFormEl(formEl) {
        if (formEl) {
            if (qq.isString(formEl)) {
                formEl = document.getElementById(formEl);
            }

            if (formEl) {
                log("Attaching to form element.");
                determineNewEndpoint(formEl);
                interceptSubmit && maybeUploadOnSubmit(formEl);
            }
        }

        return formEl;
    }

    formEl = determineFormEl(formEl);
    this.attachedToForm = !!formEl;
};

qq.extend(qq.FormSupport.prototype, {
    // Converts all relevant form fields to key/value pairs.  This is meant to mimic the data a browser will
    // construct from a given form when the form is submitted.
    _form2Obj: function(form) {
        "use strict";
        var obj = {},
            notIrrelevantType = function(type) {
                var irrelevantTypes = [
                    "button",
                    "image",
                    "reset",
                    "submit"
                ];

                return qq.indexOf(irrelevantTypes, type.toLowerCase()) < 0;
            },
            radioOrCheckbox = function(type) {
                return qq.indexOf(["checkbox", "radio"], type.toLowerCase()) >= 0;
            },
            ignoreValue = function(el) {
                if (radioOrCheckbox(el.type) && !el.checked) {
                    return true;
                }

                return el.disabled && el.type.toLowerCase() !== "hidden";
            },
            selectValue = function(select) {
                var value = null;

                qq.each(qq(select).children(), function(idx, child) {
                    if (child.tagName.toLowerCase() === "option" && child.selected) {
                        value = child.value;
                        return false;
                    }
                });

                return value;
            };

        qq.each(form.elements, function(idx, el) {
            if ((qq.isInput(el, true) || el.tagName.toLowerCase() === "textarea") &&
                notIrrelevantType(el.type) &&
                !ignoreValue(el)) {

                obj[el.name] = el.value;
            }
            else if (el.tagName.toLowerCase() === "select" && !ignoreValue(el)) {
                var value = selectValue(el);

                if (value !== null) {
                    obj[el.name] = value;
                }
            }
        });

        return obj;
    }
});

/* globals qq, ExifRestorer */
/**
 * Controls generation of scaled images based on a reference image encapsulated in a `File` or `Blob`.
 * Scaled images are generated and converted to blobs on-demand.
 * Multiple scaled images per reference image with varying sizes and other properties are supported.
 *
 * @param spec Information about the scaled images to generate.
 * @param log Logger instance
 * @constructor
 */
qq.Scaler = function(spec, log) {
    "use strict";

    var self = this,
        includeOriginal = spec.sendOriginal,
        orient = spec.orient,
        defaultType = spec.defaultType,
        defaultQuality = spec.defaultQuality / 100,
        failedToScaleText = spec.failureText,
        includeExif = spec.includeExif,
        sizes = this._getSortedSizes(spec.sizes);

    // Revealed API for instances of this module
    qq.extend(this, {
        // If no targeted sizes have been declared or if this browser doesn't support
        // client-side image preview generation, there is no scaling to do.
        enabled: qq.supportedFeatures.scaling && sizes.length > 0,

        getFileRecords: function(originalFileUuid, originalFileName, originalBlobOrBlobData) {
            var self = this,
                records = [],
                originalBlob = originalBlobOrBlobData.blob ? originalBlobOrBlobData.blob : originalBlobOrBlobData,
                idenitifier = new qq.Identify(originalBlob, log);

            // If the reference file cannot be rendered natively, we can't create scaled versions.
            if (idenitifier.isPreviewableSync()) {
                // Create records for each scaled version & add them to the records array, smallest first.
                qq.each(sizes, function(idx, sizeRecord) {
                    var outputType = self._determineOutputType({
                        defaultType: defaultType,
                        requestedType: sizeRecord.type,
                        refType: originalBlob.type
                    });

                    records.push({
                        uuid: qq.getUniqueId(),
                        name: self._getName(originalFileName, {
                            name: sizeRecord.name,
                            type: outputType,
                            refType: originalBlob.type
                        }),
                        blob: new qq.BlobProxy(originalBlob,
                        qq.bind(self._generateScaledImage, self, {
                            maxSize: sizeRecord.maxSize,
                            orient: orient,
                            type: outputType,
                            quality: defaultQuality,
                            failedText: failedToScaleText,
                            includeExif: includeExif,
                            log: log
                        }))
                    });
                });

                records.push({
                    uuid: originalFileUuid,
                    name: originalFileName,
                    size: originalBlob.size,
                    blob: includeOriginal ? originalBlob : null
                });
            }
            else {
                records.push({
                    uuid: originalFileUuid,
                    name: originalFileName,
                    size: originalBlob.size,
                    blob: originalBlob
                });
            }

            return records;
        },

        handleNewFile: function(file, name, uuid, size, fileList, batchId, uuidParamName, api) {
            var self = this,
                buttonId = file.qqButtonId || (file.blob && file.blob.qqButtonId),
                scaledIds = [],
                originalId = null,
                addFileToHandler = api.addFileToHandler,
                uploadData = api.uploadData,
                paramsStore = api.paramsStore,
                proxyGroupId = qq.getUniqueId();

            qq.each(self.getFileRecords(uuid, name, file), function(idx, record) {
                var blobSize = record.size,
                    id;

                if (record.blob instanceof qq.BlobProxy) {
                    blobSize = -1;
                }

                id = uploadData.addFile({
                    uuid: record.uuid,
                    name: record.name,
                    size: blobSize,
                    batchId: batchId,
                    proxyGroupId: proxyGroupId
                });

                if (record.blob instanceof qq.BlobProxy) {
                    scaledIds.push(id);
                }
                else {
                    originalId = id;
                }

                if (record.blob) {
                    addFileToHandler(id, record.blob);
                    fileList.push({id: id, file: record.blob});
                }
                else {
                    uploadData.setStatus(id, qq.status.REJECTED);
                }
            });

            // If we are potentially uploading an original file and some scaled versions,
            // ensure the scaled versions include reference's to the parent's UUID and size
            // in their associated upload requests.
            if (originalId !== null) {
                qq.each(scaledIds, function(idx, scaledId) {
                    var params = {
                        qqparentuuid: uploadData.retrieve({id: originalId}).uuid,
                        qqparentsize: uploadData.retrieve({id: originalId}).size
                    };

                    // Make sure the UUID for each scaled image is sent with the upload request,
                    // to be consistent (since we may need to ensure it is sent for the original file as well).
                    params[uuidParamName] = uploadData.retrieve({id: scaledId}).uuid;

                    uploadData.setParentId(scaledId, originalId);
                    paramsStore.addReadOnly(scaledId, params);
                });

                // If any scaled images are tied to this parent image, be SURE we send its UUID as an upload request
                // parameter as well.
                if (scaledIds.length) {
                    (function() {
                        var param = {};
                        param[uuidParamName] = uploadData.retrieve({id: originalId}).uuid;
                        paramsStore.addReadOnly(originalId, param);
                    }());
                }
            }
        }
    });
};

qq.extend(qq.Scaler.prototype, {
    scaleImage: function(id, specs, api) {
        "use strict";

        if (!qq.supportedFeatures.scaling) {
            throw new qq.Error("Scaling is not supported in this browser!");
        }

        var scalingEffort = new qq.Promise(),
            log = api.log,
            file = api.getFile(id),
            uploadData = api.uploadData.retrieve({id: id}),
            name = uploadData && uploadData.name,
            uuid = uploadData && uploadData.uuid,
            scalingOptions = {
                sendOriginal: false,
                orient: specs.orient,
                defaultType: specs.type || null,
                defaultQuality: specs.quality,
                failedToScaleText: "Unable to scale",
                sizes: [{name: "", maxSize: specs.maxSize}]
            },
            scaler = new qq.Scaler(scalingOptions, log);

        if (!qq.Scaler || !qq.supportedFeatures.imagePreviews || !file) {
            scalingEffort.failure();

            log("Could not generate requested scaled image for " + id + ".  " +
                "Scaling is either not possible in this browser, or the file could not be located.", "error");
        }
        else {
            (qq.bind(function() {
                // Assumption: There will never be more than one record
                var record = scaler.getFileRecords(uuid, name, file)[0];

                if (record && record.blob instanceof qq.BlobProxy) {
                    record.blob.create().then(scalingEffort.success, scalingEffort.failure);
                }
                else {
                    log(id + " is not a scalable image!", "error");
                    scalingEffort.failure();
                }
            }, this)());
        }

        return scalingEffort;
    },

    // NOTE: We cannot reliably determine at this time if the UA supports a specific MIME type for the target format.
    // image/jpeg and image/png are the only safe choices at this time.
    _determineOutputType: function(spec) {
        "use strict";

        var requestedType = spec.requestedType,
            defaultType = spec.defaultType,
            referenceType = spec.refType;

        // If a default type and requested type have not been specified, this should be a
        // JPEG if the original type is a JPEG, otherwise, a PNG.
        if (!defaultType && !requestedType) {
            if (referenceType !== "image/jpeg") {
                return "image/png";
            }
            return referenceType;
        }

        // A specified default type is used when a requested type is not specified.
        if (!requestedType) {
            return defaultType;
        }

        // If requested type is specified, use it, as long as this recognized type is supported by the current UA
        if (qq.indexOf(Object.keys(qq.Identify.prototype.PREVIEWABLE_MIME_TYPES), requestedType) >= 0) {
            if (requestedType === "image/tiff") {
                return qq.supportedFeatures.tiffPreviews ? requestedType : defaultType;
            }

            return requestedType;
        }

        return defaultType;
    },

    // Get a file name for a generated scaled file record, based on the provided scaled image description
    _getName: function(originalName, scaledVersionProperties) {
        "use strict";

        var startOfExt = originalName.lastIndexOf("."),
            versionType = scaledVersionProperties.type || "image/png",
            referenceType = scaledVersionProperties.refType,
            scaledName = "",
            scaledExt = qq.getExtension(originalName),
            nameAppendage = "";

        if (scaledVersionProperties.name && scaledVersionProperties.name.trim().length) {
            nameAppendage = " (" + scaledVersionProperties.name + ")";
        }

        if (startOfExt >= 0) {
            scaledName = originalName.substr(0, startOfExt);

            if (referenceType !== versionType) {
                scaledExt = versionType.split("/")[1];
            }

            scaledName += nameAppendage + "." + scaledExt;
        }
        else {
            scaledName = originalName + nameAppendage;
        }

        return scaledName;
    },

    // We want the smallest scaled file to be uploaded first
    _getSortedSizes: function(sizes) {
        "use strict";

        sizes = qq.extend([], sizes);

        return sizes.sort(function(a, b) {
            if (a.maxSize > b.maxSize) {
                return 1;
            }
            if (a.maxSize < b.maxSize) {
                return -1;
            }
            return 0;
        });
    },

    _generateScaledImage: function(spec, sourceFile) {
        "use strict";

        var self = this,
            log = spec.log,
            maxSize = spec.maxSize,
            orient = spec.orient,
            type = spec.type,
            quality = spec.quality,
            failedText = spec.failedText,
            includeExif = spec.includeExif && sourceFile.type === "image/jpeg" && type === "image/jpeg",
            scalingEffort = new qq.Promise(),
            imageGenerator = new qq.ImageGenerator(log),
            canvas = document.createElement("canvas");

        log("Attempting to generate scaled version for " + sourceFile.name);

        imageGenerator.generate(sourceFile, canvas, {maxSize: maxSize, orient: orient}).then(function() {
            var scaledImageDataUri = canvas.toDataURL(type, quality),
                signalSuccess = function() {
                    log("Success generating scaled version for " + sourceFile.name);
                    var blob = qq.dataUriToBlob(scaledImageDataUri);
                    scalingEffort.success(blob);
                };

            if (includeExif) {
                self._insertExifHeader(sourceFile, scaledImageDataUri, log).then(function(scaledImageDataUriWithExif) {
                    scaledImageDataUri = scaledImageDataUriWithExif;
                    signalSuccess();
                },
                function() {
                    log("Problem inserting EXIF header into scaled image.  Using scaled image w/out EXIF data.", "error");
                    signalSuccess();
                });
            }
            else {
                signalSuccess();
            }
        }, function() {
            log("Failed attempt to generate scaled version for " + sourceFile.name, "error");
            scalingEffort.failure(failedText);
        });

        return scalingEffort;
    },

    // Attempt to insert the original image's EXIF header into a scaled version.
    _insertExifHeader: function(originalImage, scaledImageDataUri, log) {
        "use strict";

        var reader = new FileReader(),
            insertionEffort = new qq.Promise(),
            originalImageDataUri = "";

        reader.onload = function() {
            originalImageDataUri = reader.result;
            insertionEffort.success(qq.ExifRestorer.restore(originalImageDataUri, scaledImageDataUri));
        };

        reader.onerror = function() {
            log("Problem reading " + originalImage.name + " during attempt to transfer EXIF data to scaled version.", "error");
            insertionEffort.failure();
        };

        reader.readAsDataURL(originalImage);

        return insertionEffort;
    },

    _dataUriToBlob: function(dataUri) {
        "use strict";

        var byteString, mimeString, arrayBuffer, intArray;

        // convert base64 to raw binary data held in a string
        if (dataUri.split(",")[0].indexOf("base64") >= 0) {
            byteString = atob(dataUri.split(",")[1]);
        }
        else {
            byteString = decodeURI(dataUri.split(",")[1]);
        }

        // extract the MIME
        mimeString = dataUri.split(",")[0]
            .split(":")[1]
            .split(";")[0];

        // write the bytes of the binary string to an ArrayBuffer
        arrayBuffer = new ArrayBuffer(byteString.length);
        intArray = new Uint8Array(arrayBuffer);
        qq.each(byteString, function(idx, character) {
            intArray[idx] = character.charCodeAt(0);
        });

        return this._createBlob(arrayBuffer, mimeString);
    },

    _createBlob: function(data, mime) {
        "use strict";

        var BlobBuilder = window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder ||
                window.MSBlobBuilder,
            blobBuilder = BlobBuilder && new BlobBuilder();

        if (blobBuilder) {
            blobBuilder.append(data);
            return blobBuilder.getBlob(mime);
        }
        else {
            return new Blob([data], {type: mime});
        }
    }
});

//Based on MinifyJpeg
//http://elicon.blog57.fc2.com/blog-entry-206.html

qq.ExifRestorer = (function()
{
   
	var ExifRestorer = {};
	 
    ExifRestorer.KEY_STR = "ABCDEFGHIJKLMNOP" +
                         "QRSTUVWXYZabcdef" +
                         "ghijklmnopqrstuv" +
                         "wxyz0123456789+/" +
                         "=";

    ExifRestorer.encode64 = function(input)
    {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0;

        do {
            chr1 = input[i++];
            chr2 = input[i++];
            chr3 = input[i++];

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
               enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
               enc4 = 64;
            }

            output = output +
               this.KEY_STR.charAt(enc1) +
               this.KEY_STR.charAt(enc2) +
               this.KEY_STR.charAt(enc3) +
               this.KEY_STR.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    };
    
    ExifRestorer.restore = function(origFileBase64, resizedFileBase64)
    {
        var expectedBase64Header = "data:image/jpeg;base64,";

        if (!origFileBase64.match(expectedBase64Header))
        {
        	return resizedFileBase64;
        }       
        
        var rawImage = this.decode64(origFileBase64.replace(expectedBase64Header, ""));
        var segments = this.slice2Segments(rawImage);
                
        var image = this.exifManipulation(resizedFileBase64, segments);
        
        return expectedBase64Header + this.encode64(image);
        
    };


    ExifRestorer.exifManipulation = function(resizedFileBase64, segments)
    {
            var exifArray = this.getExifArray(segments),
                newImageArray = this.insertExif(resizedFileBase64, exifArray),
                aBuffer = new Uint8Array(newImageArray);

            return aBuffer;
    };


    ExifRestorer.getExifArray = function(segments)
    {
            var seg;
            for (var x = 0; x < segments.length; x++)
            {
                seg = segments[x];
                if (seg[0] == 255 & seg[1] == 225) //(ff e1)
                {
                    return seg;
                }
            }
            return [];
    };


    ExifRestorer.insertExif = function(resizedFileBase64, exifArray)
    {
            var imageData = resizedFileBase64.replace("data:image/jpeg;base64,", ""),
                buf = this.decode64(imageData),
                separatePoint = buf.indexOf(255,3),
                mae = buf.slice(0, separatePoint),
                ato = buf.slice(separatePoint),
                array = mae;

            array = array.concat(exifArray);
            array = array.concat(ato);
           return array;
    };


    
    ExifRestorer.slice2Segments = function(rawImageArray)
    {
        var head = 0,
            segments = [];

        while (1)
        {
            if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 218){break;}
            if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 216)
            {
                head += 2;
            }
            else
            {
                var length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3],
                    endPoint = head + length + 2,
                    seg = rawImageArray.slice(head, endPoint);
                segments.push(seg);
                head = endPoint;
            }
            if (head > rawImageArray.length){break;}
        }

        return segments;
    };


    
    ExifRestorer.decode64 = function(input) 
    {
        var output = "",
            chr1, chr2, chr3 = "",
            enc1, enc2, enc3, enc4 = "",
            i = 0,
            buf = [];

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            throw new Error("There were invalid base64 characters in the input text.  " +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.KEY_STR.indexOf(input.charAt(i++));
            enc2 = this.KEY_STR.indexOf(input.charAt(i++));
            enc3 = this.KEY_STR.indexOf(input.charAt(i++));
            enc4 = this.KEY_STR.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            buf.push(chr1);

            if (enc3 != 64) {
               buf.push(chr2);
            }
            if (enc4 != 64) {
               buf.push(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return buf;
    };

    
    return ExifRestorer;
})();

/* globals qq */
/**
 * Keeps a running tally of total upload progress for a batch of files.
 *
 * @param callback Invoked when total progress changes, passing calculated total loaded & total size values.
 * @param getSize Function that returns the size of a file given its ID
 * @constructor
 */
qq.TotalProgress = function(callback, getSize) {
    "use strict";

    var perFileProgress = {},
        totalLoaded = 0,
        totalSize = 0,

        lastLoadedSent = -1,
        lastTotalSent = -1,
        callbackProxy = function(loaded, total) {
            if (loaded !== lastLoadedSent || total !== lastTotalSent) {
                callback(loaded, total);
            }

            lastLoadedSent = loaded;
            lastTotalSent = total;
        },

        /**
         * @param failed Array of file IDs that have failed
         * @param retryable Array of file IDs that are retryable
         * @returns true if none of the failed files are eligible for retry
         */
        noRetryableFiles = function(failed, retryable) {
            var none = true;

            qq.each(failed, function(idx, failedId) {
                if (qq.indexOf(retryable, failedId) >= 0) {
                    none = false;
                    return false;
                }
            });

            return none;
        },

        onCancel = function(id) {
            updateTotalProgress(id, -1, -1);
            delete perFileProgress[id];
        },

        onAllComplete = function(successful, failed, retryable) {
            if (failed.length === 0 || noRetryableFiles(failed, retryable)) {
                callbackProxy(totalSize, totalSize);
                this.reset();
            }
        },

        onNew = function(id) {
            var size = getSize(id);

            // We might not know the size yet, such as for blob proxies
            if (size > 0) {
                updateTotalProgress(id, 0, size);
                perFileProgress[id] = {loaded: 0, total: size};
            }
        },

        /**
         * Invokes the callback with the current total progress of all files in the batch.  Called whenever it may
         * be appropriate to re-calculate and dissemenate this data.
         *
         * @param id ID of a file that has changed in some important way
         * @param newLoaded New loaded value for this file.  -1 if this value should no longer be part of calculations
         * @param newTotal New total size of the file.  -1 if this value should no longer be part of calculations
         */
        updateTotalProgress = function(id, newLoaded, newTotal) {
            var oldLoaded = perFileProgress[id] ? perFileProgress[id].loaded : 0,
                oldTotal = perFileProgress[id] ? perFileProgress[id].total : 0;

            if (newLoaded === -1 && newTotal === -1) {
                totalLoaded -= oldLoaded;
                totalSize -= oldTotal;
            }
            else {
                if (newLoaded) {
                    totalLoaded += newLoaded - oldLoaded;
                }
                if (newTotal) {
                    totalSize += newTotal - oldTotal;
                }
            }

            callbackProxy(totalLoaded, totalSize);
        };

    qq.extend(this, {
        // Called when a batch of files has completed uploading.
        onAllComplete: onAllComplete,

        // Called when the status of a file has changed.
        onStatusChange: function(id, oldStatus, newStatus) {
            if (newStatus === qq.status.CANCELED || newStatus === qq.status.REJECTED) {
                onCancel(id);
            }
            else if (newStatus === qq.status.SUBMITTING) {
                onNew(id);
            }
        },

        // Called whenever the upload progress of an individual file has changed.
        onIndividualProgress: function(id, loaded, total) {
            updateTotalProgress(id, loaded, total);
            perFileProgress[id] = {loaded: loaded, total: total};
        },

        // Called whenever the total size of a file has changed, such as when the size of a generated blob is known.
        onNewSize: function(id) {
            onNew(id);
        },

        reset: function() {
            perFileProgress = {};
            totalLoaded = 0;
            totalSize = 0;
        }
    });
};

/*globals qq */
// Base handler for UI (FineUploader mode) events.
// Some more specific handlers inherit from this one.
qq.UiEventHandler = function(s, protectedApi) {
    "use strict";

    var disposer = new qq.DisposeSupport(),
        spec = {
            eventType: "click",
            attachTo: null,
            onHandled: function(target, event) {}
        };

    // This makes up the "public" API methods that will be accessible
    // to instances constructing a base or child handler
    qq.extend(this, {
        addHandler: function(element) {
            addHandler(element);
        },

        dispose: function() {
            disposer.dispose();
        }
    });

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
};

/* global qq */
qq.FileButtonsClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            templating: null,
            log: function(message, lvl) {},
            onDeleteFile: function(fileId) {},
            onCancel: function(fileId) {},
            onRetry: function(fileId) {},
            onPause: function(fileId) {},
            onContinue: function(fileId) {},
            onGetName: function(fileId) {}
        },
        buttonHandlers = {
            cancel: function(id) { spec.onCancel(id); },
            retry:  function(id) { spec.onRetry(id); },
            deleteButton: function(id) { spec.onDeleteFile(id); },
            pause: function(id) { spec.onPause(id); },
            continueButton: function(id) { spec.onContinue(id); }
        };

    function examineEvent(target, event) {
        qq.each(buttonHandlers, function(buttonType, handler) {
            var firstLetterCapButtonType = buttonType.charAt(0).toUpperCase() + buttonType.slice(1),
                fileId;

            if (spec.templating["is" + firstLetterCapButtonType](target)) {
                fileId = spec.templating.getFileId(target);
                qq.preventDefault(event);
                spec.log(qq.format("Detected valid file button click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                handler(fileId);
                return false;
            }
        });
    }

    qq.extend(spec, s);

    spec.eventType = "click";
    spec.onHandled = examineEvent;
    spec.attachTo = spec.templating.getFileList();

    qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));
};

/*globals qq */
// Child of FilenameEditHandler.  Used to detect click events on filename display elements.
qq.FilenameClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            templating: null,
            log: function(message, lvl) {},
            classes: {
                file: "qq-upload-file",
                editNameIcon: "qq-edit-filename-icon"
            },
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {}
        };

    qq.extend(spec, s);

    // This will be called by the parent handler when a `click` event is received on the list element.
    function examineEvent(target, event) {
        if (spec.templating.isFileName(target) || spec.templating.isEditIcon(target)) {
            var fileId = spec.templating.getFileId(target),
                status = spec.onGetUploadStatus(fileId);

            // We only allow users to change filenames of files that have been submitted but not yet uploaded.
            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                qq.preventDefault(event);

                inheritedInternalApi.handleFilenameEdit(fileId, target, true);
            }
        }
    }

    spec.eventType = "click";
    spec.onHandled = examineEvent;

    qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

/*globals qq */
// Child of FilenameEditHandler.  Used to detect focusin events on file edit input elements.
qq.FilenameInputFocusInHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            templating: null,
            onGetUploadStatus: function(fileId) {},
            log: function(message, lvl) {}
        };

    if (!inheritedInternalApi) {
        inheritedInternalApi = {};
    }

    // This will be called by the parent handler when a `focusin` event is received on the list element.
    function handleInputFocus(target, event) {
        if (spec.templating.isEditInput(target)) {
            var fileId = spec.templating.getFileId(target),
                status = spec.onGetUploadStatus(fileId);

            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename input focus event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                inheritedInternalApi.handleFilenameEdit(fileId, target);
            }
        }
    }

    spec.eventType = "focusin";
    spec.onHandled = handleInputFocus;

    qq.extend(spec, s);
    qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

/*globals qq */
/**
 * Child of FilenameInputFocusInHandler.  Used to detect focus events on file edit input elements.  This child module is only
 * needed for UAs that do not support the focusin event.  Currently, only Firefox lacks this event.
 *
 * @param spec Overrides for default specifications
 */
qq.FilenameInputFocusHandler = function(spec) {
    "use strict";

    spec.eventType = "focus";
    spec.attachTo = null;

    qq.extend(this, new qq.FilenameInputFocusInHandler(spec, {}));
};

/*globals qq */
// Handles edit-related events on a file item (FineUploader mode).  This is meant to be a parent handler.
// Children will delegate to this handler when specific edit-related actions are detected.
qq.FilenameEditHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            templating: null,
            log: function(message, lvl) {},
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {},
            onSetName: function(fileId, newName) {},
            onEditingStatusChange: function(fileId, isEditing) {}
        };

    function getFilenameSansExtension(fileId) {
        var filenameSansExt = spec.onGetName(fileId),
            extIdx = filenameSansExt.lastIndexOf(".");

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
        inheritedInternalApi.getDisposeSupport().attach(inputEl, "blur", function() {
            handleNameUpdate(inputEl, fileId);
        });
    }

    // The name has been updated if the user presses enter.
    function registerInputEnterKeyHandler(inputEl, fileId) {
        inheritedInternalApi.getDisposeSupport().attach(inputEl, "keyup", function(event) {

            var code = event.keyCode || event.which;

            if (code === 13) {
                handleNameUpdate(inputEl, fileId);
            }
        });
    }

    qq.extend(spec, s);

    spec.attachTo = spec.templating.getFileList();

    qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));

    qq.extend(inheritedInternalApi, {
        handleFilenameEdit: function(id, target, focusInput) {
            var newFilenameInputEl = spec.templating.getEditInput(id);

            spec.onEditingStatusChange(id, true);

            newFilenameInputEl.value = getFilenameSansExtension(id);

            if (focusInput) {
                newFilenameInputEl.focus();
            }

            registerInputBlurHandler(newFilenameInputEl, id);
            registerInputEnterKeyHandler(newFilenameInputEl, id);
        }
    });
};

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
qq.CryptoJS = (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = qq.CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = qq.CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = new hasher.init();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clamp excess bits
            key.clamp();

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = qq.CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Reusable object
    var W = [];

    /**
     * SHA-1 hash algorithm.
     */
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([
                0x67452301, 0xefcdab89,
                0x98badcfe, 0x10325476,
                0xc3d2e1f0
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            // Computation
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (n << 1) | (n >>> 31);
                }

                var t = ((a << 5) | (a >>> 27)) + e + W[i];
                if (i < 20) {
                    t += ((b & c) | (~b & d)) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                } else /* if (i < 80) */ {
                    t += (b ^ c ^ d) - 0x359d3e2a;
                }

                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = t;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA1('message');
     *     var hash = CryptoJS.SHA1(wordArray);
     */
    C.SHA1 = Hasher._createHelper(SHA1);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA1(message, key);
     */
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function (Math) {
    // Shortcuts
    var C = qq.CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Check if typed arrays are supported
    if (typeof ArrayBuffer != 'function') {
        return;
    }

    // Shortcuts
    var C = qq.CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;

    // Reference original init
    var superInit = WordArray.init;

    // Augment WordArray.init to handle typed arrays
    var subInit = WordArray.init = function (typedArray) {
        // Convert buffers to uint8
        if (typedArray instanceof ArrayBuffer) {
            typedArray = new Uint8Array(typedArray);
        }

        // Convert other array views to uint8
        if (
            typedArray instanceof Int8Array ||
            typedArray instanceof Uint8ClampedArray ||
            typedArray instanceof Int16Array ||
            typedArray instanceof Uint16Array ||
            typedArray instanceof Int32Array ||
            typedArray instanceof Uint32Array ||
            typedArray instanceof Float32Array ||
            typedArray instanceof Float64Array
        ) {
            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
        }

        // Handle Uint8Array
        if (typedArray instanceof Uint8Array) {
            // Shortcut
            var typedArrayByteLength = typedArray.byteLength;

            // Extract bytes
            var words = [];
            for (var i = 0; i < typedArrayByteLength; i++) {
                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
            }

            // Initialize this word array
            superInit.call(this, words, typedArrayByteLength);
        } else {
            // Else call normal init
            superInit.apply(this, arguments);
        }
    };

    subInit.prototype = WordArray;
}());
if (typeof define === 'function' && define.amd) {
   define(function() {
       return qq;
   });
}
else if (typeof module !== 'undefined' && module.exports) {
   module.exports = qq;
}
else {
   global.qq = qq;
}
}(window));

/*! 2016-05-14 */
