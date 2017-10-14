// 绘制逻辑
// Author: FreeKnight

;(function(exports){

	var _this = exports;

    // 默认国家属性
	var datasStack = [],
		defaultAllCountryAttr = {
			"fill": "#999999",
			"stroke": "#ddd",
			"stroke-width": 0.5,
			"stroke-linejoin": "round"
		},
		travelledCountryAttr = {
			"fill": "#0F6995",
			"stroke": "#ddd",
			"stroke-width": 0.5,
			"stroke-linejoin": "round"
		},
		infoedCountryAttr = {
			"fill": "#fF6995",
			"stroke": "#ddd",
			"stroke-width": 0.5,
			"stroke-linejoin": "round"	
		},
		backBtnAttr = {
			"fill":"#929293",
			"stroke":"none",
			"title":"返回上一层地图",
			"cursor":"pointer"
		},
		countryNameTextAttr = {
			"font":"12px 宋体 Arial",
			"fill":"#e3242d",
			"font-weight":"bold"
		},
		areaNameTextAttr_1 = {
			"font":"12px 宋体 Arial",
			"fill":"#e3242d",
			"text-anchor":"start"
		};
		areaNameTextAttr_2 = {
			"font":"6px 宋体 Arial",
			"fill":"#e3242d",
			"text-anchor":"start"
		};
		areaNameTextAttr_3 = {
			"font":"4px 宋体 Arial",
			"fill":"#e3242d",
			"text-anchor":"start"
		};
		areaNameTextAttr_4 = {
			"font":"3px 宋体 Arial",
			"fill":"#e3242d",
			"text-anchor":"start"
		};


    // main
	exports.main = function (datas, ops) {
		// 初始化工作
		_this.initData(datas, ops);
		// 实际绘制一次
		_this.drawMap(datas, ops);
	}

	// 数据初始化，仅开启时执行一次
	exports.initData = function(datas, ops) {
		// 当前缩放比
		_this.zoomValue = 1;
		// 上次点击的国家
		_this.lastSelectCountry = null;
		_this.lastSelectCountryStateName = null;
		_this.lastSelectCountryIsEven = true;
		// 当前地图视图大小
		_this.viewbox = [0, 0, 0, 0];
		if (ops != null && ops != undefined) {
			_this.viewbbbox = {
    			x: 0,y: 0,width: ops.width,height: ops.height
			};
		}
		// 初始化国家选单列表
		var countrySelectList = document.getElementById("CountrySelect");
		for(var data in datas.mapData) {
			if(datas.mapData[data].path) {
				var option = document.createElement("option");
				option.text = datas.mapData[data].areaChineseName;
				countrySelectList.add(option);
			}
		}
	}

	// 执行缩放
	exports.doZoom = function (coords, factor) {
    	var x =  Number(_this.viewbox[0]) + Number(coords.x / _this.zoomValue);
    	var y =  Number(_this.viewbox[1]) + Number(coords.y / _this.zoomValue);

    	if (factor < 0) {
        	factor = 0.9;
    	} else {
        	factor = 1.1;
    	}

    	var nOldZoomLevel = _this.getCurZoomLevel();
    	var z = ((_this.zoomValue || 1) * factor) || 1;

    	// 下值检测
    	if(z >= 1.0 && z <= 10.0)
    	{
			_this.zoomValue = z;
    	}
    	else if(z < 1.0)
    	{
    		_this.zoomValue = 1;
    		coords.x = coords.y = 0;
    		x = y = 0;
    	}
    	else if(z > 10.0)
    	{
     		_this.zoomValue = 10.0; 		
    	}

   	 	// 缩放
    	_this.viewbox[2] = _this.viewbbbox.width / _this.zoomValue;
    	_this.viewbox[3] = _this.viewbbbox.height / _this.zoomValue;
    
    	// 调整位置
    	_this.viewbox[0] = x - coords.x / _this.zoomValue;
    	_this.viewbox[1] = y - coords.y / _this.zoomValue;

    	// 缩放层级发生更变
    	if(nOldZoomLevel != _this.getCurZoomLevel())
    	{
    		// 需要重绘
			_this.reDraw(_this.datas);
    	}

    	// 重记录视口
    	_this.paper.setViewBox.apply(_this.paper, _this.viewbox, true);
	}

	// 获取当前中心
	exports.transformEventCoords = function (event) {
		var paperElement = document.getElementById("MapCanvas");
    	return {
       		x: event.clientX - paperElement.offsetLeft,
        	y: event.clientY - paperElement.offsetTop
    	};
	}

	// 鼠标滚轮消息
	exports.wheel = function (event) {
    	var delta = 0;

    	if (!event) /* For IE. */
    		event = window.event;
    	if (event.wheelDelta) { /* IE/Opera. */
        	delta = event.wheelDelta / 120;
    	} else if (event.detail) { /** Mozilla case. */
        	delta = -event.detail / 3;
    	}

    	if (delta) {
        	_this.doZoom(_this.transformEventCoords(event), delta);
    	}
   		if (event.preventDefault) {
   			event.preventDefault();
   		}
    	event.returnValue = false;
	}

	// 创建拖拽层
	exports.createDraggable = function(){
		_this.canvasStartX = 0;
		_this.canvasStartY = 0;
		var hidePanel = _this.paper.rect(0, 0, _this.ops.width, _this.ops.height, 1).attr( { fill: 'blue', 'opacity':"0.1"  } );
		var startx, starty;
		var moveScale = 0.2 * 1 / _this.getCurZoomLevel();
		var startDrag = function(){
		    var bbox = hidePanel.getBBox();
		    startx = bbox.x;
		    starty = bbox.y;
		    hidePanel.attr("cursor","move");
		}, dragger = function(dx, dy){
			if( _this.canvasStartX + dx * moveScale < _this.ops.width /2 &&
				_this.canvasStartX + dx * moveScale > -_this.ops.width /2 &&
				_this.canvasStartY + dy * moveScale < _this.ops.height /2 &&
				_this.canvasStartY + dy * moveScale > -_this.ops.height /2 )
			{
				_this.canvasStartX += dx * moveScale;
				_this.canvasStartY += dy * moveScale;
				_this.paper.forEach(function (el) {
		   			el.translate(dx * moveScale,dy * moveScale);
				});
			}
		}, endDrag = function(){
			hidePanel.attr("cursor","default");
		};

		hidePanel.drag(dragger, startDrag, endDrag);
	}


    // 绘制地图函数
	exports.drawMap = function (datas, ops) {
        // 数据保存
		_this.datas = datas;        // 数据
		if (!_this.hasOwnProperty("ops")) {
			_this.ops = ops;        // 参数
		}

		// 初始化Canvas
		if (!_this.paper) {
			_this.paper = Raphael(_this.ops.owner, _this.ops.width, _this.ops.height);
			_this.createDraggable();	// 创建拖拽层
		}
		
        // 全地图数据以及区域数据
		var mapData = _this.datas.mapData;  // 默认该值为world
		var areaData = _this.datas.areaData;
		
        // 如果没有地图数据
		if(mapData == undefined) {
			_this.paper.text(_this.ops.width/2, _this.ops.height/2, "【错误】 地图数据丢失...").attr('font-size',12);
			return;
		}
		
        // 地图数据分离
		mapData = _this.splitIdData(mapData);

        // 保存当前地图ID
		_this.mapId = mapData.mapId;

		var administrativeData = mapData.administrativeData;
		var circleData = mapData.circleData;

		// 绘制地图
		_this.drawAdministrativeMap(administrativeData);
		// 切换动画
		administrativeData && _this.initAreaMarkAnimate(administrativeData, areaData);
		// 创建国家简易Tips
		_this.mapInfo = _this.createMapInfoDiv();

		// 监听滚动事件
		if (window.addEventListener) 
			window.addEventListener('DOMMouseScroll', _this.wheel, false);
		/** IE/Opera. */
		window.onmousewheel = document.onmousewheel = _this.wheel;
	};

    // 分离地图数据
	exports.splitIdData = function (mapData) {
		var circleData = {};
		var areaData = {};
		var id = "";
		for (var data in mapData) {
			if(mapData[data].path) {
				areaData[data] = mapData[data];
			} else {
				id = mapData[data];
			}
		}
		return {'administrativeData': areaData, mapId: id};
	};

    // 重绘
	exports.reDraw = function (datas) {
		_this.paper.clear();
		_this.createDraggable();	// 创建拖拽层
		_this.drawMap(datas, null);
		
		if (datasStack.length > 0) {
			(_this.backBtn == null) ? (_this.backBtn = _this.drawBackButton())
								 	:_this.backBtn.show();
		} else {
			_this.backBtn && _this.backBtn.hide();
		}

	};

	// 鼠标移入
	exports.mouseIn = function (areaChineseName, areaDataState, e) {
		_this.mapInfo.innerHTML = _this.createMapInfoTips(areaChineseName, areaDataState);
									  
		var xPos,
			yPos;
									  
		if (isNaN(e.pageX)) {		
			xPos = e.clientX + document.body.scrollLeft - document.body.clientLeft;
			yPos = e.clientY + document.body.scrollTop - document.body.clientTop;
		} else {
			xPos = e.pageX;
			yPos = e.pageY;	
		}
		_this.mapInfo.style.left = xPos + 5 + "px";
		_this.mapInfo.style.top = yPos + 20 + "px";
		_this.mapInfo.style.display = "block";
		_this.paper.safari();
	};

    // 鼠标移开时间
	exports.mouseOut = function (e) {
		_this.mapInfo.style.display = "none";
		_this.paper.safari();	
	};

    // 创建国家Tips
	exports.createMapInfoTips = function (areaChineseName, areaDataState) {
		var infoHtml = [];
		if( areaDataState != null )
		{
			for (var key in areaDataState) {
				infoHtml.push(areaDataState[key], "<br />");
			}
		}
		else
		{
			infoHtml.push(areaChineseName, "<br />");
		}
		return infoHtml.join('');
	};

	exports.createMapInfoDiv = function () {
		var div = document.getElementById("mapInfo");
		if (div) {
			return div;
		}
		div = document.createElement('div');
		div.className = "mapInfo";
		div.setAttribute('id', "mapInfo");
		document.body.insertBefore(div, document.body.childNodes[0]);

		return div;
	};

    // 鼠标点击消息
	exports.mouseClickCountry = function (obj, areaDataState, state, e) {	
		// 显示其信息
        _this.ShowCountryInfo(obj, state);

		var subArea = obj['subArea'];
        // 检查是否有子地图
		if(subArea){			
            // 若有子地图
			_this.mouseOut(e);
			datasStack.push(_this.datas);   // 推入堆栈

            // 绘制子地图
			_this.reDraw({
				mapData :subArea, 
				areaData: _this.datas.areaData
			});	
		}
	};

	// 点击搜索
	exports.OnReseach = function(obj){
		var name = document.getElementById("reseachContryEdit").value;
		for (var data in _this.datas.mapData) {
			if( _this.datas.mapData[data].hasOwnProperty("areaChineseName") &&
				_this.datas.mapData[data].areaChineseName.indexOf(name) >= 0 )
			{
				_this.ShowCountryInfo(_this.datas.mapData[data], data);
				return;
			}
		}
	}

	// 更换选择国家列表
	exports.selectCountryIndex = function(obj){
		var select = document.getElementById("CountrySelect");
		var selectCountryName = select[select.selectedIndex].text;
		for (var data in _this.datas.mapData) {
			if( _this.datas.mapData[data].areaChineseName == selectCountryName )
			{
				_this.ShowCountryInfo(_this.datas.mapData[data], data);
				return;
			}
		}
	};

	// 选中单个国家，更新国家信息
	exports.ShowCountryInfo = function(obj, state){
		// synchronous map
		if( _this.lastSelectCountry != null )
		{
			// 隐藏pin
			_this.hidePin(_this.lastSelectCountry.pathE);
			// 恢复颜色
			//var bIsTravelledArea = false;
			//if(_this.lastSelectCountryStateName != null && _this.datas.areaData[_this.lastSelectCountryStateName]) {
			//	bIsTravelledArea = true;
			//}
			var bIsHasInfoArea = false;
			//console.log(_this.lastSelectCountry.details);
			if(_this.lastSelectCountry.hasOwnProperty("details") && _this.lastSelectCountry.details != null
				&& _this.lastSelectCountry.details != undefined){
				bIsHasInfoArea = true;
			}
			if(bIsHasInfoArea){
				_this.lastSelectCountry.pathE.animate({'stroke-width':"0.5", 'opacity':"1", "fill": "#fF6995"},300,">");
			}
            //else if(bIsTravelledArea){
			//    _this.lastSelectCountry.pathE.animate({'stroke-width':"0.5", 'opacity':"1", "fill": "#0F6995"},300,">");
            //}
            else{
            	_this.lastSelectCountry.pathE.animate({'stroke-width':"0.5", 'opacity':"1", "fill": "#999999"},300,">");
            }
		}
		// mark last select
		_this.lastSelectCountry = obj;
		_this.lastSelectCountryStateName = state;
		// set new effect
		_this.drawPin(_this.lastSelectCountry.pathE);
		_this.lastSelectCountry.pathE.animate({'stroke-width':"2", 'opacity':"0.4", "fill":"#53a45d"},300,">");

		// synchronous select
		document.getElementById("reseachContryEdit").value = obj.areaChineseName;

		// edit area flush infos
		var strInfo = _this.getCountryHTMLInfo(_this.lastSelectCountry);
		if(_this.lastSelectCountryIsEven){
			richEdit.initEditor(strInfo);
			_this.lastSelectCountryIsEven = (!_this.lastSelectCountryIsEven);
		}
		else{
			richEdit2.initEditor(strInfo);
			_this.lastSelectCountryIsEven = (!_this.lastSelectCountryIsEven);
		}
	}

	exports.getCountryHTMLInfo = function (obj){
		if(!obj.hasOwnProperty("areaChineseName"))
			return '<h3 style=' + 'text-align: left;' + '>' + obj.areaName + '</h3>' + "<br>当前地区数据尚未记录";
		if((!obj.hasOwnProperty("details")) || (!obj.hasOwnProperty("immigrationDetails")))
			return '<h3 style=' + 'text-align: left;' + '>' + obj.areaChineseName + '(' + obj.areaName + ')</h3>' + "<br>当前国家数据尚未记录";
		
		var strInfo = 	'<h3 style=' + 'text-align: left;' + '>' + obj.areaChineseName + '(' + obj.areaName + ')</h3>' 
					+	'<div>'
					+	'<table border=' + "5" + 'cellspacing=' + "2" + 'cellpadding=' + "2" + 'bordercolor=' + "#000000" + '>'
					+		'<tbody>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>总人口</b></span>：' + obj.details.TotalPeopleNum + '</td>'
					+				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>国土面积</b></span>：' + obj.details.TotalSize + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>人类发展指数</b></span>：' + obj.details.HDI + '</td>'
                    +				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>人均GDP</b></span>：' + obj.details.GDPPerCapita + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>人均寿命</b></span>：' + obj.details.PopulationLife + '</td>'
					+				'<td><span style=' + "background-color: rgb(238, 238, 0);" + '><b>人民读写率</b></span>：' + obj.details.ReadAndWritePer + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
                    +				'<td><span style=' + "background-color: rgb(255, 255, 0);" + '><b>首都</b></span>：' + obj.details.Capital + '</td>'
					+				'<td><span style=' + "background-color: rgb(255, 255, 0);" + '><b>语言</b></span>：' + obj.details.MainLanguage + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(255, 255, 0);" + '><b>宗教</b></span>：' + obj.details.Religion + '</td>'
                    +				'<td><span style=' + "background-color: rgb(68, 255, 255);" + '><b>教育</b></span>：' + obj.details.Education + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(255, 34, 34);" + '><b>医疗</b></span>：' + obj.details.Medical + '</td>'
					+				'<td><span style=' + "background-color: rgb(0, 255, 0);" + '><b>政治</b></span>：' + obj.details.Politics + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
                    +				'<td><span style=' + "background-color: rgb(68, 68, 255);" + '><b>地理</b></span>：' + obj.details.GeoConditions + '</td>'
                    +				'<td><span style=' + "background-color: rgb(255, 68, 255);" + '><b>气候</b></span>：' + obj.details.Weather + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#f3a3a3" + '>'
					+				'<td><span style=' + "background-color: rgb(238, 187, 136);" + '><b>经济</b></span>：' + obj.details.Economic + '</td>'
					+			'</tr>'
					+		'</tbody>'
					+	'</table>'
					+	'</div>'
					+	'<div><ul><li><span style=' + "font-size: medium;" + '>' + obj.details.Others + '</span></li></ul><div>'
					+	'<table border=' + "5" + ' cellspacing=' + "2" + ' cellpadding=' + "2" + ' bordercolor=' + "#000000" + '>'
					+		'<tbody>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>投资要求</b></span></td><td>' + obj.immigrationDetails.LimitMoney + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>实际需花费</b></span></td><td>' + obj.immigrationDetails.LimitAllMoney + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>语言要求</b></span></td><td>' + obj.immigrationDetails.LimitLanguage + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>商业管理背景</b></span></td><td>' + obj.immigrationDetails.LimitBussinessExp + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>资金来源证明</b></span></td><td>' + obj.immigrationDetails.LimitExplainMoney + '</td>'
					+			'</tr>'
					+			'<tr bgcolor=' + "#73f373" + '>'
					+				'<td><span style=' + "font-weight: bold;" + '><b>年龄限制</b></span></td><td>' + obj.immigrationDetails.LimitAge + '</td>'
					+			'</tr>'
					+		'</tbody>'
					+	'</table>'
					+	'<table border=' + "5" + ' cellspacing=' + "2" + ' cellpadding=' + "2" + ' bordercolor=' + "#000000" + '>'
                    +        '<tbody>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>免签国家</b></span></td><td>' + obj.immigrationDetails.FreeVisaCountryNum + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>教育福利</b></span></td><td>' + obj.immigrationDetails.FreeEducation + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>医疗福利</b></span></td><td>' + obj.immigrationDetails.FreeMedicalTreatment + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>生育福利</b></span></td><td>' + obj.immigrationDetails.FreeBringupChild + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>养老福利</b></span></td><td>' + obj.immigrationDetails.FreeOldman + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>失业福利</b></span></td><td>' + obj.immigrationDetails.FreeLoseJob + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>税收状况</b></span></td><td>' + obj.immigrationDetails.TaxesLevel + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>生活消费</b></span></td><td>' + obj.immigrationDetails.LiveLevel + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>房价状况</b></span></td><td>' + obj.immigrationDetails.RoomPrice + '</td></tr>'
                    +            '<tr bgcolor=' + "#B363B3" + '><td><span style=' + "font-weight: bold;" + '><b>环境状况</b></span></td><td>' + obj.immigrationDetails.Environment + '</td></tr>'
                    +        '</tbody>'
                    +    '</table>'
                    +    '<table border=' + "5" + ' cellspacing=' + "2" + ' cellpadding=' + "2" + ' bordercolor=' + "#000000" + '>'
                    +        '<tbody>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>是否可工作</b></td><td>' + obj.immigrationDetails.CanWork + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>签证成功率</b></td><td>' + obj.immigrationDetails.SuccessRate + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>绿卡办理时间</b></td><td>' + obj.immigrationDetails.GreenCardTime + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>双重国籍认可</b></td><td>' + obj.immigrationDetails.DoubleImmigration + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>移民监限制</b></td><td>' + obj.immigrationDetails.ImmigrationSupervision + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>国籍更变时间</b></td><td>' + obj.immigrationDetails.ImmigrationTime + '</td></tr>'
                    +            '<tr bgcolor=' + "#63B3B3" + '><td><b>家属相关待遇</b></td><td>' + obj.immigrationDetails.IsAllFamilyImmigration + '</td></tr>'
                    +        '</tbody>'
                    +    '</table>'
                    +    '<ul><li><span style=' + "font-size: medium;" + '>' + obj.immigrationDetails.SpacialInfo + '</span></li></ul>'
                    +   '</div>'
                    + '</div>';
		return strInfo;
	}

	exports.drawAdministrativeMap = function (area) {
		for(var mData in area){
			area[mData].pathE = _this.paper.path(area[mData].path).attr(defaultAllCountryAttr);
		}
		// 绘制子地图中的地区名
		for(var mData in area){
			_this.updateAdText(area[mData]);
		}
	};

	// 获取当前地图的缩放层级
	exports.getCurZoomLevel = function (){
		if(_this.zoomValue < 2)
			return 1;
		else if(_this.zoomValue >=2 && _this.zoomValue <= 4)
			return 2;
		else if(_this.zoomValue >=4 && _this.zoomValue <= 8)
			return 3;
		else
			return 4;
	}

	// 获取一个地区的名字缩放层级
	exports.getAreaShowLevel = function (st){
		var nShowLevel = 1;
		if(st.showLevel)
		{
			nShowLevel = st.showLevel;
			return nShowLevel;
		}

		var bbox = st.pathE.getBBox();
		var size = bbox.width * bbox.height;
		if( size >= 10000 )
			nShowLevel = 1;
		else if( size >= 400 )
			nShowLevel = 2;
		else if( size >= 100 )
			nShowLevel = 3;
		else 
			nShowLevel = 4;

		return nShowLevel;
	}

	// 子地圖上的字體(地区名)
	exports.updateAdText = function (st) {
		var nZoomLevel = _this.getCurZoomLevel();
		var nShowLevel = _this.getAreaShowLevel(st);

		if(nShowLevel > nZoomLevel)
		{
			// 隐藏名称
			st.adText = null;
			return;
		}

		// 需要显示
		var xPos, yPos;
		if (st.hasOwnProperty("pos")) {
			xPos = st.pos.xPos;
			yPos = st.pos.yPos;
		}
		else
		{
			var bbox = st.pathE.getBBox();
			xPos = Math.floor(bbox.x + bbox.width/2.0);
			yPos = Math.floor(bbox.y + bbox.height/2.0);
			var nameLen = 0;
			if(!st.areaChineseName)
			{
				nameLen = st.areaName.length * 12 / nShowLevel;
			}
			else 
			{
				nameLen = st.areaChineseName.length * 12 / nShowLevel;
			}
			xPos -= (nameLen / 2);
		}

		if(nShowLevel == 1)
		{
			if(!st.areaChineseName)
				st.adText = _this.paper.text(xPos, yPos, st.areaName).attr(areaNameTextAttr_1);
			else
				st.adText = _this.paper.text(xPos, yPos, st.areaChineseName).attr(areaNameTextAttr_1);
		}
		else if(nShowLevel == 2)
		{
			if(!st.areaChineseName)
				st.adText = _this.paper.text(xPos, yPos, st.areaName).attr(areaNameTextAttr_2);
			else
				st.adText = _this.paper.text(xPos, yPos, st.areaChineseName).attr(areaNameTextAttr_2);
		}
		else if(nShowLevel == 3)
		{
			if(!st.areaChineseName)
				st.adText = _this.paper.text(xPos, yPos, st.areaName).attr(areaNameTextAttr_3);
			else
				st.adText = _this.paper.text(xPos, yPos, st.areaChineseName).attr(areaNameTextAttr_3);
		}
		else if(nShowLevel == 4)
		{
			if(!st.areaChineseName)
				st.adText = _this.paper.text(xPos, yPos, st.areaName).attr(areaNameTextAttr_4);
			else
				st.adText = _this.paper.text(xPos, yPos, st.areaChineseName).attr(areaNameTextAttr_4);
		}
	}

	exports.initAreaMarkAnimate = function (area, areaData) {
		if(areaData == undefined){
			return;
		}
		var current = null;

		// 鼠标移动到国家上
		var over = function(e) {
			var pathObj = this.pathE;
			current = pathObj;
			
			// 通知子回调
			//console.log(this);
			_this.mouseIn(this.areaChineseName,pathObj.markArea,e);

			pathObj.attr("cursor","pointer");
			if (this.hasOwnProperty("adText") && this.adText != null) {
				this.adText.attr("cursor","pointer");
			}	
			// 高亮加粗效果
			pathObj.animate({'stroke-width':"2", 'opacity':"0.4"},300,">");
		};

		// 鼠标移出国家上
		var out = function(e) {
			// 通知子回调
			_this.mouseOut(e);
			// 恢复正常效果
			this.pathE.animate({'stroke-width':"0.5", 'opacity':"1"},300,">");
		};

		// 遍历全部国家
		for(var state in area) {
			/*
			// 检查是否是已访问国家
			var bIsTravelledArea = false;
			if(areaData[state]) 
			{
				bIsTravelledArea = true;
			}
			*/
			var pathObj = area[state]['pathE'];
			/*
            if(bIsTravelledArea)
            {
			    // 设置已访问国家的颜色
			    pathObj.attr(travelledCountryAttr) ;	
            }	
            */

            // 检查是否是已记录数据的国家
            //console.log(area[state]);
            var bIsHasInfo = false;
            if(area[state].hasOwnProperty("details"))
            {
            	bIsHasInfo = true;
            }
            if(bIsHasInfo)
            {
         		// 设置有信息国家的颜色
			    pathObj.attr(infoedCountryAttr) ;	   	
            }

			// 当前数据记录
			pathObj.areaCurr = state;
			pathObj.markArea = areaData[state];

			var pathText = _this.paper.set();
			pathText.push(pathObj);
			if(area[state].hasOwnProperty("adText")) {
				pathText.push(area[state].adText);
			}
			pathText.hover(over, out, area[state]);
			pathText.click(
				function(e){
					_this.mouseClickCountry(area[current.areaCurr], current.markArea, current.areaCurr, e);
				}
			);
		}		
	}
	
    // 绘制子地图中的后退按钮
	exports.drawBackButton = function () {
		var bBtn = _this.paper.path("M21.122,22.041L38.5,32.074v-5.155c0,0,3.83,0,7.529,0c3.7,0,7.885,4.854,7.885,4.854s-1.141-11.417-5.326-13.32C44.399,16.551,38.5,17.161,38.5,17.161v-5.154L21.122,22.041z");
		bBtn.attr(backBtnAttr);
		bBtn.hover(function(){
			this.animate({stroke: "#8A8A8A","stroke-width":2}, 500);
		},function(){
			this.animate({stroke:"none","stroke-width":0}, 500);
		});
		bBtn.click(function(){
			var datas = datasStack.pop();
			_this.reDraw(datas);
		});
	}

    // 绘制小红地址图标
	exports.drawPin = function (obj) {
		var bbox = obj.getBBox();
		var x = Math.floor(bbox.x + bbox.width/2.0)-15;
		var y = Math.floor(bbox.y + bbox.height/2.0)-30;
		if(obj.hasOwnProperty("pin") && !obj.pin )
			return;

		var pin = _this.paper.path("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
		obj.pin = pin;
		var start = "t"+x+","+(y-15);
		var end = "t"+x+","+(y);
		pin.attr({fill:"#F92672",stroke:"#fff",opacity:0}).animate({opacity:1},1200);
		pin.transform(start);
		pin.toFront();
		var loop = function(){
			var result = pin.transform()== start ? end : start;
			pin.animate({transform:result}, 500, '<>', loop);
		};
		loop();
	}

	// 隐藏小红地址图标
	exports.hidePin = function(obj){
		if(obj.hasOwnProperty("pin"))
			obj.pin.remove();
	}
}(typeof exports === 'undefined' ? this['map'] = {} : exports));
