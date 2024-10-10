import {
  Env,
  Handler,
  InternalHandler,
  OWalletError,
  Message,
} from "@owallet/router";
import {
  InteractionPingMsg,
  PushEventDataMsg,
  PushInteractionDataMsg,
} from "./messages";
import { InteractionForegroundService } from "./service";

export const getHandler: (service: InteractionForegroundService) => Handler = (
  service: InteractionForegroundService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case PushInteractionDataMsg:
        return handlePushInteractionDataMsg(service)(
          env,
          msg as PushInteractionDataMsg
        );
      case PushEventDataMsg:
        return handlePushEventDataMsg(service)(env, msg as PushEventDataMsg);
      case InteractionPingMsg:
        return handleInteractionPing(service)(env, msg as InteractionPingMsg);
      default:
        throw new OWalletError("interaction", 110, "Unknown msg type");
    }
  };
};

const handlePushInteractionDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushInteractionDataMsg> = (service) => {
  return (_, msg) => {
    // it can not get here
    console.log("on handle", msg.data);

    return service.pushData(msg.data);
  };
};

const handlePushEventDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushEventDataMsg> = (service) => {
  return (_, msg) => {
    return service.pushEvent(msg.data);
  };
};

const handleInteractionPing: (
  service: InteractionForegroundService
) => InternalHandler<InteractionPingMsg> = (service) => {
  return (_env, msg) => {
    if (!service.pingHandler) {
      return false;
    }
    return service.pingHandler(msg.windowId, msg.ignoreWindowIdAndForcePing);
  };
};
