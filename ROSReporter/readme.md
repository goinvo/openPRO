# ROS reporter
A review of systems (ROS) is a gathering of targeted medical information such as symptoms from a patient. Reimbursement models push doctors to ask more and more particular sets of questions, consuming precious in-encounter time. In the interest of time, issues that are medically relevant or important to the patient may not be addressed6, creating an incomplete picture from which the doctor assesses and plans treatment.

The ROS Reporter is an interactive web application will allow the patient to submit responses in privacy and comfort outside the encounter, either at home before a visit or while waiting at the office. Some clinics and offices distribute ROS forms, either by paper or electronically to patients when they arrive at reception or by a nurse. These questionnaires have several deficiencies:

- They feel irrelevant. The patient answers in the negative for row after row of questions that are not related to the purpose of the visit. The forms are one-size-fits all.
- They are often tedious and inefficient. Paper questionnaires are often poorly designed and require manual entry into the EHR. Electronic questionnaires are often time consuming as they ask many sequential questions with negative responses.
- The data collected is insufficient. The doctor or nurse asks the relevant questions again, with multiple follow-up questions such as frequency, severity, and timing.

### Goals
- Improve communication between the patient and care team
- Improve the fidelity and relevance of information from the patient, by recording events and pains closer to relevant time and place (point of pain)
- Provide designs that minimize survey fatigue and maximize the collection of relevant data.
- Lower stress on the patient and improve the fidelity of data during transfers of care
- Provide language and accessibility support

### Components
- Web interface to identify symptoms and collect relevant info (onset, intensity, location, etc.). The questionnaire is responsive and intelligent, focusing on systems and lines of questions relevant to the patient’s conditions.
- Receipt for the patient in both plain English and medical language for sharing, easy reference, printing, etc.
- FHIR resources enumerating the captured conditions using standard coding schema. This is a first step in importing the data into a health record.


### Estimated Level of Effort
Design: 4 weeks, 1.0FTE
Development v1.0: 6 weeks, 1.0FTE
