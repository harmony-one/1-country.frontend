import { RootStore } from './RootStore'
import { BaseStore } from './BaseStore'
import { makeObservable, observable, action } from 'mobx'

export class TelegramWebAppStore extends BaseStore {
  public isTelegramWebApp = false

  constructor(rootStore: RootStore) {
    super(rootStore)

    makeObservable(this, {
      isTelegramWebApp: observable,
      setTelegramWebApp: action,
    })

    this.setTelegramWebApp()
  }

  setTelegramWebApp = () => {
    this.isTelegramWebApp =
      window.Telegram.WebApp.initData !== '' ||
      window.Telegram.WebApp.platform !== 'unknown'
    console.log(
      'setTelegramWebApp',
      window.Telegram.WebApp.initData,
      window.Telegram.WebApp.platform
    )
  }
}
