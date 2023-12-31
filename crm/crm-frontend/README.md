# Система управления контактными данными клиентов

## Общая информация

Система имеет следующие основные возможности:

* Просмотр списка клиентов в виде таблицы
* Добавление нового клиента
* Изменение информации о существующем клиенте

Таблица имеет следующие колонки: 

* ID
* ФИО
* Дата и время создания
* Дата и время последнего изменения
* Контакты
* Действия (кнопки)
* Изменить клиента
* Удалить клиента

Все заголовки колонок, кроме контактов и действий, можно нажать, чтобы установить сортировку по соответствующему полю. Первое нажатие устанавливает сортировку по возрастанию, повторное – по убыванию. По умолчанию установлена сортировка по возрастанию по id. Состояние сортировки отображается в виде соответствующей иконки около заголовка.

При загрузке страницы для каждого клиента отображается сокращенный список контактов, если он имеет более 5 значений (максимально возможное число контактов – 10). Для просмотра полного списка контактов, необходимо кликнуть по значению, где указано количество скрытых контактов. При наведении на каждую иконку контакта отображается значение этого контакта.

При нажатии на кнопку «Изменить» открывается модальное окно с формой изменения клиента. Перед открытием окна с сервера запрашиваются свежие данные клиента. 

При нажатии на кнопку «Удалить» открывается модальное окно с подтверждением действия.

При нажатии на кнопку «Добавить клиента» открывается модальное окно с формой создания нового клиента.

В блоке контактов в форме модального окна предусмотрена возможность добавления до 10 контактов включительно. Тип контакта выбирается из выпадающего списка с выбором одного из значений (Телефон, Email, VK, Facebook, Другое). Каждый контакт можно удалить по нажатию по крестику справа от него. 

## Реализованные дополнения

### Анимация открытия модального окна

Реализована анимация открытия модального окна: выход из прозрачности и смещения окна сверху-вниз.

### Ссылка на карточку клиента

При открытии окна редактирования клиента в hash-часть пути страницы записывается id открытого клиента. Эту ссылку можно использовать для обмена. При загрузке страницы проверяется, указано ли что-то в hash-части пути страницы. Если в пути есть информация, по указанному id происходит поиск клиента. Если такой клиент найден, то открывается форма редактирования с данными этого клиента.

### Валидация формы перед отправкой на сервер

Перед отправкой данных на сервер происходит валидация введенных данных по следующим правилам:

* поля «Имя» и «Фамилия» обязательны для заполнения;
* каждый добавленный контакт должен быть полностью заполнен;
* контакт с типом «Телефон» должен быть заполнен в формате +7 (999) 999-99-99;
* контакт с типом «Email» должен быть заполнен в формате example@example.com;
* контакт с типом «VK» должен начинаться с «https://vk.com/», далее значение должно быть от 5 до 32 символов и может содержать латинские символы верхнего или нижнего регистра, цифры, нижнее подчеркивание и точку; 
* контакт с типом «Facebook» должен начинаться с «https://www.facebook.com/», далее значение должно быть от 5 до 50 символов и может содержать латинские символы верхнего или нижнего регистра, цифры и точку; 
* контакт с типом «Другое» может содержать любую информацию о клиенте.
При неуспешной проверке над кнопкой сохранения выводится сообщение об ошибках, а также подсвечиваются все ошибочные поля. 

### Индикация загрузки

При загрузке таблицы со списком клиентов при открытии страницы, а также при выполнении поиска введенного (или выбранного) значения в соответствующем поле, вместо таблицы клиентов отображается спиннер до момента полной загрузки данных с сервера.

При открытии формы редактирования, а также при открытии формы удаления клиента, вместо иконки на соответствующей кнопке отображается спиннер до загрузки информации о выбранном клиенте и открытия необходимой формы. 

Для предотвращения изменений в полях ввода создания или редактирования клиента при сохранении данных поверх формы выводится полупрозрачный слой, который не дает возможности изменить данные.

### Поиск с автодополнением

При заполнении строки поиска через 300 мс происходит поиск введенной информации по данным ФИО и контактам клиента на сервере. Затем под строкой поиска предлагаются 10 вариантов поиска (1 вариант - введенный текст, остальные 9 - найденная информация на сервере, где содержится введенный текст). Управлять выбором варианта для поиска можно как при помощи мыши, так и при помощи клавиш стрелок вверх/вниз и Enter на клавиатуре. При выборе варианта поиска в таблице остаются только те клиенты, которые соответствуют значению в строке поиска.
