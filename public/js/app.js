document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    if(skills){
        skills.addEventListener('click', agregarSkills);

        // una vez que estamos en editar, llamar a la funcion
        skillSeleccionados()
    }
})

const skills = new Set();
const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        skills.add(e.target.textContent);
        if (e.target.classList.contains('activo')){
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            e.target.classList.add('activo')
        }
    } 

    document.querySelector('#skills').value = [...skills].join(',');
}

const skillSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })
    

    // inyectarlo en hidden
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}