var blinken_config = {
  "groups": [
    {
      "id": "govuk",
      "name": "",
      "environments": [
        {
          "name": "Production (Carrenza)",
          "url": "https://alert.publishing.service.gov.uk"
        },
        {
          "name": "Production (AWS)",
          "url": "https://alert.blue.production.govuk.digital"
        },
        {
          "name": "Staging (Carrenza)",
          "url": "https://alert.staging.publishing.service.gov.uk"
        },
        {
          "name": "Staging (AWS)",
          "url": "https://alert.blue.staging.govuk.digital"
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
