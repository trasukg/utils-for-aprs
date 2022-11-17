
# Branch Policy

utils-for-aprs uses trunk-based development.  Features are developed on short-lived
feature branches and then quickly merged to 'main'.

For release, 
* Create a release branch locally
    git checkout -b release/2.2.11
* Remove the '-beta' from the version number
* Stage and commit
    git add .
    git commit
* Tag with the version 
    git tag 2.2.11
* Bump the version to the next '-beta'
* Stage and commit
    git add .
    git commit
* Push the release branch and tags
    git push --set-upstream origin release/2.2.11
    git push --tags
* On Github, create a pull request to merge the release branch to 'main'
* Delete the release branch (it was only there to get the version updates on the remote for a pull request).


