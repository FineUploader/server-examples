$(document).ready(function () {
    
    $("#fine-uploader-s3").fineUploaderS3({
          request: {
                    endpoint: 'http://fineuploadertest.s3.amazonaws.com',
                    accessKey: 'ACCESS_KEY',
                    signatureEndpoint: '/s3/signature',
                    successRedirectEndpoint: '/success.html'
                },
          deleteFile: {
                    enabled: true,
                    endpoint: '/s3/delete'
                }
        });
    
});

