var blinken_config = {
  "groups": [
    {
      "id": "govuk",
      "name": "",
      "environments": [
        {
          "name": "Production",
          "url": "https://alert.publishing.service.gov.uk"
        },
        {
          "name": "Staging",
          "url": "https://alert.staging.publishing.service.gov.uk"
        },
        {
          "name": "Integration",
          "url": "https://alert.integration.publishing.service.gov.uk"
        },
        {
          "name": "CI",
          "url": "https://ci-alert.integration.publishing.service.gov.uk"
        }
      ]
    }
  ]
}
