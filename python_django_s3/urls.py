from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'python_django_s3.views.home', name='home'),
    # url(r'^python_django_s3/', include('python_django_s3.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),

    url(r'^$', 'views.home', name='home'),
    url(r'^s3/signature', 'views.handle_s3', name="s3_signee"),
    url(r'^s3/delete', 'views.handle_s3', name='s3_delete'),
    url(r'^s3/success', 'views.success_redirect_endpoint', name="s3_succes_endpoint")
)
