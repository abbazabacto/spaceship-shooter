#!/bin/bash

set -o errexit # Exit on error

message_info () {
  echo "${textGreen}[spaceshipshooter-app-deploy]${textReset} $1"
}

message_info "git pull -r"
git pull -r

message_info "git push origin master"
git push origin master

message_info "git checkout gh-pages"
git checkout gh-pages

message_info "git rebase master"
git rebase master

message_info "git pull -r"
git pull -r

message_info "npm run build"
npm run build

message_info "git commit -a -m 'feat: update to latest master'"
git commit -a -m 'feat: update to latest master'

message_info "git push origin gh-pages"
git push origin gh-pages

message_info "git checkout master"
git checkout master
