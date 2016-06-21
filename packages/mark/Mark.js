'use strict';

var PropertyAnnotation = require('substance/model/PropertyAnnotation');

/**
  Simple mark for highlighting text in a note
*/

function Mark() {
  Mark.super.apply(this, arguments);
}

PropertyAnnotation.extend(Mark);

Mark.static.name = 'mark';

module.exports = Mark;