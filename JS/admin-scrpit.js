// ==============================
// admin-script.js
// ==============================

// Importa Firestore e Auth da config
import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } 
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==============================
// REFERÊNCIAS AOS ELEMENTOS
// ==============================
const addAnimalForm = document.getElementById('addAnimalForm');
const addAnimalMessage = document.getElementById('addAnimalMessage');

const removeForm = document.getElementById('removeAnimalForm');
const removeSelect = removeForm.querySelector('select');
const removeButton = removeForm.querySelector('button');

// ==============================
// FUNÇÃO AUXILIAR: CONVERTE ARQUIVO EM BASE64
// ==============================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Converte em base64
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// ==============================
// FUNÇÃO: CARREGA ANIMAIS NO SELECT DE REMOÇÃO
// ==============================
async function loadAnimals() {
  removeSelect.innerHTML = '<option value="">Selecione o Animal</option>'; // limpa lista
  try {
    const querySnapshot = await getDocs(collection(db, "Animais"));
    querySnapshot.forEach((docSnap) => {
      const animal = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id; // guarda o ID do documento
      option.textContent = animal.nome; // exibe o nome
      removeSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar animais:", err);
  }
}

// Carrega animais assim que a página abre
loadAnimals();

// ==============================
// CADASTRO DE ANIMAIS
// ==============================
if (addAnimalForm) {
  addAnimalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    addAnimalMessage.textContent = "Processando cadastro...";
    addAnimalMessage.style.color = "gray";

    try {
      // Pega os dados do formulário
      const nome = document.getElementById("animalName").value;
      const especie = document.getElementById("animalSpecies").value;
      const raca = document.getElementById("animalBreed").value;
      const idade = parseInt(document.getElementById("animalAge").value);
      const peso = parseFloat(document.getElementById("animalWeight").value);
      const sexo = document.getElementById("animalGender").value;
      const dataResgate = document.getElementById("rescueDate").value;
      const descricao = document.getElementById("animalDescription").value;
      const status = document.getElementById("animalStatus").value;
      const imagemFile = document.getElementById("animalImage").files[0];

      // Validação mínima
      if (!nome || !especie || !idade || !sexo || !dataResgate || !imagemFile || !status) {
        addAnimalMessage.textContent = "⚠️ Preencha todos os campos obrigatórios.";
        addAnimalMessage.style.color = "red";
        return;
      }

      // Converte a imagem para Base64
      const base64Image = await toBase64(imagemFile);

      // Cria objeto do animal
      const animalData = {
        nome,
        especie,
        raca,
        idade,
        peso: peso || null,
        sexo,
        dataResgate: Timestamp.fromDate(new Date(dataResgate)),
        descricao,
        status,
        imagemBase64: base64Image, // guarda a imagem aqui
        cadastradoPor: auth.currentUser ? auth.currentUser.uid : "Anonimo",
        dataCadastro: Timestamp.now()
      };

      // Salva no Firestore
      await addDoc(collection(db, "Animais"), animalData);

      addAnimalMessage.textContent = "✅ Animal cadastrado com sucesso!";
      addAnimalMessage.style.color = "green";
      addAnimalForm.reset();

      // Atualiza o select de remoção
      loadAnimals();

    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      addAnimalMessage.textContent = `❌ Erro: ${err.message}`;
      addAnimalMessage.style.color = "red";
    }
  });
}

// ==============================
// REMOVER ANIMAIS
// ==============================
if (removeForm) {
  removeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedId = removeSelect.value;

    if (!selectedId) {
      alert("Selecione um animal para remover.");
      return;
    }

    const confirmDelete = confirm("Tem certeza que deseja remover este animal?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Animais", selectedId));
      alert("✅ Animal removido com sucesso!");
      loadAnimals(); // Atualiza a lista no select
    } catch (err) {
      console.error("Erro ao remover animal:", err);
      alert("❌ Erro ao remover animal. Veja o console.");
    }
  });
}

// ==============================
// PROTEÇÃO DA PÁGINA (APENAS USUÁRIOS LOGADOS)
// ==============================
auth.onAuthStateChanged((user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "login.html";
  }
});
