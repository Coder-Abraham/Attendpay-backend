import sys
import os
from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Only start the scheduler when actually serving (not during migrate,
        # collectstatic, shell, or any other management command).
        run_main = os.environ.get('RUN_MAIN')  # set by Django dev server
        is_gunicorn = 'gunicorn' in sys.argv[0] if sys.argv else False
        is_runserver = 'runserver' in sys.argv

        if not (is_gunicorn or is_runserver or run_main):
            return

        try:
            from . import scheduler
            scheduler.start()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                f'[Scheduler] Failed to start: {e}'
            )
