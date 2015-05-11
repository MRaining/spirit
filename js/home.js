/*父页面用来构建架构，向子页面发送问题 */

//全局参数
var p = {
	mainPage: null, //父页面，也就是当前页面
	subPage: null, //子页面
	info: null, //问题
	init: true,
	hello: "这位客官，想聊点什么呢~"
};
//加载完成
document.addEventListener("plusready", function() {
	//获取当前页面
	p.mainPage = plus.webview.currentWebview();
	//创建子页面
	createSub();
	//点击发送
	document.getElementById("btn-send").addEventListener("tap", function() {
		//输入的值
		p.info = document.getElementById("input").value;
		document.getElementById("input").value = "";
		if (p.info === "") {
			p.subPage.evalJS('showError("讨厌，至少输入个字吧~");');
		} else {
			//执行子页面的展示问题方法
			setTimeout(function(){
				p.subPage.evalJS('showAsk("' + p.info + '");');
			}, 500);
		}
	});
	//监测网络变化
	document.addEventListener("netchange", onNetChange);
	//语音输入
	document.getElementById("mic").addEventListener("tap", function(){
		onSpeech();
	});
	//help
	document.getElementById("help").addEventListener("tap", function(){
		var help = '想聊点什么？<br/>笑话、故事、成语接龙、凶吉、新闻、星座、百科、问答、图片、天气、菜谱、快递、计算、日期、航班、列车、知识库等信息，或者闲聊吧~</ul>';
		p.subPage.evalJS('hello("'+help+'");');
	});
});
//创建子页面
function createSub() {
	p.subPage = plus.webview.create("sub.html", "sub", {
		top: "50px",
		bottom: "55px",
		bounceBackground: "#000", //回弹区域背景色【仅ios有效】
		scrollIndicator: "vertical" //仅垂直方向显示滚动条
	});
	p.mainPage.append(p.subPage);
	p.subPage.addEventListener("loaded", function(){});
};
//监测网络变化
function onNetChange() {
	var status = null;
	//获取当前网络状况
	status = plus.networkinfo.getCurrentType();
	switch (status) {
		case plus.networkinfo.CONNECTION_ETHERNET:
			//有线网络
			p.subPage.evalJS('hello("'+p.hello+'");');
			break;
		case plus.networkinfo.CONNECTION_WIFI:
			//wifi网络
			p.subPage.evalJS('hello("'+p.hello+'");'); 
			break;
		case plus.networkinfo.CONNECTION_CELL2G:
			//2G网络
			p.subPage.evalJS('hello("'+p.hello+'");'); 
			break;
		case plus.networkinfo.CONNECTION_CELL3G:
			//3G网络
			p.subPage.evalJS('hello("'+p.hello+'");'); 
			break;
		case plus.networkinfo.CONNECTION_CELL4G:
			//4G网络
			p.subPage.evalJS('hello("'+p.hello+'");');
			break;
		case plus.networkinfo.CONNECTION_NONE:
			//未连接网络
			//向子页面发送数据
			p.subPage.evalJS('showError("亲，连接下网络吧，难道我们要靠心灵感应吗~");');
			break;
		default:
			//未知网络
			//向子页面发送数据
			p.subPage.evalJS('showError("你住在小山村吗，网络这么差~");');
			break;
	}
};
//语音输入
function onSpeech(){
	plus.speech.startRecognize({
		engine: "iFly"
	}, function(s){
		p.subPage.evalJS('showAsk("' + s + '");');
	}, function(){});
};
