"use strict";

var learnjs = {};

// START: problemView
learnjs.problemView = function(problemNumber) {
  var view = $('.templates .problem-view').clone();
  view.find('.title').text('Problem #' + problemNumber);
  return view;
}
// END: problemView

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
  window.onhashchange = function() {
    learnjs.showView(window.location.hash);
  };
  learnjs.showView(window.location.hash);
}
// END: appOnReady
