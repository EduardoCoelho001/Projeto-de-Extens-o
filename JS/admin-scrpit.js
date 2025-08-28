// admin-script.js

// Importe as instâncias do Firebase que você exportou de firebase-config.js
import { db, storage, auth } from './firebase-config.js';

// Importe as funções específicas do Firestore e Storage
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Referências aos elementos do formulário de cadastro
const addAnimalForm = document.getElementById('addAnimalForm');
const animalNameInput = document.getElementById('animalName');
const animalSpeciesInput = document.getElementById('animalSpecies');
const animalBreedInput = document.getElementById('animalBreed');
const animalAgeInput = document.getElementById('animalAge');
const animalWeightInput = document.getElementById('animalWeight');
const animalGenderSelect = document.getElementById('animalGender');
const rescueDateInput = document.getElementById('rescueDate');
const animalDescriptionInput = document.getElementById('animalDescription');
const animalImageInput = document.getElementById('animalImage');
const animalStatusSelect = document.getElementById('animalStatus');
const addAnimalMessage = document.getElementById('addAnimalMessage');
const uploadProgressDiv = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progressBar');

// Listener para o evento de submit do formulário de cadastro de animal
if (addAnimalForm) {
  addAnimalForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    // Resetar mensagens e progresso
    addAnimalMessage.textContent = '';
    uploadProgressDiv.classList.add('hidden');
    progressBar.style.width = '0%';

    // Obter os valores do formulário
    const nome = animalNameInput.value;
    const especie = animalSpeciesInput.value;
    const raca = animalBreedInput.value;
    const idade = parseInt(animalAgeInput.value); // Converte para número
    const peso = parseFloat(animalWeightInput.value); // Converte para número (com casas decimais)
    const sexo = animalGenderSelect.value;
    const data_resgate_str = rescueDateInput.value; // Formato YYYY-MM-DD
    const descricao = animalDescriptionInput.value;
    const imagemFile = animalImageInput.files[0]; // Pega o primeiro arquivo selecionado
    const status = animalStatusSelect.value;

    // Validação básica
    if (!nome || !especie || !idade || !sexo || !data_resgate_str || !imagemFile || !status) {
      addAnimalMessage.textContent = 'Por favor, preencha todos os campos obrigatórios, incluindo a imagem.';
      addAnimalMessage.style.color = 'red';
      return;
    }

    addAnimalMessage.textContent = 'Processando cadastro...';
    addAnimalMessage.style.color = 'gray';

    try {
      // 1. Upload da imagem para o Cloud Storage
      uploadProgressDiv.classList.remove('hidden');
      const storageRef = ref(storage, `imagens_animais/${Date.now()}_${imagemFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagemFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Monitorar o progresso do upload
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = progress + '%';
          addAnimalMessage.textContent = `Upload da imagem: ${Math.round(progress)}%`;
        },
        (error) => {
          // Lidar com erros de upload
          console.error("Erro no upload da imagem:", error);
          addAnimalMessage.textContent = `Erro ao fazer upload da imagem: ${error.message}`;
          addAnimalMessage.style.color = 'red';
          uploadProgressDiv.classList.add('hidden');
        },
        async () => {
          // Upload concluído com sucesso, agora obter a URL de download
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Converter data_resgate para Timestamp do Firestore
          // O input de data no HTML continua sendo 'rescueDateInput',
          // mas o campo no Firestore será 'data'
          const data_resgate_timestamp = Timestamp.fromDate(new Date(data_resgate_str));

          // 2. Salvar os dados do animal no Cloud Firestore
          const animalData = {
            nome: nome,
            especie: especie,
            raca: raca,
            idade: idade,
            peso: peso || null,
            sexo: sexo,
            data: data_resgate_timestamp, // <-- MUDOU AQUI: de 'data_resgate' para 'data'
            descricao: descricao,
            imagem: imageUrl,
            Status: status, // <-- MUDOU AQUI: de 'status' para 'Status' (S maiúsculo)
            // Opcional: manter quem cadastrou e a data de cadastro para auditoria
            cadastradoPor: auth.currentUser ? auth.currentUser.uid : 'Anonimo',
            dataCadastro: Timestamp.now()
          };

          await addDoc(collection(db, "Animais"), animalData);


          addAnimalMessage.textContent = 'Animal cadastrado com sucesso!';
          addAnimalMessage.style.color = 'green';
          addAnimalForm.reset(); // Limpa o formulário
          uploadProgressDiv.classList.add('hidden'); // Esconde a barra de progresso
          progressBar.style.width = '0%'; // Reseta a barra de progresso
        }
      );

    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      addAnimalMessage.textContent = `Erro ao cadastrar animal: ${error.message}`;
      addAnimalMessage.style.color = 'red';
      uploadProgressDiv.classList.add('hidden');
    }
  });
}

// Opcional: Proteger a página - verificar se o usuário está logado
// Se você quiser que esta página seja acessível apenas por usuários autenticados
auth.onAuthStateChanged((user) => {
  if (!user) {
    // Se o usuário não estiver logado, redirecione para a página de login
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html'; // Redirecione para sua página de login
  }
  // Se estiver logado, continua na página
});
