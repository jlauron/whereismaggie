DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

DATABASE_ENGINE   = 'dummy' # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME     = ''       # Or path to database file if using sqlite3.
DATABASE_USER     = ''       # Not used with sqlite3.
DATABASE_PASSWORD = ''       # Not used with sqlite3.
DATABASE_HOST     = ''       # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT     = ''

TIME_ZONE = 'America/New_York'

LANGUAGE_CODE = 'en-us'

SITE_ID = 1

USE_I18N = False
USE_L10N = False

SECRET_KEY = 'asdasdasd'

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
)

ROOT_URLCONF = 'mag.urls'

INSTALLED_APPS = (
	'mag'
)

import mongoengine
mongoengine.connect('mag')
