import { CWStargate, ChainIdEnum } from "@owallet/common";
import { oraichainNetwork } from "@oraichain/oraidex-common";
import { useEffect, useState } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
//TODO: need check any type
// import { AccountWithAll } from "@owallet/stores";

export const useClient = (accountOrai: any) => {
  const [client, setClient] = useState<SigningCosmWasmClient>();

  const getClient = async () => {
    const cwClient = await CWStargate.init(
      accountOrai,
      ChainIdEnum.Oraichain,
      oraichainNetwork.rpc
    );
    setClient(cwClient);
  };

  useEffect(() => {
    getClient();
  }, []);

  return client;
};
