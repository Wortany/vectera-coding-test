# DECISIONS

## Observations
- Compared to the requirements for the back-end, certain aspects were already part of the base repo and have been left untouched
- Handled the requested front-end unit test requirement by focusing on a comprehensive, multi-scenario test suite for the primary core component.

## Improvements
  - **Back-End**:
    - Use ADRF to replace with Async views
    - Add django-structlog for improved structured logging
  - **Front-End**:
    - Switch to Angular standalone components and use Signals for template binding
    - Expand testing across all components / services and improve error handling for more endpoints and edge-cases
    - Implement full end-to-end CRUD operations for both Meetings and Notes.
    - Abstract the basic AddForm layout to a shared component to reuse for adding meetings

## Deviations
  - Integrated the Summary panel directly within the Meeting Details view due to limited requirements for the panel

## Time Spent per area:
  - **Initial Environment Setup**: 1 hour
  - **Back-End Implementation**: 5 hours
    - *Note*: Approached this test with zero prior Django experience (as indicated during the initial interview).
      Utilized this coding test to rapidly learn core Django paradigms to provide a MVP.
  - **Front-End**: 4 hours
    - Component Implementation & State Logic: 3 hours
    - Karma/Jasmine Async Test Environment Resolution: 1 hour
