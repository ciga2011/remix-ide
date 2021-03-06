'use strict'
var EventManager = require('../../../lib/events')
var yo = require('yo-yo')

var csjs = require('csjs-inject')
var styleGuide = require('../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .buttons {
    display: flex;
    flex-wrap: wrap;
  }
  .stepButtons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .stepButton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .jumpButtons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .jumpButton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .navigator {
    color: ${styles.rightPanel.debuggerTab.text_Primary};
  }
  .navigator:hover {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_HoverColor};
  }
`

function ButtonNavigator () {
  this.event = new EventManager()
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.jumpOutDisabled = true
  this.jumpNextBreakpointDisabled = true
  this.jumpPreviousBreakpointDisabled = true

  this.view
}

ButtonNavigator.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.buttons}">
    <div class="${css.stepButtons}">
      <button id='overback' title='单步跳过回退' class='${css.navigator} ${css.stepButton} fa fa-reply' onclick=${function () { self.event.trigger('stepOverBack') }} disabled=${this.overBackDisabled} ></button>
      <button id='intoback' title='单步回退' class='${css.navigator} ${css.stepButton} fa fa-level-up' onclick=${function () { self.event.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} ></button>
      <button id='intoforward' title='单步进入'  class='${css.navigator} ${css.stepButton} fa fa-level-down' onclick=${function () { self.event.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} ></button>
      <button id='overforward' title='单步跳过前进' class='${css.navigator} ${css.stepButton} fa fa-share' onclick=${function () { self.event.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} ></button>
    </div>

    <div class="${css.jumpButtons}">
      <button id='jumppreviousbreakpoint' title='跳转到前一个断点' class='${css.navigator} ${css.jumpButton} fa fa-step-backward' onclick=${function () { self.event.trigger('jumpPreviousBreakpoint') }} disabled=${this.jumpPreviousBreakpointDisabled} ></button>
      <button id='jumpout' title='跳出' class='${css.navigator} ${css.jumpButton} fa fa-eject' onclick=${function () { self.event.trigger('jumpOut') }} disabled=${this.jumpOutDisabled} ></button>
      <button id='jumpnextbreakpoint' title='跳转到下一个断点' class='${css.navigator} ${css.jumpButton} fa fa-step-forward' onclick=${function () { self.event.trigger('jumpNextBreakpoint') }} disabled=${this.jumpNextBreakpointDisabled} ></button>
    </div>
    <div id='reverted' style="display:none">
      <button id='jumptoexception' title='Jump to exception' class='${css.navigator} ${css.button} fa fa-exclamation-triangle' onclick=${function () { self.event.trigger('jumpToException') }} disabled=${this.jumpOutDisabled} >
      </button>
      <span>State changes made during this call will be reverted.</span>
      <span id='outofgas' style="display:none">This call will run out of gas.</span>
      <span id='parenthasthrown' style="display:none">The parent call will throw an exception</span>
    </div>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

ButtonNavigator.prototype.reset = function () {
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.jumpOutDisabled = true
  this.jumpNextBreakpointDisabled = true
  this.jumpPreviousBreakpointDisabled = true
  this.resetWarning('')
}

ButtonNavigator.prototype.stepChanged = function (stepState, jumpOutDisabled) {
  if (stepState === 'invalid') {
    // TODO: probably not necessary, already implicit done in the next steps
    this.reset()
    this.updateAll()
    return
  }

  this.intoBackDisabled = (stepState === 'initial')
  this.overBackDisabled = (stepState === 'initial')
  this.jumpPreviousBreakpointDisabled = (stepState === 'initial')
  this.jumpNextBreakpointDisabled = (stepState === 'end')
  this.intoForwardDisabled = (stepState === 'end')
  this.overForwardDisabled = (stepState === 'end')
  this.jumpNextBreakpointDisabled = jumpOutDisabled

  this.updateAll()
}

ButtonNavigator.prototype.updateAll = function () {
  this.updateDisabled('intoback', this.intoBackDisabled)
  this.updateDisabled('overback', this.overBackDisabled)
  this.updateDisabled('overforward', this.overForwardDisabled)
  this.updateDisabled('intoforward', this.intoForwardDisabled)
  this.updateDisabled('jumpout', this.jumpOutDisabled)
  this.updateDisabled('jumptoexception', this.jumpOutDisabled)
  this.updateDisabled('jumpnextbreakpoint', this.jumpNextBreakpointDisabled)
  this.updateDisabled('jumppreviousbreakpoint', this.jumpPreviousBreakpointDisabled)
}

ButtonNavigator.prototype.updateDisabled = function (id, disabled) {
  if (disabled) {
    document.getElementById(id).setAttribute('disabled', true)
  } else {
    document.getElementById(id).removeAttribute('disabled')
  }
}

ButtonNavigator.prototype.resetWarning = function (revertedReason) {
  if (!this.view) return
  this.view.querySelector('#reverted #outofgas').style.display = (revertedReason === 'outofgas') ? 'inline' : 'none'
  this.view.querySelector('#reverted #parenthasthrown').style.display = (revertedReason === 'parenthasthrown') ? 'inline' : 'none'
  this.view.querySelector('#reverted').style.display = (revertedReason === '') ? 'none' : 'block'
}

module.exports = ButtonNavigator
