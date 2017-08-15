from django.conf import settings
from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'^page',     views.page),
    url(r'^image',    views.image),
    url(r'^document', views.document),
]
