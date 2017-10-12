var xmlHttp=null;
function sendmessage( msgType, msgInfo ){
	var msgsendobj = document.getElementById("textmessage");
	if( msgType == 0 )
	{
		
	}
	else if( msgType == 1 )
	{
		msgsendobj.value = "讲个笑话";
	}
	else if( msgType == 2 )
	{
		msgsendobj.value = "讲个故事";
	}
	else if( msgType == 3 )
	{
		msgsendobj.value = "成语接龙";
	}
	else if( msgType == 11 )
	{
		msgsendobj.value = "查快递";
	}
	else if( msgType == 100 )
	{
		msgsendobj.value =  msgInfo;
	}
	if (msgsendobj.value == "")
	{
		alert("发送内容不能为空，请重新输入聊天信息。");
		msgsendobj.focus();
		return false;
	}

	var msgcontobj = document.getElementById("containmessage");
	var oldmsg = msgcontobj.innerHTML;
	var sendmsg = "<div class='messageboxright'>" + msgsendobj.value + "<div class='arrowright'></div></div>";
	
	try {// Firefox, Opera 8.0+, Safari, IE7
		xmlHttp = new XMLHttpRequest();
	}
	catch(e) {// Old IE
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		catch(e) {
			alert ("您当前浏览器不支持 XMLHTTP!");
			return;  
		}
	}
	var url="http://www.tuling123.com/openapi/api?key=677944b7da0b38299a73d80f14ceb2d2&info=" + msgsendobj.value;
	xmlHttp.open("GET",url,false);
	xmlHttp.send(null);
	var recijson = JSON.parse(xmlHttp.responseText);
	var recimsg = "收到消息";
	//alert(recijson.code);
	if(recijson.code == 100000)
	{
		recimsg = "<div class='messageboxleft'>" + recijson.text + "<div class='arrowleft'></div></div>";
	}
	else if(recijson.code == 200000)
	{
		recimsg = "<div class='messageboxleft'>" + recijson.text + "<hr/>" + "<a href=\"" + recijson.url +"\" target=\"_blank\">" + "点我打开链接</a> "+ "<div class='arrowleft'></div></div>";
	}
	else if(recijson.code == 302000)
	{

	}
	else if(recijson.code == 308000)
	{
		console.log(recijson);
		recimsg = "<div class='messageboxleft'>" + recijson.text + "<hr/>" + "<ul>";
		for( var i = 0; i < recijson.list.length; ++i )
		{
			recimsg = recimsg + "<li><img src=" + recijson.list[i].icon + " width=\"40px\" height=\"40px\"><a href=\"" + recijson.list[i].detailurl +"\" target=\"_blank\">" +  recijson.list[i].info +"</a></li><hr/>"
		}
		recimsg = recimsg + "</ul><div class='arrowleft'></div></div>";
	}
	else if( recijson.code == 40001)
	{
		alert("参数错误，请联系管理员FK");
	}
	else if( recijson.code == 40002)
	{
		alert("信息数据为空，请重新输入信息");
	}
	else if( recijson.code == 40004)
	{
		alert("本日聊天次数用完，请联系管理员FK");
	}
	else if( recijson.code == 40007)
	{
		alert("数据格式错误，请联系管理员FK");
	}
	msgcontobj.innerHTML = oldmsg + sendmsg + recimsg;
	msgsendobj.value = "";
	msgsendobj.focus();
}

function sendmessage0()
{
	sendmessage(0);
}
function sendmessage1()
{
	sendmessage(1);
}
function sendmessage2()
{
	sendmessage(2);
}
function sendmessage3()
{
	sendmessage(3);
}
function sendmessage4()
{
    var value = prompt('输入梦的内容', '猴子');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = "解梦:梦到" + value + "怎么回事";
       sendmessage( 100, value );
    }  
}
function sendmessage5()
{
    var value = prompt('输入需要测试的名字', '周杰伦');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "这个名字好不好";
       sendmessage( 100, value );
    }  
}
function sendmessage6()
{
    var value = prompt('输入需要测试的QQ号或者手机号', '18791296666');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "凶吉";
       sendmessage( 100, value );
    }  
}
function sendmessage7()
{
    var value = prompt('输入需要查询的星座', '处女座');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "今天运势";
       sendmessage( 100, value );
    }  
}
function sendmessage8()
{
    var value = prompt('输入需要查询的生肖', '猴');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = "今年属" + value + "的运势";
       sendmessage( 100, value );
    }  
}
function sendmessage9()
{
    var value = prompt('输入需要了解的关键字', '氮气');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = "百科" + value;
       sendmessage( 100, value );
    }  
}
function sendmessage10()
{
    var value = prompt('输入需要查询的地区', '上海');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "今天的空气质量" ;
       sendmessage( 100, value );
    }  
}
function sendmessage11()
{
	sendmessage(11);
}
function sendmessage12()
{
    var value = prompt('输入需要搜索的图片关键字', '美女');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "的图片" ;
       sendmessage( 100, value );
    }  
}
function sendmessage13()
{
    var value = prompt('输入需要搜索的新闻关键字', '娱乐');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "新闻" ;
       sendmessage( 100, value );
    }  
}
function sendmessage14()
{
    var time = prompt('输入需要购买机票的时间', '今天');  
    if(time == null){  
    }else if(time == ''){  
    }else{
		var start = prompt('输入出发地', '上海');  
		if(start == null){  
		}else if(start == ''){  
		}else{		
			var end = prompt('输入到达地', '北京');  
			if(end == null){  
			}else if(end == ''){  
			}else{	
				var value = time + "从" + start + "到" + end + "的飞机票";
				sendmessage( 100, value );
			}
		}
    }  
}
function sendmessage15()
{
    var time = prompt('输入需要购买火车票的时间', '今天');  
    if(time == null){  
    }else if(time == ''){  
    }else{
		var start = prompt('输入出发地', '上海');  
		if(start == null){  
		}else if(start == ''){  
		}else{		
			var end = prompt('输入到达地', '北京');  
			if(end == null){  
			}else if(end == ''){  
			}else{	
				var value = time + "从" + start + "到" + end + "的火车票";
				sendmessage( 100, value );
			}
		}
    }   
}
function sendmessage16()
{
    var value = prompt('输入想了解的菜谱', '鱼香肉丝');  
    if(value == null){  
    }else if(value == ''){  
    }else{
		value = value + "怎么做" ;
       sendmessage( 100, value );
    }  
}