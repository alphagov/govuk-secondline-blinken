(function () {
  var statuses = {};
  var previousStatuses = {};
  var icingaUrls;
  var pollingIntervalMillis = 10000;
  var notificationsEnabled;
  var icon_colours_rgb = {
    ok: "26, 206, 0",
    warning: "255, 204, 5",
    unknown: "224, 102, 255",
    critical: "255, 50, 0"
  }

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
              "name": "Integration",
              "url": icingaUrls.integration
            },
            {
              "name": "AWS Production",
              "url": icingaUrls.production_aws
            },
            {
              "name": "AWS Staging",
              "url": icingaUrls.staging_aws
            },
            {
              "name": "CI",
              "url": icingaUrls.ci
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
      request.open('GET', icingaUrls[environment] + "/cgi-bin/icinga/status.cgi?servicestatustypes=28&jsonoutput=1");
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
            statuses[environment] = "critical";
          } else if (hasStatus(response, "WARNING")) {
            statuses[environment] = "warning";
          } else if (hasStatus(response, "UNKNOWN")) {
            statuses[environment] = "unknown";
          } else {
            statuses[environment] = "ok";
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
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;

    var context = canvas.getContext('2d');

    context.fillStyle = "#ffffff";
    context.fill();

    context.fillStyle = iconColour(statuses.production, 1);
    context.fillRect(0, 0, 32, 16);

    context.fillStyle = iconColour(statuses.staging, 0.85);
    context.fillRect(0, 16, 21, 16);

    context.fillStyle = iconColour(statuses.integration, 0.7);
    context.fillRect(21, 16, 11, 16);

    chrome.browserAction.setIcon({
      imageData: context.getImageData(0, 0, 32, 32)
    });
  }

  function iconColour(status, opacity) {
    var colour = icon_colours_rgb[status] || "128, 128, 128";
    return `rgba(${colour}, ${opacity})`;
  }

  function displayNotification() {
    Object.keys(statuses).forEach(function (environment) {
      var status = statuses[environment];

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
