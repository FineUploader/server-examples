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
 *
 * Requirements:
 *  - express 3.3.5+ (for handling requests)
 *  - crypto 0.0.3+ (for signing requests)
 *  - Amazon Node SDK 1.5.0+ (only if utilizing the AWS SDK for deleting files or otherwise examining them)
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
    crypto = require("crypto"),
    aws = require("aws-sdk"),
    app = express(),
    clientSecretKey = process.env.CLIENT_SECRET_KEY,

    // These two keys are only needed if you plan on using the AWS SDK
    serverPublicKey = process.env.SERVER_PUBLIC_KEY,
    serverSecretKey = process.env.SERVER_SECRET_KEY,

    // Set these two values to match your environment
    expectedBucket = "fineuploadertest",

    // CHANGE TO INTEGERS TO ENABLE POLICY DOCUMENT VERIFICATION ON FILE SIZE
    // (recommended)
    expectedMinSize = null,
    expectedMaxSize = null,
    // EXAMPLES DIRECTLY BELOW:
    //expectedMinSize = 0,
    //expectedMaxSize = 15000000,

    s3;


// Init S3, given your server-side keys.  Only needed if using the AWS SDK.
aws.config.update({
    accessKeyId: serverPublicKey,
    secretAccessKey: serverSecretKey
});
s3 = new aws.S3();


app.use(express.bodyParser());
app.use(express.static(__dirname)); //only needed if serving static content as well
app.listen(8000);

// Handles all signature requests and the success request FU S3 sends after the file is in S3
// You will need to adjust these paths/conditions based on your setup.
app.post("/s3handler", function(req, res) {
    if (req.query.success !== undefined) {
        verifyFileInS3(req, res);
    }
    else {
        signRequest(req, res);
    }
});

// Handles the standard DELETE (file) request sent by Fine Uploader S3.
// Omit if you don't want to support this feature.
app.delete("/s3handler/*", function(req, res) {
    deleteFile(req.query.bucket, req.query.key, function(err) {
        if (err) {
            console.log("Problem deleting file: " + err);
            res.status(500);
        }

        res.end();
    });
});

// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
    if (req.body.headers) {
        signRestRequest(req, res);
    }
    else {
        signPolicy(req, res);
    }
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
    var stringToSign = req.body.headers,
        signature = crypto.createHmac("sha1", clientSecretKey)
        .update(stringToSign)
        .digest("base64");

    var jsonResponse = {
        signature: signature
    };

    res.setHeader("Content-Type", "application/json");

    if (isValidRestRequest(stringToSign)) {
        res.end(JSON.stringify(jsonResponse));
    }
    else {
        res.status(400);
        res.end(JSON.stringify({invalid: true}));
    }
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
    var base64Policy = new Buffer(JSON.stringify(req.body)).toString("base64"),
        signature = crypto.createHmac("sha1", clientSecretKey)
        .update(base64Policy)
        .digest("base64");

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

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr) {
    return new RegExp("\/" + expectedBucket + "\/.+$").exec(headerStr) != null;
}

// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
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

    isValid = bucket === expectedBucket;

    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize != null && expectedMaxSize != null) {
        isValid = isValid && (parsedMinSize === expectedMinSize.toString())
                          && (parsedMaxSize === expectedMaxSize.toString());
    }

    return isValid;
}

// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
function verifyFileInS3(req, res) {
    function headReceived(err, data) {
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

function deleteFile(bucket, key, callback) {
    callS3("delete", {
        bucket: bucket,
        key: key
    }, callback);
}

function callS3(type, spec, callback) {
    s3[type + "Object"]({
        Bucket: spec.bucket,
        Key: spec.key
    }, callback)
}
