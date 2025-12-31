function defer() {
  /** @type {{ promise: Promise, resolve: () => {}, reject: () => {}  }} */
  const deferred = {};

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

module.exports = {
  defer,
};
