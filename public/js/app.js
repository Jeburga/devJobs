document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    if(skills){
        skills.addEventListener('click', agregarSkills);
    }
})

const skills = new Set();
const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        skills.add(e.target.textContent);
        if (e.target.classList.contains('activo')){
            skills.delete(e.target);
            e.target.classList.remove('activo');
        } else {
            e.target.classList.add('activo')
        }
    } 

    const skilssArray = [...skills];
    document.querySelector('#skills').value = skilssArray;
    
}