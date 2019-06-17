# voicePROM
voicePROM is a voice-first platform that collects short, scheduled, and structured data from the patient with convenient low-burden methods. The collected elements are drawn from a pre-built set of care-plan adherence measures and standard questionnaire formats

Voice-first solutions in the medical space are making slow but focussed progress. Much of this progress is in the clinical documentation realm, allowing clinicians to not only dictate medical notes, but capture the structure data needed in the EHRs by voice (Nuance, Winscribe, and more). These however are confined to the clinic and do not help patients in their home-care and care plan adherence. On the other hand, there are Alexa Skills available that can help with medication reminders or with tracking symptoms, but they do not provide reporting and they are awkward to configure and use. To our knowledge, there are no publicly available voice interfaces for collecting PROMs or questionnaires.

### Current state: gestating
Using the Alexa and AWS services from the Amazon ecosystem, we’ve developed a simple smart speaker application. The patient reports medication adherence and sleep, and the platform records that data. We are currently working on a scheduling and reminder system to ensure daily reporting and to alert the user if a questionnaire is waiting completion.

### Feature roadmap
see voicePRO version maps.pdf.
0. Med and pain report. Internal.
  - “I took my medicine”
  - “I got 6 hours of sleep”
  - “I had a migraine today”.
1. Storage
  - Users have identities.
  - On exit, save data to storage for that user
2. Scheduler service
  - sends notifications if you don't take your meds in the morning
  - sends email with aggregated report at scheduled times
  - Voice interface to configure this reminder
3. Button!
  - Microcontroller with Button(s) + light
  - Attached to a single action
  - Button A: Triggers event occurrence + resets pending flag
  - Button B: resets pending flag
  - Light: shines if pending flag is on. Then red if past due.
  - Light gives rewarding feedback
4. Server and website-based customization
  - Custom reports with attributes
    - Name: sleep, medicine, migraine
    - Occurrence flag.
    - Duration, timing
    - Follow up actions?
    - Intensity?
  - Web interface
    - Add/edit PROs
    - medications
    - Set timing and reminders for PROs in account
    - View data
    - send/schedule data sending

### Future
- Sent report could contain real FHIR bundles
- Instead of sending report by email, could push a FHIR resource.
- Integration with the other openPRO services

### Estimated Level of Effort
Minimal Prototype: 8 weeks, 1.0FTE
Design and Development v1.0: 8 weeks, 1.0FTE

## Contents
- alexa_lambda/. --  Contains files and libraries necessary to run the Alexa Skill code in AWS Lambda. Does not contain libraries that are available on that platform by default.
- shared_lib/. -- Contains a start on alerts and notification functionality.
- data/. -- Contains types for alexa Skills
- alexa_skill.json -- export of skill from the Amazon Alexa skill development interface
