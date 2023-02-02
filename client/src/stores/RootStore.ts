import {action, makeObservable, observable} from "mobx";
import {D1DCClient} from "../api";
import {WalletStore} from "./WalletStore";
import {DomainRecordStore} from "./DomainRecordStore";
import {modalStore} from "../modules/modals/ModalContext";
import {ModalStore} from "../modules/modals/ModalStore";


export class RootStore {

  d1dcClient: D1DCClient;
  modalStore: ModalStore;
  domainRecordStore: DomainRecordStore;
  walletStore: WalletStore;
  domainName: string = '';

  constructor() {
    makeObservable(this, {
      d1dcClient: observable,
      updateClient: action,
      domainName: observable,
    }, {autoBind: true})

    this.modalStore = modalStore;
    this.domainRecordStore = new DomainRecordStore(this);
    this.walletStore = new WalletStore(this);
  }

  updateClient(client: D1DCClient) {
    this.d1dcClient = client;
  }
}
