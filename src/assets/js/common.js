/**
 * @function 正则校验输入
 * @param {String} str
 * @return Boolean true通过，false不通过
 */
function checkString(str) {
  if (!str) {
    return true
  }
  // var wxReg = new RegExp("[a-zA-Z]([-_a-zA-Z0-9]{5,19})+"); // 微信
  var qqReg = new RegExp("[1-9][0-9]{4,}"); // qq号
  var phReg = new RegExp("[1][3,4,5,6,7,8,9][0-9]{9}"); // 手机号
  var other1 = new RegExp("(q|qq|wx|\u5fae\u4fe1|\u5a01\u4fe1|\u4f01\u9e45|\u7ef4\u65b0)[0-9]+", 'i') // 特定中英文
  var other2 = new RegExp("[0-9]+(q|qq|wx|\u5fae\u4fe1|\u5a01\u4fe1|\u4f01\u9e45|\u7ef4\u65b0)", 'i') // 特定中英文
  //qq、wx、微信、威信、企鹅、维新
  str = str.replace(/\s/g, '')
  if (qqReg.test(str) || phReg.test(str) || other1.test(str) || other2.test(str)) {
    return false
  } else {
    return true
  }
}
export default {
  checkString
}