var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _extends$1() {
  _extends$1 = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends$1.apply(this, arguments);
}

// do not edit .js files directly - edit src/index.jst



var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }



    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};

/**
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at.
 *
 *      Http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ID = "__googleMapsScriptId";
/**
 * The status of the [[Loader]].
 */
var LoaderStatus;
(function (LoaderStatus) {
    LoaderStatus[LoaderStatus["INITIALIZED"] = 0] = "INITIALIZED";
    LoaderStatus[LoaderStatus["LOADING"] = 1] = "LOADING";
    LoaderStatus[LoaderStatus["SUCCESS"] = 2] = "SUCCESS";
    LoaderStatus[LoaderStatus["FAILURE"] = 3] = "FAILURE";
})(LoaderStatus || (LoaderStatus = {}));
/**
 * [[Loader]] makes it easier to add Google Maps JavaScript API to your application
 * dynamically using
 * [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 * It works by dynamically creating and appending a script node to the the
 * document head and wrapping the callback function so as to return a promise.
 *
 * ```
 * const loader = new Loader({
 *   apiKey: "",
 *   version: "weekly",
 *   libraries: ["places"]
 * });
 *
 * loader.load().then((google) => {
 *   const map = new google.maps.Map(...)
 * })
 * ```
 */
class Loader {
    /**
     * Creates an instance of Loader using [[LoaderOptions]]. No defaults are set
     * using this library, instead the defaults are set by the Google Maps
     * JavaScript API server.
     *
     * ```
     * const loader = Loader({apiKey, version: 'weekly', libraries: ['places']});
     * ```
     */
    constructor({ apiKey, channel, client, id = DEFAULT_ID, libraries = [], language, region, version, mapIds, nonce, retries = 3, url = "https://maps.googleapis.com/maps/api/js", }) {
        this.CALLBACK = "__googleMapsCallback";
        this.callbacks = [];
        this.done = false;
        this.loading = false;
        this.errors = [];
        this.version = version;
        this.apiKey = apiKey;
        this.channel = channel;
        this.client = client;
        this.id = id || DEFAULT_ID; // Do not allow empty string
        this.libraries = libraries;
        this.language = language;
        this.region = region;
        this.mapIds = mapIds;
        this.nonce = nonce;
        this.retries = retries;
        this.url = url;
        if (Loader.instance) {
            if (!fastDeepEqual(this.options, Loader.instance.options)) {
                throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(Loader.instance.options)}`);
            }
            return Loader.instance;
        }
        Loader.instance = this;
    }
    get options() {
        return {
            version: this.version,
            apiKey: this.apiKey,
            channel: this.channel,
            client: this.client,
            id: this.id,
            libraries: this.libraries,
            language: this.language,
            region: this.region,
            mapIds: this.mapIds,
            nonce: this.nonce,
            url: this.url,
        };
    }
    get status() {
        if (this.errors.length) {
            return LoaderStatus.FAILURE;
        }
        if (this.done) {
            return LoaderStatus.SUCCESS;
        }
        if (this.loading) {
            return LoaderStatus.LOADING;
        }
        return LoaderStatus.INITIALIZED;
    }
    get failed() {
        return this.done && !this.loading && this.errors.length >= this.retries + 1;
    }
    /**
     * CreateUrl returns the Google Maps JavaScript API script url given the [[LoaderOptions]].
     *
     * @ignore
     */
    createUrl() {
        let url = this.url;
        url += `?callback=${this.CALLBACK}`;
        if (this.apiKey) {
            url += `&key=${this.apiKey}`;
        }
        if (this.channel) {
            url += `&channel=${this.channel}`;
        }
        if (this.client) {
            url += `&client=${this.client}`;
        }
        if (this.libraries.length > 0) {
            url += `&libraries=${this.libraries.join(",")}`;
        }
        if (this.language) {
            url += `&language=${this.language}`;
        }
        if (this.region) {
            url += `&region=${this.region}`;
        }
        if (this.version) {
            url += `&v=${this.version}`;
        }
        if (this.mapIds) {
            url += `&map_ids=${this.mapIds.join(",")}`;
        }
        return url;
    }
    deleteScript() {
        const script = document.getElementById(this.id);
        if (script) {
            script.remove();
        }
    }
    /**
     * Load the Google Maps JavaScript API script and return a Promise.
     */
    load() {
        return this.loadPromise();
    }
    /**
     * Load the Google Maps JavaScript API script and return a Promise.
     *
     * @ignore
     */
    loadPromise() {
        return new Promise((resolve, reject) => {
            this.loadCallback((err) => {
                if (!err) {
                    resolve(window.google);
                }
                else {
                    reject(err.error);
                }
            });
        });
    }
    /**
     * Load the Google Maps JavaScript API script with a callback.
     */
    loadCallback(fn) {
        this.callbacks.push(fn);
        this.execute();
    }
    /**
     * Set the script on document.
     */
    setScript() {
        if (document.getElementById(this.id)) {
            // TODO wrap onerror callback for cases where the script was loaded elsewhere
            this.callback();
            return;
        }
        const url = this.createUrl();
        const script = document.createElement("script");
        script.id = this.id;
        script.type = "text/javascript";
        script.src = url;
        script.onerror = this.loadErrorCallback.bind(this);
        script.defer = true;
        script.async = true;
        if (this.nonce) {
            script.nonce = this.nonce;
        }
        document.head.appendChild(script);
    }
    /**
     * Reset the loader state.
     */
    reset() {
        this.deleteScript();
        this.done = false;
        this.loading = false;
        this.errors = [];
        this.onerrorEvent = null;
    }
    resetIfRetryingFailed() {
        if (this.failed) {
            this.reset();
        }
    }
    loadErrorCallback(e) {
        this.errors.push(e);
        if (this.errors.length <= this.retries) {
            const delay = this.errors.length * Math.pow(2, this.errors.length);
            console.log(`Failed to load Google Maps script, retrying in ${delay} ms.`);
            setTimeout(() => {
                this.deleteScript();
                this.setScript();
            }, delay);
        }
        else {
            this.onerrorEvent = e;
            this.callback();
        }
    }
    setCallback() {
        window.__googleMapsCallback = this.callback.bind(this);
    }
    callback() {
        this.done = true;
        this.loading = false;
        this.callbacks.forEach((cb) => {
            cb(this.onerrorEvent);
        });
        this.callbacks = [];
    }
    execute() {
        this.resetIfRetryingFailed();
        if (this.done) {
            this.callback();
        }
        else {
            // short circuit and warn if google.maps is already loaded
            if (window.google && window.google.maps && window.google.maps.version) {
                console.warn("Google Maps already loaded outside @googlemaps/js-api-loader." +
                    "This may result in undesirable behavior as options and script parameters may not match.");
                this.callback();
                return;
            }
            if (this.loading) ;
            else {
                this.loading = true;
                this.setCallback();
                this.setScript();
            }
        }
    }
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var defaultTemplate$1 = (function (_ref) {
  var feature = _ref.feature,
      apiKey = _ref.apiKey,
      formatLogoPath = _ref.formatLogoPath;
  var position = feature.getGeometry().get();
  var storeName = feature.getProperty('store');
  var address = feature.getProperty('storeFullAddress');
  return "<div class=\"map_infowindow_content\">\n    <div class=\"map_info\">\n      " + (storeName ? "<h2>" + storeName + "</h2>" : '') + "\n      " + (address ? "<p>" + address + "</p>" : '') + "\n    </div>\n    " + (formatLogoPath ? "<img class=\"map_logo\" src=\"" + formatLogoPath(feature) + "\" alt=\"\" />" : '') + "\n    " + (position && position.lat() && position.lng() && apiKey ? "<img\n          class=\"map_streetview\"\n          src=\"https://maps.googleapis.com/maps/api/streetview?size=350x120&location=" + position.lat() + "," + position.lng() + "&key=" + apiKey + "\"\n          alt=\"\"\n        />" : '') + "\n  </div>";
});

var addInfoWindowListenerToMap = function addInfoWindowListenerToMap(map, _ref, apiKey, formatLogoPath) {
  var _ref$template = _ref.template,
      template = _ref$template === void 0 ? defaultTemplate$1 : _ref$template,
      infoWindowOptions = _ref.infoWindowOptions;
  var defaultOptions = {
    pixelOffset: new google.maps.Size(0, -30)
  };
  var infoWindow = new google.maps.InfoWindow(_extends({}, defaultOptions, infoWindowOptions));

  var showInfoWindow = function showInfoWindow(feature) {
    infoWindow.setContent(template({
      feature: feature,
      apiKey: apiKey,
      formatLogoPath: formatLogoPath
    }));
    infoWindow.setPosition(feature.getGeometry().get());
    infoWindow.open(map);
  };

  map.data.addListener('click', function (_ref2) {
    var feature = _ref2.feature;
    showInfoWindow(feature);
  });
  map.addListener('click', function () {
    infoWindow.close();
  });
  return {
    infoWindow: infoWindow,
    showInfoWindow: showInfoWindow
  };
};

var defaultTemplate = "<div class=\"map_search-box-card\">\n  <label for=\"map_search-box\">\n    Find nearest store\n  </label>\n  <div class=\"map_search-box-input-container\">\n    <input id=\"map_search-box\" type=\"text\" placeholder=\"Enter an address\" />\n  </div>\n</div>";

var defaultAutocompleteOptions = {
  types: ['address'],
  componentRestrictions: {
    country: 'us'
  },
  fields: ['address_components', 'geometry', 'name']
};
var addSearchBoxToMap = function addSearchBoxToMap(map, onUpdate, _ref) {
  var autocompleteOptions = _ref.autocompleteOptions,
      originMarkerOptions = _ref.originMarkerOptions,
      controlPosition = _ref.controlPosition,
      _ref$template = _ref.template,
      template = _ref$template === void 0 ? defaultTemplate : _ref$template,
      _ref$searchZoom = _ref.searchZoom,
      searchZoom = _ref$searchZoom === void 0 ? 9 : _ref$searchZoom;
  var container = document.createElement('div');
  container.innerHTML = template;
  var input = container.querySelector('input');
  map.controls[controlPosition != null ? controlPosition : google.maps.ControlPosition.TOP_RIGHT].push(container);
  var autocomplete = new google.maps.places.Autocomplete(input, _extends({}, defaultAutocompleteOptions, autocompleteOptions));
  var originMarker = new google.maps.Marker(_extends({
    map: map,
    visible: false,
    position: map.getCenter(),
    icon: 'https://maps.google.com/mapfiles/ms/icons/blue.png'
  }, originMarkerOptions)); // Add a marker on search

  autocomplete.addListener('place_changed', function () {
    try {
      var place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        originMarker.setVisible(false);
        global.window.alert("No address available for input: " + place.name);
        return Promise.resolve();
      }

      var originLocation = place.geometry.location;
      map.setCenter(originLocation);
      map.setZoom(searchZoom);
      originMarker.setPosition(originLocation);
      originMarker.setVisible(true);
      return Promise.resolve(onUpdate()).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  });
  return {
    autocomplete: autocomplete,
    originMarker: originMarker
  };
};

var closeButtonId = 'map_close-store-list-button';
var listId = 'map_store-list';
var messageId = 'map_store-list-message';
var storeTemplate = function storeTemplate(_ref) {
  var store = _ref.store,
      formatLogoPath = _ref.formatLogoPath;
  var storeName = store.feature.getProperty('store');
  var address = store.feature.getProperty('storeFullAddress');
  var location = store.feature.getGeometry().get();
  return "\n    <li>\n      <button\n        data-lat=\"" + location.lat() + "\"\n        data-lng=\"" + location.lng() + "\"\n        title=\"" + (storeName != null ? storeName : '') + "\"\n      >\n        " + (storeName ? "<p class=\"map_banner\">" + storeName + "</p>" : '') + "\n        " + (formatLogoPath ? "<img class=\"map_logo\" alt=\"\" src=\"" + formatLogoPath(store.feature) + "\" />" : '') + "\n        <p class=\"map_distance\">" + store.distanceText + "</p>\n        " + (address ? "<p class=\"map_address\">" + address + "</p>" : '') + "\n      </button>\n    </li>\n  ";
};
var panelTemplate = "\n  <h2 id=\"store-list-header\">Nearby Locations</h2>\n  <button type=\"button\" id=\"" + closeButtonId + "\" class=\"close-button\">\n    <img alt=\"Close Store List\" src=\"https://www.google.com/intl/en_us/mapfiles/close.gif\" />\n  </button>\n  <ul id=\"" + listId + "\"></ul>\n  <div id=\"" + messageId + "\"></div>";

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var storeListPanelId = 'map_store-list-panel';

var getDistanceMatrix = function getDistanceMatrix(service, parameters) {
  return new Promise(function (resolve, reject) {
    service.getDistanceMatrix(parameters, function (response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        reject("DistanceMatrixService Response Status: " + status);
      } else if (!response) {
        reject('DistanceMatrixService returned no response');
      } else {
        resolve(response.rows[0].elements.map(function (e) {
          return {
            text: e.distance.text,
            value: e.distance.value
          };
        }));
      }
    });
  });
};

var getStoresClosestToCenterOfMap = function getStoresClosestToCenterOfMap(map, _ref, maxDestinationsPerDistanceMatrixRequest) {
  var _ref$filterFn = _ref.filterFn,
      filterFn = _ref$filterFn === void 0 ? function (_, i) {
    return i < 10;
  } : _ref$filterFn,
      _ref$travelMode = _ref.travelMode,
      travelMode = _ref$travelMode === void 0 ? google.maps.TravelMode.DRIVING : _ref$travelMode,
      unitSystem = _ref.unitSystem;

  try {
    var stores = [];
    var center = map.getCenter();

    if (!center) {
      return Promise.resolve([]);
    } // Get locations and create array for stores


    map.data.forEach(function (store) {
      var location = store.getGeometry().get();
      stores.push({
        store: store,
        location: location,
        distance: google.maps.geometry.spherical.computeDistanceBetween(center, location)
      });
    }); // sort by straight-line distance to the center

    var closestStores = stores.sort(function (s1, s2) {
      return s1.distance - s2.distance;
    }).slice(0, maxDestinationsPerDistanceMatrixRequest); // find driving distances from center of map

    var service = new google.maps.DistanceMatrixService();
    return Promise.resolve(getDistanceMatrix(service, {
      origins: [center],
      destinations: closestStores.map(function (_ref2) {
        var location = _ref2.location;
        return location;
      }),
      travelMode: travelMode,
      unitSystem: unitSystem === 'metric' ? google.maps.UnitSystem.METRIC : google.maps.UnitSystem.IMPERIAL
    })).then(function (distancesList) {
      // apply distance info to our stores list
      var storesWithDrivingDistances = closestStores.map(function (store, i) {
        return _extends({}, store, {
          // they are returned in teh same order as we pass them in as destinations
          distanceText: distancesList[i].text,
          distanceValue: distancesList[i].value
        });
      }); // Sort and format for display

      return storesWithDrivingDistances.sort(function (s1, s2) {
        return s1.distanceValue - s2.distanceValue;
      }).map(function (s) {
        return {
          feature: s.store,
          distanceText: s.distanceText
        };
      }).filter(function (result, index) {
        return filterFn(result, index, map);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var findFeatureByLatLng = function findFeatureByLatLng(map, lat, lng) {
  var _featuresWithLatLng$f;

  var featuresWithLatLng = [];
  map.data.forEach(function (feature) {
    var location = feature.getGeometry().get();
    featuresWithLatLng.push({
      lat: location.lat(),
      lng: location.lng(),
      feature: feature
    });
  });
  return (_featuresWithLatLng$f = featuresWithLatLng.find(function (f) {
    return f.lat === lat && f.lng === lng;
  })) == null ? void 0 : _featuresWithLatLng$f.feature;
};

var showLocation = function showLocation(map, showInfoWindow, lat, lng) {
  map.setCenter({
    lat: lat,
    lng: lng
  });
  map.setZoom(13);
  var matchingFeature = findFeatureByLatLng(map, lat, lng);

  if (matchingFeature) {
    showInfoWindow(matchingFeature);
  }
};

var resultOnClickListeners = Array();

var showStoreList = function showStoreList(map, showInfoWindow, options, maxDestinationsPerDistanceMatrixRequest, formatLogoPath) {
  return function () {
    try {
      var _temp3 = function _temp3(_result) {
        if (_exit2) return _result;

        if (sortedStores.length) {
          var _options$storeTemplat;

          var template = (_options$storeTemplat = options.storeTemplate) != null ? _options$storeTemplat : storeTemplate;
          list.innerHTML = sortedStores.map(function (store) {
            return template({
              store: store,
              formatLogoPath: formatLogoPath
            });
          }).join('');
          message.innerHTML = '';
          list.querySelectorAll('button').forEach(function (button) {
            button.onclick = function () {
              showLocation(map, showInfoWindow, +(button.getAttribute('data-lat') || 0), +(button.getAttribute('data-lng') || 0));
              resultOnClickListeners.forEach(function (listener) {
                return listener(button);
              });
            };
          });
        } else {
          list.innerHTML = '';
          message.innerHTML = 'There are no locations that match the given criteria.';
        }

        panel.classList.add('open');
      };

      var _exit2;

      var panel = document.getElementById(storeListPanelId);
      var list = document.getElementById(listId);
      var message = document.getElementById(messageId);
      var sortedStores;

      var _temp4 = _catch(function () {
        return Promise.resolve(getStoresClosestToCenterOfMap(map, options, maxDestinationsPerDistanceMatrixRequest)).then(function (_getStoresClosestToCe) {
          sortedStores = _getStoresClosestToCe;
        });
      }, function (e) {
        console.error(e);
        list.innerHTML = '';
        message.innerHTML = 'There was an error determining the closest stores.';
        panel.classList.add('open');
        _exit2 = 1;
      });

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };
};

var addStoreListToMapContainer = function addStoreListToMapContainer(container, map, showInfoWindow, options, formatLogoPath,
/* As restricted by the google maps api - only exposed here for tests */
maxDestinationsPerDistanceMatrixRequest) {
  var _options$panelTemplat;

  if (maxDestinationsPerDistanceMatrixRequest === void 0) {
    maxDestinationsPerDistanceMatrixRequest = 25;
  }

  var panel = document.createElement('section');
  panel.id = storeListPanelId;
  panel.classList.add('map_store-list-panel');
  panel.setAttribute('aria-labelledby', 'store-list-header');
  panel.innerHTML = (_options$panelTemplat = options.panelTemplate) != null ? _options$panelTemplat : panelTemplate;
  container.appendChild(panel);

  var hideStoreList = function hideStoreList() {
    return panel.classList.remove('open');
  };

  var closeButton = document.getElementById(closeButtonId);

  if (closeButton) {
    closeButton.addEventListener('click', hideStoreList);
  }

  return {
    showStoreList: showStoreList(map, showInfoWindow, options, maxDestinationsPerDistanceMatrixRequest, formatLogoPath),
    hideStoreList: hideStoreList,
    closeButton: closeButton,
    addListener: function addListener(type, listener) {
      if (type != 'item_click') {
        throw new Error('only `item_click` type available');
      }

      resultOnClickListeners.push(listener);
    }
  };
};

var defaultCenter = {
  lat: 39.8283,
  lng: -98.5795
};
var defaultZoom = 4;
var defaultMapOptions = {
  center: defaultCenter,
  zoom: defaultZoom
};

var validateOptionsJs = function validateOptionsJs(options) {
  if (!options) {
    throw new Error('You must define the required options.');
  }

  if (!options.container) {
    throw new Error('You must define a `container` element to put the map in.');
  }

  if (!options.geoJson) {
    throw new Error('You must define the `geoJson` as a URL or GeoJSON object.');
  }
};

var createStoreLocatorMap = function createStoreLocatorMap(options) {
  try {
    var _temp3 = function _temp3(_result) {
      if (_exit2) return _result;
      var map = new google.maps.Map(container, _extends({}, defaultMapOptions, mapOptions));

      if (typeof geoJson === 'string') {
        map.data.loadGeoJson(geoJson);
      } else {
        map.data.addGeoJson(geoJson);
      }

      var _addInfoWindowListene = addInfoWindowListenerToMap(map, infoWindowOptions != null ? infoWindowOptions : {}, loaderOptions == null ? void 0 : loaderOptions.apiKey, formatLogoPath),
          infoWindow = _addInfoWindowListene.infoWindow,
          showInfoWindow = _addInfoWindowListene.showInfoWindow;

      var storeList = addStoreListToMapContainer(container, map, showInfoWindow, storeListOptions != null ? storeListOptions : {}, formatLogoPath);
      var searchBox = addSearchBoxToMap(map, storeList.showStoreList, searchBoxOptions != null ? searchBoxOptions : {});
      return _extends({
        map: map,
        infoWindow: infoWindow
      }, searchBox, {
        storeList: storeList
      });
    };

    var _exit2;

    validateOptionsJs(options);
    var container = options.container,
        loaderOptions = options.loaderOptions,
        geoJson = options.geoJson,
        mapOptions = options.mapOptions,
        formatLogoPath = options.formatLogoPath,
        infoWindowOptions = options.infoWindowOptions,
        searchBoxOptions = options.searchBoxOptions,
        storeListOptions = options.storeListOptions;

    var _temp4 = function () {
      if (!window.google || !window.google.maps || !window.google.maps.version) {
        if (!loaderOptions || !loaderOptions.apiKey) {
          throw new Error('You must define the `loaderOptions` and its `apiKey`.');
        }

        var loader = new Loader(_extends({}, loaderOptions, {
          libraries: ['places', 'geometry']
        }));
        return Promise.resolve(loader.load()).then(function () {});
      } else if (!window.google.maps.geometry || !window.google.maps.places) {
        throw new Error('If you are loading the Google Maps JS yourself, you need to load the `places` and `geometry` libraries with it.');
      }
    }();

    return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
  } catch (e) {
    return Promise.reject(e);
  }
};

var StoreLocator = function StoreLocator(_ref) {
  var _ref$onMapInit = _ref.onMapInit,
      onMapInit = _ref$onMapInit === void 0 ? function () {} : _ref$onMapInit,
      className = _ref.className,
      style = _ref.style,
      loaderOptions = _ref.loaderOptions,
      geoJson = _ref.geoJson,
      mapOptions = _ref.mapOptions,
      infoWindowOptions = _ref.infoWindowOptions,
      formatLogoPath = _ref.formatLogoPath,
      searchBoxOptions = _ref.searchBoxOptions,
      storeListOptions = _ref.storeListOptions;
  var containerRef = React.useRef(null);
  React.useEffect(function () {
    if (containerRef.current) {
      createStoreLocatorMap({
        container: containerRef.current,
        loaderOptions: loaderOptions,
        geoJson: geoJson,
        mapOptions: mapOptions,
        infoWindowOptions: infoWindowOptions,
        formatLogoPath: formatLogoPath,
        searchBoxOptions: searchBoxOptions,
        storeListOptions: storeListOptions
      }).then(onMapInit)["catch"](function (err) {
        return console.error('Could not initialize store locator map.', err);
      });
    }
  }, [loaderOptions, geoJson, formatLogoPath, infoWindowOptions, mapOptions, searchBoxOptions, storeListOptions, onMapInit]); // Include a default minHeight to prevent confusion over why the map is not visible if no
  // styling is provided.

  var defaultHeight = className ? undefined : {
    minHeight: 400
  };
  return /*#__PURE__*/React__default['default'].createElement("div", {
    ref: containerRef,
    className: className,
    style: _extends$1({}, defaultHeight, style, {
      position: 'relative',
      overflow: 'hidden'
    })
  });
};

exports.StoreLocator = StoreLocator;
