import datetime
from mongoengine import *

class Sighting(Document):
  person    = StringField(required = False)
  message   = StringField(required = False)
  address   = StringField(required=True)
  location  = GeoPointField(required = True)
  time      = DateTimeField(default=datetime.datetime.now, required = True)
