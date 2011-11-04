serve:
	PYTHONPATH=.:~/deps/ django-admin runserver --settings mag.settings 0.0.0.0:8001

shell:
	PYTHONPATH=.:~/deps/ django-admin shell --settings mag.settings

sample-data:
	PYTHONPATH=.:~/deps/ django-admin sample-data --settings mag.settings 
