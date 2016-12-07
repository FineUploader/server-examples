# Python + Flask + Amazon S3 + Fine Uploader example

## Instructions
0. (recommended) Create & activate virtualenv

    `virtualenv .env && source .env/bin/activate`

1. Install dependencies (recommended: create a virtualenv)

    `pip install -r requirements.txt`

2. Set environment variables

    ```
    export AWS_SECRET_ACCESS_KEY='keep me secret!'
    export AWS_ACCESS_KEY_ID='blahblahblah'
    export S3_BUCKET='yourbucket'
    export S3_REGION='eu-west-1'
    ```

3. Run the server.  Defaults to listening on port 5000, pick others like this:

    ```
    ./app.py       # port 5000
    ./app.py 1234  # port 1234
    ```

4. Enjoy!

