# openPRO Platform
Platform for clinicians and patients to administer and communicate PROMs, ad hoc. 

## Purpose/Goals
- Make PROs accessible to patient, with ability to get results to doctor
- Make PROs more convenient to patients, and appropriate for a wider range of situations
- Provide a platform for distributing the Symptom Identifier, ROS reporter, and Voice PROMs.

## Components
- Design the system map and workflows
- Design & Implement: Low overhead, insecure but anonymous, web service to request, fill out, and receive PROs
    - Custom forms from other products
    - from PROM library (PROMIS)
- Design & Implement: Smart on FHIR app that fetches the anonymous responses and attaches identity to the PRO for insertion into EHR.
- Develop: script to produce associated FHIR Condition resources from questionnaire
    - Design for future ability to plug-in customization for EHR vendor
