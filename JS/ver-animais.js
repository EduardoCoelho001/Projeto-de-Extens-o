import { db } from "./firebase-config.js";
import { collection, getDocs, query, where, addDoc, Timestamp } 
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
function renderAnimalCard(animal) {
  const base64Clean = animal.imagemBase64.replace(/\s/g, "");
  return `
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
      <img src="${base64Clean}" alt="${animal.nome}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h2 class="text-xl font-semibold">${animal.nome}</h2>
        <p class="text-gray-600 text-sm mb-2">${animal.idade} anos • ${animal.sexo}</p>
        <p class="text-gray-500 text-sm mb-2 capitalize">${animal.especie}</p>
        <a href="#" class="block text-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
           onclick='openAnimalModal(${JSON.stringify(animal)})'>
          Ver Detalhes
        </a>
      </div>
    </div>
  `;
}

// Carrega animais do Firebase (apenas disponíveis para adoção)
async function loadAnimals(especieFiltro = "todos") {
  animalList.innerHTML = `<p class="col-span-full text-center text-gray-500">Carregando...</p>`;

  try {
    const animaisRef = collection(db, "Animais");
    const snapshot = await getDocs(animaisRef);

    // Mapeia dados, forçando lowercase em espécie e status
    let animais = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        especie: (data.especie || '').toLowerCase(),
        status: (data.status || '').toLowerCase()
      };
    });

    // Filtro por status disponível
    animais = animais.filter(a => a.status === "disponível para adoção");

    // Filtro por espécie
    if (especieFiltro !== "todos") {
      animais = animais.filter(a => a.especie === especieFiltro.toLowerCase());
    }

    if (animais.length === 0) {
      animalList.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum animal disponível no momento.</p>`;
      return;
    }

    animalList.innerHTML = "";
    animais.forEach(animal => {
      animalList.innerHTML += renderAnimalCard(animal);
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
  adoptBtn.addEventListener('click', () => {
  openAdoptionFormModal(animal.id, animal.nome);
});
  animalModal.classList.remove('hidden');
};
function openAdoptionFormModal(petId, petName) {
  // Checa se já existe um modal aberto
  if(document.getElementById('adoptionFormModalContainer')) return;

  const modal = document.createElement('div');
  modal.id = 'adoptionFormModalContainer';
  modal.className = "fixed inset-0 bg-black/50 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-xl w-96 relative">
      <h3 class="text-xl font-bold mb-4">Adotar: ${petName}</h3>
      <form id="adoptionFormModal" class="space-y-4">
        <label for="adopterName" class="block text-gray-700">Nome Completo</label>
        <input type="text" id="adopterName" required class="w-full px-4 py-2 border rounded">

        <label for="adopterEmail" class="block text-gray-700">E-mail</label>
        <input type="email" id="adopterEmail" required class="w-full px-4 py-2 border rounded">

        <label for="adopterPhone" class="block text-gray-700">Telefone</label>
        <input type="tel" id="adopterPhone" required class="w-full px-4 py-2 border rounded">

        <label for="adopterMessage" class="block text-gray-700">Mensagem</label>
        <textarea id="adopterMessage" rows="3" class="w-full px-4 py-2 border rounded" placeholder="Conte-nos um pouco sobre você"></textarea>

        <div class="flex items-center">
          <input type="checkbox" id="agree" required class="w-4 h-4 text-red-600 border-gray-300 rounded">
          <label for="agree" class="ml-2 text-gray-700">Eu concordo com os <a href='#' class='text-red-600 hover:underline'>Termos de Adoção</a></label>
        </div>

        <p id="adoptionMessageModal" class="text-center mt-2"></p>

        <div class="flex justify-end gap-2 mt-2">
          <button type="button" id="cancelAdoption" class="bg-gray-300 py-1 px-3 rounded">Cancelar</button>
          <button type="submit" class="bg-red-500 text-white py-1 px-3 rounded">Enviar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Cancelar
  modal.querySelector('#cancelAdoption').addEventListener('click', () => modal.remove());

  // Submissão do formulário
  modal.querySelector('#adoptionFormModal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = modal.querySelector('#adoptionMessageModal');
    messageEl.textContent = "Enviando solicitação...";
    messageEl.style.color = "Shades of Purple";

    try {
      const name = modal.querySelector('#adopterName').value;
      const email = modal.querySelector('#adopterEmail').value;
      const phone = modal.querySelector('#adopterPhone').value;
      const message = modal.querySelector('#adopterMessage').value;

      if (!name || !email || !phone) {
        messageEl.textContent = "⚠️ Preencha todos os campos obrigatórios.";
        messageEl.style.color = "Shades of Purple";
        return;
      }

      // Salvar no Firestore
      await addDoc(collection(db, "Formularios"), {
        petId,
        adopterName: name,
        adopterEmail: email,
        adopterPhone: phone,
        adopterMessage: message,
        status: "Pendente",
        createdAt: Timestamp.now()
      });

      messageEl.textContent = "✅ Solicitação enviada com sucesso!";
      messageEl.style.color = "green";
      modal.querySelector('#adoptionFormModal').reset();

    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      messageEl.textContent = `❌ Erro: ${err.message}`;
      messageEl.style.color = "Shades of Purple";
    }
  });
}

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
