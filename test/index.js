'use strict';

var expect = require('expect.js');
var sinon = require('sinon');

var message = require('../');

var mock = sinon.mock;
var stub = sinon.stub;

describe('aws_message_reader', function(){ 

  describe('with an invalid message', function(){   
    function invocation(event) {
      return function() { 
        message(event); 
      };
    }       

    it('validates Records type', function() {
      expect(invocation({ Records:{} })).to.throwError(/Message invalid - Records must be an array/);
    });
    
    it('validates EventSource property', function() {
      expect(invocation({ Records:[{}] })).to.throwError(/Message invalid - Record requires EventSource/);
    });

    describe('EventSource === aws:sns', function(){   
      it('validates Sns property', function() {
        expect(invocation({ Records:[{ EventSource:'aws:sns' }] })).to.throwError(/Message invalid - Record requires Sns/);
      });

      it('validates Message property', function() {
        expect(invocation({ Records:[{ EventSource:'aws:sns', Sns:{} }] })).to.throwError(/Message invalid - Sns requires Message/);
      });
    });

    describe('eventSource === aws:dynamodb', function(){   
      it('validates dynamodb property', function() {
        expect(invocation({ Records:[{ eventSource:'aws:dynamodb' }] })).to.throwError(/Message invalid - Record requires dynamodb/);
      });
    });

    describe('when the message doesnt contain a Record property', function(){   
      it('calls the iterator with the whole message', function(done) {
        var event = { message:'Test' };      
        message(event).each(function(message, cb) {
          expect(message).to.eql(event);          
          done();
        });  
      });

      it('iterator callback invokes finished callback', function(done) {
        var event = { message:'Test' };      
        message(event).each(function(message, cb) {
          cb();
        }, done);
      });     
    });    
  });

  describe('with a valid message', function(){ 
    var event;

    function generateSnsMessages() {    
      event = {
        'Records':[]        
      };
      [1,2,3].forEach(function(index) {
        var message = {
          index:index
        };
        event.Records.push({
          'EventSource':'aws:sns',          
          'Sns':{
            'Message':JSON.stringify(message)
          }
        });
      });      
    }

    function generateDynamoMessages() {    
      event = {
        'Records':[]        
      };
      [1,2,3].forEach(function(index) {
        var dynamoTypes = {
          number_index: {
            N: String(index)
          },
          string_index: {
            S: String(index)
          },
          string_set_index: {
            SS: [String(index)]
          }
        };
        event.Records.push({
          'eventSource':'aws:dynamodb',
          'dynamodb':{
            'OldImage': dynamoTypes,
            'NewImage': dynamoTypes,
            'SequenceNumber': 'xxx',
            'SizeBytes': 416,
            'StreamViewType': 'NEW_IMAGE'            
          }          
        });
      });      
    }    

    [
      {
        generateMessage:generateSnsMessages, 
        type:'SNS'
      },
      {
        generateMessage:generateDynamoMessages, 
        type:'DYNAMO_DB'
      }
    ].forEach(function(messageType) {

      beforeEach(messageType.generateMessage);

      describe(messageType.type + ' message', function(){         
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
                i++;
                expect(message.NewImage.number_index).to.equal(i);
                expect(message.NewImage.string_index).to.equal(String(i));
                expect(message.NewImage.string_set_index).to.eql([String(i)]);
                expect(message.OldImage.number_index).to.equal(i);
                expect(message.OldImage.string_index).to.equal(String(i));
                expect(message.OldImage.string_set_index).to.eql([String(i)]);
                expect(message.SequenceNumber).to.equal('xxx');
                expect(message.SizeBytes).to.equal(416);
                expect(message.StreamViewType).to.equal('NEW_IMAGE');
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
  });

});