function test(foo){
    if(foo.name) return;
    if(foo.sex){
        if(foo.st)
        console.log('111')
    }
    console.log('ok')
}
test({name:false, sex: true, st: false});