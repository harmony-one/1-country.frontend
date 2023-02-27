import { action, makeObservable, observable } from 'mobx'

interface MetaTags {
  title: string
}

export class MetaTagsStore {
  tags: MetaTags

  constructor() {
    makeObservable(
      this,
      {
        tags: observable,
        update: action,
      },
      { autoBind: true }
    )

    this.tags = {
      title: '.country | Harmony',
    }
  }

  update(tags: MetaTags) {
    this.tags = { ...this.tags, ...tags }
  }
}

export const metaTagsStore = new MetaTagsStore()
