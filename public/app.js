const excelFileInput = document.querySelector("#excelFileInput");
const packageList = document.querySelector("#packageList");
const saveToJsonButton = document.querySelector("#saveToJsonButton");
const addListBtn = document.querySelector("#addList");
const showContent = document.querySelector("#show-content");
const addTrackCodesButton = document.querySelector("#add-track-codes");
const showTrackCodesButton = document.querySelector("#show-track-codes");
const addContent = document.querySelector("#add-content");
const trackCodesContent = document.querySelector("#track-codes");
const searchButton = document.querySelector("#searchButton");
const selectAll = document.querySelector("#selectAll");
const changeStatusButton = document.querySelector("#changeStatusButton");
const loadMoreButton = document.querySelector("#loadMoreButton");
const currentPageSpan = document.querySelector("#currentPage");
const deleteBtn = document.querySelector("#deleteSelectedButton");
// const url = 'https://p2p-back-4e8a787f8863.herokuapp.com'
const url = "http://localhost:5151";
let currentPage = 1;
const loadAllDataButton = document.querySelector("#loadAllDataButton");
const scrollToTopButton = document.getElementById("scrollToTopButton");

// getData()

function handleScroll() {
  const scrollY = window.scrollY;

  if (scrollY > 200) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

window.addEventListener("scroll", handleScroll);

scrollToTopButton.addEventListener("click", scrollToTop);

async function fetchAllDataForDate(filterDate) {
  try {
    const response = await axios.get(`${url}/package_data/all`, {
      params: {
        date: filterDate,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching all data:", error);
    return [];
  }
}
changeStatusButton.addEventListener("click", changeStatusForSelectedTrackCodes);

loadAllDataButton.addEventListener("click", async () => {
  const searchDate = document.querySelector("#searchDate").value;
  const formattedSearchDate = convertDateFormat(searchDate);

  try {
    const allData = await fetchAllDataForDate(formattedSearchDate);

    if (allData.length > 0) {
      // Очищаем текущие данные перед загрузкой новых
      trackCodesContent.innerHTML = "";
      // Отображаем все данные
      allData.forEach((package) => render(package, true));
      // Добавляем уведомление, что все данные успешно загружены
      alert("Все данные успешно загружены!");
    } else {
      alert("Нет данных для выбранной даты.");
    }
  } catch (error) {
    console.error("Error loading all data:", error);
  }
});

loadMoreButton.addEventListener("click", async () => {
  const searchDate = document.querySelector("#searchDate").value;
  const formattedSearchDate = convertDateFormat(searchDate);

  try {
    const newData = await fetchDataForPage(currentPage, formattedSearchDate);
    if (newData.length > 0) {
      // Добавить новые данные к существующему списку
      packageDataArray = packageDataArray.concat(newData);
      newData.forEach((package) => render(package));
      currentPage++;
    } else {
      // Если нет новых данных, скрыть кнопку "Загрузить еще" или добавить соответствующий код
      loadMoreButton.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading more data:", error);
  }
});

async function fetchDataForPage(page, filterDate, loadAll) {
  try {
    const response = await axios.get(`${url}/package_data?page=${page}`, {
      params: {
        date: filterDate,
        loadAll: loadAll, // Добавьте параметр загрузки всех данных
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// async function changeStatusForSelectedTrackCodes() {
//   const selectedTrackCodeDivs = document.querySelectorAll(
//     ".track-code.selected"
//   );

//   if (selectedTrackCodeDivs.length === 0) {
//     alert("Пожалуйста, выберите хотя бы один элемент для изменения статуса.");
//     return;
//   }

//   const newStatus = document.getElementById("newStatusInput").value;
//   const updatedData = [];

//   selectedTrackCodeDivs.forEach((div) => {
//     const trackCode = String(div.querySelector("input[value]").value); // Преобразуйте в строку
//     const statusInput = div.querySelector('input[name="status"]');
//     statusInput.value = newStatus; // Обновите значение статуса на клиентской стороне
//     updatedData.push({ trackCode, status: newStatus });
//   });

//   try {
//     const response = await fetch("/update_status", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(updatedData),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       alert(result.message);
//     } else {
//       alert("Произошла ошибка при отправке данных на сервер");
//     }
//   } catch (error) {
//     alert("Ошибка:", error);
//   }

//   // Опционально: Снимите выделение с выбранных трек-кодов
//   selectedTrackCodeDivs.forEach((div) => {
//     div.classList.remove("selected");
//     const selectCheckbox = div.querySelector(".select-checkbox");
//     selectCheckbox.checked = false;
//   });
// }

async function changeStatusForSelectedTrackCodes() {
    const selectedTrackCodeDivs = document.querySelectorAll(
      ".track-code.selected"
    );
  
    if (selectedTrackCodeDivs.length === 0) {
      alert("Пожалуйста, выберите хотя бы один элемент для изменения статуса.");
      return;
    }
  
    const newStatusSelect = document.getElementById("newStatusInput");
    const newStatus = newStatusSelect.value;
    const updatedData = [];
  
    selectedTrackCodeDivs.forEach((div) => {
      const trackCode = String(div.querySelector("input[value]").value);
      const statusInput = div.querySelector('input[name="status"]');
      statusInput.value = newStatus;
      updatedData.push({ trackCode, status: newStatus });
    });
  
    try {
      const response = await fetch("/update_status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
      } else {
        alert("Произошла ошибка при отправке данных на сервер");
      }
    } catch (error) {
      alert("Ошибка: " + error);
    }
  
    selectedTrackCodeDivs.forEach((div) => {
      div.classList.remove("selected");
      const selectCheckbox = div.querySelector(".select-checkbox");
      selectCheckbox.checked = false;
    });
  }
  

async function deleteSelectedTrackCodes() {
  const selectedTrackCodeDivs = document.querySelectorAll(
    ".track-code.selected"
  );
  const trackCodesToDelete = Array.from(selectedTrackCodeDivs).map(
    (div) => div.id
  );

  try {
    // Удалите трек-коды на сервере

    const response = await fetch("/delete_package_data", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackCodesToDelete),
    });

    if (response.ok) {
      // Удалите трек-коды из packageDataArray (данных, хранящихся на клиентской стороне)
      packageDataArray = packageDataArray.filter(
        (pkg) => !trackCodesToDelete.includes(pkg.trackCode)
      );

      // Удалите соответствующие DOM-элементы
      trackCodesToDelete.forEach((trackCode) => {
        const elementToRemove = document.getElementById(trackCode);
        if (elementToRemove) {
          elementToRemove.remove();
        }
      });

      alert("Успешно удалено.");
    } else {
      alert("Произошла ошибка при удалении данных на сервере");
    }
  } catch (error) {
    alert("Ошибка:", error);
  }
}

deleteBtn.addEventListener("click", deleteSelectedTrackCodes);

searchButton.addEventListener("click", async () => {
  const searchDate = document.querySelector("#searchDate").value;
  const formattedSearchDate = convertDateFormat(searchDate);

  try {
    // Очищаем содержимое перед загрузкой новых данных
    trackCodesContent.innerHTML = "";

    // Сбрасываем текущую страницу на 1 перед загрузкой данных
    currentPage = 1;

    // Загружаем данные для первой страницы с учетом фильтра
    const newData = await fetchDataForPage(currentPage, formattedSearchDate);
    if (newData.length > 0) {
      // Добавляем данные к существующему списку
      packageDataArray = newData;
      newData.forEach((package) => render(package));
      currentPage++;
    } else {
      // Если нет данных, скрываем кнопку "Загрузить еще"
      loadMoreButton.style.display = "none";
    }
  } catch (error) {
    alert("Error searching data:", error);
  }
});

selectAll.addEventListener("click", selectAllTrackCodes);

function selectAllTrackCodes() {
  const trackCodeCheckboxes = document.querySelectorAll(
    'input[type="checkbox"][name="trackCode"]'
  );

  trackCodeCheckboxes.forEach((checkbox) => {
    checkbox.checked = true;
    addSelectClass(checkbox);
  });

  // Обновите выделение в данных
  packageDataArray.forEach((package) => (package.selected = true));
}

function addSelectClass(checkbox) {
  const trackCodeDiv = checkbox.closest(".track-code");

  if (checkbox.checked) {
    // Если чекбокс отмечен, добавьте класс "selected" для родительского div
    trackCodeDiv.classList.add("selected");
  } else {
    // Если чекбокс не отмечен, удалите класс "selected" для родительского div
    trackCodeDiv.classList.remove("selected");
  }

  // Обновите выделение в данных
  const trackCode = trackCodeDiv.id;
  const package = packageDataArray.find((pkg) => pkg.trackCode === trackCode);
  if (package) {
    package.selected = checkbox.checked;
  }
}

async function fetchDataForPage(page, filterDate) {
  try {
    const response = await axios.get(`${url}/package_data?page=${page}`, {
      params: {
        date: filterDate,
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function convertDateFormat(inputDate) {
  if (typeof inputDate === "string") {
    const parts = inputDate.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const utcDate = new Date(Date.UTC(year, month - 1, day));
      const formattedDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return `${day}.${month}.${year}`;
    }
  }
  return inputDate;
}

function filterTrackCodesByDate() {
  const searchDate = document.querySelector("#searchDate").value;
  const errorMessage = document.querySelector("#date-error");
  errorMessage.innerHTML = "";

  // Преобразуйте формат даты из "yyyy-mm-dd" в "dd.mm.yyyy"
  const formattedSearchDate = convertDateFormat(searchDate);

  try {
    if (formattedSearchDate === "") throw "Введите корректную дату";

    // Отфильтруйте данные по выбранной дате
    const filteredData = packageDataArray.filter(
      (package) => package.date === formattedSearchDate
    );

    // Очистите содержимое перед отображением отфильтрованных трек-кодов
    trackCodesContent.innerHTML = "";

    // Отобразите отфильтрованные данные
    filteredData.forEach((package) => {
      render(package, true);
    });
  } catch (error) {
    errorMessage.innerHTML = error;
  }
}

const selectCheckboxes = document.querySelectorAll(".select-checkbox");
selectCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    addSelectClass(checkbox);
  });
});

function render(trackCodes) {
  trackCodesContent.innerHTML += `
        <div class="track-code" id="${trackCodes.trackCode}">
            <input value="${trackCodes.trackCode}" readonly>
            <input value="${trackCodes.date}" readonly>
            <input value="${trackCodes.deliveryDate}" readonly>
            <input value="${trackCodes.status}" name="status" class="status-input">
            <input type="checkbox" name="trackCode" class="select-checkbox">
        </div>
    `;
}

addTrackCodesButton.addEventListener("click", () => {
  addTrackCodesButton.classList.add("active");
  showTrackCodesButton.classList.remove("active");
  addContent.classList.add("show");
  addContent.classList.remove("hide");
  showContent.classList.remove("show");
  showContent.classList.add("hide");
});

showTrackCodesButton.addEventListener("click", () => {
  showTrackCodesButton.classList.add("active");
  showContent.classList.remove("hide");
  showContent.classList.add("show");
  addTrackCodesButton.classList.remove("active");
  addContent.classList.add("hide");
  addContent.classList.remove("show");
  packageDataArray = [];
  getData();
});

let packageDataArray = [];

function convertExcelDateToCorrectFormat(excelDate) {
  const excelDateNumber = parseInt(excelDate);
  const date = new Date((excelDateNumber - 25569) * 86400 * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

excelFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      packageList.innerHTML = ""; // Очистим packageList перед добавлением новых данных

      // Выбираем первые два столбца (индексы 0 и 1)
      const columnsToRead = [0, 1];

      // Получаем массив значений из выбранных столбцов
      const columnData = XLSX.utils
        .sheet_to_json(worksheet, { header: 1 }) // Параметр header: 1 указывает, что первая строка содержит заголовки
        .map((row) => columnsToRead.map((colIndex) => row[colIndex]));

      // Проходим по каждой строке
      columnData.forEach((row) => {
        const status = "Отправлен";
        const trackCode = row[1];
        let id = 0;
        const date = convertExcelDateToCorrectFormat(row[0]);

        const parts = date.split(".");
        const year = parseInt(parts[2]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[0]);
        const newDate = new Date(year, month, day);
        const deliveryDate = new Date(newDate);
        deliveryDate.setDate(newDate.getDate() + 8);

        const packageObject = {
          id: id++,
          trackCode: trackCode ? trackCode.toString() : "",
          date: date,
          deliveryDate: deliveryDate.toLocaleDateString(),
          status: status,
        };

        packageDataArray.push(packageObject);

        // Создаем элементы DOM и устанавливаем значения
        const div = document.createElement("div");
        div.id = trackCode;

        const trackCodeInput = document.createElement("input");
        trackCodeInput.value = trackCode;

        const dateInput = document.createElement("input");
        dateInput.value = date;

        const deliveryDateInput = document.createElement("input");
        deliveryDateInput.value = deliveryDate.toLocaleDateString();

        const statusInput = document.createElement("input");
        statusInput.value = status;

        div.appendChild(trackCodeInput);
        div.appendChild(dateInput);
        div.appendChild(deliveryDateInput);
        div.appendChild(statusInput);

        packageList.appendChild(div);
      });
    };

    reader.readAsBinaryString(file);
  }
});

async function saveDataToServer() {
  if (packageDataArray.length > 0) {
    const jsonData = JSON.stringify({ data: packageDataArray }); // Оберните данные в объект

    try {
      const response = await fetch("/package_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      });

      const data = await response.json();
      alert(data.message); // Полученный ответ от сервера
    } catch (error) {
      console.error("Ошибка:", error);
    }
  } else {
    alert("Нет данных для сохранения.");
  }
}

saveToJsonButton.addEventListener("click", saveDataToServer);

async function getData() {
  try {
    const response = await axios.get(`${url}/package_data`);

    if (response.status === 200) {
      const data = response.data;
      trackCodesContent.innerHTML = "";

      packageDataArray = data;

      // Вместо цикла for используем map для обработки данных
      data.map((package) => render(package));

      const selectCheckboxes = document.querySelectorAll(".select-checkbox");
      selectCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          addSelectClass(checkbox);
        });
      });

      // Добавим уведомление, что данные успешно загружены
      // alert('Все данные успешно загружены!');
    }
  } catch (error) {
    alert("Ошибка получения данных:", error);
  }
}
