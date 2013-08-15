$(document).ready(function () {
    
    $("#fine-uploader-s3").fineUploaderS3({
        debug: true,
        request: {
            endpoint: 'http://fineuploadertest.s3.amazonaws.com',
            accessKey: 'AKIAJEQ4NDFBCZAMWGUQ',
            successEndpoint: '/s3/success',
            signatureEndpoint: '/s3/signature',
            successRedirectEndpoint: '/success.html'
        },
        chunking: {
            enabled: true
        },
        deleteFile: {
            enabled: true,
            endpoint: '/s3/delete'
      }
    });
    
});

