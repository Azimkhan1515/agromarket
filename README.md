# АгроМаркет

Учебный сайт по двум приложенным материалам: React-каталог и лекция JavaScript ES6+/DOM/Fetch API. Интерфейс на русском, комментарии поясняют методы.

## Запуск в VS Code / Windows

Установите Node.js LTS, распакуйте архив, откройте папку проекта через File → Open Folder и выполните в терминале:

```bash
npm install
npm run start:lab
```

Откройте http://localhost:4173. Команда запускает одновременно Vite и json-server на порту 3001. Для остановки нажмите Ctrl+C.

Либо два отдельных терминала:

```bash
npm run server
```

```bash
npm run dev
```

API товаров: http://localhost:3001/products. Регистрация пользователей: `GET/POST http://localhost:3001/users`; пользователи хранятся в `db.json`. Другой адрес можно задать в `.env.local`: `VITE_API_URL=http://localhost:3001`.

## Что проверить преподавателю

1. Главная: каталог загружается настоящим fetch из json-server. Остановите сервер и обновите страницу: появится ошибка. Запустите сервер и нажмите «Повторить загрузку».
2. Поиск: введите «молоко» или «ТОМАТЫ». Используются управляемый input, filter и toLowerCase. Новых запросов при наборе нет.
3. Корзина: добавьте несколько товаров, измените количество, удалите товар. Общий счётчик — useState на уровне App, обработчик передаётся в ProductCard через props. Сумма вычисляется reduce.
4. Учебный заказ: заполните имя/адрес, сохраните. В db.json появится запись orders, запрос POST виден в Network. Это не реальная доставка, оплаты нет.
5. Форма обратной связи: required, type=email, дополнительная проверка, preventDefault. POST /messages с JSON.stringify и Content-Type: application/json.
6. Тема: кнопка солнца вызывает classList.toggle. Выбор сохраняется в браузере.
7. Практика → DOM: создавайте и удаляйте записи, обработчик использует делегацию.
8. Практика → Асинхронность: результат 1 → 3 → Promise → 2 (setTimeout).
9. Практика → 10 записей: GET https://jsonplaceholder.typicode.com/posts?_limit=10. Нужен доступ в интернет; есть loading/error и повторная загрузка.
10. Практика → REST API: GET, POST создаёт задачу; PUT заменяет её текстом поля; PATCH переключает done; DELETE удаляет учебную задачу. Всё сохраняется json-server в tasks.
11. Практика → отдельная DOM-версия /dom.html: defer, DOMContentLoaded, querySelector/All, textContent, style, classList, createElement, append, addEventListener, event.target/key, submit/input/click/keydown/change, preventDefault, Promise.then/catch/finally. Escape очищает поле.

## Соответствие материалам

| Требование | Реализация |
|---|---|
| Vite, React, JSX | package.json, vite.config.js, src/main.jsx |
| ProductCard и props | src/components/ProductCard.jsx |
| useState: products/loading/error/searchTerm | src/App.jsx |
| useEffect с [] и fetch | src/App.jsx, src/api.js |
| map и key | карточки каталога и задачи |
| filter + toLowerCase, управляемый input | src/App.jsx |
| lifting state up, корзина | App хранит cart; ProductCard вызывает onAdd(product) |
| async/await, try/catch/finally, res.ok/json | src/api.js, Practice.jsx, App.jsx |
| GET/POST/PUT/PATCH/DELETE | src/components/Practice.jsx, json-server |
| ES6: const/let, стрелки, шаблонные строки, деструктуризация, spread, import/export | модули src/ и public/dom.js |
| map/filter/find/reduce/forEach | поиск, корзина, подсчёт, DOM-примеры |
| DOM и события, делегация | Practice.jsx, public/dom.js |
| Тёмная тема, форма, 10 записей | App.jsx, Practice.jsx |

## Краткая защита

Props — входные данные компонента: App передаёт товар и обработчик в ProductCard. useState хранит изменяемое состояние, setter вызывает обновление интерфейса. useEffect с [] выполняет загрузку после первого монтирования, а не при каждом вводе в поиск. Cleanup с AbortController отменяет незавершённый fetch. Управляемый input использует value из состояния и меняет его через onChange. React обновляет DOM декларативно; отдельный пример /dom.html показывает императивное управление. Один fetch получает весь каталог, дальнейшая фильтрация идёт в браузере.

## Размещённая демоверсия

Размещённый сайт получает каталог через fetch('/db.json'). На нём корзина, избранное, тема, черновики сообщений и демо-заказы сохраняются только в браузере. Центрального сервера заказов на хостинге нет, поэтому POST/PUT/PATCH/DELETE демонстрируются в локальной версии с json-server. Это явно указано в интерфейсе. Внешний JSONPlaceholder не сохраняет изменения; здесь он используется для чтения 10 записей.

Фотографии загружены с Unsplash и включены в архив. Шрифт Google Fonts имеет системный запасной вариант. Хозяйства и цены демонстрационные.

## Сборка и GitHub

```bash
npm run build
```

Статические файлы находятся в dist. GitHub-репозиторий нужно создать в своём аккаунте; аккаунт пользователя к этому проекту не подключался. Загрузите исходники через интерфейс GitHub или выполните после создания репозитория:

```bash
git init
git add .
git commit -m "lab3: AgroMarket React, DOM and Fetch API"
git branch -M main
git remote add origin https://github.com/YOUR_LOGIN/agromarket-react.git
git push -u origin main
```

`YOUR_LOGIN` замените своим логином. В архиве нет node_modules, сборки, служебной конфигурации хостинга и секретов.


## Регистрация и демо-режим

В шапке сайта есть форма регистрации и входа. В локальном режиме аккаунты записываются в коллекцию `users` файла `db.json` через json-server. В статической демоверсии пользователи сохраняются в localStorage этого браузера. Это только учебная реализация: пароли хранятся без хеширования, поэтому не используйте реальные пароли и не применяйте такой механизм в production. Для настоящего сайта нужен сервер с безопасным хешированием паролей и сессиями.

Форма обратной связи в демоверсии сохраняет черновик в браузере и показывает: «Черновик сохранён в этом браузере. Отправка фермеру в демоверсии не подключена.» Реальная отправка email/сообщения фермеру не реализована.
