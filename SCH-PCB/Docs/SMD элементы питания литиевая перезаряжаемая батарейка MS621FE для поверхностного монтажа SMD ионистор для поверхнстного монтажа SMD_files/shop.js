//----------------------------------------------------------windows-1251----
//	Title				Shop scripts package
//  Date 				21.02.2011
//  Author	 			Alexey Generalov aka webradical
//  Copyright	 		Ulter West
//  Version				0.2.2
//	Engine				Dojo (dojotoolkit.org)
//--------------------------------------------------------------------------
//	INSTRUCTION [ru]
//--------------------------------------------------------------------------
//  Корзина (виджеты корзины и информер корзины)
//--------------------------------------------------------------------------
//	Updates:
//		-- 2011-10-03 - Обновлена функция _formatPrice. 
//						Исправлен баг с точкой  на конце суммы, если дробная часть одни нули.   
//		-- 2011-12-23 - Добавлена функция пересчета общей суммы заказа в разных валютах {totalPriceUSD},{totalPriceRUR},{totalPriceEUR}
//						
// 


dojo.require("dojo.cookie");
var basket = (function(){
	
	var cache = {};
	var domLinks = {};
	var _clearCodes = {};
	var lang = (location.pathname.match(/^(?:\/)(ru|en|el)(?:\/)/),RegExp.$1?"":RegExp.$1); 
	
	var _isEmpty = function(obj){
	    for (var prop in obj)
	        if (obj.hasOwnProperty(prop))
	            return false;
	    return true;
	}
	
	//Validate basket entries
	var _validateAndTransformToQuery = function(entries){
		var queryObj = {};
		if (!entries || _isEmpty(entries)) return;
		if (!(entries instanceof Array)) entries = [entries];

		for (var i = 0 ; i < entries.length; i++){
			var test = entries[i];
			var mix = {};
			
			var idProp = "articul";
			if (test["articul"] == null)
				if (test["id"] != null)
					idProp = "id";
				else
					continue;

			if (test["q"]==null)
				test["q"]=0;
			if (parseFloat(test["q"]) < 0)
				continue;
			
			if (test.hasOwnProperty("explicitSet"))
				mix["e["+i+"]" + "explicitSet"] = "";

			mix["e["+i+"]" + idProp] = test[idProp];			
			mix["e["+i+"]q"] = test["q"];
			dojo.mixin(queryObj, mix)
		}
		return queryObj;
	}
	
	var _parseTpl =  function(template, repData){
		for (var i in repData)
			template = template.replace("{"+i+"}", repData[i]);
		return template;
	};
	
	
	var _updateCache = function(newcache){
		dojo.mixin(cache, newcache);
		_storeCacheToCookie();
		dojo.publish("/shop/basket/cache/update/");
		if (cache.entries && cache.entries.length == 0)
			dojo.publish("/shop/basket/empty/");
		dojo.hitch(this,_renderWidgets)();
	}
	
	var _communicate = function(arg, callback){
		//if (!arg) return;
		var query = {};
		if (!_isEmpty(arg)){
			dojo.mixin(query,_validateAndTransformToQuery(arg));
		}
		
		if (domLinks.basket)
			dojo.mixin(query, {callback:"entries,attributes,rate"});
		else if (domLinks.informer)
			dojo.mixin(query, {callback:""});
	
		if (_isEmpty(query)) 
			return;
		
		dojo.mixin(query, {"lang": cache.lang ? cache.lang : lang})
		
		dojo.xhrGet({
			handleAs:"json",
			url: "/shop/basket/controller/",
			load :  function(data){
				dojo.mixin(data.callback, {"lang": data.lang});
				dojo.hitch(_that,_updateCache(data.callback));
				if (callback && typeof callback == "function")
					callback();
			},
			content : query,
			error: function(arg){
				//error handle
			}
		});
	};
	
	
	_renderWidgets = function(){
		if (domLinks.basket)
			dojo.hitch(_that, _basketRender)();
	
		if (domLinks.informer)
			dojo.hitch(_that,_informerRender)();
		
		dojo.publish("/shop/widgets/rendered/");
	}
	
	_informerRender = function(informerData){
		var template = cache.positions > 0 ? this.pref.i18n[cache.lang].informer.fullTpl : this.pref.i18n[cache.lang].informer.emptyTpl;
		domLinks.informer.innerHTML = _parseTpl(template, {"positions" : cache.positions,"lv": cache.lv,"totalPrice": _formatPrice(cache.totalPrice)});
	}

	var _renderCodeFor = function(procName, entry, entryIndex){
		switch(procName.split(".")[0]){
			case "number":
				return ""+(entryIndex+1);
			case "name":
			case "articul":
			case "partno":
			case "description":
				return entry.goods[procName];
			case "attributes":
					return entry.goods.attributes[procName.split(".")[1]] || "";
			case "quantity":
				return " class=\"quantity\" entry=\""+entryIndex+"\" value=\""+entry.quantity+"\" ";
			case "price":
				return ""+_formatPrice(entry.price);
			case "sumprice":
				return ""+_formatPrice(entry.price*entry.quantity);
			case "btnremove":
				return " class=\"btnremove\" entry=\""+entryIndex+"\" ";
			case "warehousecss":
				return " class=\"" + this.pref.i18n[cache.lang].warehouse.cssSubst[this.pref.i18n[cache.lang].warehouse.valueSubst(entry.goods.quantity, entry.quantity)] + "\"";
			case "warehouse":
				var substValue = this.pref.i18n[cache.lang].warehouse.valueSubst(entry.goods.quantity,entry.quantity)
				return this.pref.i18n[cache.lang].warehouse.contentSubst[substValue].replace("{d}", substValue);
			default:
				return ""
		}
	}
	
	var _basketRender = function(){
		var basketNode = domLinks.basket;
		var entries = cache.entries;

		if (!entries || _isEmpty(entries))
		{
			basketNode.innerHTML = _parseTpl(this.pref.i18n[cache.lang].basket.emptyTpl, {});
			return;
		}

		var fullTpl = this.pref.i18n[cache.lang].basket.fullTpl;
		if (!fullTpl) throw new Error("Basket full template is not defined!");
		var rowTpl = null;
		fullTpl = fullTpl.replace(/{{(([^}]|}(?!}))+)}}/, function(){rowTpl = arguments[1];return "{basket}";});
		if (rowTpl==null) throw new Error("Basket row template defined with errors");

		var basketRows= "";
		var en = entries.length;
		for (var i = 0; i < en; i++)
		{
			var row = rowTpl;
			row = row.replace(/{([a-zA-Z.0-9а-яА-Я_]+)}/g, function(){
				// this здесь не тот
				var procName = arguments[1];
				return procName == "number" ? i+1 : dojo.hitch(_that,_renderCodeFor)(procName,entries[i],i);
			});
			basketRows += row;
		}
		basketNode.innerHTML=_parseTpl(fullTpl, {
			"basket": basketRows, 
			"totalPrice":_formatPrice(cache.totalPrice),
			"totalPriceUSD": _formatPrice(cache.totalPrice / parseFloat(cache.rate.USD)),
			"totalPriceRUR":_formatPrice(cache.totalPrice / parseFloat(cache.rate.RUR)),
			"totalPriceEUR":_formatPrice(cache.totalPrice / parseFloat(cache.rate.EUR))
		});
	}
	
	_validateQuantity = function(e){
		node = e.target;
		node.value = node.value.replace(/\D/g,'');
		var key =  node.getAttribute("entry");
		if (_clearCodes[key])
			window.clearTimeout(_clearCodes[key]);
		_clearCodes[key] = window.setTimeout(dojo.hitch(this, _quantityHandler, node),this.pref.timeout);
	}

	_quantityHandler = function(node){
		var entryIndex = parseInt(node.getAttribute("entry"));
		if (!isNaN(entryIndex) && cache.entries[entryIndex]){
			var newq = parseInt(node.value);
			if (cache.entries[entryIndex].quantity != newq)
				_communicate({"id":cache.entries[entryIndex].goods.id, "q":newq, "explicitSet": "true"});
		}
	}
	
	var _removeEntry = function(e){
		var node = e.target;
		if (node.className != "btnremove")
			return;
		var entryIdx=parseInt(node.getAttribute("entry"));
		if (!isNaN(entryIdx) && (goods=cache.entries[entryIdx].goods))
			_communicate({"id":goods.id});
	} 

	var _storeCacheToCookie = function(){
		dojo.cookie("entriescache", dojo.toJson(cache), {
			expires : 1,
			path : "/"
		});
	}
	
	var _loadCacheFromCookie = function(){
		if (buf = dojo.fromJson(dojo.cookie("entriescache")))
			cache = buf; 
	}
	
	_formatPrice = function(x){
		return parseFloat(x).toFixed(_that.pref.decimal).replace(/\.?0+$/,'');
	}
	
	var _that =	{
		addGoods : function(arg, callback){
			if (!arg) return;
			_communicate(arg, callback);
		},
		pref: {
			basketId: "basket",
			informerId: "informer",
			cookieBuffer: false,
			decimal: 4,
			timeout : 1200,
			i18n: {
				ru : {
					basket : {
						fullTpl : "<table><thead><tr><th class=\"number\">№</th><th class=\"name\">Наименование</th><th class=\"articul\">Артикул</th><th class=\"price\">Цена</th><th class=\"quantity\">Количество</th><th class=\"sumprice\">Сумма</th><th class=\"btnremove\">Удалить</th></tr></thead><tbody>{{<tr><td class=\"number\">{number}</td><td class=\"name\">{name}</td><td class=\"articul\">{articul}</td><td class=\"price\">{price}</td><td class=\"quantity\"><input type=\"text\" title=\"Количество\" {quantity} /></td><td class=\"sumprice\">{sumprice}</td><td class=\"btnremove\"><img alt=\"Удалить\" src=\"/images/delete.gif\" {btnremove} style=\"cursor: pointer;\" title=\"Удалить\" /></td></tr>}}</tbody></table><p>Общая сумма заказа: {totalPrice} долларов</p>",
						emptyTpl: "<p>Корзина пуста</p>"
					},
					informer : {
						fullTpl: "<p>В корзине товаров {positions} на сумму {totalPrice} долларов.</p><p><a href=\"/shop/basket/\">Перейти в корзину</a></p>",
						emptyTpl: "<p>Корзина пуста</p>"
					},
					//Остатки на складе
					warehouse: {
						// Вычисляем значение для замены 
						valueSubst : function(wrhQ, entryQ){
							return wrhQ;
						},
						// Замена для контента
						contentSubst : {
							"-1" : "Неограничено",
							"0" : "Нет на складе",
							"1" : "{d}"
						},
						// Замена для классов 
						cssSubst : {
							"-1" : "warehouseInfinity",
							"0" : "warhouseNone",
							"1" : "warhouseNormal"
						}
					}
				},
				//TODO:поменять значения
				en : {
					basket : {
						fullTpl : "<table><thead><tr><th class=\"number\">№</th><th class=\"name\">Наименование</th><th class=\"articul\">Артикул</th><th class=\"price\">Цена</th><th class=\"quantity\">Количество</th><th class=\"sumprice\">Сумма</th><th class=\"btnremove\">Удалить</th></tr></thead><tbody>{{<tr><td class=\"number\">{number}</td><td class=\"name\">{name}</td><td class=\"articul\">{articul}</td><td class=\"price\">{price}</td><td class=\"quantity\"><input type=\"text\" title=\"Количество\" {quantity} /></td><td class=\"sumprice\">{sumprice}</td><td class=\"btnremove\"><img alt=\"Удалить\" src=\"/images/delete.gif\" {btnremove} style=\"cursor: pointer;\" title=\"Удалить\" /></td></tr>}}</tbody></table><p>Общая сумма зказа: {totalPrice} долларов</p>",
						emptyTpl: "<p>Корзина пуста</p>"
					},
					informer : {
						fullTpl: "<p>В корзине товаров {positions} на сумму {totalPrice} долларов.</p><p><a href=\"/shop/basket/\">Перейти в корзину</a></p>",
						emptyTpl: "<p>Корзина пуста</p>"
					},
					//Остатки на складе
					warehouse: {
						// Вычисляем значение для замены 
						valueSubst : function(wrhQ, entryQ){
							return wrhQ;
						},
						// Замена для контента
						contentSubst : {
							"-1" : "Неограничено",
							"0" : "Нет на складе",
							"1" : "{d}"
						},
						// Замена для классов 
						cssSubst : {
							"-1" : "warehouseInfinity",
							"0" : "warhouseNone",
							"1" : "warhouseNormal"
						}
					}
				}
			}
		}
	}
	
	dojo.addOnLoad(dojo.hitch(_that, function(){
		//определить используемые виджеты
		domLinks.basket=dojo.byId(this.pref.basketId);
		domLinks.informer=dojo.byId(this.pref.informerId);
		
		if (this.cookieBuffer)
			_loadCacheFromCookie();
		
		// устанавливаем обработчики изменение количества и удаление товара
		if (domLinks.basket)
		{
			dojo.connect(domLinks.basket, "onkeyup", this, _validateQuantity);
			dojo.connect(domLinks.basket, "onclick", this, _removeEntry);
		}
		
		if (this.cookieBuffer && !_isEmpty(cache) && (!domLinks.basket || cache.entries)){
			//Если кеш успешно загружен из cookies 
			//запустить рендеринг виджетов
			dojo.hitch(this,_renderWidgets)();
			return;
		}
		
		// запускаем обновление кеша
		// парсинг виджетов должен начатся 
		//автоматически по завершении обновления кеша
		if (domLinks.basket || domLinks.informer)
			_communicate();
	}));
	

	//Запустить рендеринг виджетов при обновлении кеша
	return _that;
	
})();
//--------------------------------------------------------------------------
//	Виджет курсов валют
//--------------------------------------------------------------------------
		dojo.addOnLoad(function(){
			var widget = dojo.query(".ratesWidget")[0];
			if (!widget) return;
		
			var CONTROLLER_RATE_URL="/controller/shop/rates/";
			var DECIMAL = 4;
			//Задержка между редактированием и попыткой отправить на сервер
			var ECHO_MS = 3000;
			var relative="RUR";
			var rates ={};
			var editable = widget.className.indexOf("editable") != -1;
			var timeoutId = null;
			var ajaxProcessing = false;
						
			//Обновить информацию о курсах валюты
			getRates(relative);
			
			function getRates(forLv){
				dojo.xhrGet({
					url: CONTROLLER_RATE_URL + "?out=json&relLv="+forLv,
					handleAs: "json",
					load: processingResponse
				});
			}
			
			function processingResponse(response){
					if (!response) return; 
					rates = {};
					var data = response.data;
					relative = response.relativeLv;

					for (var i in data)
						rates[data[i].id] = parseFloat(data[i].rate).toFixed(4);
						
					renderWidget();
			}
			
			function renderWidget(){
				widget.innerHTML="";
				//renderRatePanel();
				renderRateTbl();
			}

			function renderRateTbl(){
				var html = "<table><tbody>";
				for (var i in rates){
					html += "<tr>";
					html += '<td><span id="rel'+i+'" class="control'+(relative==i?" selected":"")+'">'+i+'</span></td>';
					
					if (editable && i != relative){
						html += '<td><input lv="'+i+'" type="text" value="'+formatValue(rates[i])+'" /></td>';
					}else{
						html += "<td>"+formatValue(rates[i])+"</td>";
					}
					
					html += "</tr>";
				}
				html+= "</tbody>"
				var ratesTbl = dojo.place(html, widget);
				dojo.connect(ratesTbl, "onkeyup", setRateHandler);
				dojo.connect(ratesTbl, "onclick", relativeLvChange);
			}
			
			function formatValue(value){
				value = parseFloat(value).toFixed(DECIMAL);
				value = (""+value).replace(/0+$/g,"");
				value = (""+value).replace(/\.$/g,"");
				return value;
			}
			
			function setRateHandler(e){
				var node = e.target;
				if (!node.tagName.toUpperCase()=="INPUT" || ajaxProcessing)
					return;
				
				node.value = node.value.replace(/,/g, ".");
				node.value = node.value.replace(/[^0-9.]/g, "");
				node.value = node.value.replace(/(\.\.)$/g, "");
				node.value = node.value.replace(/^(\d+)\.(\d+)(\.\d?)/, "$1.$2");
				
				var lvId = node.getAttribute("lvId");
				lvId = node.getAttribute("lv");
				if (rates[lvId] != parseFloat(parseFloat(node.value)))
				{
					rates[lvId] = parseFloat(node.value);
					if (timeoutId != null)
						clearTimeout(timeoutId);
					timeoutId = setTimeout(commitRates, ECHO_MS);
				}
			}
			
			function commitRates(){
				clearTimeout(timeoutId);
				ajaxProcessing = true;
				var clon = dojo.clone(rates);
				clon.out = "json";
				clon.relLv=relative;
								
				dojo.xhrPost({
					url : CONTROLLER_RATE_URL,
					content : clon,
					handleAs: "json",
					load: function(resp){ajaxProcessing=false;processingResponse(resp)} 
				});
			}
			
			
			function relativeLvChange(e){
				if (e.target.tagName.toUpperCase() != "SPAN")
					return;
				var node = e.target;
				var newRel = node.getAttribute("id").replace("rel", "");
				if (newRel == relative)
					return;
					
				dojo.removeClass(dojo.byId("rel" + relative), "selected")
				dojo.addClass(dojo.byId("rel" + newRel), "selected")
				convertRates(newRel);
				relative = newRel;
				renderWidget();
			}
			
			function convertRates(lv){
				var oldrates = dojo.clone(rates); 
				for (var i in rates)
				{
					rates[i] = oldrates[i]/oldrates[lv];
				}
			}
			
		});
