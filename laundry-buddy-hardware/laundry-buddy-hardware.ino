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
JSONVar req;

void setHTTPClient(HTTPClient& http, char* endpoint) {
  http.begin((String(server_name) + endpoint).c_str());
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
  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  HTTPClient http;
  setHTTPClient(http, "/api/machine/set-state");

  int httpResponseCode = http.POST(JSON.stringify(req));
  handleResponse(http.getString(), httpResponseCode);
  
  http.end();
  WiFi.disconnect(true);
  Serial.println("WiFi Disconnected");
}

void toggleState() {
  state = !state;
  digitalWrite(LED_PIN, state);
  
  if (enableHTTP) {
    req["state"] = state ? "on" : "off";
    sendRequest();
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(LDR_PIN, INPUT);
  pinMode(START_BUTTON, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  
  req["machine_id"] = MACHINE_ID;
  req["state"] = "off";

  // for testing without sending requests
  if (enableHTTP) {
    sendRequest();
  }
}

void loop() {
  int analogValue = analogRead(LDR_PIN);
  Serial.printf("ADC analog value = %d\n", analogValue);

  // toggle LED when button is pressed 250ms after previous press
  if (since_press > 250 && !digitalRead(START_BUTTON)) {
    since_press = 0;
    toggleState();
  }

  delay(100);
}