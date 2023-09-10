import React, {
  useContext,
  useState,
  createContext,
  useEffect,
  useRef,
} from "react";
import "./App.css";
import questions from "./questions";

const Context = createContext(0);
let correctAnswer = 2;

function Question({ statement }) {
  return <div className="Question-Area">{statement}</div>;
}

function Answer({ optionNumber, alternative, answerResult, playable }) {
  let [choicedOption, setChoicedOption] = useContext(Context);

  const optionClass = () => {
    console.log(`Answer Result: ${answerResult}`);
    console.log(`Choiced Option: ${choicedOption}`);
    console.log(`Option Number: ${optionNumber}`);
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
            console.log(playable);
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
  const answeredQuestions = useRef([]);

  const verifyCorrectAnswer = (question) => {
    for (let key in question) {
      if (key.includes("option") && question[key] === question.correct) {
        return parseInt(key.slice(-1));
      }
    }

    return 0;
  };

  const defineNextQuestion = (pastQuestions) => {
    console.log("Oi");
    let nextQuestion = 0;

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
    if (window.confirm(`Você deseja parar e receber ${reward} irreais`)) {
      setRunningGame("Stopped");
    }
  };

  const skipQuestion = () => {
    skipsCounter();

    //if (runningGame === "Running"){
      if (runningGame === "Running" && window.confirm("Tem certeza que você deseja pular esta pergunta?")) {
        let helpsCopy = [...helps];
        helpsCopy.pop();
        setHelps(helpsCopy);
        setRunningGame("Interval");
        setTimeout(() => {
          setCurrentQuestion(defineNextQuestion(answeredQuestions.current));
          setRunningGame("Running");
        }, 1000);
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

  correctAnswer = verifyCorrectAnswer(questions[currentQuestion]);
  useEffect(() => {
    if (choicedOption !== 0 && runningGame === "Running") {
      // Como a aparição da cor na opção selecionada sofre um pequeno delay, é colocado este setTimeout para esperar até que a
      // cor amarela seja devidamente colocada na resposta.
      setTimeout(() => {
        if (window.confirm("Você está certo disso?")) {
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
        } else {
          setChoicedOption(0);
        }
      }, 50);
    }
  }, [choicedOption, runningGame]);

  useEffect(() => {
    if (runningGame === "Lose") {
      // Espera um tempo até que as alternativas sejam coloridas, para então mostrar a mensagem.
      setTimeout(() => {
        alert(
          `Que pena, você perdeu! Levou para a casa ${
            numberQuestion === 15
              ? 0
              : formatReward(defineReward(numberQuestion - 1) / 2)
          } irreais!`
        );
      }, 100);
    } else if (runningGame === "Win") {
      setTimeout(() => {
        alert("Parabéns, você acaba de ganhar 1 milhão de irreais!");
      }, 100);
    } else if (runningGame === "Stopped") {
      setTimeout(() => {
        alert(
          `Parabéns, você parou o jogo e recebeu ${formatReward(
            defineReward(numberQuestion - 1)
          )} irreais`
        );
      }, 100);
    }
  }, [runningGame, numberQuestion]);

  useEffect(() => {
    answeredQuestions.current.push(currentQuestion);
  }, [currentQuestion]);

  return (
    <Context.Provider value={[choicedOption, setChoicedOption]}>
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
          <div
            style={{ height: "60vh", width: "15px", backgroundColor: "#FFF" }}
          ></div>
          <div style={{ marginTop: "10px", fontWeight: "900", color: "#FFF" }}>
            45
          </div>
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
