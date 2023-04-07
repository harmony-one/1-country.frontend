const getCommand = (text: string) => {
  return {
    command: 'command',
    body: 'body',
  }
}

const suggestionParser = (inputText: string) => {
  const command = getCommand(inputText)
  console.log(command)
  return command
}
