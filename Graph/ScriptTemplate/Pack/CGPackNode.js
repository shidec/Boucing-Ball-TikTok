const {BaseNode} = require('./BaseNode');
const APJS = require('./amazingpro');

class CGPackNode extends BaseNode {
  constructor() {
    super();
    this.valueType = null;
  }

  getOutput(index) {
    if (this.valueType === 'Vector2f') {
      return new APJS.Vector2f(this.inputs[0](), this.inputs[1]());
    } else if (this.valueType === 'Vector3f') {
      return new APJS.Vector3f(this.inputs[0](), this.inputs[1](), this.inputs[2]());
    } else if (this.valueType === 'Vector4f') {
      return new APJS.Vector4f(this.inputs[0](), this.inputs[1](), this.inputs[2](), this.inputs[3]());
    } else if (this.valueType === 'Quaternionf') {
      return new APJS.Quaternionf(this.inputs[0](), this.inputs[1](), this.inputs[2](), this.inputs[3]());
    } else if (this.valueType === 'Rect') {
      return new APJS.Rect(this.inputs[0](), this.inputs[1](), this.inputs[2](), this.inputs[3]());
    } else if (this.valueType === 'Color') {
      return new APJS.Color(this.inputs[0](), this.inputs[1](), this.inputs[2](), this.inputs[3]());
    }
  }
}

exports.CGPackNode = CGPackNode;
