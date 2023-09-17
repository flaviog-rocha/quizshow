import React, {
  useContext,
  useState,
  createContext,
  useEffect,
  useRef,
} from "react";
import "./App.css";
import questions from "./questions";
import { motion } from "framer-motion"

const Context = createContext(0);
let correctAnswer = 2;

function Question({ statement }) {
  return <div className="Question-Area">{statement}</div>;
}

function Answer({ optionNumber, alternative, answerResult, playable }) {
  let [choicedOption, setChoicedOption] = useContext(Context);

  const optionClass = () => {
    if (answerResult.final === "Wrong" && optionNumber === correctAnswer) {
      return "Correct";
    } else if (!answerResult && choicedOption === optionNumber) {
      return "Clicked";
    } else if (
      (!answerResult && choicedOption !== optionNumber) ||
      answerResult.option !== optionNumber
    ) {
      return "";
    } else {
      return answerResult.final;
    }
  };

  return (
    <>
      <div className="Answer-Component">
        <div
          className={`Answer-Option ${optionClass()}`}
          onClick={() => {
            if (playable) {
              setChoicedOption(optionNumber);
            }
          }}
        >
          {optionNumber}
        </div>
        <div
          className={`Answers ${
            optionClass() === "Clicked" ? "" : optionClass()
          }`}
        >
          {alternative}
        </div>
      </div>
    </>
  );
}

function Reward({ Result, Prize }) {
  return (
    <>
      <div>
        <div className={`Reward-Label ${Prize == 0 ? "Invisible-Reward" : ""}`}>
          {Result}:
        </div>
        <div className={`Reward ${Prize == 0 ? "Invisible-Reward" : ""}`}>
          {Prize}
        </div>
      </div>
    </>
  );
}

function TimeRemain({ remainTime }) {
  return (
    <>
      <div className="Time-Counter-Max">
        <div
          style={{ height: `${(remainTime / 45) * 100}%`, transition: "1s" }}
          className="Time-Counter-Remain"
        ></div>
      </div>
      <div className="Time-Counter-Label">{remainTime}</div>
    </>
  );
}

function Modal({
  message,
  mainButtonMessage,
  secondaryButtonMessage,
  mainButtonClick,
  secondaryButtonClick,
  backgroundClick,
}) {
  const [initialY, setInitialY] = useState(-50);
  const [finalY, setFinalY] = useState(1);
  const [initialOpacity, setInitialOpacity] = useState(0);
  const [finalOpacity, setFinalOpacity] = useState(1);

  useEffect(() => {
    if (!message){
      setInitialY(1);
      setFinalY(-50);
      setInitialOpacity(1)
      setFinalOpacity(0);
    }

    else {
      setInitialY(-50);
      setFinalY(1);
      setInitialOpacity(0)
      setFinalOpacity(1);
    }
  }, [message])


  return (
      <div
        className="Modal-Background"
        style={{ display: `${message.length > 0 ? "flex" : "none"}` }}
        onClick={backgroundClick}
      >
        <motion.div 
          initial={{y: initialY, opacity: initialOpacity}}
          animate={{y: finalY, opacity: finalOpacity}}
          transition={{duration: 0.2}}
          className="Question-Modal">
          <div style={{ textAlign: "center", fontSize: "1.05rem" }}>
            {message}
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <button className="Modal-Main-Button" onClick={mainButtonClick}>
              {mainButtonMessage}
            </button>
            <button
              className="Modal-Secondary-Button"
              style={{
                visibility: `${secondaryButtonMessage ? "visible" : "hidden"}`,
              }}
              onClick={secondaryButtonClick}
            >
              {secondaryButtonMessage}
            </button>
          </div>
        </motion.div>
      </div>
  );
}
function App() {
  const [choicedOption, setChoicedOption] = useState(0);
  const [result, setResult] = useState("");
  const [runningGame, setRunningGame] = useState("Running");
  const [currentQuestion, setCurrentQuestion] = useState(
    Math.floor(Math.random() * questions.length)
  );
  const [numberQuestion, setNumberQuestion] = useState(0);
  const [helps, setHelps] = useState([
    "Cards",
    "Plates",
    "Academics",
    "Skip",
    "Skip",
    "Skip",
  ]);
  let [time, setTime] = useState(45);
  const answeredQuestions = useRef([]);
  const [modalInfo, setModalInfo] = useState({
    message: "",
    mainButton: "",
    secondaryButton: "",
    mainMethod: null,
    secondaryMethod: null,
    backgroundMethod: null,
  });

  const verifyCorrectAnswer = (question) => {
    for (let key in question) {
      if (key.includes("option") && question[key] === question.correct) {
        return parseInt(key.slice(-1));
      }
    }

    return 0;
  };

  const defineNextQuestion = (pastQuestions) => {
    let nextQuestion = 0;
    setTime(45);
    do {
      nextQuestion = Math.floor(Math.random() * questions.length);
    } while (pastQuestions.includes(nextQuestion));

    return nextQuestion;
  };

  const defineReward = (numberQuestion) => {
    if (numberQuestion === -1) return 0;
    else {
      let reward =
        ((numberQuestion % 5) + 1) * 10 ** (Math.floor(numberQuestion / 5) + 3);
      if (reward % 1000 !== 0) {
        const formatter = new Intl.NumberFormat("pt-BR");
        return formatter.format(reward);
      }

      return reward;
    }
  };

  const formatReward = (reward) => {
    if (reward !== 0 && reward / 1000 >= 1) {
      if (reward % 1000 !== 0) {
        const formatter = new Intl.NumberFormat("pt-BR");
        return formatter.format(reward);
      } else if (reward === 1000000) {
        return "1 milhão";
      } else {
        return `${reward / 1000} mil`;
      }
    }

    return reward;
  };

  const stopGame = (reward) => {
    setModalInfo({
      message: `Você deseja parar e receber ${reward} irreais?`,
      mainButton: "Sim",
      secondaryButton: "Cancelar",
      mainMethod: () => {
        setRunningGame("Stopped");
        cancelModal();
      },
      secondaryMethod: () => {
        cancelModal();
      },
      backgroundMethod: (e) => {
        clickOnBackground(e);
      }
    })
  };

  const skipQuestion = () => {
    if (
      runningGame === "Running"
    ) {
      setModalInfo({
        message: "Você tem certeza de que deseja pular a pergunta?",
        mainButton: "Sim",
        secondaryButton: "Cancelar",
        mainMethod: () => {
          skipQuestionConfirm()
        },
        secondaryMethod: () => {
          cancelModal();
        },
        backgroundMethod: (e) => {
          clickOnBackground(e);
        }
      })
    }
    //}
  };

  const skipsCounter = () => {
    let counter = 0;
    for (let help of helps) {
      if (help === "Skip") counter++;
    }

    return counter;
  };

  const skipQuestionConfirm = () => {
    let helpsCopy = [...helps];
    cancelModal();
    helpsCopy.pop();
    setHelps(helpsCopy);
    setRunningGame("Interval");
    setTimeout(() => {
      setCurrentQuestion(defineNextQuestion(answeredQuestions.current));
      setRunningGame("Running");
    }, 1000);
  }

  const cancelModal = () => {
    setModalInfo({
      message: "",
      mainButton: "",
      secondaryButton: "",
      mainMethod: null,
      secondaryMethod: null,
    });
  }

  const clickOnBackground = (e) => {
    if (e.target.classList.contains("Modal-Background")){
      cancelModal();
    }
  }

  correctAnswer = verifyCorrectAnswer(questions[currentQuestion]);

  const confirmAnswer = () => {
    cancelModal();

    if (choicedOption === correctAnswer) {
      setResult({
        option: choicedOption,
        final: "Correct",
      });

      setRunningGame("Interval");
      if (numberQuestion < 15) {
        setTimeout(() => {
          setChoicedOption(0);
          setResult("");
          setCurrentQuestion(
            defineNextQuestion(answeredQuestions.current)
          );
          setNumberQuestion(numberQuestion + 1);
          setRunningGame("Running");
        }, 3000);
      } else {
        setRunningGame("Win");
      }
    } else {
      setResult({
        option: choicedOption,
        final: "Wrong",
      });

      setRunningGame("Lose");
    }
  }
  useEffect(() => {
    if (choicedOption !== 0 && runningGame === "Running") {
      setModalInfo({
        message: "Você está certo disso?",
        mainButton: "Sim",
        secondaryButton: "Não",
        mainMethod: () => {
          confirmAnswer()
        },
        secondaryMethod: () => {
          setChoicedOption(0);
          cancelModal();
        },
        backgroundMethod: null,
      })
    }
  }, [choicedOption, runningGame]);

  useEffect(() => {
    if (runningGame === "Lose") {
      setModalInfo({
        message: `Que pena, você perdeu! Levou para a casa ${numberQuestion === 15 ? 0 : formatReward(defineReward(numberQuestion - 1) / 2)} irreais!`,
        mainButton: "Ok",
        secondaryButton: null,
        mainMethod: () => {
          cancelModal();
        },
        secondaryMethod: null,
        backgroundMethod: (e) => {
          clickOnBackground(e);
        }
      })
    } else if (runningGame === "Win") {
      setModalInfo({
        message: `Parabéns! Você acaba de ganhar 1 milhão de irreais!`,
        mainButton: "Ok",
        secondaryButton: null,
        mainMethod: () => {
          cancelModal();
        },
        secondaryMethod: null,
        backgroundMethod: (e) => {
          clickOnBackground(e);
        }
      })
    } else if (runningGame === "Stopped") {
      setModalInfo({
        message: `Parabéns, você parou o jogo e recebeu ${formatReward(
          defineReward(numberQuestion - 1)
        )} irreais`,
        mainButton: "Ok",
        secondaryButton: null,
        mainMethod: () => {
          cancelModal();
        },
        secondaryMethod: null,
        backgroundMethod: (e) => {
          clickOnBackground(e);
        }
      })
    }
  }, [runningGame, numberQuestion]);

  useEffect(() => {
    answeredQuestions.current.push(currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    if (numberQuestion === 15) {
      setHelps([]);
    }
  }, [numberQuestion]);

  useEffect(() => {
    const updateTimer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0 || runningGame !== "Running")
          clearInterval(updateTimer);

        if (prevTime === 0) {
          setRunningGame("Lose");
        }
        return prevTime > 0 && runningGame === "Running"
          ? prevTime - 1
          : prevTime;
      });
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [runningGame]);

  return (
    <Context.Provider value={[choicedOption, setChoicedOption]}>
      <Modal
        message={modalInfo.message}
        mainButtonMessage={modalInfo.mainButton}
        secondaryButtonMessage={modalInfo.secondaryButton}
        mainButtonClick={modalInfo.mainMethod}
        secondaryButtonClick={modalInfo.secondaryMethod}
        backgroundClick={modalInfo.backgroundMethod}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "end",
            height: "100vh",
            width: "50vw",
          }}
        >
          <Question statement={questions[currentQuestion].question} />
          <Answer
            optionNumber={1}
            answerResult={result}
            playable={runningGame === "Running"}
            alternative={questions[currentQuestion].option1}
          />
          <Answer
            optionNumber={2}
            answerResult={result}
            playable={runningGame === "Running"}
            alternative={questions[currentQuestion].option2}
          />
          <Answer
            optionNumber={3}
            answerResult={result}
            playable={runningGame === "Running"}
            alternative={questions[currentQuestion].option3}
          />
          <Answer
            optionNumber={4}
            answerResult={result}
            playable={runningGame === "Running"}
            alternative={questions[currentQuestion].option4}
          />
          <div className="Rewards-Area">
            <Reward
              Result={"Errar"}
              Prize={`${
                numberQuestion === 15
                  ? "Perde Tudo"
                  : formatReward(defineReward(numberQuestion - 1) / 2)
              }`}
            />
            <Reward
              Result={"Parar"}
              Prize={formatReward(defineReward(numberQuestion - 1))}
            />
            <Reward
              Result={"Acertar"}
              Prize={formatReward(defineReward(numberQuestion))}
            />
          </div>
        </div>
        <div
          style={{
            width: "10vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TimeRemain remainTime={time} />
        </div>
        <div
          style={{
            height: "60vh",
            width: "35vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <button
            className="Stop-Button"
            disabled={numberQuestion === 0 || runningGame !== "Running"}
            onClick={() =>
              stopGame(formatReward(defineReward(numberQuestion - 1)))
            }
          >
            Parar
          </button>
          <div>
            <div className="Help-Label">Ajudas</div>
            <div>
              <button className="Help-Button">Cartas</button>
              <button className="Help-Button">Placas</button>
              <button className="Help-Button">Universitários</button>
            </div>
            <div>
              <button
                className="Help-Button"
                onClick={skipQuestion}
                disabled={
                  skipsCounter() < 1 ||
                  (runningGame !== "Running" && runningGame !== "Interval")
                }
              >
                Pular
              </button>
              <button
                className="Help-Button"
                onClick={skipQuestion}
                disabled={
                  skipsCounter() < 2 ||
                  (runningGame !== "Running" && runningGame !== "Interval")
                }
              >
                Pular
              </button>
              <button
                className="Help-Button"
                onClick={skipQuestion}
                disabled={
                  skipsCounter() < 3 ||
                  (runningGame !== "Running" && runningGame !== "Interval")
                }
              >
                Pular
              </button>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
}

export default App;
