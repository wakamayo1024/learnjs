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

// START: flashElement
learnjs.flashElement = function(elem, content) {
  elem.fadeOut('fast', function() {
    elem.html(content);
    elem.fadeIn();
  });
}
// END: flashElement

// START: problemView
learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = $('.templates .problem-view').clone();
  var problemData = learnjs.problems[problemNumber - 1];
  var resultFlash = view.find('.result');

  function checkAnswer() { //<label id="code.checkAnswer"/>
    var answer = view.find('.answer').val();
    var test = problemData.code.replace('__', answer) + '; problem();';
    return eval(test);
  }

  // START: problemViewClickHandler
  function checkAnswerClick() {
    if (checkAnswer()) {
      // START_HIGHLIGHT
      learnjs.flashElement(resultFlash, 'Correct!');
      // END_HIGHLIGHT
    } else {
      // START_HIGHLIGHT
      learnjs.flashElement(resultFlash, 'Incorrect!');
      // END_HIGHLIGHT
    }
    return false; //<label id="code.returnFalse"/>
  }
  // END: problemViewClickHandler

  view.find('.check-btn').click(checkAnswerClick);
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(problemData, view);
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
