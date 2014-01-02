# Fine Uploader Flask Traditional Example


## Supported Features
- Chunking
- Auto-resume
- Retrying
- Delete
- Handles multipart-encoded requests
- Handles a traditional endpoint


## How to ...

1. Install dependencies

```
pip install -r requirements.txt
```

2. Copy Fine Uploader sources into static files:

```
cp fine-uploader/* static/fine_uploader
```

3. Run server with:

```
python app.py
```

Uploads are stored in `./media/uploads`
This can be changed by editing `settings.py`.
