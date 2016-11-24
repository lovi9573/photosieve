from __future__ import unicode_literals

from django.apps import AppConfig


class PhotoalbumConfig(AppConfig):
    name = 'photoalbum'
    THMB_WIDTH = 100;
    THMB_HEIGHT = 100;
    BASEPATH = "/home/jlovitt/temp/Archives";
