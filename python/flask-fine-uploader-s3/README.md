# Python + Flask + Amazon S3 + Fine Uploader
<small>= crazy delicious</small>

> client-side code not included.

## Instructions
1. Install dependencies

    `pip install -r requirements.txt`

2. Set environment variables

    ```
    export AWS_CLIENT_SECRET_KEY='keep me secret!'
    export AWS_SERVER_PUBLIC_KEY='who cares if i am secret'
    export AWS_SERVER_PRIVATE_KEY='keep me secret!'
    ```

3. Get the static files

    http://fineuploader.com/downloads
    
4. Make your template

    ```bash
    mkdir templates
    touch templates/index.html
    vim index.html
    ```

5. [Enable Fine Uploader](http://docs.fineuploader.com)
6. Run the server

    `python app.py`

7. Enjoy!

YMMV.
