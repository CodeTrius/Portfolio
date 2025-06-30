// i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Navbar & User
          nav_home: 'Home',
          nav_about: 'About',
          nav_portfolio: 'Projects',
          nav_content: 'Content',
          nav_contact: 'Contact',
          nav_panel: 'Projects Panel',
          nav_login: 'Login',
          greeting: 'Hello, {{name}}!',
          logout: '(Logout)',

          // Portfolio Page
          portfolio_title: 'Projetos',
          portfolio_created_by: 'Created by: {{name}}',
          portfolio_year: 'Year: {{year}}',
          portfolio_see_more: 'See more →',
          portfolio_loading: 'Loading projects...',
          portfolio_error: 'Failed to load projects.',
          portfolio_no_projects: 'No projects found.',

          // Project Detail Page
          detail_back_button: '← Back to all projects',

          // ... adicione chaves para outras páginas aqui
          "back_to_list": "Back to list",
          "part_number": "Part {{num}}",
          "by_author": "By {{name}}",
        }
      },
      pt: {
        translation: {
          // Navbar & User
          nav_home: 'Home',
          nav_about: 'Sobre',
          nav_portfolio: 'Projetos',
          nav_content: 'Conteúdo',
          nav_contact: 'Contato',
          nav_panel: 'Painel Projetos',
          nav_login: 'Login',
          greeting: 'Olá, {{name}}!',
          logout: '(Sair)',

          // Portfolio Page
          portfolio_title: 'Projetos',
          portfolio_created_by: 'Criado por: {{name}}',
          portfolio_year: 'Ano: {{year}}',
          portfolio_see_more: 'Ver mais →',
          portfolio_loading: 'Carregando projetos...',
          portfolio_error: 'Falha ao carregar os projetos.',
          portfolio_no_projects: 'Nenhum projeto encontrado.',

          // Project Detail Page
          detail_back_button: '← Voltar para todos os projetos',

          // ... adicione chaves para outras páginas aqui
          "back_to_list": "Voltar para a lista",
          "part_number": "Parte {{num}}",
          "by_author": "Por {{name}}",
          "unknown_author": "Autor Desconhecido",
          "favorited": "Favoritado",
          "favorite": "Favoritar",
          "additional_resources": "Recursos Adicionais",
          "video_not_supported": "Seu navegador não suporta a tag de vídeo.",
          "download_attachment": "Baixar Anexo",
          "share": "Compartilhar",
          "share_text": "Confira este post: {{title}} {{url}}",

          // Chaves do painel de conteúdo (para consistência)
          "content_error_posts": "Não foi possível carregar os posts.",
          "content_error_no_posts": "Este tópico ainda não tem conteúdo publicado.",
          "error_occurred": "Ocorreu um erro"
        }
      }
    },
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;