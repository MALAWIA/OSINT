"""
WSGI config for nse_auth project.

It exposes the WSGI callable as a module-level variable named ``application``.

Typically this file is called ``wsgi.py``; it should probably be placed in the same directory as
your ``settings.py``.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nse_auth.settings')

application = get_wsgi_application()
