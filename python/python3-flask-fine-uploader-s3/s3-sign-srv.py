#!/usr/bin/env python3
"""
s3-sign.srv.py

Originally by: Mark Feltner (https://github.com/FineUploader/server-examples/tree/master/python/flask-fine-uploader-s3)
Server-side S3 upload example for Fine Uploader

Features:
* Upload to S3
* Delete from S3
* Sign Policy documents (simple uploads) and REST requests (chunked/multipart) uploads
* non-CORS environment

Enhanced by: Keiran Raine
* Converted to python3
* Added HTTPS
* More configuration via environment
* Indicate clear points for server side hooks
* Standardised access to request data for server side hooks
"""

import base64, hmac, hashlib, os, sys, re

from flask import (Flask, json, jsonify, make_response, render_template,
        request, abort)

AWS_CLIENT_SECRET_KEY = os.getenv('AWS_CLIENT_SECRET_KEY')
AWS_CLIENT_ACCESS_KEY = os.getenv('AWS_CLIENT_ACCESS_KEY')
AWS_ENDPOINT = os.getenv('AWS_ENDPOINT')

app = Flask(__name__)
app.config.from_object(__name__)

def sign_policy(policy):
    """ Sign and return the policy document for a simple upload.
    http://aws.amazon.com/articles/1434/#signyours3postform """
    signed_policy = base64.b64encode(policy)
    encoded_key = str(AWS_CLIENT_SECRET_KEY).encode()
    hmac_v = hmac.new(encoded_key,
                      signed_policy,
                      hashlib.sha1)
    signature = base64.b64encode(hmac_v.digest())
    return {
        'policy': signed_policy.decode("utf-8"),
        'signature': signature.decode("utf-8")
    }

def sign_headers(headers):
    """ Sign and return the headers for a chunked upload. """
    encoded_key = str(AWS_CLIENT_SECRET_KEY).encode()
    hmac_v = hmac.new(encoded_key,
                      bytearray(headers, 'utf-8'), # hmac doesn't want unicode
                      hashlib.sha1)
    signature = base64.b64encode(hmac_v.digest())
    return {
        'signature': signature.decode("utf-8")
    }

def challenge_from_headers(headers):
    print(">>>>" + headers)
    patt = re.compile(r'(x-amz-meta-[^:]+):(.+)')
    for_challenge = {}
    for (key, value) in re.findall(patt, headers):
        for_challenge[key] = value

    # now figure out bucket key and uuid from request
    url_data = headers.split('\n')[-1].strip()
    (bucket, uuid, ext) = re.match(r'/([^/]+)/([^.]+)\.([^?]+)\?uploads', url_data).groups()
    for_challenge['bucket'] = bucket
    for_challenge['uuid'] = uuid
    for_challenge['key'] = uuid + '.' + ext

    return for_challenge

def challenge_from_conditions(conditions):
    for_challenge = {}
    for item in conditions:
        for key, value in item.items():
            for_challenge[key] = value
    return for_challenge

def challenge_is_good(to_challenge):
    """
    This is where you would run checks based on the 'x-aws-meta-' header elements
    set by fine-uploaders js.
    By default you get:
        key - name in bucket after
        uuid - uuid of key without file extension
        name - original file name from client (no path)
        bucket - destination bucket
    Recommended you augment this with additional request.params fields in the js object.
    """

    transfer_req_for = '%s/%s/%s' % (to_challenge['bucket'],
                                     to_challenge['x-amz-meta-dataset'],
                                     to_challenge['x-amz-meta-qqfilename'])

    # this simulates signing rejection based on data being expected
    # REMOVE/REPLACE BLOCK IN PRODUCTION CODE
    if os.getenv('P3S3F_EXAMPLE_ALLOW_SMALL') is not None:
        if (transfer_req_for == os.getenv('P3S3F_EXAMPLE_ALLOW_SMALL') or
            transfer_req_for == os.getenv('P3S3F_EXAMPLE_ALLOW_LARGE')):
           return True
        return False


    return True

def challenge_request(request):
    request_payload = request.get_json()
    response_data = None
    challenge_data = None
    if request_payload.get('headers'):
        # this if is where you'd do some checking against the back end to check allowed to upload
         # signifies first element of chunked data
        if request_payload['headers'].startswith('POST') and 'uploadId' not in request_payload['headers']:
            print("\t**** Chunked signing request ****", file=sys.stderr)
            challenge_data = challenge_from_headers(request_payload['headers'])
        response_data = sign_headers(request_payload['headers'])
    else:
        # this if is where you'd do some checking against the back end to check allowed to upload
        print("\t**** Un-Chunked signing request ****", file=sys.stderr)
        challenge_data = challenge_from_conditions(request_payload['conditions'])
        response_data = sign_policy(request.data)

    # although we've already done the signing, now do the actual challenge
    if challenge_data is not None:
        print('\t' + str(challenge_data), file=sys.stderr)
        if challenge_is_good(challenge_data) is False:
            return None

    return response_data

@app.route("/s3/sign", methods=['POST'])
def s3_signature():
    """ Route for signing the policy document or REST headers. """
    response_data = challenge_request(request)
    if response_data is None:
        response_data = {'error': 'This file has not been approved for transfer, check upload is to correct dataset.'}
    return jsonify(response_data)


# Probably delete this completely for systems that should't allow delete
@app.route("/s3/delete/<key>", methods=['POST', 'DELETE'])
def s3_delete(key=None):
    """ Route for deleting files off S3. Uses the SDK. """

    request_payload = request.values

    print("\t**** THIS DATA USED TO NOTIFY BACKEND OF DELETED DATA ****", file=sys.stderr)
    print("\tBucket: %s\n\tKey: %s" % (request_payload.get('bucket'), request_payload.get('key')), file=sys.stderr)
    print("\t**********************************************************", file=sys.stderr)

    try:
        import boto3
        from botocore.utils import fix_s3_host

        s3 = boto3.resource("s3",
                            aws_access_key_id = AWS_CLIENT_ACCESS_KEY,
                            aws_secret_access_key = AWS_CLIENT_SECRET_KEY,
                            endpoint_url=AWS_ENDPOINT)
        s3.meta.client.meta.events.unregister('before-sign.s3', fix_s3_host)

        s3.meta.client.delete_object(Bucket=request_payload.get('bucket'),
                                Key=request_payload.get('key'))

        return make_response('', 200)
    except ImportError:
        abort(500)

@app.route("/s3/success", methods=['GET', 'POST'])
def s3_success():
    """ Success redirect endpoint for <=IE9. """

    print("\t**** THIS DATA USED TO NOTIFY BACKEND OF COMPLETED DATA ****", file=sys.stderr)
    for key, value in request.form.items():
        # these don't have 'x-aws-meta-' prefix
        print("\t%s : %s" % (key, value), file=sys.stderr)
    print("\t************************************************************", file=sys.stderr)

    return make_response()

@app.route("/")
def index():
    data = None
    with open('index.html', 'r') as myfile:
        data = myfile.read()
    return data


def main(argv=None):
    print("\n#####\n!\tWARNING: This example is using app.run() please see:\n!\t\thttp://flask.pocoo.org/docs/latest/api/#flask.Flask.run\n#####\n", file=sys.stderr)
    threaded = False
    if os.getenv('P3S3F_THREADED') == '1' :
        threaded = True

    if os.getenv('P3S3F_USE_HTTPS') == '1' :
        print(os.getenv('P3S3F_SRV_CRT'))
        context = (os.getenv('P3S3F_SRV_CRT'),
                   os.getenv('P3S3F_SRV_KEY'))
        app.run(host=os.getenv('P3S3F_HOST_NAME'),
                port=os.getenv('P3S3F_HOST_PORT'),
                ssl_context=context,
                threaded=threaded) # debug=True
    else:
        app.run(host=os.getenv('P3S3F_HOST_NAME'),
                port=os.getenv('P3S3F_HOST_PORT'),
                threaded=threaded) # debug=True
    return 0 # success

if __name__ == '__main__':
    status = main()
    sys.exit(status)
