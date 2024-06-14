#include <WiFi.h>
#include <Arduino_JSON.h>
#include <HTTPClient.h>
#include <elapsedMillis.h>
#include "config.h" // contains WiFi credentials and server details

#define MACHINE_ID "test machine"

#define LDR_PIN 2
#define START_BUTTON 9
#define LED_PIN 19

// for testing without sending requests
const bool enableHTTP = true;

bool state = false;
elapsedMillis since_press;  // keeps track of time elaspsed between button presses
HTTPClient http;
JSONVar req;

void setHTTPClient(const char* endpoint) {
  String server_path = String(server_name) + endpoint;
  http.begin(server_path.c_str());
  http.setTimeout(1000 * 90); // Set timeout to 1.5 minutes
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

void sendRequest() {
  int httpResponseCode = http.POST(JSON.stringify(req));
  handleResponse(http.getString(), httpResponseCode);
}

void toggleState() {
  state = !state;
  req["state"] = state ? "on" : "off";
  
  // for testing without sending requests
  if (enableHTTP) {
    sendRequest();
  }

  digitalWrite(LED_PIN, state);
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  pinMode(LDR_PIN, INPUT);
  pinMode(START_BUTTON, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  // for testing without sending requests
  if (enableHTTP) {
    setHTTPClient("/api/machine/set-state");
    req["machine_id"] = MACHINE_ID;
    req["state"] = "off";
    sendRequest();
  }
}

void loop() {
  int analogValue = analogRead(LDR_PIN);
  Serial.printf("ADC analog value = %d\n", analogValue);

  // toggle LED when button is pressed 250ms after previous press
  if (since_press > 250 && !digitalRead(START_BUTTON)) {
    if (WiFi.status() == WL_CONNECTED) {
      since_press = 0;
      toggleState();
    } else {
      Serial.println("WiFi Disconnected");
    } 
  }

  delay(100);
}