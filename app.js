'use strict'

const moment = require('moment')
const discord = require('discord.js')

require('dotenv').config()

const client = new discord.Client()

const token = process.env.TOKEN

client.on('ready', () => {
})

client.on('message', message => {
  if (message.content.indexOf('/') !== 0) return

  let now = moment().locale('ja')
  let args = message.content.split(' ')
  let command = args.shift()

  switch (command) {
    case '/hello':
      message.reply('こんにちはー')
      return

    case '/boss':
      let reply = buildBossTimeMessage(now)
      message.reply(reply)
      return

    case '/time':
      message.reply(`今は${now.format('LLLL')}らしいよ`)
      return

    case '/rename':
      if (args[0] === undefined || args.length !== 1) {
        message.reply('/rename [名前] って入力してね')
        return
      }
      client.user.setUsername(args[0])
        .then(user => message.reply(`名前が${client.user.username}に変わったよ！`))
        .catch(console.error)
      return
  }
})

client.login(token)

const buildBossTimeMessage = now => {

  // common
  let hourDiff = now.diff(moment().startOf('day'), 'minutes')
  let orenDiff = now.diff(moment('2002-07-23 00:00'), 'minutes')
  let dkDiff = now.diff(moment().startOf('week'), 'minutes')

  // caspa
  let caspaPassed = now.minute() - 30
  let isCaspa = caspaPassed >= 0
  // 1 dr
  let dr1Passed = (hourDiff + 60) % 120 - 60
  let isDr1 = dr1Passed >= 0
  // 2 dr
  let dr2Passed = (hourDiff + 180) % 180 - 90
  let isDr2 = dr2Passed >= 0
  // aden
  let adenPassed = (hourDiff + 180) % 240 - 120
  let isAden = adenPassed >= 0
  // oren
  let orenPassed = orenDiff % 300 - 150
  let isOren = orenPassed >= 0
  // dk
  let dkPassed = dkDiff % 420 - 210
  let isDk = dkPassed >= 0

  // output
  return `
${output1('カスパー', isCaspa)}
\t\t${output2(caspaPassed, 30)}

${output1('1ドレ', isDr1)}
\t\t${output2(dr1Passed, 60)}

${output1('2ドレ', isDr2)}
\t\t${output2(dr2Passed, 90)}

${output1('アデン', isAden)}
\t\t${output2(adenPassed, 120)}

${output1('オーレン', isOren)}
\t\t${output2(orenPassed, 150)}

${output1('DK', isDk)}
\t\t${output2(dkPassed, 210)}
`
}

const output1 = (name, inTime) => 
  inTime
    ? `:sunny: **${name}タイム**: タイム中だよ！`
    : `:new_moon: **${name}タイム**: ちがう…`

const output2 = (passed, range) => {
  let remain = passed >= 0 ? range - passed : -passed
  let start = passed >= 0
    ? formatTime(new moment().subtract(passed, 'minute'))
    : formatTime(new moment().add(remain, 'minute'))
  let end = passed >= 0
    ? formatTime(new moment().add(remain, 'minute'))
    : formatTime(new moment().add(remain + range, 'minute'))
  let time = `${start}～${end}`
  if (passed === 0)
    return `ちょうど始まったところ／残り${remain}分 (${time})`
  else if (passed > 0)
    return `${passed}分経過／残り${remain}分 (${time})`
  else
    return `あと${remain}分後 (${time})`
}

const formatTime = (time) => {
  if (time.minute() === 0) return time.format('H時')
  else if (time.minute() === 30) return time.format('H時半')
  else time.format('H時m分')
}
