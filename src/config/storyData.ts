export interface StoryChoice {
  text: string;
  charmReward: number;
  affectionReward: number;
  hpCost: number;
  response: string;
}

export interface StoryEvent {
  id: string;
  triggerAffection: number;
  title: string;
  dialogue: string;
  choices: StoryChoice[];
}

export const STORY_EVENTS: StoryEvent[] = [
  {
    id: 'evt_intro',
    triggerAffection: 10,
    title: '첫 라이브 방송',
    dialogue: '"프로듀서님! 저 오늘 방송 처음인데 너무 떨려요... 잘 할 수 있을까요?"',
    choices: [
      {
        text: '"할 수 있어! 넌 최고니까!"',
        charmReward: 5,
        affectionReward: 15,
        hpCost: 0,
        response: '"에헤헷, 프로듀서님이 그렇게 말씀해주시니까 힘이 나네요! 열심히 할게요!"'
      },
      {
        text: '"긴장 풀고 평소처럼 해."',
        charmReward: 10,
        affectionReward: 5,
        hpCost: 0,
        response: '"네! 프로답게, 완벽한 모습을 보여드릴게요."'
      }
    ]
  },
  {
    id: 'evt_mid',
    triggerAffection: 150,
    title: '예상치 못한 스케줄',
    dialogue: '"헉... 프로듀서님, 방금 갑자기 대형 예능 프로그램에서 섭외가 왔대요! 이거 나가도 괜찮을까요?"',
    choices: [
      {
        text: '"무조건 나가야지! 기회야!"',
        charmReward: 30,
        affectionReward: 10,
        hpCost: 20,
        response: '"조금 무섭긴 하지만... 프로듀서님을 믿고 도전해볼게요!"'
      },
      {
        text: '"아직은 무리야. 조금 더 준비하자."',
        charmReward: 5,
        affectionReward: 30,
        hpCost: -10,
        response: '"알겠어요. 저를 이렇게나 배려해주시다니... 더 열심히 연습할게요!"'
      }
    ]
  },
  {
    id: 'evt_late',
    triggerAffection: 500,
    title: '밤 산책',
    dialogue: '"프로듀서님, 연습도 끝났는데... 혹시 시간 괜찮으시면 아주 잠깐만 같이 걸을까요? 밤공기가 좋네요."',
    choices: [
      {
        text: '"물론이지. 같이 가자."',
        charmReward: 10,
        affectionReward: 50,
        hpCost: 0,
        response: '"(얼굴이 붉어지며) 와아... 그럼, 프로듀서님 옆에 딱 붙어갈게요."'
      },
      {
        text: '"내일 일찍부터 스케줄이야. 얼른 자야지."',
        charmReward: 50,
        affectionReward: 10,
        hpCost: -30,
        response: '"단호하시네요...! 그래도 제 컨디션을 이렇게 챙겨주시는 건 프로듀서님뿐이에요."'
      }
    ]
  }
];
