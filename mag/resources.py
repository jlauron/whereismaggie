from tastypie.authorization import Authorization
from mangopie.resources     import DocumentResource
from mangopie.fields        import ApiField
from mag.models             import Sighting

# TODO add a hydrate method to enforce constraints
class GeoPointField(ApiField):
  def dehydrate(self, bundle):
    return getattr(bundle.obj, self.attribute)

class SightingResource(DocumentResource):
  location = GeoPointField(attribute = 'location')

  def obj_create(self, bundle, request=None, **kwargs):
    bundle.obj = Sighting()

    for key, value in kwargs.items():
      setattr(bundle.obj, key, value)

    bundle = self.full_hydrate(bundle)

    # Save the main object.
    bundle.obj.save()

    return bundle

  class Meta:
    object_class   = Sighting
    fields         = ['person', 'message', 'address', 'location', 'time']
    authorization  = Authorization()
