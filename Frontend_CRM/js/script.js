import { svgDelete, svgPhone, svgFb, svgVK, svgEmail, svgOther, svgCloseModal, svgContactDefault, svgPreloadMain } from "./svg.js";
const body = document.body;

async function serverAddClient(obj) {
  let response = await fetch('http://localhost:3000/api/clients/', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  })
  let data = await response.json()
  return data
}

async function serverGetClient() {
  let response = await fetch('http://localhost:3000/api/clients/', {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  })
  let data = await response.json()
  return data
}

async function serverEditClient(id, inputName, inputSurname, inputLastName, contacts) {
  let response = await fetch('http://localhost:3000/api/clients/' + id, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      name: inputName,
      surname: inputSurname,
      lastName: inputLastName,
      contacts: contacts
    }),
  })
  let data = null
  if (response.ok) {
    data = await response.json()
  }
  return data
}


async function serverDeleteClient(id) {
  let response = await fetch('http://localhost:3000/api/clients/' + id, {
    method: "DELETE",
  })
  let data = await response.json()
  return data
}

async function findClient(value) {
  try {
      const response = await fetch(`http://localhost:3000/api/clients?search=${value}`, {
          method: 'GET'
      });

      const result = await response.json();

      return result;
  } catch (error) {
      console.log(error);
  }
}


let serverData = await serverGetClient();
searchClients(serverData);
let listClients = []

if (serverData !== null) {
  listClients = serverData
}

function getClientTr(client) {

  const tr = document.createElement("tr")
  let indexTD = document.createElement("td")
  let fioTD = document.createElement("td")
  let createdAtTD = document.createElement("td")
  let updatedAtTD = document.createElement("td")
  let contactsTD = document.createElement("td")
  let actionsTD = document.createElement("td")


  actionsTD.classList.add("actions__td")
  let changeBtn = document.createElement("button")
  changeBtn.textContent = "Изменить"
  changeBtn.classList.add("btn-reset", "change__btn")
  let deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Удалить"
  deleteBtn.classList.add("btn-reset", "delete__btn")
  actionsTD.append(changeBtn, deleteBtn)


  tr.classList.add("clients__item")
  indexTD.textContent = client.id
  indexTD.classList.add("index__td")
  fioTD.textContent = `${client.lastName} ${client.name} ${client.surname}`

  const createdDate = document.createElement("span")
  createdDate.classList.add('created__date')
  createdDate.textContent = formatDate(new Date(client.createdAt))
  const createdTime = document.createElement("span")
  createdTime.classList.add('created__time')
  createdTime.textContent = formatTime(new Date(client.createdAt))
  createdAtTD.append(createdDate, createdTime)


  const updatedDate = document.createElement("span")
  updatedDate.classList.add('updated__date')
  updatedDate.textContent = formatDate(new Date(client.updatedAt))
  const updatedTime = document.createElement("span")
  updatedTime.classList.add('updated__time')
  updatedTime.textContent = formatTime(new Date(client.updatedAt))
  updatedAtTD.append(updatedDate, updatedTime)


  contactsTD.classList.add('clients__contacts');
  for (const contact of client.contacts) {
    createContactItemByType(contact.type, contact.value, contactsTD);
  }


  deleteBtn.addEventListener("click", async function () {
    const deleteClient = deleteClientModal(client);
    document.body.append(deleteClient.deleteModal);
    deleteClient.deleteModalDelete.addEventListener('click', async () => {
      await serverDeleteClient(client.id)
      tr.remove();
      deleteClient.deleteModal.remove();
    });
  })

  changeBtn.addEventListener("click", function () {
    const edittModal = editClientModal(client);
    document.body.append(edittModal.editModal);
  })


  tr.append(indexTD, fioTD, createdAtTD, updatedAtTD, contactsTD, actionsTD)
  return tr
}



function render(arr) {
  let copyArr = [...arr]
  const $clientsTable = document.getElementById("clients-table")
  $clientsTable.innerHTML = ''
  for (const client of copyArr) {
    const newTr = getClientTr(client)
    $clientsTable.append(newTr)
  }


}
render(listClients)



function formatDate(client) {
  let dd = client.getDate();
  if (dd < 10) dd = '0' + dd;

  let mm = client.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  let yy = client.getFullYear();
  if (yy < 10) yy = '0' + yy;

  return dd + '.' + mm + '.' + yy
}


function formatTime(client) {
  let hh = client.getHours();
  if (hh < 10) hh = '0' + hh;

  let min = client.getMinutes();
  if (min < 10) min = '0' + min;

  return hh + ':' + min
}

function formatLink(type, value, element, svg, item) {
  const setTooltip = contactTooltip(type, value);
  element = document.createElement('a');
  element.classList.add('contacts__link');
  element.innerHTML = svg;

  if (type === 'Email') {
    element.href = `mailto:${value.trim()}`;
  } else if (type === 'Телефон') {
    element.href = `tel:${value.trim()}`;
    setTooltip.tooltipValue.style.color = 'var(--color-white)';
    setTooltip.tooltipValue.style.textDecoration = 'none';
  } else {
    element.href = value.trim();
  }
  element.append(setTooltip.tooltip);
  item.append(element);
}

function createContactItemByType(type, value, item) {
  switch (type) {
    case 'Телефон':
      let phone;
      formatLink(type, value, phone, svgPhone, item);
      break;
    case 'Facebook':
      let fb;
      formatLink(type, value, fb, svgFb, item);
      break;
    case 'VK':
      let vk;
      formatLink(type, value, vk, svgVK, item);
      break;
    case 'Email':
      let email;
      formatLink(type, value, email, svgEmail, item);
      break;
    case 'Другое':
      let other;
      formatLink(type, value, other, svgOther, item);
      break;

    default:
      break;
  }
}


document.getElementById("add-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const contactTypes = document.querySelectorAll('.contact__name');
  const contactValues = document.querySelectorAll('.contact__input');
  let contacts = []
  let client = {}
  for (let i = 0; i < contactTypes.length; i++) {
    contacts.push({
      type: contactTypes[i].innerHTML,
      value: contactValues[i].value
    });
  }

  let newClientObj = {
    name: document.getElementById("input-name").value,
    surname: document.getElementById("input-surname").value,
    lastName: document.getElementById("input-lastname").value,
  }


  let serverDataObj = await serverAddClient(newClientObj)
  serverDataObj.createdAt = new Date(serverDataObj.createdAt)
  serverDataObj.updatedAt = new Date(serverDataObj.updatedAt)
  listClients.push(serverDataObj)

  render(listClients)
  document.getElementById("add-modal").classList.remove("open");
  document.getElementById("input-name").value = '',
    document.getElementById("input-surname").value = '',
    document.getElementById("input-lastname").value = '',
    document.getElementById("input-lastname").value = '';

})


  const sortingDisplayId = document.getElementById('th-content--id');
  const sortingDisplayName = document.getElementById('th-content--fio');
  const sortingDisplayCreate = document.getElementById('th-content--create');
  const sortingDisplayEdit = document.getElementById('th-content--change');
  const spanId = document.getElementsByClassName('id__span');

  const sortDisplayItems = [sortingDisplayId, sortingDisplayName, sortingDisplayCreate, sortingDisplayEdit];

  for (const item of sortDisplayItems) {
      item.addEventListener('click', () => {
          if (item.classList.contains('sort-down')) {
              item.classList.remove('sort-down');
              item.classList.add('sort-up');

          } else {
              item.classList.add('sort-down');
              item.classList.remove('sort-up');
          }
      });

}
console.log(listClients)
document.addEventListener('DOMContentLoaded', sortTable());


//Создание контактов клиента
function createContactItem() {
  const contact = document.createElement('div');
  const contactType = document.createElement('div');
  const contactName = document.createElement('button');
  const contactList = document.createElement('ul');
  const contactPhone = document.createElement('li');
  const contactVk = document.createElement('li');
  const contactFb = document.createElement('li');
  const contactEmail = document.createElement('li');
  const contactOther = document.createElement('li');
  const contactInput = document.createElement('input');
  const contactDelete = document.createElement('button');


  contact.classList.add('contact');
  contactType.classList.add('contact__type');
  contactName.classList.add('contact__name', 'btn-reset');
  contactList.classList.add('contact__list', 'list-reset');
  contactPhone.classList.add('contact__item');
  contactVk.classList.add('contact__item');
  contactFb.classList.add('contact__item');
  contactEmail.classList.add('contact__item');
  contactOther.classList.add('contact__item');
  contactInput.classList.add('contact__input');
  contactDelete.classList.add('contact__delete', 'btn-reset');
  contactDelete.id = 'contact__delete';

  contactName.textContent = 'Телефон';
  contactPhone.textContent = 'Телефон';
  contactEmail.textContent = 'Email';
  contactFb.textContent = 'Facebook';
  contactVk.textContent = 'VK';
  contactOther.textContent = 'Другое';
  contactInput.placeholder = 'Введите данные контакта';
  contactInput.type = 'text';
  contactDelete.innerHTML = svgDelete;
  contactDelete.addEventListener('click', (e) => {
    e.preventDefault();
    contact.remove();
    document.getElementById("modal__btn").classList.remove('modal__btn--disable');
    document.getElementById("modal__addBtn").classList.remove('modal__btn--disable');
  });

  contactName.addEventListener('click', (e) => {
    e.preventDefault();
    contactList.classList.toggle('contact__list--active');
    contactName.classList.toggle('contact__list--active');
  });

  contactType.addEventListener('mouseleave', () => {
    contactList.classList.remove('contact__list--active');
    contactName.classList.remove('contact__list--active');
  });

  const setType = (type) => {
    type.addEventListener('click', () => {
      contactName.textContent = type.textContent;
      contactList.classList.remove('contact__list--active');
      contactName.classList.remove('contact__list--active');
    });
  }

  const typesArray = [contactPhone, contactEmail, contactFb, contactVk, contactOther];

  for (const type of typesArray) {
    setType(type);
  }

  contact.append(contactType, contactInput, contactDelete);
  contactType.append(contactName, contactList);
  contactList.append(contactPhone, contactEmail, contactFb, contactVk, contactOther);

  return {
    contact,
    contactName,
    contactInput,
    contactDelete
  }
}

document.getElementById("modal__btn").addEventListener("click", function (event) {
  event.preventDefault();
  const contactsItems = document.getElementsByClassName('contact');
  const contactsBlock = document.getElementById('modal__contact');


  if (contactsItems.length < 9) {
    const contactItem = createContactItem();
    contactsBlock.prepend(contactItem.contact);
    contactsBlock.style.backgroundColor = 'var(--athens-gray)';
  } else {
    const contactItem = createContactItem();
    contactsBlock.prepend(contactItem.contact);
    document.getElementById("modal__btn").classList.add('modal__btn--disable');
  }
});




// модальное окно "Добавить клиента"
document.getElementById("add__btn").addEventListener("click", function () {
  document.getElementById("add-modal").classList.add("open")
}),

  document.getElementById("close-btn").addEventListener("click", function () {
    document.getElementById("add-modal").classList.remove("open")
    document.getElementById("input-name").value = '',
      document.getElementById("input-surname").value = '',
      document.getElementById("input-lastname").value = '',
      document.getElementById("input-lastname").value = '';
  }),

  document.getElementById("cancel__btn").addEventListener("click", function () {
    document.getElementById("add-modal").classList.remove("open")
    document.getElementById("input-name").value = '',
      document.getElementById("input-surname").value = '',
      document.getElementById("input-lastname").value = '',
      document.getElementById("input-lastname").value = '';
  }),

  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      body.classList.remove('stop-scroll');
      document.getElementById("add-modal").classList.remove("open");
      document.getElementById("input-name").value = '',
        document.getElementById("input-surname").value = '',
        document.getElementById("input-lastname").value = '',
        document.getElementById("input-lastname").value = '';
    }
  });
document.querySelector("#add-modal .modal__box").addEventListener('click', event => {
  event._isClickWithInModal = true;
});
document.getElementById("add-modal").addEventListener('click', event => {
  if (event._isClickWithInModal) return;
  body.classList.remove('stop-scroll');
  event.currentTarget.classList.remove('open');
  document.getElementById("input-name").value = '',
    document.getElementById("input-surname").value = '',
    document.getElementById("input-lastname").value = '',
    document.getElementById("input-lastname").value = '';
  for (const contact of client.contacts) {
    const createContact = createContactItem();
    createContact.contactName.textContent = '';
    createContact.contactInput.textContent = '';


  }



});

// модальное окно "Изменить"
  function editClientModal(client) {
  const editModal = document.createElement('div');
  const editModalContent = document.createElement('div');
  const modalTitle = document.createElement('h2');
  const modalClose = document.createElement('button');
  const form = document.createElement('form');
  const inputName = document.createElement('input');
  const labelName = document.createElement('label');
  const inputSurname = document.createElement('input');
  const labelSurname = document.createElement('label');
  const inputLastName = document.createElement('input');
  const labelLastName = document.createElement('label');
  const requiredName = document.createElement('span');
  const requiredLastName = document.createElement('span');
  const contactBtnSvgDefault = document.createElement('span');
  const addContactBtn = document.createElement('button');
  const saveBtn = document.createElement('button');
  const dltBtn = document.createElement('button');
  const contactsBlock = document.createElement('div');
  const formFloatingName = document.createElement('div');
  const formFloatingSurname = document.createElement('div');
  const formFloatingLastName = document.createElement('div');
  const titleId = document.createElement('span');



  editModal.classList.add('modal', 'open');
  editModalContent.classList.add('modal__box');

  modalTitle.classList.add('modal__title');
  modalClose.classList.add('modal__close', 'btn-reset');
  modalClose.innerHTML = svgCloseModal;

  form.classList.add('modal__form');
  titleId.classList.add('modal__id');
  formFloatingName.classList.add('form-floating');
  formFloatingSurname.classList.add('form-floating');
  formFloatingLastName.classList.add('form-floating');
  inputName.classList.add('modal__input');
  inputSurname.classList.add('modal__input');
  inputLastName.classList.add('modal__input');
  labelName.classList.add('modal__label');
  labelSurname.classList.add('modal__label');
  labelLastName.classList.add('modal__label');
  requiredName.classList.add('modal__label');
  requiredLastName.classList.add('modal__label');
  addContactBtn.classList.add('modal__btn', 'btn-reset');
  addContactBtn.id = 'modal__addBtn';
  contactBtnSvgDefault.classList.add('btn-contact__svg',);
  saveBtn.classList.add('modal__btn-save', 'btn-reset', 'safe__btn');
  dltBtn.classList.add('modal__btn-back', 'btn-reset');
  contactsBlock.classList.add('modal__contact');
  labelName.for = 'floatingName';
  labelSurname.for = 'floatingSurname';
  labelLastName.for = 'floatingLastName';
  inputName.id = 'floatingName';
  inputSurname.id = 'floatingSurname';
  inputLastName.id = 'floatingLastName';
  inputName.type = 'text';
  inputSurname.type = 'text';
  inputLastName.type = 'text';
  inputName.placeholder = 'Имя';
  inputSurname.placeholder = 'Фамилия';
  inputLastName.placeholder = 'Отчество';

  titleId.textContent = 'ID:' + client.id;
  modalTitle.textContent = 'Изменить данные';
  labelName.textContent = 'Имя';
  labelSurname.textContent = 'Отчество';
  labelLastName.textContent = 'Фамилия';
  contactBtnSvgDefault.innerHTML = svgContactDefault;
  addContactBtn.textContent = 'Добавить контакт';
  saveBtn.textContent = 'Сохранить';
  dltBtn.textContent = 'Удалить клиента';
  requiredName.textContent = '*';
  requiredLastName.textContent = '*';


  labelName.append(requiredName);
  labelLastName.append(requiredLastName);
  formFloatingName.append(inputName, labelName);
  formFloatingSurname.append(inputSurname, labelSurname);
  formFloatingLastName.append(inputLastName, labelLastName);
  contactsBlock.append(addContactBtn);
  form.append(
    formFloatingLastName,
    formFloatingName,
    formFloatingSurname,
    contactsBlock,
    saveBtn,
    dltBtn
  );


  dltBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const deleteClient =  deleteClientModal();

    document.body.append(deleteClient.deleteModal);
    deleteClient.deleteModalDelete.addEventListener('click', async  () => {
      const newTr = getClientTr(client);
      newTr.tr.remove();
      // document.getElementById(client.id).remove();
      deleteClient.deleteModal.remove();
      await serverDeleteClient(client.id);
  });
  });


  addContactBtn.prepend(contactBtnSvgDefault);


  addContactBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const contactsItems = document.getElementsByClassName('contact');

    if (contactsItems.length < 9) {
      const contactItem = createContactItem();
      contactsBlock.prepend(contactItem.contact);
      contactsBlock.style.backgroundColor = 'var(--athens-gray)';
    } else {
      const contactItem = createContactItem();
      contactsBlock.prepend(contactItem.contact);
      addContactBtn.classList.add('modal__btn--disable');
    }

  });

  inputName.value = client.name
  inputSurname.value = client.surname
  inputLastName.value = client.lastName
  for (const contact of client.contacts) {
    const createContact = createContactItem();
    createContact.contactName.textContent = contact.type;
    createContact.contactInput.textContent = contact.value;
    contactsBlock.prepend(createContact.contact);
    contactsBlock.style.backgroundColor = 'var(--athens-gray)';
  }


  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const contactTypes = document.querySelectorAll('.contact__name');
    const contactValues = document.querySelectorAll('.contact__input');
    const contacts = [];

    for (let i = 0; i < contactTypes.length; i++) {
      contacts.push({
        type: contactTypes[i].innerHTML,
        value: contactValues[i].value
      });
    }
    client.name = inputName.value;
    client.surname = inputSurname.value;
    client.lastName = inputLastName.value;
    client.contacts = contacts;

    await serverEditClient(client.id, inputName.value, inputSurname.value, inputLastName.value, contacts);

  });

  modalTitle.append(titleId);
  editModalContent.append(modalTitle, modalClose, form);
  editModal.append(editModalContent);

  modalClose.addEventListener('click', () => {
    editModal.remove();
  });

  document.addEventListener('click', (e) => {
    if (e.target == editModal) {
      editModal.remove();
    }
  });

  return {
    editModal
  }

}

// удалить клиента
function deleteClientModal(client) {
  const deleteModalContent = document.createElement('div');
  const modalClose = document.createElement('button');
  const deleteModalTitle = document.createElement('h2');
  const deleteModalText = document.createElement('p');
  const deleteModal = document.createElement('div');
  const deleteModalDelete = document.createElement('button');
  const deleteModalBack = document.createElement('button');

  deleteModal.classList.add('delete-modal', 'open');
  deleteModalContent.classList.add('delete-modal__content', 'modal__box',);
  deleteModalText.classList.add('delete-modal__text');
  deleteModalTitle.classList.add('delete-modal__title', 'modal__title');
  deleteModalDelete.classList.add('delete-modal__delete', 'btn-reset', 'safe__btn');
  deleteModalBack.classList.add('modal__btn-back', 'btn-reset');
  modalClose.classList.add('modal__close', 'btn-reset');
  modalClose.innerHTML = svgCloseModal;

  deleteModalTitle.textContent = 'Удалить клиента';
  deleteModalText.textContent = 'Вы действительно хотите удалить данного клиента?';
  deleteModalDelete.textContent = 'Удалить';
  deleteModalBack.textContent = 'Отмена';

  deleteModalContent.append(
    modalClose,
    deleteModalTitle,
    deleteModalText,
    deleteModalDelete,
    deleteModalBack
  )
  deleteModal.append(deleteModalContent);

  modalClose.addEventListener('click', () => deleteModal.remove());
  deleteModalBack.addEventListener('click', () => deleteModal.remove());

  window.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.remove();
    }
  });

  return {
    deleteModal,
    deleteModalContent,
    deleteModalDelete
  }
}

function contactTooltip(type, value) {
  const tooltip = document.createElement('div');
  const tooltipType = document.createElement('span');
  const tooltipValue = document.createElement('a');

  tooltip.classList.add('contact-tooltip', 'site-tooltip');
  tooltipType.classList.add('contact-tooltip__type');
  tooltipValue.classList.add('contact-tooltip__value');

  tooltipType.textContent = type + ': ';
  tooltipValue.textContent = value;

  tooltip.append(tooltipType, tooltipValue);

  return {
    tooltip,
    tooltipType,
    tooltipValue
  }
};


// сортировка
function sortTable() {
  const table = document.querySelector('table');
  const headers = table.querySelectorAll('th');
  const tbody = table.querySelector('tbody');

  const directions = Array.from(headers).map(() => '');
  console.log(directions);

  const transform = (type, content) => {
      switch (type) {
          case 'id':
              return parseFloat(content);
          case 'create':
          case 'update':
              return content.split('.').reverse().join('-');
          case 'text':
          default:
              return content;
      }
  }

  function sortColumn (index) {
      const type = headers[index].getAttribute('data-type');
      const rows = tbody.querySelectorAll('tr');
      const direction = directions[index] || 'sortUp';
      const multiply = direction === 'sortUp' ? 1 : -1;
      const newRows = Array.from(rows);


      newRows.sort((row1, row2) => {
          const cellA = row1.querySelectorAll('td')[index].textContent;
          const cellB = row2.querySelectorAll('td')[index].textContent;

          const a = transform(type, cellA);
          const b = transform(type, cellB);


          switch (true) {
              case a > b:
                  return 1 * multiply;
              case a < b:
                  return -1 * multiply;
              default:
                  break;
              case a === b:
              return 0;
          }
      });

      [].forEach.call(rows, (row) => {
          tbody.removeChild(row);
      });

      directions[index] = direction === 'sortUp' ? 'sortDown' : 'sortUp';

      newRows.forEach(newRow => {
          tbody.appendChild(newRow);
      });
  }

  [].forEach.call(headers, (header, index) => {
      header.addEventListener('click', () => {
          sortColumn(index);

      });
  });
}

// поиск
function searchClients(serverData) {
  const wrapper = document.createElement('div');
  const inner = document.getElementById('header__inner');
  const input = document.getElementById('header__input');
  const findList = document.createElement('ul');

  findList.classList.add('find-list', 'hide');
  wrapper.classList.add('header__wrapper');
  inner.classList.add('header__inner');

  inner.append(findList);


  serverData.forEach(client => {
      const findItem = document.createElement('li');
      const findLink = document.createElement('a');

      findItem.classList.add('find-list__item');
      findLink.classList.add('find-list__link');

      findLink.textContent = `${client.name} ${client.surname} ${client.lastName}`;
      findLink.href = '#';

      findItem.append(findLink);
      findList.append(findItem);
  });

  const rewriteTable = async (str) => {
      const response = await findClient(str);
      const tbody = document.getElementById('clients-table');
      tbody.innerHTML = '';

      for (const client of response) {
          tbody.append(getClientTr(client));
      }
  }

  input.addEventListener('input', async () => {
      const value = input.value.trim();
      const foundItems = document.querySelectorAll('.find-list__link');

      if (value !== '') {
          rewriteTable(value);

          foundItems.forEach(link => {
              if (link.innerText.search(value) == -1) {
                  link.classList.add('hide');
                  link.innerHTML = link.innerText;
              } else {
                  link.classList.remove('hide');
                  findList.classList.remove('hide');
                  const str = link.innerText;
                  link.innerHTML = insertMark(str, link.innerText.search(value), value.length);
              }
          });
      } else {
          foundItems.forEach(link => {
              const tbody = document.getElementById('clients-table');
              tbody.innerHTML = '';

              serverData.forEach(client => tbody.append(getClientTr(client)));

              link.classList.remove('hide');
              findList.classList.add('hide');
              link.innerHTML = link.innerText;
          });
      }
  });

  const insertMark = (str, pos, len) => str
  .slice(0, pos) + '<mark>' + str
  .slice(pos, pos + len) + '</mark>' + str
  .slice(pos + len);
}

searchClients(serverData)


//Form
// var selector = document.querySelector("input[type='tel']");
// var im = new Inputmask("+7 (999)-999-99-99");
// im.mask(selector);

// new window.JustValidate('.modal__form', {
//   colorWrong: ' #D11616',

//   rules: {
//     lastName: {
//       required: true,
//       minLength: 2,
//       maxLength: 30
//     },
//     name: {
//       required: true,
//       minLength: 2,
//       maxLength: 30
//     },

    //   tel: {
    //     required: true,
    //     function: (name, value) => {
    //       const phone = selector.inputmask.unmaskedvalue()
    //       return Number(phone) && phone.length === 10;
    //     }
//     //   },
//   },


//   messages: {
//     lastName: {
//       required: "Вы не ввели фамилию",
//       minLength: "Фамилия не может быть короче 2 символов",
//       maxLength: "Фамилия не может быть длиннее 30 символов"
//     },
//     name: {
//       required: "Вы не ввели имя",
//       minLength: "Имя не может быть короче 2 символов",
//       maxLength: "Имя не может быть длиннее 30 символов"
//     },
//     // tel: {
//     //   required: "Вы не ввели телефон",
//     //   function: "Телефон должен содержать 10 цифр"
//     // },

//   },
// });

