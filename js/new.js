/* 在新 webview 中打开第三方链接 */

//全局参数
var p = {
	newPage: null, //新打开的 webview ，即当前窗口
	link: null, //要打开的链接
	openPage: null, //新打开的链接
	waiting: null //系统等待提示
};
//加载完成
document.addEventListener("plusready", function(){
	p.waiting = plus.nativeUI.showWaiting();
	//获取当前 webview
	p.newPage = plus.webview.currentWebview();
	onBack();
	//接收传过来的链接
	p.link = p.newPage.link;
	//在子页面中打开
	createPage();
});
//在子页面中打开
function createPage(){
	p.openPage = plus.webview.create(p.link, "openPage", {
		top: "50px",
		bottom: 0
	});
	p.newPage.append(p.openPage);
	p.openPage.addEventListener("loaded", function(){
		bounce();
		p.waiting.close();
	});
};
//设置回弹效果
function bounce(){
	p.openPage.setBounce({
		position: {top: "100px"},
		changeoffset: {top: 0}
	});
};
//返回
function onBack(){
	document.getElementById("back").addEventListener("tap", function(){
		p.newPage.close();
		plus.webview.getWebviewById("sub").evalJS('bindQuit()');
	});
};
