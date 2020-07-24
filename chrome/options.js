(function () {
  var DEFAULT_POLLING_INTERVAL_SECS = 10;
  var ENVIRONMENTS = [
    "production",
    "integration",
    "production_aws",
    "staging_aws",
    "ci"
  ];

  function saveOptions() {
    var icingaUrls = ENVIRONMENTS.reduce(function (urlsByEnvironment, environment) {
      urlsByEnvironment[environment] = document.getElementById(environment + "-url").value;
      return urlsByEnvironment;
    }, {});

    var pollingIntervalSecs = parseInt(document.getElementById("polling-interval").value);
    if (isNaN(pollingIntervalSecs)) {
      pollingIntervalSecs = DEFAULT_POLLING_INTERVAL_SECS;
    }

    var notificationsEnabled = ENVIRONMENTS.reduce(function (enabledByEnvironment, environment) {
      enabledByEnvironment[environment] = ["critical", "warning", "unknown", "ok"]
        .reduce(function (enabledByStatus, status) {
          enabledByStatus[status] = document.getElementById(environment + "-notification-" + status).checked;
          return enabledByStatus;
        }, {});

      return enabledByEnvironment;
    }, {});

    chrome.storage.sync.set({
      icingaUrls: icingaUrls,
      pollingIntervalSecs: pollingIntervalSecs,
      notificationsEnabled: notificationsEnabled
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
      pollingIntervalSecs: DEFAULT_POLLING_INTERVAL_SECS,
      notificationsEnabled: {}
    }, populateInputs);
  }

  function populateInputs(options) {
    var icingaUrls = options.icingaUrls;
    Object.keys(icingaUrls)
      .forEach(function (environment) {
        document.getElementById(environment + "-url").value = icingaUrls[environment];
      });

    document.getElementById("polling-interval").value = options.pollingIntervalSecs;

    var notificationsEnabled = options.notificationsEnabled;
    Object.keys(notificationsEnabled)
      .forEach(function (environment) {
        var notificationsByStatus = notificationsEnabled[environment];
        Object.keys(notificationsByStatus).forEach(function (status) {
          document.getElementById(environment + '-notification-' + status).checked = notificationsByStatus[status];
        });
      });
  }

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);
})();
