import { initDataProvider } from "../server/initDataProvider";
import { Remult } from "../src/context";
import { CanEnsureSchema, DataProvider } from "../src/data-interfaces";
import { LiveQueryStorage, StoredQuery } from "../src/live-query/SubscriptionServer";
import { Entity, EntityBase, Fields, Repository } from "../src/remult3";

export class DataProviderLiveQueryStorage implements LiveQueryStorage, CanEnsureSchema {
  repo: Promise<Repository<LiveQueryStorageEntity>>;
  dataProvider: Promise<DataProvider>;
  constructor(dataProvider: DataProvider | Promise<DataProvider> | (() => Promise<DataProvider | undefined>)) {
    this.dataProvider = initDataProvider(dataProvider);
    this.repo = this.dataProvider.then(dp =>
      new Remult(dp).repo(LiveQueryStorageEntity)
    )
  }
  async ensureSchema(remult: Remult) {
    await (await this.dataProvider).ensureSchema([(await this.repo).metadata], "Live query storage")
  }
  async add({ id, entityKey, data }: StoredQuery) {
    await this.repo.then(async repo => {
      //TODO - talk to yoni about how this fails with non entity ref - since repo save here makes a wrong decision, since an item returns
      const q = await repo.findId(id, { createIfNotFound: true });
      await q.assign({ entityKey, data }).save();
    })
  }
  async remove(queryId: string) {
    await this.repo.then(repo => repo.delete(queryId)).catch(() => { });
  }

  async forEach(entityKey: string, callback: (args: { query: StoredQuery; setData(data: any): Promise<void>; }) => Promise<void>): Promise<void> {
    const repo = await this.repo;
    let d = new Date();
    d.setMinutes(d.getMinutes() - 5);
    const iso = d.toISOString();
    for (const query of await repo.find({ where: { entityKey } })) {
      if (query.lastUsedIso < iso)
        await repo.delete(query);
      else {
        await callback({
          query, setData: async data => {
            query.data = data;
            await repo.save(query);
          },
        })
      }
    }

  }
  async keepAliveAndReturnUnknownQueryIds(queryIds: string[]): Promise<string[]> {
    const repo = await this.repo;
    for (const query of await repo.find({ where: { id: queryIds } })) {
      query.lastUsedIso = new Date().toISOString();
      await repo.save(query);
      queryIds = queryIds.filter(x => x !== query.id);
    }
    return queryIds;
  }
}

@Entity(undefined!, {
  dbName: 'remult_live_query_storage'
})
class LiveQueryStorageEntity extends EntityBase {
  @Fields.string()
  id = ''
  @Fields.string()
  entityKey = ''
  @Fields.object()
  data: any
  @Fields.string()
  lastUsedIso = new Date().toISOString()
}