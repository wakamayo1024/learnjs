var formattedProblem = [];
learnjs.problems.forEach(function(problem) {
    formattedProblem.push({
        code: learnjs.formatCode(problem.code),
        name: problem.name
    });
});
return formattedProblem;
