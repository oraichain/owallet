import { makeObservable, observable, runInAction } from "mobx";
import { KVStore, MultiGet } from "@owallet/common";
import { DeepReadonly, UnionToIntersection } from "utility-types";
import { ObservableQueryBalances } from "./balances";
import {
  ChainGetter,
  QuerySharedContext,
  IObject,
  ChainedFunctionifyTuple,
  mergeStores,
} from "../common";
import { OWallet } from "@owallet/types";
import { ObservableSimpleQuery } from "./simple";

export interface QueriesSetBase {
  readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
}
// export class QueriesSetBase {
//   public readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
//   constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
//     this.queryBalances = new ObservableQueryBalances(
//       kvStore,
//       chainId,
//       chainGetter
//     );
//   }
// }
export const createQueriesSetBase = (
  sharedContext: QuerySharedContext,
  chainId: string,
  chainGetter: ChainGetter
): QueriesSetBase => {
  return {
    queryBalances: new ObservableQueryBalances(
      sharedContext,
      chainId,
      chainGetter
    ),
  };
};
// eslint-disable-next-line @typescript-eslint/ban-types
export interface IQueriesStore<T extends IObject = {}> {
  get(chainId: string): DeepReadonly<QueriesSetBase & T>;

  simpleQuery: ObservableSimpleQuery;
}

export class QueriesStore<Injects extends Array<IObject>> {
  @observable.shallow
  protected queriesMap: Map<
    string,
    QueriesSetBase & UnionToIntersection<Injects[number]>
  > = new Map();

  protected readonly queriesCreators: ChainedFunctionifyTuple<
    QueriesSetBase,
    // kvStore: KVStore,
    // chainId: string,
    // chainGetter: ChainGetter
    [QuerySharedContext, string, ChainGetter],
    Injects
  >;

  public readonly sharedContext: QuerySharedContext;

  public readonly simpleQuery: ObservableSimpleQuery;

  constructor(
    protected readonly kvStore: KVStore | (KVStore & MultiGet),
    protected readonly chainGetter: ChainGetter,
    protected readonly options: {
      responseDebounceMs?: number;
    },
    ...queriesCreators: ChainedFunctionifyTuple<
      QueriesSetBase,
      // kvStore: KVStore,
      // chainId: string,
      // chainGetter: ChainGetter
      [QuerySharedContext, string, ChainGetter],
      Injects
    >
  ) {
    this.sharedContext = new QuerySharedContext(kvStore, {
      responseDebounceMs: this.options.responseDebounceMs ?? 0,
    });
    this.queriesCreators = queriesCreators;

    this.simpleQuery = new ObservableSimpleQuery(this.sharedContext);

    makeObservable(this);
  }

  get(
    chainId: string
  ): DeepReadonly<QueriesSetBase & UnionToIntersection<Injects[number]>> {
    if (!this.queriesMap.has(chainId)) {
      const queriesSetBase = createQueriesSetBase(
        this.sharedContext,
        chainId,
        this.chainGetter
      );
      runInAction(() => {
        const merged = mergeStores(
          queriesSetBase,
          [this.sharedContext, chainId, this.chainGetter],
          ...this.queriesCreators
        );

        this.queriesMap.set(chainId, merged);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.queriesMap.get(chainId)! as DeepReadonly<
      QueriesSetBase & UnionToIntersection<Injects[number]>
    >;
  }
}

// export class QueriesStore<QueriesSet extends QueriesSetBase> {
//   @observable.shallow
//   protected queriesMap: Map<string, QueriesSet> = new Map();
//
//   constructor(
//     protected readonly kvStore: KVStore,
//     protected readonly chainGetter: ChainGetter,
//     protected readonly apiGetter: () => Promise<OWallet | undefined>,
//     protected readonly queriesCreator: new (
//       kvStore: KVStore,
//       chainId: string,
//       chainGetter: ChainGetter,
//       apiGetter: () => Promise<OWallet | undefined>
//     ) => QueriesSet
//   ) {
//     makeObservable(this);
//   }
//
//   get(chainId: string): DeepReadonly<QueriesSet> {
//     if (!this.queriesMap.has(chainId)) {
//       const queries = new this.queriesCreator(
//         this.kvStore,
//         chainId,
//         this.chainGetter,
//         this.apiGetter
//       );
//       runInAction(() => {
//         this.queriesMap.set(chainId, queries);
//       });
//     }
//
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     return this.queriesMap.get(chainId)! as DeepReadonly<QueriesSet>;
//   }
// }
