learnjs.formatCode = function(obj) {
    return obj;
}

function formatProblems() {
    var formattedProblem = [];
    learnjs.problems.forEach(function(problem) {
        formattedProblem.push({
            code: learnjs.formatCode(problem.code),
            name: problem.name
        });
    });
    return formattedProblem;
}

function betterFormatProblems() {
    return learnjs.problems.map(learnjs.formatCode);
}

describe('betterFormatProblems', function() {
    beforeEach(function() {
        spyOn(learnjs, 'formatCode').and.callFake(function(problem) {
            return {
                code: "formatted",
                name: problem.name
            };
        });
    });
    it('aplies a formatter to all the problems', function() {
        expect(betterFormatProblems()[0].code).toEqual("formatted");
    });
});

describe('formatProblems', function() {
    beforeEach(function() {
        spyOn(learnjs, 'formatCode').and.returnValue("formatted");
    });
    it('applies a formatter to all the problems', function() {
        expect(formatProblems()[0].code).toEqual("formatted");
    });
});