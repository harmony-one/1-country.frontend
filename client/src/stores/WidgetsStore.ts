import { action, makeObservable, observable } from 'mobx'
import { BaseStore } from './BaseStore'
import { RootStore } from './RootStore'

export class WidgetsStore extends BaseStore {
  widgets: WidgetUnion[] = []

  constructor(rootStore: RootStore) {
    super(rootStore)
    makeObservable(
      this,
      {
        addWidget: action,
        widgets: observable,
      },
      { autoBind: true }
    )
  }

  addWidget(widget: WidgetUnion) {
    this.widgets.push(widget)
  }
}

export enum WidgetType {
  NFT = 'NFT',
  TWITTER = 'TWITTER',
  TEXT = 'TEXT',
  VIDE0 = 'VIDE0',
  MERCHANDISE = 'MERCHANDISE',
}

export interface WidgetContentText {
  text: string
  bgColor: string
  textColor: string
}

interface WidgetContentTwitter {
  url: string
}

interface WidgetContentNFT {
  url: string
  locked: string
}

export type WidgetContentMap = {
  [WidgetType.NFT]: WidgetContentNFT
  [WidgetType.TEXT]: WidgetContentText
  [WidgetType.TWITTER]: WidgetContentTwitter
}

type InferWidgetUnion<T extends WidgetType> = T extends keyof typeof WidgetType
  ? WidgetItem<T>
  : never

export type WidgetUnion = InferWidgetUnion<WidgetType>

type WidgetContentType<
  T extends WidgetContentMap,
  K extends WidgetType
> = K extends keyof T ? T[K] : never

type ValidateShape<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never

export class WidgetItem<
  T extends WidgetType,
  C extends WidgetContentType<WidgetContentMap, T> = WidgetContentType<
    WidgetContentMap,
    T
  >
> {
  content: C
  type: T

  constructor(
    type: T,
    content: ValidateShape<C, WidgetContentType<WidgetContentMap, T>>
  ) {
    this.type = type
    this.content = content
  }

  get(field: keyof C) {
    return this.content[field]
  }

  set<F extends keyof C>(field: F, value: C[F]) {
    this.content[field] = value
  }
}

// const widgetTwitter = new WidgetItem(WidgetType.TWITTER, { url: 'str' });
// const widgetTwitterError = new WidgetItem(WidgetType.TWITTER, { url: 'str', boo: '123' });
//
// function addWidget<T extends WidgetUnion>(widget: T) {
//
// }
//
// addWidget(widgetTwitter);
//
// widgetTwitter.get('url');
// widgetTwitter.set('url', 'sdsd');
