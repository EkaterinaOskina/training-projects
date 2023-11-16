(() => {
  const WAIT_TIME_MS = 300;
  const API_URL = 'https://oskinak.ru:3001/api/clients';
  let timeout;
  let clientsList;
  let currentColumnSort = "";
  let dir;
  let arrColSort;
  let currentClientData;
  let currentElement;
  const statuses = {
    success: [200, 201],
    failure: [404, 422, 500]
  };
  const handlers = {
    async onСhange(objData) {
      const response = await getClientData(objData.clientObj.id);
      if (statuses.success.includes(response.status)) {
        const clientData = await response.json();
        openModalChangeClient(clientData, objData.element);
      } else if (statuses.failure.includes(response.status)) {
        alert(`Ошибка: ${response.statusText}!`);
      } else {
        modalError.classList.remove('none');
        alert('Что-то пошло не так...');
      };
    },
    onDelete(objData) {
      openModalDeleteClient(objData);
    }
  };

  // функция получения списка клиентов с сервера
  async function getClientData(idClient) {
    const response = await fetch(`${API_URL}/${idClient}`);
    return response;
  }

  // функция получения данных клиента с сервера
  async function getClientsData() {
    const response = await fetch(API_URL);
    return await response.json();
  }

  // функция получения данных клиента с сервера в соответствии с поисковым запросом
  async function getClientsDataSearch(value) {
    const response = await fetch(`${API_URL}?search=${value}`);
    return await response.json();
  }

  // функция добавления клиента на сервер
  async function addClientData(clientObj) {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        name: clientObj.name,
        surname: clientObj.surname,
        lastName: clientObj.lastName,
        contacts: clientObj.contacts,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response;
  }

  // функция изменения данных клиента на сервер
  async function changeClientData(clientObj, changeData) {
    const response = await fetch(`${API_URL}/${clientObj.id}`, {
      method: 'PATCH',
      body: JSON.stringify(changeData),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response;
  }

  // функция удаления клиента
  async function deleteClientData(clientObj) {
    const response = await fetch(`${API_URL}/${clientObj.id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // функция добавления обработчиков на окно браузера
  function addEventsListenerDocument() {
    // закрытие списка автоподбора при клике по любому месту экрана браузера, кроме блока поиска
    window.document.addEventListener('click', (evt) => {
      const search = document.querySelector('.header__search');
      const searchList = document.querySelector('.header__search-list');
      if (searchList.innerHTML !== '' && !evt.composedPath().includes(search)) {
        searchList.innerHTML = "";
        searchList.classList.add('none');
        const searchInput = document.querySelector('.header__search-input');
        searchInput.focus();
      }
    });

    // закрытие открытых объектов по нажатию клавиши Escape
    window.document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        // проверяем, есть ли открытые модальные окна
        const modalOpen = document.querySelector('.modal.open');
        if (modalOpen) {
          closeModalOpen(modalOpen);
        }

        // проверяем есть ли открытое окно автоподбора для поиска
        const searchList = document.querySelector('.header__search-list');
        if (searchList.innerHTML !== '') {
          searchList.innerHTML = "";
          searchList.classList.add('none');
          const searchInput = document.querySelector('.header__search-input');
          searchInput.focus();
        }
      };
    });
  }

  // проверка полей формы на заполненность
  function checkInput(field, typeContact) {
    if (field.value.trim().length > 0) {
      switch (typeContact) {
        case "Телефон":
          return checkPhoneInput(field);
        // case "Доп. телефон":
        //   return checkPhoneInput(field);
        case "Email":
          return checkEmailInput(field);
        case "VK":
          return checkVkInput(field);
        case "Facebook":
          return checkFbInput(field);
        case "Другое":
          field.classList.remove('invalid');
          return true;
        default:
          field.classList.remove('invalid');
          return true;
      }
    } else {
      field.classList.add('invalid');
      return false;
    }
  }

  // проверка phone полей формы на правильность заполнения
  function checkPhoneInput(phoneField) {
    const reg = /^\+7\s\([\d]{3}\)\s[\d]{3}-[\d]{2}-[\d]{2}$/i;
    const isPhoneValid = reg.test(phoneField.value);
    if (isPhoneValid) {
      phoneField.classList.remove('invalid');
      return true;
    } else {
      phoneField.classList.add('invalid');
      return false;
    }
  }

  // проверка email полей формы на правильность заполнения
  function checkEmailInput(emailField) {
    const reg = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[A-Za-z]{2,4}$/i;
    const isEmailValid = reg.test(emailField.value);
    if (isEmailValid) {
      emailField.classList.remove('invalid');
      return true;
    } else {
      emailField.classList.add('invalid');
      return false;
    }
  }

  // проверка vk полей формы на правильность заполнения
  function checkVkInput(vkField) {
    const isVkValidStart = vkField.value.startsWith('https://vk.com/');
    // const reg = /^[A-Za-z0-9_\.]{5,32}$/i;
    const reg = /^[\w\.]{5,32}$/i;
    const isVkValidReg = reg.test(vkField.value.substring(15));
    if (isVkValidStart && isVkValidReg) {
      vkField.classList.remove('invalid');
      return true;
    } else {
      vkField.classList.add('invalid');
      return false;
    }
  }

  // проверка fb полей формы на правильность заполнения
  function checkFbInput(fbField) {
    const isFbValidStart = fbField.value.startsWith('https://www.facebook.com/');
    const reg = /^[A-Za-z0-9\.]{5,50}$/i;
    const isFbValidReg = reg.test(fbField.value.substring(25));
    if (isFbValidStart && isFbValidReg) {
      fbField.classList.remove('invalid');
      return true;
    } else {
      fbField.classList.add('invalid');
      return false;
    }
  }

  // функция валидации формы перед отпрвкой данных на сервер
  function validation(modal) {
    const errors = [];

    const modalInputList = modal.querySelectorAll('.modal-input');
    modalInputList.forEach(input => {
      if (input.required) {
        if (!checkInput(input)) {
          if (input.name === 'name') errors.push("не указано имя");
          else if (input.name === 'surname') errors.push("не указана фамилия");
        };
      };
    });

    let count = 0;
    const modalContactList = modal.querySelectorAll('.modal-item-contact');
    modalContactList.forEach(contact => {
      const inputContact = contact.querySelector('.modal-input-contact');
      const typeContact = contact.querySelector('.modal-select').value;
      if (!checkInput(inputContact, typeContact)) count++;
    });

    if (count) errors.push("не все добавленные контакты заполнены корректно");

    return errors;
  }

  // функция закрытия открытого модального окна
  function closeModalOpen(modal) {
    modal.classList.remove('open');
    modal.removeAttribute('tabIndex');
    if (window.location.hash) history.pushState('', document.title, window.location.pathname);
  }

  // функция создания блока overlay для модального окна
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = "overlay";
    overlay.classList.add('overlay');
    overlay.addEventListener('click', () => {
      const modalOpen = document.querySelector('.modal.open');
      closeModalOpen(modalOpen);
    });
    return overlay;
  }

  // функция создания tooltip
  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = "tooltip";
    tooltip.classList.add('tooltip');

    const tooltipText = document.createElement('span');
    tooltipText.classList.add('tooltip__text');
    tooltip.append(tooltipText);

    return tooltip;
  }

  // функция создания svg иконки
  function createIcon(nameId) {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const iconLink = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    iconLink.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `img/sprite.svg#${nameId}`);
    icon.append(iconLink);
    return icon;
  }

  // функция вызываемая при клике по найденному автодополнению
  async function clickSearchItem(item) {
    const searchInput = document.querySelector('.header__search-input');
    searchInput.value = item.textContent;

    const searchList = document.querySelector('.header__search-list');
    searchList.innerHTML = "";
    searchList.classList.add('none');

    const loader = createLoader();
    // получение списка клиентов с сервера по задданному поиску
    const newFoundClientsList = await getClientsDataSearch(searchInput.value.trim());
    renderClientsTable(newFoundClientsList);
    loader.remove();
  }

  // функция выбора элемента при управлении стрелками вверх/вниз по списку предложенных автодополнений
  function selectSearchItem(index) {
    const searchList = document.querySelector('.header__search-list');

    const searchItem = searchList.children[index];
    searchItem.classList.add('active');
    searchItem.focus();

    const searchInput = document.querySelector('.header__search-input');
    searchInput.value = searchItem.textContent;
  }

  // функция добавления обработчиков на список найденных автодополнений
  function addEventsSearchItem(item) {
    item.addEventListener('click', () => {
      clickSearchItem(item);
    });

    item.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        clickSearchItem(item);
      }
    });

    item.addEventListener('keydown', (evt) => {
      if (evt.key === 'Tab') {
        clickSearchItem(item);
      }
    });

    item.addEventListener('keydown', (evt) => {
      if (evt.key === 'ArrowDown') {
        const searchList = document.querySelector('.header__search-list');
        let index = Array.from(item.parentNode.children).indexOf(item);
        if (index >= 0 && index < searchList.childElementCount - 1) {
          item.classList.remove('active');
          selectSearchItem(++index);
        }
      }
    });

    item.addEventListener('keydown', (evt) => {
      if (evt.key === 'ArrowUp') {
        const searchList = document.querySelector('.header__search-list');
        let index = Array.from(item.parentNode.children).indexOf(item);
        if (index > 0 && index < searchList.childElementCount) {
          item.classList.remove('active');
          selectSearchItem(--index);
        }
      }
    });
  }

  // функция поиска по таблице
  async function searchDataClients(value) {
    const searchList = document.querySelector('.header__search-list');

    if (value.length > 0) {
      // получение списка клиентов с сервера по задданному поиску
      const foundClientsList = await getClientsDataSearch(value);

      searchList.innerHTML = "";
      let tabindex = 100;
      const valueUpperCase = value.toUpperCase();

      const searchItem = document.createElement('li');
      searchItem.classList.add('header__search-item', 'active');
      searchItem.innerHTML = `<b>${valueUpperCase}</b>`;
      searchItem.tabIndex = String(++tabindex);
      addEventsSearchItem(searchItem);
      searchList.append(searchItem);
      searchList.classList.remove('none');

      if (foundClientsList.length > 0) {

        let searchWords = [];

        foundClientsList.forEach(str => {
          const nameUpperCase = str.name.toUpperCase();
          if (nameUpperCase.includes(valueUpperCase) && !searchWords.includes(nameUpperCase) && nameUpperCase !== valueUpperCase) searchWords.push(nameUpperCase);
          const surnameUpperCase = str.surname.toUpperCase();
          if (surnameUpperCase.includes(valueUpperCase) && !searchWords.includes(surnameUpperCase) && surnameUpperCase !== valueUpperCase) searchWords.push(surnameUpperCase);
          const lastNameUpperCase = str.lastName.toUpperCase();
          if (lastNameUpperCase.includes(valueUpperCase) && !searchWords.includes(lastNameUpperCase) && lastNameUpperCase !== valueUpperCase) searchWords.push(lastNameUpperCase);
          str.contacts.forEach(contact => {
            if (contact.value.includes(value) && !searchWords.includes(contact.value) && contact.value !== value) searchWords.push(contact.value);
          });
        });

        searchWords.sort((a, b) => a > b ? 1 : -1);

        // отображается максимум 10 значений (9 слов из автоподбора + 1 введенная строка в поиске)
        const count = 9;
        for (let i = 0; i < Math.min(count, searchWords.length); i++) {
          const searchItem = document.createElement('li');
          searchItem.classList.add('header__search-item');
          searchItem.innerHTML = searchWords[i].replace(valueUpperCase, `<b>${valueUpperCase}</b>`);
          searchItem.tabIndex = String(++tabindex);
          addEventsSearchItem(searchItem);
          searchList.append(searchItem);
        }
      }
    }
    else {
      searchList.innerHTML = "";
      searchList.classList.add('none');
      renderClientsTable(clientsList);
    };
  }

  // функция добавления обработчиков на поле поиска
  function addEventsSearchInput(input) {
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        searchDataClients(input.value.trim());
      }, WAIT_TIME_MS);
    });

    input.addEventListener('keydown', async (evt) => {
      if (evt.key === 'Enter') {
        const value = input.value.trim();
        if (value.length > 0) {
          const searchList = document.querySelector('.header__search-list');
          searchList.innerHTML = "";
          searchList.classList.add('none');
          const loader = createLoader();
          // получение списка клиентов с сервера по задданному поиску
          const newFoundClientsList = await getClientsDataSearch(value);
          renderClientsTable(newFoundClientsList);
          loader.remove();
        }
      }
    });

    input.addEventListener('keydown', async (evt) => {
      if (evt.key === 'Tab') {
        const value = input.value.trim();
        if (value.length > 0) {
          const searchList = document.querySelector('.header__search-list');
          searchList.innerHTML = "";
          searchList.classList.add('none');
          const loader = createLoader();
          // получение списка клиентов с сервера по задданному поиску
          const newFoundClientsList = await getClientsDataSearch(value);
          renderClientsTable(newFoundClientsList);
          loader.remove();
        }
      }
    });

    input.addEventListener('keydown', async (evt) => {
      if (evt.key === 'ArrowDown') {
        const searchList = document.querySelector('.header__search-list');
        if (searchList.innerHTML !== "") {
          const activeSearchInput = searchList.querySelector('.active');
          let indexActive = Array.from(activeSearchInput.parentNode.children).indexOf(activeSearchInput);
          if (indexActive >= 0 && indexActive < searchList.childElementCount - 1) {
            activeSearchInput.classList.remove('active');
            selectSearchItem(++indexActive);
          }
        }
      }
    });

    input.addEventListener('keydown', async (evt) => {
      if (evt.key === 'ArrowUp') {
        const searchList = document.querySelector('.header__search-list');
        if (searchList.innerHTML !== "") {
          const activeSearchInput = searchList.querySelector('.active');
          let indexActive = Array.from(activeSearchInput.parentNode.children).indexOf(activeSearchInput);
          if (indexActive > 0 && indexActive < searchList.childElementCount) {
            activeSearchInput.classList.remove('active');
            selectSearchItem(--indexActive);
          }
        }
      }
    });
  }

  // функция создания header
  function createHeader() {
    const header = document.createElement('header');
    header.classList.add('header');

    const container = document.createElement('div');
    container.classList.add('container', 'header__container', 'flex');

    const logoLink = document.createElement('a');
    logoLink.classList.add('header__logo');
    logoLink.href = "#";

    const logoImg = document.createElement('img');
    logoImg.src = "img/logo.svg";
    logoImg.alt = "Логотип";

    const search = document.createElement('div');
    search.classList.add('header__search');

    const searchInput = document.createElement('input');
    searchInput.classList.add('header__search-input');
    searchInput.type = "text";
    searchInput.placeholder = "Введите запрос";

    addEventsSearchInput(searchInput);
    search.append(searchInput);

    const searchList = document.createElement('ul');
    searchList.classList.add('header__search-list', 'list-reset', 'none');
    search.append(searchList);

    logoLink.append(logoImg);
    container.append(logoLink);
    container.append(search);
    header.append(container);

    return header;
  }

  // функция создания заголовка h1, который будет скрыт
  function createMainTitle() {
    const mainTitle = document.createElement('h1');
    mainTitle.classList.add('visually-hidden');
    mainTitle.textContent = "Система управления контактными данными клиентов компании Skillbus";
    return mainTitle;
  }

  // функция создания заголовка h2
  function createTitle(textTitle) {
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = textTitle;
    return title;
  }

  // функция выделения колонки цветом, по которой производится сортировка
  function columnSortSelection(columnText) {
    arrColSort.forEach(text => {
      if (text === columnText) text.classList.add('sort');
      else text.classList.remove('sort');
    });
  }

  // функция поворота стрелки в зависимости от направления сортировки
  function rotateArrowSort(arrow) {
    const colFullnameArrow = document.getElementById('arrow-sort-fullname');
    if (arrow === colFullnameArrow) {
      if (dir) arrow.classList.add('rotate180');
      else arrow.classList.remove('rotate180');
    } else {
      if (dir) arrow.classList.remove('rotate180');
      else arrow.classList.add('rotate180');
    }
  }

  // функция сортировки списка клиентов по умолчанию
  // (чтобы при обновлении списка клиентов всегда была сортировка по id по возрастанию)
  function defaultSort() {
    dir = true;
    currentColumnSort = "id";
    let copyArr = [...clientsList];
    renderClientsTable(copyArr.sort((a, b) => Number(a['id']) - Number(b['id'])));

    const colIdText = document.getElementById('col-text-id');
    columnSortSelection(colIdText);

    const colIdArrow = document.getElementById('arrow-sort-id');
    rotateArrowSort(colIdArrow);
  }

  // функция сортировки списка клиентов
  function sort(columnName, typeSortCol, colText, colArrow) {
    if (currentColumnSort === columnName) {
      dir = !dir;
    } else {
      dir = true;
    }

    let copyArr = [...clientsList];

    renderClientsTable(copyArr.sort((a, b) => {
      if (typeSortCol === 'string') {
        if (columnName === 'fullname') {
          if (dir) {
            if (a['surname'] > b['surname']) return 1;
            else if (a['surname'] < b['surname']) return -1;
            else {
              if (a['name'] > b['name']) return 1;
              else if (a['name'] < b['name']) return -1;
              else {
                if (a['lastName'] > b['lastName']) return 1;
                else if (a['lastName'] < b['lastName']) return -1;
                else return 0;
              }
            }
          } else {
            if (a['surname'] < b['surname']) return 1;
            else if (a['surname'] > b['surname']) return -1;
            else {
              if (a['name'] < b['name']) return 1;
              else if (a['name'] > b['name']) return -1;
              else {
                if (a['lastName'] < b['lastName']) return 1;
                else if (a['lastName'] > b['lastName']) return -1;
                else return 0;
              }
            }
          }
        } else {
          (dir ? a[columnName] < b[columnName] : a[columnName] > b[columnName]) ? 1 : -1;
        }
      } else if (typeSortCol === 'number') {
        return dir ? Number(a[columnName]) - Number(b[columnName]) : Number(b[columnName]) - Number(a[columnName]);
      } else if (typeSortCol === 'date') {
        return (dir ? new Date(a[columnName]) < new Date(b[columnName]) : new Date(a[columnName]) > new Date(b[columnName])) ? 1 : -1;
      }
    }));

    currentColumnSort = columnName;

    columnSortSelection(colText);
    rotateArrowSort(colArrow);
  }

  // функция создания таблицы клиентов
  function createClientsTable() {
    const table = document.createElement('table');
    table.classList.add('table');

    const tableHead = document.createElement('thead');
    tableHead.id = "table-head";
    const tableHeadRow = document.createElement('tr');
    tableHeadRow.classList.add('table__row-title');

    const colId = document.createElement('th');
    colId.classList.add('col-id');
    const colIdText = document.createElement('span');
    colIdText.id = "col-text-id";
    colIdText.classList.add('col-text');
    colIdText.textContent = "ID";
    colId.append(colIdText);

    const colIdArrow = createIcon('arrow-sort');
    colIdArrow.id = "arrow-sort-id";
    colIdArrow.classList.add('arrow-sort');
    colId.append(colIdArrow);
    colId.addEventListener('click', () => {
      // функция сортировки по ID
      sort('id', 'number', colIdText, colIdArrow);
    });
    tableHeadRow.append(colId);

    const colFullname = document.createElement('th');
    colFullname.classList.add('col-fullname');
    const colFullnameText = document.createElement('span');
    colFullnameText.classList.add('col-text');
    colFullnameText.textContent = "Фамилия Имя Отчество";
    colFullname.append(colFullnameText);

    const colFullnameArrow = createIcon('arrow-sort');
    colFullnameArrow.id = "arrow-sort-fullname";
    colFullnameArrow.classList.add('arrow-sort', 'rotate180');
    colFullname.append(colFullnameArrow);
    const colFullnameAlphabet = document.createElement('span');
    colFullnameAlphabet.classList.add('alphabet-sort');
    colFullnameAlphabet.textContent = "А-Я";
    colFullname.append(colFullnameAlphabet);
    colFullname.addEventListener('click', () => {
      // функция сортировки по ФИО
      sort('fullname', 'string', colFullnameText, colFullnameArrow);
      if (dir) {
        colFullnameAlphabet.textContent = "А-Я";
      } else {
        colFullnameAlphabet.textContent = "Я-А";
      };
    });
    tableHeadRow.append(colFullname);

    const colTimeCreation = document.createElement('th');
    colTimeCreation.classList.add('col-time-creation');
    const colTimeCreationText = document.createElement('span');
    colTimeCreationText.classList.add('col-text');
    colTimeCreationText.textContent = "Дата и время создания";
    colTimeCreation.append(colTimeCreationText);

    const colTimeCreationArrow = createIcon('arrow-sort');
    colTimeCreationArrow.classList.add('arrow-sort');
    colTimeCreation.append(colTimeCreationArrow);
    colTimeCreation.addEventListener('click', () => {
      // функция сортировки по времени создания
      sort('createdAt', 'date', colTimeCreationText, colTimeCreationArrow);
    });
    tableHeadRow.append(colTimeCreation);

    const colTimeChange = document.createElement('th');
    colTimeChange.classList.add('col-time-change');
    const colTimeChangeText = document.createElement('span');
    colTimeChangeText.classList.add('col-text');
    colTimeChangeText.textContent = "Последние изменения";
    colTimeChange.append(colTimeChangeText);

    const colTimeChangeArrow = createIcon('arrow-sort');
    colTimeChangeArrow.classList.add('arrow-sort');
    colTimeChange.append(colTimeChangeArrow);
    colTimeChange.addEventListener('click', () => {
      // функция сортировки по времени последнего изменения
      sort('updatedAt', 'date', colTimeChangeText, colTimeChangeArrow);
    });
    tableHeadRow.append(colTimeChange);

    arrColSort = [colIdText, colFullnameText, colTimeCreationText, colTimeChangeText];

    const colContacts = document.createElement('th');
    colContacts.classList.add('col-contacts');
    colContacts.textContent = "Контакты";
    tableHeadRow.append(colContacts);

    const colActions = document.createElement('th');
    colActions.classList.add('col-actions');
    colActions.textContent = "Действия";
    tableHeadRow.append(colActions);

    tableHead.append(tableHeadRow);
    table.append(tableHead);

    const tableBody = document.createElement('tbody');
    tableBody.id = "table-body";
    tableBody.classList.add('table__body');
    table.append(tableBody);

    return table;
  }

  // функция создания блока ожидания загрузки
  function createLoader() {
    const tableBlock = document.getElementById('table-block');

    const loader = document.createElement('div');
    loader.classList.add('loader');

    const loaderIcon = document.createElement('div');
    loaderIcon.classList.add('loader-icon');
    loader.append(loaderIcon);

    tableBlock.append(loader);

    return loader;
  }

  // функция создания блока ожидания отправки данных из модальной формы на сервер
  function createModalLoad() {
    const modalLoad = document.createElement('div');
    modalLoad.classList.add('load-modal');
    return modalLoad;
  }

  // функция создания кнопки добавления нового клиента
  function createAddClientButton() {
    const addClientButton = document.createElement('button');
    addClientButton.classList.add('btn-add-client', 'btn-reset', 'flex');

    const addClientIcon = createIcon('add-client');
    addClientIcon.classList.add('btn-add-client__icon');
    addClientButton.append(addClientIcon);

    const addClientText = document.createElement('span');
    addClientText.classList.add('btn-add-client__text');
    addClientText.textContent = "Добавить клиента";
    addClientButton.append(addClientText);

    addClientButton.addEventListener('click', () => {
      openModalAddClient();
    });

    return addClientButton;
  }

  // функция создания кнопки закрытия модального окна
  function createModalCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close', 'btn-reset');

    const closeButtonIcon = createIcon('close');
    closeButtonIcon.classList.add('modal-close__icon');
    closeButton.append(closeButtonIcon);

    closeButton.addEventListener('click', () => {
      const modalOpen = document.querySelector('.modal.open');
      closeModalOpen(modalOpen);
    });

    return closeButton;
  }

  // функция создания кнопок взаимодействия с данными модального окна
  function createModalButtonsActions() {
    const modalButton = document.createElement('button');
    modalButton.classList.add('modal-btn', 'btn-reset');
    modalButton.type = "submit";

    const modalButtonReversed = document.createElement('button');
    modalButtonReversed.classList.add('modal-btn-reversed', 'btn-reset');
    modalButtonReversed.type = "button";

    return {
      modalButton,
      modalButtonReversed
    };
  }

  // функция создания заколовка модального окна
  function createModalTitle(text) {
    const modalTitle = document.createElement('h3');
    modalTitle.classList.add('modal-title');
    modalTitle.textContent = text;
    return modalTitle;
  }

  // функция создания * для полей, обязательных для заполнения
  function createModalMandatoryFieldStar() {
    const star = document.createElement('span');
    star.classList.add('modal-mandatory');
    star.textContent = "*";
    return star;
  }

  // функция создания варианта типа контакта клиента
  function createModalOptionTypeContact(value) {
    const modalOption = document.createElement('option');
    modalOption.value = value;
    modalOption.textContent = value;
    return modalOption;
  }

  // получить тип для inputа контакта клиента в зависимости от выбранного типа контакта в select
  function getTypeInputContact(typeContact) {
    switch (typeContact) {
      case "Телефон":
        return "tel";
      // case "Доп. телефон":
      //   return "tel";
      case "Email":
        return "email";
      case "VK":
        return "text";
      case "Facebook":
        return "text";
      case "Другое":
        return "text";
      default:
        return "text";
    }
  }

  // функция создания кнопки удаления контакта клиента
  function createModalDeleteContactButton(modal, item) {
    const modalDeleteContactButton = document.createElement('button');
    modalDeleteContactButton.classList.add('modal-delete-contact', 'btn-reset');
    modalDeleteContactButton.type = "button";

    const modalDeleteContactIcon = createIcon('delete');
    modalDeleteContactIcon.classList.add('modal-delete-contact__icon');
    modalDeleteContactButton.append(modalDeleteContactIcon);

    modalDeleteContactButton.addEventListener('click', () => {
      item.remove();
      const modalContactsList = modal.querySelector('.modal-contacts-list');
      const childrenContactsList = modalContactsList.children;
      if (childrenContactsList.length === 0) {
        const modalAddContacts = modal.querySelector('.modal-add-contacts');
        modalAddContacts.style.padding = "8px 0";
        modalAddContacts.style.backgroundColor = "var(--grey-color-0_3)";
      } else if (childrenContactsList.length === 9) {
        childrenContactsList[childrenContactsList.length - 1].style.marginBottom = "25px";
        const modalAddContactButton = createModalAddContactButton(modal);
        const modalAddContactsContent = modal.querySelector('.modal-add-contacts__content');
        modalAddContactsContent.append(modalAddContactButton);
      }
    });

    return modalDeleteContactButton;
  }

  // функция создания маски для ввода телефона
  function phoneMask(evt, input) {
    const pos = input.selectionStart;
    if (pos < 3) evt.preventDefault();
    let matrix = "+7 (___) ___-__-__";
    let i = 0;
    let value = input.value.replace(/\D/g, "");
    let newValue = matrix.replace(/[_\d]/g, a => {
      return i < value.length ? value.charAt(i++) : a
    });
    i = newValue.indexOf("_");
    if (i != -1) {
      if (i < 5) i = 3;
      newValue = newValue.slice(0, i)
    }
    let reg = matrix.substring(0, input.value.length).replace(/_+/g,
      a => {
        return "\\d{1," + a.length + "}"
      }).replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (!reg.test(input.value) || input.value.length < 5 || evt.keyCode > 47 && evt.keyCode < 58) {
      input.value = newValue;
    }
    if (evt.type == "blur" && input.value.length < 5) {
      input.value = "";
    }
  }

  // функция создания элемента списка контактов модального окна
  function createModalContactItem(modal, contact) {
    const modalContactItem = document.createElement('li');
    modalContactItem.classList.add('modal-item-contact', 'flex');

    const modalSelectWrapper = document.createElement('div');
    modalSelectWrapper.classList.add('modal-select-wrapper');

    const modalSelect = document.createElement('select');
    modalSelect.classList.add('modal-select');
    modalSelect.name = "contact-type";
    modalSelect.addEventListener('change', () => {
      modalInputContact.type = getTypeInputContact(modalSelect.value);
      modalInputContact.value = "";
    });
    modalSelect.addEventListener('click', () => {
      modalSelectArrowIcon.classList.toggle('rotate180');
    });
    modalSelect.addEventListener('blur', () => {
      modalSelectArrowIcon.classList.remove('rotate180');
    });

    const modalOptionPhone = createModalOptionTypeContact("Телефон");
    modalSelect.append(modalOptionPhone);

    // const modalOptionAdditionalPhone = createModalOptionTypeContact("Доп. телефон");
    // modalSelect.append(modalOptionAdditionalPhone);

    const modalOptionEmail = createModalOptionTypeContact("Email");
    modalSelect.append(modalOptionEmail);

    const modalOptionVk = createModalOptionTypeContact("VK");
    modalSelect.append(modalOptionVk);

    const modalOptionFacebook = createModalOptionTypeContact("Facebook");
    modalSelect.append(modalOptionFacebook);

    const modalOptionOther = createModalOptionTypeContact("Другое");
    modalSelect.append(modalOptionOther);

    if (contact) {
      modalSelect.value = contact.type;
    }

    modalSelectWrapper.append(modalSelect);

    const modalSelectArrow = document.createElement('div');
    modalSelectArrow.classList.add('modal-select-arrow');

    const modalSelectArrowIcon = createIcon('arrow-select');
    modalSelectArrowIcon.classList.add('modal-select-arrow__icon');
    modalSelectArrow.append(modalSelectArrowIcon);

    modalSelectWrapper.append(modalSelectArrow);
    modalContactItem.append(modalSelectWrapper);

    const modalInputContact = document.createElement('input');
    modalInputContact.classList.add('modal-input-contact');
    modalInputContact.type = getTypeInputContact(modalSelect.value);
    modalInputContact.placeholder = "Введите данные контакта";
    modalInputContact.required = true;
    modalInputContact.addEventListener('input', (evt) => {
      if (modalInputContact.type === 'tel') phoneMask(evt, modalInputContact);
      const modalError = modal.querySelector('.modal-error')
      if (!modalError.classList.contains('none')) checkInput(modalInputContact, modalSelect.value);
    });
    modalInputContact.addEventListener('focus', (evt) => {
      if (modalInputContact.type === 'tel') phoneMask(evt, modalInputContact);
      else if (modalSelect.value === 'VK' && modalInputContact.value.trim().length === 0) modalInputContact.value = "https://vk.com/";
      else if (modalSelect.value === 'Facebook' && modalInputContact.value.trim().length === 0) modalInputContact.value = "https://www.facebook.com/";
    });
    modalInputContact.addEventListener('blur', (evt) => {
      if (modalInputContact.type === 'tel') phoneMask(evt, modalInputContact);
    });
    modalInputContact.addEventListener('keydown', (evt) => {
      if (modalInputContact.type === 'tel') phoneMask(evt, modalInputContact);
    });

    if (contact) {
      modalInputContact.value = contact.value;
    }

    modalContactItem.append(modalInputContact);

    const modalDeleteContactButton = createModalDeleteContactButton(modal, modalContactItem);
    modalContactItem.append(modalDeleteContactButton);

    return modalContactItem;
  }

  // функция создания кнопки добавления контакта клиенту
  function createModalAddContactButton(modal) {
    const modalAddContactButton = document.createElement('button');
    modalAddContactButton.classList.add('modal-add-contact-btn', 'btn-reset', 'flex');
    modalAddContactButton.type = "button";

    const modalAddContactIcon = createIcon('add_contact');
    modalAddContactIcon.classList.add('modal-add-contact-btn__icon');
    modalAddContactButton.append(modalAddContactIcon);

    const modalAddContactText = document.createElement('span');
    modalAddContactText.classList.add('modal-add-contact-btn__text');
    modalAddContactText.textContent = "Добавить контакт";
    modalAddContactButton.append(modalAddContactText);

    modalAddContactButton.addEventListener('click', () => {
      const modalAddContacts = modal.querySelector('.modal-add-contacts');
      const modalContactsList = modal.querySelector('.modal-contacts-list');
      if (modalContactsList.children.length === 0) {
        modalAddContacts.style.padding = "25px 0";
        modalAddContacts.style.backgroundColor = "var(--grey-color-0_2)";
      }
      const modalContactItem = createModalContactItem(modal);
      modalContactsList.append(modalContactItem);
      if (modalContactsList.children.length === 10) {
        modalAddContactButton.remove();
        modalContactItem.style.marginBottom = "0";
      }
    });

    return modalAddContactButton;
  }

  // функция создания блока добавления контактов клиенту
  function createModalAddContacts(modal) {
    const modalAddContacts = document.createElement('div');
    modalAddContacts.classList.add('modal-add-contacts');

    const modalAddContactsContent = document.createElement('div');
    modalAddContactsContent.classList.add('modal-add-contacts__content');

    const modalContactsList = document.createElement('ul');
    modalContactsList.classList.add('modal-contacts-list', 'list-reset');
    modalAddContactsContent.append(modalContactsList);

    const modalAddContactButton = createModalAddContactButton(modal);
    modalAddContactsContent.append(modalAddContactButton);

    modalAddContacts.append(modalAddContactsContent);

    return modalAddContacts;
  }

  // функция создания модального окна добавления нового клиента
  function createModalAddClient() {
    const modalAddData = createModalWithForm('modal-add-data', 'Новый клиент');

    const modalForm = modalAddData.querySelector('.modal-form');

    modalForm.addEventListener('submit', async (evt) => {
      evt.preventDefault();

      modalAddData.classList.add('load');

      const modalContactsList = modalAddData.querySelector('.modal-contacts-list');
      const childrenContactsList = modalContactsList.children;
      let contacts = [];
      for (let i = 0; i < childrenContactsList.length; i++) {
        contacts.push({
          type: childrenContactsList[i].querySelector('.modal-select').value,
          value: childrenContactsList[i].querySelector('.modal-input-contact').value.trim(),
        });
      };

      let clientObj = {};
      const inputList = modalAddData.querySelectorAll('.modal-input');
      inputList.forEach(input => {
        clientObj[input.name] = input.value.trim();
      });
      clientObj['contacts'] = contacts;

      const modalError = modalAddData.querySelector('.modal-error');

      const errors = validation(modalAddData);
      if (errors.length > 0) {
        modalError.classList.remove('none');
        let messageErrors = "";
        errors.forEach(error => {
          messageErrors = messageErrors + " " + error + ";";
        });
        modalError.textContent = `Ошибка: ${messageErrors.trim().substring(0, messageErrors.length - 2)}!`;
        modalAddData.classList.remove('load');
      } else {
        let response = await addClientData(clientObj);

        if (statuses.success.includes(response.status)) {
          const newClient = await response.json();
          const tableBody = document.getElementById('table-body');
          const clientItemElement = getClientItemElement(newClient, handlers);
          tableBody.append(clientItemElement);
          clientsList.push(newClient);
          // отрисовка таблицы с сортировкой по id
          defaultSort();
          closeModalOpen(modalAddData);
          modalAddData.classList.remove('load');
        } else if (statuses.failure.includes(response.status)) {
          modalError.classList.remove('none');
          modalError.textContent = `Ошибка: ${response.statusText}!`;
          modalAddData.classList.remove('load');
        } else {
          modalError.classList.remove('none');
          modalError.textContent = `Что-то пошло не так...`;
          modalAddData.classList.remove('load');
        }
      }
    });

    const modalButtonReversed = modalAddData.querySelector('.modal-btn-reversed');
    modalButtonReversed.textContent = "Отмена";
    modalButtonReversed.addEventListener('click', () => {
      closeModalOpen(modalAddData);
    });

    return modalAddData;
  }

  // функция создания текстового поля формы
  function createModalField(nameText, placeholderText) {
    const modalField = document.createElement('div');
    modalField.classList.add('modal-field');

    const modalInput = document.createElement('input');
    modalInput.classList.add('modal-input');
    modalInput.type = "text";
    modalInput.name = nameText;
    modalInput.addEventListener('input', () => {
      if (modalInput.value.length > 0) modalInput.classList.add('valid');
      else modalInput.classList.remove('valid');
    });
    modalField.append(modalInput);

    const modalPlaceholder = document.createElement('label');
    modalPlaceholder.classList.add('modal-label');
    modalPlaceholder.textContent = placeholderText;

    if (nameText !== 'lastName') {
      const modalStar = createModalMandatoryFieldStar();
      modalPlaceholder.append(modalStar);
    }

    modalField.append(modalPlaceholder);

    return {
      modalField,
      modalInput,
    };
  }

  // функция создания модального окна с формой
  function createModalWithForm(nameModal, titleModal) {
    const modal = document.createElement('div');
    modal.id = nameModal;
    modal.classList.add('modal', nameModal);

    const closeButton = createModalCloseButton();
    modal.append(closeButton);

    const modalTop = document.createElement('div');
    modalTop.classList.add('modal-top', 'flex');

    const modalTitle = createModalTitle(titleModal);
    modalTop.append(modalTitle);

    if (nameModal === 'modal-change-data') {
      const modalIdClient = document.createElement('span');
      modalIdClient.classList.add('modal-client-id');
      modalTop.append(modalIdClient);
    }

    modal.append(modalTop);

    const modalForm = document.createElement('form');
    modalForm.classList.add('modal-form');
    modalForm.noValidate = true;

    const surnameField = createModalField('surname', 'Фамилия');
    surnameField.modalInput.required = true;
    surnameField.modalInput.addEventListener('input', () => {
      if (!modalError.classList.contains('none')) checkInput(surnameField.modalInput);
    });
    modalForm.append(surnameField.modalField);

    const nameField = createModalField('name', 'Имя');
    nameField.modalInput.required = true;
    nameField.modalInput.addEventListener('input', () => {
      if (!modalError.classList.contains('none')) checkInput(nameField.modalInput);
    });
    modalForm.append(nameField.modalField);

    const lastNameField = createModalField('lastName', 'Отчество');
    lastNameField.modalField.classList.add('modal-field--last');
    modalForm.append(lastNameField.modalField);

    const modalAddContacts = createModalAddContacts(modal);
    modalForm.append(modalAddContacts);

    const modalError = document.createElement('p');
    modalError.classList.add('modal-error', 'none');
    modalForm.append(modalError);

    const modalButtonsActions = createModalButtonsActions();

    modalButtonsActions.modalButton.textContent = "Сохранить";
    modalForm.append(modalButtonsActions.modalButton);
    modal.append(modalForm);
    modal.append(modalButtonsActions.modalButtonReversed);

    const modalLoad = createModalLoad();
    modal.append(modalLoad);

    return modal;
  }

  // функция открытия модального окна добавления нового клиента
  function openModalAddClient() {
    const modalAddData = document.getElementById('modal-add-data');
    modalAddData.tabIndex = "200";

    // очищаем все ранее заполненные поля
    const inputList = modalAddData.querySelectorAll('.modal-input');
    inputList.forEach(input => {
      input.value = "";
      input.classList.remove('valid');
    });

    // убираем класс invalid для всех ранее невалидных полей
    const invalidList = modalAddData.querySelectorAll('.invalid');
    invalidList.forEach(invalid => invalid.classList.remove('invalid'));

    const modalAddContacts = modalAddData.querySelector('.modal-add-contacts');
    modalAddContacts.removeAttribute('style');

    const modalContactsList = modalAddData.querySelector('.modal-contacts-list');
    modalContactsList.innerHTML = "";

    const modalError = modalAddData.querySelector('.modal-error');
    modalError.classList.add('none');
    modalError.textContent = "";

    modalAddData.classList.add('open');

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      modalAddData.focus();
    }, WAIT_TIME_MS);
  }

  // функция изменения данных в таблице клиентов
  function changeClientElement(сlientData, changeData, element) {
    if ('surname' in changeData || 'name' in changeData || 'lastName' in changeData) {
      const colFullname = element.querySelector('.col-fullname');
      colFullname.textContent = `${сlientData.surname} ${сlientData.name} ${сlientData.lastName}`;
    }

    const colTimeChange = element.querySelector('.col-time-change');
    const colTimeChangeDate = colTimeChange.querySelector('.date');
    colTimeChangeDate.textContent = getFormatDate(new Date(сlientData.updatedAt));
    const colTimeChangeTime = colTimeChange.querySelector('.time');
    colTimeChangeTime.textContent = getFormatTime(new Date(сlientData.updatedAt));

    if ('contacts' in changeData) {
      const clientContactsList = element.querySelector('.contacts-list');
      clientContactsList.innerHTML = "";
      сlientData.contacts.forEach((contact, index) => {
        createContactClient(contact, index + 1, сlientData.contacts.length, clientContactsList);
      });
    }
  }

  // функция создания измененного списка контактов
  function addChangeContacts(childrenContactsList) {
    let changeContacts = [];
    for (let i = 0; i <= childrenContactsList.length - 1; i++) {
      const valueType = childrenContactsList[i].querySelector('.modal-select').value;
      const valueContact = childrenContactsList[i].querySelector('.modal-input-contact').value.trim();
      changeContacts.push({
        type: valueType,
        value: valueContact,
      });
    }
    return changeContacts;
  }

  // функция создания модального окна изменения клиента
  function createModalChangeClient() {
    const modalChangeData = createModalWithForm('modal-change-data', 'Изменить данные');

    const modalForm = modalChangeData.querySelector('.modal-form');

    modalForm.addEventListener('submit', async (evt) => {
      evt.preventDefault();

      modalChangeData.classList.add('load');

      let changeData = {};

      const inputList = modalChangeData.querySelectorAll('.modal-input');
      inputList.forEach(input => {
        if (input.value !== currentClientData[input.name]) changeData[input.name] = input.value.trim();
      });

      const modalContactsList = modalChangeData.querySelector('.modal-contacts-list');
      const childrenContactsList = modalContactsList.children;

      const lengthChildrenContactsList = childrenContactsList.length;
      const lengthContacts = currentClientData.contacts.length;

      let needAddContacts = lengthChildrenContactsList !== lengthContacts;

      if (lengthChildrenContactsList === lengthContacts) {
        for (let i = 0; i <= lengthChildrenContactsList - 1; i++) {
          const valueType = childrenContactsList[i].querySelector('.modal-select').value;
          const valueContact = childrenContactsList[i].querySelector('.modal-input-contact').value.trim();

          if (valueType !== currentClientData.contacts[i].type || valueContact !== currentClientData.contacts[i].value) {
            needAddContacts = true;
            break;
          };
        }
      }

      if (needAddContacts) {
        const changeContacts = addChangeContacts(childrenContactsList);
        changeData['contacts'] = changeContacts;
      }

      const modalError = modalChangeData.querySelector('.modal-error');

      if (Object.keys(changeData).length !== 0) {
        const errors = validation(modalChangeData);
        if (errors.length > 0) {
          modalError.classList.remove('none');
          let messageErrors = "";
          errors.forEach(error => {
            messageErrors = messageErrors + " " + error + ";";
          });
          modalError.textContent = `Ошибка: ${messageErrors.trim().substring(0, messageErrors.length - 2)}!`;
          modalChangeData.classList.remove('load');
        } else {
          let response = await changeClientData(currentClientData, changeData);

          if (statuses.success.includes(response.status)) {
            const newClientData = await response.json();
            changeClientElement(newClientData, changeData, currentElement);
            // получение обновленного списка клиентов с сервера
            clientsList = await getClientsData();
            closeModalOpen(modalChangeData);
            modalChangeData.classList.remove('load');
          } else if (statuses.failure.includes(response.status)) {
            modalError.classList.remove('none');
            modalError.textContent = `Ошибка: ${response.statusText}!`;
            modalChangeData.classList.remove('load');
          } else {
            modalError.classList.remove('none');
            modalError.textContent = `Что-то пошло не так...`;
            modalChangeData.classList.remove('load');
          }
        }
      } else {
        closeModalOpen(modalChangeData);
        modalChangeData.classList.remove('load');
      }
    });

    const modalButtonReversed = modalChangeData.querySelector('.modal-btn-reversed');
    modalButtonReversed.textContent = "Удалить клиента";
    modalButtonReversed.addEventListener('click', () => {
      closeModalOpen(modalChangeData);
      openModalDeleteClient({ currentClientData, currentElement });
    });

    return modalChangeData;
  }

  // функция открытия модального окна изменения клиента
  function openModalChangeClient(clientObj, element) {
    const modalChangeData = document.getElementById('modal-change-data');
    modalChangeData.tabIndex = "200";

    currentClientData = Object.assign({}, clientObj);
    currentElement = element;

    // убираем класс invalid для всех ранее невалидных полей
    const invalidList = modalChangeData.querySelectorAll('.invalid');
    invalidList.forEach(invalid => invalid.classList.remove('invalid'));

    const modalIdClient = modalChangeData.querySelector('.modal-client-id');
    modalIdClient.textContent = `ID: ${clientObj.id}`;

    // заполняем текстовые поля формы
    const inputList = modalChangeData.querySelectorAll('.modal-input');
    inputList.forEach(input => {
      input.value = clientObj[input.name];
      if (input.value.trim().length > 0) input.classList.add('valid');
      else input.classList.remove('valid');
    });

    const modalAddContacts = modalChangeData.querySelector('.modal-add-contacts');

    if (clientObj.contacts.length > 0) {
      modalAddContacts.style.padding = "25px 0";
      modalAddContacts.style.backgroundColor = "var(--grey-color-0_2)";
    } else {
      modalAddContacts.removeAttribute('style');
    };

    const modalContactsList = modalChangeData.querySelector('.modal-contacts-list');
    modalContactsList.innerHTML = "";

    clientObj.contacts.forEach(contact => {
      const modalContactItem = createModalContactItem(modalChangeData, contact);
      modalContactsList.append(modalContactItem);
    });

    if (clientObj.contacts.length === 10) {
      modalContactsList.children[clientObj.contacts.length - 1].style.marginBottom = "0";
      const modalAddContactButton = modalChangeData.querySelector('.modal-add-contact-btn');
      if (modalAddContactButton) modalAddContactButton.remove();
    } else {
      let modalAddContactButton = modalChangeData.querySelector('.modal-add-contact-btn');
      if (!modalAddContactButton) {
        modalAddContactButton = createModalAddContactButton(modalChangeData);
        const modalAddContactsContent = modalChangeData.querySelector('.modal-add-contacts__content');
        modalAddContactsContent.append(modalAddContactButton);
      }
    };

    const modalError = modalChangeData.querySelector('.modal-error');
    modalError.classList.add('none');
    modalError.textContent = "";

    window.location.hash = `${clientObj.id}`;
    modalChangeData.classList.add('open');

    const changeClientButton = element.querySelector('.btn-change-client');
    changeClientButton.classList.remove('load');

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      modalChangeData.focus();
    }, WAIT_TIME_MS);
  }

  // функция открытия модального окна изменения клиента с указанным id
  async function openModalChangeClientByHash(idClient) {
    const response = await getClientData(idClient);

    if (statuses.success.includes(response.status)) {
      const clientData = await response.json();

      const tableBody = document.getElementById('table-body');
      let element;

      for (let i = 0; i < tableBody.children.length; i++) {
        const colId = tableBody.children[i].querySelector('.col-id');
        if (colId.textContent === idClient) {
          element = tableBody.children[i];
          break;
        }
      };

      if (element) openModalChangeClient(clientData, element);
      else alert('Строка с указанным id не найдена!');
    } else if (statuses.failure.includes(response.status)) {
      alert(`Ошибка: ${response.statusText}!`);
    } else {
      modalError.classList.remove('none');
      alert('Что-то пошло не так...');
    };
  }

  // функция создания модального окна удаления клиента
  function createModalDeleteClient() {
    const modalDeleteData = document.createElement('div');
    modalDeleteData.id = "modal-delete-data";
    modalDeleteData.classList.add('modal', 'modal-delete-data');

    const closeButton = createModalCloseButton();
    modalDeleteData.append(closeButton);

    const modalTitle = createModalTitle("Удалить клиента");
    modalDeleteData.append(modalTitle);

    const modalDeleteDataText = document.createElement('p');
    modalDeleteDataText.classList.add('modal-delete-data__text');
    modalDeleteDataText.textContent = "Вы действительно хотите удалить данного клиента?";
    modalDeleteData.append(modalDeleteDataText);

    const modalError = document.createElement('p');
    modalError.classList.add('modal-error', 'none');
    modalDeleteData.append(modalError);

    const modalButtonsActions = createModalButtonsActions();

    modalButtonsActions.modalButton.textContent = "Удалить";
    modalButtonsActions.modalButton.addEventListener('click', async () => {
      modalDeleteData.classList.add('load');

      let response = await deleteClientData(currentClientData);

      if (statuses.success.includes(response.status)) {
        currentElement.remove();
        // получение обновленного списка клиентов с сервера
        clientsList = await getClientsData();
        closeModalOpen(modalDeleteData);
        modalDeleteData.classList.remove('load');
      } else if (statuses.failure.includes(response.status)) {
        modalError.classList.remove('none');
        modalError.textContent = `Ошибка: ${response.statusText}!`;
        modalDeleteData.classList.remove('load');
      } else {
        modalError.classList.remove('none');
        modalError.textContent = "Что-то пошло не так...";
        modalDeleteData.classList.remove('load');
      }
    });
    modalDeleteData.append(modalButtonsActions.modalButton);

    modalButtonsActions.modalButtonReversed.textContent = "Отмена";
    modalButtonsActions.modalButtonReversed.addEventListener('click', () => {
      closeModalOpen(modalDeleteData);
    })
    modalDeleteData.append(modalButtonsActions.modalButtonReversed);

    const modalLoad = createModalLoad();
    modalDeleteData.append(modalLoad);

    return modalDeleteData;
  }

  // функция открытия модального окна удаления клиента
  function openModalDeleteClient(objData) {
    const modalDeleteData = document.getElementById('modal-delete-data');
    modalDeleteData.tabIndex = "200";

    const modalError = modalDeleteData.querySelector('.modal-error');
    modalError.classList.add('none');
    modalError.textContent = "";

    currentClientData = Object.assign({}, objData.clientObj);
    currentElement = objData.element;

    modalDeleteData.classList.add('open');

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      modalDeleteData.focus();
    }, WAIT_TIME_MS);
  }

  // получить дату в формате "дд.мм.гггг"
  function getFormatDate(date) {
    let day = date.getDate();
    day = day >= 10 ? day : "0" + day;

    let month = date.getMonth() + 1;
    month = month >= 10 ? month : "0" + month;

    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  // получить время в формате "чч:мм"
  function getFormatTime(time) {
    let hours = time.getHours();
    hours = hours >= 10 ? hours : "0" + hours;

    let minutes = time.getMinutes();
    minutes = minutes >= 10 ? minutes : "0" + minutes;

    return `${hours}:${minutes}`;
  }

  // получить id svg переданного типа контакта
  function getIdIconContact(typeContact) {
    switch (typeContact) {
      case "Телефон":
        return "phone";
      // case "Доп. телефон":
      //   return "contact";
      case "Email":
        return "mail";
      case "VK":
        return "vk";
      case "Facebook":
        return "fb";
      case "Другое":
        return "contact";
      default:
        return "contact";
    }
  }

  // функция создания контакта клиента
  function createContactClient(contact, number, length, clientContactsList) {
    if (length > 5 && number === 5) {
      const clientContactsItemMore = document.createElement('li');
      clientContactsItemMore.classList.add('contacts-item', 'contacts-item__more');

      const clientContactIconMore = createIcon('contacts-more');
      clientContactIconMore.classList.add('contacts-item__more-icon');
      clientContactsItemMore.append(clientContactIconMore);

      const clientContactTextMore = document.createElement('span');
      clientContactTextMore.classList.add('contacts-item__more-count');
      clientContactTextMore.textContent = `+${length - 4}`;
      clientContactsItemMore.append(clientContactTextMore);

      clientContactsItemMore.addEventListener('click', () => {
        clientContactsItemMore.classList.toggle('none');
        for (let i = 5; i <= length; i++) {
          clientContactsList.children[i].classList.toggle('none');
        }
      });
      clientContactsList.append(clientContactsItemMore);
    }

    const clientContactsItem = document.createElement('li');
    clientContactsItem.classList.add('contacts-item');
    if (length > 5 && number >= 5) {
      clientContactsItem.classList.toggle('none');
    }

    const clientContactIcon = createIcon(getIdIconContact(contact.type));
    clientContactIcon.classList.add('contacts-item__icon');
    clientContactsItem.append(clientContactIcon);

    const clientContactText = document.createElement('span');
    clientContactText.classList.add('contacts-item__text');
    clientContactText.textContent = `${contact.type}: ${contact.value}`;
    clientContactsItem.append(clientContactText);

    clientContactsItem.addEventListener('mouseover', () => {
      const tooltip = document.getElementById('tooltip');
      tooltip.style.top = (clientContactsItem.getBoundingClientRect().top - 26) + "px";
      tooltip.style.left = (clientContactsItem.getBoundingClientRect().left + 8) + "px";
      const tooltipText = tooltip.querySelector('.tooltip__text');
      tooltipText.textContent = clientContactText.textContent;
      tooltip.classList.add('open');
    });
    clientContactsItem.addEventListener('mouseout', () => {
      const tooltip = document.getElementById('tooltip');
      tooltip.classList.remove('open');
      const tooltipText = tooltip.querySelector('.tooltip__text');
      tooltipText.textContent = "";
    });

    clientContactsList.append(clientContactsItem);
  }

  // создаём элемент таблицы клиентов
  function getClientItemElement(clientObj, { onСhange, onDelete }) {
    const rowClient = document.createElement('tr');

    // колонка ID
    const colClientId = document.createElement('td');
    colClientId.classList.add('col-id');
    colClientId.textContent = clientObj.id;
    rowClient.append(colClientId);

    // колонка ФИО
    const colClientFullname = document.createElement('td');
    colClientFullname.classList.add('col-fullname');
    colClientFullname.textContent = `${clientObj.surname} ${clientObj.name} ${clientObj.lastName}`;
    rowClient.append(colClientFullname);

    // колонка Дата и время создания
    const colClientTimeCreation = document.createElement('td');
    colClientTimeCreation.classList.add('col-time-creation');
    const colClientTimeCreationContent = document.createElement('div');
    colClientTimeCreationContent.classList.add('col-time-creation__content', 'flex');
    const clientTimeCreationDate = document.createElement('span');
    clientTimeCreationDate.classList.add('date');
    clientTimeCreationDate.textContent = getFormatDate(new Date(clientObj.createdAt));
    colClientTimeCreationContent.append(clientTimeCreationDate);
    const clientTimeCreationTime = document.createElement('span');
    clientTimeCreationTime.classList.add('time');
    clientTimeCreationTime.textContent = getFormatTime(new Date(clientObj.createdAt));
    colClientTimeCreationContent.append(clientTimeCreationTime);
    colClientTimeCreation.append(colClientTimeCreationContent);
    rowClient.append(colClientTimeCreation);

    // колонка Последние изменения
    const colClientTimeChange = document.createElement('td');
    colClientTimeChange.classList.add('col-time-change');
    const colClientTimeChangeContent = document.createElement('div');
    colClientTimeChangeContent.classList.add('col-time-change__content', 'flex');
    const clientTimeChangeDate = document.createElement('span');
    clientTimeChangeDate.classList.add('date');
    clientTimeChangeDate.textContent = getFormatDate(new Date(clientObj.updatedAt));
    colClientTimeChangeContent.append(clientTimeChangeDate);
    const clientTimeChangeTime = document.createElement('span');
    clientTimeChangeTime.classList.add('time');
    clientTimeChangeTime.textContent = getFormatTime(new Date(clientObj.updatedAt));
    colClientTimeChangeContent.append(clientTimeChangeTime);
    colClientTimeChange.append(colClientTimeChangeContent);
    rowClient.append(colClientTimeChange);

    // колонка Контакты
    const colClientContacts = document.createElement('td');
    colClientContacts.classList.add('col-contacts');
    const clientContactsList = document.createElement('ul');
    clientContactsList.classList.add('contacts-list', 'list-reset', 'flex');

    clientObj.contacts.forEach((contact, index) => {
      createContactClient(contact, index + 1, clientObj.contacts.length, clientContactsList);
    });

    colClientContacts.append(clientContactsList);
    rowClient.append(colClientContacts);

    // колонка Действия
    const colActions = document.createElement('td');
    colActions.classList.add('col-actions');
    const colActionsContent = document.createElement('div');
    colActionsContent.classList.add('col-actions__content', 'flex');

    // кнопка Изменить
    const changeClientButton = document.createElement('button');
    changeClientButton.classList.add('btn-change-client', 'btn-reset');
    const changeClientButtonIcon = createIcon('edit');
    changeClientButtonIcon.classList.add('btn-change-client__icon');
    changeClientButton.append(changeClientButtonIcon);
    const changeClientButtonLoad = document.createElement('span');
    changeClientButtonLoad.classList.add('btn-change-client__load');
    changeClientButton.append(changeClientButtonLoad);
    const changeClientButtonText = document.createElement('span');
    changeClientButtonText.classList.add('btn-change-client__text');
    changeClientButtonText.textContent = "Изменить";
    changeClientButton.append(changeClientButtonText);
    changeClientButton.addEventListener('click', () => {
      changeClientButton.classList.add('load');
      onСhange({ clientObj, element: rowClient });
    });
    colActionsContent.append(changeClientButton);

    // кнопка Удалить
    const deleteClientButton = document.createElement('button');
    deleteClientButton.classList.add('btn-delete-client', 'btn-reset');
    const deleteClientButtonIcon = createIcon('delete');
    deleteClientButtonIcon.classList.add('btn-delete-client__icon');
    deleteClientButton.append(deleteClientButtonIcon);
    const deleteClientButtonText = document.createElement('span');
    deleteClientButtonText.classList.add('btn-delete-client__text');
    deleteClientButtonText.textContent = "Удалить";
    deleteClientButton.append(deleteClientButtonText);
    deleteClientButton.addEventListener('click', () => {
      onDelete({ clientObj, element: rowClient });
    });
    colActionsContent.append(deleteClientButton);

    colActions.append(colActionsContent);
    rowClient.append(colActions);

    return rowClient;
  }

  // функция заполнения таблицы
  function renderClientsTable(arr) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = "";

    // отрисовка таблицы
    arr.forEach(client => {
      let clientItemElement = getClientItemElement(client, handlers);
      tableBody.append(clientItemElement);
    });
  }

  async function loadingPage() {
    // создаём модальные окна
    const modalAddData = createModalAddClient();
    document.body.append(modalAddData);

    const modalChangeData = createModalChangeClient();
    document.body.append(modalChangeData);

    const modalDeleteData = createModalDeleteClient();
    document.body.append(modalDeleteData);

    // создаём overlay
    const overlay = createOverlay();
    document.body.append(overlay);

    // создаём tooltip для отображения информации о контактах клиентов
    const tooltip = createTooltip();
    document.body.append(tooltip);

    // создаём header
    const header = createHeader();
    document.body.append(header);

    // создаём main
    const main = document.createElement('main');
    main.classList.add('main');

    const container = document.createElement('div');
    container.id = "container";
    container.classList.add('container');

    // создаём заголовок h1, который будет скрыт
    const mainTitle = createMainTitle();
    container.append(mainTitle);

    const title = createTitle("Клиенты");
    container.append(title);

    // создаём блок с таблицей клиентов
    const tableBlock = document.createElement('div');
    tableBlock.id = "table-block";
    tableBlock.classList.add('table-block');

    // создаём таблицу клиентов
    const clientsTable = createClientsTable();
    tableBlock.append(clientsTable);

    container.append(tableBlock);

    // создаём кнопку добавления нового клиента
    const addClientButton = createAddClientButton();
    container.append(addClientButton);

    main.append(container);
    document.body.append(main);

    // создаём блок загрузки пока будет идти получение данных с сервра и отрисовка таблицы
    const loader = createLoader();
    tableBlock.append(loader);

    // вызов сервера для получения данных для таблицы
    clientsList = await getClientsData();

    // отрисовка таблицы с сортировкой по id
    defaultSort();

    // удаляем блок загрузки, когда таблица полностью отрисована
    loader.remove();

    // добавляем обработчики событий на страницу
    addEventsListenerDocument();

    // если открываем по ссылке с заданным hash, то необходимо открыть модальное окно изменения клиента с указанным в hash id
    if (window.location.hash) openModalChangeClientByHash(window.location.hash.substring(1));
  }

  window.loadingPage = loadingPage;
})();
