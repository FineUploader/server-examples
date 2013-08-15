#!/usr/bin/env python
import os
import sys
try:
    import settings
except ImportError:
    import sys
    sys.stderr.write("Error: could not find the file `settings.py`")
    sys.exit(1)

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

    from django.core.management import execute_from_command_line, execute_manager

    execute_manager(settings)
