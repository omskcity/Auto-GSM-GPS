//------------------------------------------------------------windows-1251----
//Title/File				globalvars.js
//Creation Date 			2009 March 06
//Author	 				Alexey Generalov [webradical]
//Copyright	 				UlterWest LLC http://www.uw.ru
//Last Edit Date Code		20080306
//----------------------------------------------------------------------------
//Description				Определения глобальных переменных,
//							которые используются в скриптах base.js и shop.js.
//							- сообщения об ошибках
//							- подсказки пользователю
//							- и так далее
//----------------------------------------------------------------------------

var UWCONST = {
language: (location.pathname.match(/^(?:\/)(ru|en|el)(?:\/)/), (RegExp.$1 == '') ? 'ru' : RegExp.$1),
search: {
	phrase: {
		ru: 'Поиск по сайту',
		en: 'Site search'
	},
	error: {
		ru: 'Неправильно введен поисковый запрос',
		en: 'Invalid search query'
	}
},
minWidthIE6 : 1000
};
