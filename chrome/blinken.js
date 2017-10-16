(function () {
  var statuses = {};
  var pollingIntervalMillis = 10000;

  run();

  function run() {
    chrome.storage.sync.get({
      icingaUrls: {},
      pollingIntervalSecs: 10
    }, function (options) {
      pollingIntervalMillis = options.pollingIntervalSecs * 1000;

      setPopupConfig(options.icingaUrls);
      fetchStatuses(options.icingaUrls);

      setTimeout(run, pollingIntervalMillis);
    });
  }

  function setPopupConfig(icingaUrls) {
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

  function fetchStatuses(icingaUrls) {
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

          if (hasStatus(response, "CRITICAL")) {
            statuses[environment] = "r";
          } else if (hasStatus(response, "WARNING")) {
            statuses[environment] = "y";
          } else {
            statuses[environment] = "g";
          }

          updateIcon();
        }
      }
    };
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
})();
