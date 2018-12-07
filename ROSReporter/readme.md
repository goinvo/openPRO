# ROS reporter
Application that captures a Review of Systems for a patient, leading up to an clinician encounter. Can be requested by Clinician either in office, or at home before appointment, or in waiting room. 

## Purpose/Goals
- Saves time for face-to-face encounter
- Saves data entry time for clinician
- More honest results
- More reliable entry into EHR of ALL data. 

## Components
- Design & Develop: underlying FHIR Questionnaire
- Design & Develop: Web interface to administer questionnaire and produce QuestionnaireResponse
- Design & Develop:  Receipt for patient in plain English and proper medical language for sharing, cutting & pasting, printing, etc.
- Develop: script to produce associated FHIR Condition resources from questionnaire
