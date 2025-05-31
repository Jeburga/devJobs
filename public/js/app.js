import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");

  // Limpiar las alertas
  let alertas = document.querySelector(".alertas");

  if (alertas) {
    limpiarAlertas();
  }

  if (skills) {
    skills.addEventListener("click", agregarSkills);

    // una vez que estamos en editar, llamar a la funcion
    skillSeleccionados();
  }

  const vacantesListado = document.querySelector(".panel-administracion");

  if (vacantesListado) {
    vacantesListado.addEventListener("click", accionesListado);
  }
});

const skills = new Set();
const agregarSkills = (e) => {
  if (e.target.tagName === "LI") {
    skills.add(e.target.textContent);
    if (e.target.classList.contains("activo")) {
      skills.delete(e.target.textContent);
      e.target.classList.remove("activo");
    } else {
      e.target.classList.add("activo");
    }
  }

  document.querySelector("#skills").value = [...skills].join(",");
};

const skillSeleccionados = () => {
  const seleccionadas = Array.from(
    document.querySelectorAll(".lista-conocimientos .activo")
  );

  seleccionadas.forEach((seleccionada) => {
    skills.add(seleccionada.textContent);
  });

  // inyectarlo en hidden
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};

const limpiarAlertas = () => {
  const alertas = document.querySelector(".alertas");

  const interval = setInterval(() => {
    // Verificar si hay alertas para eliminar
    if (alertas.children.length > 0) {
      // Eliminar la primera alerta
      alertas.removeChild(alertas.children[0]);
    } else if (alertas.children.length === 0) {
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
  }, 2000);
};

// Eliminar vacantes
const accionesListado = (e) => {
  e.preventDefault();

  if (e.target.dataset.eliminar) {
    // eliminar por medio de axios
    Swal.fire({
      title: "¿Confirmar Eliminación?",
      text: "Una vez eliminada, no se puede recuperar",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar",
      cancelButtonText: "No, Cancelar",
    }).then((result) => {
      // Enviar petición con Axios
      const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

      // Axios para eliminar
      axios.delete(url, { params: { url } }).then(function (respuesta) {
        if (respuesta.status === 200) {
          Swal.fire(
            "Eliminado!",
            respuesta.data,
            "success"
          );

          // TODO: Eliminar del DOM
          e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
          
        }
      });
    });
  } else {
    window.location.href = e.target.href;
  }
};
