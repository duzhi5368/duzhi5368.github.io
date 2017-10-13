(function () {
  var ns = $.namespace('pskl.service');

  ns.BeforeUnloadService = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.BeforeUnloadService.prototype.init = function () {
    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  };

  ns.BeforeUnloadService.prototype.onBeforeUnload = function (evt) {
    pskl.app.backupService.backup();
    if (pskl.app.savedStatusService.isDirty()) {
      var confirmationMessage = '你当前项目有未保存的更改';

      (evt || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  };

})();
