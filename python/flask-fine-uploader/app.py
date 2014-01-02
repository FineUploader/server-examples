#!/usr/bin/env python
import json
import os
import os.path
import shutil
import sys

from flask import current_app, Flask, jsonify, render_template, request
from flask.views import MethodView

# Meta
##################
__version__ = '0.1.0'

# Config
##################
DEBUG = True
SECRET_KEY = 'development key'

BASE_DIR = os.path.dirname(__file__)

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
UPLOAD_DIRECTORY = os.path.join(MEDIA_ROOT, 'upload')
CHUNKS_DIRECTORY = os.path.join(MEDIA_ROOT, 'chunks')

app = Flask(__name__)
app.config.from_object(__name__)

# Utils
##################
def make_response(status=200, content=None):
    return current_app.response_class(json.dumps(content,
        indent=None if request.is_xhr else 2), mimetype='text/plain')


def validate(attrs):
    try:
        #required_attributes = ('qquuid', 'qqfilename')
        #[attrs.get(k) for k,v in attrs.items()]
        return True
    except Exception, e:
        return False


def handle_delete(uuid):
    location = os.path.join(app.config['UPLOAD_DIRECTORY'], uuid)
    print(uuid)
    print(location)
    shutil.rmtree(location)

def handle_upload(f, attrs):

    chunked = False
    dest_folder = os.path.join(app.config['UPLOAD_DIRECTORY'], attrs['qquuid'])
    dest = os.path.join(dest_folder, attrs['qqfilename'])


    # Chunked
    if attrs.has_key('qqtotalparts') and int(attrs['qqtotalparts']) > 1:
        chunked = True
        dest_folder = os.path.join(app.config['CHUNKS_DIRECTORY'], attrs['qquuid'])
        dest = os.path.join(dest_folder, attrs['qqfilename'], str(attrs['qqpartindex']))

    save_upload(f, dest)

    if chunked and (int(attrs['qqtotalparts']) - 1 == int(attrs['qqpartindex'])):

        combine_chunks(attrs['qqtotalparts'],
            attrs['qqtotalfilesize'],
            source_folder=os.path.dirname(dest),
            dest=os.path.join(app.config['UPLOAD_DIRECTORY'], attrs['qquuid'],
                attrs['qqfilename']))

        shutil.rmtree(os.path.dirname(os.path.dirname(dest)))


def save_upload(f, path):
    if not os.path.exists(os.path.dirname(path)):
        os.makedirs(os.path.dirname(path))
    with open(path, 'wb+') as destination:
        destination.write(f.read())


def combine_chunks(total_parts, total_size, source_folder, dest):

    if not os.path.exists(os.path.dirname(dest)):
        os.makedirs(os.path.dirname(dest))

    with open(dest, 'wb+') as destination:
        for i in xrange(int(total_parts)):
            part = os.path.join(source_folder, str(i))
            with open(part, 'rb') as source:
                destination.write(source.read())


# Views
##################
@app.route("/")
def index():
    return render_template('fine_uploader/index.html')


class UploadAPI(MethodView):

    def post(self):
        if validate(request.form):
            handle_upload(request.files['qqfile'], request.form)
            return make_response(200, { "success": True })
        else:
            return make_response(400, { "error", "Invalid request" })

    def delete(self, uuid):
        try:
            handle_delete(uuid)
            return make_response(200, { "success": True })
        except Exception, e:
            return make_response(400, { "success": False, "error": e.message })

upload_view = UploadAPI.as_view('upload_view')
app.add_url_rule('/upload', view_func=upload_view, methods=['POST',])
app.add_url_rule('/upload/<uuid>', view_func=upload_view, methods=['DELETE',])


# Main
##################
def main():
    app.run('0.0.0.0')
    return 0

if __name__ == '__main__':
    status = main()
    sys.exit(status)
