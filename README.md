# BlinkenJS

BlinkenJS is the JavaScript successor to [Blinken](https://github.com/alphagov/blinken). It runs purely in the browser and does not require compiling or running any applications.

BlinkenJS gets data from [Icinga](https://www.icinga.com/) and displays it in a dashboard, with one status per environment. There can be multiple groups of environments.

BlinkenJS is much simpler than the original Blinken - only Icinga is supported and there are no detailed pages, only a dashboard.

## How to run

1. Copy `app/config-example.js` to `app/config.js` and edit it to define your groups, environments and Icinga URLs.
2. Open `app/blinken.html` in your browser.

The page will automatically refresh once a minute.

**Note** In order for this script to be able to access your Icinga instances, you must ensure that at least the file `/cgi-bin/icinga/status.cgi` returns the HTTP header `Access-Control-Allow-Origin: *`.

## Screenshot

![Screenshot of BlinkenJS in action](docs/screenshot.png)

## Chrome extension

The Blinken page has also been wrapped up in a Chrome extension, for a quick overview of the service status.

### Installation

The extension can be installed directly from this repository:

1. [Download the source][source] and unzip
2. Visit [chrome://extensions][extensions] in Chrome
3. Check the "Developer mode" checkbox
4. Click "Load unpacked extension..."
5. Navigate to the root of this project - `/blinkenjs` - and select it

After installation you should see a little grey icon in your toolbar. When you don't want to see it, you can right-click it and hide it.

### Configuration

You will need to point the extension at the Icinga alert pages in order to use it. To do this, open up your [extensions][extensions], and find the "GOV.UK Blinken" extension. Click "Options". On this page, you should type the Icinga URLs for each environment and click "Save". Once they have been successfully configured, you should see the icon change colour in the corner.

### Usage

The icon uses the following colour scheme:

- Green means no warnings
- Purple means some unknown alerts, but no warnings or critical alerts
- Amber means some warnings, but no critical alerts
- Red means some critical alerts

The big block across the top of the icon represents Production. The medium-sized one at the bottom-left represents
Staging, and the small block in the bottom-right represents Integration. AWS Staging and Production environments are
not yet represented in the icon but will be once the majority of applications have been migrated.

Clicking on the icon will open up the BlinkenJS page with more information. Each environment can be clicked to be taken
to the corresponding Icinga page.  

### Notifications

The extension can also display system-wide notifications when the status of an environment changes. Clicking the notification will open the corresponding Icinga page.

These notifications can be enabled/disabled on the extension settings page. Notifications can be toggled for each environment, and for each status.

[source]: https://github.com/alphagov/blinkenjs/archive/master.zip
[extensions]: chrome://extensions

## Licence

[MIT License](LICENCE)
