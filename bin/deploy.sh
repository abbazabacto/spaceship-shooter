#!/bin/bash

set -o errexit # Exit on error

git pull -r
git push origin master
git checkout origin gh-pages
git rebase master
git commit -a -m 'feat: update to latest master'
git pull -r
git push origin gh-pages
git checkout master
