function getMajorVersion(version) {
  return typeof version === 'string' && version.includes('.')
    ? version.split('.')[0]
    : false;
}

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
  getMajorVersion,
  defer,
};
