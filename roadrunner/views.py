import json

from django.conf import settings
from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from wagtail.wagtailcore.models import Page
from wagtail.wagtaildocs.models import Document
from wagtail.wagtailimages.models import Image

class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

def image(request, format=None):
    if not request.user.is_authenticated():
        return JSONResponse(False)

    if 'id' in request.GET:
        imageId = request.GET['id']
        image = Image.objects.filter(pk=imageId).first()
        if image is not None:
            return JSONResponse(settings.MEDIA_URL + str(image.file))

    return JSONResponse(False)

def page(request, format=None):
    if not request.user.is_authenticated():
        return JSONResponse(False)

    if 'id' in request.GET:
        pageId = request.GET['id']
        page = Page.objects.filter(pk=pageId).first()
        if page is not None:
            return JSONResponse(page.title)

    return JSONResponse(False)

def document(request, format=None):
    if not request.user.is_authenticated():
        return JSONResponse(False)

    if 'id' in request.GET:
        docId = request.GET['id']
        document = Document.objects.filter(pk=docId).first()
        if document is not None:
            return JSONResponse(document.title)

    return JSONResponse(False)


