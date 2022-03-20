#!/usr/bin/with-contenv bashio

set +u

MQTT_HOST=$(bashio::services mqtt "host") \
MQTT_USER=$(bashio::services mqtt "username") \
MQTT_PASSWORD=$(bashio::services mqtt "password") \
npm run start
