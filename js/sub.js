/* 子页面接收问题，发送请求，并展示数据 */

//全局参数
var p = {
	mainPage: null, //父页面
	subPage: null, //子页面，也就是当前页面
	chatWrap: null, //聊天容器
	waiting: null, //系统等待
	ask: null, //问题
	answer: null, //回答
	error: null, //错误信息
	nWebView: null //从第三方链接打开的 webview
}
//加载完成
document.addEventListener("plusready", function() {
	//获取聊天容器
	p.chatWrap = document.getElementById("wrap");
	p.subPage = plus.webview.currentWebview();
	p.mainPage = p.subPage.parent();
	bindQuit();
	bounce();
	checkNet();
});
//设置回弹效果
function bounce(){
	p.subPage.setBounce({
		position: {top: "100px"},
		changeoffset: {top: 0}
	});
};
//监听退出
function bindQuit(){
	plus.key.addEventListener("backbutton", onQuit);
};
//退出
function onQuit(){
	plus.nativeUI.confirm("确定要退出？", function(e){
   		if(e.index == 0){
   			plus.runtime.quit();
   		}
    }, "提醒", ["狠心退出", "幸福留下"]);
};
//问好
function hello(cont){
	$(p.chatWrap).append('<dl data-id="0" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>'+cont+'</dd></dl>');
	location.href = "#bottom";
	feedback();
};
//发送请求
function send(info) {
	p.waiting = plus.nativeUI.showWaiting();
	$.ajax({
		url: "http://www.tuling123.com/openapi/api",
		type: "GET",
		dataType: "JSON",
		data: {
			key: "f6bcd6d23b5139008d154fb653525a2c",
			info: info,
			userid: "81132"
		},
		success: function(data) {
			if (data) {
				//展示回答
				showAnswer(data);
			} else {
				//展示错误
				showError("糟糕！发送失败，再来一次啦~");
				console.log(data);
			}
		},
		error: function(data) {
			showError('糟糕！出现错误了~');
			console.log(data);
		}
	});
};

//展示问题
function showAsk(info) {
	send(info);
	$(wrap).append('<dl class="chat ask"><dd>' + info + '</dd><dt><img src="img/me.jpg"/></dl>');
};
//展示回答
function showAnswer(data) {
	var d = eval('(' + data + ')'),
		answer = '';
	//验证状态码
	var code = d.code,
		text = d.text,
		list = null;
	switch (code) {
		case 100000:
			//文字类
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + '</dd></dl>');
			break;
		case 200000:
			//链接类
			var url = d.url;
			answer = '<br/><span class="link-text" onclick="openLink(this)" data-url="' + url + '">' + url + '</span>';
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + answer + '</dd></dl>');
			break;
		case 302000:
			//新闻类
			list = d.list;
			answer = '<ul class="mui-table-view list">';
			for (var i in list) {
				answer += '<li class="mui-table-view-cell"><a class="mui-navigate-right" data-url="' + list[i].detailurl + '" onclick="openLink(this)"><span>' + list[i].article + '</span><p class="mui-ellipsis">来源：' + list[i].source + '</p></a></li>';
			}
			answer += '</ul>';
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + '</dd></dl>' + answer);
			break;
		case 305000:
			//列车
			list = d.list;
			answer = '<ul class="mui-table-view list">';
			for(var i in list){
				answer += '<li class="mui-table-view-cell mui-media"><a data-url="'+list[i].detailurl+'" onclick="openLink(this)"><img class="mui-media-object mui-pull-left" src="'+list[i].icon+'"><div class="mui-media-body">'+list[i].start+'-'+list[i].terminal+'<span class="trainnum"> - '+list[i].trainnum+'</span><p class="mui-ellipsis">开车时间：'+list[i].starttime+' | 到达时间：'+list[i].endtime+'</p></div></a></li>';
			}
			answer += '</ul>';
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + '</dd></dl>' + answer);
			break;
		case 306000:
			//航班
			list = d.list;
			answer = '<ul class="mui-table-view list">';
			for(var i in list){
				answer += '<li class="mui-table-view-cell mui-media"><a><img class="mui-media-object mui-pull-left" src="'+list[i].icon+'"><div class="mui-media-body">'+list[i].flight+'<p class="mui-ellipsis">起飞时间：'+list[i].starttime+' | 到达时间：'+list[i].endtime+'</p></div></a></li>';
			}
			answer += '</ul>';
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + '</dd></dl>' + answer);
			break;
		case 308000:
			//菜谱
			list = d.list;
			answer = '<ul class="mui-table-view list">';
			for(var i in list){
				answer += '<li class="mui-table-view-cell mui-media"><a data-url="'+list[i].detailurl+'" onclick="openLink(this)"><img class="mui-media-object mui-pull-left" src="'+list[i].icon+'"><div class="mui-media-body">'+list[i].name+'<p class="mui-ellipsis">详情：'+list[i].info+'</p></div></a></li>';
			}
			answer += '</ul>';
			$(p.chatWrap).append('<dl data-id="' + code + '" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>' + text + '</dd></dl>' + answer);
			break;
		default:
			break;
	};
	location.href = "#bottom";
	feedback();
	p.waiting.close();
};
//在新webview中打开链接
function openLink(link) {
	var link = $(link).attr("data-url");
	p.nWebView = plus.webview.create("new.html", "nWebView", {
			top: 0,
			bottom: 0,
			scrollIndicator: "vertical"
		}, {
			link: link
		});
	//新 webview 加载完成
	p.nWebView.addEventListener("loaded", function() {
		p.nWebView.show();
		//移除退出事件
		plus.key.removeEventListener("backbutton", onQuit);
		//绑定返回按钮关闭 webview 事件
		plus.key.addEventListener("backbutton", function() {
			p.nWebView.close("slide-out-right");
		});
	});
	//关闭 webview 时，重新绑定退出事件
	p.nWebView.addEventListener("close", function(){
		bindQuit();
	});
};
//反馈
function feedback(){
	//震动反馈
	plus.device.vibrate();
	//播放提示语反馈
	var p = plus.audio.createPlayer("sound/drip.mp3");
	p.setRoute(plus.audio.ROUTE_EARPIECE);
	p.play();
};
//错误
function showError(data){
	$(p.chatWrap).append('<dl data-id="0" class="chat answer"><dt><img src="img/avatar.jpg"/></dt><dd>'+data+'</dd></dl>');
	feedback();
};
//检查当前网络
function checkNet(){
	var status = null;
	//获取当前网络状况
	status = plus.networkinfo.getCurrentType();
	if(status == plus.networkinfo.CONNECTION_NONE){
		p.subPage.evalJS('showError("亲，连接下网络吧，难道我们要靠心灵感应吗~")');
	}else{	
		hello("这位客官，想聊点什么呢~");
	}
};
