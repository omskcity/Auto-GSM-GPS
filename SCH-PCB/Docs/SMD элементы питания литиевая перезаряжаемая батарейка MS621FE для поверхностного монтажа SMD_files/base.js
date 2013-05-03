//----------------------------------------------------------windows-1251----
//	Title				Base site scripts
//  Date 				13 August 2008
//  Copyright	 		Ulter West, http://uw.ru
//  Version				1.0
//--------------------------------------------------------------------------
//	Desription
//--------------------------------------------------------------------------
//	���� ���������� ������� (JavaScript) ��� ������������ �����. 
//--------------------------------------------------------------------------
//	Contents
//--------------------------------------------------------------------------
//	����� ���� �������� ���������� ��������� ������
//	���������������� ��� ���������� �����:
//
//	cookie.js			������ � ������;
//	ValidForm.js		��������� ����;
//	ShowImage.js		���������� ����������� ������ �������� � ����� ����;
//	searchtips.js		���������� ������� ��������� ������, �� �������� �� ����� ����� � �.�.;
//	PrintMode.js		������������ �� ������ ��� ������ (��������� � URI �������� printmode);
//	addmessage.js		���������� ��������� �� ����� ���������� � � �����;
//
//  ��������� � ������ shop.js �.�. �� ������� ��� � ��� ������ ����� ��������� ����
//
//	���� ������� �� ������ ��������������� ����� �������������� ������,
//--------------------------------------------------windows-1251----
//	Title				Photo Gallery (Script)
//  Date 				20 October 2008
//  Author	 			Alexey Generalov [webradical]
//  Copyright	 		Ulter West
//  Version				1.1
//	Last Edit			20081021
//------------------------------------------------------------------
// 	������ ��������� ������������ �� ���� ������������,
//  � ������������ ���������, ������������� � ��������� 
//	�������������� �����������.
//
//	������ �����������:
//	<div class="photo">
//	<a href="/images/upload/71/ru/land2_big.jpg" onclick="photoGallery.addImage(this); return false;">
//	<img alt="������ 2_big" title="������ 2_big" align="" width="150" height="112" src="/images/upload/71/ru/land2.jpg" class=""/>
//	</a>
//	</div>
//------------------------------------------------------------------
	
	function PhotoGallery()
	{
		var photos = [];
		
		this.push = function(obj){photos.push(obj);}
		
		this.remove = function(obj){
			for (var i = 0; i < photos.length; i++) 
			{
				if (photos[i] == obj)
					photos.splice(i, 1);
			}
			this.update();
		}
		
		this.getIndex = function(obj)
		{
			for (var i = 0; i < photos.length; i ++)
			{
				if (obj == photos[i]) return i;
			}
			throw Error("����������� ������");
		}
		
		this.getSize = function(){return photos.length;}
		
		this.bubble = function(obj){
			for (var i = 0; i < photos.length; i ++)
				if (obj == photos[i]) break;
				
			photos.splice(i, 1);
			photos.push(obj);
			this.update();
		}
		
		this.update = function()
		{
			for (var i = 0; i < photos.length; i ++)
				photos[i].style.zIndex = i + 1;
		}
		
		this.inGallery = function(src)
		{
			for (var i = 0; i < photos.length; i++)
			{
				if (photos[i].getElementsByTagName("img")[0].src == src)
					return true;
			}
			return false;
		}
	}
	
	PhotoGallery.prototype.MAX_WIDTH = 800;
	PhotoGallery.prototype.MAX_HEIGHT = 800;
	
	PhotoGallery.prototype.addImage = function(anchor)
	{
		if (!anchor) throw Error("������� ������� � ������������ ����������� ����������");
		if (!anchor.href) throw Error("�� ������ URL �����������");
		
		var that = this;
		var origImage = new Image();
		
		if (this.inGallery(anchor.href)) return;
		
		var wrapper = document.createElement("div");
		wrapper.className = "original-photo";
		wrapper.appendChild(origImage);
		
		this.push(wrapper);
		
		if (document.addEventListener)
			origImage.addEventListener("load", originalConstruction, false);
		else if (document.attachEvent)
			origImage.attachEvent("onload", originalConstruction);
	
		origImage.src = anchor.href;
		origImage.style.cursor = "pointer";

		function originalConstruction()
		{
			if (origImage.width > that.MAX_WIDTH || origImage.height > that.MAX_HEIGHT)
			{ 
				window.open(origImage.src,"");
				return;
			}

			var icon = anchor.getElementsByTagName('img')[0];
			
			var c = {
				"x" : parseInt(getLeft(icon) + icon.width/2),
				"y" : parseInt(getTop(icon) + icon.height/2)
			};
		
			wrapper.style.position = "absolute";
			wrapper.style.zIndex = that.getIndex(wrapper) + 1;
			
			var pos = {
				"x" : parseInt(c.x - origImage.width/2),
				"y" : parseInt(c.y - origImage.height/2)
			};
			
						
			wrapper.style.left = pos.x + "px";
			wrapper.style.top = pos.y + "px";
		
			document.body.appendChild(wrapper);
			
			wrapper.onmousedown = function(e){
					drag(e, wrapper);
			}
			
			
			function getLeft(obj)
			{
					var r = 0;
					r = obj.offsetLeft
					obj = obj.offsetParent;
					
					if (obj.tagName != 'BODY' && obj.tagName != 'HTML')
						r += getLeft(obj);
					else
						r += obj.offsetLeft;
					return r;					
			}
			function getTop(obj)
			{
					var r = 0;
					r = obj.offsetTop;
					obj = obj.offsetParent;
					
					if (obj.tagName != 'BODY' && obj.tagName != 'HTML')
						r += getTop(obj);
					else
						r += obj.offsetTop;
					return r;					
			}				
		}

		function drag(event, element)
		{
			
			var event = event || window.event;
			var startPos = {x : element.offsetLeft, y : element.offsetTop};
		
			var dX = event.clientX - element.offsetLeft;
			var dY = event.clientY - element.offsetTop;
	
			if (document.addEventListener)
			{
				document.addEventListener("mousemove", moveHandler, true);
				document.addEventListener("mouseup", upHandler, true);
			}
			else if(document.attachEvent)
			{
				element.setCapture();
				element.attachEvent("onmousemove", moveHandler);
				element.attachEvent("onmouseup", upHandler);
				element.attachEvent("onlosecapture", upHandler);
			}
		
			if (event.stopPropagation) event.stopPropagation();
			else event.cancelBubble = true;
		
			if (event.preventDefault) event.preventDefault();
			else returnValue = false;
		
			element.style.cursor = "move";
		
			function moveHandler(e)
			{	
				var e = e || window.event;
		
				element.style.left = e.clientX - dX + "px";
				element.style.top = e.clientY - dY + "px";
			
				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
			}
			
			function upHandler(e)
			{
				var e = e || window.event;
			
				if (document.removeEventListener)
				{
					document.removeEventListener("mouseup", upHandler, true);
					document.removeEventListener("mousemove", moveHandler, true);
				}
				else if (element.detachEvent)
				{
					element.detachEvent("onlosecapture", upHandler);
					element.detachEvent("onmouseup", upHandler);
					element.detachEvent("onmousemove", moveHandler);
					element.releaseCapture();
				}
			
				if (e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
			
				if (element.offsetLeft == startPos.x && element.offsetTop == startPos.y)
				{
					var zindex = parseInt(element.style.zIndex);
					if (zindex < that.getSize())
					{
						that.bubble(element);
					}else{
						that.remove(element);
						element.parentNode.removeChild(element);						
					}
				}
				element.style.cursor = "pointer";
			}
		}

	}
	
	var photoGallery = new PhotoGallery();
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

		//��������� �� �������� ��������� ���� � ������� ������ �� ������� ��������
		//����� � ��� ����������� ������ ������������ � �������� �� ���� ���� ��� ����
		//
		//������ ������:
		//<a href="#" onclick="pageLink(this); return false;">�������� ������ �� ��� ��������</a>  
		function pageLink(obj)
		{
			if (obj.nextSibling.tagName == "TEXTAREA")
			{
				obj.parentNode.removeChild(obj.nextSibling);
				return;
			}
			
			var text = '<a href="' + location + '">' + document.title  + '</a>';
			var node = document.createElement('textarea');
			node.className = "pageLink";
			node.appendChild(document.createTextNode(text));
			obj.parentNode.insertBefore(node, obj.nextSibling);
		}
//--------------------------------------------------------------------------		
		// ������ E-mail �� ���� �������
		// ������ �� ����� vasya@mail.ru ����� ��������� ���
		// <a href="javascript:void pismo('vasya','mail.ru')">�������� ������ (����� ��� �� ����� ���� �������� � �������)</a> 
		function pismo()
		{
			if (!arguments[0] || !arguments[1]) alert('����������� ������ ����� �����');
			location = 'mailto:' + arguments[0] + '@' + arguments[1];
			return false;
		}
//--------------------------------------------------------------------------		
		// ��������� ������� �������� � ��������� (IE, FF, Opera)
		// � �������� �������� �� ��������� ������������ title ��������.
		// ��� ��������� ��������� (Safari) ��������� ��������� ��� ������ ������� ��� ��� ����������
		// 
		// ������:
		// <a href="/" onclick="return addBookmark(this)">�������� � ���������</a>
		//
		// ���� href=="/" �� ����������� ������� ��������, ���� href != "/" 
		// �� ����������� �������� � ������� ������� ������ � href.
		// ���� � ������ �������� �������� title �� �� ������������ � �������� �������� ��������,
		// ���� ��� ��� �� � �������� ����� �������� ������������ ��������� ���������.
		
 		function addBookmark(a){
 			if (!a) return false;
 			var title = a.getAttribute('title')  || document.title;
 			var href = (a.getAttribute('href') && a.getAttribute('href')!='/') || location.href;
 			 
			try{
 				window.external.AddFavorite(href, title);
 			}catch(e){
 				try{
 					window.sidebar.addPanel(title, href,"");
 				}catch(e){
 					if (window.opera && a){
 						if (!a.getAttribute('rel')) a.setAttribute('rel', 'sidebar');
 						a.setAttribute('href', location.href);
 						a.setAttribute('title', title);
 						return true;
 					}else{
 						alert("��� ������� �� ������������ ��� �������.\n�������, ����������, <Ctrl> + <D>\n����� �������� ���� � ���������.");
 						return false;
 					}
 					
 				}
 			}
 			return false;
 		}
 		
//-------------------------------------------------------------------------- 		
//	ValidForm(.js)
//	�������������� �������� ����� �����
// 	��������� �������������� - 31.01.2007
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------
/*
	������������� ������� �������������� �������� ����� �����:
	1. �� ���� <input> ��������� �����, ��������� �������� �� ������������ ���������� ���������� ��������� �������
			title: ��������� �������� ���� (����� �������������� ��� ������ ��������� �� ������).
            ���� ����������� ����� ������� �� ������������� ���� (input), ������� title �� ���������.			
	2. ��� ������� �������� ����� ���������� ������� ����� ����:
		<label id="���_�������" for="id_��������"></label>
	 ���:
		id_��������: id ��������, ��� �������� ������ ����������� ������� ��������
		���_�������: ������, �� �������� ����� �������������� ��������

	��������� ���� ��������:
		text:  ���� ����������� ������ �� ������� �����������, ��� ������� ������ �����������
		int:   ���� ����������� �� ������������ ���� int (������������� ��������)
		float: ���� ����������� �� ������������ ���� float (������� �������� ��������)
		email: ���� ����������� �� ������������ ����������� ������ email
		phone: ���� ����������� �� ������������ ����������� ������ ��������
           ���� +7(495)234-3472 ��� 151-68-55 ��� 8 (495) 7376047 �� � �.�.
		alph:  ���� ����������� �� ���������� �������� �������� �������� � ������������ (����������� �����, ��������� ����� ������� � �����, � ����� ����� (.) � ����� (-))
		select: ���� ����������� �� ����������� ���������� �������� ������ (option value != "")
		checkbox: ���� ����������� �� ������������
		radio: ���� ����������� �� ������������
		file: ���� ��� �������� ����� ����������� �� �������������

		��������: ������� "?" ��� "!" �������� ������������ � ���� �������!

		������� "?" ���������� ���������������� ���������� ����.
		������� "!" ����� ����� ���������� �������������� ���������� ����.
		�������� "!phone" - ������������ ���� ���� "���������� �����".
		�������� ":xx:yy" ��������� ������� ����������� � ������������ ����� ��������.
		�������� "!int:10" - ������������ �������� ���� ������ �� ����� 10 �������� (���).
         	"!text:10:300" - ������������ �������� ���� ������ �� ����� 10 � �� ����� 300 �������� (���������).
		������� "=" ����� ����� ����������, ��� ���� ������ ����� ��������, ������ ���������� ���� ����� ����� "=".
		�������� "!=pwd2" - ������������ ����, ������� ������ ����� ����� �� ��������, ��� � ���� pwd2.
		���� ������� ����������� � ������ ������ ��� �������,
		�� ���� ����������� �� ������������ ������� ������ ���� ��� �� ������.

		3.����� ���������� ������������ �� ������ �������� ����� (<input type="submit" />) :

		<input type="submit" value="���������" onclick="return validateForm(this.form, '��������� ������������ ���������� ��������� �����:');" />

		��� � ����� (��� �����, ������������ ����� get, � ��� �����, ������):

		<form id="search" method="get" action="/search/" onsubmit="return validateForm(this.form, '������� ��������� ������');">

		4.��� ����������� ������� � �������� � <head> ������� �������� ������:

		<script type="text/javascript" src="/js/ValidForm.js"></script>

		5.��������������� ����� ����� ���� ����� ��� ���������� � ������ ����������� � ����� ��� � <head> ��������:

		<script type="text/javascript">default_err_msg = '��������� ������������ ���������� ��������� �����:';</script>

		--------------------------------------------
		�� ���� �������� ������ ����� �������
		����� ���������� � �������� ��� �����-����
		���: +7 495 234-3472 ��� +7 495 151-6855
		admin(dog)uw.ru
		http://www.uw.ru
		����������� �� ��������!
		--------------------------------------------
*/
//--------------------------------------------------------------------------
	var err_msg = "";
	var err_obj = null;

	String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

	//������� ��������� ������ ����� ��������� ���������
	function clearClass(obj) 
	{
		var cn = obj.className;
		if (cn != '')
		{
			if (cn != 'error')
			{
				var tail = cn.search(' error');
				if (tail != -1)
				{
					obj.className = cn.slice(0, tail);
		  		}
	  		}
	  		else
	  		{
	 	  		obj.className = '';
	  		}
  		}
	}
	
	function setClass(obj) 
	{
		if (obj.className != '')
		{
		  	obj.className = obj.className + ' error';
  		}
  		else 
  		{
		obj.className = 'error';
  		}
	}
	
	function commitError(obj, msg)
	{
		err_obj = err_obj == null ? obj : err_obj;
		err_msg += '\n  '+msg;
	}

	function validateForm(f, err_text) 
	{
		// initialization
		err_msg=err_text;
		if (err_msg==null) err_msg = default_err_msg;
		err_obj = null;
		// actually validating
		var label = f.getElementsByTagName('label');
		for (var i=0; i<label.length; i++) 
		{
		
			if (!label[i].htmlFor) continue;
			// parsing rule
			var obj = f.elements[label[i].htmlFor];
			if (!obj) continue;
			var rule = label[i].id;
			var required = false;
			var prefix = rule.substr(0, 1);
			if (prefix == '!') required = true
			else if (prefix != '?') continue;
			rule = rule.substr(1, rule.length-1);
			var p = rule.split(':');
			rule = p[0];
			var minlength = (isNaN(parseInt(p[1]))) ? 0 : parseInt(p[1]);
			var maxlength = (isNaN(parseInt(p[2]))) ? 0 : parseInt(p[2]);

			// checking rule
			if (rule.substr(0, 1) == '=') 
			{
				clearClass(obj);
				var other_hand = rule = rule.substr(1, rule.length-1);
				if (required || (obj.value != '')) 
				{
					var obj2 = f.elements[other_hand];
					if (required && (obj.value == '')) 
					{
						commitError(obj, obj.title);
						setClass(obj);
					}
					else if ((obj2) && (obj.value != obj2.value))
					{
						commitError(obj2, obj2.title);
						setClass(obj2);
					}
				}
			}
			else
				switch (rule) {
					case 'text':
						clearClass(obj);
						var value = obj.value.trim();
						if (obj.value == '') {
							setClass(obj)
						};
					case 'select':
						var value = obj.value.trim();
						if (!required && (obj.value == '')) break;
						if ((value == '') || (value.length < minlength) || ((value.length > maxlength)&(maxlength != ''))) commitError(obj, obj.title);
						break;
					case 'checkbox':
						var item_ok = 0;
						for (var j=0; j<obj.length; j++) {
							if (obj[j].checked) item_ok++;
						}
						if (required && ((item_ok < minlength) || (item_ok == 0))) commitError(obj[0], obj[0].title);
						break;
					case 'radio':
						var selected_item = -1;
						for (var j=0; j<obj.length; j++) {
							if (obj[j].checked) selected_item = j;
						}
						if (required && (selected_item == -1)) commitError(obj[0], obj[0].title);
						break;
					case 'int':
						clearClass(obj);
						var value = parseInt(obj.value);
						if (!required && (obj.value == '')) break;
						if (isNaN(value) || (value != obj.value.trim()) || ((value == 0) && required) || (obj.value.trim().length < minlength)) {
							commitError(obj, obj.title);
							setClass(obj);
						}
						break;
					case 'float':
						clearClass(obj);
						var value = parseFloat(obj.value);
						if (!required && (obj.value == '')) break;
						if (isNaN(value) || (value != obj.value.trim()) || ((value == 0) && required)) {
							commitError(obj, obj.title);
							setClass(obj);
						}
						break;
					case 'email':
						clearClass(obj);
						var value = obj.value.trim();
						if (!required && (obj.value == '')) break;
						if (!/^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,6})+$/.test(value)) {
							commitError(obj, obj.title);
							setClass(obj);
						}
						break;
					case 'phone':
						clearClass(obj);
						var value = obj.value.trim();
						if (!required && (obj.value == '')) break;
						if (!/^(\+?\d{1,3}?(\s|-)*)?((\s*|-*|\(?)\d{2,3}(\s*|-*|\)?))?\d{3}(\s|-)*\d{2}(\s|-)*\d{2}$/.test(value)) {
							commitError(obj, obj.title);
							setClass(obj);
						}
						break;
					case 'alph':
						clearClass(obj);
						var value = obj.value.trim();
						if (!required && (obj.value == '')) break;
						if (!/^([a-zA-Z0-9.-])+$/.test(value)) {
							commitError(obj, obj.title);
							setClass(obj);
						}
						break;
					case 'file':
						clearClass(obj);
						var value = obj.value.trim();
						if (obj.value == '') {
							setClass(obj)
						};
				}
		}

		// checking the results
		if (err_obj != null) {
			alert(err_msg);
			err_obj.focus();
			return false;
		}	else {
			return true;
		}
	}

	function processForm(f) {
		if (validateForm(f)) f.submit();
	}


//--------------------------------------------------------------------------
//	COOKIE(.js)
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------
	// ������� ��������� �������� cookie
	// name - ��� cookie
	// value - �������� cookie
	// liveDay - ���� ����� cookie � ����
	// [expires] - ���� ��������� �������� cookie (�� ��������� - �� ����� ������)
	// [path] - ����, ��� �������� cookie ������������� (�� ��������� - ��������, � ������� �������� ���� �����������)
	// [domain] - �����, ��� �������� cookie ������������� (�� ��������� - �����, � ������� �������� ���� �����������)
	// [secure] - ���������� ��������, ������������ ��������� �� ���������� �������� �������� cookie

	function setCookie(name, value, liveDay, path, domain, secure) {
		var today=new Date();
		var expires=new Date(new Date(today.getTime()+liveDay*24*60*60*1000));
        var curCookie = name + "=" + escape(value) +
                ((expires) ? "; expires=" + expires.toGMTString() : "") +
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                ((secure) ? "; secure" : "")
                document.cookie = curCookie;
	}



	// ������� ������ �������� cookie
	// ���������� ������������� �������� ��� ������ ������, ���� cookie �� ����������.
	// name - ��� ������������ cookie

	function getCookie(name) {
        var prefix = name + "="
        var cookieStartIndex = document.cookie.indexOf(prefix)
        if (cookieStartIndex == -1)
                return null
        var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length)
        if (cookieEndIndex == -1)
                cookieEndIndex = document.cookie.length
		return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex))
	}



	// ������� �������� �������� cookie
	// name - ��� cookie
	// [path] - ����, ��� �������� cookie �������������
	// [domain] - �����, ��� �������� cookie �������������
	function deleteCookie(name, path, domain) {
        if (getCookie(name)) {
                document.cookie = name + "=" + 
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                "; expires=Thu, 10-Feb-82 00:00:01 GMT"
        }
	}

//--------------------------------------------------------------------------
//	ShowImage(.js)
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------

	function showImage(img_path, img_alt, img_w, img_h, resizable){
		if(!(resizable)){
			var resizable = 'yes, menubar=yes';
			var img_w = 600;
			var img_h = 600;
		}
		var winn = window.open('', '', 'resizable=' + resizable + ', width=' + img_w + ', height=' + img_h + ', left=50, top=50');

		winn.document.open();
		winn.document.writeln('<html>');
		winn.document.writeln('<head>');
		winn.document.writeln('<title>'+img_alt+'</title>');
		winn.document.writeln('</head>');
		winn.document.writeln('<body style="margin:0; padding:0;">');
		winn.document.writeln('<img src="'+ img_path + '" alt="'+img_alt+'" style="cursor: pointer;" onclick="window.close();" />');
		winn.document.writeln('</body>');
		winn.document.writeln('</html>');		
		winn.document.close();
	}

//  /templates/ru/ultersuite/xsl/block/gallery.xsl, /templates/ru/ultersuite/xsl/shop/goods_section/goods_card/page.xsl
//  Data 				18.03.2010 - 08.09.2010
//  Author	 			Panina Julia
//--------------------------------------------------------------------------

		function changeImage(l_img, src, srcBig, wm, hm, w, h, alt, desc, current, hglob){
			var img = document.getElementById('g' + l_img);
			var p = document.getElementById('t' + l_img);
			var ul = current.parentNode.parentNode;
			var li = ul.getElementsByTagName('li');
			img.src = srcBig;
			if(w != wm){
				width = w;
				height = h;
				img.name = src;
				img.style.cursor = 'pointer';
				big = true;
			}else{
				img.style.cursor = 'default';
				big = false;
			}
			img.style.width = wm + 'px';
			img.style.height = hm + 'px';
			img.style.marginTop = (hglob-hm)/2 + 'px';
			img.alt = alt;
			img.title = alt;
			for(i = 0; i < li.length; i++){
				li[i].className = '';
			}
			current.parentNode.className = 'active';
			if (p){
				var span = document.createElement("SPAN");
				var lastChild = p.lastChild;
				span.appendChild(document.createTextNode(desc));
				p.replaceChild(span, lastChild);
			}
		}
		function newWin(src){
			if(big){
				showImage(src, '', width, height, 'no');
			}
		}

		function scrollNext(galleryId, prevStep){
			$("#" + galleryId + " ul li:first-child").animate({marginLeft: '-100px'},500,function(){
				$("#" + galleryId + " ul li:first-child").appendTo("#" + galleryId + " ul").css({'marginLeft':0});
			});
		}
		function scrollPrev(galleryId, prevStep){
			$("#" + galleryId + " ul li:first-child").animate({marginLeft: '100px'},500,function(){
				$("#" + galleryId + " ul li:last-child").insertBefore("#" + galleryId + " ul li:first-child").end();
				$("#" + galleryId + " ul li").css({'marginLeft':0});
			});
		}

//----------------------------------------------------------windows-1251----
//	Title				Searh Tips
//  Date 				29 July 2008
//  Author	 			Alexey Generalov [webr@dical]
//  Copyright	 		Ulter West
//  Version				0.2
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------
//	1. 	Add to HTML:
//		into head section:					
//		<script type="text/javascritp" src="/path/to/searchtips.js" ></script>
//
//		into body section:
//		<div id="search_tips">&nbsp;</div>
//
//	2. 	Edit the "mainText" variable 
//		The script supported several keywords/expressions into `tips` variable:
//		{:query}			- Query from referrer page;
//		{:br}				- Create <br> tag;
//		{param1:param2}		- Create <a> tag with text `param1` and href attribute `param2`;
//		
//		var search_tips = "�� ������ �� ����� ����� \"{:query}\"?{:br}���� �� ���� �������� ������ ����������� ���, �� ����� {��������:/search/} �� �����, ���������� �� {�����:/sitemap/} ��� {��������:/mailsample/} ��������������.";
//--------------------------------------------------------------------------
	function getRusChars(num)
	{
		if (num > 0x1F && num < 0x80) return String.fromCharCode(num);
		num = parseInt(num); 

		if (num == 168) return '�';
		if (num == 184) return '�';
		if (num == 185) return '�';
		if (num < 192 || num > 256) return;
		
		var cp = new Array(
			'�', '�', '�', '�',	'�', '�', 
			'�', '�', '�', '�',	'�', '�', '�',
			'�', '�', '�', '�', '�', '�', '�',
			'�', '�', '�', '�',	'�', '�', '�',
			'�', '�', '�', '�',	'�',
			'�', '�', '�', '�',	'�', '�', 
			'�', '�', '�', '�',	'�', '�', '�',
			'�', '�', '�', '�', '�', '�', '�',
			'�', '�', '�', '�',	'�', '�', '�',
			'�', '�', '�', '�',	'�'
		);
		return cp[num-192];
	}
	
	function decodeURI(str)
	{
		var char_rxp = /%[A-F0-9][A-F0-9]/i
		var charCodeHex;
		var char;
		while (str.search(char_rxp) != -1)
		{
			charCodeHex = '0x' + String(str.match(char_rxp)).slice(1);
			char = getRusChars(charCodeHex);
			if (char == undefined) throw {source : 'function decodeURI()', message : 'Unsupported encoding', code: 0};
			str = str.replace(char_rxp, getRusChars(charCodeHex));
		}

		str = str.replace(/\+/g, ' ');
		return str;		
	}


	function getSearchQuery(uri)
	{
		var str = (uri == undefined) ? document.referrer : uri;

		var google = /(?:&|\?)q=([a-zA-Z%+~\-*_\.0-9]*)/g
		var yandex = /(?:&|\?)text=([a-zA-Z%+~\-*_\.0-9]*)/g
		var rambler = /(?:&|\?)words=([a-zA-Z%~+\-*_\.0-9]*)/g
		var mailru = /(?:&|\?)q=([a-zA-Z%+~\-*_\.0-9]*)/g
		var searchlive = /(?:&|\?)q=([a-zA-Z%+~\-*_\.0-9]*)/g

		if(str.indexOf("google.")!= -1)
		{
				str.match(google);
				str = RegExp.$1;
		}
		else if (str.indexOf("yandex.")!= -1)
		{
				str.match(yandex);
				str = RegExp.$1;
		}
		else if (str.indexOf("rambler.")!= -1)
		{
				str.match(rambler);
				str = RegExp.$1;
		}
		else if (str.indexOf("go.mail.ru")!= -1)
		{
				str.match(mailru);
				str = RegExp.$1;
		}
		else if (str.indexOf("search.live.com")!= -1)
		{
				str.match(searchlive);
				str = RegExp.$1;
		}
		
		else throw {source : 'function getSearchQuery()', message : 'Unsupported search engine'};
		
		try
		{
			str = decodeURI(str);
		}
		catch(e)
		{
			//alert("Error in " + e.source + " because " + e.message);
		}
		finally
		{
			try
			{
				str = decodeURIComponent(str);
			}
			catch(e)
			{
				//alert(e);
				throw {source : 'function getSearchQuery()', message : 'Unsupported encoding', code: 0};
			}
		}
		
		str = str.replace(/\+/g, ' ');
		
		return str;
	}
	
	function A(text, link)
	{
		var a = document.createElement('a');
		var node = document.createTextNode(text);
		a.appendChild(node);
		a.setAttribute('href', link);
		return a;
	}
	
	function searchTips()
	{
		var o = document.getElementById('search_tips');
		if (!o) return;
		
		var searchQuery;
		try
		{
			searchQuery = getSearchQuery();
		}
		catch(e)
		{
			//alert('������� �� ���������, ������ �� �������');
			return false;
		}
		
		var p = document.createElement('p');
		var sentence = /\{[^:]*:[^\}]*}/
		var preceding = /[^\{]*/;
	
		var text = search_tips;
		do
		{
			var preceding_text =  '' + text.match(preceding);
			var node = document.createTextNode(preceding_text);
			p.appendChild(node);
			text = text.replace(preceding, '');
			
			var next_sentence = '' + text.match(sentence);
			text = text.replace(sentence, '');

			next_sentence.match(/([^:{]*)(?::)([^:}]*)/);
						
			if (RegExp.$2 == 'query')
			{
				var  subnode = document.createTextNode(searchQuery);
				node = document.createElement('strong');
				node.appendChild(subnode); 
			}
			else if (RegExp.$2 == 'br')
			{
				var node = document.createElement("br");			
			}
			else 
			{
				node = A(RegExp.$1, RegExp.$2);
			}
			p.appendChild(node);
		}
		while(!!String(text.match(sentence) || text.match(preceding)));
		o.replaceChild(p, o.firstChild);
	}

//--------------------------------------------------------------------------
//	PrintMode(.js)
//	������������ �� ������ ��� ������
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------
// PrintModeCheck ��������� '&printmode' ��� '?printmode' � ����� ������ ��������
// �������� ���� � ����� ��� ������
// ������������ � start.tpl � index.tpl ��������� �������
//<a onclick="PrintModeCheck(document.location.href);" onmouseover="this.style.cursor='hand'">printmode</a>
//
	function PrintModeCheck(url){
		var page = url.split('#')[0];
  		if(url.indexOf('?',0) > 0){
    		document.location.href=page+'&printmode';
  		}else{
    		document.location.href=page+'?printmode';
  		}
	}

// PrintModeBack �������� 10 �������� � ����� ������ �������� '?printmode' ��� '&printmode'
// ��������� �� ������ ������ � ����� ����� 
// ������������ � print.tpl ��������� �������
//<a onClick="PrintModeBack(document.location.href);" onmouseover="this.style.cursor='hand'">sitemode</a>

	function PrintModeBack(url){
		if(url.indexOf('printmode',0) > 0){
    		document.location.href=url.substring(0, url.length - 10);
  		}else{
    		document.location.href=url;
  		}
	}

	
//--------------------------------------------------------------------------
//	addmesage(.js)
//	���������� ��������� �� ����� ���������� � � �����
//--------------------------------------------------------------------------
//	INSTRUCTION
//--------------------------------------------------------------------------
	var message;
	var forummessage;

	function addBoardMessage(sectionID){
	    message=window.open('/utf8/addboardmessage?sectionID='+sectionID,'message','resizable=yes,scrollbars=no,width=570,height=350');
   	 message.focus();
	}

	function addForumMessage(sectionID,parentID,lang){
    	forummessage=window.open('/utf8/addforummessage?sectionID='+sectionID+'&parentID='+parentID+'&parentLang='+lang,'forummessage','resizable=yes,scrollbars=no,width=570,height=360');
    	forummessage.focus();
	}

	function addForumMessage(sectionID,parentID){
	    forummessage=window.open('/utf8/addforummessage?sectionID='+sectionID+'&parentID='+parentID+'&parentLang=ru','forummessage','resizable=yes,scrollbars=no,width=570,height=360');
   		forummessage.focus();
	}

	function closeWindow(){
    	opener.message.close();
	}

//--------------------------------------------------------------------------
//	��������� ��������
//--------------------------------------------------------------------------

	function addLoadEvent(func) {
		var oldonload = window.onload;
		if (typeof window.onload != 'function') {
			window.onload = func;
		}else{
			window.onload = function() {
				if (oldonload){
				oldonload();
				}
      			func();
    		}
  		}
	}

	addLoadEvent(function() {
		searchTips();
	});
		
//--------------------------------------------------------------------------
//	shop(.js)
//	���������� ������� � ��������
//--------------------------------------------------------------------------
//  �������� �������
//--------------------------------------------------------------------------
//	����������
//--------------------------------------------------------------------------
//
//	1. ������ � ����� �������� index.tpl � ��. ��������� ��� 	
// 	<script type="text/javascript">
//		informer = new Informer();
//		Informer.prototype.QUANTITY_ID = 'informer_quantity';
//		Informer.prototype.SUMPRICE_ID = 'informer_sumprice';
//	</script>
//
//	2. ������� ������� informer.Update() �� xsl �������� ��� ���������� �������� 
//	���������� �������� � �������.
//			var o =	{
//			'SumPrice' : <xsl:value-of select="Basket/@total" />, 
//			'Quantity' : <xsl:value-of select="count(Basket/BasketEntry)"/>
//		}
//	
//	informer.Update(o);
//
//


function Informer(){
	var SumPrice = null;
	var Quantity = null;
}
Informer.prototype.Update = function(o){
	this.SumPrice = o.SumPrice;
	this.Quantity = o.Quantity;
	
	//���������� �������� ��������� �� ��������
	var q = document.getElementById(this.QUANTITY_ID);
	var s = document.getElementById(this.SUMPRICE_ID);
	
	if (q != undefined){
		q.replaceChild(document.createTextNode(this.Quantity), q.firstChild); 
	}

	if (s != undefined){
		s.replaceChild(document.createTextNode(this.SumPrice), s.firstChild); 
	}
}