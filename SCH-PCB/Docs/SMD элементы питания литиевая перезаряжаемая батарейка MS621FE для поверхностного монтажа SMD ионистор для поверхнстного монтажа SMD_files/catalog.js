	//��������� ������� ��� �����
	basket.pref.decimal = 2;
	basket.pref.i18n.ru.basket.fullTpl = "<table><thead><tr><th class=\"number\">�</th><th class=\"name\">������������</th><th class=\"articul\">�������</th><th class=\"price\">����</th><th class=\"quantity\">����������</th><th class=\"sumprice\">�����</th><th class=\"warehouse\">�������</th><th class=\"btnremove\">�������</th></tr></thead><tbody>{{<tr {warehousecss}><td class=\"number\">{number}</td><td class=\"name\">{name}</td><td class=\"articul\">{articul}</td><td class=\"price\">{price}</td><td class=\"quantity\"><input type=\"text\" title=\"����������\" {quantity} /></td><td class=\"sumprice\">{sumprice}</td><td class=\"warehouse\">{warehouse}</td><td class=\"btnremove\"><img alt=\"�������\" src=\"/images/delete.gif\" {btnremove} style=\"cursor: pointer;\" title=\"�������\" /></td></tr>}}</tbody><tfoot><tr><td colspan=\"5\">����� ����� ������: </td><td colspan=\"3\">{totalPriceRUR} ������ ({totalPrice} ��������)</td></tr></tfoot></table>";
	basket.pref.i18n.ru.warehouse = {
			contentSubst : {
				"-1" : "<img src=\"/images/but_green.png\" alt=\"���� �� ������\" title=\"���� �� ������\">",
				"0" : "<img src=\"/images/but_red.png\" alt=\"��� �� ������, ��� ���������� � ���������\" title=\"��� �� ������, ��� ���������� � ���������\">",
				"-2" : "<img src=\"/images/but_yellow.png\" alt=\"��� �� ������ � ������ ����������\" title=\"��� �� ������ � ������ ����������\" >"
			},
			cssSubst : {
				"-1" : "white",
				"0" : "red",
				"-2" : "yellow"
			},
			valueSubst : function(wrhQ, entryQ){
				if (wrhQ == 0)
					return 0;
				return wrhQ > 0 ? (wrhQ-Math.abs(entryQ) >= 0)?-1:-2 : -1;
			}
	}

	InlineMsgBox.prototype.domLinks = [];
	InlineMsgBox.prototype.findAndUpdate = function(obj, action){
		if (action == "add")
		{
			this.domLinks.push(obj);
			return;
		}
		
		var idx;
		var i = this.domLinks.length;
		while(i >= 0){
			if (obj==this.domLinks[i])
				idx = i;
			i--;
		}
		
		if (idx == undefined)
			return -1;
		
		if (action == "remove"){
			this.domLinks.splice(idx, 1);
		}
		
		return idx;
	}

	

	
	function InlineMsgBox(obj){
		if (this.findAndUpdate(obj) != -1){
			return;
		}
		
		this.findAndUpdate(obj, "add");
		
		var msgBox = dojo.create("div", {
			className: "MsgBox",
			innerHTML : "<p><img src=\"/images/ajax-loader.gif\"><span>���������� ������ � �������...</span></p>"
		}, obj.parentNode);
		
		obj.parentNode.style.backgroundColor = "#D5F0F8";
		
		var _that = this;
		var link = dojo.subscribe("/shop/basket/cache/update/", function(){
			dojo.unsubscribe(link);
			msgBox.innerHTML = "<p>����� �������� � �������</p>";
			dojo.animateProperty({
				node : msgBox.parentNode,
				duration : 1000,
				properties : {
					backgroundColor : {
						start : "#D5F0F8", 
						end : "#f2fafc"
					}
				},
				onEnd : function(){
					dojo.destroy(msgBox);
					_that.findAndUpdate(obj, "remove");
				},
				onBegin : function(){
					dojo.fadeOut({
						node:msgBox.firstChild, 
						duration: 900
					}).play();
				}
			}).play();
		});	
	}
	
	
	function addGoodsByArticul(obj){
		var wrapper = obj.parentNode.parentNode.parentNode.parentNode;
		var inputs =  wrapper.getElementsByTagName("input");
		var add = [];
		var send = false;
		for (var i = 0; i < inputs.length; i++){
			q = parseInt(inputs[i].value);
			if (q > 0){
				add.push({
					"articul" : inputs[i].getAttribute("articul"),
					"q" : q,
					"explicitAdd" : true
				});
				send = true;
			}
		}
		
		if (send){
			basket.addGoods(add);
			//registerMessageBox(obj);
			new InlineMsgBox(obj);
		}
		
	}
	
	//���������� ���������� �� �������� � ������
	dojo.addOnLoad(function(){
		var hash = {};
		var url="";
		var articul;
		dojo.query(".goodsByArticul input.quantity").forEach(function(x){
			articul = x.getAttribute("articul").replace(/\s[a-zA-Z0-9�-��-� ]+$/,'');
			hash[articul] = x.parentNode.nextSibling;
			url += articul + ",";
		});
		url = url.replace(/,$/,'');

		var setPic = function(x, q){
			q = parseInt(q);
			if (q == 0)
			{
				dojo.addClass(x, "notInStore")
				x.setAttribute("title", "��� �� ������, ��� ���������� � ���������");
			}
		}
		
		dojo.xhrGet({
			"url": "/controller/shop/goods/?articul=" + encodeURIComponent(url),
			handleAs : "json",
			load : function(data){
				for (var i in data.goods)
					if (hash[data.goods[i].articul]){
						setPic(hash[data.goods[i].articul],data.goods[i].quantity);
						delete hash[data.goods[i].articul];
					}
				
				for (var j in hash)
					setPic(hash[j], 0);
			}
		});
	});
	