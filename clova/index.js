const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

function resultText({midText, sum, diceCount}) {
  if (diceCount == 1) {
    return `결과는 ${sum}입니다.`
  } else if (diceCount < 4) {
    return `결과는 ${midText} 이며 합은 ${sum} 입니다.`
  } else {
    return `주사위 ${diceCount}개의 합은 ${sum} 입니다.`
  }
}

function throwDice(diceCount) {
  const results = []
  let midText = ''
  let resultText = ''
  let sum = 0
  console.log(`throw ${diceCount} times`)
  for (let i = 0; i < diceCount; i++) {
    const rand = Math.floor(Math.random() * 6) + 1
    console.log(`${i + 1} time: ${rand}`)
    results.push(rand)
    sum += rand
    midText += `${rand}, `
  }

  midText = midText.replace(/, $/, '')
  return {midText, sum, diceCount}
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('계좌 조회해 드릴까요?')
    cekResponse.setMultiturn({
      intent: 'ThrowDiceIntent',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case '조회서비스':
      // let diceCount = 1
      // if (!!slots) {
      //   const diceCountSlot = slots.diceCount
      //   if (slots.length != 0 && diceCountSlot) {
      //     diceCount = parseInt(diceCountSlot.value)
      //   }

      //   if (isNaN(diceCount)) {
      //     diceCount = 1
      //   }
      // }
      cekResponse.appendSpeechText(`고객님 입출금 계좌 조회해드릴께요.`)
      // cekResponse.appendSpeechText({
      //   lang: 'ko',
      //   type: 'URL',
      //   value: `${DOMAIN}/rolling_dice_sound.mp3`,
      // })
      // const throwResult = throwDice(diceCount)
      // cekResponse.appendSpeechText(resultText(throwResult))
      const cardResult = {
        "subType": "",
        "type": "CardList",
        "cardList": [{
            "contentProviderText": {
              "type": "string",
              "value": "입출금 계좌"
            },
            "description": [{
                "type": "string",
                "value": "신한 주거래 우대통장(저축예금)"
              },
              {
                "type": "string",
                "value": "110-432-123443"
              },
              {
                "type": "string",
                "value": "121,000원"
              }
            ],
            "imageUrl": {
              "type": "url",
              "value": "https://clova-test.s3.ap-northeast-2.amazonaws.com/01.png"
            },
            "linkUrl": {
              "type": "url",
              "value": ""
            },
            "press": {
              "type": "string",
              "value": ""
            },
            "publishDate": {
              "type": "date",
              "value": ""
            },
            "referenceText": {
              "type": "string",
              "value": "예금금리"
            },
            "referenceUrl": {
              "type": "url",
              "value": ""
            },
            "title": {
              "type": "string",
              "value": "입출금"
            },
            "videoUrl": {
              "type": "url",
              "value": ""
            }
          },
          {
            "contentProviderText": {
              "type": "string",
              "value": "펀드"
            },
            "description": [{
                "type": "string",
                "value": "신한 미래설계 연금저축계좌(연금전용)"
              },
              {
                "type": "string",
                "value": "250-145-223454"
              },
              {
                "type": "string",
                "value": "140,222원"
              }
            ],
            "imageUrl": {
              "type": "url",
              "value": "https://clova-test.s3.ap-northeast-2.amazonaws.com/02.png"
            },
            "linkUrl": {
              "type": "url",
              "value": ""
            },
            "press": {
              "type": "string",
              "value": ""
            },
            "publishDate": {
              "type": "date",
              "value": ""
            },
            "referenceText": {
              "type": "string",
              "value": "수익률"
            },
            "referenceUrl": {
              "type": "url",
              "value": ""
            },
            "title": {
              "type": "string",
              "value": "펀드"
            },
            "videoUrl": {
              "type": "url",
              "value": ""
            }
          }
        ]
      };
      cekResponse.setCard(cardResult)
      break
    case '영우야':
      cekResponse.appendSpeechText(`전 오늘 간단히 먹고 쉬겠습니다.`)
      break
    case '이체':
      cekResponse.appendSpeechText(`싫어요.`)
      // let moneySlot = slots.money
      // if (!!slots) {
      //   const moneySlot = slots.money
      // }
      // console.log(moneySlot.value)
      // cekResponse.appendSpeechText()
      // cekResponse.appendSpeechText(`${moneySlot.value} 이체 해 드릴께요.`)
      
      break
    case 'Clova.GuideIntent':
    default:
      cekResponse.setSimpleSpeechText("계좌 조회해줘, 라고 시도해보세요.")
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('금융 조회 서비스 익스텐션을 종료합니다.')
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
    }
  }

  setCard(outputCard) {
    this.response.card = outputCard
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
