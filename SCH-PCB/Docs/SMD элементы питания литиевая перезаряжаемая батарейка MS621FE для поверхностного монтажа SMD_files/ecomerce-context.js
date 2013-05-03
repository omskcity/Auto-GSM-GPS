(function(window) {
    'use strict';

    var shopList = [
    'ozon.ru',
    'kupivip.ru',
    'sotmarket.ru',
    'uti-note.ru',
    'citilink.ru',
    'vasko.ru',
    'fifty.ru',
    'techhome.ru',
    'boutique.ru',
    'top-stiop.ru',
    'electroklad.ru',
    '4tochki.ru',
    'dostavka.ru',
    'pult.ru',
    'euromaxx.ru',
    'bestwatch.ru',
    'digitalshop.ru',
    'bigtv.ru',
    'sapato.ru',
    'baimusic.ru',
    'clockshop.ru',
    'sotovikmobile.ru',
    'store-apple.ru',
    'allcables.ru',
    'activsport.ru',
    'ap.tcomp.ru',
    'shina-oniine.ru',
    'compu.ru',
    'ditel.ru',
    'textiletorg.ru',
    'xcom-shop.ru',
    'komfortbt.ru',
    'kns.ru',
    'e96.ru',
    'avtogsm.ru',
    'nord24.ru',
    'shoptoto.ru',
    'allforauto.ru',
    'xwatt.ru',
    'darom.ru',
    'stoi-zakazov.ru',
    'kofe-kofe.ru',
    'avsaie.ru',
    'cifrocity.ru',
    'uppstore.ru',
    'toool.ru',
    'z-store.ru',
    'via-sport.ru',
    'becompact.ru',
    'darimnastroenie.ru',
    'planetashop.ru',
    'koiomenka.ru',
    'telegorod.ru',
    'nevoobrazimo.ru',
    'cifrus.ru',
    'kniaa.ru',
    'technomart.ru',
    'mobilmarket.ru',
    'tehnoman.ru',
    'smartphoto.ru',
    'xcom-dom.ru',
    'techmarkets.ru',
    'domosti.ru',
    'shiny-diski.ru',
    'iphone61.ru',
    'zonadostupa.ru',
    'tehnozona.spb.ru',
    'mobilmax.ru',
    'rtovara.ru',
    'sprnter.ru',
    'bestmemory.ru',
    'eafisha.ru',
    'detsky-mir.ru',
    'eurosuvenr.ru',
    '100koies.ru',
    'mirinfo.ru',
    'naviglon.ru',
    'meaazin-bt.ru',
    'carrida.ru',
    'fotolit.ru',
    'gamestation.ru',
    '6cotok.ru',
    'dostavka-podarkov.ru',
    'profit-shoo.ru',
    'shop66.ru',
    'daniika.com',
    'kitana.ru',
    'sly.ru',
    'housebt.ru',
    'videoiar.net',
    'playback.ru',
    'yo-sound.ru',
    'ampi.ru',
    'pum-pu.ru',
    'makitapro.ru',
    'cddiski.ru',
    'soskiada.ru',
    'playin.ru',
    'aroma-butik.ru',
    'technozal.ru'];

    /**
     * Map of patterns for find name
     * @type {{}}
     */
    var patterns = {

    };

    var sendStat = function(stat, name) {
        window.postMessage({ type: "MARKET_CONTEXT_STAT", stat: stat, name: name }, "*");
    };

    var sendGaStat = function(args) {
        window.postMessage({ type: "MARKET_CONTEXT_GA", args: args }, "*");
    };

    /*
     * Lightweight JSONP fetcher
     * Copyright 2010-2012 Erik Karlsson. All rights reserved.
     * BSD licensed
     *
     * Usage:
     *
     * JSONP.get( 'someUrl.php', {param1:'123', param2:'456'}, function(data){
     *   //do something with data, which is the JSON object you should retrieve from someUrl.php
     * });
     */
    var JSONP = (function() {
        var counter = 0, head, config = {};

        function load(url, pfnError) {
            var script = window.document.createElement('script'),
                done = false;
            script.src = url;
            script.async = true;

            var errorHandler = pfnError || config.error;
            if (typeof errorHandler === 'function') {
                script.onerror = function(ex) {
                    errorHandler({url: url, event: ex});
                };
            }

            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;
                    script.onload = script.onreadystatechange = null;
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }
            };

            if (!head) {
                head = window.document.getElementsByTagName('head')[0];
            }
            head.appendChild(script);
        }

        function encode(str) {
            return encodeURIComponent(str);
        }

        function jsonp(url, params, callback, callbackName) {
            var query = (url || '').indexOf('?') === -1 ? '?' : '&', key;

            callbackName = (callbackName || config['callbackName'] || 'callback');
            var uniqueName = 'metabar_' + callbackName + "_json" + (++counter);

            params = params || {};
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    query += encode(key) + "=" + encode(params[key]) + "&";
                }
            }

            window[ uniqueName ] = function(data) {
                callback(data);
                try {
                    delete window[ uniqueName ];
                } catch (e) {
                }
                window[ uniqueName ] = null;
            };

            load(url + query + callbackName + '=' + uniqueName);
            return uniqueName;
        }

        function setDefaults(obj) {
            config = obj;
        }

        return {
            get: jsonp,
            init: setDefaults
        };
    }());
    // eo JSONP

    /**
     * Return pruduct name if http://schema.org/Product exist on page
     * @returns {String|null} name or null if no schema or name
     */
    var getProductNameBySchema = function() {
        var name = null;
        // dont return name if we in list of items
        var schemaEls = window.document.querySelectorAll('[itemtype="http://schema.org/Product"],[itemtype="http://data-vocabulary.org/Product"]');
        if (schemaEls.length == 1) {
            var schemaEl = schemaEls[0];
            var nameEls = schemaEl.querySelectorAll('[itemprop=name]');
            if (nameEls.length) {
                name = nameEls[0].innerText;

                // some shops separate brand and item name (http://www.xcom-shop.ru/jabra_street_ii_white_243705.html)
                var brandEl = schemaEl.querySelector('[itemprop=brand]');
                if (brandEl) {
                    name = brandEl.innerText + ' ' + name;
                }

            }
        }
        return name;
    };


    /**
     * Return pruduct price if http://schema.org/Product exist on page
     * @returns {Number} price or -1 if no schema or price
     */
    var getProductPriceBySchema = function() {
        var price = -1;
        var schemaEl = window.document.querySelector('[itemtype="http://schema.org/Offer"],[itemtype="http://data-vocabulary.org/Product"]');
        if (schemaEl) {
            var priceEl = schemaEl.querySelector('[itemprop=price]');
            if (priceEl) {
                price = window.Number(priceEl.innerText || priceEl.getAttribute('content'));
                if (price != price) {
                    price = -1;
                }
            }
        }
        return price;
    };

    /**
     * Return hostname without 'www.'
     * @returns {*}
     */
    var getHostName = function() {
        var hostname = window.location.hostname;
        if (/^www./.test(hostname)) {
            hostname = hostname.slice(4);
        }
        return hostname;
    };

    /**
     * Find name by CSS selector
     * @returns {String|null} name or null if no exist
     */
    var getNameBySelector = function() {
        var name = null;
        var selector = patterns[getHostName()];
        if (selector) {
            var el = window.document.querySelector(selector);
            if (el) {
                name = el.innerText;
            }
        }

        return name;
    };

    /**
     * Show small popup
     */
    var showInfoPopup = function() {
        sendStat('showPopup');
        var popup = window.document.getElementById('sitebar_popover');
        popup.style.display = 'block';
    };

    /**
     * Hide small popup
     */
    var hideInfoPopup = function() {
        var popup = window.document.getElementById('sitebar_popover');
        popup.style.display = 'none';
    };

    /**
     * Show notify about product on page top
     * @param data
     */
    var showNotify = function(data) {
        var sitebarCss = '.sitebar{font:11px/23px Tahoma,Arial,sans-serif;min-width:850px;overflow:hidden;position:relative;border:1px solid gray;background:url(http://design.metabar.ru/i/partners/drweb/sitebar/sitebar-ff.png) 0 0 repeat-x;position:fixed;top:0;left:0;right:0}.sitebar,.sitebar__close,.sitebar__cnt,.sitebar-label,.sitebar-button,.sitebar-button__cnt,.sitebar-button__l,.sitebar-button__r{height:26px}.sitebar__logo,.sitebar__close,.sitebar-button__l,.sitebar-button__r{display:block;overflow:hidden}.sitebar__logo{position:absolute;top:4px;left:4px;width:28px;height:22px;background:url(http://design.metabar.ru/i/partners/drweb/sitebar/logo-ff.png) 0 0 no-repeat}.sitebar__close{position:absolute;right:2px;text-indent:-9999px;top:0;width:22px;background:url(http://design.metabar.ru/i/partners/drweb/sitebar/icon-close-ff.png) 0 0 no-repeat;z-index:100}.sitebar__close,.sitebar__question,.sitebar-button,.sitebar-button__cnt,.sitebar-button__l,.sitebar-button__r{cursor:pointer;*cursor:pointer}.sitebar__cnt{padding:0 0 0 38px;position:relative;white-space:nowrap;overflow:hidden;border-top:1px solid #fff}.sitebar-label,.sitebar-button,.sitebar-button__cnt{display:-moz-inline-stack;display:inline-block}.sitebar-label{position:absolute;overflow:hidden;left:86px;right:11px;text-align:left}.sitebar-label__t{color:#171717}.sitebar-label__t span{text-overflow:ellipsis;max-width:80%;display:inline-block;overflow:hidden;float:left}.sitebar-label__t u{}.sitebar-button__cnt,.sitebar-button__l,.sitebar-button__r{background:url(http://design.metabar.ru/sitebar/sitebar5-sprite2.png) 0 -3px repeat-x}.sitebar-button{padding:0 3px;position:relative;float:right;margin-right:60px}.sitebar-button__cnt{display:block;text-decoration:none;color:#322e2f!important;padding:0 7px;text-shadow:0 1px 1px #fff;font:700 11px/24px "Trebuchet MS",sans-serif}.sitebar-button__l,.sitebar-button__r{width:3px;position:absolute;top:0;background-repeat:no-repeat}.sitebar-button__l{background-position:-140px -33px;left:0}.sitebar-button__r{background-position:-143px -33px;right:0}.sitebar-button,.sitebar-button__cnt,.sitebar-button__l,.sitebar-button__r{*cursor:pointer}.sitebar__cnt,.sitebar-label,.sitebar-button,.sitebar-button__cnt{vertical-align:top;*display:inline;*zoom:1}.sitebar__cnt{*zoom:1}.sitebar__ie{background:#d4d0c8}.sitebar__ie .sitebar__logo{background-image:url(http://design.metabar.ru/i/partners/drweb/sitebar/logo-ie.png)}.sitebar__ie .sitebar__close{background-image:url(http://design.metabar.ru/i/partners/drweb/sitebar/icon-close-ie.png)}.sitebar__opera{background-image:url(http://design.metabar.ru/i/partners/drweb/sitebar/sitebar-webkit.png);border:1px solid #b6bac0;border-width:1px 0;border-bottom-color:#ccc}.sitebar__opera,.sitebar__opera .sitebar__close,.sitebar__opera .sitebar__cnt,.sitebar__opera .sitebar-label{height:37px}.sitebar__opera .sitebar__logo{top:5px;left:15px;width:38px;height:30px;background-image:url(http://design.metabar.ru/i/partners/drweb/sitebar/logo-webkit.png)}.sitebar__opera .sitebar__close{background-image:url(http://design.metabar.ru/i/partners/drweb/sitebar/icon-close-webkit.png);width:26px}.sitebar__opera .sitebar__cnt{padding:0 30px 0 66px;border:0}.sitebar__opera .sitebar-label__t{font:13px/37px Arial,sans-serif;color:#6e6749}.sitebar__opera .sitebar-button{top:7px}.sitebar__chrome{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAlCAIAAAAMShT+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpi/P9pOxMDAwMTw///QBqB/yPzUeT+QeUYUOQgYv+w6GHAI4dmD0QOIMAA3sEzvvd9RakAAAAASUVORK5CYII=);border:1px solid #b6bac0;border-width:1px 0;border-bottom-color:#ccc}.sitebar__chrome,.sitebar__chrome .sitebar__close,.sitebar__chrome .sitebar__cnt,.sitebar__chrome .sitebar__question,.sitebar__chrome .sitebar-label{height:37px}.sitebar__chrome .sitebar__logo{top:0;left:0;width:80px;height:37px;background-image:url(data:image/png;base64,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)}.sitebar__chrome .sitebar__close{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAlCAYAAABcZvm2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXNJREFUeNrslbFPwkAUxr9WaO0VCjhpJDoYRRKrYTEk6sTArjHyJ2LUf4CIQnQ0UanRzUF2mgIm0mrPu8OITiTWoMNd8qXDe+nv3vu+tAqlFJM4KiZ0JEiCJEiC/hAUG9cQuke0enKJcmkDmXTyW63j9lA7u0VlbxtqZl+JNFH1+ALE0HF1/QjP648gnS7qjRYS5jSD3URfXbm0DsOII5nQ4dw/MVgPruuh3nRAiI50imBrc3ksSBn3Pwo7h9Tr9hmkDU2Lwfdf0X9+ETU+TcFehGkSqDMHSsQwUKQsE3Y+C38QQItPIW0RocLaAoMYoify6vjEXG9hKCbhzziDcVHQz/ovxDtk6fJw2nA+bj6S89CG1+2Jnsggka7mHUyisTXpsFezyC3NMq8CqIoivPuaxh+DaucsXYYGyzKGnrD0ceVX5uAHQ89aLI2RQZXdonjZ0HidmyaUYmGw8/MY+D52irno8ZYfVQmSIAmSoH8IehdgAJz5kLmKmKRuAAAAAElFTkSuQmCC);width:26px}.sitebar__chrome .sitebar__question{margin-top:10px;background-image:url(data:image/png;base64,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);right:23px}.sitebar__chrome .sitebar__cnt{padding:0 11px 0 86px;border:0}.sitebar__chrome .sitebar-label__t{font:13px/37px Arial,sans-serif;color:#6e6749}.sitebar__chrome .sitebar-button{top:7px}p{width:50%;margin:20px auto}.sitebar{left:0;position:fixed;right:0;top:0;z-index:10000}';
        var popupCss = '#sitebar_popover *{margin:0;padding:0}#sitebar_popover{position:fixed;right:20px;width:229px;padding:25px 10px 29px 29px;font:11px/15px Arial,sans-serif;color:#999;background:#fff;-webkit-border-radius:4px;border-radius:4px;-webkit-box-shadow:0 3px 6px rgba(0,0,0,.15);box-shadow:0 3px 6px rgba(0,0,0,.15);border:solid 1px #c1c1c1}#sitebar_popover h1{font-size:12px;line-height:20px;font-weight:normal;color:#484848;margin-bottom:23px}#sitebar_popover .arrow,#sitebar_popover .arrow:after{position:absolute;display:block;width:0;height:0;border-color:transparent;border-style:solid;z-index:100}#sitebar_popover .arrow{border-width:9px;border-top-width:0;top:-9px;right:11px;border-bottom-color:#dbdbdb;border-bottom-color:rgba(0,0,0,0.25)}#sitebar_popover .arrow:after{border-width:8px;content:"";top:1px;margin-left:-8px;border-bottom-color:#fff;border-top-width:0}';
        var cssContainer = window.document.createElement('style');
        cssContainer.innerText = sitebarCss +'\n' +popupCss;
        window.document.body.appendChild(cssContainer);


        var sitebarHtml = '<div id="market_context_headcrab" class="sitebar sitebar__chrome" style="top: 0px; cursor: pointer"><div class="sitebar__logo"></div><a href="#" id="market_contenxt_close" class="sitebar__close" title="Закрыть">Закрыть</a><a href="#" id="market_contenxt_question" class="sitebar__close sitebar__question" title="Инфо">Инфо</a><div class="sitebar-button"><a href="__product_link__" target="_top" class="sitebar-button__cnt"><i class="sitebar-button__l"></i><i class="sitebar-button__r"></i>Посмотреть</a></div><div class="sitebar__cnt"><div class="sitebar-label"><span class="sitebar-label__t"><span>Самая низкая цена в Маркете на __product_name__ в вашем регионе</span>&nbsp–&nbsp<u>__product_price__ __product_cur__</u></span></div></div><div id="sitebar_popover" style="display: none"><div class="arrow"></div><h1>Это приложение подсказывает самые низкие цены на&nbsp;товары, на&nbsp;которые вы&nbsp;смотрите прямо сейчас.</h1><p style="width: auto;height: auto">Данные предоставлены сервисом Яндекс.Маркет, технология&nbsp;— Metabar.ru.<br><br><a onclick="window.open(\'http://feedback.metabar.ru\')" style="color:rgb(153, 153, 153); text-decoration: underline; font-weight:normal">Обратная связь</a></p></div></div>';
        console.log(data)

        sitebarHtml = sitebarHtml.replace('__product_name__', data.name.split('(')[0]);
        sitebarHtml = sitebarHtml.replace('__product_price__', data.price.value);
        sitebarHtml = sitebarHtml.replace('__product_cur__', data.price.currencyName);     
        sitebarHtml = sitebarHtml.replace('__product_link__', data.url);    



        // create container
        var container = window.document.createElement('div');
        container.innerHTML = sitebarHtml;
        // we need no container
        var sitebarNode = container.childNodes[0];
        window.document.body.appendChild(sitebarNode);

        // slide down
        var top = -40;
        var timeout = setInterval(function() {
            top += 2;
            if (top === 0) {
                clearInterval(timeout);
            }
            sitebarNode.style.top = top + 'px';
        }, 15);

        // click on question - open link
        window.document.getElementById("market_contenxt_question").onclick = function(e) {
            showInfoPopup();
            sendStat('question', data.name);
            e.stopPropagation();
            return false;
        }.bind(this);


        // click on close - hide headcrab
        window.document.getElementById("market_contenxt_close").onclick = function(e) {
            sendStat('close', data.name);
            sitebarNode.style.display = "none";
            e.stopPropagation();
            return false;
        }.bind(this);

        // click on headcrab - open link
        window.document.getElementById("market_context_headcrab").onclick = function(e) {
            sendStat('click', data.name);
            window.open(data.url);
            sitebarNode.style.display = "none";
            e.stopPropagation();
            return false;
        }.bind(this);

        // click on popup - hide it
        window.document.getElementById("sitebar_popover").onclick = function(e) {
            hideInfoPopup();
            e.stopPropagation();
            return false;
        }.bind(this);



        window.document.body.onclick = function(e) {
            hideInfoPopup();
        }.bind(this);



        sendStat('show', data.name);
    };


    ///////////////////////////////////////////////////////////////////////////////////
    // start
    var productName = getProductNameBySchema() || getNameBySelector();

   

    if (productName) {
         // in name contain "(" remove it with ending
        productName = productName.split('(')[0];
        
        JSONP.get('https://karma.metabar.ru/suggest/price/lowest?', {text: productName}, function(data) {
            if (data && location.href.indexOf(data.link) === -1) {
                var marketPrice = Number(data.price.value);
                var currentPrice = getProductPriceBySchema();
                if (marketPrice != currentPrice) {
                    showNotify(data);
                } else {
                    sendStat('priceIsSame');
                }

            } else {
                sendStat('offerNotFound', productName);
            }
        });
    }

    //send stat about shop
    var host = window.location.host;
    if (host.indexOf('www.') === 0) {
        host = host.slice(4);
    }
    var hostInList = shopList.indexOf(host) > -1;

    if (hostInList || productName) {
        var product = productName || window.location.href;
        sendGaStat(['marketContext._trackEvent', 'shops', host, product, 0, true]);
    }
   

})(Function('return this')());