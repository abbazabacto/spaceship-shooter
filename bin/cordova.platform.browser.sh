#!/bin/bash

set -o errexit # Exit on error

textReset=$(tput sgr0)
textGreen=$(tput setaf 2)
message_info () {
  echo "${textGreen}[wms-app]${textReset} $1"
}

message_info "Creating necessary directories..."
# rm -fr cordova/{plugins,platforms}
mkdir -p cordova/{plugins,platforms,www}

message_info "Adding browser platform..."
(cd cordova && cordova platform remove browser)
(cd cordova && cordova platform add browser)

message_info "Building browser..."
(cd cordova && cordova build browser)