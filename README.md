# BlinkenJS

BlinkenJS is the JavaScript successor to [Blinken](https://github.com/alphagov/blinken). It runs purely in the browser and does not require compiling or running any applications.

BlinkenJS gets data from [Icinga](https://www.icinga.com/) and displays it in a dashboard, with one status per environment. There can be multiple groups of environments.

BlinkenJS is much simpler than the original Blinken - only Icinga is supported and there are no detailed pages, only a dashboard.

## How to run

1. Copy `config-example.js` to `config.js` and edit it to define your groups, environments and Icinga URLs.
2. Open `blinken.html` in your browser.

The page will automatically refresh once a minute.

## Screenshot

![Screenshot of BlinkenJS in action](docs/screenshot.png)

## Licence

[MIT License](LICENCE)
