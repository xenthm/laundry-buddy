#include <WiFi.h>
#include <Arduino_JSON.h>
#include <HTTPClient.h>
#include <elapsedMillis.h>
#include "config.h" // contains WiFi credentials and server details

#define MACHINE_ID "test machine"

#define LDR_PIN 2
#define START_BUTTON 9
#define LED_PIN 19

bool led_state = false;
elapsedMillis since_press;  // keeps track of time elaspsed between button presses

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
  pinMode(START_BUTTON, INPUT_PULLDOWN);
  pinMode(LED_PIN, OUTPUT);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String server_path = String(server_name) + "/api/auth/login";
    http.begin(server_path.c_str());
    http.setTimeout(1000 * 60); // Set timeout to 1min

    http.addHeader("Content-Type", "application/json");
    JSONVar jsonObject;
    jsonObject["username"] = "asdf";
    jsonObject["password"] = "asdf";
    String requestBody = JSON.stringify(jsonObject);

    int httpResponseCode = http.POST(requestBody);
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String payload = http.getString();
      Serial.println(payload);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == -11) {
        Serial.println("HTTP Connection failed");
      }
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

void loop() {
  int analogValue = analogRead(LDR_PIN);
  Serial.printf("ADC analog value = %d\n", analogValue);

  // toggle LED when button is pressed 250ms after previous press
  if (since_press > 250 && digitalRead(START_BUTTON)) {
    since_press = 0;
    led_state = !led_state;
    digitalWrite(LED_PIN, led_state);
  }

  delay(100);
}