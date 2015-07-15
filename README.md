[![Build Status](https://semaphoreci.com/api/v1/projects/c5a63b45-32fa-4ac8-bd2c-87d275aa3b07/483490/badge.svg)](https://semaphoreci.com/lp/aws_message_reader)      


Aws Message Reader
====================

About
--------------

Parses an AWS Sns message. If the callback triggers an error, the original Aws event (lambda_event) is attached to the error object.

```
{
  "Records":[
    {
      "EventSource":"aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "arn:aws:sns:us-east-1:123456789012:lambda_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
      "Sns":{
        "Type": "Notification",
        "MessageId":"95df01b4-ee98-5cb9-9903-4c221d41eb5e",
    "TopicArn":"arn:aws:sns:us-east-1:123456789012:lambda_topic",
        "Subject":"TestInvoke",
    "Message":" SOME STRINGIFIED JSON ",
        "Timestamp":"2015-04-02T07:36:57.451Z",
    "SignatureVersion":"1",
    "Signature":"r0Dc5YVHuAglGcmZ9Q7SpFb2PuRDFmJNprJlAEEk8CzSq9Btu8U7dxOu++uU",
        "SigningCertUrl":"http://sns.us-east-1.amazonaws.com/SimpleNotificationService-d6d679a1d18e95c2f9ffcf11f4f9e198.pem",
    "UnsubscribeUrl":"http://cloudcast.amazon.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:123456789012:example_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
    "MessageAttributes":{"key":{"Type":"String","Value":"value"}}
      }
    }
  ]
}
```


Setup
--------------

```sh
npm install aws_message_reader
```


## Api

### each(iterator, callback)

Under the hood this function is the [async.each](https://github.com/caolan/async/blob/master/README.md#eacharr-iterator-callback) method. 

> Applies the function `iterator` to each item in `arr`, in parallel.
> The `iterator` is called with an item from the list, and a callback for when it
> has finished. If the `iterator` passes an error to its `callback`, the main
> `callback` (for the `each` function) is immediately called with the error.

> Note, that since this function applies `iterator` to each item in parallel,
> there is no guarantee that the iterator functions will complete in order.

__Example__

```js

	var messageReader = require('aws_message_reader');

	messageReader(event).each(function(message, cb) {
        // message = JSON.parse(event.Records[0].Sns.Message);
        cb();
  }, function(err) {
    if (err) {

      //err.lambda_event === JSON.stringify(event);

      return callback(err);
    }

    // All done!!
  });

```

