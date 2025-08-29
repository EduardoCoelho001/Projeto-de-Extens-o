// ==============================
// admin-script.js
// ==============================
import { db, auth } from './firebase-config.js';
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, Timestamp } 
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==============================
// REFERÊNCIAS AOS ELEMENTOS
// ==============================
const sections = document.querySelectorAll('.admin-section');
const menuButtons = document.querySelectorAll('.menu-btn');

const addAnimalContainer = document.getElementById('addAnimalContainer');
const removeAnimalContainer = document.getElementById('removeAnimalContainer');
const editAnimalContainer = document.getElementById('editAnimalContainer');
const adoptionFormsContainer = document.getElementById('adoptionFormsContainer');
const statusFilter = document.getElementById('statusFilter');

// ==============================
// MENU LATERAL
// ==============================
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(btn.dataset.target);
    target.classList.remove('hidden');
  });
});

// ==============================
// FUNÇÃO AUXILIAR: CONVERTE ARQUIVO EM BASE64
// ==============================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// ==============================
// CADASTRAR ANIMAL
// ==============================
function renderAddAnimalForm() {
  addAnimalContainer.innerHTML = `
    <form id="addAnimalForm" class="space-y-4 bg-white p-6 rounded-xl shadow">
      <input type="text" id="animalName" placeholder="Nome do Animal" class="w-full border p-2 rounded" required>
      <input type="text" id="animalSpecies" placeholder="Espécie" class="w-full border p-2 rounded" required>
      <input type="text" id="animalBreed" placeholder="Raça" class="w-full border p-2 rounded">
      <input type="number" id="animalAge" placeholder="Idade (anos)" class="w-full border p-2 rounded" min="0" required>
      <input type="number" id="animalWeight" placeholder="Peso (kg)" class="w-full border p-2 rounded" min="0" step="0.1">
      <select id="animalGender" class="w-full border p-2 rounded" required>
        <option value="">Selecione o Sexo</option>
        <option value="Macho">Macho</option>
        <option value="Fêmea">Fêmea</option>
        <option value="Não Informado">Não Informado</option>
      </select>
      <input type="date" id="rescueDate" class="w-full border p-2 rounded" required>
      <textarea id="animalDescription" placeholder="Descrição do animal" class="w-full border p-2 rounded h-24"></textarea>
      <input type="file" id="animalImage" accept="image/*" class="w-full border p-2 rounded" required>
      <select id="animalStatus" class="w-full border p-2 rounded" required>
        <option value="">Selecione o Status</option>
        <option value="Disponível para Adoção">Disponível para Adoção</option>
        <option value="Adotado">Adotado</option>
        <option value="Em Tratamento">Em Tratamento</option>
        <option value="Reservado">Reservado</option>
      </select>
      <button type="submit" class="bg-red-500 text-white w-full py-2 rounded-lg">Cadastrar Animal</button>
      <p id="addAnimalMessage" class="text-center text-sm mt-2"></p>
    </form>
  `;

  const addAnimalForm = document.getElementById('addAnimalForm');
  const addAnimalMessage = document.getElementById('addAnimalMessage');

  addAnimalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    addAnimalMessage.textContent = "Processando cadastro...";
    addAnimalMessage.style.color = "gray";

    try {
      const nome = document.getElementById("animalName").value;
      const especie = document.getElementById("animalSpecies").value.toLowerCase();
      const raca = document.getElementById("animalBreed").value;
      const idade = parseInt(document.getElementById("animalAge").value);
      const peso = parseFloat(document.getElementById("animalWeight").value);
      const sexo = document.getElementById("animalGender").value;
      const dataResgate = document.getElementById("rescueDate").value;
      const descricao = document.getElementById("animalDescription").value;
      const status = document.getElementById("animalStatus").value;
      const imagemFile = document.getElementById("animalImage").files[0];

      if (!nome || !especie || !idade || !sexo || !dataResgate || !imagemFile || !status) {
        addAnimalMessage.textContent = "⚠️ Preencha todos os campos obrigatórios.";
        addAnimalMessage.style.color = "red";
        return;
      }

      const base64Image = await toBase64(imagemFile);
      const animalData = {
        nome, especie, raca, idade, peso: peso || null, sexo,
        dataResgate: Timestamp.fromDate(new Date(dataResgate)),
        descricao, status, imagemBase64: base64Image,
        cadastradoPor: auth.currentUser ? auth.currentUser.uid : "Anonimo",
        dataCadastro: Timestamp.now()
      };

      await addDoc(collection(db, "Animais"), animalData);

      addAnimalMessage.textContent = "✅ Animal cadastrado com sucesso!";
      addAnimalMessage.style.color = "green";
      addAnimalForm.reset();

      loadRemoveAnimals();
      loadEditAnimals();

    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      addAnimalMessage.textContent = `❌ Erro: ${err.message}`;
      addAnimalMessage.style.color = "red";
    }
  });
}
renderAddAnimalForm();

// ==============================
// REMOVER ANIMAIS (CARDS)
// ==============================
async function loadRemoveAnimals() {
  removeAnimalContainer.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(db, "Animais"));
    snapshot.forEach(docSnap => {
      const a = docSnap.data();
      const card = document.createElement('div');
      card.className = "bg-white p-4 rounded-xl shadow flex justify-between items-center";
      card.innerHTML = `
        <div>
          <h3 class="font-bold">${a.nome}</h3>
          <p>${a.especie} • ${a.status}</p>
        </div>
        <button class="bg-red-500 text-white py-1 px-2 rounded" id="remove-${docSnap.id}">Remover</button>
      `;
      removeAnimalContainer.appendChild(card);

      document.getElementById(`remove-${docSnap.id}`).addEventListener('click', async () => {
        if (confirm("Tem certeza que deseja remover este animal?")) {
          await deleteDoc(doc(db, "Animais", docSnap.id));
          loadRemoveAnimals();
          loadEditAnimals();
        }
      });
    });
  } catch (err) {
    console.error(err);
  }
}
loadRemoveAnimals();

// ==============================
// EDITAR STATUS / DADOS COMPLETOS
// ==============================
async function loadEditAnimals() {
  editAnimalContainer.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(db, "Animais"));
    snapshot.forEach(docSnap => {
      const a = docSnap.data();
      const card = document.createElement('div');
      card.className = "bg-white p-4 rounded-xl shadow flex flex-col gap-2 relative";
      card.innerHTML = `
        <h3 class="font-bold">${a.nome}</h3>
        <p>${a.especie} • <span id="status-${docSnap.id}">${a.status}</span></p>
        <button class="bg-blue-500 text-white py-1 px-2 rounded mt-2" id="edit-${docSnap.id}">Editar</button>
      `;
      editAnimalContainer.appendChild(card);

      // Abrir modal de edição
      document.getElementById(`edit-${docSnap.id}`).addEventListener('click', () => {
        openEditModal(docSnap.id, a);
      });
    });
  } catch (err) {
    console.error(err);
  }
}
loadEditAnimals();

function openEditModal(id, animal) {
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black/50 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-xl w-96">
      <h3 class="text-xl font-bold mb-4">Editar ${animal.nome}</h3>
      <form id="editForm" class="space-y-2">
        <label for="editName" class="font-medium">Nome</label>
        <input type="text" id="editName" class="w-full border p-2 rounded" value="${animal.nome}" required>

        <label for="editSpecies" class="font-medium">Espécie</label>
        <input type="text" id="editSpecies" class="w-full border p-2 rounded" value="${animal.especie}" required>

        <label for="editBreed" class="font-medium">Raça</label>
        <input type="text" id="editBreed" class="w-full border p-2 rounded" value="${animal.raca || ''}">

        <label for="editAge" class="font-medium">Idade (anos)</label>
        <input type="number" id="editAge" class="w-full border p-2 rounded" value="${animal.idade}" required>

        <label for="editWeight" class="font-medium">Peso (kg)</label>
        <input type="number" id="editWeight" class="w-full border p-2 rounded" value="${animal.peso || ''}">

        <label for="editGender" class="font-medium">Sexo</label>
        <select id="editGender" class="w-full border p-2 rounded" required>
          <option value="Macho" ${animal.sexo==="Macho"?"selected":""}>Macho</option>
          <option value="Fêmea" ${animal.sexo==="Fêmea"?"selected":""}>Fêmea</option>
          <option value="Não Informado" ${animal.sexo==="Não Informado"?"selected":""}>Não Informado</option>
        </select>

        <label for="editRescue" class="font-medium">Data de Resgate</label>
        <input type="date" id="editRescue" class="w-full border p-2 rounded" value="${animal.dataResgate.toDate().toISOString().split('T')[0]}" required>

        <label for="editDescription" class="font-medium">Descrição</label>
        <textarea id="editDescription" class="w-full border p-2 rounded h-20">${animal.descricao}</textarea>

        <label for="editStatus" class="font-medium">Status</label>
        <select id="editStatus" class="w-full border p-2 rounded">
          <option value="Disponível para Adoção" ${animal.status==="Disponível para Adoção"?"selected":""}>Disponível para Adoção</option>
          <option value="Adotado" ${animal.status==="Adotado"?"selected":""}>Adotado</option>
          <option value="Em Tratamento" ${animal.status==="Em Tratamento"?"selected":""}>Em Tratamento</option>
          <option value="Reservado" ${animal.status==="Reservado"?"selected":""}>Reservado</option>
        </select>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button" id="cancelModal" class="bg-gray-300 py-1 px-3 rounded">Cancelar</button>
          <button type="submit" class="bg-green-500 text-white py-1 px-3 rounded">Salvar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#cancelModal').addEventListener('click', () => modal.remove());

  modal.querySelector('#editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      nome: modal.querySelector('#editName').value,
      especie: modal.querySelector('#editSpecies').value.toLowerCase(),
      raca: modal.querySelector('#editBreed').value,
      idade: parseInt(modal.querySelector('#editAge').value),
      peso: parseFloat(modal.querySelector('#editWeight').value) || null,
      sexo: modal.querySelector('#editGender').value,
      dataResgate: Timestamp.fromDate(new Date(modal.querySelector('#editRescue').value)),
      descricao: modal.querySelector('#editDescription').value,
      status: modal.querySelector('#editStatus').value
    };
    await updateDoc(doc(db, "Animais", id), updated);
    modal.remove();
    loadEditAnimals();
    loadRemoveAnimals();
  });
}


// ==============================
// FORMULÁRIOS DE ADOÇÃO
// ==============================
let allForms = [];

async function loadAdoptionForms() {
  const snapshot = await getDocs(collection(db, "Formularios"));
  allForms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderForms();
}

async function renderForms(filter = statusFilter.value) {
  adoptionFormsContainer.innerHTML = '';
  const filtered = filter === "all" ? allForms : allForms.filter(f => f.status === filter);

  if (filtered.length === 0) {
    adoptionFormsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum formulário encontrado.</p>`;
    return;
  }

  for (const f of filtered) {
    let petName = "Pet Desconhecido";
    try {
      if (f.petId) {
        const petDoc = await getDoc(doc(db, "Animais", f.petId));
        if (petDoc.exists()) {
          const petData = petDoc.data();
          petName = petData.nome || petData.especie || "Pet Desconhecido";
        }
      }
    } catch (err) {
      console.error("Erro ao buscar animal:", err);
    }

    const card = document.createElement('div');
    card.className = "relative bg-gray-50 p-4 rounded-xl shadow flex flex-col gap-2";
    card.innerHTML = `
      <button class="absolute top-2 right-2 text-gray-400 hover:text-red-500" id="delete-${f.id}" title="Excluir formulário">
        🗑️
      </button>
      <div>
        <h3 class="text-lg font-bold mb-2">${f.adopterName}</h3>
        <p><strong>Email:</strong> ${f.adopterEmail}</p>
        <p><strong>Telefone:</strong> ${f.adopterPhone}</p>
        <p><strong>Pet:</strong> ${petName}</p>
        <p><strong>Mensagem:</strong> ${f.adopterMessage || '—'}</p>
      </div>
      <div class="flex gap-2 mt-2">
        <select id="statusSelect-${f.id}" class="flex-1 border rounded px-2 py-1">
          <option value="Não iniciado" ${f.status==="Não iniciado"?"selected":""}>Não iniciado</option>
          <option value="Em andamento" ${f.status==="Em andamento"?"selected":""}>Em andamento</option>
          <option value="Concluído" ${f.status==="Concluído"?"selected":""}>Concluído</option>
        </select>
      </div>
    `;
    adoptionFormsContainer.appendChild(card);

    // Atualizar status
    card.querySelector(`#statusSelect-${f.id}`).addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      await updateDoc(doc(db, "Formularios", f.id), { status: newStatus });
      f.status = newStatus;
    });

    // Deletar formulário
    card.querySelector(`#delete-${f.id}`).addEventListener('click', async () => {
      if (confirm("Deseja realmente excluir este formulário?")) {
        await deleteDoc(doc(db, "Formularios", f.id));
        allForms = allForms.filter(form => form.id !== f.id); // remove localmente
        renderForms(filter); // recarrega a lista
      }
    });
  }
}
// ==============================
// BOTÃO VOLTAR AO INÍCIO
// ==============================
function addBackToIndexButton() {
  const btn = document.createElement('button');
  btn.textContent = '🏠 Voltar ao Início';
  btn.className = 'fixed top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded shadow';
  
  btn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.body.appendChild(btn);
}

addBackToIndexButton();



// Listener do filtro
statusFilter.addEventListener('change', () => {
  renderForms(statusFilter.value);
});

// Inicializa
loadAdoptionForms();
