const regexPatterns = {
  URL: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, // url
  VANITY: /^(\w+)=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, // alias=url
  EMAIL: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, // email
  EMAIL_ALIAS: /^(\w+)=([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, // alias=email
  STAKING: /^one1[a-zA-HJ-NP-Z0-9]{38}$/, // oneAddress
  STAKING_COMMAND: /^staking[:=]? ?(one1[a-zA-HJ-NP-Z0-9]{38})$/, // staking: oneAddress or staking:oneAddress or staking=oneAddress
  RENEW: /^renew$/i, // renew
  NOTION: /^(\w+)\.=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, ///^(\w+).=((https?|ftp):\/\/[^\s/$.?#].[^\s]*)$/, // subdomain.=url (with notion as substring)
}

export enum CommandValidatorEnum {
  NONE = 'NONE',
  URL = 'URL',
  VANITY = 'VANITY',
  EMAIL_ALIAS = 'EMAIL_ALIAS', // Includes EMAIL case.
  STAKING = 'STAKING',
  RENEW = 'RENEW',
  NOTION = 'NOTION',
}

export interface CommandValidator {
  type: CommandValidatorEnum
  aliasName?: string
  url?: string
  email?: string
  command?: string
}

const commandValidator = (text: string): CommandValidator => {
  console.log('commandValidator', text)
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

  if (regexPatterns.NOTION.test(text)) {
    const match = text.match(regexPatterns.NOTION)
    return {
      type: CommandValidatorEnum.NOTION,
      aliasName: match[1],
      url: match[2],
    }
  }

  return {
    type: CommandValidatorEnum.NONE,
  }
}

export default commandValidator
