# openPRO

## Introduction

A couple definitions

How the PRO fits into the larger connected patient. What it can do!:

This project explores several new directions for the clinical and at-home use of Patient Reported Outcomes. They focus on the patient as the nucleus of the interaction and the benefit, and explore new directions.

![Graphic: The PRO is a key component of the fully connected patient](connected_picture.png)

## The current environment

PROs are focussed on PROms, or PRO Measures. These are instruments that are heavily vetted and studied (chu, 2014) as accurately collecting targeted data and associating that data with clinically relevant measures. They typically yield a single numeric result that aims to capture the quality of the outcome. PROMs are administered via a paper questionnaires of about 10-15 scale based questions, with electronic counterparts. Recently, there has been work in developing and administering electronic adaptive forms that change and react due to patient responses. 

### What the PROMs have been accomplishing
+ Clinical trial data. Drug approval. (Marquis 2011, Bottomley 2009)
+ Screening
+ Monitoring
+ Identify effective treatments for a particular patient cohort.

## What we see in the current scene
### Goals
+ The Patient Centric PRO
+ Query population to identify unmet needs in R&D and medical practice (Grossman 2018)
+ Aggregate treatment outcomes in a patient-centric lens to help future patients make the best decisions for themselves (Hostetter 2018, Greenhalgh 2017, Grossman 2018, CancerLinQ and Mitre)
+ Query population to align medical practice with the local patient community (Grossman 2018)
+ Ease and improve the use of existing measures.

### What challenges are blocking these goals?
+ Integration (Wagle, 2017)
+ Accessible and annotated libraries (PRO FHIR IG, 2018)
+ Applicability of patient group
+ Quick implementation and administration

### What are people doing about it?
+ Strategic workshops such as FasterCures 2017 workshop. (Grossman 2018)
+ Portal integration
+ Promise (Cella 2007; Broderick 2013)
  Database and administration platform of vetted and studied measures.
+ Fhir PRO

## We are exploring some new directions
+ The PRO as a communication tool
    + Open-ended information gathering
    + Structured data that is compatible with health records
+ The PRO as a tool to ease clinician burden
    + Use to lower the amount of data gathering during appointments
+ The PRO as tool to complete the patient record
    + Provides data for future research
    + Permits patient to report clinically relevant information at the point of pain, when it is most reliable.
    +Promotes accurate record of treatments and outcomes for a given patient.

![Graphic: New Visions for the PRO at home and at the doctors office](new_uses.png)

## Products
This repository contains a suite of products. Each begins as a concept. Read the 

1 sentence statement of intent
A use case narrative
Purpose/larger goals
Scope / List of components
Any additional features
A mockup or a system map. Some sort of a start to show we’re serious about doing something.
Voice PROM
Smart speaker application that provides a Voice enabled method to submit responses to a PROM platform.
Short, scheduled, structured
NOT generic PROm support…. Right?
Prototype should demonstrate: Medication adherence, treatment follow-up, or daily QOL check-in
What is the structure of the data? What does it produce? What does it do with it? Determined by PROm platform?
Purpose/Goals
Improve compliance: low-burden, daily reminder
Improve timing: capture at consistent and convenient time
Components
Imagine: a few use cases
Design: System map
Design: Administrative functions: how do you get it to the patient
Design: Voice interface
Develop: Voice interface prototype
Additional features


Symptom Identifier
“Patient-owned” application that captures a subjective nebulous idea of symptoms and creates a structured collection of data that can be conveniently and consistently shared with clinicians in person, via email/text, and via the Medical Record..
Purpose/Goals
Improve communication between patient and care team
Improve fidelity of information from patient, by recording events and pains closer to relevant time and place (point of pain)
Lower stress on patient and improve fidelity of data during transfers of care
Components
Design & Develop: Web Interface to identify symptom and collect relevant info (onset, intensity, location, etc.)
Design & Develop:  Receipt for patient in both plain English and medical language for sharing, cutting & pasting, printing, etc.
Develop: script to prepare FHIR Condition resource, ready for integration
Additional features
Language support
Accessibility support

ROS reporter
Application that captures a Review of Systems for a patient, leading up to an clinician encounter. Can be requested by Clinician either in office, or at home before appointment, or in waiting room. 
Purpose/Goals
Saves time for face-to-face encounter
Saves data entry time for clinician
More honest results
More reliable entry into EHR of ALL data. 
Components
Design & Develop: underlying FHIR Questionnaire
Design & Develop: Web interface to administer questionnaire and produce QuestionnaireResponse
Design & Develop:  Receipt for patient in plain English and proper medical language for sharing, cutting & pasting, printing, etc.
Develop: script to produce associated FHIR Condition resources from questionnaire
openPRO Platform
Platform for clinicians and patients to administer and communicate PROMs, ad hoc. 
Purpose/Goals
Make PROs accessible to patient, with ability to get results to doctor
Make PROs more convenient to patients, and appropriate for a wider range of situations
Provide a platform for distributing the Symptom Identifier, ROS reporter, and Voice PROMs.
Components
Design the system map and workflows
Design & Implement: Low overhead, insecure but anonymous, web service to request, fill out, and receive PROs
Custom forms from other products
from PROM library (PROMIS)
Design & Implement: Smart on FHIR app that fetches the anonymous responses and attaches identity to the PRO for insertion into EHR.
Develop: script to produce associated FHIR Condition resources from questionnaire
Design in ability to plug-in customization for EHR vendor
PROM repo 
Provide an indexed, annotated, repository of PRO measures.
Purpose/Goals
Satisfy the need for a searchable repository that contains validation and intended use.
Facilitate integration of results into EHRs by providing instruments as a standard FHIR questionnaire, and encourage users to submit questionnaires engineered for specific vendors.
Encourage correct and appropriate usage of measures by providing appropriate metadata within questionnaires, and providing a searching platform.
Components
Design & develop: FHIR extension for meta data.
I have no idea what goes into this. Is this scary?
Engineer: backend for repo
Design & develop: repo front end
Additional features
Instruments are administered via the openPRO Platform


References
https://docs.google.com/document/d/1fAE18PLHUfr7rt9vRky85bf4wOxZhp0pmk_qFT8C1gE/edit?usp=sharing
