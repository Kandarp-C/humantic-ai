from app.tasks.celery_app import celery

celery.conf.beat_schedule = {
    "retry-failed-topics-every-hour": {
        "task": "app.tasks.research_task.retry_failed_topics",
        "schedule": 3600.0,
    },
    "refresh-pinned-interests-every-6h": {
        "task": "app.tasks.research_task.refresh_pinned_interests",
        "schedule": 21600.0,
    },
}

celery.conf.timezone = "UTC"
