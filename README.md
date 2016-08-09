# Spaceship Shooter

## Browser
Run the cordova application in the browser.
```sh
# add browser platform once
npm run cordova:browser:platform
# run browser plaform
npm run cordova:browser
```
Or alternatively run it on a simple (livereload) server.
```sh
# simple server
npm start
```
Run in an insecure Chrome Canary to prevent XSS blockage issues you won't encounter with a deployed Cordova application.
```sh
npm run chrome:canary
```

## Android
You will need the Android SDK to deploy the cordova application on an emulator or device.
```sh
# add cordova platform once
npm run cordova:android:platform
# run cordova platform
npm run cordova:android
```
