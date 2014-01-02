$(document).ready(function() {

    $("#fine-uploader").fineUploader({
        request: {
            endpoint: '/upload'
        },
        chunking: {
            enabled: true
        },
        resume: {
            enabled: true
        },
        retry: {
            enableAuto: true
        },
        deleteFile: {
            enabled: true,
            endpoint: '/upload'
        }
    });

});
