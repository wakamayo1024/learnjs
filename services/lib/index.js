var http = require('http');
var AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-1'

var config = {
  dynamoTableName: 'learnjs',
};

exports.dynamodb = new AWS.DynamoDB.DocumentClient();

function reduceItems(memo, items) {
  items.forEach(function(item) {
    memo[item.answer] = (memo[item.answer] || 0) + 1;
  });
  return memo;
}

exports.popularAnswers = function(json, context) {
  exports.dynamodb.scan({
    Key: {problemNumber: json.problemNumber},
    TableName: config.dynamoTableName
  }, function(err, data) {
    if(err) {
      context.fail(err);
    } else {
      context.succeed(reduceItems({}, data.Items));
    }
  });
};

exports.echo = function(json, context) {  
  context.succeed(["Hello from the cloud! You sent " + JSON.stringify(json)]);
};
