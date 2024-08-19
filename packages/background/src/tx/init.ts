import { Router } from "@owallet/router";
import { SendTxMsg, RequestEthereumMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxService } from "./service";

export function init(router: Router, service: BackgroundTxService): void {
  router.registerMessage(SendTxMsg);
  router.registerMessage(RequestEthereumMsg);
  router.addHandler(ROUTE, getHandler(service));
}
