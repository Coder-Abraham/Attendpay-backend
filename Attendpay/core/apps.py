import sys
from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Don't start the scheduler during management commands (migrate, makemigrations, etc.)
        # or during testing — only start when the actual server runs.
        if 'runserver' not in sys.argv and 'gunicorn' not in sys.argv[0]:
            return
        from . import scheduler
        scheduler.start()
