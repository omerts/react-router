/* jshint -W058 */
var assign = require('react/lib/Object.assign');
var warning = require('react/lib/warning');
var NavigationTypes = require('../NavigationTypes');
var { getHashPath } = require('../DOMUtils');
var DOMHistory = require('./DOMHistory');

var currentNavigationType;

function ensureSlash() {
  var path = HashHistory.getCurrentPath();

  if (path.charAt(0) === '/')
    return true;

  HashHistory.replace('/' + path);

  return false;
}

function handleHashChange() {
  if (ensureSlash()) {
    HashHistory.notifyChange(
      currentNavigationType || NavigationTypes.POP
    );

    currentNavigationType = null;
  }
}

/**
 * A history implementation for DOM environments that uses window.location.hash
 * to store the current path. This is a hack for older browsers that do not
 * support the HTML5 history API (IE <= 9). It is currently used as the
 * default in DOM environments because it offers the widest range of support
 * without requiring server-side changes. However, the canGo* methods are not
 * reliable.
 */
var HashHistory = assign(new DOMHistory, {

  addChangeListener(listener) {
    DOMHistory.prototype.addChangeListener.call(this, listener);

    // Do this BEFORE listening for hashchange.
    ensureSlash();

    if (this.changeListeners.length === 1) {
      if (window.addEventListener) {
        window.addEventListener('hashchange', handleHashChange, false);
      } else {
        window.attachEvent('onhashchange', handleHashChange);
      }
    }
  },

  removeChangeListener(listener) {
    DOMHistory.prototype.removeChangeListener.call(this, listener);

    if (this.changeListeners.length === 0) {
      if (window.removeEventListener) {
        window.removeEventListener('hashchange', handleHashChange, false);
      } else {
        window.removeEvent('onhashchange', handleHashChange);
      }
    }
  },

  getCurrentPath: getHashPath,

  push(path) {
    currentNavigationType = NavigationTypes.PUSH;
    window.location.hash = path;
  },

  replace(path) {
    currentNavigationType = NavigationTypes.REPLACE;

    window.location.replace(
      window.location.pathname + window.location.search + '#' + path
    );
  },

  canGo(n) {
    warning(
      false,
      'HashHistory.canGo(n) is not reliable. Use HTML5History instead'
    );

    return DOMHistory.prototype.canGo.call(this, n);
  }

});

module.exports = HashHistory;