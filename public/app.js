"use strict";

var learnjs = {};

learnjs.problemView = function() {
  return $('<div class="problem-view">').text('Coming soon!');
}

// START: showView
learnjs.showView = function(hash) {
  var routes = {
    // START_HIGHLIGHT
    '#problem': learnjs.problemView
    // END_HIGHLIGHT
  };
  // START_HIGHLIGHT
  var hashParts = hash.split('-');
  var viewFn = routes[hashParts[0]];
  // END_HIGHLIGHT
  if (viewFn) {
    // START_HIGHLIGHT
    $('.view-container').empty().append(viewFn(hashParts[1]));
    // END_HIGHLIGHT
  }
}
// END: showView
