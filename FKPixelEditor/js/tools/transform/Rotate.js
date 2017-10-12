(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Rotate = function () {
    this.toolId = 'tool-rotate';
    this.helpText = '逆时针旋转';
    this.tooltipDescriptors = [
      {key : 'alt', description : '顺时针旋转'},
      {key : 'ctrl', description : '应用于所有层'},
      {key : 'shift', description : '应用于所有帧'}];
  };

  pskl.utils.inherit(ns.Rotate, ns.AbstractTransformTool);

  ns.Rotate.prototype.applyToolOnFrame_ = function (frame, altKey) {
    var direction;

    if (altKey) {
      direction = ns.TransformUtils.CLOCKWISE;
    } else {
      direction = ns.TransformUtils.COUNTERCLOCKWISE;
    }

    ns.TransformUtils.rotate(frame, direction);
  };

})();
