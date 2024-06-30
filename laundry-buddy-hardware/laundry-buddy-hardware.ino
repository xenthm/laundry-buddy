#include <WiFi.h>
#include <Arduino_JSON.h>
#include <HTTPClient.h>
#include <elapsedMillis.h>
#include "config.h" // contains WiFi credentials and server details

#define MACHINE_ID "test"
#define MACHINE_TYPE "washer"
#define CYCLE_DUR 1000 * 30 // in ms

#define LDR_PIN 2
#define START_BUTTON 9
#define LED_PIN 19
#define REED_PIN 10

// for testing without sending requests
const bool enableHTTP = true;

bool is_machine_running = false;
bool is_door_closed = true;
bool is_button_pressed = false;
bool is_laundry_inside = false;
elapsedMillis since_start;  // keeps track of time elaspsed since machine start
JSONVar req;

void setHTTPClient(HTTPClient& http, char* endpoint) {
  http.begin((String(server_name) + endpoint).c_str());
  http.setTimeout(1000 * 120); // Set timeout to 2 minutes
  http.addHeader("Content-Type", "application/json");
}

void handleResponse(const String& payload, const int httpResponseCode) {
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println(payload);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
    if (httpResponseCode == -11) {
      Serial.println("HTTP Connection failed");
    }
  }
}

void sendRequest(const bool state) {
  if (enableHTTP) {
    req["state"] = state ? "on" : "off";
    
    WiFi.begin(ssid, password);
    Serial.print("Connecting");
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("");
    Serial.println("Connected to WiFi");
    // Serial.print("Connected to WiFi network with IP Address: ");
    // Serial.println(WiFi.localIP());

    HTTPClient http;
    setHTTPClient(http, "/api/machine");

    int httpResponseCode = http.POST(JSON.stringify(req));
    handleResponse(http.getString(), httpResponseCode);
    
    http.end();
    WiFi.disconnect(true);
    Serial.println("WiFi Disconnected\n");
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(LDR_PIN, INPUT);
  pinMode(START_BUTTON, INPUT_PULLUP);  // needs to be pull up as pin 9 is a strapping pin and will affect booting otherwise
  pinMode(REED_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  
  // resets machine status on database
  req["machineId"] = MACHINE_ID;
  req["machineType"] = MACHINE_TYPE;
  req["state"] = "off";
  req["duration"] = CYCLE_DUR;
  sendRequest(false);
}

void loop() {
  is_door_closed = !digitalRead(REED_PIN);
  is_button_pressed = !digitalRead(START_BUTTON);

  // turns LED on to signify start of cycle when button is pressed and door is closed
  if (!is_machine_running && is_door_closed && is_button_pressed) {
    // for simulation, prevent starts if door hasn't been opened after a completed cycle
    if (!is_laundry_inside) {
      Serial.println("Starting cycle\n");
      since_start = 0;
      is_machine_running = true;
      digitalWrite(LED_PIN, HIGH);
    }
  }

  // turns LED off after end of cycle
  if (is_machine_running && since_start >= CYCLE_DUR) {
    Serial.println("Finished cycle\n");
    is_machine_running = false;
    digitalWrite(LED_PIN, LOW);
  }

  // addon module check for machine status
  int ldr_val = analogRead(LDR_PIN);
  if (!is_laundry_inside && ldr_val > 4000 && is_door_closed) {
    Serial.println("Detected cycle start\n");
    is_laundry_inside = true;
    sendRequest(true);
  } else if (is_laundry_inside && ldr_val <= 4000 && !is_door_closed) {
    Serial.println("Detected laundry collected\n");
    is_laundry_inside = false;
    sendRequest(false);
  }

  delay(100);
}