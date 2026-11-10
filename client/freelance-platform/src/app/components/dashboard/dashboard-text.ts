export const DASHBOARD_TEXT = {
  logo: 'WorkPulse',
  logoLabel: 'WorkPulse — кабинет',
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
    empty: 'Сообщений нет',
    all: 'Все сообщения',
  },
  userMenu: {
    label: 'Меню пользователя',
    profile: 'Мой профиль',
    settings: 'Настройки',
    wallet: 'Кошелёк / Баланс',
    logout: 'Выйти',
  },
  theme: {
    light: 'Включить светлую тему',
    dark: 'Включить тёмную тему',
  },
  dashboard: {
    content: 'Основной контент',
  },
  customerOrders: {
    title: 'Мои заказы',
    empty: 'Вы ещё не публиковали заказы.',
    loading: 'Загрузка…',
    inProgress: 'В работе',
    completed: 'Выполнен',
    selectActor: 'Выбрать',
    actorPrefix: 'Исполнитель #',
  },
  executorBoard: {
    responsesTitle: 'Мои отклики',
    responsesEmpty: 'Откликов пока нет.',
    feedTitle: 'Свободные заказы',
    feedEmpty: 'Свободных заказов нет.',
    loading: 'Загрузка…',
    orderPrefix: 'Заказ #',
  },
  createOrder: {
    open: 'Создать заказ',
    title: 'Новый заказ',
    cancel: 'Отмена',
    submit: 'Опубликовать',
    submitting: 'Публикация…',
    fields: {
      title: 'Название',
      description: 'Описание',
      price: 'Цена, ₽',
      category: 'Категория',
      categoryPlaceholder: 'Выберите категорию',
    },
  },
  searchResults: 'Поиск:',
  errors: {
    load: 'Не удалось загрузить данные кабинета. Попробуйте обновить страницу.',
  },
} as const;
