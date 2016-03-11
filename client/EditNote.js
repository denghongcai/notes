var CollabSession = require('substance/collab/CollabSession');
var JSONConverter = require('substance/model/JSONConverter');
var Note = require('../model/Note');
var Collaborators = require('./Collaborators');
var CollabClient = require('substance/collab/CollabClient');
var DocumentClient = require('substance/collab/DocumentClient');
var LoginStatus = require('./LoginStatus');
var converter = new JSONConverter();
var NoteWriter = require('./NoteWriter');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function EditNote() {
  Component.apply(this, arguments);

  var config = this.context.config;
  var authenticationClient = this.context.authenticationClient;
  
  this.documentClient = new DocumentClient({
    httpUrl: config.documentServerUrl || 'http://'+config.host+':'+config.port+'/api/documents/'
  });

  this.collabClient = new CollabClient({
    wsUrl: config.wsUrl || 'ws://'+config.host+':'+config.port,
    enhanceMessage: function(message) {
      message.sessionToken = authenticationClient.getSessionToken();
      return message;
    }.bind(this)
  });
}

EditNote.Prototype = function() {

  this.getInitialState = function() {
    return {
      session: null, // CollabSession will be stored here, if null indicates we are in loading state
      error: null // used to display error messages e.g. loading of document failed
    };
  };

  // Life cycle
  // ------------------------------------

  this.didMount = function() {
    this._init();
  };

  this.willReceiveProps = function() {
    console.log('willreceive props');
    this.dispose();
    // TODO: This is a bit bad taste. but we need to reset to initial state if we are looking at a different
    // document
    this.state = this.getInitialState();
    this._init();
  };

  this._init = function() {
    this._loadDocument();
  };

  this.dispose = function() {
    if (this.state.session) {
      this.state.session.dispose();
    }
  };

  // Life cycle
  // ------------------------------------

  this.render = function() {
    console.log('EditNote.render', this.state);
    var authenticationClient = this.context.authenticationClient;

    var el = $$('div').addClass('sc-notepad-wrapper');

    if (this.state.error) {
      // TODO: render this in a pop in addition to the regular content
      el.append('div').addClass('se-error').append(this.state.error.message);
    } else if (this.state.session) {
      el.append(
        $$('div').addClass('se-header').append(
          $$('div').addClass('se-actions').append(
            $$('button').addClass('se-action').append('New Note') // .on('click', this.send.bind(this, 'newNote'))
          ),
          $$(LoginStatus, {
            user: authenticationClient.getUser()
          }),
          $$(Collaborators, {
            session: this.state.session
          })
        ),
        $$(NoteWriter, {
          documentSession: this.state.session,
          // onUploadFile: hubClient.uploadFile
        }).ref('notepad')
      );
    } else {
      el.append('Loading document...');
    }
    return el;
  };

  // Helpers
  // ------------------------------------

  /*
    Loads a document and initializes a CollabSession
  */
  this._loadDocument = function() {
    var collabClient = this.collabClient;
    var documentClient = this.documentClient;

    documentClient.getDocument(this.props.docId, function(err, docRecord) {
      if (err) {
        this.setState({
          error: new Error('Document could not be loaded')
        });
        console.log('ERROR', err);
        return;
      }
      
      var doc = new Note();
      doc = converter.importDocument(doc, docRecord.data);
      var session = new CollabSession(doc, {
        docId: this.props.docId,
        docVersion: docRecord.version,
        collabClient: collabClient
      });

      // HACK: For debugging purposes
      window.doc = doc;
      window.session = session;

      this.extendState({
        session: session
      });
    }.bind(this));
  };

};

Component.extend(EditNote);

module.exports = EditNote;