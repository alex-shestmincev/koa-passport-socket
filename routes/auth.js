const passport = require('koa-passport');
const socket = require('../libs/socket');

function* logIn(next){
  var ctx = this;

  // only callback-form of authenticate allows to assign ctx.body=info if 401
  yield passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.newFlash.error = "Bad credentials.";
    } else {
      yield ctx.login(user);
    }
    ctx.redirect('/');
  }).call(this, next);
}

function* logOut(next) {
  if (this.session.socketIds) {
    this.session.socketIds.forEach(function(socketId) {
      socket.emitter.to(socketId).emit('logout');
    });
  }

  this.logout();
  this.session = null;
  this.redirect('/');
};

module.exports = function(router){

  router.post('/login', logIn);
  router.post('/logout', logOut);


  return router;
}