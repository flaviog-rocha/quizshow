import React, { useContext, useState, createContext, useEffect } from 'react'
import './App.css';
import questions from './questions';

const Context = createContext(0);
let correctAnswer = 2;

function Question({ statement }){
  return(
    <div className='Question-Area'>{statement}</div>
  )
}

function Answer({ optionNumber, alternative, answerResult, playable }){
  let [choicedOption, setChoicedOption] = useContext(Context);

  const optionClass = () => {
    if (answerResult.final === "Wrong" && optionNumber === correctAnswer){
      return "Correct"
    }

    else if (!answerResult && choicedOption === optionNumber && playable){
      return 'Clicked';
    }

    else if ((!answerResult && choicedOption !== optionNumber) || answerResult.option !== optionNumber){
      return '';
    }

    else {
      return answerResult.final;
    }
  }

  return (
    <>
      <div className='Answer-Component'>
        <div className={`Answer-Option ${optionClass()}`} onClick={() => setChoicedOption(optionNumber)}>{optionNumber}</div>
        <div className={`Answers ${optionClass() === 'Clicked' ? '' : optionClass()}`}>{alternative}</div>
      </div>
    </>

  )
}

function Reward ({Result, Prize}) {
  return (
    <>
      <div>
        <div className='Reward-Label'>{Result}:</div>
        <div className='Reward'>{Prize}</div>
      </div>
    </>
  )
}

function App() {
  let [choicedOption, setChoicedOption] = useState(0);
  let [result, setResult] = useState("");
  let [runningGame, setRunningGame] = useState(true);
  let [currentQuestion, setCurrentQuestion] = useState(Math.floor(Math.random()*questions.length));
  let answeredQuestions = [];

  const verifyCorrectAnswer = (question) => {
    for (let key in question){
      if (key.includes("option") && question[key] === question.correct){
        return parseInt(key.slice(-1));
      }
    }

    return 0;
  }

  const defineNextQuestion = (pastQuestions) => {
    let nextQuestion = 0;

    // do {
    //   nextQuestion = Math.floor(Math.random()*questions.length)
    // }
    // while (!pastQuestions.includes(nextQuestion));

    return nextQuestion;
  }

  // if (currentQuestion === -1){
  //   const nextQuestion = defineNextQuestion(answeredQuestions);

  //   answeredQuestions = [...answeredQuestions, nextQuestion];
  //   setCurrentQuestion(nextQuestion);
  // }

  correctAnswer = verifyCorrectAnswer(questions[currentQuestion]);
  useEffect(() => {
    if (choicedOption !== 0 && runningGame){
      // Como a aparição da cor na opção selecionada sofre um pequeno delay, é colocado este setTimeout para esperar até que a
      // cor amarela seja devidamente colocada na resposta.
      setTimeout(() => { 
        if (window.confirm("Você está certo disso?")){
          if (choicedOption === correctAnswer){
            setResult({
              option: choicedOption,
              final: "Correct"
            });
          }

          else {
            setResult({
              option: choicedOption,
              final: "Wrong"
            })
            
            setRunningGame(false)
          }
        }
  
        else {
          setChoicedOption(0)
        }
      }, 50)
    }
    
  }, [choicedOption, runningGame])

  useEffect(() => {
    if (!runningGame){
      // Espera um tempo até que as alternativas sejam coloridas, para então mostrar a mensagem.
      setTimeout(() => {
        alert(`Que pena, você perdeu! Levou para a casa 500 irreais!`)
      }, 100)
    }
  }, [runningGame]);
  
  return (
    <Context.Provider value={[choicedOption, setChoicedOption]}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <Question statement={questions[currentQuestion].question}/>
        <Answer optionNumber={1} answerResult={result} playable={runningGame} alternative={questions[currentQuestion].option1} />
        <Answer optionNumber={2} answerResult={result} playable={runningGame} alternative={questions[currentQuestion].option2} />
        <Answer optionNumber={3} answerResult={result} playable={runningGame} alternative={questions[currentQuestion].option3} />
        <Answer optionNumber={4} answerResult={result} playable={runningGame} alternative={questions[currentQuestion].option4} />
        <div className='Rewards-Area'>
          <Reward Result={'Errar'} Prize={'500'}/>
          <Reward Result={'Parar'} Prize={'1 mil'}/>
          <Reward Result={'Acertar'} Prize={'2 mil'}/>
        </div>
      </div>
    </Context.Provider>
  );
}

export default App;
