describe('lambda function', function() {
  var index = require('index');
  var context;

  beforeEach(function() {
    context = jasmine.createSpyObj('context', ['succeed', 'fail']);
    index.dynamodb = jasmine.createSpyObj('dynamo', ['scan']);
  });

  describe('echo', function() {
    it('returns a result', function() {
      index.echo({}, context);
      expected = ["Hello from the cloud! You sent {}"];
      expect(context.succeed).toHaveBeenCalledWith(expected);
    });
  });

  // 6100
  describe('popularAnswers', function() {
    it('requests problems with the given problem number', function() {
      index.popularAnswers({problemNumber: 42}, context);
      expect(index.dynamodb.scan).toHaveBeenCalledWith({
        Key: {problemNumber: 42},
        TableName: 'learnjs'
      }, jasmine.any(Function));
    });
    it('group answers by minified code', function() {
      index.popularAnswers({problemNumber: 1}, context);
      index.dynamodb.scan.calls.first().args[1](undefined, {Items: [
        {answer: "true"},
        {answer: "true"},
        {answer: "true"},
        {answer: "!false"},
        {answer: "!false"},
      ]});
      expect(context.succeed).toHaveBeenCalledWith({"true": 3, "!false": 2});
    });

    it('fails the request if dynamo return an error', function() {
      index.popularAnswers({problemNumber: 1}, context);
      index.dynamodb.scan.calls.first().args[1]('error');
      expect(context.fail).toHaveBeenCalledWith('error');
    });
  });
});
