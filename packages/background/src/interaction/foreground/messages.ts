import { OWalletError, Message } from "@owallet/router";
import { ROUTE } from "./constants";
import { InteractionWaitingData } from "../types";

export class InteractionPingMsg extends Message<boolean> {
  public static type() {
    return "interaction-ping";
  }

  constructor(
    public readonly windowId: number | undefined,
    public readonly ignoreWindowIdAndForcePing: boolean
  ) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return InteractionPingMsg.type();
  }
}

export class PushInteractionDataMsg extends Message<void> {
  public static type() {
    return "push-interaction-data";
  }

  constructor(public readonly data: InteractionWaitingData) {
    super();
  }

  validateBasic(): void {
    if (!this.data.type) {
      throw new OWalletError("interaction", 101, "Type should not be empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PushInteractionDataMsg.type();
  }
}

export class PushEventDataMsg extends Message<void> {
  public static type() {
    return "push-event-data";
  }

  constructor(
    public readonly data: Omit<
      InteractionWaitingData,
      "id" | "uri" | "isInternal" | "tabId" | "windowId"
    >
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.data.type) {
      throw new OWalletError("interaction", 101, "Type should not be empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return PushEventDataMsg.type();
  }
}
