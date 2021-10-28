"use strict";

var learnjs = {};

learnjs.problemView = function(problemNumber) {
  var title = 'Problem #' + problemNumber + ' Coming soon!';
  return $('<div class="problem-view">').text(title);
}

// START: showView
learnjs.showView = function(hash) {
  var routes = {
    '#problem': learnjs.problemView
  };
  var hashParts = hash.split('-');
  var viewFn = routes[hashParts[0]];
  if (viewFn) {
    $('.view-container').empty().append(viewFn(hashParts[1]));
  }
}
// END: showView

// START: appOnReady
learnjs.appOnReady = function() {
  learnjs.showView(window.location.hash);
}
// END: appOnReady
