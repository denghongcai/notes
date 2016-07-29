'use strict';

var Note = require('../note/package');
var EditNote = require('./EditNote');
// Base packages
var BasePackage = require('substance/packages/base/BasePackage');
var PersistencePackage = require('substance/packages/persistence/PersistencePackage');
// Toolbar
var ProseEditorToolbar = require('substance/packages/prose-editor/ProseEditorToolbar');
// Notes specific packages
var CoverPackage = require('../cover/package');
var HeaderPackage = require('../header/package');
var CollaboratorsPackage = require('../collaborators/package');
var Overlay = require('substance/ui/Overlay');

module.exports = {
  name: 'writer',
  configure: function(config) {
    config.addComponent('writer', EditNote);
    config.addComponent('overlay', Overlay);
    config.setToolbarClass(ProseEditorToolbar);
    config.addStyle(__dirname, '_writer');

    config.import(Note);
    // Import base packages
    config.import(BasePackage);
    config.import(PersistencePackage);
    // Import notes specific packages
    config.import(CoverPackage);
    config.import(HeaderPackage);
    config.import(CollaboratorsPackage);
  }
};