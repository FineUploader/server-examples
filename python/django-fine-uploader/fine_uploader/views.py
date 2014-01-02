import json
import logging
import os
import os.path
import shutil

from django.conf import settings
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View

from fine_uploader.forms import UploadFileForm
from fine_uploader import utils

logger = logging.getLogger('django')

##
# Utils
##
def make_response(status=200, content_type='text/plain', content=None):
    response = HttpResponse()
    response.status_code = status
    response['Content-Type'] = content_type
    response.content = content
    return response


##
# Views
##
def home(request):
    """ The 'home' page. Returns an HTML page with Fine Uploader code
    ready to upload.
    """
    return render(request, 'fine_uploader/index.html')


class UploadView(View):
    """ View which will handle all upload requests sent by Fine Uploader.
    See: https://docs.djangoproject.com/en/dev/topics/security/#user-uploaded-content-security"""

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super(UploadView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            handle_upload(request.FILES['qqfile'], form.cleaned_data)
            return make_response(content=json.dumps({ 'success': True }))
        else:
            return make_response(status=400,
                content=json.dumps({
                    'success': False,
                    'error': '%s' % repr(form.errors)
                }))

    def delete(self, request, *args, **kwargs):
        qquuid = kwargs.get('qquuid', '')
        if qquuid:
            try:
                handle_deleted_file(qquuid)
                return make_response(content=json.dumps({ 'success': True }))
            except Exception, e:
                return make_response(status=400,
                    content=json.dumps({
                        'success': False,
                        'error': '%s' % repr(e)
                    }))
        return make_response(status=404,
            content=json.dumps({
                'success': False,
                'error': 'File not present'
            }))

def handle_upload(f, fileattrs):
    logger.info(fileattrs)

    chunked = False
    dest_folder = os.path.join(settings.UPLOAD_DIRECTORY, fileattrs['qquuid'])
    dest = os.path.join(dest_folder, fileattrs['qqfilename'])

    # Chunked
    if int(fileattrs['qqtotalparts']) > 1:
        chunked = True
        dest_folder = os.path.join(settings.CHUNKS_DIRECTORY, fileattrs['qquuid'])
        dest = os.path.join(dest_folder, fileattrs['qqfilename'], str(fileattrs['qqpartindex']))
        logger.info('Chunked upload received')

    utils.save_upload(f, dest)
    logger.info('Upload saved: %s' % dest)

    if chunked and (fileattrs['qqtotalparts'] - 1 == fileattrs['qqpartindex']):

        logger.info('Combining chunks: %s' % os.path.dirname(dest))
        utils.combine_chunks(fileattrs['qqtotalparts'],
            fileattrs['qqtotalfilesize'],
            source_folder=os.path.dirname(dest),
            dest=os.path.join(settings.UPLOAD_DIRECTORY, fileattrs['qquuid'], fileattrs['qqfilename']))
        logger.info('Combined: %s' % dest)

        shutil.rmtree(os.path.dirname(os.path.dirname(dest)))

def handle_deleted_file(uuid):
    logger.info(uuid)

    loc = os.path.join(settings.UPLOAD_DIRECTORY, uuid)
    shutil.rmtree(loc)
