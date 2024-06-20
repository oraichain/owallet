import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { decodeBase64, numberWithCommas } from "../../../helpers/helper";
import { AppChainInfo } from "@owallet/types";
import { LIST_ORAICHAIN_CONTRACT } from "../helpers/constant";
import {
  calculateJaccardIndex,
  findKeyBySimilarValue,
  getTokenInfo,
} from "../helpers/helpers";
import { EmbedChainInfos, toDisplay } from "@owallet/common";
import { Text } from "../../../components/common/text";

export const EVMRenderArgs: FunctionComponent<{
  args: any;
  chain: AppChainInfo;
  renderInfo: (condition, label, content) => ReactElement;
}> = observer(({ args, chain, renderInfo }) => {
  const [toAddress, setToAddress] = useState<any>();
  const [toToken, setToToken] = useState<any>();
  const [path, setPath] = useState<Array<any>>([]);
  const [tokenIn, setTokenIn] = useState<any>();
  const [tokenOut, setTokenOut] = useState<any>();

  const renderToken = (token) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {token?.imgUrl || token?.coinImageUrl ? (
          <img
            style={{
              width: 14,
              height: 14,
              borderRadius: 28,
              marginRight: 4,
            }}
            src={token?.imgUrl ?? token?.coinImageUrl}
          />
        ) : null}
        <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
      </div>
    );
  };

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (chain?.chainId && args?._tokenContract) {
        const token = await getTokenInfo(args?._tokenContract, chain.chainId);
        setTokenIn(token.data);
      }
      if (chain?.chainId && args?._tokenIn) {
        const tokenIn = await getTokenInfo(args?._tokenIn, chain.chainId);
        setTokenIn(tokenIn.data);
      }
      if (chain?.chainId && args?._tokenOut) {
        const tokenOut = await getTokenInfo(args?._tokenOut, chain.chainId);
        setTokenOut(tokenOut.data);
      }
      if (chain?.chainId && args?.path?.length > 0) {
        let tmpPath = [];

        await Promise.all(
          args.path.map(async (p) => {
            const token = await getTokenInfo(p, chain.chainId);
            tmpPath.push(token.data);
          })
        );

        setPath(tmpPath);
      }
    };

    fetchTokenInfo();
  }, [chain?.chainId, args]);

  useEffect(() => {
    if (args?._destination) {
      const encodedData = args?._destination.split(":")?.[1];
      if (encodedData) {
        const decodedData = decodeBase64(encodedData);
        console.log("decodedData", decodedData);

        if (decodedData) {
          // Regular expression pattern to split the input string
          const pattern = /[\x00-\x1F]+/;

          const addressPattern = /[a-zA-Z0-9]+/g;

          // Split the input string using the pattern
          const array = decodedData.split(pattern).filter(Boolean);
          if (array.length < 1) {
            array.push(decodedData);
          }
          const des = array.shift();
          const token = array.pop();

          let tokenInfo;
          if (token) {
            EmbedChainInfos.find((chain) => {
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              if (
                chain.stakeCurrency.coinMinimalDenom ===
                token.match(addressPattern).join("")
              ) {
                tokenInfo = chain.stakeCurrency;
                return;
              }
              const foundCurrency = chain.currencies.find(
                (cr) =>
                  cr.coinMinimalDenom ===
                    token.match(addressPattern).join("") ||
                  //@ts-ignore
                  cr.contractAddress === token.match(addressPattern).join("") ||
                  calculateJaccardIndex(cr.coinMinimalDenom, token) > 0.85
              );

              if (foundCurrency) {
                tokenInfo = foundCurrency;
                return;
              }
            });
          }

          if (!tokenInfo && token) {
            const key = findKeyBySimilarValue(
              LIST_ORAICHAIN_CONTRACT,
              token.match(addressPattern).join("")
            )?.split("_")?.[0];

            if (key)
              tokenInfo = {
                coinDenom: key,
                contractAddress: token.match(addressPattern).join(""),
              };
          }

          setToAddress(des.match(addressPattern).join(""));
          setToToken(tokenInfo);
        }
      }
    }
  }, [args?._destination]);

  console.log(
    "pathh",
    args?.path,
    path.sort((a, b) => {
      const indexA = args?.path.indexOf(a.contractAddress.toLowerCase());
      const indexB = args?.path.indexOf(b.contractAddress.toLowerCase());
      return indexA - indexB;
    })
  );

  return (
    <div>
      {renderInfo(
        args?._value,
        "Approve amount",
        <Text>
          {args?._value
            ? numberWithCommas(
                toDisplay(
                  (args?._value).toString(),
                  chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}
      {renderInfo(
        args?._amount,
        "Amount",
        <Text>
          {args?._amount
            ? numberWithCommas(
                toDisplay(
                  (args?._amount).toString(),
                  chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}

      {renderInfo(
        args?._destination,
        "Bridge Destination",
        <Text>
          {args?._destination ? args?._destination.split(":")?.[0] : null}
        </Text>
      )}
      {renderInfo(
        args?._amountIn,
        "Amount In",
        <Text>
          {args._amountIn
            ? numberWithCommas(
                toDisplay(
                  args._amountIn.toString(),
                  tokenIn?.decimal ?? chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}
      {renderInfo(
        args?.amountIn,
        "Amount In",
        <Text>
          {args.amountIn
            ? numberWithCommas(
                toDisplay(
                  args.amountIn.toString(),
                  tokenIn?.decimal ?? chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}
      {tokenIn
        ? renderInfo(tokenIn?.abbr, "Token In", renderToken(tokenIn))
        : null}
      {!tokenIn
        ? renderInfo(
            chain.stakeCurrency,
            "Token In",
            renderToken(chain.stakeCurrency)
          )
        : null}
      {renderInfo(
        args?._amountOutMin,
        "Amount Out Min",
        <Text>
          {args?._amountOutMin
            ? numberWithCommas(
                toDisplay(
                  (args?._amountOutMin).toString(),
                  tokenOut?.decimal ?? chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}
      {renderInfo(
        args?.amountOutMin,
        "Amount Out Min",
        <Text>
          {args?.amountOutMin
            ? numberWithCommas(
                toDisplay(
                  (args?.amountOutMin).toString(),
                  tokenOut?.decimal ?? chain.stakeCurrency.coinDecimals
                )
              )
            : null}
        </Text>
      )}
      {tokenOut
        ? renderInfo(tokenOut?.abbr, "Token Out", renderToken(tokenOut))
        : null}
      {renderInfo(
        toAddress,
        "Bridge Address",
        <Text>{toAddress ? toAddress : null}</Text>
      )}
      {toToken && toToken.coinDenom !== tokenOut?.abbr
        ? renderInfo(toToken.coinDenom, "To Token", renderToken(toToken))
        : null}
      {path.length > 0
        ? renderInfo(
            path.length,
            "Path",
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {path
                .sort((a, b) => {
                  const indexA = args?.path.indexOf(
                    a.contractAddress.toLowerCase()
                  );
                  const indexB = args?.path.indexOf(
                    b.contractAddress.toLowerCase()
                  );
                  return indexA - indexB;
                })
                .map((p, i) => {
                  if (i > 0) {
                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text>{"  →  "}</Text>
                        {renderToken(p)}
                      </div>
                    );
                  }
                  return renderToken(p);
                })}
            </div>
          )
        : null}
    </div>
  );
});