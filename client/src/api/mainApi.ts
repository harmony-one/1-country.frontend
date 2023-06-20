import axios from 'axios'
import config from '../../config'
import { Widget } from '../routes/widgetModule/WidgetListStore'

const base = axios.create({
  baseURL: config.backendHost,
})

export interface Domain {
  id: string
  domain: string
  createdTxHash: string
  bgColor: string
  owner: string
}

export interface Link {
  id: string
  domainId: string
  linkId: string
  url: string
  isPinned: boolean
  rank: number
  createdAt: Date
  updatedAt: Date
}

export interface HtmlWidget {
  id: string
  attributes: {
    any: string;
  };
  title: string;
  owner: string;
}

export const mainApi = {
  createDomain: ({
    domain,
    txHash,
    referral,
  }: {
    domain: string
    txHash: string
    referral?: string
  }) => {
    return base.post<{ data: Domain }>(`/domains/`, {
      domain,
      txHash,
      referral,
    })
  },

  rentDomainForFree: ({
    name,
    owner,
    freeRentKey,
  }: {
    name: string
    owner: string
    freeRentKey: string
  }) => {
    return axios.post<{ transactionHash: string }>(`${config.freeRentBackendHost}/rent`, {
      domainName: name,
      ownerAddress: owner,
      freeRentKey,
    })
  },

  loadDomain: async ({ domain }: { domain: string }) => {
    const response = await base.get<{ data: Domain }>(`/domains/${domain}`)
    return response.data.data
  },

  loadONERate: async () => {
    const response = await base.get<{ data: number }>(`/rates/ONE`)
    return response.data.data
  },

  updateDomain: async ({
    domainName,
    bgColor,
    jwt,
  }: {
    domainName: string
    bgColor: string
    jwt: string
  }) => {
    const response = await base.put<{ data: Domain }>(
      `/domains/${domainName}`,
      {
        bgColor,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    )

    return response.data.data
  },

  requestNonce: async ({ address }: { address: string }) => {
    const response = await base.post(`/auth/web3/nonce`, {
      address,
    })

    return response.data.data
  },
  addLink: (domainName: string, linkId: string, url: string) => {
    return base.post<{ data: Link }>(`/links/`, {
      domainName,
      linkId,
      url,
    })
  },
  addLinks: async (domainName: string, linkId: string, widgets: Widget[]) => {
    const results = await Promise.all(
      widgets.map(async (widget, index) => {
        try {
          const result = await base.post('/links/', {
            domainName,
            linkId: linkId + index,
            url: widget.value,
          })

          return result.data
        } catch (error) {
          console.error(
            `Error adding urls for domain ${domainName}: ${error.message}`
          )
          return null
        }
      })
    )

    return results.filter((result) => result !== null)
  },
  pinLink: (id: string, isPinned: boolean) =>
    base.post<{ data: Link }>(`/links/pin`, {
      id,
      isPinned,
    }),

  getLinks: (domainName: string) =>
    base.get<{ data: Link[] }>(`/links?domain=${domainName}`),

  deleteLink: (id: string) => base.delete<{ data: string }>(`/links/${id}`),

  addHtmlWidget: (attributes: { any: string }, owner = '', title = '') => {
    return base.post<HtmlWidget>(`/widgets/`, {
      attributes,
      owner,
      title
    })
  },
  
  getHtmlWidget: (id: string) => base.get<HtmlWidget>(`/widgets/${id}`),

  auth: async ({
    signature,
    address,
  }: {
    signature: string
    address: string
  }) => {
    const response = await base.post(`/auth/web3/signature`, {
      signature,
      address,
    })

    return response.data.data
  },

  checkJWT: (jwt: string) => {
    return base
      .get(`/auth/web3/test`, {
        headers: {
          Authorization: `bearer ${jwt}`,
        },
      })
      .then((result) => result.status === 200)
      .catch(() => false)
  },
}