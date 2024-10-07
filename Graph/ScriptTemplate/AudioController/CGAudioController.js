/**
 * @file CGAudioController.js
 * @author xuyuan
 * @date 2022/2/8
 * @brief CGAudioController.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const APJS = require('./amazingpro');
const {BaseNode} = require('./BaseNode');

class CGAudioController extends BaseNode {
  constructor() {
    super();
    this.audioNode = null;
    this.playState = 'stop';
    this.enable = true;
    this.loopAmount = 1;
    this.curLoop = 0;
    this.previewPaused = false;
    this.confirmProgress = false;
  }
  execute(index) {
    if (this.audioNode === undefined || this.audioNode === null || this.previewPaused === true) {
      return;
    }
    if (index === 0) {
      this.audioNode.start();
      this.loopAmount = this.inputs[4]();
      this.curLoop = 0;
      this.confirmProgress = false;
      if (this.nexts[1]) {
        this.nexts[1]();
      }
      this.playState = 'readyPlay';
    } else if (index === 1) {
      this.audioNode.stop();
      if (this.nexts[2]) {
        this.nexts[2]();
      }
      this.playState = 'stop';
    } else if (index === 2) {
      if (this.playState === 'stop') {
        return;
      }
      this.audioNode.pause();
      this.playState = 'pause';
    } else if (index === 3) {
      if (this.playState !== 'pause') {
        return;
      }
      this.audioNode.resume();
      this.playState = 'resume';
    }
  }

  onUpdate(sys, dt) {
    if (!this.audioNode) {
      return;
    }

    if (dt === 0 && this.previewPaused === false && (this.playState === 'play' || this.playState === 'resume')) {
      this.audioNode.pause();
      this.playState = 'pause';
      this.previewPaused = true;
    } else if (dt !== 0 && this.previewPaused === true) {
      if (this.playState === 'pause') {
        this.audioNode.resume();
        this.playState = 'resume';
      }
      this.previewPaused = false;
    }
    if (this.playState === 'play' || this.playState === 'resume') {
      if (this.enable === false || this.previewPaused === true) {
        return;
      }
      const duration = this.audioNode.getDuration() * 1000;
      const audioProgress = this.audioNode.getProgress();
      if (audioProgress > 0 && audioProgress !== 1) {
        // FIXME: when audio is playing, set confirmProgress
        this.confirmProgress = true;
      }
      if ((audioProgress >= 1 || audioProgress === 0) && duration !== 0) {
        if (!this.confirmProgress) {
          return;
        }
        this.confirmProgress = false;
        if (this.nexts[3]) {
          this.nexts[3]();
        }
        this.curLoop += 1;
        if (this.curLoop >= this.loopAmount) {
          if (this.audioNode) {
            this.audioNode.stop();
            this.playState = 'stop';
            this.curLoop = 0;
          }
        } else {
          if (this.audioNode) {
            this.audioNode.start();
          }
        }
      }
    } else if (this.playState === 'stop') {
      return;
    } else if (this.playState === 'pause') {
      return;
    } else if (this.playState === 'readyPlay') {
      this.playState = 'play';
    }
  }

  onEvent(sys, event) {
    if (this.audioNode === undefined || this.audioNode === null) {
      return;
    }
    if (event.type === APJS.AppEventType.COMPAT_BEF) {
      const event_result1 = event.args[0];
      // if (event_result1 === APJS.BEFEventType.BET_RECORD_VIDEO) {
      //   const event_result2 = event.args[1];
      //   if (event_result2 === APJS.BEF_RECODE_VEDIO_EVENT_CODE.RECODE_VEDIO_START) {
      //     this.enable = true;
      //     if (this.playState === 'pause') {
      //       this.audioNode.resume();
      //       this.playState = 'resume';
      //     }
      //   } else if (event_result2 === APJS.BEF_RECODE_VEDIO_EVENT_CODE.RECODE_VEDIO_END) {
      //     this.enable = false;
      //     if (this.playState === 'play' || this.playState === 'resume') {
      //       console.log("123: pausing...")
      //       this.audioNode.pause();
      //       this.playState = 'pause';
      //     }
      //   }
      // }
    }
  }

  setInput(index, func) {
    if (index === 5 && func) {
      this.audioNode = func();
    }
    this.inputs[index] = func;
  }

  getOutput(index) {
    return this.audioNode;
  }

  resetOnRecord(sys) {
    if (this.audioNode) {
      this.audioNode.stop();
    }
    this.playState = 'stop';
    this.curLoop = 0;
    this.loopAmount = this.inputs[4]();
    this.previewPaused = false;
    this.confirmProgress = false;
  }
}

exports.CGAudioController = CGAudioController;
