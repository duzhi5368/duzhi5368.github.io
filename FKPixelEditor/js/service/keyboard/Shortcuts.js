(function () {
  var ns = $.namespace('pskl.service.keyboard');

  var createShortcut = function (id, description, defaultKey, displayKey) {
    return new ns.Shortcut(id, description, defaultKey, displayKey);
  };

  ns.Shortcuts = {
    /**
     * List of keys that cannot be remapped. Either alternate keys, which are not displayed.
     * Or really custom shortcuts such as the 1-9 for color palette shorctus
     */
    FORBIDDEN_KEYS : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '?', 'shift+?',
      'del', 'back', 'ctrl+Y', 'ctrl+shift+Z'],

    /**
     * Syntax : createShortcut(id, description, default key(s))
     */
    TOOL : {
      PEN : createShortcut('tool-pen', '钢笔工具', 'P'),
      MIRROR_PEN : createShortcut('tool-vertical-mirror-pen', '镜像笔刷', 'V'),
      PAINT_BUCKET : createShortcut('tool-paint-bucket', '油漆桶', 'B'),
      COLORSWAP : createShortcut('tool-colorswap', '颜色更变工具', 'A'),
      ERASER : createShortcut('tool-eraser', '橡皮工具', 'E'),
      STROKE : createShortcut('tool-stroke', '直线笔刷', 'L'),
      RECTANGLE : createShortcut('tool-rectangle', '矩形笔刷', 'R'),
      CIRCLE : createShortcut('tool-circle', '圆形笔刷', 'C'),
      MOVE : createShortcut('tool-move', '移动工具', 'M'),
      SHAPE_SELECT : createShortcut('tool-shape-select', '区域选区', 'Z'),
      RECTANGLE_SELECT : createShortcut('tool-rectangle-select', '矩形选区', 'S'),
      LASSO_SELECT : createShortcut('tool-lasso-select', '套索选区', 'H'),
      LIGHTEN : createShortcut('tool-lighten', '亮暗工具', 'U'),
      DITHERING : createShortcut('tool-dithering', '虚抖笔刷', 'T'),
      COLORPICKER : createShortcut('tool-colorpicker', '取色器', 'O')
    },

    SELECTION : {
      CUT : createShortcut('selection-cut', '剪切选区', 'ctrl+X'),
      COPY : createShortcut('selection-copy', '复制选区', 'ctrl+C'),
      PASTE : createShortcut('selection-paste', '粘贴选区', 'ctrl+V'),
      DELETE : createShortcut('selection-delete', '删除选区', ['del', 'back'])
    },

    MISC : {
      RESET_ZOOM : createShortcut('reset-zoom', '重置缩放比例', '0'),
      INCREASE_ZOOM : createShortcut('increase-zoom', '放大画布', '+'),
      DECREASE_ZOOM : createShortcut('decrease-zoom', '缩小画布', '-'),
      INCREASE_PENSIZE : createShortcut('increase-pensize', '增大笔刷', ']'),
      DECREASE_PENSIZE : createShortcut('decrease-pensize', '缩小笔刷', '['),
      UNDO : createShortcut('undo', '撤销', 'ctrl+Z'),
      REDO : createShortcut('redo', '还原', ['ctrl+Y', 'ctrl+shift+Z']),
      PREVIOUS_FRAME : createShortcut('previous-frame', '选择上一帧', 'up'),
      NEXT_FRAME : createShortcut('next-frame', '选择下一帧', 'down'),
      NEW_FRAME : createShortcut('new-frame', '创建新一帧', 'N'),
      DUPLICATE_FRAME : createShortcut('duplicate-frame', '复制当前选择帧', 'shift+N'),
      CHEATSHEET : createShortcut('cheatsheet', '打开快捷键设置栏', ['?', 'shift+?']),
      X1_PREVIEW : createShortcut('x1-preview', '切换原始大小预览', 'alt+1'),
      ONION_SKIN : createShortcut('onion-skin', '切换帧半透预览', 'alt+O'),
      LAYER_PREVIEW : createShortcut('layer-preview', '切换层半透预览', 'alt+L'),
      CLOSE_POPUP : createShortcut('close-popup', '关闭弹出窗口', 'ESC')
    },

    STORAGE : {
      SAVE : createShortcut('save', '保存当前项目', 'ctrl+S'),
      OPEN : createShortcut('open', '打开一个项目', 'ctrl+O'),
      SAVE_AS : createShortcut('save-as', '项目另存为', 'ctrl+shift+S')
    },

    COLOR : {
      SWAP : createShortcut('swap-colors', '切换前置色/后置色', 'X'),
      RESET : createShortcut('reset-colors', '重置笔刷为默认颜色', 'D'),
      CREATE_PALETTE : createShortcut('create-palette', '弹出调色板', 'alt+P'),
      PREVIOUS_COLOR : createShortcut('previous-color', '选择调色板中上一个颜色', '<'),
      NEXT_COLOR : createShortcut('next-color', '选择调色板中下一个颜色', '>'),
      SELECT_COLOR : createShortcut('select-color', '选择调色板中对应编号的颜色',
        '123456789'.split(''), '1 to 9')
    },

    CATEGORIES : ['TOOL', 'SELECTION', 'MISC', 'STORAGE', 'COLOR']
  };
})();
