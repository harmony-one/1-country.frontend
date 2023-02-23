import { parseTweetId } from '../utils/parseTweetId'

const createKeccakHash = require('keccak')

const regx = /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/

const isValidDomainName = (domainName: string) => {
  console.log('isValidDomain', domainName)
  return regx.test(domainName)
}

const SPECIAL_NAMES = ['s', '0', '1', 'li', 'ml', 'ba', 'names']
// prettier-ignore
const CROSS_CHAIN_NAMES1 = ['btc', 'eth', 'usdt', 'bnb', 'sol', 'ada', 'xrp', 'doge', 'dot', 'usdc', 'uni', 'link', 'luna', 'matic', 'axs', 'shib', 'avax', 'ltc', 'algo', 'fil', 'atom', 'icp', 'cake', 'ftt', 'vet', 'xlm', 'wbtc', 'eos', 'trx', 'xtz', 'aave', 'egld', 'bch', 'ust', 'near', 'dash', 'chz', 'hnt', 'xec', 'bat', 'crv', 'enj', 'grt', 'zec', 'tfuel', 'sushi', 'snx', 'solve', 'ankr', 'hot', 'rvn', 'nexo', 'dai', 'zil', 'celo', 'mana', 'amp', 'one', 'hbar', 'icx', 'mkr', 'flow', 'ren', 'omg', 'iost', 'lrc', 'tel', 'dgb', 'pax', 'srm', 'vgx', 'comp', 'waves', 'ctsi', 'qtum', 'zrx', 'band', 'cvc', 'rev', 'ksm', 'ar', 'tlm', 'bal', 'nano', 'lsk', 'skl', 'farm', 'mir', 'leo', 'etc', 'okb', 'ton', 'xmr', 'ldo', 'apt', 'cro', 'ape', 'qnt', 'ftm', 'theta', 'sand', 'stx', 'tusd', 'lunc', 'rpl', 'neo', 'klay', 'ht', 'usdp', 'kcs', 'mina', 'imx', 'fxs', 'usdd', 'miota', 'cfx', 'gmx', 'op', 'gusd', 'twt', 'rune', 'gt', '1inch', 'osmo', 'agix', 'flr', 'paxg', 'cvx', 'bone', 'fei', 'ethw', 'cspr', 'rose', 'dydx', 'btg', 'fet', 'ens', 'magic', 'ach'];
// prettier-ignore
const CROSS_CHAIN_NAMES2 = ['btc1', 'eth1', 'usdt1', 'bnb1', 'sol1', 'ada1', 'xrp1', 'doge1', 'dot1', 'usdc1', 'uni1', 'link1', 'luna1', 'matic1', 'axs1', 'shib1', 'avax1', 'ltc1', 'algo1', 'fil1', 'atom1', 'icp1', 'cake1', 'ftt1', 'vet1', 'xlm1', 'wbtc1', 'eos1', 'trx1', 'xtz1', 'aave1', 'egld1', 'bch1', 'ust1', 'near1', 'dash1', 'chz1', 'hnt1', 'xec1', 'bat1', 'crv1', 'enj1', 'grt1', 'zec1', 'tfuel1', 'sushi1', 'snx1', 'solve1', 'ankr1', 'hot1', 'rvn1', 'nexo1', 'dai1', 'zil1', 'celo1', 'mana1', 'amp1', 'one1', 'hbar1', 'icx1', 'mkr1', 'flow1', 'ren1', 'omg1', 'iost1', 'lrc1', 'tel1', 'dgb1', 'pax1', 'srm1', 'vgx1', 'comp1', 'waves1', 'ctsi1', 'qtum1', 'zrx1', 'band1', 'cvc1', 'rev1', 'ksm1', 'ar1', 'tlm1', 'bal1', 'nano1', 'lsk1', 'skl1', 'farm1', 'mir1', 'leo1', 'etc1', 'okb1', 'ton1', 'xmr1', 'ldo1', 'apt1', 'cro1', 'ape1', 'qnt1', 'ftm1', 'theta1', 'sand1', 'stx1', 'tusd1', 'lunc1', 'rpl1', 'neo1', 'klay1', 'ht1', 'usdp1', 'kcs1', 'mina1', 'imx1', 'fxs1', 'usdd1', 'miota1', 'cfx1', 'gmx1', 'op1', 'gusd1', 'twt1', 'rune1', 'gt1', '1inch1', 'osmo1', 'agix1', 'flr1', 'paxg1', 'cvx1', 'bone1', 'fei1', 'ethw1', 'cspr1', 'rose1', 'dydx1', 'btg1', 'fet1', 'ens1', 'magic1', 'ach1'];
// prettier-ignore
const COUNTRY_NAMES = ['afghanistan','albania','algeria','americansamoa','andorra','angola','anguilla','antarctica','antiguaandbarbuda','argentina','armenia','aruba','australia','austria','azerbaijan','bahamas','bahrain','bangladesh','barbados','belarus','belgium','belize','benin','bermuda','bhutan','bolivia','bonaire,sinteustatiusandsaba','bosniaandherzegovina','botswana','bouvetisland','brazil','britishindianoceanterritory','bruneidarussalam','bulgaria','burkinafaso','burundi','caboverde','cambodia','cameroon','canada','caymanislands','centralafricanrepublic','chad','chile','china','christmasisland','cocoskeelingislands','colombia','comoros','congo','democraticrepublicofthe','cookislands','costarica','croatia','cuba','curaçao','cyprus','czechrepublic',"côted'ivoire",'denmark','djibouti','dominica','dominicanrepublic','ecuador','egypt','elsalvador','equatorialguinea','eritrea','estonia','eswatini','ethiopia','falklandislandsmalvinas','faroeislands','fiji','finland','france','frenchguiana','frenchpolynesia','frenchsouthernterritories','gabon','gambia','georgia','germany','ghana','gibraltar','greece','greenland','grenada','guadeloupe','guam','guatemala','guernsey','guinea','guineabissau','guyana','haiti','heardislandandmcdonaldislands','holysee','honduras','hongkong','hungary','iceland','india','indonesia','iranislamicrepublicof','iraq','ireland','isleofman','israel','italy','jamaica','japan','jersey','jordan','kazakhstan','kenya','kiribati',"koreademocraticpeople'srepublicof",'korea,republicof','kuwait','kyrgyzstan',"laopeople'sdemocraticrepublic",'latvia','lebanon','lesotho','liberia','libya','liechtenstein','lithuania','luxembourg','macao','madagascar','malawi','malaysia','maldives','mali','malta','marshallislands','martinique','mauritania','mauritius','mayotte','mexico','micronesiafederatedstatesof','moldova,republicof','monaco','mongolia','montenegro','montserrat','morocco','mozambique','myanmar','namibia','nauru','nepal','netherlands','newcaledonia','newzealand','nicaragua','niger','nigeria','niue','norfolkisland','northmacedonia','northernmarianaislands','norway','oman','pakistan','palau','palesa','unitedstatesminoroutlyingislands','unitedstatesofamerica','uruguay','uzbekistan','vanuatu','venezuelabolivarianrepublicof','vietnam','virginislandsbritish','virginislandsus','wallisandfutuna','westernsahara','yemen','zambia','zimbabwe'];

const RESERVED_NAMES = [
  ...SPECIAL_NAMES,
  ...CROSS_CHAIN_NAMES1,
  ...CROSS_CHAIN_NAMES2,
  ...COUNTRY_NAMES,
]

export const nameUtils = {
  RESTRICTED_VALID_NAME: /[a-z0-9]+/,
  VALID_NAME: /^[a-zA-Z0-9]{1,}((?!-)[a-zA-Z0-9]{0,}|-[a-zA-Z0-9]{1,})+$/,
  SPECIAL_NAMES: ['s', '0', '1', 'li', 'ml', 'ba', 'names'],

  isValidName: (name: string) => {
    return nameUtils.VALID_NAME.test(name)
  },
  isReservedName: (name: string) => {
    return RESERVED_NAMES.includes(name)
  },
}

export const utils = {
  hexView: (bytes) => {
    return (
      bytes &&
      Array.from(bytes)
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    )
  },

  hexString: (bytes) => {
    return '0x' + utils.hexView(bytes)
  },

  keccak: (bytes) => {
    const k = createKeccakHash('keccak256')
    // assume Buffer is poly-filled or loaded from https://github.com/feross/buffer
    const hash = k.update(Buffer.from(bytes)).digest()
    return new Uint8Array(hash)
  },

  stringToBytes: (str) => {
    return new TextEncoder().encode(str)
  },

  keccak256: (str, use0x) => {
    const bytes = utils.stringToBytes(str)
    const hash = utils.keccak(bytes)
    return use0x ? utils.hexString(hash) : utils.hexView(hash)
  },

  hexToBytes: (hex, length, padRight) => {
    if (!hex) {
      return
    }
    length = length || hex.length / 2
    const ar = new Uint8Array(length)
    for (let i = 0; i < hex.length / 2; i += 1) {
      let j = i
      if (padRight) {
        j = length - hex.length + i
      }
      ar[j] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return ar
  },

  hexStringToBytes: (hexStr, length) => {
    return hexStr.startsWith('0x')
      ? utils.hexToBytes(hexStr.slice(2), length)
      : utils.hexToBytes(hexStr, length)
  },

  tryNormalizeAddress: (address) => {
    try {
      return web3.utils.toChecksumAddress((address || '').toLowerCase())
    } catch (ex) {
      console.error(ex)
      return null
    }
  },

  ecrecover: (message, signature) => {
    try {
      return web3.eth.accounts.recover(message, signature)
    } catch (ex) {
      console.error(ex)
      return null
    }
  },
}
