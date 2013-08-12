<?php
/**
 * PHP Server-Side Example for Fine Uploader S3.
 * Maintained by Widen Enterprises.
 *
 * Note: This is the exact server-side code used by the S3 example
 * on fineuploader.com.
 *
 * This example:
 *  - handles both CORS and non-CORS environments
 *  - handles delete file requests for both DELETE and POST methods
 *  - signs policy documents (simple uploads) and REST requests
 *    (chunked/multipart uploads)
 *
 * Requirements:
 *  - PHP 5.3 or newer
 *  - Amazon PHP SDK (only if utilizing the delete file feature)
 *
 * If you need to install the AWS SDK, see http://docs.aws.amazon.com/aws-sdk-php-2/guide/latest/installation.html.
 */

// You can remove these two lines if you are not using Fine Uploader's
// delete file feature
require 'aws-autoloader.php';
use Aws\S3\S3Client;

// These assume you have the associated AWS keys stored in
// the associated system environment variables
$clientPrivateKey = $_SERVER['AWS_SECRET_KEY'];
// These two keys are only needed if the delete file feature is enabled
$serverPublicKey = $_SERVER['PARAM1'];
$serverPrivateKey = $_SERVER['PARAM2'];

$method = getRequestMethod();

// This first conditional will only ever evaluate to true in a
// CORS environment
if ($method == 'OPTIONS') {
    handlePreflight();
}
// This second conditional will only ever evaluate to true if
// the delete file feature is enabled
else if ($method == "DELETE") {
    handlePreflightedRequest(); // only needed in a CORS environment
    deleteObject();
}
// This is all you really need if not using the delete file feature
// and not working in a CORS environment
else if	($method == 'POST') {
    handlePreflightedRequest();
    signRequest();
}

// This will retrieve the "intended" request method.  Normally, this is the
// actual method of the request.  Sometimes, though, the intended request method
// must be hidden in the parameters of the request.  For example, when attempting to
// send a DELETE request in a cross-origin environment in IE9 or older, it is not
// possible to send a DELETE request.  So, we send a POST with the intended method,
// DELETE, in a "_method" parameter.
function getRequestMethod() {
    global $HTTP_RAW_POST_DATA;

    // This should only evaluate to true if the Content-Type is undefined
    // or unrecognized, such as when XDomainRequest has been used to
    // send the request.
    if(isset($HTTP_RAW_POST_DATA)) {
    	parse_str($HTTP_RAW_POST_DATA, $_POST);
    }

    if ($_POST['_method'] != null) {
        return $_POST['_method'];
    }

    return $_SERVER['REQUEST_METHOD'];
}

// Only needed in cross-origin setups
function handlePreflightedRequest() {
    header('Access-Control-Allow-Origin: *');
}

// Only needed in cross-origin setups
function handlePreflight() {
    handlePreflightedRequest();
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
}

function getS3Client() {
    global $serverPublicKey, $serverPrivateKey;

    return S3Client::factory(array(
        'key' => $serverPublicKey,
        'secret' => $serverPrivateKey
    ));
}

// Only needed if the delete file feature is enabled
function deleteObject() {
    getS3Client()->deleteObject(array(
        'Bucket' => $_POST['bucket'],
        'Key' => $_POST['key']
    ));
}

function signRequest() {
    header('Content-Type: application/json');

    $responseBody = file_get_contents('php://input');
    $contentAsObject = json_decode($responseBody, true);
    $jsonContent = json_encode($contentAsObject);

    $headersStr = $contentAsObject["headers"];
    if ($headersStr) {
        signRestRequest($headersStr);
    }
    else {
        signPolicy($jsonContent);
    }
}

function signRestRequest($headersStr) {
    $response = array('signature' => sign($headersStr));
    echo json_encode($response);
}

function signPolicy($policyStr) {
    $encodedPolicy = base64_encode($policyStr);
    $response = array('policy' => $encodedPolicy, 'signature' => sign($encodedPolicy));
    echo json_encode($response);
}

function sign($stringToSign) {
    global $clientPrivateKey;

    return base64_encode(hash_hmac(
            'sha1',
            $stringToSign,
            $clientPrivateKey,
            true
        ));
}
?>
