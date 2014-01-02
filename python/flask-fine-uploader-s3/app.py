#!/usr/bin/env python
# 
# app.py
#
# by: Mark Feltner
#
# Server-side S3 upload example for Fine Uploader
#
# Features:
# * Upload to S3
# * Delete from S3
# * Sign Policy documents (simple uploads) and REST requests (chunked/multipart)
#   uploads
# * non-CORS environment

import base64, hmac, hashlib, os, sys

from flask import (Flask, json, jsonify, make_response, render_template, 
        request)

AWS_CLIENT_SECRET_KEY = os.getenv('AWS_CLIENT_SECRET_KEY')
AWS_SERVER_PUBLIC_KEY = os.getenv('AWS_SERVER_PUBLIC_KEY')
AWS_SERVER_SECRET_KEY = os.getenv('AWS_SERVER_SECRET_KEY')
AWS_EXPECTED_BUCKET = 'fineuploadertest'
AWS_MAX_SIZE = 15000000

app = Flask(__name__)
app.config.from_object(__name__)

def sign_policy(policy):
    """ Sign and return the policy document for a simple upload.
    http://aws.amazon.com/articles/1434/#signyours3postform """
    signed_policy = base64.b64encode(policy)
    signature = base64.b64encode(hmac.new(
        app.config.get('AWS_CLIENT_SECRET_KEY'), signed_policy, hashlib.sha1).
        digest())
    return { 'policy': signed_policy, 'signature': signature }

def sign_headers(headers):
    """ Sign and return the headers for a chunked upload. """
    return {
        'signature': base64.b64encode(hmac.new(
            app.config.get('AWS_CLIENT_SECRET_KEY'), headers, hashlib.sha1).
            digest())
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
        S3 = S3Connection(app.config.get("AWS_SERVER_PUBLIC_KEY"), 
            app.config.get("AWS_SERVER_SECRET_KEY"))
        request_payload = request.values
        bucket_name = request_payload.get('bucket')
        key_name = request_payload.get('key')
        aws_bucket = S3.get_bucket(bucket_name, validate=False)
        aws_key = Key(aws_bucket, key_name)
        aws_key.delete()
        return make_response('', 200)
    except ImportError:
        abort(500)

@app.route("/s3/success", methods=['GET', 'POST'])
def s3_success():
    """ Success redirect endpoint for <=IE9. """
    return make_response() 

@app.route("/")
def index():
    return render_template("index.html")

def main(argv=None):

    app.run('0.0.0.0')

    return 0 # success

if __name__ == '__main__':
    status = main()
    sys.exit(status)
