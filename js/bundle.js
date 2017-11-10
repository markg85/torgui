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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__spin_js__ = __webpack_require__(1);

var spinner = new __WEBPACK_IMPORTED_MODULE_0__spin_js__["a" /* Spinner */]();

var showWelcome = true

var version = "0.1.0"

function fillInitialLocalStorage() {
  if (!localStorage.welcomeMessageVersion) {
    localStorage.welcomeMessageVersion = "0.0.0"
  }
}

function welcomeMessageVersion() {
  if (localStorage && localStorage.welcomeMessageVersion) {
    localStorage.welcomeMessageVersion = version;
    return localStorage.welcomeMessageVersion;
  } else {
    return version;
  }
}

function isWelcomeMessageVersionRead() {
  if (localStorage.welcomeMessageVersion < version) {
    return false;
  }
  return true;
}

function parseData(data)
{
  var title = ""
  var image = ""

  if (!data.error) {
    if (data['meta'].image) {
      image = data['meta']['image']
      title = data['meta']['name']
    }
    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
    // But we don't have it for movies.
    if (data['meta'].season) {
      title += " S" + data['meta']['season'] + "E" + data['meta']['episode']
    }

    // Store the last search query and clear the input field.
    lastSearchQuery = data['meta']['name'];
    $('#searchfield').val("");


    $('#showThumb').attr('src', image);
    $('#showInfo .col-lg-3 .caption h3').text(title)

    if (!data['1080p']) data['1080p'] = [];
    if (!data['720p']) data['720p'] = [];
    if (!data['sd']) data['sd'] = [];

    var arrayLengths = [data['1080p'].length, data['720p'].length, data['sd'].length]
    var maxNum = Math.max(...arrayLengths)

    var rowTemplate = document.getElementById('torrentEntry');
    var bodyForRows = document.getElementById('episodeLinks').getElementsByTagName('tbody')[0];

    var keys = ['1080p', '720p', 'sd']

    for (var i = 0; i < maxNum; i++) {
      var clonedNode = rowTemplate.content.cloneNode(true);
      var td = clonedNode.querySelectorAll("td");

      td[0].textContent = (i + 1);

      for (var col = 1; col < 4; col++) {
        var item = data[keys[col - 1]][i]

        if (item) {

          var cell = td[col];

          // Get objects
          //var badgeElem = cell.getElementsByClassName("badge-torgui");
          var badgeElem = cell.getElementsByClassName("badge-torgui")[0];
          var extraElem = cell.getElementsByClassName("extra")[0];
          var download = cell.getElementsByTagName('a')[0];

          // Set values
          badgeElem.className += ` ${item.classification.codec}`;
          extraElem.textContent = `(${item.classification.source}) ${item.sizeHumanReadable}`;
          download.href = item.url;
        } else {
          td[col].textContent = ``;
        }
      }

      bodyForRows.appendChild(clonedNode);
    }

    $("#showInfo").fadeIn()
  }
}

var lastSearchQuery = "";

function sendSearchRequest(query)
{
  spinner.spin(document.getElementById('center'));
  var searchQuery = query.trim();
  if (searchQuery == "")
  {
    spinner.stop();
    alert("Empty query. Not doing anything.")
    return;
  }

  // Adjust search query to be more generic.
  // If it starts with "!" or "tt" then we pass it as is.
  // If not (this if body) then prefix it with "latest:"
  if (!searchQuery.startsWith("!") && !searchQuery.startsWith("tt") && !searchQuery.startsWith("imdb:") && !searchQuery.startsWith("latest:"))
  {
    searchQuery = "latest:" + searchQuery
  }

  if (searchQuery.startsWith("!"))
  {
    searchQuery = searchQuery.substr(1);
  }

  //$("#status").fadeIn()
  $("#showInfo").fadeOut()

  // Clear item information
  $('#showThumb').attr('src', "");
  $('#showInfo .col-lg-3 .caption h3').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  console.log(searchQuery)
//  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax( "http://tor.sc2.nl/search/" + searchQuery )
    .done(function(data) {
      //alert( "success" + data );
      console.log(data)
      //$("#responseStatus span").addClass("done").text("done");
      parseData(data);
      spinner.stop();
    })
    .fail(function() {
      spinner.stop();
      alert( "error" );
    });

  //$("#sendRequestStatus span").addClass("done").text("done");
}

$( document ).ready(function() {

  fillInitialLocalStorage();
  console.log(localStorage.welcomeMessageVersion)

  $("#welcomeMessage").css("display", ((isWelcomeMessageVersionRead() == false) ? "block": "none"))
  $("#welcomeMessage > button").click(function(){
    welcomeMessageVersion();
  });

 $('#searchfieldRefresh').click(function() {
    sendSearchRequest(lastSearchQuery);
  });

 $('#searchfieldSubmit').click(function() {
    sendSearchRequest($('#searchfield').val());
  });

  $('#searchfield').keypress(function (e) {
    if(e.which == 13)  // the enter key code
    {
      sendSearchRequest($('#searchfield').val());
      return false;
    }
  });

});


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Spinner; });
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    opacity: 0.25,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 100,
    fps: 20,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: false,
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign({}, defaults, opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        var _this = this;
        this.stop();
        this.el = createEl('div', { className: this.opts.className });
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        var animator;
        var getNow;
        if (typeof requestAnimationFrame !== 'undefined') {
            animator = requestAnimationFrame;
            getNow = function () { return performance.now(); };
        }
        else {
            // fallback for IE 9
            animator = function (callback) { return setTimeout(callback, 1000 / _this.opts.fps); };
            getNow = function () { return Date.now(); };
        }
        var lastFrameTime;
        var state = 0; // state is rotation percentage (between 0 and 1)
        var animate = function () {
            var time = getNow();
            if (lastFrameTime === undefined) {
                lastFrameTime = time - 1;
            }
            state += getAdvancePercentage(time - lastFrameTime, _this.opts.speed);
            lastFrameTime = time;
            if (state > 1) {
                state -= Math.floor(state);
            }
            for (var line = 0; line < _this.opts.lines; line++) {
                if (line < _this.el.childNodes.length) {
                    var opacity = getLineOpacity(line, state, _this.opts);
                    _this.el.childNodes[line].style.opacity = opacity.toString();
                }
            }
            _this.animateId = _this.el ? animator(animate) : undefined;
        };
        drawLines(this.el, this.opts);
        animate();
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());

function getAdvancePercentage(msSinceLastFrame, roundsPerSecond) {
    return msSinceLastFrame / 1000 * roundsPerSecond;
}
function getLineOpacity(line, state, opts) {
    var linePercent = (line + 1) / opts.lines;
    var diff = state - (linePercent * opts.direction);
    if (diff < 0 || diff > 1) {
        diff += opts.direction;
    }
    // opacity should start at 1, and approach opacity option as diff reaches trail percentage
    var trailPercent = opts.trail / 100;
    var opacityPercent = 1 - diff / trailPercent;
    if (opacityPercent < 0) {
        return opts.opacity;
    }
    var opacityDiff = 1 - opts.opacity;
    return opacityPercent * opacityDiff + opts.opacity;
}
/**
 * Utility function to create elements. Optionally properties can be passed.
 */
function createEl(tag, prop) {
    if (prop === void 0) { prop = {}; }
    var el = document.createElement(tag);
    for (var n in prop) {
        el[n] = prop[n];
    }
    return el;
}
/**
 * Tries various vendor prefixes and returns the first supported property.
 */
function vendor(el, prop) {
    if (el.style[prop] !== undefined) {
        return prop;
    }
    // needed for transform properties in IE 9
    var prefixed = 'ms' + prop.charAt(0).toUpperCase() + prop.slice(1);
    if (el.style[prefixed] !== undefined) {
        return prefixed;
    }
    return '';
}
/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[vendor(el, prop) || prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    for (var i = 0; i < opts.lines; i++) {
        var seg = css(createEl('div'), {
            position: 'absolute',
            top: 1 + ~(opts.scale * opts.width / 2) + 'px',
            opacity: opts.opacity,
        });
        if (opts.shadow) {
            seg.appendChild(css(fill('#000', '0 0 4px #000', opts, i), { top: '2px' }));
        }
        seg.appendChild(fill(getColor(opts.color, i), '0 0 1px rgba(0,0,0,.1)', opts, i));
        el.appendChild(seg);
    }
    return el;
}
function fill(color, shadow, opts, i) {
    return css(createEl('div'), {
        position: 'absolute',
        width: opts.scale * (opts.length + opts.width) + 'px',
        height: opts.scale * opts.width + 'px',
        background: color,
        boxShadow: shadow,
        transformOrigin: 'left',
        transform: 'rotate(' + ~~(360 / opts.lines * i + opts.rotate) + 'deg) translate(' + opts.scale * opts.radius + 'px' + ',0)',
        borderRadius: (opts.corners * opts.scale * opts.width >> 1) + 'px'
    });
}


/***/ })
/******/ ]);