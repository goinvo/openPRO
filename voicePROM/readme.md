# voicePROM
Smart speaker application that provides a Voice enabled method to submit responses to a PROM platform. Short, scheduled, structured. Prototype should demonstrate: Medication adherence, treatment follow-up, or daily QOL check-in. We imagine this expanding to be more, a multimodal reminder and reporter. It is a platform that keeps track of a patient’s PROs, all of which are to be delivered on a schedule (repeating and non-repeating)

## Multiple modes of interaction
- Voice
  - Administer PROs on request (from a select group)
  - Common commands are supported directly
     - I took my medicine
     - I took 2 pills
     - I forgot my medicine today
     - I got 5 hours sleep
     - My pain is a 6
  - Delivers audio report
  - Requests to send data on scheduled reporting frequency
- Simple visual
  - Alexa notification (glow yellow) instructs to interact
  - IoT device light as reminder for a prescribed action, such as take a pill
  - Small text
  - IoT device may display small text describing requested interaction
- Simple button (or 2)
  - Acknowledge IoT device light for simple action like, “took my pills” or “exercised”
  - May need second to “cancel”. As in, cancel the notification, but not send the occurrence event
  - Input a numeric PROm result such as “4” for 4 hours of sleep, or “2” for pain level.

## Schedule to get here
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

## Future
- Sent report could contain real FHIR bundles
- Instead of sending report by email, could push a FHIR resource.
- Integration with the other openPRO services
