import { db } from "./firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const animalList = document.getElementById("animalList");
const filtroEspecie = document.getElementById("filtroEspecie");

// Modal
const animalModal = document.getElementById('animalModal');
const closeModal = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalInfo = document.getElementById('modalInfo');
const modalDescription = document.getElementById('modalDescription');
const adoptBtn = document.getElementById('adoptBtn');

// Renderiza cada card de animal
function renderAnimalCard(animal, id) {
  // Remove espaços/quebras de linha do Base64
  const base64Clean = animal.imagemBase64.replace(/\s/g, "");

  return `
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
      <img src="${base64Clean}" alt="${animal.nome}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h2 class="text-xl font-semibold">${animal.nome}</h2>
        <p class="text-gray-600 text-sm mb-2">${animal.idade} anos • ${animal.sexo}</p>
        <p class="text-gray-500 text-sm mb-2 capitalize">${animal.especie}</p>
        <a href="#" class="block text-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
           onclick='openAnimalModal(${JSON.stringify({ ...animal, id })})'>
          Ver Detalhes
        </a>
      </div>
    </div>
  `;
}

// Carrega animais do Firebase
async function loadAnimals(especieFiltro = "todos") {
  animalList.innerHTML = `<p class="col-span-full text-center text-gray-500">Carregando...</p>`;

  try {
    const animaisRef = collection(db, "Animais");
    let q = animaisRef;

    if (especieFiltro !== "todos") {
      q = query(animaisRef, where("especie", "==", especieFiltro));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      animalList.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum animal encontrado.</p>`;
      return;
    }

    animalList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const animal = docSnap.data();
      animalList.innerHTML += renderAnimalCard(animal, docSnap.id);
    });
  } catch (err) {
    console.error("Erro ao carregar animais:", err);
    animalList.innerHTML = `<p class="col-span-full text-center text-red-500">Erro ao carregar animais.</p>`;
  }
}

// Carrega espécies únicas para o select
async function loadEspecies() {
  try {
    const animaisRef = collection(db, "Animais");
    const snapshot = await getDocs(animaisRef);
    const especiesSet = new Set();

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.especie) {
        especiesSet.add(data.especie.toLowerCase());
      }
    });

    const especiesArray = Array.from(especiesSet).sort();

    filtroEspecie.innerHTML = `<option value="todos">Todos</option>`;
    especiesArray.forEach(especie => {
      filtroEspecie.innerHTML += `<option value="${especie}">${especie.charAt(0).toUpperCase() + especie.slice(1)}</option>`;
    });
  } catch (err) {
    console.error("Erro ao carregar espécies:", err);
  }
}

// Abre o modal com detalhes do animal
window.openAnimalModal = (animal) => {
  modalImage.src = animal.imagemBase64.replace(/\s/g, "");
  modalName.textContent = animal.nome;
  modalInfo.textContent = `${animal.idade} anos • ${animal.sexo} • ${animal.especie}`;
  modalDescription.textContent = animal.descricao || "Sem descrição disponível.";
  adoptBtn.href = `formulario-adoção.html?animalId=${animal.id}`;
  animalModal.classList.remove('hidden');
};

// Fecha o modal
closeModal.addEventListener('click', () => {
  animalModal.classList.add('hidden');
});

// Listener do filtro
filtroEspecie.addEventListener("change", (e) => {
  loadAnimals(e.target.value);
});

// Inicialização
(async () => {
  await loadEspecies();
  await loadAnimals();
})();
