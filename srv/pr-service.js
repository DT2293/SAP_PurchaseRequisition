module.exports = (srv) => {
  require('./lib/handlers/pr-header')(srv);
  require('./lib/handlers/pr-items')(srv);
  require('./lib/handlers/pr-actions')(srv);
};

