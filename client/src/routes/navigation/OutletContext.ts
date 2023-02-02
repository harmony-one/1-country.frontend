import {D1DCClient} from "../../api";

export interface OutletContext {
  client: D1DCClient;
  name: string;
  isOwner: boolean;
  walletAddress: string;
  isClientConnected: boolean;
}
