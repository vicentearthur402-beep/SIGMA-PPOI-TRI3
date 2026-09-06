const email = document.getElementById("email");
const password = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const emailStudent = "123"
const passwordStudent = "123"
const emailTeacher = "professor@escola.com"
const passwordTeacher = "123"

loginButton.addEventListener("click", function(){
  if (email.value === "" || password.value === "") {
    loginMessage.style.display = "block";
  } else {
    if(email.value.toLowerCase() === emailStudent.toLowerCase() && password.value === passwordStudent){
    loginMessage.textContent = "Login Realizado!";
    window.location.href = "frontend/alunos/aluno.html";
    }
    else if(email.value.toLowerCase() === emailTeacher.toLowerCase() && password.value === passwordTeacher){
    loginMessage.textContent = "Login Realizado!";
    window.location.href = "frontend/professores/professor.html";
    }
    else {
      loginMessage.textContent = "Usuário não encontrado!"
      loginMessage.style.display = "block";
    }
  }

})