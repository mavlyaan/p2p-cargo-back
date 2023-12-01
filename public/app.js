const excelFileInput = document.getElementById('excelFileInput');
const packageList = document.getElementById('packageList');
const saveToJsonButton = document.getElementById('saveToJsonButton');
const addListBtn = document.querySelector('#addList')
const showContent = document.querySelector('#show-content');
const addTrackCodesButton = document.querySelector('#add-track-codes')
const showTrackCodesButton = document.querySelector('#show-track-codes')
const addContent = document.querySelector('#add-content')
const trackCodesContent = document.querySelector('#track-codes')
const searchButton = document.querySelector('#searchButton')
const selectAll = document.querySelector('#selectAll')
const changeStatusButton = document.querySelector('#changeStatusButton');
const deleteBtn = document.querySelector('#deleteSelectedButton')

changeStatusButton.addEventListener('click', changeStatusForSelectedTrackCodes);

async function changeStatusForSelectedTrackCodes() {
    const selectedTrackCodeDivs = document.querySelectorAll('.track-code.selected');

    if (selectedTrackCodeDivs.length === 0) {
        console.log('Пожалуйста, выберите хотя бы один элемент для изменения статуса.');
        return;
    }

    const newStatus = document.getElementById('newStatusInput').value;
    const updatedData = [];

    selectedTrackCodeDivs.forEach((div) => {
        const trackCode = String(div.querySelector('input[value]').value); // Преобразуйте в строку
        const statusInput = div.querySelector('input[name="status"]');
        statusInput.value = newStatus; // Обновите значение статуса на клиентской стороне
        updatedData.push({ trackCode, status: newStatus });
    });

    try {
        const response = await fetch('/package_data', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
        } else {
            console.error('Произошла ошибка при отправке данных на сервер');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }

    // Опционально: Снимите выделение с выбранных трек-кодов
    selectedTrackCodeDivs.forEach((div) => {
        div.classList.remove('selected');
        const selectCheckbox = div.querySelector('.select-checkbox');
        selectCheckbox.checked = false;
    });

    setTimeout(() => {
        location.reload();
    }, 500);
}
async function deleteSelectedTrackCodes() {
    const selectedTrackCodeDivs = document.querySelectorAll('.track-code.selected');

    if (selectedTrackCodeDivs.length === 0) {
        console.log('Пожалуйста, выберите хотя бы один элемент для удаления.');
        return;
    }

    const trackCodesToDelete = Array.from(selectedTrackCodeDivs).map((div) => {
        return div.id;
    });

    try {
        const response = await fetch('/delete_package_data', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trackCodesToDelete),
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
        } else {
            console.error('Произошла ошибка при отправке данных на сервер');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }

    // Удалите трек-коды из packageDataArray (данных, хранящихся на клиентской стороне)
    packageDataArray = packageDataArray.filter((package) => !trackCodesToDelete.includes(package.trackCode));

    // Удалите соответствующие DOM-элементы
    trackCodesToDelete.forEach((trackCode) => {
        const elementToRemove = document.getElementById(trackCode);
        elementToRemove.remove();
    });

    // Снимите выделение с выбранных трек-кодов
    selectedTrackCodeDivs.forEach((div) => {
        div.classList.remove('selected');
        const selectCheckbox = div.querySelector('.select-checkbox');
        selectCheckbox.checked = false;
    });
}

deleteBtn.addEventListener('click', deleteSelectedTrackCodes)
searchButton.addEventListener('click', filterTrackCodesByDate)
selectAll.addEventListener('click', selectAllTrackCodes);

function selectAllTrackCodes() {
    const trackCodeCheckboxes = document.querySelectorAll('input[type="checkbox"][name="trackCode"]');
    trackCodeCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        addSelectClass(checkbox)
    });
    
}

function addSelectClass(checkbox){
    const trackCodeDiv = checkbox.closest('.track-code');
            console.log(trackCodeDiv);
    
            if (checkbox.checked) {
                // Если чекбокс отмечен, добавьте класс "selected" для родительского div
                trackCodeDiv.classList.add('selected');
            } else {
                // Если чекбокс не отмечен, удалите класс "selected" для родительского div
                trackCodeDiv.classList.remove('selected');
            }
}


function convertDateFormat(inputDate) {
    if (!inputDate) return '';
    const parts = inputDate.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}.${month}.${year}`;
    }
    return inputDate; // Вернуть исходную дату, если она не может быть преобразована
}

function filterTrackCodesByDate() {
    const searchDate = document.querySelector('#searchDate').value;
    const errorMessage = document.querySelector('#date-error');
    errorMessage.innerHTML = '';

    // Преобразуйте формат даты из "yyyy-mm-dd" в "dd.mm.yyyy"
    const formattedSearchDate = convertDateFormat(searchDate);

    // Очистите <div id="track-codes"> перед отображением отфильтрованных трек-кодов
    try {
        if (formattedSearchDate === '') throw 'Введите корректную дату';
        const trackCodesDiv = document.querySelector('#track-codes');
        trackCodesDiv.innerHTML = '';

        // Фильтруйте трек-коды по введенной дате и отображайте их
        packageDataArray.forEach((package) => {
            if (package.date === formattedSearchDate) {
                render(package, true); // Передайте true, чтобы отметить элементы для выбора
            }
        });
    } catch (error) {
        errorMessage.innerHTML = error;
    }
    const selectCheckboxes = document.querySelectorAll('.select-checkbox')
    selectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            addSelectClass(checkbox)
        });
    });

}


function render(trackCodes){
    trackCodesContent.innerHTML += `
        <div class="track-code" id="${trackCodes.trackCode}">
        <input value="${trackCodes.trackCode}" readonly>
        <input value="${trackCodes.date}" readonly>
        <input value="${trackCodes.deliveryDate}" readonly>
        <input value="${trackCodes.status}" name="status" class="status-input">
        <input type="checkbox" name="trackCode" class="select-checkbox">
        </div>
    `
}

addTrackCodesButton.addEventListener('click', () => {
    addTrackCodesButton.classList.add('active')
    showTrackCodesButton.classList.remove('active')
    addContent.classList.add('show')
    addContent.classList.remove('hide')
    showContent.classList.remove('show')
    showContent.classList.add('hide')
    
})

showTrackCodesButton.addEventListener('click', () => {
    showTrackCodesButton.classList.add('active')
    showContent.classList.remove('hide')
    showContent.classList.add('show')
    addTrackCodesButton.classList.remove('active')
    addContent.classList.add('hide')
    addContent.classList.remove('show')  
    packageDataArray = [];
    getData()
    
})

let packageDataArray = [];

function convertExcelDateToCorrectFormat(excelDate) {
    const excelDateNumber = parseInt(excelDate);
    const date = new Date((excelDateNumber - 25569) * 86400 * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

excelFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            packageList.innerHTML = ''; // Очистим packageList перед добавлением новых данных

            // Выбираем первые два столбца (индексы 0 и 1)
            const columnsToRead = [0, 1];

            // Получаем массив значений из выбранных столбцов
            const columnData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) // Параметр header: 1 указывает, что первая строка содержит заголовки
                .map(row => columnsToRead.map(colIndex => row[colIndex]));

            // Проходим по каждой строке
            columnData.forEach(row => {
                const status = 'Отправлен';
                const trackCode = row[1];
                let id = 0
                const date = convertExcelDateToCorrectFormat(row[0]);

                const parts = date.split('.');
                const year = parseInt(parts[2]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[0]);
                const newDate = new Date(year, month, day);
                const deliveryDate = new Date(newDate);
                deliveryDate.setDate(newDate.getDate() + 8);

                const packageObject = {
                    'id': id++,
                    'trackCode': trackCode.toString(),
                    'date': date,
                    'deliveryDate': deliveryDate.toLocaleDateString(),
                    'status': status,
                };

                packageDataArray.push(packageObject);

                // Создаем элементы DOM и устанавливаем значения
                const div = document.createElement('div');
                div.id = trackCode;

                const trackCodeInput = document.createElement('input');
                trackCodeInput.value = trackCode;

                const dateInput = document.createElement('input');
                dateInput.value = date;

                const deliveryDateInput = document.createElement('input');
                deliveryDateInput.value = deliveryDate.toLocaleDateString();

                const statusInput = document.createElement('input');
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
        // console.log('Button clicked!');
        const jsonData = JSON.stringify({ data: packageDataArray }); // Оберните данные в объект

        try {
            const response = await fetch('/package_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonData
            });

            const data = await response.json();
            console.log(data.message); // Полученный ответ от сервера
        } catch (error) {
            console.error('Ошибка:', error);
        }
    } else {
        console.log('Нет данных для сохранения.');
    }
}


saveToJsonButton.addEventListener('click', saveDataToServer);


async function getData() {
    try {
        const response = await axios.get('https://p2p-back-4e8a787f8863.herokuapp.com/package_data');

        if (response.status === 200) {
            const data = response.data;
            trackCodesContent.innerHTML = '';

            packageDataArray = data;

            // Вместо цикла for используем map для обработки данных
            data.map((package) => render(package));

            const selectCheckboxes = document.querySelectorAll('.select-checkbox')
            selectCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    addSelectClass(checkbox)
                });
            });
        }
    } catch (error) {
        console.error('Ошибка получения данных:', error);
    }
}