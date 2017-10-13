(function () {
  var DEFAULT_POLLING_INTERVAL_SECS = 10;

  function saveOptions() {
    var icingaUrls = [
      "production",
      "staging",
      "integration"
    ].reduce(function (urlsByEnvironment, environment) {
      urlsByEnvironment[environment] = document.getElementById(environment + "-url").value;
      return urlsByEnvironment;
    }, {});

    var pollingIntervalSecs = parseInt(document.getElementById("polling-interval").value);
    if (isNaN(pollingIntervalSecs)) {
      pollingIntervalSecs = DEFAULT_POLLING_INTERVAL_SECS;
    }

    chrome.storage.sync.set({
      icingaUrls: icingaUrls,
      pollingIntervalSecs: pollingIntervalSecs
    }, notifySaveSuccess);
  }

  function notifySaveSuccess() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  }

  function restoreOptions() {
    chrome.storage.sync.get({
      icingaUrls: {},
      pollingIntervalSecs: DEFAULT_POLLING_INTERVAL_SECS
    }, populateInputs);
  }

  function populateInputs(options) {
    var icingaUrls = options.icingaUrls;
    Object.keys(icingaUrls)
      .forEach(function (environment) {
        document.getElementById(environment + "-url").value = icingaUrls[environment];
      });

    document.getElementById("polling-interval").value = options.pollingIntervalSecs;
  }

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
})();
