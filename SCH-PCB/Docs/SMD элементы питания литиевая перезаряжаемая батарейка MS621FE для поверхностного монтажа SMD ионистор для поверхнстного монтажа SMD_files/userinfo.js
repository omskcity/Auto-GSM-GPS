function printUserInfo(){
return "<form id='login' method='post' onsubmit='return validateForm(this, &quot;��������� ������������ ���������� �����:&quot;);'>"+
"<table>"+
  "<tr>"+
    "<td><label id='!text' for='shop_login'>�����:&nbsp;</label></td>"+
    "<td><input type='text' title='�����' name='shop_login' value='' /></td>"+
  "</tr>"+
  "<tr>"+
    "<td><label id='!text' for='shop_password'>������:&nbsp;</label></td>"+
    "<td><input type='password' title='������' name='shop_password' value='' /></td>"+
  "</tr>"+
  "<tr>"+
    "<td></td>"+
    "<td><input type='submit' value='�����' class='but' alt='�����' title='�����' /></td>"+
  "</tr>"+
"</table>"+
  "<a href='/shopregister/'>�����������</a>"+
  "<a href='/password/'>������������?</a>"+
  ""+
"</form>";
}

