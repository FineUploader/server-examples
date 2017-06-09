# Python + Flask + Amazon S3 + Fine Uploader
This has been constructed as a working starting point for S3 multipart uploads
based on the [fine-uploader](https://fineuploader.com/) html/css/js and the
[python flask-fine-uploader-s3](https://github.com/FineUploader/server-examples/tree/master/python/flask-fine-uploader-s3)
signing server example.

Significant changes have been made to the [flask-fine-uploader-s3](https://github.com/FineUploader/server-examples/tree/master/python/flask-fine-uploader-s3) code to convert to python3 and support simple examples of server side hooks for checking whether requests should be accepted by the application in use.

Although the original examples in [fine-uploader](https://fineuploader.com/) are good, all elements that require modification for proof of concept have been extracted down to three files, see [Setup](#setup) for more details.

__Content:__

* [Features](#features)
* [Getting started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Setup](#setup)
    * [`client_conf.js`](#client_confjs)
    * [`basic_cors.xml`](#basic_corsxml)
    * [`p3s3f.env`](#p3s3fenv)
* [Server side checks](#server-side-checks)
* [Known issues](#known-issues)
  * [Browser extensions](#browser-extensions)
* [Client side code](#client-side-code)
  * [CEPH](#ceph)


# Features

This is a functional example to upload files to S3 (specifically Ceph rados-gateway) via a web-browser with a python server to sign requests.

* Uploads resumable following:
  * temporary network dropping (automatic for short breaks)
  * computer sleeps (retry button)
  * switching between wired <-> wireless (retry button)

It works out of the box, but you should read the docs on how to run [flask apps](http://flask.pocoo.org/docs/latest/quickstart/#quickstart) if external facing (the built in exec option is not suitable).

# Getting started

## Prerequisites

* python 3
  `sudo apt-get install python3`
* pip 3
  `sudo apt-get install python3-pip`

(or via homebrew et.al.)

## Setup

Consider `$S3FLASK` as the folder containing this `README.md` file.

1. Clone/unpack this archive/repository and cd into `server-examples/python/python3-flask-fine-uploader-s3`
(referred to as `$S3FLASK` after this point)
2. Add the client side code:
  ```bash
  mkdir static
  curl -sSL https://github.com/FineUploader/fine-uploader/archive/master.tar.gz | tar -zx
  cd fine-uploader-master
  npm install
  # See note below for CEPH
  make build
  cp _build/s3.*.js* ../static/.
  cp _build/fine-uploader-new.css ../static/.
  cp _build/*.gif ../static/.
  cd ..
  ```
3. Install the dependencies:  
  `pip3 install -r requirements.txt [--user]`
4. Set environment variables in [`p3s3f.env`](#p3s3fenv), see link for details.
5. Configure the bucket with basic CORS rules, see [`basic_cors.xml`](basic_cors.xml):  
  `s3cmd setcors basic_cors.xml s3://$AWS_DEST_BUCKET`
6. Update [`client_conf.js`](#client_confjs) with relevant values and link into `static`
folder.  See link for details.
7. Run the app (like this to ensure env doesn't leak):  
    `bash -c 'source my_p3s3f.env && ./s3-sign-srv.py'`
8. Visit `http[s]://localhost:5000` (dependent on config of `p3s3f.env`)

### `client_conf.js`

_You need to force the browser to reload from server not from cache
if you modify this file after the initial page load, e.g. shift-ctrl-R._

First:

```
cp client_conf.js my_client_conf.js
ln my_client_conf.js static/client_conf.js
```

_Needs to be a hard link_ `static/client_conf.js` is ignored by the repo so will not be committed.

In a production system this object would be dynamically created in your web-application setting variables as appropriate, e.g. depending on the logged-in user.

Items to modify for testing are:

* `objectProperties` - indicated as required for ceph
  * `bucket` - name of destination bucket
  * `host` - s3 gateway host name (no `http[s]://`)
* `request`
  * `endpoint` - endpoint url including bucket prefix
  * `accessKey` - `AWS_ACCESS_KEY` (to verify against server side for bucket)
  * `params` - _OPTIONAL_, adds to header prefixed with `x-amz-meta-`
    * useful for server-side checking that a signature should be provided

See [here](https://docs.fineuploader.com/branch/master/api/options-s3.html) for
the full fine-uploader API docs.

### `basic_cors.xml`

If you just want to see if this works you don't need to modify this.  If using in a
production environment you should review this file to restrict allowed actions and header
fields to be appropriate for your application.

Further information is included in the file as comments.

### `p3s3f.env`

Recommend: `cp p3s3f.env my_p3s3f.env` (set permissions accordingly)

Contains variables needed by the signing server.  This file has annotation and is
relatively self explanatory with the exception of `P3S3F_EXAMPLE_ALLOW_*`.

Activating the `P3S3F_EXAMPLE_ALLOW_*` variables will result in request for signing
to be rejected if you attempt to upload files that are not expected.  These are
here to exercise the `challenge_is_good()` function of `s3-sign-srv.py`.  This is
the point you could do some form of server side validation of headers or expected
data files.  Note that relying on the content-type or filename extension isn't strong
validation.

# Server side checks

As indicated in the [`p3s3f.env`](#p3s3fenv) section, functions in `s3-sign-srv.py` can be
augmented for application specific triggers and checks.  Key locations would be:

* `challenge_is_good()` - Using request headers should the server provide a signature, e.g.
  * Is file expected (check against DB)?
  * Has file been fully uploaded under a different key)?
* `s3_success()` - Post completion hooks could go in this function, e.g.
  * Mark file as upload complete in DB (links back to `challenge_is_good()` checks)
  * Trigger downstream processing...
* `s3_delete()` - Hooks could be added here but would advise against exposing this in the main upload interface.
  * Deletes are more likely to require an application specific implementation with a recover option.
    * Button can be disabled via `static/client_conf.js`
    * `DELETE` action can be disabled on bucket via `basic_cors.xml`

# Known issues

## Browser extensions

Some browser extensions will block the AJAX calls; if you have issues check the
browser logs (developer tools) and add exceptions appropriately.

# Client side code

In a production system you would not normally include the client side code directly
in the back-end server.  Remove the `static` folder when building a real application
using this.

## CEPH

There is a [CEPH radog-gateway bug](http://tracker.ceph.com/issues/20201) which
results in all files where the MIME type cannot be determined being rejected as
they have no content-type.

If the bug has not been resolved on your CEPH install (and you want to support no or unsusual extensions) you can work around it with
[this](https://github.com/FineUploader/fine-uploader/pull/1846/files) patch to the
web-client.
