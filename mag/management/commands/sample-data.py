from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from mag.models import Sighting

class Command(BaseCommand):
    args = '<poll_id poll_id ...>'
    help = 'Creates a random sampling of data points'

    def handle(self, *args, **options):
      Sighting.objects.all().delete()

      for x in xrange(100):
        Sighting.objects.create(
          person = "person %d" % x,
          message = "message %d" % x,
          address = "address %d" % x,
          time = datetime.now() + timedelta(minutes = x),
          location = [x, x]
        )
