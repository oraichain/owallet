import { Env, Handler, InternalHandler, Message } from "@owallet/router";
import { ApproveInteractionMsg, RejectInteractionMsg } from "./messages";
import { InteractionService } from "./service";

// finally here
export const getHandler: (service: InteractionService) => Handler = (
  service: InteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveInteractionMsg:
        return handleApproveInteractionMsg(service)(
          env,
          msg as ApproveInteractionMsg
        );
      case RejectInteractionMsg:
        return handleRejectInteractionMsg(service)(
          env,
          msg as RejectInteractionMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleApproveInteractionMsg: (
  service: InteractionService
) => InternalHandler<ApproveInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.approve(msg.id, msg.result);
  };
};

const handleRejectInteractionMsg: (
  service: InteractionService
) => InternalHandler<RejectInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.reject(msg.id);
  };
};
