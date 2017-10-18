(function () {
  var statuses = {};
  var previousStatuses = {};
  var icingaUrls;
  var pollingIntervalMillis = 10000;
  var notificationsEnabled;

  chrome.notifications.onClicked.addListener(openIcinga);
  run();

  function run() {
    chrome.storage.sync.get({
      icingaUrls: {},
      pollingIntervalSecs: 10,
      notificationsEnabled: {}
    }, function (options) {
      pollingIntervalMillis = options.pollingIntervalSecs * 1000;
      notificationsEnabled = options.notificationsEnabled;
      icingaUrls = options.icingaUrls;

      setPopupConfig();
      fetchStatuses();

      setTimeout(run, pollingIntervalMillis);
    });
  }

  function setPopupConfig() {
    window.blinken_config = {
      "groups": [
        {
          "id": "govuk",
          "name": "GOV.UK",
          "environments": [
            {
              "name": "Production",
              "url": icingaUrls.production
            },
            {
              "name": "Staging",
              "url": icingaUrls.staging
            },
            {
              "name": "Integration",
              "url": icingaUrls.integration
            }
          ]
        }
      ]
    };
  }

  function fetchStatuses() {
    Object.keys(icingaUrls).forEach(function (environment) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = updateStatus(request, environment);
      request.open('GET', icingaUrls[environment] + "/cgi-bin/icinga/status.cgi?servicestatustypes=20&jsonoutput=1");
      request.send();
    });
  }

  function updateStatus(request, environment) {
    return function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 300) {
          var response = JSON.parse(request.responseText);

          updatePreviousStatuses();

          if (hasStatus(response, "CRITICAL")) {
            statuses[environment] = "r";
          } else if (hasStatus(response, "WARNING")) {
            statuses[environment] = "y";
          } else {
            statuses[environment] = "g";
          }

          updateIcon();
          displayNotification();
        }
      }
    };
  }

  function updatePreviousStatuses() {
    Object.keys(statuses).forEach(function (environment) {
      previousStatuses[environment] = statuses[environment];
    });
  }

  function hasStatus(responseJson, status) {
    return responseJson.status.service_status
      .some(function (entry) {
        return entry.status === status && !entry.has_been_acknowledged;
      });
  }

  function updateIcon() {
    var statusString = statuses.production + statuses.staging + statuses.integration;

    if (!statusStringIsValid(statusString)) {
      statusString = "grey";
    }

    chrome.browserAction.setIcon({path: "chrome/icons/" + statusString + ".png"});
  }

  function statusStringIsValid(statusString) {
    var statusValidation = /[ryg]{3}/;
    return statusValidation.test(statusString);
  }

  function displayNotification() {
    Object.keys(statuses).forEach(function (environment) {
      var status;
      switch(statuses[environment]) {
        case "r":
          status = "critical";
          break;
        case "y":
          status = "warning";
          break;
        case "g":
          status = "ok";
          break;
      }

      if (shouldNotify(environment, status)) {
        chrome.notifications.create(
          "govuk-blinken-" + environment + "-" + status + "-" + new Date(),
          {
            type: "basic",
            iconUrl: "chrome/icons/" + status + ".png",
            title: capitalize(environment),
            message: capitalize(status)
          }
        );
      }
    });
  }

  function shouldNotify(environment, status) {
    var previousColour = previousStatuses[environment];
    var currentColour = statuses[environment];

    if (previousColour === currentColour || !previousColour) {
      return false;
    }

    return notificationsEnabled &&
      notificationsEnabled[environment] &&
      notificationsEnabled[environment][status];
  }

  function openIcinga(notificationId) {
    var environmentMatcher = /govuk-blinken-(\w+)-.+/;
    var matches = notificationId.match(environmentMatcher);
    var environment = matches && matches[1];
    var url = icingaUrls[environment];

    if (url) {
      chrome.tabs.create({url: url});
    }
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
})();
