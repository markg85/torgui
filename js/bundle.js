/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/modules.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/modules.js":
/*!***********************!*\
  !*** ./js/modules.js ***!
  \***********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _spin_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./spin.js */ \"./js/spin.js\");\n\n\nconst spinner = new _spin_js__WEBPACK_IMPORTED_MODULE_0__[\"Spinner\"]();\n\nvar showWelcome = true\n\nconst version = \"0.2.0\"\n\nfunction fillInitialLocalStorage() {\n  if (!window.localStorage.welcomeMessageVersion) {\n    window.localStorage.welcomeMessageVersion = \"0.0.0\"\n  }\n}\n\nfunction welcomeMessageVersion() {\n  if (window.localStorage && window.localStorage.welcomeMessageVersion) {\n    window.localStorage.welcomeMessageVersion = version;\n    return window.localStorage.welcomeMessageVersion;\n  } else {\n    return version;\n  }\n}\n\nfunction isWelcomeMessageVersionRead() {\n  return !(window.localStorage.welcomeMessageVersion < version);\n}\n\nfunction zeroPadding(num, size = 2){\n  var st = num+\"\";\n  var sl = size - st.length - 1;\n  for (; sl >= 0; sl--) st = \"0\" + st;\n  return st;\n}\n\nfunction parseData(data)\n{\n  var title = \"\"\n  var image = \"\"\n\n  if (!data.error && data.results.length > 0) {\n    image = data.meta.images.medium\n    title = data.meta.name\n\n    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.\n    // But we don't have it for movies.\n    if (data.results[0].season) {\n      title += \" S\" + zeroPadding(data.results[0].season) + \"E\" + zeroPadding(data.results[0].episode)\n    }\n\n    // Store the last search query and clear the input field.\n    lastSearchQuery = $('#searchfield').val();\n    $('#searchfield').val(\"\");\n\n\n    $('#showThumb').attr('src', image);\n    $('#showInfo .col-lg-3 .caption h3').text(title)\n\n    if (!data['1080p']) data['1080p'] = [];\n    if (!data['720p']) data['720p'] = [];\n    if (!data['sd']) data['sd'] = [];\n\n    var torrents = data.results[0].torrents;\n    var arrayLengths = [torrents['1080p'].length, torrents['720p'].length, torrents['sd'].length]\n    var maxNum = Math.max(...arrayLengths)\n\n    var rowTemplate = document.getElementById('torrentEntry');\n    var bodyForRows = document.getElementById('episodeLinks').getElementsByTagName('tbody')[0];\n\n    var keys = ['1080p', '720p', 'sd']\n\n    for (var i = 0; i < maxNum; i++) {\n      var clonedNode = rowTemplate.content.cloneNode(true);\n      var td = clonedNode.querySelectorAll(\"td\");\n\n      td[0].textContent = (i + 1);\n\n      for (var col = 1; col < 4; col++) {\n        var item = torrents[keys[col - 1]][i]\n\n        if (item) {\n\n          var cell = td[col];\n\n          // Get objects\n          //var badgeElem = cell.getElementsByClassName(\"badge-torgui\");\n          var badgeElem = cell.getElementsByClassName(\"badge-torgui\")[0];\n          var extraElem = cell.getElementsByClassName(\"extra\")[0];\n          var download = cell.getElementsByTagName('a')[0];\n\n          // Set values\n          badgeElem.className += ` ${item.classification.codec}`;\n          extraElem.textContent = `(${item.classification.source}) ${item.sizeHumanReadable}`;\n          download.href = item.url;\n        } else {\n          td[col].textContent = ``;\n        }\n      }\n\n      bodyForRows.appendChild(clonedNode);\n    }\n\n    $(\"#showInfo\").fadeIn()\n  }\n}\n\nvar lastSearchQuery = \"\";\n\nfunction sendSearchRequest(query)\n{\n  spinner.spin(document.getElementById('center'));\n  var searchQuery = query.trim();\n  if (searchQuery == \"\")\n  {\n    spinner.stop();\n    alert(\"Empty query. Not doing anything.\")\n    return;\n  }\n\n  // Adjust search query to be more generic.\n  // If it starts with \"!\" or \"tt\" then we pass it as is.\n  // If not (this if body) then prefix it with \"latest:\"\n  if (!searchQuery.match(/(.+) s([0-9]{1,2})e([0-9]{1,2})/i) && !searchQuery.startsWith(\"tt\") && !searchQuery.startsWith(\"imdb:\") && !searchQuery.startsWith(\"latest:\"))\n  {\n    searchQuery = \"latest:\" + searchQuery\n  }\n\n  //$(\"#status\").fadeIn()\n  $(\"#showInfo\").fadeOut()\n\n  // Clear item information\n  $('#showThumb').attr('src', \"\");\n  $('#showInfo .col-lg-3 .caption h3').text(\"\")\n\n  // Clear all table rows\n  $('#episodeLinks > tbody tr').remove();\n\n  console.log(searchQuery)\n//  $.ajax( \"http://localhost:3020/search/\" + searchQuery )\n  $.ajax( \"https://tor.sc2.nl/search/\" + searchQuery )\n    .done(function(data) {\n      //alert( \"success\" + data );\n      console.log(data)\n      //$(\"#responseStatus span\").addClass(\"done\").text(\"done\");\n      parseData(data);\n      spinner.stop();\n    })\n    .fail(function() {\n      spinner.stop();\n      alert( \"error\" );\n    });\n\n  //$(\"#sendRequestStatus span\").addClass(\"done\").text(\"done\");\n}\n\n$( document ).ready(function() {\n\n  fillInitialLocalStorage();\n  console.log(window.localStorage.welcomeMessageVersion)\n\n  $(\"#welcomeMessage\").css(\"display\", ((isWelcomeMessageVersionRead() == false) ? \"block\": \"none\"))\n  $(\"#welcomeMessage > button\").click(function(){\n    welcomeMessageVersion();\n  });\n\n $('#searchfieldRefresh').click(function() {\n    sendSearchRequest(lastSearchQuery);\n  });\n\n $('#searchfieldSubmit').click(function() {\n    sendSearchRequest($('#searchfield').val());\n  });\n\n  $('#searchfield').keypress(function (e) {\n    if(e.which == 13)  // the enter key code\n    {\n      sendSearchRequest($('#searchfield').val());\n      return false;\n    }\n  });\n\n});\n\n\n//# sourceURL=webpack:///./js/modules.js?");

/***/ }),

/***/ "./js/spin.js":
/*!********************!*\
  !*** ./js/spin.js ***!
  \********************/
/*! exports provided: Spinner */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Spinner\", function() { return Spinner; });\nvar __assign = (undefined && undefined.__assign) || Object.assign || function(t) {\n    for (var s, i = 1, n = arguments.length; i < n; i++) {\n        s = arguments[i];\n        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\n            t[p] = s[p];\n    }\n    return t;\n};\nvar defaults = {\n    lines: 12,\n    length: 7,\n    width: 5,\n    radius: 10,\n    scale: 1.0,\n    corners: 1,\n    color: '#000',\n    opacity: 0.25,\n    rotate: 0,\n    direction: 1,\n    speed: 1,\n    trail: 100,\n    fps: 20,\n    zIndex: 2e9,\n    className: 'spinner',\n    top: '50%',\n    left: '50%',\n    shadow: false,\n    position: 'absolute',\n};\nvar Spinner = /** @class */ (function () {\n    function Spinner(opts) {\n        if (opts === void 0) { opts = {}; }\n        this.opts = __assign({}, defaults, opts);\n    }\n    /**\n     * Adds the spinner to the given target element. If this instance is already\n     * spinning, it is automatically removed from its previous target by calling\n     * stop() internally.\n     */\n    Spinner.prototype.spin = function (target) {\n        var _this = this;\n        this.stop();\n        this.el = createEl('div', { className: this.opts.className });\n        this.el.setAttribute('role', 'progressbar');\n        css(this.el, {\n            position: this.opts.position,\n            width: 0,\n            zIndex: this.opts.zIndex,\n            left: this.opts.left,\n            top: this.opts.top\n        });\n        if (target) {\n            target.insertBefore(this.el, target.firstChild || null);\n        }\n        var animator;\n        var getNow;\n        if (typeof requestAnimationFrame !== 'undefined') {\n            animator = requestAnimationFrame;\n            getNow = function () { return performance.now(); };\n        }\n        else {\n            // fallback for IE 9\n            animator = function (callback) { return setTimeout(callback, 1000 / _this.opts.fps); };\n            getNow = function () { return Date.now(); };\n        }\n        var lastFrameTime;\n        var state = 0; // state is rotation percentage (between 0 and 1)\n        var animate = function () {\n            var time = getNow();\n            if (lastFrameTime === undefined) {\n                lastFrameTime = time - 1;\n            }\n            state += getAdvancePercentage(time - lastFrameTime, _this.opts.speed);\n            lastFrameTime = time;\n            if (state > 1) {\n                state -= Math.floor(state);\n            }\n            for (var line = 0; line < _this.opts.lines; line++) {\n                if (line < _this.el.childNodes.length) {\n                    var opacity = getLineOpacity(line, state, _this.opts);\n                    _this.el.childNodes[line].style.opacity = opacity.toString();\n                }\n            }\n            _this.animateId = _this.el ? animator(animate) : undefined;\n        };\n        drawLines(this.el, this.opts);\n        animate();\n        return this;\n    };\n    /**\n     * Stops and removes the Spinner.\n     * Stopped spinners may be reused by calling spin() again.\n     */\n    Spinner.prototype.stop = function () {\n        if (this.el) {\n            if (typeof requestAnimationFrame !== 'undefined') {\n                cancelAnimationFrame(this.animateId);\n            }\n            else {\n                clearTimeout(this.animateId);\n            }\n            if (this.el.parentNode) {\n                this.el.parentNode.removeChild(this.el);\n            }\n            this.el = undefined;\n        }\n        return this;\n    };\n    return Spinner;\n}());\n\nfunction getAdvancePercentage(msSinceLastFrame, roundsPerSecond) {\n    return msSinceLastFrame / 1000 * roundsPerSecond;\n}\nfunction getLineOpacity(line, state, opts) {\n    var linePercent = (line + 1) / opts.lines;\n    var diff = state - (linePercent * opts.direction);\n    if (diff < 0 || diff > 1) {\n        diff += opts.direction;\n    }\n    // opacity should start at 1, and approach opacity option as diff reaches trail percentage\n    var trailPercent = opts.trail / 100;\n    var opacityPercent = 1 - diff / trailPercent;\n    if (opacityPercent < 0) {\n        return opts.opacity;\n    }\n    var opacityDiff = 1 - opts.opacity;\n    return opacityPercent * opacityDiff + opts.opacity;\n}\n/**\n * Utility function to create elements. Optionally properties can be passed.\n */\nfunction createEl(tag, prop) {\n    if (prop === void 0) { prop = {}; }\n    var el = document.createElement(tag);\n    for (var n in prop) {\n        el[n] = prop[n];\n    }\n    return el;\n}\n/**\n * Tries various vendor prefixes and returns the first supported property.\n */\nfunction vendor(el, prop) {\n    if (el.style[prop] !== undefined) {\n        return prop;\n    }\n    // needed for transform properties in IE 9\n    var prefixed = 'ms' + prop.charAt(0).toUpperCase() + prop.slice(1);\n    if (el.style[prefixed] !== undefined) {\n        return prefixed;\n    }\n    return '';\n}\n/**\n * Sets multiple style properties at once.\n */\nfunction css(el, props) {\n    for (var prop in props) {\n        el.style[vendor(el, prop) || prop] = props[prop];\n    }\n    return el;\n}\n/**\n * Returns the line color from the given string or array.\n */\nfunction getColor(color, idx) {\n    return typeof color == 'string' ? color : color[idx % color.length];\n}\n/**\n * Internal method that draws the individual lines.\n */\nfunction drawLines(el, opts) {\n    for (var i = 0; i < opts.lines; i++) {\n        var seg = css(createEl('div'), {\n            position: 'absolute',\n            top: 1 + ~(opts.scale * opts.width / 2) + 'px',\n            opacity: opts.opacity,\n        });\n        if (opts.shadow) {\n            seg.appendChild(css(fill('#000', '0 0 4px #000', opts, i), { top: '2px' }));\n        }\n        seg.appendChild(fill(getColor(opts.color, i), '0 0 1px rgba(0,0,0,.1)', opts, i));\n        el.appendChild(seg);\n    }\n    return el;\n}\nfunction fill(color, shadow, opts, i) {\n    return css(createEl('div'), {\n        position: 'absolute',\n        width: opts.scale * (opts.length + opts.width) + 'px',\n        height: opts.scale * opts.width + 'px',\n        background: color,\n        boxShadow: shadow,\n        transformOrigin: 'left',\n        transform: 'rotate(' + ~~(360 / opts.lines * i + opts.rotate) + 'deg) translate(' + opts.scale * opts.radius + 'px' + ',0)',\n        borderRadius: (opts.corners * opts.scale * opts.width >> 1) + 'px'\n    });\n}\n\n\n//# sourceURL=webpack:///./js/spin.js?");

/***/ })

/******/ });