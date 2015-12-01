exports.mixin = function(target, source){
    for(var prop in source){
        target[prop] = source[prop]
    }
}