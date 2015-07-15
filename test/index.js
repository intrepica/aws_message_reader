'use strict';

var expect = require('expect.js');
var sinon = require('sinon');

var message = require('../');

var mock = sinon.mock;
var stub = sinon.stub;

describe('aws_message_reader', function(){ 

	describe('with an invalid message', function(){ 	

		function parse(event) {
			return function() { 
				message(event); 
			};
		}		

	  it('validates Records property', function() {
	  	expect(parse({})).to.throwError(/Message invalid - requires Records/);
	  });

	  it('validates Records type', function() {
	  	expect(parse({ Records:{} })).to.throwError(/Message invalid - Records must be an array/);
	  });

		it('validates Sns property', function() {
	  	expect(parse({ Records:[{}] })).to.throwError(/Message invalid - Record requires Sns/);
	  });

		it('validates Message property', function() {
	  	expect(parse({ Records:[{ Sns:{} }] })).to.throwError(/Message invalid - Sns requires Message/);
	  });
  });

	describe('with a valid message', function(){ 
		var event;

		beforeEach(function() {
			event = {
				'Records':[]				
			};
			[1,2,3].forEach(function(index) {
				var message = {
					index:index
				};
				event.Records.push({
			    'EventSource':'aws:sns',
			    'EventVersion': '1.0',
			    'EventSubscriptionArn': 'arn...',
			    'Sns':{
				    'Type': 'Notification',
				    'MessageId':'xxx',
				  	'TopicArn':'xxx',
				    'Subject':'TestInvoke',
				  	'Message':JSON.stringify(message),
				    'Timestamp':'2015-04-02T07:36:57.451Z',
				  	'SignatureVersion':'1',
				  	'Signature':'xxx',
				    'SigningCertUrl':'xxx',
				  	'UnsubscribeUrl':'xxx',
				  	'MessageAttributes':{}
			    }
			  });
			});
		});	

		describe('.each', function(){ 
			describe('when there are no errors', function(){ 		
			  it('iterates over each Record object', function(done) {
			  	var handler = mock();
			  	handler.thrice().yields(null);
			  	message(event).each(handler, function() {
			  		handler.verify();
			  		done();
			  	});		  	
			  });

			 	it('calls back with the parsed message', function(done) {		  			  
			 		var i =0;
			  	message(event).each(function(message, cb) {
			  		expect(message.index).to.eql(++i);
			  		cb();
			  	}, done);
			  });
		  });

			describe('when there is an error', function(){ 		
				var error, handler;

				beforeEach(function() {
			  	error = new Error('Boom!');
			  	handler = stub();
			  	handler.yields(error);
				});

			  it('calls the finished callback with the error', function(done) {
			  	message(event).each(handler, function(err) {
			  		expect(err).to.eql(error);
			  		done();
			  	});		  	
			  });

			  it('error.lambda_event = JSON.strinify(event)', function(done) {
			  	message(event).each(handler, function(err) {			  		
			  		expect(err.lambda_event).to.eql(JSON.stringify(event));
			  		done();
			  	});		  	
			  });
		  });		  
	  });
	});

});