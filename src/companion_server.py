"""
JARVIS Companion Gateway Server
Backward-compatible wrapper pointing to cloud_server.py
"""

import os
from cloud_server import create_cloud_app, web, logger

if __name__ == "__main__":
    host = os.getenv("JARVIS_HOST", "0.0.0.0")
    port = int(os.getenv("JARVIS_PORT", "8000"))
    logger.info("Starting JARVIS Gateway on %s:%d", host, port)
    app = create_cloud_app()
    web.run_app(app, host=host, port=port)
