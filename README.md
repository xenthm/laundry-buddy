# **Motivation**
Doing laundry in a communal living environment can prove to be a frustrating task. Not being able to check if the dryers and washers are free for use without physically hauling their entire laundry load up/down to the laundry room, users may find it difficult to time when to do their laundry. Our project hopes to be able to relieve users of such an inconvenience, automatically updating the laundry room status via an application or a display (that is placed in common areas). Other grievances associated with doing one’s laundry such as dealing with users that do not collect their load in a timely manner will also be tackled with our application’s features.

# **Aim** 
We hope to:
1. Present a hardware proof-of-concept, to show live updates of the laundry room via the Internet. This will be done with a microcontroller that utilizes a WiFi module and light sensors.  
2. Live updates will include: Names of machines that are free, time left on machines that are still running. Data will be sent to a database (MongoDB) via the Internet.
3. An Android application with the features below.
4. Summary statistics for prior weeks’ laundry “traffic”, allowing users to plan the best time to do their laundry. For example, a “This time last week” tab to show the laundry room use at the same time last week. Suggestions can also be made for when is the best time to do laundry. load. Other users can also use the application to report/inform users that do not collect their load within 5 minutes. 
5. Optional user sign-in feature for people that would like to tag a machine to their identity. With this, an automatic timer is set to remind them to collect their load.

# **Features**
## **User login system (core)**
Accounts associated with the user, allowing the user to track their laundry and receive alerts once their laundry is completed. 
## **Hardware module status sensor (core)**
Powered by the ESP32-S3 board, it makes use of light sensors and a WiFi module to send sensor data to the database via the Internet. (Assumption: The machines will have a LED that indicates when it is in use)
## **Hardware module door sensor (core)**
Powered by the ESP32-S3 board, a IR beam break sensor will sense when a protrusion attached to the machine door is in the way, effectively detecting if the door is opened or closed. This will be used by the laundry removed notification feature. 
## **Laundry status screen (core)**
A dashboard that shows the number of available machines (washers and dryers) in their place of residence. This dashboard also expands to show the time till the next machine’s availability and a timer of the user’s machine.
## **Cycle complete notification (core)**
A notification that alerts the user when their selected machine is done with their cycle. This alert will pop up on the user’s phone when the timer hits zero.
## **Laundry removed notification (core)**
A notification that alerts the user when laundry has been removed (either by themselves or other users). This will be triggered by the opening of the machine’s door. (Assumption: the wash/dry cycle cannot be paused)

