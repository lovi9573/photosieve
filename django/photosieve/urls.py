"""homeweb URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from . import views
from django.views.generic import TemplateView


urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='index.html'), name="index"),
    #Get: List of archive names
    #POST: Create new archive
    url(r'^rest/archives$', views.Rest_Archives.as_view(), name="rest_archive"),
    #Get: List of filenames
    #Post: Save a file into the archive 
    url(r'^rest/archives/([^/]*)$', views.Rest_Archive.as_view(), name="rest_archive"),
    #Get: Base64 encoded image
    #Post: Update an attribute of the image
    url(r'^rest/archives/([^/]*)/([^/]*)$', views.Rest_Filename.as_view(), name="rest_filename"),
    #Get: The album.zip created during a prior POST
    #Post: A list of files to be placed in a zip file
    url(r'^rest/zip$', views.Rest_Zip.as_view(), name="rest_filename")
]
