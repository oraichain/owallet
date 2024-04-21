// import { ChainedFunctionifyTuple, HasMapStore, IObject } from '../common';
// import { ChainGetter } from "../common";
// import { QueriesStore } from "../query";
// import { DeepPartial, UnionToIntersection } from 'utility-types';
// import deepmerge from "deepmerge";
// import { QueriesSetBase } from "../query";
// import { AccountSetBase, AccountSetBaseSuper, AccountSetOpts } from './base';
// import { OWallet } from '@keplr-wallet/types';
//
// // export interface AccountStoreOpts<MsgOpts> {
// //   defaultOpts: Omit<AccountSetOpts<MsgOpts>, "msgOpts"> &
// //     DeepPartial<Pick<AccountSetOpts<MsgOpts>, "msgOpts">>;
// //   chainOpts?: (DeepPartial<AccountSetOpts<MsgOpts>> & { chainId: string })[];
// // }
// export interface IAccountStore<T extends IObject = {}> {
//   getAccount(chainId: string): AccountSetBase & T;
//   hasAccount(chainId: string): boolean;
// }
//
// export class AccountStore<
//   Injects extends Array<IObject>,
//   AccountSetReturn = AccountSetBase & UnionToIntersection<Injects[number]>
// > extends HasMapStore<AccountSetReturn> {
//   constructor(
//     // protected readonly eventListener: {
//     //   addEventListener: (type: string, fn: () => unknown) => void;
//     //   removeEventListener: (type: string, fn: () => unknown) => void;
//     // },
//     // protected readonly accountSetCreator: (new (
//     //   eventListener: {
//     //     addEventListener: (type: string, fn: () => unknown) => void;
//     //     removeEventListener: (type: string, fn: () => unknown) => void;
//     //   },
//     //   chainGetter: ChainGetter,
//     //   chainId: string,
//     //   queriesStore: QueriesStore<QueriesSetBase & Queries>,
//     //   opts: Opts
//     // ) => AccountSet) & { defaultMsgOpts: MsgOpts },
//     // protected readonly chainGetter: ChainGetter,
//     // protected readonly queriesStore: QueriesStore<QueriesSetBase & Queries>,
//     // protected readonly storeOpts: AccountStoreOpts<MsgOpts>
//     protected readonly eventListener: {
//       addEventListener: (type: string, fn: () => unknown) => void;
//       removeEventListener: (type: string, fn: () => unknown) => void;
//     },
//     protected readonly chainGetter: ChainGetter,
//     protected readonly getOWallet: () => Promise<OWallet | undefined>,
//     protected readonly storeOptsCreator: (chainId: string) => AccountSetOpts,
//     ...accountSetCreators: ChainedFunctionifyTuple<
//       AccountSetBaseSuper,
//       // chainGetter: ChainGetter,
//       // chainId: string,
//       [ChainGetter, string],
//       Injects
//     >
//   ) {
//     super((chainId: string) => {
//       return new accountSetCreator(
//         this.eventListener,
//         this.chainGetter,
//         chainId,
//         this.queriesStore,
//         deepmerge(
//           deepmerge(
//             {
//               msgOpts: accountSetCreator.defaultMsgOpts,
//             },
//             this.storeOpts.defaultOpts
//           ),
//           this.storeOpts.chainOpts?.find((opts) => opts.chainId === chainId) ??
//             {}
//         ) as unknown as Opts
//       );
//     });
//
//     const defaultOpts = deepmerge(
//       {
//         msgOpts: accountSetCreator.defaultMsgOpts,
//       },
//       this.storeOpts.defaultOpts
//     );
//     for (const opts of this.storeOpts.chainOpts ?? []) {
//       if (
//         opts.prefetching ||
//         (defaultOpts.prefetching && opts.prefetching !== false)
//       ) {
//         this.getAccount(opts.chainId);
//       }
//     }
//   }
//
//   getAccount(chainId: string): AccountSetReturn {
//     return this.get(chainId);
//   }
//
//   hasAccount(chainId: string): boolean {
//     return this.has(chainId);
//   }
// }
import {
  ChainedFunctionifyTuple,
  HasMapStore,
  IObject,
  mergeStores,
} from "../common";
import { ChainGetter } from "../chain";
import { AccountSetBase, AccountSetBaseSuper, AccountSetOpts } from "./base";
import { UnionToIntersection } from "utility-types";
import { AccountSharedContext } from "./context";
import { Bitcoin, Ethereum, OWallet, TronWeb } from "@owallet/types";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface IAccountStore<T extends IObject = {}> {
  getAccount(chainId: string): AccountSetBase & T;
  hasAccount(chainId: string): boolean;
}

export interface IAccountStoreWithInjects<Injects extends Array<IObject>> {
  getAccount(
    chainId: string
  ): AccountSetBase & UnionToIntersection<Injects[number]>;
  hasAccount(chainId: string): boolean;
}

export class AccountStore<
  Injects extends Array<IObject>,
  AccountSetReturn = AccountSetBase & UnionToIntersection<Injects[number]>
> extends HasMapStore<AccountSetReturn> {
  protected accountSetCreators: ChainedFunctionifyTuple<
    AccountSetBaseSuper,
    // chainGetter: ChainGetter,
    // chainId: string,
    [ChainGetter, string],
    Injects
  >;

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly getOWallet: () => Promise<OWallet | undefined>,
    protected readonly getEthereum: () => Promise<Ethereum | undefined>,
    protected readonly getTronWeb: () => Promise<TronWeb | undefined>,
    protected readonly getBitcoin: () => Promise<Bitcoin | undefined>,
    protected readonly storeOptsCreator: (chainId: string) => AccountSetOpts,
    ...accountSetCreators: ChainedFunctionifyTuple<
      AccountSetBaseSuper,
      // chainGetter: ChainGetter,
      // chainId: string,
      [ChainGetter, string],
      Injects
    >
  ) {
    const sharedContext = new AccountSharedContext(
      getOWallet,
      getEthereum,
      getBitcoin,
      getTronWeb
    );

    super((chainId: string) => {
      const accountSetBase = new AccountSetBaseSuper(
        eventListener,
        chainGetter,
        chainId,
        sharedContext,
        storeOptsCreator(chainId)
      );

      return mergeStores(
        accountSetBase,
        [this.chainGetter, chainId],
        ...this.accountSetCreators
      );
    });

    this.accountSetCreators = accountSetCreators;
  }

  getAccount(chainId: string): AccountSetReturn {
    // chain identifier를 통한 접근도 허용하기 위해서 chainGetter를 통해 접근하도록 함.
    return this.get(this.chainGetter.getChain(chainId).chainId);
  }

  hasAccount(chainId: string): boolean {
    // chain identifier를 통한 접근도 허용하기 위해서 chainGetter를 통해 접근하도록 함.
    return this.has(this.chainGetter.getChain(chainId).chainId);
  }
}
