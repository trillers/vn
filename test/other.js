var util = require('../src/modules/node-manager/util');
var o = {
    name: 'zh',
    sex: '1'
}
var json =  util.clone(o);
console.log(json)
util.objPick(json, 'name');
console.log(json)