"use strict";

var learnjs = {};

//START: dataModel
learnjs.problems = [
  {
    description: "What is truth?",
    code: "function problem() { return __; }"
  },
  {
    description: "Simple Math",
    code: "function problem() { return 42 === 6 * __; }"
  }
];
// END: dataModel

// START: applyObject
learnjs.applyObject = function(obj, elem) {
  for (var key in obj) {
    elem.find('[data-name="' + key + '"]').text(obj[key]);
  }
};
// END: applyObject

// START: problemView
learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = $('.templates .problem-view').clone();
  view.find('.title').text('Problem #' + problemNumber);
  // START_HIGHLIGHT
  learnjs.applyObject(learnjs.problems[problemNumber - 1], view);
  // END_HIGHLIGHT
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
