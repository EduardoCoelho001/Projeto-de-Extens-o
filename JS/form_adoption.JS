import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, Timestamp } 
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const petSelect = document.getElementById('petSelect');
const adoptionForm = document.getElementById('adoptionForm');
const adoptionMessage = document.getElementById('adoptionMessage');

// ------------------------------
// Carregar pets disponíveis
// ------------------------------
async function loadAvailablePets() {
  petSelect.innerHTML = '<option value="">Selecione um animal</option>';
  try {
    const querySnapshot = await getDocs(collection(db, "Animais"));
    querySnapshot.forEach(docSnap => {
      const pet = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id; // id do pet
      option.textContent = `${pet.nome} (${pet.especie})`;
      petSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar pets:", err);
  }
}

// Chama ao abrir a página
loadAvailablePets();

// ------------------------------
// Submissão do formulário de adoção
// ------------------------------
if (adoptionForm) {
  adoptionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    adoptionMessage.textContent = "Enviando solicitação...";
    adoptionMessage.style.color = "gray";

    try {
      const petId = petSelect.value;
      const name = document.getElementById('adopterName').value;
      const email = document.getElementById('adopterEmail').value;
      const phone = document.getElementById('adopterPhone').value;
      const message = document.getElementById('adopterMessage').value;

      if (!petId || !name || !email || !phone) {
        adoptionMessage.textContent = "⚠️ Preencha todos os campos obrigatórios.";
        adoptionMessage.style.color = "Purple";
        return;
      }

      // Salvar no Firestore na coleção "Formularios"
      await addDoc(collection(db, "Formularios"), {
        petId,
        adopterName: name,
        adopterEmail: email,
        adopterPhone: phone,
        adopterMessage: message,
        status: "Pendente", // status inicial
        createdAt: Timestamp.now()
      });

      adoptionMessage.textContent = "✅ Solicitação enviada com sucesso!";
      adoptionMessage.style.color = "Shades of Purple";
      adoptionForm.reset();

    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      adoptionMessage.textContent = `❌ Erro: ${err.message}`;
      adoptionMessage.style.color = "Shades of Purple";
    }
  });
}
