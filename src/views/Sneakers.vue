<template>
  <div class="p-grid">
    <div class="p-col-12 p-md-3">
      <div class="auth-buttons">
        <Button v-if="isAdmin" label="+" class="p-button-outlined common-button" @click="addSneakerDialogVisible = true" />
        <Button v-if="!isLoggedIn" label="Sign In" @click="goToSignIn" class="p-button-outlined common-button" />
        <template v-else>
          <Button :label="totalSelectedPrice + ' $'" @click="openCartDialog" class="p-button-outlined common-button" />
          <Button label="Logout" @click="handleLogout" class="p-button-danger common-button" />
        </template>
      </div>
    </div>

    <div class="p-col-12 p-md-9 centered-container">
      <div class="loader-container" v-if="loading">
        <Loader style="width: 200px; height: 200px" />
      </div>
      <p v-else-if="error" class="p-error">{{ error }}</p>

      <div v-else class="card-background">
        <div class="sort-search-container flex justify-end items-center mb-10">
          <h1 style="margin-right: auto;">Sneakers</h1>
          <select v-model="sortKey" @change="sortSneakers" class="py-2 px-3 border border-gray-200 rounded-md sort-select ml-2">
            <option value="name">By name</option>
            <option value="priceAsc">By price (cheap)</option>
            <option value="priceDesc">By price (expensive)</option>
          </select>
          <input v-model="searchQuery" type="text" class="border border-gray-200 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-gray-400 search-input" placeholder="Search..." />
        </div>
        <div class="sneaker-container">
          <div class="sneaker-card" v-for="(item) in filteredSneakers" :key="item.id" @click="openSneakerDetails(item)">
            <img :src="item.imageUrl" alt="Sneaker Image" class="sneaker-image" />
            <div class="sneaker-info">
              <h4 class="sneaker-name">{{ item.name }}</h4>
              <p class="sneaker-type">Type: {{ item.type }}</p>
              <p class="sneaker-price">Price: {{ item.price }} $</p>
              <div class="checkbox-container">
                <input type="checkbox" :id="'checkbox-' + item.id" :checked="selectedItems.some(selectedItem => selectedItem.id === item.id)" @change="updateSelection(item, $event.target.checked)" @click.stop class="custom-checkbox" />
              </div>
              <div class="button-container">
                <Button v-if="isAdmin" label="Edit" class="p-button-warning button-spacing" @click.stop="editSneaker(item)" />
                <Button v-if="isAdmin" label="Delete" class="p-button-danger" @click.stop="deleteSneaker(item.id)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно для корзины -->
      <Dialog class="fixed-dialog" :header="headerContent" v-model:visible="cartDialogVisible" @hide="cartDialogVisible = false">
        <div class="basket-content">
          <!-- Проверка на авторизацию -->
          <div v-if="!isLoggedIn">
            <p class="login-prompt">Please log in to access the shopping cart.</p>
          </div>


          <div v-else>
            <div class="basket-items">
              <div class="basket-item" v-for="(item) in selectedItems" :key="item.id" @click="openSneakerDetails(item)" ъ>
                <div class="basket-item-details">
                  <img :src="item.imageUrl" alt="Sneaker Image" class="sneaker-image" />
                  <h4 class="basket-item-name">{{ item.name }}</h4>
                  <p class="basket-item-type">Type: {{ item.type }}</p>
                  <div class="basket-checkbox-wrapper">
                    <p class="basket-item-price">Price: {{ item.price }} $</p>
                     <input
                       type="checkbox"
                       :id="'basket-checkbox-' + item.id"
                       v-model="item.selected"
                       @change="updateSelection(item, item.selected)"
                       @click.stop
                       class="basket-item-checkbox"
                     />
                   </div>
                </div>
              </div>
            </div>
            <div class="basket-button-container">
              <Button label="Place an order" @click="placeOrder" class="basket-button-confirm" :disabled="!isLoggedIn" />
              <Button label="To close" @click="cartDialogVisible = false" class="basket-button-cancel" />
            </div>
          </div>
        </div>
      </Dialog>
      <!-- Остальные диалоги остаются прежними -->
      <Dialog class="card" header="Add New Sneaker" v-model:visible="addSneakerDialogVisible" @hide="addSneakerDialogVisible = false">
        <div class="sneaker-card">
          <InputText v-model="newSneaker.name" placeholder="Sneaker Name" />
          <InputText v-model="newSneaker.type" placeholder="Sneaker Type" />
          <InputNumber v-model="newSneaker.price" placeholder="Sneaker Price" min="0" />
          <InputText v-model="newSneaker.country" placeholder="Country" />
          <InputText v-model="newSneaker.description" placeholder="Description" />
          <InputText v-model="newSneaker.materials" placeholder="Materials" />
          <InputText v-model="newSneaker.imageUrl" placeholder="Image URL" />
          <Button label="Add" @click="addSneaker(newSneaker)" class="p-button-success" />
        </div>
      </Dialog>

      <Dialog class="card" header="Edit Sneaker" v-model:visible="editSneakerDialogVisible" @hide="editSneakerDialogVisible = false">
        <div class="sneaker-card">
          <InputText v-model="editingSneaker.name" placeholder="Sneaker Name" />
          <InputText v-model="editingSneaker.type" placeholder="Sneaker Type" />
          <InputNumber v-model="editingSneaker.price" placeholder="Sneaker Price" min="0" />
          <InputText v-model="editingSneaker.country" placeholder="Country" />
          <InputText v-model="editingSneaker.description" placeholder="Description" />
          <InputText v-model="editingSneaker.materials" placeholder="Materials" />
          <InputText v-model="editingSneaker.imageUrl" placeholder="Image URL" />
          <Button label="Save" @click="updateSneaker" class="p-button-success" />
        </div>
      </Dialog>

      <Dialog class="fixed-dialog" :header="selectedSneaker.name" v-model:visible="sneakerDetailsDialogVisible" @hide="sneakerDetailsDialogVisible = false">
        <img :src="selectedSneaker.imageUrl" alt="Sneaker Image" class="sneaker-detail-image" />
        <p>Price: {{ selectedSneaker.price }} $</p>
        <p>Type: {{ selectedSneaker.type }}</p>
        <p>Country: {{ selectedSneaker.country }}</p>
        <p>Description: {{ selectedSneaker.description }}</p>
        <p>Materials: {{ selectedSneaker.materials }}</p>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
  import {
    ref,
    onMounted,
    computed
  }
  from 'vue';
  import {
    useRouter
  }
  from 'vue-router';
  import axios from 'axios';
  import {
    useAuthStore
  }
  from '../stores/auth';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Dialog from 'primevue/dialog';
  import Loader from '../components/Loader.vue';
  const router = useRouter();
  const authStore = useAuthStore();
  const isAdmin = computed(() => authStore.isAdmin);
  const isLoggedIn = computed(() => !!authStore.userInfo.token);
  const API_URL = import.meta.env.VITE_APIURL;
  const data = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const addSneakerDialogVisible = ref(false);
  const editSneakerDialogVisible = ref(false);
  const sneakerDetailsDialogVisible = ref(false);
  const cartDialogVisible = ref(false);
  const selectedSneaker = ref({});
  const newSneaker = ref({
    name: '',
    type: '',
    price: 0,
    country: '',
    description: '',
    materials: '',
    imageUrl: ''
  });
  const editingSneaker = ref({
    id: null,
    name: '',
    type: '',
    price: 0,
    country: '',
    description: '',
    materials: '',
    imageUrl: ''
  });
  const sortKey = ref('name');
  const searchQuery = ref('');
  const selectedItems = ref([]);
  
  // Функция для обновления выбора
const updateSelection = (item, isChecked) => {
    if (isChecked) {
        if (!selectedItems.value.some(selectedItem => selectedItem.id === item.id)) {
            selectedItems.value.push({...item, selected: true});
        }
    } else {
        selectedItems.value = selectedItems.value.filter(selectedItem => selectedItem.id !== item.id);
    }
    saveSelectedItems(); // Сохранение в localStorage
};
  // Функция для сохранения выбранных товаров в localStorage
 const saveSelectedItems = () => {
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems.value));
};
  const headerContent = computed(() => {
    return `Total: ${totalSelectedPrice.value} $`;
  });
  // Функция для загрузки выбранных товаров из localStorage
const loadSelectedItems = () => {
    const savedItems = localStorage.getItem('selectedItems');
    selectedItems.value = savedItems ? JSON.parse(savedItems) : [];
};
  // Общее количество выбранных товаров
  const totalSelectedPrice = computed(() => {
    return selectedItems.value.reduce((total, item) => {
      return total + (item.selected ? item.price : 0);
    }, 0);
  });
  // Открытие диалога корзины
  const openCartDialog = () => {
    cartDialogVisible.value = true;
  };
  // Загрузка данных при монтировании
  onMounted(() => {
    fetchData();
    loadSelectedItems(); // Загружаем выбранные товары при монтировании
  });
  async function fetchData() {
    try {
      loading.value = true;
      const response = await axios.get(API_URL);
      data.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'An unknown error occurred.';
    } finally {
      loading.value = false;
    }
  }
  const addSneaker = async(sneaker) => {
    try {
      await axios.post(API_URL, sneaker);
      await fetchData();
      resetNewSneaker();
      addSneakerDialogVisible.value = false;
    } catch (err) {
      alert('Failed to add the sneaker. Error: ' + (err.response ?.data ?.message || err.message));
    }
  };
  const resetNewSneaker = () => {
    newSneaker.value = {
      name: '',
      type: '',
      price: '',
      country: '',
      description: '',
      materials: '',
      imageUrl: ''
    };
  };
  
  const editSneaker = (sneaker) => {
    editingSneaker.value = {...sneaker
    };
    editSneakerDialogVisible.value = true;
  };
  const updateSneaker = async() => {
    try {
      await axios.delete(`${API_URL}/${editingSneaker.value.id}`);
      const newSneakerData = {...editingSneaker.value
      };
      delete newSneakerData.id;
      await axios.post(API_URL, newSneakerData);
      await fetchData();
      editSneakerDialogVisible.value = false;
    } catch (err) {
      alert('Failed to update the sneaker. Error: ' + (err.response ?.data ?.message || err.message));
    }
  };
  const deleteSneaker = async(id) => {
    if (!confirm('Are you sure you want to delete this sneaker?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchData();
    } catch (err) {
      alert('Failed to delete the sneaker. Error: ' + (err.response ?.data ?.message || err.message));
    }
  };
  const openSneakerDetails = (sneaker) => {
    selectedSneaker.value = sneaker;
    sneakerDetailsDialogVisible.value = true;
  };
  const goToSignIn = () => router.push('/signin');
  const handleLogout = () => {
    authStore.logout();
    router.push('/');
  };
  // Сортировка
  const sortedData = computed(() => {
    let sortedArray = [...data.value];
    if (sortKey.value === 'name') {
      sortedArray.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey.value === 'priceAsc') {
      sortedArray.sort((a, b) => a.price - b.price);
    } else if (sortKey.value === 'priceDesc') {
      sortedArray.sort((a, b) => b.price - a.price);
    }
    return sortedArray;
  });
  // Фильтрация по запросу поиска
  const filteredSneakers = computed(() => {
    return sortedData.value.filter(sneaker =>
      sneaker.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
  // Загрузка данных при монтировании
  onMounted(() => {
    fetchData();
    loadSelectedItems();
  });
</script>

<style>
  .basket-dialog {
    width: 60%;
    background-color: #2c2c2c;
    /* Темный фон для диалога */
    border-radius: 10px;
    /* Закругленные углы */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    /* Тень для диалога */
    transition: transform 0.3s;
    /* Плавный переход при открытии */
  }
  
  .basket-content {
    padding: 20px;
    /* Отступы внутри диалога */
    color: #fff;
    /* Цвет текста */
    font-family: 'Arial', sans-serif;
    /* Шрифт для текста */
  }
  
  .basket-items {
    margin-top: 10px;
    /* Отступ сверху для списка товаров */
  }
  centered-container
  .basket-item {
    background-color: #333;
    /* Темный фон для элемента корзины */
    border-radius: 8px;
    /* Закругленные углы */
    padding: 15px;
    /* Внутренние отступы */
    margin-bottom: 15px;
    /* Отступ между элементами */
    display: flex;
    /* Используем Flexbox для выравнивания */
    justify-content: space-between;
    /* Размещаем элементы по краям */
    align-items: center;
    /* Центрирование по вертикали */
    transition: background-color 0.3s;
    /* Плавный переход для фона */
  }
  
  .basket-item:hover {
    background-color: #444;
    /* Цвет фона при наведении */
  }
  
  .basket-item-details {
    flex-grow: 1;
    /* Позволяет элементам занимать доступное пространство */
  }
  
  .basket-item-name {
    font-weight: bold;
    /* Жирный шрифт для названия */
    font-size: 18px;
    /* Размер шрифта */
    color: #e0e0e0;
    /* Цвет текста для названия */
  }
  
  .basket-item-type,
  .basket-item-price {
    margin: 5px 0;
    /* Отступы для текстов */
    font-size: 14px;
    /* Размер шрифта для типа и цены */
    color: #b0b0b0;
    /* Цвет текста для типа и цены */
  }
  
  .basket-checkbox-wrapper {
    display: flex;
    /* Используем flexbox для выравнивания чекбокса */
    align-items: center;
    /* Центрирование чекбокса по вертикали */
    justify-content: space-between;
  }
  
  .basket-item-checkbox {
    /* Отступ справа от чекбокса */
    width: 20px;
    height: 20px;
  }
  
  .basket-checkbox-label {
    cursor: pointer;
    /* Указатель при наведении на метку */
    color: #e0e0e0;
    /* Цвет текста для метки */
  }
  
  .basket-button-container {
    margin-top: 20px;
    /* Отступ сверху для кнопок */
    display: flex;
    /* Используем flexbox для выравнивания кнопок */
    justify-content: space-around;
    /* Размещаем кнопки по краям */
  }
  
  .basket-button-confirm,
  .basket-button-cancel {
    padding: 10px 15px;
    /* Отступы внутри кнопок */
    border: none;
    /* Убираем стандартные границы */
    border-radius: 5px;
    /* Закругленные углы для кнопок */
    color: #fff;
    /* Цвет текста кнопок */
    font-weight: bold;
    /* Жирный шрифт для текста кнопок */
    cursor: pointer;
    /* Указатель при наведении на кнопки */
    transition: background-color 0.3s;
    /* Плавный переход для фона кнопок */
  }
  
  .basket-button-confirm {
    background-color: #28a745;
    /* Зеленый цвет для кнопки подтверждения */
  }
  
  .basket-button-confirm:hover {
    background-color: #218838;
    /* Темнее при наведении */
  }
  
  .basket-button-cancel {
    background-color: #dc3545;
    /* Красный цвет для кнопки отмены */
  }
  
  .basket-button-cancel:hover {
    background-color: #c82333;
    /* Темнее при наведении */
  }
  
  .cart-items {
    display: flex;
    flex-direction: column;
  }
  
  .cart-item-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* Пробел между карточками */
  }
  
  .cart-item {
    display: flex;
    align-items: center;
    background: #333;
    /* Более темный фон для карточек */
    border-radius: 8px;
    padding: 10px;
    transition: background 0.3s;
    /* Плавный переход при наведении */
  }
  
  .cart-item:hover {
    background: #444;
    /* Цвет фона при наведении */
  }
  
  .cart-item-image {
    width: 50px;
    /* Размер изображения */
    height: 50px;
    /* Размер изображения */
    object-fit: cover;
    border-radius: 5px;
    margin-right: 10px;
  }
  
  .cart-item-details {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    /* Занять доступное пространство */
  }
  
  .cart-item-details p {
    margin: 0;
    /* Убрать отступы */
  }
  
  .p-button-success {
    background-color: #4CAF50;
    /* Зеленый цвет для кнопки "Оформить заказ" */
    color: white;
    margin-top: 10px;
    /* Отступ сверху для кнопки */
  }
  
  .p-button-secondary {
    margin-top: 5px;
    /* Отступ сверху для кнопки "Закрыть" */
  }
  
  .total-price {
    height: 20px;
  }
  
  .sneaker-card {
    position: relative;
    /* Позволяет позиционировать дочерние элементы относительно карточки */
  }
  
  .custom-checkbox {
    width: 30px;
    height: 30px;
    margin-top: 580px;
  }
  
  .checkbox-container {
    margin-top: 569px;
    width: 30px;
    height: 30px;
    position: absolute;
    /* Позволяет разместить чекбокс независимо от других элементов */
    top: 10px;
    /* Установите нужное положение сверху */
    right: 10px;
    /* Установите нужное положение справа */
    display: flex;
    align-items: center;
  }
  
  .sneaker-container {
    display: flex;
    /* Используем flexbox для выравнивания карточек */
    flex-wrap: wrap;
    /* Позволяет карточкам переноситься на новую строку */
    gap: 20px;
    /* Пробел между карточками */
  }
  
  .sneaker-card {
    display: flex;
    flex-direction: column;
    /* Вертикальное направление */
    gap: 10px;
    /* Отступы между элементами */
    background: #222;
    /* Фон карточки */
    border-radius: 8px;
    /* Закругленные углы */
    padding: 10px;
    /* Отступ внутри карточки */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    /* Тень */
    transition: transform 0.2s;
    /* Плавный переход при наведении */
  }
  
  .sneaker-card:hover {
    transform: scale(1.02);
    /* Увеличение карточки при наведении */
  }
  
  .checkbox-container {
    margin-top: 10px;
    /* Отступ сверху для отделения от текста */
    display: flex;
    /* Выравнивание элементов */
    align-items: center;
    /* Вертикальное выравнивание */
  }
  
  .button-spacing {
    margin-right: 10px;
  }
  
  .basket-card {
    width: 500px;
  }
  
  .card {
    display: flex;
    width: min-content;
    height: max-content;
  }
  
  .fixed-dialog {
    width: 450px;
    height: 90%;
  }
  
  @media (max-width: 550px) {
    .fixed-dialog,
    .card {
      width: 90%;
      height: 600px;
    }
  }
  
  .common-button {
    margin-left: 10px;
    transition: transform 0.2s;
  }
  
  .common-button:hover {
    transform: scale(1.1);
  }
  
  .auth-buttons {
    background-color: #1a1a1a;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    color: white;
    max-width: 1020px;
    margin: auto;
    display: flex;
    justify-content: flex-end;
  }
  
  .sort-search-container {
    margin: 10px 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  
  .search-input {
    width: 25%;
    background-color: #222;
    color: white;
    border: 1px solid #444;
    padding: 10px;
    border-radius: 5px;
  }
  
  .sort-select {
    width: 25%;
    margin-right: 10px;
    background-color: #222;
    color: white;
    border: 1px solid #444;
    padding: 10px;
    border-radius: 5px;
  }
  
  .centered-container {
    margin-top: 1px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .card-background {
    background-color: #1a1a1a;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    color: white;
    max-width: 1020px;
    margin: auto;
  }
  
  .sneaker-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .sneaker-card {
    width: calc(34.5% - 20px);
    min-width: 250px;
    text-align: left;
    /* Выровнять текст влево */
    padding: 10px;
    background: #222;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
    margin-bottom: 20px;
  }
  
  .sneaker-card:hover {
    transform: scale(1.02);
  }
  
  .sneaker-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  .sneaker-detail-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  @media (max-width: 550px) {
    .sneaker-detail-image {
      height: 250px;
    }
  }
  
  @media (max-width: 768px) {
    .sneaker-card {
      width: calc(50% - 10px);
    }
  }
  
  @media (max-width: 480px) {
    .sneaker-card {
      width: 100%;
    }
  }
  
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  /* Стили для полосы прокрутки с отступом */
  
  ::-webkit-scrollbar {
    width: 12px;
  }
  
  ::-webkit-scrollbar-track {
    background: #444;
    border-radius: 10px;
    margin: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
