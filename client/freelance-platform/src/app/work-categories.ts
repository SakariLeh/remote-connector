export interface WorkSubcategory {
  name: string;
  slug: string;
  examples: string[];
}

export interface WorkCategory {
  name: string;
  slug: string;
  icon: string;
  description: string;
  examples: string[];
  subcategories: WorkSubcategory[];
}

export const WORK_CATEGORIES: WorkCategory[] = [
  {
    name: 'Разработка и IT',
    slug: 'development-it',
    icon: '💻',
    description: 'Сайты, приложения и автоматизация',
    examples: ['Создание сайта', 'Мобильное приложение', 'Интеграция сервисов'],
    subcategories: [
      { name: 'Веб-разработка', slug: 'web-development', examples: ['Лендинг', 'Интернет-магазин', 'Веб-сервис'] },
      { name: 'Мобильные приложения', slug: 'mobile-apps', examples: ['Приложение для iOS', 'Приложение для Android', 'Публикация приложения'] },
      { name: 'Автоматизация и интеграции', slug: 'automation-integrations', examples: ['Интеграция CRM', 'Настройка API', 'Автоматизация отчетов'] },
      { name: 'Другое', slug: 'other-development-it', examples: ['Настройка сервера', 'Техническая консультация', 'Доработка программы'] },
    ],
  },
  {
    name: 'Дизайн и графика',
    slug: 'design-graphics',
    icon: '🎨',
    description: 'Интерфейсы, графика и фирменный стиль',
    examples: ['Дизайн сайта', 'Логотип', 'Презентация'],
    subcategories: [
      { name: 'Дизайн интерфейсов', slug: 'interface-design', examples: ['Дизайн сайта', 'Дизайн приложения', 'Прототип интерфейса'] },
      { name: 'Графический дизайн', slug: 'graphic-design', examples: ['Баннер', 'Презентация', 'Упаковка'] },
      { name: 'Логотип и фирменный стиль', slug: 'branding-identity', examples: ['Логотип', 'Цветовая палитра', 'Гайд по стилю'] },
      { name: 'Другое', slug: 'other-design-graphics', examples: ['Иллюстрация', 'Обработка изображений', 'Дизайн товара'] },
    ],
  },
  {
    name: 'Тексты и контент',
    slug: 'text-content',
    icon: '✍️',
    description: 'Тексты для бизнеса и публикаций',
    examples: ['Текст для сайта', 'Статья', 'Редактура'],
    subcategories: [
      { name: 'Тексты для бизнеса', slug: 'business-copywriting', examples: ['Текст для сайта', 'Описание товара', 'Рекламное объявление'] },
      { name: 'Статьи и публикации', slug: 'articles-publications', examples: ['Статья для блога', 'Пост для соцсетей', 'Сценарий публикаций'] },
      { name: 'Редактура и корректура', slug: 'editing-proofreading', examples: ['Корректура', 'Редактура статьи', 'Проверка структуры'] },
      { name: 'Другое', slug: 'other-text-content', examples: ['Расшифровка аудио', 'Подготовка рассылки', 'Контент-план'] },
    ],
  },
  {
    name: 'Перевод и локализация',
    slug: 'translation-localization',
    icon: '🌐',
    description: 'Переводы и адаптация для разных рынков',
    examples: ['Перевод документа', 'Локализация сайта', 'Устный перевод'],
    subcategories: [
      { name: 'Письменный перевод', slug: 'written-translation', examples: ['Перевод документа', 'Перевод статьи', 'Деловая переписка'] },
      { name: 'Локализация', slug: 'localization', examples: ['Локализация сайта', 'Локализация приложения', 'Адаптация рекламы'] },
      { name: 'Устный перевод', slug: 'interpretation', examples: ['Перевод встречи', 'Перевод переговоров', 'Перевод вебинара'] },
      { name: 'Другое', slug: 'other-translation-localization', examples: ['Транскрибация', 'Проверка перевода', 'Субтитры'] },
    ],
  },
  {
    name: 'Маркетинг и реклама',
    slug: 'marketing-advertising',
    icon: '📣',
    description: 'Продвижение и привлечение клиентов',
    examples: ['Ведение соцсетей', 'SEO-продвижение', 'Настройка рекламы'],
    subcategories: [
      { name: 'Социальные сети', slug: 'social-media', examples: ['Ведение страницы', 'Контент для соцсетей', 'План публикаций'] },
      { name: 'Поисковое продвижение', slug: 'search-optimization', examples: ['SEO-аудит сайта', 'Подбор запросов', 'Оптимизация страниц'] },
      { name: 'Реклама в интернете', slug: 'online-advertising', examples: ['Контекстная реклама', 'Реклама в соцсетях', 'Настройка кампании'] },
      { name: 'Другое', slug: 'other-marketing-advertising', examples: ['Маркетинговая стратегия', 'Исследование аудитории', 'Анализ конкурентов'] },
    ],
  },
  {
    name: 'Видео и аудио',
    slug: 'video-audio',
    icon: '🎬',
    description: 'Видео, анимация и работа со звуком',
    examples: ['Монтаж видео', 'Анимация', 'Монтаж подкаста'],
    subcategories: [
      { name: 'Съемка и монтаж', slug: 'video-production-editing', examples: ['Монтаж ролика', 'Съемка мероприятия', 'Видео для соцсетей'] },
      { name: 'Анимация', slug: 'animation', examples: ['Анимационный ролик', 'Анимация логотипа', 'Объясняющее видео'] },
      { name: 'Аудио и подкасты', slug: 'audio-podcasts', examples: ['Монтаж подкаста', 'Обработка записи', 'Озвучка'] },
      { name: 'Другое', slug: 'other-video-audio', examples: ['Субтитры к видео', 'Презентационный ролик', 'Обработка аудио'] },
    ],
  },
  {
    name: 'Бизнес и консультации',
    slug: 'business-consulting',
    icon: '📊',
    description: 'Аналитика, документы и финансы',
    examples: ['Бизнес-план', 'Анализ рынка', 'Финансовая модель'],
    subcategories: [
      { name: 'Бизнес-документы', slug: 'business-documents', examples: ['Бизнес-план', 'Презентация проекта', 'Коммерческое предложение'] },
      { name: 'Исследования и аналитика', slug: 'research-analytics', examples: ['Анализ рынка', 'Исследование конкурентов', 'Анализ таблиц'] },
      { name: 'Финансы и учет', slug: 'finance-accounting', examples: ['Финансовая модель', 'Планирование бюджета', 'Подготовка отчетности'] },
      { name: 'Другое', slug: 'other-business-consulting', examples: ['Консультация по бизнесу', 'План запуска продукта', 'Описание бизнес-процесса'] },
    ],
  },
  {
    name: 'Помощь и поддержка',
    slug: 'assistance-support',
    icon: '🤝',
    description: 'Помощь с задачами и клиентами',
    examples: ['Виртуальный помощник', 'Ввод данных', 'Поддержка клиентов'],
    subcategories: [
      { name: 'Виртуальный помощник', slug: 'virtual-assistant', examples: ['Управление расписанием', 'Поиск информации', 'Организация поездки'] },
      { name: 'Ввод и обработка данных', slug: 'data-entry-processing', examples: ['Заполнение таблицы', 'Перенос данных', 'Проверка базы контактов'] },
      { name: 'Поддержка клиентов', slug: 'customer-support', examples: ['Ответы в чате', 'Обработка обращений', 'Поддержка по электронной почте'] },
      { name: 'Другое', slug: 'other-assistance-support', examples: ['Поиск контактов', 'Подготовка документов', 'Организация встреч'] },
    ],
  },
];
