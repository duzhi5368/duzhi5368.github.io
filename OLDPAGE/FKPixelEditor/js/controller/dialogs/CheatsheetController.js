(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  var SHORTCUT_EDITING_CLASSNAME = 'cheatsheet-shortcut-editing';

  ns.CheatsheetController = function () {};

  pskl.utils.inherit(ns.CheatsheetController, ns.AbstractDialogController);

  ns.CheatsheetController.prototype.init = function () {
    this.superclass.init.call(this);

    this.cheatsheetEl = document.getElementById('cheatsheetContainer');
    this.eventTrapInput = document.getElementById('cheatsheetEventTrap');

    pskl.utils.Event.addEventListener('.cheatsheet-restore-defaults', 'click', this.onRestoreDefaultsClick_, this);
    pskl.utils.Event.addEventListener(this.cheatsheetEl, 'click', this.onCheatsheetClick_, this);
    pskl.utils.Event.addEventListener(this.eventTrapInput, 'keydown', this.onEventTrapKeydown_, this);

    $.subscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_.bind(this));

    this.initMarkup_();
    document.querySelector('.cheatsheet-helptext').setAttribute('title', this.getHelptextTitle_());
  };

  ns.CheatsheetController.prototype.destroy = function () {
    this.eventTrapInput.blur();
    pskl.utils.Event.removeAllEventListeners();
    this.cheatsheetEl = null;
  };

  ns.CheatsheetController.prototype.onRestoreDefaultsClick_ = function () {
    if (window.confirm('更换全部自定义快捷键为默认快捷键 ?')) {
      pskl.app.shortcutService.restoreDefaultShortcuts();
    }
  };

  ns.CheatsheetController.prototype.onShortcutsChanged_ = function () {
    this.initMarkup_();
  };

  ns.CheatsheetController.prototype.onCheatsheetClick_ = function (evt) {
    var shortcutEl = pskl.utils.Dom.getParentWithData(evt.target, 'shortcutId');
    if (!shortcutEl) {
      pskl.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      return;
    }

    var shortcutId = shortcutEl.dataset.shortcutId;
    var shortcut = pskl.app.shortcutService.getShortcutById(shortcutId);

    if (shortcutEl.classList.contains(SHORTCUT_EDITING_CLASSNAME)) {
      pskl.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      this.eventTrapInput.blur();
    } else if (shortcut.isEditable()) {
      pskl.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      shortcutEl.classList.add(SHORTCUT_EDITING_CLASSNAME);
      this.eventTrapInput.focus();
    }
  };

  ns.CheatsheetController.prototype.onEventTrapKeydown_ = function (evt) {
    var shortcutEl = document.querySelector('.' + SHORTCUT_EDITING_CLASSNAME);
    if (!shortcutEl) {
      return;
    }

    var shortcutKeyObject = pskl.service.keyboard.KeyUtils.createKeyFromEvent(evt);
    if (!shortcutKeyObject) {
      return;
    }

    var shortcutKeyString = pskl.service.keyboard.KeyUtils.stringify(shortcutKeyObject);
    var shortcutId = shortcutEl.dataset.shortcutId;
    var shortcut = pskl.app.shortcutService.getShortcutById(shortcutId);
    pskl.app.shortcutService.updateShortcut(shortcut, shortcutKeyString);

    shortcutEl.classList.remove(SHORTCUT_EDITING_CLASSNAME);
    this.eventTrapInput.blur();

    evt.preventDefault();
  };

  ns.CheatsheetController.prototype.initMarkup_ = function () {
    this.initMarkupForCategory_('TOOL', '.cheatsheet-tool-shortcuts', this.getToolIconClass_);
    this.initMarkupForCategory_('MISC', '.cheatsheet-misc-shortcuts');
    this.initMarkupForCategory_('COLOR', '.cheatsheet-color-shortcuts');
    this.initMarkupForCategory_('SELECTION', '.cheatsheet-selection-shortcuts');
    this.initMarkupForCategory_('STORAGE', '.cheatsheet-storage-shortcuts');
  };

  ns.CheatsheetController.prototype.getToolIconClass_ = function (shortcut) {
    return 'tool-icon cheatsheet-icon-' + shortcut.getId();
  };

  ns.CheatsheetController.prototype.initMarkupForCategory_ = function (category, container, iconClassProvider) {
    var shortcutMap = pskl.service.keyboard.Shortcuts[category];

    var descriptors = Object.keys(shortcutMap).map(function (shortcutKey) {
      return this.toDescriptor_(shortcutMap[shortcutKey], iconClassProvider);
    }.bind(this));

    this.initMarkupForDescriptors_(descriptors, container);
  };

  ns.CheatsheetController.prototype.toDescriptor_ = function (shortcut, iconClassProvider) {
    var iconClass = typeof iconClassProvider == 'function' ? iconClassProvider(shortcut) : '';
    return {
      'shortcut' : shortcut,
      'iconClass' : iconClass
    };
  };

  ns.CheatsheetController.prototype.initMarkupForDescriptors_ = function (descriptors, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) {
      return;
    }
    var markupArray = descriptors.map(this.getMarkupForDescriptor_.bind(this));
    container.innerHTML = markupArray.join('');
  };

  ns.CheatsheetController.prototype.getMarkupForDescriptor_ = function (descriptor) {
    var shortcutTemplate = pskl.utils.Template.get('cheatsheet-shortcut-template');
    var shortcut = descriptor.shortcut;
    var description = shortcut.isCustom() ? shortcut.getDescription() + ' *' : shortcut.getDescription();

    var shortcutClasses = [];
    if (shortcut.isUndefined()) {
      shortcutClasses.push('cheatsheet-shortcut-undefined');
    }
    if (shortcut.isEditable()) {
      shortcutClasses.push('cheatsheet-shortcut-editable');
    }

    var title = shortcut.isEditable() ? '点击 可编辑按键' : '该快捷键不可重新设置';

    var markup = pskl.utils.Template.replace(shortcutTemplate, {
      id : shortcut.getId(),
      title : title,
      icon : descriptor.iconClass,
      description : description,
      key : this.formatKey_(shortcut.getDisplayKey()),
      className : shortcutClasses.join(' ')
    });

    return markup;
  };

  ns.CheatsheetController.prototype.formatKey_ = function (key) {
    if (pskl.utils.UserAgent.isMac) {
      key = key.replace('ctrl', 'cmd');
    }
    key = key.replace(/left/i, '&#65513;');
    key = key.replace(/up/i, '&#65514;');
    key = key.replace(/right/i, '&#65515;');
    key = key.replace(/down/i, '&#65516;');
    key = key.replace(/>/g, '&gt;');
    key = key.replace(/</g, '&lt;');
    // add spaces around '+' delimiters
    key = key.replace(/([^ ])\+([^ ])/g, '$1 + $2');
    return key;
  };

  ns.CheatsheetController.prototype.getHelptextTitle_ = function () {
    var helpItems = [
      '点击快捷键可重新设置.',
      '当快捷键按钮闪烁时，点击键盘输入你期望的快捷键.',
      '白色的快捷键不可被重新设置.',
      '点击 \'恢复默认快捷键\' 按钮可恢复默认快捷键.'
    ];

    var helptextTitle = helpItems.reduce(function (p, n) {
      return p + '<div class="cheatsheet-helptext-tooltip-item">' + n + '</div>';
    }, '');
    helptextTitle = '<div class="cheatsheet-helptext-tooltip">' + helptextTitle + '</div>';
    return helptextTitle;
  };
})();
