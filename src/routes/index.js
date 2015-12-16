module.exports = function(app){
    require('./heartbeat')(app);
    require('./static')(app);
    app.keys = ['keys', 'keykeys'];
    app.use(require('../middlewares/session')());
    //require('../app/controllers')(app);

}
