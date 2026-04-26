---
title: "Flip Dots"
description: "Electromechanical flip-dot display driven by custom software."
publishDate: 2023-04-01
coverImage: ./flip_dot_01.jpeg
tags: ["Programming", "Hardware"]
youtubeId: "b2UMsdL5N1Y"
githubRepo: "TheChaseFiore/Dotty"
---

```python
# MQTT callbacks — commands arrive as strings on dotty/command
def _mqtt_on_connect(client, userdata, flags, rc, properties=None):
    log.info("MQTT connected rc=%s flags=%s", rc, flags)
    if rc == 0:
        client.publish("dotty/status", "online", qos=1, retain=True)
        client.subscribe("dotty/command")
    else:
        log.warning("MQTT connect returned rc=%s", rc)

def _mqtt_on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode(errors="ignore").strip()
    except Exception:
        payload = "<binary>"
    log.info("MQTT RX %s -> %s", msg.topic, payload)
    if payload:
        try:
            command_queue.put_nowait(payload)
        except queue.Full:
            log.warning("Command queue full; dropping MQTT command")

def _mqtt_on_disconnect(client, userdata, rc):
    log.warning("MQTT disconnected rc=%s", rc)
```
