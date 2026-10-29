export const DASHBOARD_TEXT = {
  logo: 'WorkPulse',
  logoLabel: 'WorkPulse — кабинет',
  pro: 'PRO',
  roleSelection: 'Выбор роли',
  roles: {
    executor: 'Я Исполнитель',
    customer: 'Я Заказчик',
  },
  search: {
    executor: 'Поиск заказов по ключам, технологиям, навыкам (напр. React, Python, Figma)...',
    customer: 'Поиск исполнителей по навыкам, специализации, имени...',
    label: 'Поиск',
    submit: 'Искать',
    open: 'Открыть поиск',
  },
  notifications: {
    label: 'Уведомления',
    empty: 'Уведомлений нет',
  },
  messages: {
    label: 'Сообщения',
    all: 'Все сообщения',
  },
  userMenu: {
    label: 'Меню пользователя',
    profile: 'Мой профиль',
    settings: 'Настройки',
    wallet: 'Кошелёк / Баланс',
    pro: 'Тариф PRO',
    logout: 'Выйти',
  },
  theme: {
    light: 'Включить светлую тему',
    dark: 'Включить тёмную тему',
  },
  dashboard: {
    content: 'Основной контент',
  },
  searchResults: 'Поиск:',
  errors: {
    load: 'Не удалось загрузить данные кабинета. Попробуйте обновить страницу.',
  },
} as const;
