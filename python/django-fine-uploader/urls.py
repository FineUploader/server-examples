from django.conf import settings
from django.conf.urls import include, patterns, static, url

from fine_uploader.views import UploadView

urlpatterns = patterns('',
    url(r'^$', 'fine_uploader.views.home', name='home'),
    url(r'^upload(?:/(?P<qquuid>\S+))?', UploadView.as_view(), name='upload'),
)
urlpatterns += static.static('/browse/', document_root=settings.UPLOAD_DIRECTORY)

