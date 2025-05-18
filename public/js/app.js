document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('lista-conocimientos');

    if(skilss){
        skills.addEventListener('click', agregarSkills);
    }
})

const agregarSkills = (e) => {
    if(e.target.tagName === 'LI'){
        console.log("Si");
    } else {
        console.log('No');
        
    }
    
}