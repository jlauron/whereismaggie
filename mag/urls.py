from django.conf.urls.defaults import *
from django.conf import settings

from tastypie.api import Api
from mag.resources import SightingResource

v1_api = Api(api_name='v1')
v1_api.register(SightingResource())

handler404 = 'djfront.views.http_404'

urlpatterns = patterns('',
  url(r'^api/', include(v1_api.urls)),
)
