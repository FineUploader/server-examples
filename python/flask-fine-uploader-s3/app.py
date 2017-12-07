#!/usr/bin/env python
# 
# app.py
#
# by: Mark Feltner, Richard Morrison
#
# Server-side S3 upload example for Fine Uploader
#
# Features:
# * Upload to S3
# * Delete from S3
# * Sign Policy documents (simple uploads) and REST requests (chunked/multipart
#   uploads)
# * non-CORS environment

import base64, hmac, hashlib, os, sys, datetime

from flask import (Flask, json, jsonify, make_response, render_template, 
        request)

AWS_ACCESS_KEY_ID =     os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
S3_BUCKET =             os.getenv('S3_BUCKET')
S3_REGION =             os.getenv('S3_REGION')

app = Flask(__name__, static_url_path='/static')
app.config.from_object(__name__)
app.debug = False

def sign_policy(policy):
    """ Sign and return the policy document for a simple upload.
    http://aws.amazon.com/articles/1434/#signyours3postform """
    signed_policy = base64.b64encode(policy)
    signature = base64.b64encode(hmac.new(
        app.config.get('AWS_SECRET_ACCESS_KEY').encode(), signed_policy, 
            hashlib.sha1).digest())

    return { 'policy': signed_policy.decode(), 'signature': signature.decode() }

def sign_headers(headers):
    """ Sign and return the headers for a chunked upload. """
    headers = bytearray(headers, 'utf-8')  # hmac doesn't want unicode
    return {
        'signature': base64.b64encode(hmac.new(
            app.config.get('AWS_SECRET_ACCESS_KEY').encode(), headers.encode(), 
                hashlib.sha1).digest()).decode()
    }
    
@app.route("/s3/sign", methods=['POST'])
def s3_signature():
    """ Route for signing the policy document or REST headers. """
    request_payload = request.get_json()
    if request_payload.get('headers'):
        response_data = sign_headers(request_payload['headers']) 
    else:
        response_data = sign_policy(request.data)
    return jsonify(response_data)
    

@app.route("/s3/delete/<key>", methods=['POST', 'DELETE'])
def s3_delete(key=None):
    """ Route for deleting files off S3. Uses the SDK. """
    try:
        from boto.s3.connection import Key, S3Connection
        S3 = S3Connection(app.config.get('AWS_ACCESS_KEY_ID'), 
            app.config.get('AWS_SECRET_ACCESS_KEY'))
        request_payload = request.values
        bucket_name = request_payload.get('bucket')
        key_name = request_payload.get('key')
        aws_bucket = S3.get_bucket(bucket_name, validate=False)
        aws_key = Key(aws_bucket, key_name)
        aws_key.delete()
        return make_response('', 200)
    except ImportError:  # pragma: nocover
        abort(500)

@app.route("/s3/success", methods=['GET', 'POST'])
def s3_success():
    """ Endpoint called for successful uploads. """
    return make_response() 

@app.route("/")
def index():
    return render_template("index.html",
        s3_bucket =         app.config.get('S3_BUCKET'),
        aws_access_key_id = app.config.get('AWS_ACCESS_KEY_ID'),
        s3_region =         app.config.get('S3_REGION'),
        when =              datetime.datetime.now().strftime('%Y%m%d'),
    )

def main(argv=None):
    port = 5000 # by default
    if len(sys.argv) == 2:  # pragma: nocover
        port = int(sys.argv[1])
    app.run('0.0.0.0', port=port)

    return 0 # success

if __name__ == '__main__':
    status = main()
    sys.exit(status)
