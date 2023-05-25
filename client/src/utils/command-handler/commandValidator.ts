export const regexPatterns = {
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, // url
  VANITY: /^(\w+)=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, // alias=url
  EMAIL: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, // email
  EMAIL_ALIAS: /^(\w+)[:=]([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, // alias=email
  STAKING: /^one1[a-zA-HJ-NP-Z0-9]{38}$/, // oneAddress
  STAKING_COMMAND: /^staking[:=]? ?(one1[a-zA-HJ-NP-Z0-9]{38})$/, // staking: oneAddress or staking:oneAddress or staking=oneAddress
  IFRAME: /^(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))$/, // iframe
  RENEW: /^renew$/i, // renew
  NOTION_COMMAND: /^(\w+)\.=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, ///^(\w+).=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, // subdomain.=url (with notion as substring)
  // NOTION: /^(?=.*notion).*\b((?:https?|ftp):\/\/\S+|www\.\S+)\b.*$/, // url that has substring notion
  TRANSFER: /transfer[:=](0x[a-fA-F0-9]{40})/i,
  WRAP: /(wrap|unwrap)/i, // wrap|unwrap
}

export enum CommandValidatorEnum {
  NONE = 'NONE',
  URL = 'URL',
  VANITY = 'VANITY',
  EMAIL_ALIAS = 'EMAIL_ALIAS', // Includes EMAIL case.
  STAKING = 'STAKING',
  IFRAME = 'IFRAME',
  RENEW = 'RENEW',
  NOTION = 'NOTION', // includes NOTION_COMMAND
  TRANSFER = 'TRANSFER',
  WRAP = 'WRAP',
}

export interface CommandValidator {
  type: CommandValidatorEnum
  aliasName?: string
  url?: string
  email?: string
  command?: string
  address?: string
}

const commandValidator = (text: string): CommandValidator => {
  if (regexPatterns.NOTION_COMMAND.test(text)) {
    const match = text.match(regexPatterns.NOTION_COMMAND)
    return {
      type: CommandValidatorEnum.NOTION,
      aliasName: match[1],
      url: match[2],
    }
  }

  if (regexPatterns.WRAP.test(text)) {
    return {
      type: CommandValidatorEnum.WRAP,
      command: text,
    }
  }

  if (regexPatterns.TRANSFER.test(text)) {
    const match = text.match(regexPatterns.TRANSFER)
    console.log('regex', match)
    return {
      type: CommandValidatorEnum.TRANSFER,
      address: match[1],
    }
  }

  if (regexPatterns.URL.test(text)) {
    return {
      type: CommandValidatorEnum.URL,
      url: text,
    }
  }

  if (regexPatterns.VANITY.test(text)) {
    const match = text.match(regexPatterns.VANITY)
    return {
      type: CommandValidatorEnum.VANITY,
      aliasName: match[1],
      url: match[2],
    }
  }

  if (regexPatterns.EMAIL.test(text)) {
    return {
      type: CommandValidatorEnum.EMAIL_ALIAS,
      aliasName: 'hello',
      email: text,
    }
  }

  if (regexPatterns.EMAIL_ALIAS.test(text)) {
    const match = text.match(regexPatterns.EMAIL_ALIAS)
    return {
      type: CommandValidatorEnum.EMAIL_ALIAS,
      aliasName: match[1],
      email: match[2],
    }
  }

  if (regexPatterns.IFRAME.test(text)) {
    return {
      type: CommandValidatorEnum.IFRAME,
      url: text,
    }
  }

  if (regexPatterns.STAKING.test(text)) {
    return {
      type: CommandValidatorEnum.STAKING,
      url: `staking:${text}`,
    }
  }

  if (regexPatterns.STAKING_COMMAND.test(text)) {
    const match = text.match(regexPatterns.STAKING_COMMAND)
    console.log(match)
    return {
      type: CommandValidatorEnum.STAKING,
      url: `staking:${match[1]}`,
    }
  }

  if (regexPatterns.RENEW.test(text)) {
    return {
      type: CommandValidatorEnum.RENEW,
      command: text,
    }
  }

  return {
    type: CommandValidatorEnum.NONE,
  }
}

export default commandValidator
