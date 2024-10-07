const APJS = require('./amazingpro');
const {BaseNode} = require('./BaseNode');

class CGGetComponentNode extends BaseNode {
  constructor() {
    super();
  }

  getOutput(index) {
    return this.inputs[0]();
  }
}

exports.CGGetComponentNode = CGGetComponentNode;
