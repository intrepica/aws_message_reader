var async = require('async');

module.exports = function(message) {  

  if (!message.Records) {
    throw new Error('Message invalid - requires Records');  
  }

  if (!(message.Records instanceof Array)) {
    throw new Error('Message invalid - Records must be an array');    
  }

  var records = message.Records.map(function(record) {
    if (!record.EventSource && !record.eventSource) { // Why check both? See below.
      throw new Error('Message invalid - Record requires EventSource');    
    }

    // SNS = EventSource
    if (record.EventSource === 'aws:sns') {
      return parseSns(record);
    }

    // dynamodb = eventSource
    if (record.eventSource === 'aws:dynamodb') {
      return parseDynamo(record);
    }    
  });

  return {
    each: function(iterator, done) {
      async.each(records, iterator, function(err) {
        if (err) {
          err.lambda_event = JSON.stringify(message);
          return done(err);
        }       
        return done();
      });
    }
  };

  function parseSns(record) {
    if (!record.Sns) {
      throw new Error('Message invalid - Record requires Sns');   
    }

    if (!record.Sns.Message) {
      throw new Error('Message invalid - Sns requires Message');    
    }
    
    return JSON.parse(record.Sns.Message);        
  }

  function parseDynamo(record) {
    if (!record.dynamodb) {
      throw new Error('Message invalid - Record requires dynamodb');   
    }
    
    return record.dynamodb.NewImage;        
  }

};