# DECISIONS

Briefly note:
- Key choices you made & trade-offs.
- Deviations from the initial spec (if any) and why.
- Next improvements you'd make if you had more time.
- Time spent per area.

# REMARKS

- Compared to the requirements for the back-end, certain aspects were already part of the base repo and have been left untouched
  - Models
  - Health Endpoint
  - Most REST endpoints due to the ModelViewSet (List/Retrieve/Create). Only slight adjustments have been made


- Next improvements you'd make if you had more time:
    * Use ADRF to replace with Async views
      Especially if there will be more long-running background task endpoints (eg. Summarize)
    * Add django-structlog for improved structured logging