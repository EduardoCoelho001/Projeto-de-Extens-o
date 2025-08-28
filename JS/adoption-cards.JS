import { db } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const adoptionFormsContainer = document.getElementById('adoptionFormsContainer');

async function loadAdoptionForms() {
  adoptionFormsContainer.innerHTML = ''; // limpa os cards antes de preencher
  const querySnapshot = await getDocs(collection(db, "Formularios"));

  querySnapshot.forEach(docSnap => {
    const form = docSnap.data();
    const formId = docSnap.id;

    const card = document.createElement('div');
    card.className = "bg-gray-50 p-4 rounded-xl shadow flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <h3 class="text-lg font-bold mb-2">${form.adopterName}</h3>
        <p><strong>Email:</strong> ${form.adopterEmail}</p>
        <p><strong>Telefone:</strong> ${form.adopterPhone}</p>
        <p><strong>Pet:</strong> ${form.petId}</p>
        <p><strong>Mensagem:</strong> ${form.adopterMessage || '—'}</p>
        <p><strong>Status:</strong> <span id="status-${formId}">${form.status}</span></p>
      </div>
      <button class="mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600" id="complete-${formId}">
        Marcar como Concluído
      </button>
    `;

    adoptionFormsContainer.appendChild(card);

    // Botão para atualizar status
    document.getElementById(`complete-${formId}`).addEventListener('click', async () => {
      const statusSpan = document.getElementById(`status-${formId}`);
      await updateDoc(doc(db, "Formularios", formId), { status: "Concluído" });
      statusSpan.textContent = "Concluído";
    });
  });
}

// Chama ao carregar a página
loadAdoptionForms();
