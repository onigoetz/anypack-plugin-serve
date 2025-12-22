module.exports = {
  getMajorVersion: (version) =>
    typeof version === 'string' && version.includes('.')
      ? version.split('.')[0]
      : false,
  defer: () => {
    const deferred = {};

    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    return deferred;
  },
};
