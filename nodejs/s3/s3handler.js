/**
 * NodeJs Server-Side Example for Fine Uploader S3.
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - handles non-CORS environments
 *  - handles delete file requests assuming the method is DELETE
 *  - Ensures again the file size does not exceed the max (after file is in S3)
 *  - signs policy documents (simple uploads) and REST requests
 *    (chunked/multipart uploads)
 *  - supports version 2 and version 4 signatures
 *
 * Requirements:
 *  - express 3.3.5+ (for handling requests)
 *  - crypto-js 3.1.5+ (for signing requests)
 *  - aws-sdk 2.1.10+ (only if utilizing the AWS SDK for deleting files or otherwise examining them)
 *
 * Notes:
 *
 *  Change `expectedMinSize` and `expectedMaxSize` from `null` to integers
 *  to enable policy doc verification on size. The `validation.minSizeLimit`
 *  and `validation.maxSizeLimit` options **must** be set client-side and
 *  match the values you set below.
 *
 */

var express = require("express"),
    CryptoJS = require("crypto-js"),
    aws = require("aws-sdk"),
    bodyParser = require('body-parser'),
    app = express(),
    clientSecretKey = process.env.CLIENT_SECRET_KEY,

    // These two keys are only needed if you plan on using the AWS SDK
    serverPublicKey = process.env.SERVER_PUBLIC_KEY,
    serverSecretKey = process.env.SERVER_SECRET_KEY,

    // Set these two values to match your environment
    expectedBucket = process.env.EXPECTED_BUCKET,
    expectedHostname = process.env.EXPECTED_HOSTNAME, // OPTIONAL, only needed for REST requests

    // Set this to your CORS origin. Secure by default.
    accessControlAllowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN,

    // CHANGE TO INTEGERS TO ENABLE POLICY DOCUMENT VERIFICATION ON FILE SIZE
    // (recommended)
    expectedMinSize = null,
    expectedMaxSize = null,
    // EXAMPLES DIRECTLY BELOW:
    //expectedMinSize = 0,
    //expectedMaxSize = 15000000,

    port = process.env.PORT || 8000,

    enableDebug = true,

    s3;

if (!clientSecretKey) {
    throw new Error('Environment variable CLIENT_SECRET_KEY must be set');
}
if (!expectedBucket) {
    throw new Error('Environment variable EXPECTED_BUCKET must be set');
}
if (!expectedHostname) {
    console.log('WARNING: Chunking will be disabled. Please set environment variable EXPECTED_HOSTNAME');
}

// Init S3, given your server-side keys.  Only needed if using the AWS SDK.
aws.config.update({
    accessKeyId: serverPublicKey,
    secretAccessKey: serverSecretKey
});
s3 = new aws.S3();


app.use(bodyParser.json());
app.listen(port);
debug(`s3handler listening on port ${port}`);

app.options("/*", function(req, res, next){
    debug("Accepting OPTIONS to /s3handler");
    addAccessControlAllowOrigin(res);
    res.header('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});

// Handles all signature requests and the success request FU S3 sends after the file is in S3
// You will need to adjust these paths/conditions based on your setup.
app.post("/s3handler", function(req, res) {
    debug("Accepting POST to /s3handler");
    addAccessControlAllowOrigin(res);
    if (typeof req.query.success !== "undefined") {
        verifyFileInS3(req, res);
    }
    else {
        signRequest(req, res);
    }
});

// Handles the standard DELETE (file) request sent by Fine Uploader S3.
// Omit if you don't want to support this feature.
app.delete("/s3handler/*", function(req, res) {
    debug("Accepting DELETE to /s3handler");
    addAccessControlAllowOrigin(res);
    deleteFile(req.query.bucket, req.query.key, function(err) {
        if (err) {
            console.log("Problem deleting file: " + err);
            res.status(500);
        }

        res.end();
    });
});

// Adds the Access-Control-Allow-Origin, if configured
function addAccessControlAllowOrigin(res) {
    if (accessControlAllowOrigin) {
      res.header('Access-Control-Allow-Origin', accessControlAllowOrigin);
    }
}

// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
    debug("signRequest()");
    if (req.body.headers) {
        signRestRequest(req, res);
    }
    else {
        signPolicy(req, res);
    }
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
    debug("signRestRequest()");
    var version = req.query.v4 ? 4 : 2,
        stringToSign = req.body.headers,
        signature = version === 4 ? signV4RestRequest(stringToSign) : signV2RestRequest(stringToSign);

    var jsonResponse = {
        signature: signature
    };

    res.setHeader("Content-Type", "application/json");

    if (isValidRestRequest(stringToSign, version)) {
        res.end(JSON.stringify(jsonResponse));
    }
    else {
        res.status(400);
        res.end(JSON.stringify({invalid: true}));
    }
}

function signV2RestRequest(headersStr) {
    debug("signV2RestRequest()");
    return getV2SignatureKey(clientSecretKey, headersStr);
}

function signV4RestRequest(headersStr) {
    debug("signV4RestRequest()");
    var matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr),
        hashedCanonicalRequest = CryptoJS.SHA256(matches[3]),
        stringToSign = headersStr.replace(/(.+s3\/aws4_request\n)[\s\S]+/, '$1' + hashedCanonicalRequest);

    return getV4SignatureKey(clientSecretKey, matches[1], matches[2], "s3", stringToSign);
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
    debug("signPolicy()");
    var policy = req.body,
        base64Policy = new Buffer(JSON.stringify(policy)).toString("base64"),
        signature = req.query.v4 ? signV4Policy(policy, base64Policy) : signV2Policy(base64Policy);

    var jsonResponse = {
        policy: base64Policy,
        signature: signature
    };

    res.setHeader("Content-Type", "application/json");

    if (isPolicyValid(req.body)) {
        res.end(JSON.stringify(jsonResponse));
    }
    else {
        res.status(400);
        res.end(JSON.stringify({invalid: true}));
    }
}

function signV2Policy(base64Policy) {
    debug("signV2Policy()");
    return getV2SignatureKey(clientSecretKey, base64Policy);
}

function signV4Policy(policy, base64Policy) {
    debug("signV4Policy()");
    var conditions = policy.conditions,
        credentialCondition;

    for (var i = 0; i < conditions.length; i++) {
        credentialCondition = conditions[i]["x-amz-credential"];
        if (credentialCondition != null) {
            break;
        }
    }

    var matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition);
    return getV4SignatureKey(clientSecretKey, matches[1], matches[2], "s3", base64Policy);
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr, version) {
    debug("isValidRestRequest()");
    if (!expectedHostname) {
      console.log("ERROR: expectedHostname not set, unable to validate rest request");
      return false;
    }
    if (version === 4) {
        return new RegExp("host:" + expectedHostname).exec(headerStr) != null;
    }

    return new RegExp("\/" + expectedBucket + "\/.+$").exec(headerStr) != null;
}

// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
    debug("isPolicyValid()");
    var bucket, parsedMaxSize, parsedMinSize, isValid;

    policy.conditions.forEach(function(condition) {
        if (condition.bucket) {
            bucket = condition.bucket;
        }
        else if (condition instanceof Array && condition[0] === "content-length-range") {
            parsedMinSize = condition[1];
            parsedMaxSize = condition[2];
        }
    });

    if (bucket !== expectedBucket) {
      console.log("ERROR: policy bucket '" + bucket + "' does not match expected bucket '" + expectedBucket + "'");
      return false;
    }

    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize !== null && expectedMaxSize !== null) {
        if (parsedMinSize !== expectedMinSize.toString()) {
          console.log("ERROR: policy min size '" + parsedMinSize + "' does not match expected min size '" + expectedMinSize.toString() + "'");
          return false;
        }
        if (parsedMaxSize !== expectedMaxSize.toString()) {
          console.log("ERROR: policy max size '" + parsedMaxSize + "' does not match expected max size '" + expectedMaxSize.toString() + "'");
          return false;
        }
    }

    return true;
}

// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
function verifyFileInS3(req, res) {
    debug("verifyFileInS3()");
    function headReceived(err, data) {
        debug("headReceived()");
        if (err) {
            res.status(500);
            console.log(err);
            res.end(JSON.stringify({error: "Problem querying S3!"}));
        }
        else if (data.ContentLength > expectedMaxSize) {
            res.status(400);
            res.write(JSON.stringify({error: "Too big!"}));
            deleteFile(req.body.bucket, req.body.key, function(err) {
                if (err) {
                    console.log("Couldn't delete invalid file!");
                }

                res.end();
            });
        }
        else {
            res.end();
        }
    }

    callS3("head", {
        bucket: req.body.bucket,
        key: req.body.key
    }, headReceived);
}

function getV2SignatureKey(key, stringToSign) {
    debug("getV2SignatureKey()");
    var words = CryptoJS.HmacSHA1(stringToSign, key);
    return CryptoJS.enc.Base64.stringify(words);
}

function getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
    debug("getV4SignatureKey()");
    var kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key),
        kRegion = CryptoJS.HmacSHA256(regionName, kDate),
        kService = CryptoJS.HmacSHA256(serviceName, kRegion),
        kSigning = CryptoJS.HmacSHA256("aws4_request", kService);

    return CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
}

function deleteFile(bucket, key, callback) {
    debug("deleteFile()");
    callS3("delete", {
        bucket: bucket,
        key: key
    }, callback);
}

function callS3(type, spec, callback) {
    debug("callS3()");
    s3[type + "Object"]({
        Bucket: spec.bucket,
        Key: spec.key
    }, callback)
}

function debug(message) {
  if (enableDebug) {
    console.log(`DEBUG: ${message}`);
  }
}
