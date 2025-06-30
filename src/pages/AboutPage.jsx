import React from 'react';
import QuizComponent from '../components/quiz/QuizComponent';

const AboutPage = () => {
  const skills = {
    "Software": [
      "Python", "C++", "JavaScript", "Java", "R", "React", "SQL", "Git", "Supabase", "Flask",
      "Power BI", "Excel Avançado", "Machine Learning", "IA", "OOP"
    ],
    "Eletrônico": [
      "PCB Design", "FPGA (Intel) - VHDL e Verilog", "Microcontroladores", "Sensores", "Instrumentação", "IoT", "Automação Industrial"
    ],
    "Eletricidade": [
      "Sistema de Potência", "Controle", "MATLAB/Simulink", "CLPs", "SCADA", "Redes Industriais", "Motores"
    ],
    "Design & CAD": [
      "SolidWorks", "AutoCAD", "Revit"
    ],
    "Business & Finance": [
      "Finança", "Analises de Finança", "Administração", "Marketing Digital"
    ],
    "Idiomas": [
      "Português (Nativo)", "Inglês (Avançado)", "Espanhol"
    ]
  };
  
  return (
    <div>
      <h2 className="about-page-title" style={{borderBottom: 'none'}}>Sobre Mim</h2>
      <div className="about-page-container">
        <div className="about-text-container">
          <p>
            Olá! Sou Engenheiro de Controle e Automação pelo Instituto Federal de São Paulo. Por ser Engenheiro, busco aprender de tudo, logo, Análise de Dados, Finanças, Marketing, Eletrônica, Eletricidade, Programação (em Python, c++, Java, React, javascript, R), Machine Learning, Inteligência Artificial, Automação Industrial,  Robótica,etc...
          </p>
          <p>
            Eu busco ambientes que me desafiam a aprender continuamente e a preencher os vazios entre diferentes campos da tecnologia.
          </p>
          <p>
            Este site é minha jornada, refletindo minhas habilidades. Meu objetivo é trazer conhecimento e contribuir com projetos inovadores que podem trazer benificios ao mundo real.
          </p>
        </div>
        <div className="skills-container">
          <h3>Principais Competências</h3>
          {Object.entries(skills).map(([category, list]) => (
            <div key={category} className="skill-category">
              <h4>{category}</h4>
              <ul className="skill-list">
                {list.map(skill => <li key={skill} className="skill-item">{skill}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;