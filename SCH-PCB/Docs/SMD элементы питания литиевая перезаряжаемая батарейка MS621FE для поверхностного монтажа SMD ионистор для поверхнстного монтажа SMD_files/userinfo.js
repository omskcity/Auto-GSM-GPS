function printUserInfo(){
return "<form id='login' method='post' onsubmit='return validateForm(this, &quot;Проверьте правильность заполнения полей:&quot;);'>"+
"<table>"+
  "<tr>"+
    "<td><label id='!text' for='shop_login'>Логин:&nbsp;</label></td>"+
    "<td><input type='text' title='Логин' name='shop_login' value='' /></td>"+
  "</tr>"+
  "<tr>"+
    "<td><label id='!text' for='shop_password'>Пароль:&nbsp;</label></td>"+
    "<td><input type='password' title='Пароль' name='shop_password' value='' /></td>"+
  "</tr>"+
  "<tr>"+
    "<td></td>"+
    "<td><input type='submit' value='Войти' class='but' alt='Войти' title='Войти' /></td>"+
  "</tr>"+
"</table>"+
  "<a href='/shopregister/'>Регистрация</a>"+
  "<a href='/password/'>Забыли пароль?</a>"+
  ""+
"</form>";
}

