'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var message = require('../');

var mock = sinon.mock;

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
	
		  it('iterates over each Record object', function() {
		  	var handler = mock();
		  	handler.thrice();
		  	message(event).each(handler);
		  	handler.verify();
		  });

		 	it('calls back with the parsed message', function() {		  			  
		 		var i =0;
		  	message(event).each(function(message) {
		  		expect(message.index).to.eql(++i);
		  	});		  	
		  });
	  });
	});

});