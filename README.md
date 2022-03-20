# Fitbit2MQTT

This add-on interacts with your Fitbit API using MQTT.  
For now, it only let you log some amount of water but could be pushed further.  
This can for example be easily integrated with an NFC tag so that each time you scan it:
  - Log drank water to your account
  - Sends a notification to your phone or interact in any other way on success or on error (or automate anything else)

# Add-on configuration

You need to have a [Fitbit](https://www.fitbit.com) account.

## Create a new application

- Go to https://dev.fitbit.com/apps/new
- Fill up the form
  - _Note: make sure all the URLs you'll write start with `https`, if `http` only it won't be allowed_
  - `Application Website URL`: You can just put a random server name. _Preferrably use a local address as it's the callback address that Fitbit will pass on your token. You don't want some existing server logging that request_
  - `Organization`: Just write anything in here, it's for personal use
  - `Organization Website URL`: Reuse same URL as earlier or add `/org` at the end it doesn't matter
  - `Terms of Service URL`: Reuse same URL as earlier or add `/terms` at the end it doesn't matter
  - `Privacy Policy URL`: Reuse same URL as earlier or add `/privacy` at the end it doesn't matter
  - `OAuth 2.0 Application Type`: Pick `Server`
  - `Redirect URL`: Reuse same URL as earlier
  - `Default Access Type`: Pick `Read & Write` as you'll need to add some logs to your account

## Retrieve the data needed by the add-on from your Fitbit app

- Go to https://dev.fitbit.com/apps
- You should be able to see the app you created, open it
- At the bottom of that page there's a tiny link `OAuth 2.0 tutorial page`, open it
- In the `Select Scopes` section, only check `nutrition` as it's the one including the logs for water
- Click on the generated authorization URL
- You're likely to be waiting for a loading page as the redirect to the random URL we've put earlier doesn't work. Instead open the dev tool (F12), go to the network tab, close the current connection at the very top of the page, on the left of the URL where the "reload page" usually is, you'll probably have a cross as the page is loading. Click onto it to stop the request and re launch it by then pressing the reload page button
- You should see 2 requests being made in the network tab
- Open the second one and it should look like this: `https://[the-fake-url-you-used-earlier].com/?code=[somelongcodehere]`
- Copy the code in the query params
- Go back to the Fitbit OAuth 2 page and paste the code in `1A Get Code`
- It'll give you a curl request to make
- Run the curl request and notice that it gives you back a JSON object
- Paste the entire JSON object in the `2: Parse response`
- Open the configuration page of the add-on and you'll be asked to provide a few data
  - `fitbitBasicToken` is displayed above in the curl request: `-H 'Authorization: Basic [the-basic-token]`
  - `fitbitRefreshToken` is displayed in the `2: Parse response` as `Refresh Token`
  - `fitbitUserId` is displayed in the `2: Parse response` as `UserId`

# Home-Assistant automation ideas

Following is just to give some ideas of what's possible, feel free to come up with your own automations

## Scan an NFC tag to log some water

```yaml
alias: nfc-tag-500ml-water-log-fitbit
description: 'Add 500ml of water on Fitbit when NFC tag is scanned'
trigger:
  - platform: tag
    tag_id: [YOUR-TAG-UUID]
condition: []
action:
  - service: mqtt.publish
    data:
      topic: fitbit-add-on/log-water
      payload: '{"amount": 500, "unit": "ml" }'
mode: single
```

Of course, you can change the payload `amount` and `unit` to fit your needs.

## Phone notification on success

```yaml
alias: 'fitbit-add-on-add-water-success-notification'
description: 'Fitbit add-on: Successfully added 500ml of water'
trigger:
  - platform: mqtt
    topic: fitbit-add-on/add-watter-success
condition: []
action:
  - device_id: [YOUR-DEVICE-ID]
    domain: mobile_app
    type: notify
    title: Water
    message: Successfully added 500ml of water
mode: single
```

## Phone notification on error

```yaml
alias: 'fitbit-add-on-add-water-error-notification'
description: 'Fitbit add-on: Failed to add 500ml of water'
trigger:
  - platform: mqtt
    topic: fitbit-add-on/add-watter-error
condition: []
action:
  - device_id: [YOUR-DEVICE-ID]
    domain: mobile_app
    type: notify
    title: Water
    message: Failed to add 500ml of water
mode: single
```
