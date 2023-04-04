import { init_gpio } from "./gpio";
import { createEffect } from "solid-js";
import utilishared from "@depict-ai/utilishared";
import { WebSocket } from "ws";
import { run_catch_log } from "./utils";

export function pump_toggling(gpio: Awaited<ReturnType<typeof init_gpio>>) {
  // @ts-ignore
  globalThis.WebSocket = WebSocket;
  const socket = new utilishared.DepictAPIWS("ws://192.168.178.170:9321");

  createEffect(
    run_catch_log(async () => {
      const switch_state = gpio.inputs.pump_switch();
      const [result] = (await socket?.ensure_sent({
        id: utilishared.random_string(),
        command: "write-gpio",
        value: {
          output: "garden_pump",
          new_state: !switch_state, // Inverted here so that if the cable breaks the pump is off
        },
      })) as any;

      console.log("set gpio result", result, "(we set it to", switch_state, ")");
    })
  );
}
