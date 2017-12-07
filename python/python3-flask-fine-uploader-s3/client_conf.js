var fine_u_conf = {
    debug: true,
    element: document.getElementById('fine-uploader'),
    cors: {
      expected: true
    },
    objectProperties: {
      bucket: 'somebucket',
      host: 'some.s3.server.ac.uk'
    },
    request: {
        endpoint: 'https://somebucket.some.s3.server.ac.uk',
        accessKey: 'XXXXXXXXXXXXXXXXXXXX',
        params: { dataset: '731db507-1240-44ab-a616-de95f02aeaa4' }
    },
    signature: {
        endpoint: "/s3/sign"
    },
    uploadSuccess: {
        endpoint: "/s3/success"
    },
    deleteFile: {
        enabled: true,
        endpoint: "/s3/delete"
    },
    iframeSupport: {
        localBlankPagePath: "success.html"
    },
    chunking: {
        enabled: true,
        concurrent: {
            enabled: true
        }
    },
    resume: {
        enabled: true
    },
    retry: {
        enableAuto: false,
        preventRetryResponseProperty: "error"
    }
}
