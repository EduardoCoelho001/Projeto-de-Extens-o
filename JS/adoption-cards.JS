import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const adoptionFormsContainer = document.getElementById('adoptionFormsContainer');
const statusFilter = document.getElementById('statusFilter');

let allForms = []; // manter em memória

// Função para renderizar os cards
function renderForms(forms, filter = "all") {
  adoptionFormsContainer.innerHTML = '';

  const filtered = filter === "all" ? forms : forms.filter(f => f.status === filter);

  if (filtered.length === 0) {
    adoptionFormsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Nenhum formulário encontrado.</p>`;
    return;
  }

  filtered.forEach(({ id, ...form }) => {
    const card = document.createElement('div');
    card.className = "relative bg-gray-50 p-4 rounded-xl shadow flex flex-col justify-between";

    card.innerHTML = `
      <!-- Botão excluir -->
      <button id="delete-${id}" class="absolute top-2 right-2 text-gray-400 hover:text-red-500">
        🗑️
      </button>

      <div>
        <h3 class="text-lg font-bold mb-2">${form.adopterName}</h3>
        <p><strong>Email:</strong> ${form.adopterEmail}</p>
        <p><strong>Telefone:</strong> ${form.adopterPhone}</p>
        <p><strong>Pet:</strong> ${form.petId}</p>
        <p><strong>Mensagem:</strong> ${form.adopterMessage || '—'}</p>
        <p><strong>Status:</strong> 
          <span id="status-${id}" class="font-medium">${form.status}</span>
        </p>
      </div>

      <!-- Botões de status -->
      <div class="flex gap-2 mt-4">
        <button id="notstarted-${id}" class="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400 text-white">Não iniciado</button>
        <button id="inprogress-${id}" class="flex-1 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white">Em andamento</button>
        <button id="completed-${id}" class="flex-1 py-2 rounded bg-green-500 hover:bg-green-600 text-white">Concluído</button>
      </div>
    `;

    adoptionFormsContainer.appendChild(card);

    // Botões de status
    document.getElementById(`notstarted-${id}`).addEventListener('click', async () => {
      await updateDoc(doc(db, "Formularios", id), { status: "Não iniciado" });
      allForms = allForms.map(f => f.id === id ? { ...f, status: "Não iniciado" } : f);
      renderForms(allForms, statusFilter.value);
    });

    document.getElementById(`inprogress-${id}`).addEventListener('click', async () => {
      await updateDoc(doc(db, "Formularios", id), { status: "Em andamento" });
      allForms = allForms.map(f => f.id === id ? { ...f, status: "Em andamento" } : f);
      renderForms(allForms, statusFilter.value);
    });

    document.getElementById(`completed-${id}`).addEventListener('click', async () => {
      await updateDoc(doc(db, "Formularios", id), { status: "Concluído" });
      allForms = allForms.map(f => f.id === id ? { ...f, status: "Concluído" } : f);
      renderForms(allForms, statusFilter.value);
    });
    
    // Botão excluir
    document.getElementById(`delete-${id}`).addEventListener('click', async () => {
      if (confirm("Tem certeza que deseja excluir este formulário?")) {
        await deleteDoc(doc(db, "Formularios", id));
        allForms = allForms.filter(f => f.id !== id);
        renderForms(allForms, statusFilter.value); // recarregar lista
      }
    });
  });
}

// Carregar dados do Firestore
async function loadAdoptionForms() {
  const querySnapshot = await getDocs(collection(db, "Formularios"));
  allForms = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderForms(allForms);
}

// Filtro de status
statusFilter.addEventListener('change', (e) => {
  renderForms(allForms, e.target.value);
});

// Inicializar
loadAdoptionForms();
