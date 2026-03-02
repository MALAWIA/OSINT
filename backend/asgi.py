"""
ASGI config for nse_auth project.

It exposes the ASGI callable as a module-level variable named ``application``.

Typically this file is called ``asgi.py``. It is probably a good idea to put it in the same
directory as your ``settings.py``.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nse_auth.settings')

application = get_asgi_application()
