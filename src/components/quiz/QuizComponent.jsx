import React, { useState } from 'react';


const QuizComponent = ({ quizData }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionChange = (questionIndex, optionIndex) => {
    if (showResults) return;
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quizData.forEach((question, qIndex) => {
      const correctOptionIndex = question.options.findIndex(opt => opt.is_correct);
      if (userAnswers[qIndex] === correctOptionIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setShowResults(true);
  };

  const getOptionStyle = (question, optionIndex, questionIndex) => {
    if (!showResults) return {};
    const correctOptionIndex = question.options.findIndex(opt => opt.is_correct);
    const isUserAnswer = userAnswers[questionIndex] === optionIndex;
    if (optionIndex === correctOptionIndex) {
      return { color: 'var(--accent-color)', fontWeight: 'bold' };
    }
    if (isUserAnswer && optionIndex !== correctOptionIndex) {
      return { color: 'var(--error-color)', textDecoration: 'line-through' };
    }
    return {};
  };

  const resetQuiz = () => {
    setShowResults(false);
    setUserAnswers({});
    setScore(0);
  };

  if (!quizData || quizData.length === 0) {
    return null;
  }

  return (
    <div className="quiz-container">
      <h3>Quiz Rápido</h3>
      {!showResults ? (
        <>
          {quizData.map((question, qIndex) => (
            <div key={qIndex} className="quiz-question-block">
              {question.imageUrl && (
                <img src={question.imageUrl} alt={`Ilustração para a pergunta ${qIndex + 1}`} className="quiz-question-image" />
              )}
              <p className="quiz-question-text">{qIndex + 1}. {question.question_text}</p>
              {question.options.map((option, oIndex) => (
                <label key={oIndex} className="quiz-option-label">
                  <input type="radio" name={`question_${qIndex}`} onChange={() => handleOptionChange(qIndex, oIndex)} checked={userAnswers[qIndex] === oIndex} />
                  <span>{option.option_text}</span>
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit} disabled={Object.keys(userAnswers).length !== quizData.length}>
            Verificar Respostas
          </button>
        </>
      ) : (
        <div className="quiz-results-view">
          <h4>Resultados: Você acertou {score} de {quizData.length}!</h4>
          {quizData.map((question, qIndex) => (
            <div key={qIndex} className="quiz-question-block">
              <p className="quiz-question-text">{qIndex + 1}. {question.question_text}</p>
              {question.options.map((option, oIndex) => {
                const style = getOptionStyle(question, oIndex, qIndex);
                const isCorrect = question.options.findIndex(opt => opt.is_correct) === oIndex;
                const isUserAnswer = userAnswers[qIndex] === oIndex;
                return (
                  <p key={oIndex} style={style} className={`quiz-results-option ${isCorrect ? 'correct' : ''} ${isUserAnswer && !isCorrect ? 'incorrect-user-answer' : ''}`}>
                    {option.option_text}
                    {isCorrect && ' ✔️'}
                  </p>
                )
              })}
            </div>
          ))}
          <button onClick={resetQuiz}>Tentar Novamente</button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;