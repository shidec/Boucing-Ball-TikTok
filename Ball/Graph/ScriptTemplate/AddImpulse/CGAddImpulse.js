/**
 * @file CGAddImpulse.js
 * @author Jie Li
 * @date 2021/8/23
 * @brief CGAddImpulse.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */
const {BaseNode} = require('./BaseNode');
let GlobalParameters;
/* eslint-disable no-undef */
try {
  ({
    GlobalParameters,
    GlobalParameters: {pbdSimulator, addModifiedProperty},
  } = require('./GlobalParameters'));
} catch (error) {
  console.error('Module GlobalParameters not found:', error.message);
}
/* eslint-enable no-undef */
const APJS = require('./amazingpro');

class CGAddImpulse extends BaseNode {
  constructor() {
    super();
    this.impulse = new APJS.Vector3f(0, 0, 0);
    this.state = 0;
    this.previousScaledImpulse = new APJS.Vector3f(0, 0, 0);
    this.previousTorque = new APJS.Vector3f(0, 0, 0);
  }

  execute(index) {
    const object = this.inputs[1]();

    if (GlobalParameters && object && object.isInstanceOf('JSScriptComponent') && object.path === 'js/RigidBody.js') {
      this.rigidBody = object.getScript().ref;
      if (this.rigidBody.bodyId >= 0) {
        this.impulse = this.inputs[2]();
        let position = this.inputs[3]();
        const isLocal = this.inputs[4]();
        if (this.impulse !== null && position !== null && isLocal !== null) {
          if (isLocal) {
            const trans = object.getSceneObject().getComponent('Transform');
            this.impulse = trans.getWorldRotation().multiplyVector(this.impulse);
            position = trans.getWorldRotation().multiplyVector(position).add(trans.getWorldPosition());
          }
          const scaledImpulse = this.impulse.clone().multiply(GlobalParameters.gravityFactor);
          if (!GlobalParameters.framerateIndependence)
            this.rigidBody.totalExternalForce.sub(this.previousScaledImpulse.getNative());
          this.rigidBody.totalExternalForce.add(scaledImpulse.getNative());
          // stores current impulse, it will be later removed in PBDSystem onLateUpdate
          this.rigidBody.impulse = APJS.getNativeExternal(scaledImpulse);
          const externalForce = this.rigidBody.totalExternalForce.copy();
          const newValue = [externalForce.x, externalForce.y, externalForce.z];
          GlobalParameters.addModifiedPropertyFast(
            GlobalParameters.RigidBodyExternalForce,
            this.rigidBody.bodyId,
            newValue
          );

          const rbCenter = APJS.transferToAPJSObj(GlobalParameters.pbdSimulator.getRigidBodyPosition(this.rigidBody.bodyId));
          const r = position.clone().subtract(rbCenter);
          this.torque = r.cross(scaledImpulse);
          this.rigidBody.torqueFromImpulse = APJS.getNativeExternal(this.torque);
          // subtract previous torque
          if (!GlobalParameters.framerateIndependence)
            this.rigidBody.totalExternalTorque.sub(this.previousTorque.getNative());
          this.rigidBody.totalExternalTorque.add(this.torque.getNative());
          const newValueTorque = [
            this.rigidBody.totalExternalTorque.x,
            this.rigidBody.totalExternalTorque.y,
            this.rigidBody.totalExternalTorque.z,
          ];
          GlobalParameters.addModifiedPropertyFast(
            GlobalParameters.RigidBodyExternalTorque,
            this.rigidBody.bodyId,
            newValueTorque
          );

          this.state = 1;
          this.previousScaledImpulse = scaledImpulse;
          this.previousTorque = this.torque;
          GlobalParameters.isAddingImpulse = true;
        }
      }
    }

    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }

  onUpdate(sys, deltatime) {
    switch (this.state) {
      // idle
      case 0:
        break;

      // wait for a frame
      case 1:
        this.state = 2;
        break;

      // remove force
      case 2:
        if (!GlobalParameters.framerateIndependence) {
          this.rigidBody.totalExternalForce.sub(this.previousScaledImpulse.getNative());
          const externalForce = this.rigidBody.totalExternalForce.copy();
          const newValue = [externalForce.x, externalForce.y, externalForce.z];
          GlobalParameters.addModifiedPropertyFast(
            GlobalParameters.RigidBodyExternalForce,
            this.rigidBody.bodyId,
            newValue
          );

          this.rigidBody.totalExternalTorque.sub(this.previousTorque.getNative());
          const newValueTorque = [
            this.rigidBody.totalExternalTorque.x,
            this.rigidBody.totalExternalTorque.y,
            this.rigidBody.totalExternalTorque.z,
          ];
          GlobalParameters.addModifiedPropertyFast(
            GlobalParameters.RigidBodyExternalTorque,
            this.rigidBody.bodyId,
            newValueTorque
          );
          this.previousScaledImpulse.set(0, 0, 0);
          this.previousTorque.set(0, 0, 0);
        }
        this.state = 0;
        break;

      default:
        break;
    }
  }

  getOutput(index) {
    switch (index) {
      case 1:
        return this.impulse;
      default:
        return null;
    }
  }
}

exports.CGAddImpulse = CGAddImpulse;
